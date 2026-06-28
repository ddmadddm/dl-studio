import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { SettingsProvider } from '@/context/SettingsContext';
import { PassProvider } from '@/context/PassContext';
import { CoachProvider } from '@/context/CoachContext';
import { CustomerProvider } from '@/context/CustomerContext';
import { TransactionProvider } from '@/context/TransactionContext';
import { SalesProvider } from '@/context/SalesContext';
import { PrescriptionProvider } from '@/context/PrescriptionContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DL STUDIO',
  description: '골프 바디 메커니즘 센터 관리 시스템',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DL STUDIO',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${inter.className} bg-[#F4F6F8]`}>
        <SettingsProvider>
        <CustomerProvider>
        <CoachProvider>
        <PassProvider>
        <TransactionProvider>
        <SalesProvider>
        <PrescriptionProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen">
              <Header />
              <main className="flex-1 p-8 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        </PrescriptionProvider>
        </SalesProvider>
        </TransactionProvider>
        </PassProvider>
        </CoachProvider>
        </CustomerProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
