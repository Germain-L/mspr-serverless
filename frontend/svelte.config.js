import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: { 
		adapter: adapter({
			fallback: 'index.html', // Single-page app fallback for all routes
			pages: 'build',
			assets: 'build',
			precompress: true
		}),
		appDir: 'app',
		paths: {
			base: ''
		}
	}
};

export default config;
