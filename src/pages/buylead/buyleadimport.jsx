import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useForm } from "react-hook-form";
import MainLayout from "../../components/layout/MainLayout";
import FormSelectSearch from "../../components/common/FormSelectSearch";
import FileUpload from "../../components/common/FileUpload";
import {
    getLeadSources,
    getBroker,
    importBuyLead,
} from "../../api/services";
import { toast } from "react-toastify";

export default function ImportLead() {
    const {
        handleSubmit,
        control,
        register,
        watch,
        formState: { errors },
    } = useForm();

    const navigate = useNavigate();

    // -----------------------------
    // STATE
    // -----------------------------
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    const [file, setFile] = useState(null);

    const [sources, setSources] = useState([]);
    const [brokers, setBrokers] = useState([]);
    const [brokerLoading, setBrokerLoading] = useState(false);

    const selectedSource = watch("source");
    const isBroker = selectedSource === "Broker";

    // -----------------------------
    // FETCH SOURCES
    // -----------------------------
    useEffect(() => {
        const fetchSources = async () => {
            try {
                const res = await getLeadSources();

                const mapped = res.data.items.map((item) => ({
                    value: item.source,
                    label: item.source,
                }));

                setSources(mapped);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load sources");
            } finally {
                setLoading(false); // âœ… IMPORTANT
            }
        };

        fetchSources();
    }, []);

    // -----------------------------
    // FETCH BROKERS
    // -----------------------------
    useEffect(() => {
        const fetchBrokers = async () => {
            if (!isBroker) {
                setBrokers([]);
                return;
            }

            try {
                setBrokerLoading(true);

                const res = await getBroker();

                const mapped = res.data.items.map((item) => ({
                    value: item.broker,
                    label: item.broker,
                }));

                setBrokers(mapped);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load brokers");
            } finally {
                setBrokerLoading(false);
            }
        };

        fetchBrokers();
    }, [isBroker]);

    const onSubmit = async (data) => {
        try {
            if (!file) {
                toast.error("Please select a CSV file");
                return;
            }
            setUploading(true);
            setProgress(0);

            const formData = new FormData();
            formData.append("file", file);
            formData.append("source", data.source);

            if (isBroker) {
                formData.append("broker_name", data.broker);
            }

            await importBuyLead(formData, (percent) => {
                setProgress(percent);
            });

            toast.success("File uploaded successfully");
            navigate("/leads/buyleadtracker");

        } catch (err) {
            console.error(err);
            toast.error(
                err?.response?.data?.detail || "Upload failed"
            );
        } finally {
            setUploading(false);
        }
    };

    // -----------------------------
    // UI
    // -----------------------------
    return (
        <MainLayout>
            <div className="content">
                <h3 style={{ marginBottom: "20px" }}>
                    {loading ? <Skeleton width={200} /> : "Leads Import"}
                </h3>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="card"
                    style={{ width: "100%" }}
                >
                    {/* HEADER */}
                    <div className="import-header">
                        <h3>Bulk Import Wizard</h3>
                        <span className="download-link">
                            â¬‡ Download Sample CSV
                        </span>
                    </div>

                    <hr style={{ margin: "15px 0" }} />

                    {/* STEP */}
                    <div className="import-step">
                        <div className="step-circle">1</div>
                        <h4>Upload CSV File</h4>
                    </div>

                    {/* FILE UPLOAD */}
                    <div style={{ marginTop: "20px" }}>
                        <FileUpload
                            file={file}
                            onFileSelect={setFile}
                            progress={progress}
                            uploading={uploading}
                        />
                    </div>

                    {/* SOURCE + BROKER */}
                    <div
                        className="form-grid"
                        style={{ marginTop: "20px" }}
                    >
                        <FormSelectSearch
                            label="Source"
                            name="source"
                            control={control}
                            options={sources}
                            rules={{ required: "Source is required" }}
                            errors={errors}
                        />

                        <div
                            style={{
                                visibility: isBroker
                                    ? "visible"
                                    : "hidden",
                            }}
                        >
                            <FormSelectSearch
                                label="Broker"
                                name="broker"
                                control={control}
                                options={brokers}
                                isLoading={brokerLoading}
                                rules={
                                    isBroker
                                        ? {
                                            required:
                                                "Broker is required",
                                        }
                                        : {}
                                }
                                errors={errors}
                            />
                        </div>
                    </div>

                    {/* ACTION */}
                    <div className="form-actions">
                        {loading ? (
                            <Skeleton height={45} width={120} />
                        ) : (
                            <>
                                <div className="tooltip-wrapper">
                                    <button type="submit" className="btn btn-submit" disabled={uploading}>
                                        {uploading
                                            ? `Uploading ${progress}%`
                                            : "Upload File"}
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
            </div>
        </MainLayout>
    );
}
