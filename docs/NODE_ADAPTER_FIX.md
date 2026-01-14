# Fix: Production Server with @sveltejs/adapter-node

## Проблема

При запуске `./dev.sh start production` возникала ошибка:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/.svelte-kit/output/server/manifest.js'
```

## Причина

Проект использует `@sveltejs/adapter-node`, который создает standalone Node.js сервер, а не статические файлы для `vite preview`.

**Неправильно было:**

- Использовать `vite preview` для production
- `vite preview` предназначен для статических сайтов (adapter-static)
- adapter-node создает сервер Node.js, который нужно запускать напрямую

## Решение

### Изменено в scripts/start-clean.sh:

**Было:**

```bash
production)
    exec npx dotenv-cli -e .env.production -- vite preview --port 3001
    ;;
```

**Стало:**

```bash
production)
    exec npx dotenv-cli -e .env.production -- node .svelte-kit/output/server/index.js
    ;;
```

### Изменено в package.json:

**Было:**

```json
{
	"start": "node scripts/graceful-server.js vite preview",
	"serve:prod": "npx dotenv-cli -e .env.production -- vite preview --port 3001"
}
```

**Стало:**

```json
{
	"start": "node .svelte-kit/output/server/index.js",
	"serve:prod": "npx dotenv-cli -e .env.production -- node .svelte-kit/output/server/index.js"
}
```

## Как это работает

### Процесс сборки и запуска:

1. **Сборка** (`npm run build:production`):

   ```bash
   vite build  # Создает .svelte-kit/output/
   ├── client/     # Статические файлы (JS, CSS)
   └── server/     # Node.js сервер
       └── index.js # Главный файл сервера
   ```

2. **Запуск production** (`./dev.sh start production`):
   ```bash
   node .svelte-kit/output/server/index.js  # Запуск Node.js сервера
   ```

### Различия между адаптерами:

| Адаптер          | Результат сборки  | Запуск production                         |
| ---------------- | ----------------- | ----------------------------------------- |
| `adapter-static` | Статические файлы | `vite preview`                            |
| `adapter-node`   | Node.js сервер    | `node .svelte-kit/output/server/index.js` |
| `adapter-vercel` | Vercel функции    | Деплой на Vercel                          |

## Переменные окружения

Порты настроены в .env файлах:

- `.env.development`: PORT=3000
- `.env.production`: PORT=3001
- `.env.test`: PORT=3002

Node.js сервер автоматически использует переменную `PORT` из окружения.

## Команды для запуска

### Через dev.sh (рекомендуется):

```bash
./dev.sh start production   # Сборка + запуск на порту 3001
./dev.sh start test         # Сборка + запуск на порту 3002
```

### Напрямую через npm:

```bash
npm run build:production    # Только сборка
npm run serve:prod         # Запуск уже собранного проекта
```

### Ручной запуск:

```bash
# После сборки:
PORT=3001 node .svelte-kit/output/server/index.js
```

## Преимущества Node.js адаптера

✅ **SSR (Server-Side Rendering)**: Рендеринг на сервере  
✅ **API routes**: Поддержка серверных эндпоинтов  
✅ **Dynamic imports**: Ленивая загрузка кода  
✅ **Environment variables**: Полная поддержка переменных окружения  
✅ **Performance**: Оптимизированный для production  
✅ **Scalability**: Можно деплоить на любой Node.js хостинг

## Диагностика проблем

### Если сервер не запускается:

1. **Проверить сборку:**

   ```bash
   ls -la .svelte-kit/output/server/index.js
   # Должен существовать файл ~120kB
   ```

2. **Проверить переменные окружения:**

   ```bash
   grep PORT .env.production
   # Должно показать: PORT=3001
   ```

3. **Запустить напрямую для отладки:**
   ```bash
   node .svelte-kit/output/server/index.js
   # Покажет подробные ошибки
   ```

### Если порт занят:

```bash
# Найти процесс на порту 3001:
lsof -ti:3001 | xargs kill -9

# Или использовать другой порт:
PORT=3005 node .svelte-kit/output/server/index.js
```

## Совместимость

- ✅ **Node.js 18+**: Полная поддержка
- ✅ **npm/pnpm/yarn**: Все пакетные менеджеры
- ✅ **Docker**: Отлично работает в контейнерах
- ✅ **PM2**: Поддержка процесс-менеджеров
- ✅ **Reverse proxy**: Nginx, Apache, Traefik
- ✅ **Cloud providers**: Heroku, DigitalOcean, AWS, GCP

## Production deployment

Для реального production развертывания:

```bash
# Сборка
npm run build:production

# Запуск с PM2
pm2 start .svelte-kit/output/server/index.js --name "saleor-storefront"

# Или с Docker
DOCKER_BUILDKIT=1 docker build -t saleor-storefront .
docker run -p 3001:3001 -e NODE_ENV=production saleor-storefront
```

---

**Итог:** Теперь production сервер запускается корректно через Node.js адаптер вместо некорректного использования `vite preview`.
