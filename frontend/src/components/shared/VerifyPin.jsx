"use client";

import { useState } from 'react';

const VerifyPin = ({ email }) => {
    const [pinCode, setPinCode] = useState("");

    const handleChange = (e) => {
        setPinCode(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`/api/banya/verify-pin/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, pin_code: pinCode }),
            });
            const result = await response.json();
            if (response.ok) {
                alert(result.message || "Verified successfully");
            } else {
                alert(result.error || "Error occurred during verification");
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="number"
                name="pinCode"
                placeholder="Enter your PIN Code"
                required
                value={pinCode}
                onChange={handleChange}
            />
            <button type="submit">Verify PIN</button>
        </form>
    );
};

export default VerifyPin;
