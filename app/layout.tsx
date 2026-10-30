import type { Metadata, Viewport } from 'next';
import PwaRegister from '@/components/pwa-register';
import './globals.css';
export const metadata: Metadata = {
 title: 'Branditude Business Growth AI | Customer Experience Intelligence',
 description: 'Collect authentic customer feedback, discover offers and rewards, and improve local search visibility.',
 manifest: '/manifest.webmanifest',
 appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Branditude' },
 applicationName: 'Branditude Business Growth AI',
 icons: { icon: '/icons/icon-512.svg', apple: '/icons/icon-512.svg' },
};
export const viewport: Viewport = { themeColor: '#111827', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 return <html lang="en"><body><PwaRegister />{children}</body></html>;
}
