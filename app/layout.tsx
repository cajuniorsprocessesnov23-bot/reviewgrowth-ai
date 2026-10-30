import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'ReviewGrowth AI | Customer Experience Intelligence',
  description: 'Collect authentic customer feedback, understand sentiment and improve local search visibility.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
