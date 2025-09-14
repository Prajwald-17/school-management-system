'use client';

import Link from 'next/link';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

// Create a separate component for the navbar that can use hooks
function NavigationBar() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  return (
    <nav className="bg-teal-950 text-white p-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex space-x-4">
          <Link href="/" className="hover:text-teal-200">Home</Link>
          {user ? (
            <Link href="/add-school" className="hover:text-teal-200">Add School</Link>
          ) : null}
          <Link href="/show-schools" className="hover:text-teal-200">View Schools</Link>
        </div>
        
        <div className="flex items-center space-x-4">
          {loading ? (
            <span className="text-sm text-teal-200">Loading...</span>
          ) : (
            user ? (
              <>
                <span className="text-sm text-teal-200">Welcome, {user.email}</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-teal-800 hover:bg-teal-700 rounded text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                href="/auth/login" 
                className="px-3 py-1 bg-teal-800 hover:bg-teal-700 rounded text-sm"
              >
                Login
              </Link>
            )
          )}
        </div>
      </div>
    </nav>
  );
}

// Layout component that wraps everything
function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className={inter.className}>
      <NavigationBar />
      <main>{children}</main>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LayoutContent>{children}</LayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
