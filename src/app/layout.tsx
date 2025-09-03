import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'School Management System',
  description: 'Manage and browse schools',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className=" bg-teal-950 text-white p-4">
          <div className="max-w-7xl mx-auto flex space-x-4">
            <Link href="/" className="hover">Home</Link>
            <Link href="/add-school" className="hover">Add School</Link>
            <Link href="/show-schools" className="hover">View Schools</Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
