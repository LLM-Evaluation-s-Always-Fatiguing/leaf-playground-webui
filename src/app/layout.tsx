import type { Metadata } from 'next';
import ManagersServerRegistry from '@/managers/ManagersServerRegistry';
import StyleRegistry from '@/components/core/StyleRegistry';
import GlobalLayout from '@/layouts/GlobalLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'LEAF Playground WebUI',
  description: 'WebUI for LEAF Playground',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ManagersServerRegistry>
          <StyleRegistry>
            <GlobalLayout>{children}</GlobalLayout>
          </StyleRegistry>
        </ManagersServerRegistry>
      </body>
    </html>
  );
}
