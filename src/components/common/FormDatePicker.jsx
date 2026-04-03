import { useState, useRef, useEffect } from "react";
import { Controller } from "react-hook-form";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";

export default function FormDatePicker({
    label,
    name,
    control,
    rules,
    errors,
    minDate,
    maxDate,
}) {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef(null);

    // ✅ Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="form-group date-wrapper" ref={wrapperRef}>
            {label && <label className="form-label">{label}</label>}

            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field }) => (
                    <>
                        {/* INPUT */}
                        <div
                            className={`date-input ${errors?.[name] ? "error" : ""}`}
                            onClick={() => setOpen(!open)}
                        >
                            <span>
                                {field.value
                                    ? format(field.value, "dd MMM yyyy")
                                    : "Select date"}
                            </span>

                            {field.value && (
                                <button
                                    type="button"
                                    className="clear-icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        field.onChange(null);
                                    }}
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* CALENDAR */}
                        {open && (
                            <div className="calendar-box">
                                <DayPicker
                                    mode="single"
                                    selected={field.value}
                                    onSelect={(date) => {
                                        if (!date) return;
                                        field.onChange(date);
                                        setOpen(false);
                                    }}
                                    disabled={[
                                        minDate && { before: minDate },
                                        maxDate && { after: maxDate },
                                    ]}
                                />
                            </div>
                        )}
                    </>
                )}
            />

            {errors?.[name] && (
                <span className="error-text">{errors[name].message}</span>
            )}
        </div>
    );
}
