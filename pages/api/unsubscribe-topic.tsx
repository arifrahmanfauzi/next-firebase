import type { NextApiRequest, NextApiResponse } from 'next';

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

    const { token, topic } = req.body;

    if (!token || !topic) {
        return res.status(400).json({ error: 'Token and topic are required' });
    }

    try {
        // You need to implement server-side Firebase Admin SDK for this
        // This is a placeholder - you'll need to add Firebase Admin SDK
        const response = await fetch(
            `https://iid.googleapis.com/iid/v1/${token}/rel/topics/${topic}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `key=${process.env.FIREBASE_SERVER_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (response.ok) {
            res.status(200).json({
                success: true,
                message: `Successfully unsubscribed from topic: ${topic}`
            });
        } else {
            const errorText = await response.text();
            console.error('Firebase error:', errorText);
            res.status(400).json({ error: 'Failed to unsubscribe from topic' });
        }
    } catch (error) {
        console.error('Error unsubscribing from topic:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}