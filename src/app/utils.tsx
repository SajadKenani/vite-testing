import React from 'react';
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import Home from "./page";

export let emailInput: HTMLElement;
export let passwordInput: HTMLElement;
export let submitButton: HTMLElement;

beforeEach(() => {
    render(<Home />);
    emailInput = screen.getByTestId('emailInput');
    passwordInput = screen.getByTestId('passwordInput');
    submitButton = screen.getByTestId('button');
});

afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
});

// Helper functions for better organization
export const mockSuccessfulLogin = () => {
    window.fetch = vi.fn(() =>
        Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ message: 'Login successful' }),
        } as Response)
    ) as typeof fetch;
};

export const mockFailedLogin = (status = 401) => {
    window.fetch = vi.fn(() =>
        Promise.reject(new Response(null, { status }))
    ) as typeof fetch;
};

export const mockDelayedResponse = (success = true, delay = 100) => {
    window.fetch = vi.fn(() =>
        new Promise<Response>((resolve, reject) =>
            setTimeout(() => {
                if (success) {
                    resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve({ message: 'Login successful' }),
                    } as Response);
                } else {
                    reject(new Response(null, { status: 401 }));
                }
            }, delay)
        )
    ) as typeof fetch;
};

export const fillForm = (email: string, password: string) => {
    fireEvent.change(emailInput, { target: { value: email } });
    fireEvent.change(passwordInput, { target: { value: password } });
};

export const submitForm = () => {
    fireEvent.click(submitButton);
};

export const fillAndSubmitForm = (email: string, password: string) => {
    fillForm(email, password);
    submitForm();
};