/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    // Enable service worker for Firebase messaging
    async rewrites() {
        return [
            {
                source: '/firebase-messaging-sw.js',
                destination: '/firebase-messaging-sw.js',
            },
        ];
    },
    // Handle environment variables
    env: {
        FIREBASE_SERVER_KEY: process.env.FIREBASE_SERVER_KEY,
    },
};

module.exports = nextConfig;