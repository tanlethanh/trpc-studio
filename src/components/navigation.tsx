'use client';
import Link from 'next/link';
import { Play, GithubIcon } from 'lucide-react';
import { TrpcLogo } from './icons/trpc-logo';
import { ThemeToggle } from './theme-toggle';
import { Button } from './ui/button';

export function Navigation() {
	return (
		<nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto flex h-16 items-center px-4">
				<div className="flex items-center gap-2">
					<a
						href="https://trpc.io"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:opacity-80 transition-opacity"
					>
						<TrpcLogo className="h-6 w-6" />
					</a>
					<Link href="/">
						<h1 className="text-xl font-medium text-foreground">
							tRPC Studio
						</h1>
					</Link>
				</div>
				<div className="ml-auto flex items-center gap-2">
					<Button variant="ghost" size="icon" asChild>
						<Link href="/">
							<Play className="h-4 w-4" />
						</Link>
					</Button>
					<Button variant="ghost" size="icon" asChild>
						<a
							href="https://github.com/tanlethanh/trpc-studio"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="GitHub Repository"
						>
							<GithubIcon className="h-4 w-4" />
						</a>
					</Button>
					<ThemeToggle />
				</div>
			</div>
		</nav>
	);
}
