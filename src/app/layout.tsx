import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
	themeColor: '#191919',
};

export const metadata: Metadata = {
	title: 'tRPC Studio',
	description: 'A playground for testing tRPC endpoints',
	icons: {
		icon: [{ url: '/trpc-icon.svg', type: 'image/svg+xml' }, { url: '/favicon.ico' }],
		other: [
			{
				rel: 'mask-icon',
				url: '/trpc-icon.svg',
			},
		],
	},
	manifest: '/manifest.json',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={inter.className}>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem={false}
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
			</body>
		</html>
	);
}
