import { useForm } from "react-hook-form";
import FormInput from "../../components/common/FormInput";
import FormSelectSearch from "../../components/common/FormSelectSearch";
import FormDatePicker from "../../components/common/FormDatePicker";

import MainLayout from "../../components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useState, useEffect } from "react";
import { postBuyLeadFollowup, BuyLeadSentPrePrice, BuyLeadProvidePrePrice, getBuyFollowupLeadByID, getBuyStage, getBuyStageDispositions, getPreferredTime, getLeadSources, getBuyModes, getFuelTypes, getColor, getOwner, getMake, getModel, getYear, getUser, getBroker, getBranch, getState, getCity, getCurrentUser } from "../../api/services";
import { PAYMENT_ROLE_IDS, PRICING_ROLE_IDS } from "../../config/roleConfig";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function BuyLeadFollowupForm() {
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
        unregister,
        formState: { errors },
    } = useForm({
        shouldUnregister: true
    });

    const [pageLoading, setPageLoading] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [leadSources, setLeadSources] = useState([]);
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
    const [stage, setStage] = useState([]);
    const [disposition, setDisposition] = useState([]);
    const [dispositionLoading, setDispositionLoading] = useState(false);
    const [preferredtime, setPreferredTime] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);

    const [leadStatus, setLeadStatus] = useState("");
    const currentUserRoleId = currentUser?.role_id ?? currentUser?.roleId ?? currentUser?.role?.id ?? currentUser?.role?.role_id ?? null;
    const isUserPaymentRole = PAYMENT_ROLE_IDS.includes(currentUserRoleId);
    const isUserPricingRole = PRICING_ROLE_IDS.includes(currentUserRoleId);
    const canSendForPrePrice = leadStatus === "allocated" && isUserPaymentRole;
    const isPrePriceLead = leadStatus === "preprice";
    const canProvidePrePrice = isPrePriceLead && isUserPricingRole;
    const showFollowupSection = !isPrePriceLead;
    const showRightSection = showFollowupSection || canProvidePrePrice;

    const selectedMode = watch("mode")?.toLowerCase();
    const selectedStage = watch("stage")?.toLowerCase();
    const selectedDisposition = watch("disposition")?.toLowerCase();
    const isHome = selectedMode === "home";
    const isBranch = selectedMode === "branch";
    const isAppointment = selectedDisposition === "appointment";
    const isCallDate = ["appointment", "underfollowup"].includes(selectedStage);
    const isExecutiveRequired = isBranch || isHome || isAppointment;
    const isStateRequired = isHome;
    const isCityRequired = isHome;
    const isAddressRequired = isHome;
    const isCallDateRequired = isCallDate;

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
            setModels([]);
            setValue("model", "");

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
            setCitys([]);
            setValue("city", "");

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

    const fetchDispositionByStage = async (stage) => {
        try {
            console.log("stage", stage);
            setDispositionLoading(true);
            setDisposition([]);
            setValue("disposition", "");

            if (!stage) return;

            const res = await getBuyStageDispositions(stage);
            const mapped = formatOptions(res?.data);

            setDisposition(mapped);

            return mapped;

        } catch (err) {
            console.error("Disposition API error:", err);
        } finally {
            setDispositionLoading(false);
        }
    };


    useEffect(() => {
        if (!isExecutiveRequired) {
            setValue("executive", "");
            clearErrors("executive");
            unregister("executive");
        }
    }, [isExecutiveRequired]);

    useEffect(() => {
        if (!isAddressRequired) {
            setValue("address", "");
            clearErrors("address");
            unregister("address");
        }
    }, [isAddressRequired]);

    useEffect(() => {
        if (!isStateRequired) {
            setValue("state", "");
            clearErrors("state");
            unregister("state");
        }
    }, [isStateRequired]);

    useEffect(() => {
        if (!isCityRequired) {
            setValue("city", "");
            clearErrors("city");
            unregister("city");
        }
    }, [isCityRequired]);

    useEffect(() => {
        if (!isAppointment) {
            setValue("preferredTime", "");

            clearErrors("preferredTime");

            unregister("preferredTime");
        }
    }, [isAppointment]);

    useEffect(() => {
        if (!isCallDate) {
            setValue("calldate", "");

            clearErrors("calldate");

            unregister("calldate");
        }
    }, [isCallDate]);

    useEffect(() => {
        if (!isEdit) return;

        let isMounted = true;
        if (!branchs.length || !leadSources.length || !state.length) return;
        const fetchLeadAndPopulate = async () => {
            try {
                setFormLoading(true);

                const res = await getBuyFollowupLeadByID(id);
                const data = res.data;
                setLeadStatus(data.status?.toLowerCase() || "");

                if (!isMounted) return;

                if (branchs.length > 0) {
                    const branchValue = branchs.find(b => b.label === data.branch)?.value || "";
                    setValue("branch", branchValue);
                }

                if (leadSources.length > 0) {
                    const sourceValue = leadSources.find(s => s.label === data.source)?.value || "";
                    setValue("source", sourceValue);
                }

                setValue("customerName", data.customerName);
                setValue("mobile", data.mobile);
                setValue("alternateMobile", data.alternateMobile);
                setValue("mode", data.mode);
                setValue("make", data.makeId);
                setValue("fuelType", data.fuelType);
                setValue("year", Number(data.mfgYear));
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
                if (isMounted) setFormLoading(false);
            }
        };

        fetchLeadAndPopulate();

        return () => {
            isMounted = false;
        };
    }, [id, branchs, leadSources, state, broker]);

    useEffect(() => {
        const fetchBroker = async () => {
            try {
                setBrokerLoading(true);

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
            setPageLoading(true);
            try {
                const [leadRes, modeRes, fuelRes, colorRes, ownerRes, makeRes, yearRes, exeRes, telRes, branchRes, stateRes, stageRes, preferTimeRes] = await Promise.all([
                    getLeadSources(),
                    getBuyModes(),
                    getFuelTypes(),
                    getColor(),
                    getOwner(),
                    getMake(),
                    getYear(),
                    getUser(3), // Executive
                    getUser(2), // Telecaller
                    getBranch(),
                    getState(),
                    getBuyStage(),
                    getPreferredTime(),
                ]);

                setLeadSources(mapLeadSource(leadRes?.data?.items))
                setModes(formatOptions(modeRes?.data));
                setFuelTypes(formatOptions(fuelRes?.data));
                setColors(formatOptions(colorRes?.data));
                setOwners(formatOptions(ownerRes?.data));
                setMakes(mapMake(makeRes?.data?.items));
                setYears(mapYear(yearRes?.data?.items));
                setExecutives(mapUser(exeRes?.data?.items));
                setTelecallers(mapUser(telRes?.data?.items));
                setBranchs(mapBranch(branchRes?.data?.items));
                setStates(mapState(stateRes?.data?.items));
                setStage(formatOptions(stageRes?.data));
                setPreferredTime(formatOptions(preferTimeRes?.data));

            } catch (err) {
                console.error("API error:", err);
            } finally {
                setPageLoading(false);
            }
        };
        console.log("API CALLED");
        fetchEnums();

        const fetchUser = async () => {
            try {
                const res = await getCurrentUser();
                setCurrentUser(res.data);
            } catch (err) {
                console.error("Current user API error:", err);
            }
        };

        fetchUser();
    }, []);

    // Submit
    const onSubmit = async (data) => {
        try {
            setFormLoading(true);

            // PRE-PRICE FLOW
            if (isPrePriceLead) {
                const payload = {
                    prePrice: Number(data.prePrice),
                    remarks: data.prePriceRemarks,
                };

                const res = await BuyLeadProvidePrePrice(id, payload);

                toast.success(
                    res?.data?.message || "Pre-price added successfully"
                );

                navigate("/leads/buyleadfollowuplist");
                return;
            }

            // NORMAL FOLLOWUP FLOW
            const payload = {
                branch: getOptionalLabel(branchs, data.branch),
                alternateMobile: data.alternateMobile,
                source: getOptionalLabel(leadSources, data.source),
                mode: data.mode,
                brokerName: isBroker
                    ? getOptionalLabel(broker, data.broker)
                    : null,
                customerName: data.customerName,

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
                telecaller: getOptionalLabel(
                    telecallers,
                    data.telecaller
                ),
                executive: getOptionalLabel(
                    executives,
                    data.executive
                ),

                leadFollowup: {
                    stage: data.stage,
                    disposition: data.disposition,
                    calldate: data.calldate
                        ? (() => {
                            const d = new Date(data.calldate);
                            const year = d.getFullYear();
                            const month = String(
                                d.getMonth() + 1
                            ).padStart(2, "0");
                            const date = String(
                                d.getDate()
                            ).padStart(2, "0");

                            return `${year}-${month}-${date}`;
                        })()
                        : null,
                    preferredTime: data.preferredTime,
                    notes: data.notes,
                },
            };

            const res = await postBuyLeadFollowup(id, payload);

            toast.success(res?.data?.message || "Success");

            navigate("/leads/buyleadfollowuplist");
        } catch (err) {
            console.error(err);

            toast.error(
                err?.response?.data?.message ||
                "Something went wrong"
            );
        } finally {
            setFormLoading(false);
        }
    };
    // sent for pre price
    const handleSentForPrePrice = async () => {
        try {
            setFormLoading(true);

            const res = await BuyLeadSentPrePrice(id);

            toast.success(res?.data?.message || "Lead sent for pre-price successfully");

            navigate("/leads/buyleadfollowuplist");
        } catch (err) {
            console.error(err);

            toast.error(
                err?.response?.data?.message || "Failed to send lead for pre-price"
            );
        } finally {
            setFormLoading(false);
        }
    };


    return (
        <MainLayout>
            <div className="content">
                <h3 style={{ marginBottom: "20px" }}>
                    {pageLoading || formLoading ? (
                        <Skeleton width={200} />
                    ) : (
                        "Lead Followup"
                    )}
                </h3>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="card"
                    style={{ width: "100%" }}
                >
                    <div className="followup-layout">
                        {/* LEFT SIDE */}
                        <div className="details-section">
                            <div className="card">
                                <h3 className="section-title">Customer Details </h3>

                                <div className="form-grid">
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
                                    <FormSelectSearch
                                        label="Telecaller"
                                        name="telecaller"
                                        control={control}
                                        options={telecallers}
                                        errors={errors}
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
                                    />
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
                                    />

                                    <FormSelectSearch
                                        label="Source"
                                        name="source"
                                        control={control}
                                        rules={{ required: "Source is required" }}
                                        options={leadSources}
                                        errors={errors}
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

                                </div>
                            </div>

                            <div className="card" style={{ marginTop: "20px" }}>
                                <h3 className="section-title">Vehicle Details</h3>
                                <div className="form-grid">
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
                                </div>
                            </div>
                        </div>

                        {/* RIGHT SIDE */}
                        {showRightSection && (
                            <div className="followup-section">
                                <div className="card">
                                    <h3 className="section-title">{isPrePriceLead ? "Provide Pre-Price" : "Followup"}</h3>
                                    <div className="details-grid">

                                        {isPrePriceLead ? (
                                            <>
                                                <FormInput
                                                    label="Pre Price"
                                                    name="prePrice"
                                                    placeholder="Enter pre price"
                                                    register={register}
                                                    rules={{
                                                        required: "Pre Price is required"
                                                    }}
                                                    errors={errors}
                                                />

                                                <FormInput
                                                    label="Remarks"
                                                    name="prePriceRemarks"
                                                    placeholder="Enter remarks"
                                                    register={register}
                                                    rules={{
                                                        required: "Remarks are required"
                                                    }}
                                                    errors={errors}
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <FormSelectSearch
                                                    label="Stage"
                                                    name="stage"
                                                    control={control}
                                                    rules={{ required: "Stage is required" }}
                                                    options={stage}
                                                    onChangeExtra={(value) =>
                                                        fetchDispositionByStage(value)
                                                    }
                                                    errors={errors}
                                                />

                                                <FormSelectSearch
                                                    label="Disposition"
                                                    name="disposition"
                                                    control={control}
                                                    options={disposition}
                                                    isDisabled={
                                                        !disposition.length || dispositionLoading
                                                    }
                                                    isLoading={dispositionLoading}
                                                    rules={{
                                                        required: "Disposition is required"
                                                    }}
                                                    errors={errors}
                                                />

                                                {isCallDate && (
                                                    <FormDatePicker
                                                        label="Call Date"
                                                        name="calldate"
                                                        control={control}
                                                        rules={{
                                                            required: "Call date is required"
                                                        }}
                                                        errors={errors}
                                                        minDate={new Date()}
                                                        maxDate={
                                                            new Date(
                                                                new Date().setDate(
                                                                    new Date().getDate() + 5
                                                                )
                                                            )
                                                        }
                                                    />
                                                )}

                                                {isAppointment && (
                                                    <FormSelectSearch
                                                        label="Preferred Time"
                                                        name="preferredTime"
                                                        control={control}
                                                        rules={{
                                                            required:
                                                                "Preferred Time is required"
                                                        }}
                                                        options={preferredtime}
                                                        errors={errors}
                                                    />
                                                )}

                                                <FormInput
                                                    label="Notes"
                                                    name="notes"
                                                    register={register}
                                                    rules={{
                                                        required: "Notes required"
                                                    }}
                                                    errors={errors}
                                                />
                                            </>
                                        )}

                                    </div>
                                    <div className="form-actions">
                                        {pageLoading || formLoading ? (
                                            <Skeleton height={45} width={120} />
                                        ) : (
                                            <>
                                                {!isPrePriceLead && (
                                                    <div className="tooltip-wrapper">
                                                        <button
                                                            type="submit"
                                                            className="btn btn-submit"
                                                        >
                                                            Create Followup
                                                        </button>
                                                    </div>
                                                )}

                                                {canSendForPrePrice && (
                                                    <div className="tooltip-wrapper">
                                                        <button
                                                            type="button"
                                                            className="btn btn-primary"
                                                            onClick={handleSentForPrePrice}
                                                        >
                                                            Send For Pre Price
                                                        </button>
                                                    </div>
                                                )}

                                                {isPrePriceLead && (
                                                    <div className="tooltip-wrapper">
                                                        <button
                                                            type="submit"
                                                            className="btn btn-warning"
                                                        >
                                                            Save Pre Price
                                                        </button>
                                                    </div>
                                                )}

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
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        </MainLayout>
    );
}
