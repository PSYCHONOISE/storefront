import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
	// Vite автоматически устанавливает NODE_ENV:
	// - development для dev server
	// - production для build
	console.log(`🎨 Vite mode: ${mode}, NODE_ENV: ${process.env.NODE_ENV}`);

	// Определяем среду по NODE_ENV или порту
	const port = parseInt(process.env.PORT || "3000");
	let envSuffix = "development";
	if (process.env.NODE_ENV === "production" || port === 3001) {
		envSuffix = "production";
	} else if (process.env.NODE_ENV === "test" || port === 3002) {
		envSuffix = "test";
	}

	return {
		plugins: [sveltekit()],
		// Изоляция кешей между средами
		cacheDir: `.vite-cache-${envSuffix}`,
		server: {
			port: parseInt(process.env.PORT || "3000"),
			host: "127.0.0.1", // Явная привязка к localhost
		},
		preview: {
			port: parseInt(process.env.PORT || "4173"),
			host: "127.0.0.1", // Явная привязка к localhost
		},
		define: {
			// Доступно в клиентском коде как __APP_ENV__
			__APP_ENV__: JSON.stringify(mode),
		},
	};
});
