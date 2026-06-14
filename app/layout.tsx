import type { Metadata } from 'next';
import { Newsreader } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from './_components/ThemeProvider';

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'rabbithole',
  description: 'Proof that people still think interesting thoughts.',
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