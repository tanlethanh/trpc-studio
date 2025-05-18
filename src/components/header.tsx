'use client';
import { GithubIcon } from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
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
								<svg
									width="24"
									height="24"
									viewBox="0 0 512 512"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<g clipPath="url(#clip0_43_39)">
										<path
											d="M362 0H150C67.1573 0 0 67.1573 0 150V362C0 444.843 67.1573 512 150 512H362C444.843 512 512 444.843 512 362V150C512 67.1573 444.843 0 362 0Z"
											fill="#191919"
										/>
										<path
											fillRule="evenodd"
											clipRule="evenodd"
											d="M255.446 75L326.523 116.008V138.556L412.554 188.238V273.224L435.631 286.546V368.608L364.6 409.615L333.065 391.378L256.392 435.646L180.178 391.634L149.085 409.615L78.0537 368.538V286.546L100.231 273.743V188.238L184.415 139.638L184.462 139.636V116.008L255.446 75ZM326.523 159.879V198.023L255.492 239.031L184.462 198.023V160.936L184.415 160.938L118.692 198.9V263.084L149.085 245.538L220.115 286.546V368.538L198.626 380.965L256.392 414.323L314.618 380.712L293.569 368.538V286.546L364.6 245.538L394.092 262.565V198.9L326.523 159.879ZM312.031 357.969V307.915L355.369 332.931V382.985L312.031 357.969ZM417.169 307.846L373.831 332.862V382.985L417.169 357.9V307.846ZM96.5153 357.9V307.846L139.854 332.862V382.915L96.5153 357.9ZM201.654 307.846L158.315 332.862V382.915L201.654 357.9V307.846ZM321.262 291.923L364.6 266.908L407.938 291.923L364.6 316.962L321.262 291.923ZM149.085 266.838L105.746 291.923L149.085 316.892L192.423 291.923L149.085 266.838ZM202.923 187.362V137.308L246.215 162.346V212.377L202.923 187.362ZM308.015 137.308L264.723 162.346V212.354L308.015 187.362V137.308ZM212.154 121.338L255.446 96.3231L298.785 121.338L255.446 146.354L212.154 121.338Z"
											fill="#EAEAEA"
										/>
									</g>
									<defs>
										<clipPath id="clip0_43_39">
											<rect
												width="512"
												height="512"
												fill="white"
											/>
										</clipPath>
									</defs>
								</svg>
							</a>
							<h1 className="text-xl font-medium text-foreground">
								tRPC Studio
							</h1>
						</div>
						<div className="flex items-center gap-2">
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
					<div className="flex-none p-4 space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<div className="flex items-center gap-2">
									<a
										href="https://trpc.io"
										target="_blank"
										rel="noopener noreferrer"
										className="hover:opacity-80 transition-opacity"
									>
										<svg
											width="32"
											height="32"
											viewBox="0 0 512 512"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<g clipPath="url(#clip0_43_39)">
												<path
													d="M362 0H150C67.1573 0 0 67.1573 0 150V362C0 444.843 67.1573 512 150 512H362C444.843 512 512 444.843 512 362V150C512 67.1573 444.843 0 362 0Z"
													fill="#191919"
												/>
												<path
													fillRule="evenodd"
													clipRule="evenodd"
													d="M255.446 75L326.523 116.008V138.556L412.554 188.238V273.224L435.631 286.546V368.608L364.6 409.615L333.065 391.378L256.392 435.646L180.178 391.634L149.085 409.615L78.0537 368.538V286.546L100.231 273.743V188.238L184.415 139.638L184.462 139.636V116.008L255.446 75ZM326.523 159.879V198.023L255.492 239.031L184.462 198.023V160.936L184.415 160.938L118.692 198.9V263.084L149.085 245.538L220.115 286.546V368.538L198.626 380.965L256.392 414.323L314.618 380.712L293.569 368.538V286.546L364.6 245.538L394.092 262.565V198.9L326.523 159.879ZM312.031 357.969V307.915L355.369 332.931V382.985L312.031 357.969ZM417.169 307.846L373.831 332.862V382.985L417.169 357.9V307.846ZM96.5153 357.9V307.846L139.854 332.862V382.915L96.5153 357.9ZM201.654 307.846L158.315 332.862V382.915L201.654 357.9V307.846ZM321.262 291.923L364.6 266.908L407.938 291.923L364.6 316.962L321.262 291.923ZM149.085 266.838L105.746 291.923L149.085 316.892L192.423 291.923L149.085 266.838ZM202.923 187.362V137.308L246.215 162.346V212.377L202.923 187.362ZM308.015 137.308L264.723 162.346V212.354L308.015 187.362V137.308ZM212.154 121.338L255.446 96.3231L298.785 121.338L255.446 146.354L212.154 121.338Z"
													fill="#EAEAEA"
												/>
											</g>
											<defs>
												<clipPath id="clip0_43_39">
													<rect
														width="512"
														height="512"
														fill="white"
													/>
												</clipPath>
											</defs>
										</svg>
									</a>
									<h1 className="text-2xl font-medium text-foreground">
										tRPC Studio
									</h1>
								</div>
								<p className="text-muted-foreground text-sm">
									Test your tRPC endpoints with ease
								</p>
							</div>
							<div className="flex items-center gap-2">
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

						<div className="flex items-center gap-2 text-sm">
							<span className="text-muted-foreground">URL:</span>
							<Input
								value={trpcUrl}
								onChange={(e) => setTrpcUrl(e.target.value)}
								placeholder="Enter tRPC URL"
								className="font-mono text-sm w-[400px]"
							/>
						</div>
					</div>
				</div>
			</div>
		</header>
	);
}
