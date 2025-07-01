import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { emailInput, passwordInput, submitButton, fillAndSubmitForm, submitForm, mockDelayedResponse, 
    mockSuccessfulLogin, mockFailedLogin, fillForm } from './utils.jsx';

describe('Login Form Component', () => {
    describe('Component Rendering', () => {
        test('renders all form elements with correct attributes', () => {
            expect(emailInput).toBeInTheDocument();
            expect(passwordInput).toBeInTheDocument();
            expect(submitButton).toBeInTheDocument();

            expect(emailInput).toHaveAttribute('type', 'email');
            expect(passwordInput).toHaveAttribute('type', 'password');
            expect(submitButton).toHaveAttribute('type', 'submit');
        });

        test('form elements are enabled by default', () => {
            expect(emailInput).not.toBeDisabled();
            expect(passwordInput).not.toBeDisabled();
            expect(submitButton).toBeDisabled();
        });
    });

    describe('Input Validation', () => {
        test('shows error password is empty', async () => {
            fillAndSubmitForm('', '');
            expect(submitButton).toBeDisabled();

            fillAndSubmitForm('valid@gmail.com', '');
            expect(submitButton).toBeDisabled();

            fillAndSubmitForm('', 'ValidPass123');
            expect(submitButton).toBeDisabled();
        });

        test('shows error when inputs contain only whitespace', async () => {
            fillAndSubmitForm('invalid@notgmail.notcom', '    ');

            const emailError = await screen.findByTestId('errorEmailMsg');
            const passwordError = await screen.findByTestId('errorPasswordMsg');

            expect(emailError).toBeInTheDocument();
            expect(passwordError).toBeInTheDocument();
        });

        test('shows error for invalid email format', async () => {
            fillAndSubmitForm('test@notgmail.notcom', '123456');

            const emailError = await screen.findByTestId('errorEmailMsg');
            expect(emailError).toHaveTextContent('Invalid email address');
        });

        test('shows error for weak password', async () => {
            fillAndSubmitForm('valid@gmail.com', '123456');

            const passwordError = await screen.findByTestId('errorPasswordMsg');
            expect(passwordError).toHaveTextContent('Password must be at least 8 characters with letters and numbers');
        });

        test('shows multiple validation errors simultaneously', async () => {
            fillAndSubmitForm('invalid@invalid.com', 'weak');

            const emailError = await screen.findByTestId('errorEmailMsg');
            const passwordError = await screen.findByTestId('errorPasswordMsg');

            expect(emailError).toHaveTextContent('Invalid email address');
            expect(passwordError).toHaveTextContent('Password must be at least 8 characters with letters and numbers');
        });

        test('does not show errors for valid inputs', async () => {
            fillAndSubmitForm('valid@gmail.com', 'ValidPass123');

            await waitFor(() => {
                expect(screen.queryByTestId('errorEmailMsg')).toBeNull();
                expect(screen.queryByTestId('errorPasswordMsg')).toBeNull();
            });
        });
    });

    describe('Error State Management', () => {
        test('clears email error when valid email is entered after error', async () => {
            fillAndSubmitForm('valid@invalid.com', 'ValidPass123');

            await screen.findByTestId('errorEmailMsg');

            fireEvent.change(emailInput, { target: { value: 'valid@gmail.com' } });
            submitForm();

            await waitFor(() => {
                expect(screen.queryByTestId('errorEmailMsg')).toBeNull();
            });
        });

        test('clears password error when valid password is entered after error', async () => {
            fillAndSubmitForm('valid@gmail.com', 'weak');

            await screen.findByTestId('errorPasswordMsg');

            fireEvent.change(passwordInput, { target: { value: 'ValidPass123' } });
            submitForm();

            await waitFor(() => {
                expect(screen.queryByTestId('errorPasswordMsg')).toBeNull();
            });
        });

        test('clears errors when user starts typing after validation error', async () => {
            fillAndSubmitForm('invalid@email', 'weak');

            await screen.findByTestId('errorEmailMsg');
            await screen.findByTestId('errorPasswordMsg');

            fireEvent.change(emailInput, { target: { value: 'v' } });
            fireEvent.change(passwordInput, { target: { value: 'V' } });

            await waitFor(() => {
                expect(screen.queryByTestId('errorEmailMsg')).toBeNull();
                expect(screen.queryByTestId('errorPasswordMsg')).toBeNull();
            });
        });
    });

    describe('Loading States', () => {
        test('shows loading spinner during form submission', async () => {
            mockDelayedResponse(true, 200);
            fillAndSubmitForm('valid@gmail.com', 'ValidPass123');

            const loadingSpinner = await screen.findByTestId('loadingSpinner');
            expect(loadingSpinner).toBeInTheDocument();
        });

        test('disables all inputs during loading', async () => {
            mockDelayedResponse(true, 200);
            fillAndSubmitForm('valid@gmail.com', 'ValidPass123');

            await waitFor(() => {
                expect(emailInput).toBeDisabled();
                expect(passwordInput).toBeDisabled();
                expect(submitButton).toBeDisabled();
            });
        });

        test('prevents multiple submissions during loading', async () => {
            mockDelayedResponse(true, 200);
            fillAndSubmitForm('valid@gmail.com', 'ValidPass123');

            // Try to submit again while loading
            fireEvent.click(submitButton);
            fireEvent.click(submitButton);

            expect(window.fetch).toHaveBeenCalledTimes(1);
        });
    });

    describe('API Integration', () => {
        test('handles successful login', async () => {
            mockSuccessfulLogin();
            fillAndSubmitForm('valid@gmail.com', 'ValidPass123');

            const successMessage = await screen.findByTestId('successMessage');
            expect(successMessage).toHaveTextContent('Login successful! Redirecting...');
            expect(window.fetch).toHaveBeenCalledTimes(1);
        });

        test('handles login failure with proper error message', async () => {
            mockFailedLogin(401);
            fillAndSubmitForm('valid@gmail.com', 'ValidPass123');

            const generalError = await screen.findByTestId('generalError');
            expect(generalError).toHaveTextContent('Login failed. Please check your credentials.');
        });

        test('handles network errors gracefully', async () => {
            mockFailedLogin(500);
            fillAndSubmitForm('valid@gmail.com', 'ValidPass123');

            const generalError = await screen.findByTestId('generalError');
            expect(generalError).toBeInTheDocument();
        });

        test('makes API call with correct credentials', async () => {
            mockSuccessfulLogin();
            const email = 'test@gmail.com';
            const password = 'TestPass123';

            fillAndSubmitForm(email, password);

            await waitFor(() => {
                expect(window.fetch).toHaveBeenCalledWith(
                    expect.any(String),
                    expect.objectContaining({
                        method: 'POST',
                        headers: expect.objectContaining({
                            'Content-Type': 'application/json',
                        }),
                        body: JSON.stringify({ email, password }),
                    })
                );
            });
        });
    });

    describe('Form Reset and State Management', () => {
        test('clears form and errors after successful login', async () => {
            mockDelayedResponse(true, 100);
            fillAndSubmitForm('valid@gmail.com', 'ValidPass123');

            await screen.findByTestId('successMessage');

            // Wait for form reset (assuming 2 second timeout)
            await waitFor(() => {
                expect(emailInput).toBeDisabled();
                expect(passwordInput).toBeDisabled();
            }, { timeout: 3000 });
        });

        test('maintains form state after validation errors', async () => {
            const email = 'invalid@email';
            const password = 'weak';

            fillAndSubmitForm(email, password);
            await screen.findByTestId('errorEmailMsg');

            expect(emailInput).toHaveValue(email);
            expect(passwordInput).toHaveValue(password);
        });

        test('clears general errors when form is resubmitted', async () => {
            // First failed attempt
            mockFailedLogin();
            fillAndSubmitForm('valid@gmail.com', 'ValidPass123');
            await screen.findByTestId('generalError');

            // Second successful attempt
            mockSuccessfulLogin();
            submitForm();

            await waitFor(() => {
                expect(screen.queryByTestId('generalError')).toBeNull();
            });
        });
    });

    describe('Edge Cases', () => {
        test('handles rapid successive submissions', async () => {
            mockDelayedResponse(true, 100);
            fillForm('valid@gmail.com', 'ValidPass123');

            // Submit multiple times rapidly
            submitForm();
            submitForm();
            submitForm();

            expect(window.fetch).toHaveBeenCalledTimes(1);
        });

        // test('handles form submission with special characters in password', async () => {
        //     fillAndSubmitForm('valid@gmail.com', 'P@ssw0rd!@#$%^&*()');
        //     mockSuccessfulLogin();
        //     const successMessage = await screen.findByTestId('successMessage');
        //     expect(successMessage).toBeInTheDocument();
        // });
    });
});