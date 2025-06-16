import React, { useState } from 'react';
import './FormInput.scss';

const FormInput = ({ label, error, onChange, onBlur, id, name, ...inputProps }) => {
  const [focused, setFocused] = useState(false);
  const inputId = id || name;
  const errorId = `${inputId}-error`;

  const handleFocus = () => {
    setFocused(true);
  };

  return (
    <div className={`form-input ${error ? 'has-error' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}

      <input
        {...inputProps}
        id={inputId}
        name={name}
        onChange={onChange}
        onBlur={(e) => {
          handleFocus();
          if (onBlur) onBlur(e);
        }}
        onFocus={() => name === 'confirmPassword' && setFocused(true)}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        data-focused={focused}
        className={`input-field ${error ? 'input-error' : ''}`}
        autoComplete="off"
      />

      {error && (
        <span id={errorId} className="error-message" role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export default FormInput;
