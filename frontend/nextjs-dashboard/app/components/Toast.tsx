// frontend/app/components/Toast.tsx
"use client";

import React from 'react';

export default function Toast({ message, type }: { message: string; type: 'error' | 'success' }) {
    return (
        <div style={{
            position: 'fixed',
            top: 20,
            right: 20,
            background: type === 'error' ? '#d32f2f' : '#388e3c',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '4px',
            zIndex: 1000,
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
            {message}
        </div>
    );
}
