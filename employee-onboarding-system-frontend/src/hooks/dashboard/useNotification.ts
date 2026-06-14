import { useState } from 'react';

type Notification = {
    type: 'success' | 'error';
    message: string;
};

export function useNotification() {
    const [notification, setNotification] = useState<Notification | null>(null);

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });

        setTimeout(() => {
            setNotification(null);
        }, 3500);
    };

    return {
        notification,
        showNotification,
    };
}