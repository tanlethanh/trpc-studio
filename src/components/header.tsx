'use client';
import { GithubIcon, FileText } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { TrpcLogo } from './icons/trpc-logo';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface HeaderProps {
	trpcUrl: string;
	setTrpcUrl: (url: string) => void;
}

export function Header({ trpcUrl, setTrpcUrl }: HeaderProps) {
	return (
		<header className="border-b bg-background">
			<div className="mx-auto">
				{/* Mobile Header */}
				<div className="flex flex-col gap-3 py-3 sm:hidden px-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<a
								href="https://trpc.io"
								target="_blank"
								rel="noopener noreferrer"
								className="hover:opacity-80 transition-opacity"
							>
								<TrpcLogo className="h-6 w-6" />
							</a>
							<h1 className="text-xl font-medium text-foreground">
								tRPC Studio
							</h1>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="ghost" size="icon" asChild>
								<Link href="/docs">
									<FileText className="h-4 w-4" />
								</Link>
							</Button>
							<Button variant="ghost" size="icon" asChild>
								<a
									href="https://github.com/tanlethanh/trpc-studio"
									target="_blank"
									rel="noopener noreferrer"
								>
									<GithubIcon className="h-4 w-4" />
								</a>
							</Button>
							<ThemeToggle />
						</div>
					</div>
					<div className="flex flex-col gap-2">
						<Input
							type="url"
							placeholder="Enter tRPC URL"
							value={trpcUrl}
							onChange={(e) => setTrpcUrl(e.target.value)}
							className="w-full font-mono text-sm"
						/>
					</div>
				</div>

				{/* Desktop Header */}
				<div className="hidden sm:block">
					<div className="flex-none px-4 py-2 space-y-4">
						<div className="flex flex-ro items-center justify-between">
							<div>
								<div className="flex items-center gap-2">
									<a
										href="https://trpc.io"
										target="_blank"
										rel="noopener noreferrer"
										className="hover:opacity-80 transition-opacity"
									>
										<TrpcLogo className="h-8 w-8" />
									</a>
									<h1 className="text-xl font-medium text-foreground">
										tRPC Studio
									</h1>
								</div>
								<p className="text-muted-foreground text-sm">
									Test your tRPC endpoints with ease
								</p>
							</div>
							<div className="flex items-center gap-2">
								<div className="flex items-center gap-2 text-sm">
									<Input
										value={trpcUrl}
										onChange={(e) =>
											setTrpcUrl(e.target.value)
										}
										placeholder="Enter tRPC URL"
										className="font-mono text-sm w-[400px]"
									/>
								</div>
								<Button
									variant="ghost"
									size="icon"
									asChild
									className="h-9 w-9"
								>
									<Link href="/docs">
										<FileText className="h-[1.2rem] w-[1.2rem]" />
									</Link>
								</Button>
								<Button
									variant="ghost"
									size="icon"
									asChild
									className="h-9 w-9"
								>
									<a
										href="https://github.com/tanlethanh/trpc-studio"
										target="_blank"
										rel="noopener noreferrer"
										aria-label="GitHub Repository"
									>
										<GithubIcon className="h-[1.2rem] w-[1.2rem]" />
									</a>
								</Button>
								<ThemeToggle />
							</div>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
