import type { NextApiRequest, NextApiResponse } from 'next';
import {formidable} from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable default body parser to handle file upload
export const config = {
    api: {
        bodyParser: false,
    },
};

type Data = {
    success?: boolean;
    error?: string;
    message?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const form = formidable({
            uploadDir: path.join(process.cwd(), 'temp'),
            keepExtensions: true,
            maxFileSize: 5 * 1024 * 1024, // 5MB limit
        });

        // Ensure temp directory exists
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const [fields, files] = await form.parse(req);
        const file = Array.isArray(files.serviceAccount)
            ? files.serviceAccount[0]
            : files.serviceAccount;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Read and validate the JSON file
        const fileContent = fs.readFileSync(file.filepath, 'utf8');
        let serviceAccount;

        try {
            serviceAccount = JSON.parse(fileContent);
        } catch (error) {
            return res.status(400).json({ error: 'Invalid JSON file' });
        }

        // Validate that it's a Firebase service account
        const requiredFields = [
            'type',
            'project_id',
            'private_key_id',
            'private_key',
            'client_email',
            'client_id',
            'auth_uri',
            'token_uri'
        ];

        const missingFields = requiredFields.filter(field => !serviceAccount[field]);
        if (missingFields.length > 0) {
            return res.status(400).json({
                error: `Invalid service account file. Missing fields: ${missingFields.join(', ')}`
            });
        }

        if (serviceAccount.type !== 'service_account') {
            return res.status(400).json({
                error: 'File is not a valid Firebase service account key'
            });
        }

        // Store the service account securely (in production, use proper secure storage)
        const serviceAccountPath = path.join(process.cwd(), 'service-account.json');
        fs.writeFileSync(serviceAccountPath, fileContent, 'utf8');

        // Clean up temp file
        fs.unlinkSync(file.filepath);

        res.status(200).json({
            success: true,
            message: 'Service account uploaded successfully'
        });

    } catch (error) {
        console.error('Error uploading service account:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}