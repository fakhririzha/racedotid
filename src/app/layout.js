import { Inter } from 'next/font/google';
import PropTypes from 'prop-types';
import * as React from 'react';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Live Tracker Beta',
    description: 'Live tracker beta',
};

const RootLayout = ({ children }) => {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    );
};

RootLayout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default RootLayout;
