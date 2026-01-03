import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui';
import { TaskProvider } from '@/lib/context/TaskContext';

export const metadata: Metadata = {
  title: 'Task Management System',
  description: 'Phase II Full-Stack Web Todo Application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TaskProvider>
          <ToastProvider>{children}</ToastProvider>
        </TaskProvider>
      </body>
    </html>
  );
}
