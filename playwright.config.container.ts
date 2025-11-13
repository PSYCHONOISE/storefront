import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";

// Загружаем конфигурацию для тестов
const NODE_ENV = process.env.NODE_ENV || "test";
const envFile = `.env.${NODE_ENV}`;

// Пытаемся загрузить environment-specific конфигурацию
try {
	config({ path: envFile });
} catch {
	config(); // fallback to .env
}

const PORT = process.env.PORT || 3000;
const baseURL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Конфигурация для тестирования в контейнере (без веб-сервера)
const testConfig = {
	testDir: "./__tests__",
	outputDir: "./test-results", // Явно указываем директорию для результатов
	fullyParallel: true,
	workers: 1, // Один воркер для стабильности в контейнере
	forbidOnly: true,
	retries: 1,
	reporter: [["html", { outputFolder: "./playwright-report" }], ["list"]],
	timeout: 90 * 1000, // 90 секунд
	globalTimeout: 10 * 60 * 1000, // 10 минут

	use: {
		baseURL,
		trace: "off", // Отключаем trace для стабиль
		screenshot: "off", // Отключаем скриншоты
		video: "off", // Отключаем видео для решения проблемы с ffmpeg
		actionTimeout: 15 * 1000,
		navigationTimeout: 30 * 1000,
	},

	projects: [
		{
			name: "Desktop Chrome",
			use: {
				...devices["Desktop Chrome"],
				// Настройки для контейнера
				launchOptions: {
					executablePath: "/usr/bin/chromium-browser",
					args: [
						"--no-sandbox",
						"--disable-setuid-sandbox",
						"--disable-dev-shm-usage",
						"--disable-web-security",
						"--disable-features=VizDisplayCompositor",
						"--disable-gpu",
						"--headless",
					],
				},
			},
		},
	],

	// Не настраиваем webServer - приложение уже запущено
};

export default defineConfig(testConfig);
