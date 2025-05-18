import fs from 'fs';
import path from 'path';
import { Metadata } from 'next';
import { MDXRemote } from 'next-mdx-remote/rsc';
import rehypePrismPlus from 'rehype-prism-plus';
import { Navigation } from '@/components/navigation';

export const metadata: Metadata = {
	title: 'Documentation - tRPC Studio',
	description: 'Documentation for tRPC Studio',
};

export default function DocsPage() {
	const content = fs.readFileSync(
		path.join(process.cwd(), 'src/app/docs/content.md'),
		'utf8',
	);

	return (
		<div className="min-h-screen bg-background">
			<Navigation />
			<div className="container mx-auto px-4 py-8 max-w-4xl">
				<article className="prose prose-slate dark:prose-invert max-w-none">
					<MDXRemote
						source={content}
						options={{
							mdxOptions: {
								rehypePlugins: [rehypePrismPlus],
							},
						}}
					/>
				</article>
			</div>
		</div>
	);
}
