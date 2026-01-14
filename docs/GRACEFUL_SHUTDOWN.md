# Graceful Shutdown для Saleor Storefront

## Проблема

При запуске приложения через `./dev.sh start production` и нажатии Ctrl+C возникала проблема:

1. Первый Ctrl+C показывал `ELIFECYCLE Command failed`
2. Требовался второй Ctrl+C для полного завершения
3. Терминал "зависал" и не возвращался к приглашению

## Причина

### Цепочка процессов

При запуске создается сложная цепочка процессов:

```
dev.sh → npm/pnpm → dotenv-cli → npm/pnpm run start → vite preview
```

### Проблемы с сигналами

- **SIGINT** (Ctrl+C) не передается корректно через всю цепочку
- **npm** показывает ошибку `ELIFECYCLE Command failed` при получении SIGINT
- **dotenv-cli** может блокировать передачу сигналов
- **Vite** не всегда корректно обрабатывает завершение

## Решение

### 1. Graceful Server Wrapper

Создан `scripts/graceful-server.js` - обертка, которая:

- Правильно обрабатывает сигналы SIGINT/SIGTERM
- Обеспечивает graceful shutdown дочерних процессов
- Предотвращает появление "Command failed" сообщений
- Дает процессу 5 секунд на graceful shutdown, затем принудительно завершает

### 2. Улучшенные npm скрипты

Добавлены новые скрипты в `package.json`:

```json
{
	"start:dev": "npx dotenv-cli -e .env.development -- npm run dev",
	"start:prod": "npx dotenv-cli -e .env.production -- npm run start",
	"start:test": "npx dotenv-cli -e .env.test -- npm run start"
}
```

### 3. Обновленные базовые скрипты

```json
{
	"dev": "node scripts/graceful-server.js vite dev",
	"start": "node scripts/graceful-server.js vite preview"
}
```

## Как это работает

### Graceful Server Features

1. **Перехват сигналов**: Обрабатывает SIGINT, SIGTERM
2. **Graceful shutdown**: Передает сигнал дочернему процессу
3. **Timeout protection**: Принудительно завершает через 5 сек если нужно
4. **Чистые сообщения**: Показывает понятные сообщения пользователю
5. **Double Ctrl+C**: Второй Ctrl+C принудительно завершает

### Пример вывода

```bash
🚀 Started: vite preview
💡 Press Ctrl+C to stop gracefully

# При нажатии Ctrl+C:
🛑 Received SIGINT, shutting down gracefully...
📦 Stopping server...
✅ Server stopped
```

## Использование

### Через dev.sh (рекомендуется)

```bash
./dev.sh start development    # С graceful shutdown
./dev.sh start production     # С graceful shutdown
./dev.sh start test           # С graceful shutdown
```

### Напрямую через npm

```bash
npm run start:dev    # Development с graceful shutdown
npm run start:prod   # Production с graceful shutdown
npm run start:test   # Test с graceful shutdown
```

### Ручной запуск graceful wrapper

```bash
node scripts/graceful-server.js vite dev
node scripts/graceful-server.js vite preview --port 3001
```

## Преимущества

1. **Один Ctrl+C**: Больше не нужен второй Ctrl+C
2. **Нет ошибок**: Убраны сообщения "Command failed"
3. **Быстрое завершение**: Терминал сразу возвращается к приглашению
4. **Безопасность**: Graceful shutdown предотвращает потерю данных
5. **Consistency**: Единообразное поведение во всех режимах

## Совместимость

- ✅ **Node.js**: Работает с любой версией Node.js
- ✅ **npm/pnpm/yarn**: Совместимо со всеми пакетными менеджерами
- ✅ **Docker**: Правильно обрабатывает сигналы в контейнерах
- ✅ **CI/CD**: Корректно завершается в automated environments
- ✅ **Windows/Linux/macOS**: Кроссплатформенность

## Техническая реализация

### Обработка сигналов

```javascript
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
```

### Graceful shutdown функция

```javascript
function gracefulShutdown(signal) {
	if (isShuttingDown) {
		// Второй Ctrl+C = принудительное завершение
		process.exit(1);
	}

	isShuttingDown = true;
	childProcess.kill(signal);

	// Timeout для принудительного завершения
	setTimeout(() => {
		childProcess.kill("SIGKILL");
	}, 5000);
}
```

## Troubleshooting

### Если graceful shutdown не работает

1. Проверьте права на выполнение: `chmod +x scripts/graceful-server.js`
2. Убедитесь что Node.js доступен: `node --version`
3. Проверьте синтаксис скрипта: `node scripts/graceful-server.js --help`

### Если процесс все еще "зависает"

- Используйте двойной Ctrl+C для принудительного завершения
- Проверьте, нет ли зомби-процессов: `ps aux | grep vite`
- В крайнем случае: `pkill -f vite`

### Откат к старому поведению

Если нужно временно отключить graceful shutdown:

```json
// package.json
{
	"dev": "vite dev",
	"start": "vite preview"
}
```
