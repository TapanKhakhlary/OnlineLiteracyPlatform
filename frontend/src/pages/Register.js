import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormInput from '../components/FormInput';
import { register } from '../api/authService';
import registerIllustration from '../assets/images/register-illustration.jpg';
import './Register.scss';

const Register = () => {
  const [values, setValues] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });

  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const navigate = useNavigate();

  const inputs = [
    {
      id: 1,
      name: 'username',
      type: 'text',
      placeholder: 'Choose a username',
      label: 'Username',
      required: true,
      pattern: '^[A-Za-z0-9]{3,16}$',
      errorMessage: 'Username should be 3-16 characters (letters and numbers only)',
    },
    {
      id: 2,
      name: 'email',
      type: 'email',
      placeholder: 'Enter your email',
      label: 'Email',
      required: true,
      errorMessage: 'Please enter a valid email address',
    },
    {
      id: 3,
      name: 'password',
      type: showPasswords ? 'text' : 'password',
      placeholder: 'Create password',
      label: 'Password',
      required: true,
      pattern: '^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,20}$',
      errorMessage: 'Password should be 8-20 chars with 1 letter, 1 number & 1 special char',
    },
    {
      id: 4,
      name: 'confirmPassword',
      type: showPasswords ? 'text' : 'password',
      placeholder: 'Confirm password',
      label: 'Confirm Password',
      required: true,
      errorMessage: 'Passwords must match',
      validate: (value) => value === values.password,
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    const newErrors = {};
    inputs.forEach((input) => {
      if (input.required && !values[input.name]) {
        newErrors[input.name] = 'This field is required';
      } else if (input.pattern && !new RegExp(input.pattern).test(values[input.name])) {
        newErrors[input.name] = input.errorMessage;
      } else if (input.validate && !input.validate(values[input.name])) {
        newErrors[input.name] = input.errorMessage;
      }
    });

    if (!agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const { username, email, password, role } = values;
      await register({ username, email, password, role });
      navigate('/login');
    } catch (error) {
       console.error('Register Error:', error);
      setSubmitError(error.message || 'Registration failed. Please try again.');
    }
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  return (
    <div className="register-page">
      <div className="register-illustration">
        <img
          src={registerIllustration}
          alt="Register illustration"
          className="illustration-image"
        />
      </div>

      <div className="register-form">
        <header className="register-header">
          <h1>Create Account</h1>
          <p>Join our Online Literacy Platform today</p>
        </header>

        {submitError && <div className="form-error-message">{submitError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {inputs.slice(0, 2).map((input) => (
            <div key={input.id} className="form-group">
              <FormInput
                {...input}
                value={values[input.name]}
                onChange={onChange}
                error={errors[input.name]}
              />
            </div>
          ))}

          <div className="form-row">
            {inputs.slice(2).map((input) => (
              <div key={input.id} className="form-group">
                <FormInput
                  {...input}
                  value={values[input.name]}
                  onChange={onChange}
                  error={errors[input.name]}
                />
              </div>
            ))}
          </div>

          <div className="form-group">
            <label htmlFor="role">Select Role</label>
            <select
              name="role"
              id="role"
              value={values.role}
              onChange={onChange}
              className="form-select"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
            </select>
          </div>

          <div className="form-options">
            <div className="form-check">
              <input
                type="checkbox"
                id="showPasswords"
                checked={showPasswords}
                onChange={(e) => setShowPasswords(e.target.checked)}
              />
              <label htmlFor="showPasswords">Show passwords</label>
            </div>

            <div className="form-check">
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
              />
              <label htmlFor="agreeToTerms">
                I agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy</Link>
              </label>
              {errors.agreeToTerms && (
                <div className="invalid-feedback d-block">{errors.agreeToTerms}</div>
              )}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={!agreeToTerms}>
            Sign Up
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
