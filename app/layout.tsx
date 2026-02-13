import { Manrope } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import StyledComponentsRegistry from './styled-components-registry';
import PwaServiceWorker from '../components/PwaServiceWorker';
import { BRAND_SUBTITLE, BRAND_TITLE } from '../lib/constants/branding';
import {
  PWA_ICON_192_SIZE,
  PWA_ICON_192_SRC,
  PWA_ICON_512_SIZE,
  PWA_ICON_512_SRC,
  PWA_ICON_TYPE,
  PWA_THEME_COLOR
} from '../lib/constants/pwa';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: BRAND_TITLE,
  description: BRAND_SUBTITLE,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      {
        url: PWA_ICON_192_SRC,
        sizes: PWA_ICON_192_SIZE,
        type: PWA_ICON_TYPE
      },
      {
        url: PWA_ICON_512_SRC,
        sizes: PWA_ICON_512_SIZE,
        type: PWA_ICON_TYPE
      }
    ],
    apple: [
      {
        url: PWA_ICON_192_SRC,
        sizes: PWA_ICON_192_SIZE,
        type: PWA_ICON_TYPE
      }
    ]
  },
  appleWebApp: {
    capable: true,
    title: BRAND_TITLE,
    statusBarStyle: 'default'
  }
};

export const viewport: Viewport = {
  themeColor: PWA_THEME_COLOR
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        <StyledComponentsRegistry>
          <PwaServiceWorker />
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
