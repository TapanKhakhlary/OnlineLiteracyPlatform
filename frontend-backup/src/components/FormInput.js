import React, { useState } from 'react';
import './FormInput.scss';

const FormInput = ({ label, errorMessage, onChange, id, name, ...inputProps }) => {
  const [focused, setFocused] = useState(false);
  const inputId = id || name;
  const errorId = `${inputId}-error`;

  const handleFocus = () => setFocused(true);

  return (
    <div className={`form-input ${errorMessage ? 'has-error' : ''}`}>
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
        onBlur={handleFocus}
        onFocus={() => name === 'confirmPassword' && setFocused(true)}
        aria-invalid={!!errorMessage}
        aria-describedby={errorMessage ? errorId : undefined}
        data-focused={focused}
        className={`input-field ${errorMessage ? 'input-error' : ''}`}
        autoComplete="off"
      />

      {errorMessage && (
        <span id={errorId} className="error-message" role="alert">
          {errorMessage}
        </span>
      )}
    </div>
  );
};

export default FormInput;
