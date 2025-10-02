import React from "react";
import "../assets/Styles/Style.css";

const InputField = ({
  label,
  type,
  id,
  name,
  placeholder,
  value,
  onChange,
  className,
  style,
  error,
}) => {
  return (
    <div className={`mb-3 ${className}`} style={style}>
      <label htmlFor={id} className="form-label d-block">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        className={`form-control ${error ? "is-invalid" : ""} ${className}`}
        value={value}
        onChange={onChange}
      />
      {error && <div className="text-danger mt-1" style={{textAlign: 'left'}}>{error}</div>}
    </div>
  );
};

export default InputField;
