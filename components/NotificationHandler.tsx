import React, { useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { useFirebaseMessaging } from '../hooks/useFirebaseMessaging';

const NotificationHandler: React.FC = () => {
    const { notification, clearNotification } = useFirebaseMessaging();

    useEffect(() => {
        if (notification) {
            // You can also show browser notification here if needed
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(notification.title, {
                    body: notification.body,
                    icon: '/firebase-logo.png',
                });
            }
        }
    }, [notification]);

    return (
        <ToastContainer position="top-end" className="p-3">
            <Toast
                show={!!notification}
                onClose={clearNotification}
                delay={5000}
                autohide
                bg="primary"
            >
                <Toast.Header>
                    <strong className="me-auto">{notification?.title}</strong>
                </Toast.Header>
                <Toast.Body>{notification?.body}</Toast.Body>
            </Toast>
        </ToastContainer>
    );
};

export default NotificationHandler;