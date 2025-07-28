import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { JWT } from 'google-auth-library';

type Data = {
    access_token?: string;
    expires_in?: number;
    token_type?: string;
    error?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Check if service account file exists
        const serviceAccountPath = path.join(process.cwd(), 'service-account.json');

        if (!fs.existsSync(serviceAccountPath)) {
            return res.status(400).json({
                error: 'Service account file not found. Please upload your adminsdk.json first.'
            });
        }

        // Read service account
        const serviceAccountContent = fs.readFileSync(serviceAccountPath, 'utf8');
        const serviceAccount = JSON.parse(serviceAccountContent);

        // Create JWT client
        const jwtClient = new JWT({
            email: serviceAccount.client_email,
            key: serviceAccount.private_key,
            scopes: [
                'https://www.googleapis.com/auth/cloud-platform',
                'https://www.googleapis.com/auth/firebase.messaging'
            ],
        });

        // Get access token
        const credentials = await jwtClient.authorize();

        if (!credentials.access_token) {
            throw new Error('Failed to obtain access token');
        }

        // Calculate expires_in (tokens typically expire in 1 hour)
        const expiresIn = credentials.expiry_date
            ? Math.floor((credentials.expiry_date - Date.now()) / 1000)
            : 3600; // Default to 1 hour

        res.status(200).json({
            access_token: credentials.access_token,
            expires_in: expiresIn,
            token_type: 'Bearer'
        });

    } catch (error) {
        console.error('Error generating admin token:', error);

        if (error instanceof Error) {
            if (error.message.includes('invalid_grant')) {
                res.status(400).json({
                    error: 'Invalid service account credentials. Please check your adminsdk.json file.'
                });
            } else {
                res.status(500).json({
                    error: error.message || 'Failed to generate admin token'
                });
            }
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}