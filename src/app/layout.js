import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider } from '@/lib/theme';
import PublicWrapper from '@/components/layout/PublicWrapper';

export const metadata = {
  title: 'TerraByte — Learn VFX, Game Dev & Computer Science',
  description: 'Master VFX, game development, and computer science through structured, video-based courses. Learn at your own pace with high-quality content from industry experts.',
  keywords: 'TerraByte, VFX, education, courses, game development, computer science, programming, visual effects, online learning',
  openGraph: {
    title: 'TerraByte — Learn VFX, Game Dev & Computer Science',
    description: 'Master VFX, game development, and computer science through structured, video-based courses.',
    url: 'https://lms-frontend-gamma-seven.vercel.app',
    siteName: 'TerraByte',
    images: [
      {
        url: 'https://lms-frontend-gamma-seven.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TerraByte LMS Platform Preview',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TerraByte — Learn VFX, Game Dev & Computer Science',
    description: 'Master VFX, game development, and computer science through structured, video-based courses.',
    images: ['https://lms-frontend-gamma-seven.vercel.app/og-image.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                  if (!theme && supportDarkMode) theme = 'dark';
                  if (!theme) theme = 'dark';
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <AuthProvider>
            <PublicWrapper>
              {children}
            </PublicWrapper>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

