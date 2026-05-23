import Select from "react-select";
import { Controller } from "react-hook-form";

function FormSelectSearch({
    label,
    name,
    control,
    options = [],
    rules,
    errors,
    onChangeExtra,   // ✅ for dependent dropdown
    isDisabled = false,
    isLoading = false,
    isClearable = true,
}) {
    if (!control) {
        console.error("❌ control is missing in FormSelectSearch:", name);
        return null;
    }

    return (
        <div className="form-group">
            <label>{label}</label>

            <Controller
                name={name}
                control={control}
                rules={rules}
                render={({ field }) => (
                    <Select
                        {...field}
                        options={options}
                        isSearchable
                        isDisabled={isDisabled}
                        isLoading={isLoading}
                        isClearable={isClearable}
                        placeholder={`Select ${label}`}
                        className={
                            errors?.[name]
                                ? "react-select-container error"
                                : "react-select-container"
                        }
                        classNamePrefix="react-select"
                        onChange={(selected) => {
                            const value = selected ? selected.value : "";

                            field.onChange(value);

                            // ✅ extra callback (important)
                            if (onChangeExtra) {
                                onChangeExtra(value);
                            }
                        }}
                        value={
                            options.find((opt) => opt.value === field.value) || null
                        }
                    />
                )}
            />

            {errors?.[name] && (
                <p className="error-text">{errors[name].message}</p>
            )}
        </div>
    );
}

export default FormSelectSearch;
