import { describe, test, expect } from 'vitest';
import { render, fireEvent, waitFor, type RenderResult } from '@testing-library/react';
import Home from '../page'; // adjust path as needed
import { mockFailedLogin, mockSuccessfulLogin, noConnectionForm } from './utils';

describe("Browsing Testing", () => {
    let screen: RenderResult;

    test('Valid credentials - triggers submit', async () => {
        screen = render(<Home />);
        mockSuccessfulLogin()
        const emailInput = screen.getByTestId('emailInput');
        const passwordInput = screen.getByTestId('passwordInput');
        const submitButton = screen.getByTestId('button');

        fireEvent.change(emailInput, { target: { value: 'valid@gmail.com' } });
        fireEvent.change(passwordInput, { target: { value: 'ValidPass123' } });

        fireEvent.click(submitButton);

        await waitFor(() => {
            const welcomeMessage = screen.queryByTestId("welcomeMessage");
            expect(welcomeMessage).toBeInTheDocument();

            expect(emailInput).toBeDisabled()
            expect(passwordInput).toBeDisabled()
            expect(submitButton).toBeDisabled()

            expect(window.location.pathname).toBe("/")
        });
    }, 30000);

    test('Invalid email - shows error', async () => {
        screen = render(<Home />);
        const emailInput = screen.getByTestId('emailInput');
        const passwordInput = screen.getByTestId('passwordInput');
        const submitButton = screen.getByTestId('button');

        fireEvent.input(emailInput, { target: { value: 'invalidemail@notemail.notcom' } });
        fireEvent.input(passwordInput, { target: { value: 'ValidPass123' } });
        fireEvent.click(submitButton);
        const emailError = screen.getByTestId('errorEmailMsg');

        await waitFor(() => {
            expect(emailError).toBeInTheDocument();
        });
    }, 30000);

    test('Password too short - shows error', async () => {
        screen = render(<Home />);
        const emailInput = screen.getByTestId('emailInput');
        const passwordInput = screen.getByTestId('passwordInput');
        const submitButton = screen.getByTestId('button');

        fireEvent.input(emailInput, { target: { value: 'valid@gmail.com' } });
        fireEvent.input(passwordInput, { target: { value: '123' } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Password must be at least 8 characters with letters and numbers/i)).toBeInTheDocument();
        });
    }, 30000);

    test("Invalid credentials - shows authentication error", async () => {
        screen = render(<Home />);
        mockFailedLogin(401)

        const emailInput = screen.getByTestId('emailInput');
        const passwordInput = screen.getByTestId('passwordInput');
        const submitButton = screen.getByTestId('button');

        fireEvent.input(emailInput, { target: { value: 'invalid@gmail.com' } });
        fireEvent.input(passwordInput, { target: { value: 'inValidPass123' } });
        fireEvent.click(submitButton);

        await waitFor(async () => {
            const generalError = await screen.findByTestId('generalError');
            expect(generalError).toHaveTextContent('Login failed. Please check your credentials.');
        })
    }, 30000)

    test('Network error - shows connection error', async () => {
        screen = render(<Home />);
        noConnectionForm()

        const emailInput = screen.getByTestId('emailInput');
        const passwordInput = screen.getByTestId('passwordInput');
        const submitButton = screen.getByTestId('button');

        fireEvent.input(emailInput, { target: { value: 'valid@gmail.com' } });
        fireEvent.input(passwordInput, { target: { value: 'ValidPass123' } });
        fireEvent.click(submitButton);

        await waitFor(async () => {
            const errorText = await screen.findByTestId('errorText');
            expect(errorText).toHaveTextContent('Network error');
        });
    }, 30000);

});
