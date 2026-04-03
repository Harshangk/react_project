function FormInput({ label, name, register, rules, readOnly, isDisabled, errors, placeholder }) {
    return (
        <div>
            <label>{label}</label>

            <input
                className={`input ${errors[name] ? "input-error" : ""}`}
                placeholder={placeholder}
                {...register(name, rules)}
                readOnly={readOnly}
                disabled={isDisabled}
            />

            {errors[name] && (
                <p className="error-text">{errors[name].message}</p>
            )}
        </div>
    );
}

export default FormInput;
