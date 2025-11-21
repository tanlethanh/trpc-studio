import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// https://vite.dev/config/
export default defineConfig({
	plugins: [preact(), viteSingleFile()],
	resolve: {
		alias: {
			preact: 'https://esm.sh/preact@10.27.2',
		},
	},
});
