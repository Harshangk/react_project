import { useForm } from "react-hook-form";
import FormInput from "../../components/common/FormInput";
import FormSelectSearch from "../../components/common/FormSelectSearch";
import MainLayout from "../../components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useState, useEffect } from "react";
import { postBuyLead, putBuyLead, getBuyLeadByID, getLeadSources, getLeadCategory, getBuyModes, getFuelTypes, getColor, getOwner, getMake, getModel, getYear, getUser, getBroker, getBranch, getState, getCity } from "../../api/services";
import { toast } from "react-toastify";
import { clearErrors, trigger } from "react-hook-form";
import { useParams } from "react-router-dom";

export default function BuyLeadForm() {
    const navigate = useNavigate();

    const { id } = useParams();
    const isEdit = !!id;

    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        clearErrors,
        trigger,
        formState: { errors },
    } = useForm();

    const [loading, setLoading] = useState(true);
    const [leadSources, setLeadSources] = useState([]);
    const [leadCategories, setLeadCategories] = useState([]);
    const [modes, setModes] = useState([]);
    const [fuelTypes, setFuelTypes] = useState([]);
    const [colors, setColors] = useState([]);
    const [owners, setOwners] = useState([]);
    const [make, setMakes] = useState([]);
    const [model, setModels] = useState([]);
    const [year, setYears] = useState([]);
    const [executives, setExecutives] = useState([]);
    const [telecallers, setTelecallers] = useState([]);
    const [modelLoading, setModelLoading] = useState(false);
    const [broker, setBrokers] = useState([]);
    const [brokerLoading, setBrokerLoading] = useState(false);
    const [branchs, setBranchs] = useState([]);
    const [state, setStates] = useState([]);
    const [city, setCitys] = useState([]);
    const [cityLoading, setCityLoading] = useState(false);

    const selectedMode = watch("mode")?.toLowerCase();
    const isHome = selectedMode === "home";
    const isBranch = selectedMode === "branch";
    const isExecutiveRequired = isBranch || isHome;
    const isStateRequired = isHome;
    const isCityRequired = isHome;
    const isAddressRequired = isHome;

    const selectedSource = watch("source");
    const selectedSourceObj = leadSources.find(
        (item) => item.value === selectedSource
    );

    const isBroker = selectedSourceObj?.label?.toLowerCase() === "broker";

    const getOptionalLabel = (options, value) => {
        if (!value) return null;
        return options.find(opt => opt.value === value)?.label || null;
    };

    const formatOptions = (data = []) =>
        data.map((item) => ({
            value: item.value ?? item.id,
            label: item.key ?? item.value,
        }));

    const mapLeadSource = (data = []) =>
        data.map((item) => ({
            value: item.id,
            label: item.source,
        }));

    const mapMake = (data = []) =>
        data.map((item) => ({
            value: item.id,
            label: item.make,
        }));

    const mapModel = (data = []) =>
        data.map((item) => ({
            value: item.id,
            label: item.model,
        }));

    const mapYear = (data = []) =>
        data.map((item) => ({
            value: item.year,
            label: String(item.year),
        }));

    const mapUser = (data = []) =>
        data.map((item) => ({
            value: item.id,
            label: item.userName,
        }));

    const mapBroker = (data = []) =>
        data.map((item) => ({
            value: item.id,
            label: item.broker,
        }));

    const mapBranch = (data = []) =>
        data.map((item) => ({
            value: item.id,
            label: item.branch,
        }));

    const mapState = (data = []) =>
        data.map((item) => ({
            value: item.id,
            label: item.state,
        }));

    const mapCity = (data = []) =>
        data.map((item) => ({
            value: item.id,
            label: item.city,
        }));

    const fetchModelsByMake = async (makeId) => {
        try {
            setModelLoading(true);
            setModels([]);          // clear old models
            setValue("model", "");  // reset selected model

            if (!makeId) return;

            const res = await getModel(makeId);
            setModels(mapModel(res?.data?.items));

        } catch (err) {
            console.error("Model API error:", err);
        } finally {
            setModelLoading(false); // 
        }
    };

    const fetchCitysByState = async (stateId) => {
        try {
            setCityLoading(true);
            setCitys([]);          // clear old models
            setValue("city", "");  // reset selected model

            if (!stateId) return;

            const res = await getCity(stateId);
            const mapped = mapCity(res?.data?.items);

            setCitys(mapped);

            return mapped;

        } catch (err) {
            console.error("City API error:", err);
        } finally {
            setCityLoading(false);
        }
    };

    useEffect(() => {
        if (!isExecutiveRequired) {
            setValue("executive", "");
            clearErrors("executive");
        } else {
            trigger("executive");
        }
    }, [isExecutiveRequired, setValue, clearErrors, trigger]);

    useEffect(() => {
        if (!isAddressRequired) {
            setValue("address", "");
            clearErrors("address");
        } else {
            trigger("address");
        }
    }, [isAddressRequired, setValue, clearErrors, trigger]);

    useEffect(() => {
        if (!isStateRequired) {
            setValue("state", "");
            clearErrors("state");
        } else {
            trigger("state");
        }
    }, [isStateRequired, setValue, clearErrors, trigger]);

    useEffect(() => {
        if (!isCityRequired) {
            setValue("city", "");
            clearErrors("city");
        } else {
            trigger("city");
        }
    }, [isCityRequired, setValue, clearErrors, trigger]);

    useEffect(() => {
        if (!isEdit) return;

        let isMounted = true;
        if (!branchs.length || !leadSources.length || !state.length) return;
        const fetchLeadAndPopulate = async () => {
            try {
                setLoading(true);

                // 1. Fetch lead data
                const res = await getBuyLeadByID(id);
                const data = res.data;

                if (!isMounted) return;

                // 2. Wait for branch options to be loaded
                if (branchs.length > 0) {
                    const branchValue = branchs.find(b => b.label === data.branch)?.value || "";
                    setValue("branch", branchValue);
                }

                // 3. Wait for lead sources to be loaded
                if (leadSources.length > 0) {
                    const sourceValue = leadSources.find(s => s.label === data.source)?.value || "";
                    setValue("source", sourceValue);
                }

                // 4. Set other simple fields
                setValue("customerName", data.customerName);
                setValue("mobile", data.mobile);
                setValue("alternateMobile", data.alternateMobile);
                setValue("category", data.category);
                setValue("mode", data.mode);
                setValue("make", data.makeId);
                setValue("fuelType", data.fuelType);
                setValue("year", data.year);
                setValue("kms", data.kms);
                setValue("owner", data.owner);
                setValue("clientOffer", data.clientOffer);
                setValue("ourOffer", data.ourOffer);
                setValue("remarks", data.remarks);

                if (executives.length > 0) {
                    const executiveValue = executives.find(e => e.label === data.executive)?.value || "";
                    setValue("executive", executiveValue);
                }

                if (telecallers.length > 0) {
                    const telecallerValue = telecallers.find(t => t.label === data.telecaller)?.value || "";
                    setValue("telecaller", telecallerValue);
                }

                // 5. Handle dependent dropdowns
                if (data.makeId) {
                    await fetchModelsByMake(data.makeId);
                    setValue("model", data.modelId);
                }

                if (data.leadAddress) {
                    setValue("address", data.leadAddress.address);
                    setValue("area", data.leadAddress.area);
                    setValue("pincode", data.leadAddress.pincode);

                    if (data.leadAddress?.state && state.length > 0) {
                        const stateOption = state.find(s => s.label === data.leadAddress.state);
                        const stateId = stateOption?.value;

                        if (stateId) {
                            setValue("state", stateId);

                            const cities = await fetchCitysByState(stateId);

                            const cityValue =
                                cities.find(c => c.label === data.leadAddress.city)?.value || "";

                            setValue("city", cityValue);
                        }
                    }


                }

                if (isBroker && data.brokerName) {
                    setValue("broker", broker.find(b => b.label === data.brokerName)?.value || "");
                }

            } catch (err) {
                console.error(err);
                toast.error("Failed to load lead data");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchLeadAndPopulate();

        return () => {
            isMounted = false;
        };
    }, [id, branchs, leadSources, state, broker]);



    // Fetch Broker
    useEffect(() => {
        const fetchBroker = async () => {
            try {
                setBrokerLoading(true);

                // avoid duplicate API calls
                if (broker.length > 0) return;

                const res = await getBroker();
                setBrokers(mapBroker(res?.data?.items));

            } catch (err) {
                console.error("Broker API error:", err);
            } finally {
                setBrokerLoading(false);
            }
        };

        if (isBroker) {
            fetchBroker();
        } else {
            setBrokers([]);
            setValue("broker", "");
        }
    }, [isBroker, setValue]);



    // Fetch enums
    useEffect(() => {
        const fetchEnums = async () => {
            try {
                const [leadRes, modeRes, categoryRes, fuelRes, colorRes, ownerRes, makeRes, yearRes, exeRes, telRes, branchRes, stateRes] = await Promise.all([
                    getLeadSources(),
                    getBuyModes(),
                    getLeadCategory(),
                    getFuelTypes(),
                    getColor(),
                    getOwner(),
                    getMake(),
                    getYear(),
                    getUser(3),
                    getUser(2),
                    getBranch(),
                    getState(),
                ]);

                setLeadSources(mapLeadSource(leadRes?.data?.items))
                setModes(formatOptions(modeRes?.data));
                setLeadCategories(formatOptions(categoryRes?.data));
                setFuelTypes(formatOptions(fuelRes?.data));
                setColors(formatOptions(colorRes?.data));
                setOwners(formatOptions(ownerRes?.data));
                setMakes(mapMake(makeRes?.data?.items));
                setYears(mapYear(yearRes?.data?.items));
                setExecutives(mapUser(exeRes?.data?.items));
                setTelecallers(mapUser(telRes?.data?.items));
                setBranchs(mapBranch(branchRes?.data?.items));
                setStates(mapState(stateRes?.data?.items));


            } catch (err) {
                console.error("API error:", err);
            } finally {
                setLoading(false);
            }
        };
        console.log("API CALLED");
        fetchEnums();
    }, []);

    // Submit
    const onSubmit = async (data) => {
        try {
            const payload = {
                branch: getOptionalLabel(branchs, data.branch),
                mobile: data.mobile,
                alternateMobile: data.alternateMobile,
                source: getOptionalLabel(leadSources, data.source),
                mode: data.mode,
                category: data.category,
                brokerName: isBroker ? getOptionalLabel(broker, data.broker) : null,
                customerName: data.customerName,
                ownerName: data.customerName,
                paymentName: data.customerName,

                leadAddress: data.address
                    ? {
                        address: data.address,
                        state: getOptionalLabel(state, data.state),
                        city: getOptionalLabel(city, data.city),
                        area: data.area,
                        pincode: Number(data.pincode),
                    }
                    : null,

                makeId: data.make,
                modelId: data.model,
                variant: data.variant,
                color: data.color,
                fuelType: data.fuelType,
                mfgMonth: "January",
                mfgYear: String(data.year),
                kms: Number(data.kms),
                owner: data.owner,
                clientOffer: Number(data.clientOffer),
                ourOffer: Number(data.ourOffer),
                telecaller: getOptionalLabel(telecallers, data.telecaller),
                executive: getOptionalLabel(executives, data.executive),
                remarks: data.remarks,
            };

            console.log("Final Payload and id:", id, payload);
            let res;
            if (isEdit) {
                res = await putBuyLead(id, payload);
            } else {
                res = await postBuyLead(payload);
            }
            toast.success(res?.data?.message || "Success");
            navigate("/leads/buyleadlist");

        } catch (err) {
            console.error("Submit error:", err);
            const detail = err?.response?.data?.detail;

            if (detail?.message) {
                toast.error(
                    <div>
                        <p><strong>{detail.message}</strong></p>
                        <p>Lead ID: {detail.lead_id}</p>
                        <p>Status: {detail.status}</p>
                        <p>Telecaller: {detail.telecaller ?? "Not Assigned"}</p>
                        <p>Executive: {detail.executive ?? "Not Assigned"}</p>
                    </div>
                );
            } else {
                toast.error("Something went wrong");
            }
        }
    };


    return (
        <MainLayout>
            <div className="content">
                <h3 style={{ marginBottom: "20px" }}>
                    {loading ? <Skeleton width={200} /> : "Opne Lead"}
                </h3>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="card"
                    style={{ width: "100%" }}
                >
                    <div className="form-grid">
                        {loading ? (
                            Array.from({ length: 12 }).map((_, i) => (
                                <Skeleton key={i} height={40} style={{ marginBottom: "12px" }} />
                            ))
                        ) : (
                            <>
                                <FormSelectSearch
                                    label="Branch"
                                    name="branch"
                                    control={control}
                                    rules={{ required: "Branch is required" }}
                                    options={branchs}
                                    errors={errors}
                                />

                                <FormInput
                                    label="Customer Name"
                                    name="customerName"
                                    placeholder="Enter customer name"
                                    register={register}
                                    rules={{
                                        required: "Customer name is required",
                                        maxLength: {
                                            value: 255,
                                            message: "Name cannot exceed 255 characters",
                                        },
                                    }}
                                    errors={errors}
                                />

                                <FormInput
                                    label="Mobile"
                                    name="mobile"
                                    placeholder="Enter 10 digit mobile number"
                                    register={register}
                                    rules={{
                                        required: "Mobile is required",
                                        pattern: {
                                            value: /^[0-9]{10}$/,
                                            message: "Invalid mobile",
                                        },
                                    }}
                                    errors={errors}
                                    isDisabled={isEdit}
                                />

                                <FormInput
                                    label="Alt Mobile"
                                    name="alternateMobile"
                                    placeholder="Optional"
                                    register={register}
                                    errors={errors}
                                />

                                <FormSelectSearch
                                    label="Mode"
                                    name="mode"
                                    control={control}
                                    rules={{ required: "Mode is required" }}
                                    options={modes}
                                    errors={errors}
                                    isDisabled={isEdit}
                                />

                                <FormSelectSearch
                                    label="Source"
                                    name="source"
                                    control={control}
                                    rules={{ required: "Source is required" }}
                                    options={leadSources}
                                    errors={errors}
                                />

                                <FormSelectSearch
                                    label="Category"
                                    name="category"
                                    control={control}
                                    rules={{ required: "Category is required" }}
                                    options={leadCategories}
                                    errors={errors}
                                    isDisabled={isEdit}
                                />

                                <FormInput
                                    label="Address"
                                    name="address"
                                    register={register}
                                    rules={{
                                        ...(isAddressRequired && { required: "Address is required" }),
                                        maxLength: {
                                            value: 100,
                                            message: "Address cannot exceed 100 characters",
                                        },
                                    }}
                                    errors={errors}
                                />

                                <FormSelectSearch
                                    label="State"
                                    name="state"
                                    control={control}
                                    options={state}
                                    rules={
                                        isStateRequired
                                            ? { required: "State is required" }
                                            : {}
                                    }
                                    onChangeExtra={(value) => fetchCitysByState(value)}
                                    errors={errors}
                                />

                                <FormSelectSearch
                                    label="City"
                                    name="city"
                                    control={control}
                                    options={city}
                                    isDisabled={!city.length || cityLoading}
                                    isLoading={cityLoading}
                                    rules={
                                        isCityRequired
                                            ? { required: "City is required" }
                                            : {}
                                    }
                                    errors={errors}
                                />

                                <FormInput
                                    label="Area"
                                    name="area"
                                    register={register}
                                    rules={{
                                        maxLength: {
                                            value: 25,
                                            message: "Area cannot exceed 25 characters",
                                        },
                                    }}
                                    errors={errors}

                                />

                                <FormInput
                                    label="Pincode"
                                    name="pincode"
                                    register={register}
                                    rules={{
                                        pattern: {
                                            value: /^[0-9]{1,8}$/,
                                            message: "Invalid pincode",
                                        },
                                    }}
                                    errors={errors}

                                />

                                <div style={{ visibility: isBroker ? "visible" : "hidden" }}>
                                    <FormSelectSearch
                                        label="Broker"
                                        name="broker"
                                        control={control}
                                        options={broker}
                                        isLoading={brokerLoading}
                                        rules={
                                            isBroker
                                                ? { required: "Broker is required" }
                                                : {}
                                        }
                                        errors={errors}
                                    />
                                </div>

                                <FormSelectSearch
                                    label="Make"
                                    name="make"
                                    control={control}
                                    rules={{ required: "Make is required" }}
                                    options={make}
                                    onChangeExtra={(value) => fetchModelsByMake(value)}
                                    errors={errors}
                                />

                                <FormSelectSearch
                                    label="Model"
                                    name="model"
                                    control={control}
                                    options={model}
                                    isDisabled={!model.length || modelLoading}
                                    isLoading={modelLoading}
                                    rules={{ required: "Model is required" }}
                                    errors={errors}
                                />

                                <FormInput
                                    label="Variant"
                                    name="variant"
                                    placeholder="Enter variant"
                                    register={register}
                                    rules={{
                                        maxLength: {
                                            value: 255,
                                            message: "Variant cannot exceed 255 characters",
                                        },
                                    }}
                                    errors={errors}
                                />

                                <FormSelectSearch
                                    label="Fuel Type"
                                    name="fuelType"
                                    control={control}
                                    rules={{ required: "Fuel Type is required" }}
                                    options={fuelTypes}
                                    errors={errors}
                                />

                                <FormSelectSearch
                                    label="Color"
                                    name="color"
                                    control={control}
                                    options={colors}
                                    errors={errors}
                                />

                                <FormSelectSearch
                                    label="Year"
                                    name="year"
                                    control={control}
                                    rules={{ required: "Year is required" }}
                                    options={year}
                                    errors={errors}
                                />

                                <FormInput
                                    label="KMs"
                                    name="kms"
                                    placeholder="e.g. 35000"
                                    register={register}
                                    errors={errors}
                                />

                                <FormSelectSearch
                                    label="Owner"
                                    name="owner"
                                    control={control}
                                    rules={{ required: "Owner is required" }}
                                    options={owners}
                                    errors={errors}
                                />

                                <FormInput
                                    label="Client Offer"
                                    name="clientOffer"
                                    placeholder="e.g. 500000"
                                    register={register}
                                    errors={errors}
                                />

                                <FormInput
                                    label="Our Offer"
                                    name="ourOffer"
                                    placeholder="e.g. 500000"
                                    register={register}
                                    rules={{ required: "Our offer is required" }}
                                    errors={errors}
                                />

                                <FormSelectSearch
                                    label="Telecaller"
                                    name="telecaller"
                                    control={control}
                                    options={telecallers}
                                    errors={errors}
                                    isDisabled={isEdit}
                                />

                                <FormSelectSearch
                                    label="Executive"
                                    name="executive"
                                    control={control}
                                    options={executives}
                                    rules={
                                        isExecutiveRequired
                                            ? { required: "Executive is required" }
                                            : {}
                                    }
                                    errors={errors}
                                    isDisabled={isEdit}
                                />

                                <FormInput
                                    label="Remarks"
                                    name="remarks"
                                    register={register}
                                    placeholder="Enter remarks"
                                    rules={{
                                        required: "Remarks is required",
                                        maxLength: {
                                            value: 500,
                                            message: "Remarks cannot exceed 500 characters",
                                        },
                                    }}
                                    errors={errors}
                                />
                            </>
                        )}
                    </div>

                    <div className="form-actions">
                        {loading ? (
                            <Skeleton height={45} width={120} />
                        ) : (
                            <>
                                <div className="tooltip-wrapper">
                                    <button type="submit" className="btn btn-submit">
                                        {isEdit ? "Update Lead" : "Create Lead"}
                                    </button>
                                </div>
                                <div className="tooltip-wrapper">
                                    <button
                                        type="button"
                                        className="btn btn-cancel"
                                        onClick={() => navigate("/dashboard")}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </form>
            </div >
        </MainLayout >
    );
}
