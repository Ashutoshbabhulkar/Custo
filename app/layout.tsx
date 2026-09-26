import React from 'react';
import './globals.css';

export const metadata = {
  title: 'Custo — Customer Feedback & Reputation Platform',
  description: 'Know what your customers think. Genuine customer feedback, review assistance, and customer experience analytics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8FBFC] text-gray-800 antialiased selection:bg-[#005A63] selection:text-white">
        {children}
      </body>
    </html>
  );
}
