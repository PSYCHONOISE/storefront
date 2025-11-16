import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			out: "build-test",
			precompress: false,
		}),
		// Изоляция кеша SvelteKit для test
		outDir: ".svelte-kit-test",
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
