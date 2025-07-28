import { useState, useEffect } from 'react';
import { getFirebaseToken, onMessageListener } from '../lib/firebase';

interface Notification {
    title: string;
    body: string;
    data?: any;
}

export const useFirebaseMessaging = () => {
    const [token, setToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notification | null>(null);
    const [isTokenLoading, setIsTokenLoading] = useState(true);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const fcmToken = await getFirebaseToken();
                setToken(fcmToken);
            } catch (error) {
                console.error('Error getting FCM token:', error);
            } finally {
                setIsTokenLoading(false);
            }
        };

        fetchToken();
    }, []);

    useEffect(() => {
        const unsubscribe = onMessageListener()
            .then((payload: any) => {
                setNotification({
                    title: payload.notification?.title || 'New Notification',
                    body: payload.notification?.body || 'You have a new message',
                    data: payload.data,
                });
            })
            .catch((err) => console.log('Failed to receive message', err));

        return () => {
            // Cleanup if needed
        };
    }, []);

    const requestPermission = async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Notification permission granted.');
                const fcmToken = await getFirebaseToken();
                setToken(fcmToken);
                return true;
            } else {
                console.log('Unable to get permission to notify.');
                return false;
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return false;
        }
    };

    return {
        token,
        notification,
        isTokenLoading,
        requestPermission,
        clearNotification: () => setNotification(null),
    };
};