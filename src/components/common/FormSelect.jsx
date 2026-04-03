function FormSelect({ label, name, register, options = [], errors, rules }) {
    return (
        <div>
            <label>{label}</label>

            <select
                className={`input ${errors[name] ? "input-error" : ""}`}
                {...register(name, rules)}   // ✅ FIXED
            >
                <option value="">Select {label}</option>

                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {errors[name] && (
                <p className="error-text">{errors[name].message}</p>
            )}
        </div>
    );
}

export default FormSelect;
