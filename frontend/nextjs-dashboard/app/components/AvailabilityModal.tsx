// frontend/app/components/AvailabilityModal.tsx
"use client";

import React from 'react';

type Props = {
    slot: {
        start: Date;
        end: Date;
    };
    onClose: () => void;
    onSaved: () => void;
    onError: (msg: string) => void;
};

export default function AvailabilityModal({ slot, onClose, onSaved, onError }: Props) {
    const handleSave = async () => {
        const data = {
            master: 1,
            start: slot.start.toISOString(),
            end: slot.end.toISOString(),
            is_available: true,
        };

        const res = await fetch('http://localhost:8000/api/scheduling/availabilities/create/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (res.ok) {
            onSaved();
            onClose();
        } else {
            const error = await res.json();
            onError(error.error || 'Ошибка сохранения');
        }
    };

    return (
        <div style={modalStyle.overlay}>
            <div style={modalStyle.content}>
                <h3>Указать доступность</h3>
                <p>
                    {slot.start.toLocaleString()} — {slot.end.toLocaleString()}
                </p>
                <div style={modalStyle.buttons}>
                    <button onClick={handleSave} style={modalStyle.saveBtn}>
                        Сохранить
                    </button>
                    <button onClick={onClose} style={modalStyle.cancelBtn}>
                        Отмена
                    </button>
                </div>
            </div>
        </div>
    );
}

const modalStyle = {
    overlay: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },
    content: {
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        minWidth: '300px',
    },
    buttons: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '16px',
    },
    saveBtn: {
        backgroundColor: '#2c5e1a',
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
    cancelBtn: {
        backgroundColor: '#ccc',
        color: 'black',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};
