import type { Metadata } from 'next';
import { Newsreader } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './_components/ThemeProvider';
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from './_lib/site';

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  // Resolves relative OG/Twitter image URLs (incl. the generated
  // opengraph-image.tsx) to absolute URLs. Without this, crawlers get a
  // localhost image URL in production and previews break.
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    url: SITE_URL,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={newsreader.variable}>
      <head>
        {/* Prevent flash of wrong theme — runs before React hydration */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('rh-dark')==='true')document.documentElement.setAttribute('data-theme','dark')}catch(e){}` }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}