import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { NotificationWrapper } from '../components/notification-wrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nightlife OS - Club App',
  description: 'Besucher-PWA für Nightlife OS',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={inter.className}>
        <NotificationWrapper />
        {children}
      </body>
    </html>
  );
}
