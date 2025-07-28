import React from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useFirebaseMessaging } from '../hooks/useFirebaseMessaging';
import NotificationHandler from '../components/NotificationHandler';
import TopicSubscription from '../components/TopicSubscription';
import AdminTokenManager from "../components/AdminTokenManager";

const HomePage: React.FC = () => {
    const { token, notification, isTokenLoading, requestPermission } = useFirebaseMessaging();

    const copyTokenToClipboard = () => {
        if (token) {
            navigator.clipboard.writeText(token);
            alert('Token copied to clipboard!');
        }
    };

    return (
        <>
            <Container fluid className="py-4">
                <Row className="justify-content-center">
                    <Col lg={10}>
                        <div className="text-center mb-4">
                            <h1 className="display-4 mb-3">Firebase Notifications</h1>
                            <p className="lead text-muted">
                                Next.js application with Firebase Cloud Messaging integration
                            </p>
                        </div>

                        <Row className="g-4">
                            {/* Token Display Card */}
                            <Col md={12} lg={8}>
                                <Card className="h-100">
                                    <Card.Header className="d-flex justify-content-between align-items-center">
                                        <h5 className="mb-0">FCM Registration Token</h5>
                                        <Badge bg={token ? 'success' : 'secondary'}>
                                            {token ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </Card.Header>
                                    <Card.Body>
                                        {isTokenLoading ? (
                                            <div className="text-center">
                                                <Spinner animation="border" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </Spinner>
                                                <p className="mt-2 text-muted">Loading FCM token...</p>
                                            </div>
                                        ) : token ? (
                                            <>
                                                <div className="mb-3">
                                                    <label className="form-label">Access Token:</label>
                                                    <div className="input-group">
                                                        <input
                                                            type="text"
                                                            className="form-control font-monospace small"
                                                            value={token}
                                                            readOnly
                                                            style={{ fontSize: '12px' }}
                                                        />
                                                        <Button
                                                            variant="outline-secondary"
                                                            onClick={copyTokenToClipboard}
                                                        >
                                                            Copy
                                                        </Button>
                                                    </div>
                                                </div>
                                                <Alert variant="success">
                                                    <strong>Ready to receive notifications!</strong>
                                                    <br />
                                                    You can now use this token to send targeted notifications.
                                                </Alert>
                                            </>
                                        ) : (
                                            <div className="text-center">
                                                <Alert variant="warning">
                                                    <strong>Notification permission required</strong>
                                                    <br />
                                                    Please grant notification permission to receive Firebase messages.
                                                </Alert>
                                                <Button
                                                    variant="primary"
                                                    size="lg"
                                                    onClick={requestPermission}
                                                >
                                                    Enable Notifications
                                                </Button>
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                            {/* Admin SDK Token Card */}
                            <Col md={12} lg={6}>
                                <AdminTokenManager />
                            </Col>


                            {/* Instructions Card */}
                            <Col md={12} lg={4}>
                                <Card className="h-100">
                                    <Card.Header>
                                        <h5 className="mb-0">Instructions</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <ol className="small">
                                            <li>Enable notifications by clicking the button</li>
                                            <li>Copy the FCM token from the left panel</li>
                                            <li>Use the token to send notifications via Firebase Console</li>
                                            <li>Subscribe to topics for group messaging</li>
                                        </ol>

                                        <Alert variant="info" className="small mt-3">
                                            <strong>Note:</strong> Make sure to configure your Firebase project
                                            with the correct credentials in the .env.local file.
                                        </Alert>
                                    </Card.Body>
                                </Card>
                            </Col>

                            {/* Topic Subscription Card */}
                            <Col md={12}>
                                <TopicSubscription token={token} />
                            </Col>

                            {/* Current Notification Display */}
                            {notification && (
                                <Col md={12}>
                                    <Card border="primary">
                                        <Card.Header className="bg-primary text-white">
                                            <h5 className="mb-0">Latest Notification</h5>
                                        </Card.Header>
                                        <Card.Body>
                                            <h6>{notification.title}</h6>
                                            <p className="mb-0">{notification.body}</p>
                                            {notification.data && (
                                                <details className="mt-2">
                                                    <summary className="small text-muted">Additional Data</summary>
                                                    <pre className="small mt-1">
                            {JSON.stringify(notification.data, null, 2)}
                          </pre>
                                                </details>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            )}
                        </Row>
                    </Col>
                </Row>
            </Container>

            {/* Notification Handler */}
            <NotificationHandler />
        </>
    );
};

export default HomePage;