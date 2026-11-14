import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TravelOS — Dashboard Rental',
  description: 'Kelola rental, kendaraan, dan operasional dengan mudah.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}