import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			// Vercel adapter configuration
			runtime: 'nodejs22.x', // Use Node.js 22.x for better performance
			regions: ['iad1'], // Washington DC region
			memory: 512, // 512MB memory
			maxDuration: 30, // 30 second timeout
		}),
		// Standard SvelteKit configuration
		outDir: ".svelte-kit",
		alias: {
			"@": "./src",
			"@lib": "./src/lib",
			"@components": "./src/lib/components",
			"@stores": "./src/lib/stores",
			"@utils": "./src/lib/utils",
			"@gql": "./src/gql",
			"@graphql": "./src/graphql",
		},
	},
};

export default config;
