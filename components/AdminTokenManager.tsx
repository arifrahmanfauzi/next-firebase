import React, { useState, useRef } from 'react';
import { Card, Button, Alert, Spinner, Form, Badge } from 'react-bootstrap';

interface AdminToken {
    access_token: string;
    expires_in: number;
    token_type: string;
    expires_at?: Date;
}

const AdminTokenManager: React.FC = () => {
    const [adminToken, setAdminToken] = useState<AdminToken | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'danger' | 'info'; text: string } | null>(null);
    const [hasServiceAccount, setHasServiceAccount] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const uploadServiceAccount = async (file: File) => {
        const formData = new FormData();
        formData.append('serviceAccount', file);

        try {
            const response = await fetch('/api/upload-service-account', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                setHasServiceAccount(true);
                setMessage({ type: 'success', text: 'Service account uploaded successfully!' });
            } else {
                throw new Error(result.error || 'Failed to upload service account');
            }
        } catch (error) {
            console.error('Error uploading service account:', error);
            setMessage({
                type: 'danger',
                text: error instanceof Error ? error.message : 'Failed to upload service account'
            });
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type === 'application/json' || file.name.endsWith('.json')) {
                uploadServiceAccount(file);
            } else {
                setMessage({ type: 'danger', text: 'Please select a valid JSON file' });
            }
        }
    };

    const generateAdminToken = async () => {
        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/generate-admin-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (response.ok) {
                const tokenData = {
                    ...result,
                    expires_at: new Date(Date.now() + (result.expires_in * 1000))
                };
                setAdminToken(tokenData);
                setMessage({ type: 'success', text: 'Admin access token generated successfully!' });
            } else {
                throw new Error(result.error || 'Failed to generate admin token');
            }
        } catch (error) {
            console.error('Error generating admin token:', error);
            setMessage({
                type: 'danger',
                text: error instanceof Error ? error.message : 'Failed to generate admin token'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const copyTokenToClipboard = () => {
        if (adminToken?.access_token) {
            navigator.clipboard.writeText(adminToken.access_token);
            setMessage({ type: 'info', text: 'Admin token copied to clipboard!' });
        }
    };

    const isTokenExpired = () => {
        if (!adminToken?.expires_at) return false;
        return new Date() >= adminToken.expires_at;
    };

    const getTimeUntilExpiry = () => {
        if (!adminToken?.expires_at) return '';
        const now = new Date();
        const expiry = adminToken.expires_at;
        const diffMs = expiry.getTime() - now.getTime();

        if (diffMs <= 0) return 'Expired';

        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMins / 60);

        if (diffHours > 0) {
            return `${diffHours}h ${diffMins % 60}m remaining`;
        } else {
            return `${diffMins}m remaining`;
        }
    };

    return (
        <Card className="h-100">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Admin SDK Access Token</h5>
                <Badge bg={adminToken && !isTokenExpired() ? 'success' : 'secondary'}>
                    {adminToken && !isTokenExpired() ? 'Active' : 'Inactive'}
                </Badge>
            </Card.Header>
            <Card.Body>
                {message && (
                    <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
                        {message.text}
                    </Alert>
                )}

                {!hasServiceAccount ? (
                    <div>
                        <p className="text-muted mb-3">
                            Upload your Firebase Admin SDK service account JSON file to generate access tokens.
                        </p>
                        <Form.Group className="mb-3">
                            <Form.Label>Service Account JSON File</Form.Label>
                            <Form.Control
                                type="file"
                                accept=".json,application/json"
                                onChange={handleFileUpload}
                                ref={fileInputRef}
                            />
                            <Form.Text className="text-muted">
                                Upload your adminsdk.json or service account key file from Firebase Console.
                            </Form.Text>
                        </Form.Group>
                    </div>
                ) : (
                    <div>
                        {adminToken ? (
                            <div>
                                <div className="mb-3">
                                    <label className="form-label d-flex justify-content-between">
                                        <span>Admin Access Token:</span>
                                        <small className="text-muted">{getTimeUntilExpiry()}</small>
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className={`form-control font-monospace small ${isTokenExpired() ? 'border-danger' : ''}`}
                                            value={adminToken.access_token}
                                            readOnly
                                            style={{ fontSize: '12px' }}
                                        />
                                        <Button
                                            variant="outline-secondary"
                                            onClick={copyTokenToClipboard}
                                            disabled={isTokenExpired()}
                                        >
                                            Copy
                                        </Button>
                                    </div>
                                </div>

                                <div className="row text-center mb-3">
                                    <div className="col-4">
                                        <small className="text-muted">Token Type</small>
                                        <div className="fw-bold">{adminToken.token_type}</div>
                                    </div>
                                    <div className="col-4">
                                        <small className="text-muted">Expires In</small>
                                        <div className="fw-bold">{adminToken.expires_in}s</div>
                                    </div>
                                    <div className="col-4">
                                        <small className="text-muted">Status</small>
                                        <div className={`fw-bold ${isTokenExpired() ? 'text-danger' : 'text-success'}`}>
                                            {isTokenExpired() ? 'Expired' : 'Valid'}
                                        </div>
                                    </div>
                                </div>

                                {isTokenExpired() && (
                                    <Alert variant="warning" className="small">
                                        <strong>Token Expired!</strong> Generate a new token to continue using Admin SDK features.
                                    </Alert>
                                )}
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-muted mb-3">
                                    Generate an access token for Firebase Admin SDK operations.
                                </p>
                            </div>
                        )}

                        <div className="d-flex gap-2 justify-content-center">
                            <Button
                                variant={adminToken && !isTokenExpired() ? "outline-primary" : "primary"}
                                onClick={generateAdminToken}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Spinner size="sm" className="me-2" />
                                        Generating...
                                    </>
                                ) : (
                                    adminToken ? 'Refresh Token' : 'Generate Token'
                                )}
                            </Button>

                            <Button
                                variant="outline-secondary"
                                onClick={() => {
                                    setHasServiceAccount(false);
                                    setAdminToken(null);
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                    }
                                }}
                                size="sm"
                            >
                                Reset
                            </Button>
                        </div>

                        <div className="mt-3">
                            <details>
                                <summary className="small text-muted" style={{ cursor: 'pointer' }}>
                                    What can I do with this token?
                                </summary>
                                <div className="small text-muted mt-2">
                                    <ul className="mb-0">
                                        <li>Send notifications via FCM REST API</li>
                                        <li>Manage user subscriptions to topics</li>
                                        <li>Access Firebase Admin SDK features</li>
                                        <li>Perform server-side Firebase operations</li>
                                    </ul>
                                </div>
                            </details>
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default AdminTokenManager;