'use client';

import React, { useState } from 'react';

export default function Home() {
  const [emailToSend, setEmailToSend] = useState('');
  const [passwordToSend, setPasswordToSend] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const validateEmail = (value: string) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(value);
  const validatePassword = (value: string) => /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&^_-]{8,}$/.test(value);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmailToSend(value);
    
    // Clear errors when user starts typing
    if (emailError) setEmailError('');
    if (generalError) setGeneralError('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPasswordToSend(value);
    
    // Clear errors when user starts typing
    if (passwordError) setPasswordError('');
    if (generalError) setGeneralError('');
  };

  const postData = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    setIsLoading(true);
    setIsSubmitted(true);
    setGeneralError('');
    setLoginSuccess(false);

    let hasError = false;
    
    // Email validation
    if (!emailToSend) {
      setEmailError('Email is required');
      hasError = true;
    } else if (!validateEmail(emailToSend)) {
      setEmailError('Invalid email address');
      hasError = true;
    } else {
      setEmailError('');
    }

    // Password validation
    if (!passwordToSend) {
      setPasswordError('Password is required');
      hasError = true;
    } else if (!validatePassword(passwordToSend)) {
      setPasswordError('Password must be at least 8 characters with letters and numbers');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('the damn api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToSend,
          password: passwordToSend,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data)
      
      setLoginSuccess(true);
      alert('Login successful');
      
      // Reset form after successful login
      setTimeout(() => {
        setEmailToSend('');
        setPasswordToSend('');
        setIsSubmitted(false);
        setLoginSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Login failed:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setGeneralError('Network error. Please check your connection.');
      } else {
        setGeneralError('Login failed. Please check your credentials.');
        setEmailError('Email or password is incorrect');
        setPasswordError('Email or password is incorrect');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = isLoading || loginSuccess;
  const isSubmitDisabled = isFormDisabled || !emailToSend || !passwordToSend;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-600 to-purple-700 p-8 sm:p-20 font-sans">
      <form
        onSubmit={postData}
        className="bg-white bg-opacity-90 backdrop-blur-md rounded-lg shadow-lg p-10 w-full max-w-sm flex flex-col gap-6"
      >
        <h1 className="text-2xl font-bold text-indigo-900 text-center mb-4">
          Sign in to Your Account
        </h1>

        {/* General Error Message */}
        {generalError && (
          <div 
            data-testid="generalError" 
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm"
          >
            {generalError}
          </div>
        )}

        {/* Success Message */}
        {loginSuccess && (
          <div 
            data-testid="successMessage" 
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm"
          >
            Login successful! Redirecting...
          </div>
        )}

        {/* Email Input */}
        <div className="relative">
          <input
            data-testid="emailInput"
            type="email"
            placeholder="Email address"
            className={`px-4 py-3 rounded-md border ${
              emailError 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-indigo-500'
            } focus:outline-none focus:ring-2 placeholder-gray-400 text-gray-700 w-full ${
              isFormDisabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
            }`}
            value={emailToSend}
            onChange={handleEmailChange}
            disabled={isFormDisabled}
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "email-error" : undefined}
          />
          {emailError && (
            <p 
              id="email-error"
              data-testid="errorEmailMsg" 
              className="text-red-600 text-sm mt-1"
            >
              {emailError}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div className="relative">
          <input
            data-testid="passwordInput"
            type="password"
            placeholder="Password"
            className={`px-4 py-3 rounded-md border ${
              passwordError 
                ? 'border-red-300 focus:ring-red-500' 
                : 'border-gray-300 focus:ring-indigo-500'
            } focus:outline-none focus:ring-2 placeholder-gray-400 text-gray-700 w-full ${
              isFormDisabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''
            }`}
            value={passwordToSend}
            onChange={handlePasswordChange}
            disabled={isFormDisabled}
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? "password-error" : undefined}
          />
          {passwordError && (
            <p 
              id="password-error"
              data-testid="errorPasswordMsg" 
              className="text-red-600 text-sm mt-1"
            >
              {passwordError}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          data-testid="button"
          type="submit"
          disabled={isSubmitDisabled}
          className={`py-3 rounded-md font-semibold transition duration-300 flex items-center justify-center ${
            isSubmitDisabled
              ? 'bg-gray-400 cursor-not-allowed text-gray-200'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {isLoading ? (
            <>
              <svg 
                data-testid="loadingSpinner"
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Signing In...
            </>
          ) : loginSuccess ? (
            <>
              <svg 
                data-testid="successCheckmark"
                className="w-5 h-5 mr-2" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                  clipRule="evenodd" 
                />
              </svg>
              Success!
            </>
          ) : (
            'Sign In'
          )}
        </button>

        {/* Form State Indicators for Testing */}
        <div className="hidden" data-testid="formState">
          <span data-testid="isLoading">{isLoading.toString()}</span>
          <span data-testid="isSubmitted">{isSubmitted.toString()}</span>
          <span data-testid="loginSuccess">{loginSuccess.toString()}</span>
          <span data-testid="isFormDisabled">{isFormDisabled.toString()}</span>
          <span data-testid="isSubmitDisabled">{isSubmitDisabled.toString()}</span>
        </div>
      </form>
    </div>
  );
}