import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import toast, { Toaster } from 'react-hot-toast';

export default function ToastListener() {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success, {
                id: flash.success, // prevent duplicate toasts
            });
        }
        if (flash?.error) {
            toast.error(flash.error, {
                id: flash.error,
            });
        }
    }, [flash?.success, flash?.error]);

    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4500,
                style: {
                    background: '#ffffff',
                    color: '#0f172a',
                    borderRadius: '1rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    border: '1px solid #e2e8f0',
                    padding: '12px 16px',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                },
                success: {
                    iconTheme: {
                        primary: '#059669',
                        secondary: '#ffffff',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#e11d48',
                        secondary: '#ffffff',
                    },
                },
            }}
        />
    );
}

