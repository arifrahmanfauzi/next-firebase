import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

interface TopicSubscriptionProps {
    token: string | null;
}

const TopicSubscription: React.FC<TopicSubscriptionProps> = ({ token }) => {
    const [topic, setTopic] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

    const subscribeToTopic = async () => {
        if (!topic.trim() || !token) {
            setMessage({ type: 'danger', text: 'Please enter a topic name and ensure you have a valid token.' });
            return;
        }

        setIsSubscribing(true);
        setMessage(null);

        try {
            // Call your backend API to subscribe to topic
            const response = await fetch('/api/subscribe-topic', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    topic: topic.trim(),
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: `Successfully subscribed to topic: ${topic}` });
                setTopic('');
            } else {
                throw new Error(result.error || 'Failed to subscribe to topic');
            }
        } catch (error) {
            console.error('Error subscribing to topic:', error);
            setMessage({
                type: 'danger',
                text: error instanceof Error ? error.message : 'Failed to subscribe to topic'
            });
        } finally {
            setIsSubscribing(false);
        }
    };

    const unsubscribeFromTopic = async () => {
        if (!topic.trim() || !token) {
            setMessage({ type: 'danger', text: 'Please enter a topic name and ensure you have a valid token.' });
            return;
        }

        setIsSubscribing(true);
        setMessage(null);

        try {
            // Call your backend API to unsubscribe from topic
            const response = await fetch('/api/unsubscribe-topic', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    topic: topic.trim(),
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: `Successfully unsubscribed from topic: ${topic}` });
                setTopic('');
            } else {
                throw new Error(result.error || 'Failed to unsubscribe from topic');
            }
        } catch (error) {
            console.error('Error unsubscribing from topic:', error);
            setMessage({
                type: 'danger',
                text: error instanceof Error ? error.message : 'Failed to unsubscribe from topic'
            });
        } finally {
            setIsSubscribing(false);
        }
    };

    return (
        <Card>
            <Card.Header>
                <h5 className="mb-0">Topic Subscription</h5>
            </Card.Header>
            <Card.Body>
                {message && (
                    <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
                        {message.text}
                    </Alert>
                )}

                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Topic Name</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter topic name (e.g., news, sports, weather)"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            disabled={isSubscribing || !token}
                        />
                        <Form.Text className="text-muted">
                            Enter a topic name to subscribe/unsubscribe to Firebase Cloud Messaging topics.
                        </Form.Text>
                    </Form.Group>

                    <div className="d-flex gap-2">
                        <Button
                            variant="primary"
                            onClick={subscribeToTopic}
                            disabled={isSubscribing || !token || !topic.trim()}
                        >
                            {isSubscribing ? (
                                <>
                                    <Spinner size="sm" className="me-2" />
                                    Subscribing...
                                </>
                            ) : (
                                'Subscribe'
                            )}
                        </Button>

                        <Button
                            variant="outline-danger"
                            onClick={unsubscribeFromTopic}
                            disabled={isSubscribing || !token || !topic.trim()}
                        >
                            {isSubscribing ? (
                                <>
                                    <Spinner size="sm" className="me-2" />
                                    Unsubscribing...
                                </>
                            ) : (
                                'Unsubscribe'
                            )}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default TopicSubscription;