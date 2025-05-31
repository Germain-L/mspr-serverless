import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: { 
		adapter: adapter({
			// Enable environment variables in server-side code
			env: {
				publicPrefix: 'PUBLIC_'
			}
		})
	}
};

export default config;
