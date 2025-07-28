import type { AppProps } from 'next/app';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>Firebase Notifications App</title>
                <meta name="description" content="Next.js app with Firebase Cloud Messaging" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Component {...pageProps} />
        </>
    );
}