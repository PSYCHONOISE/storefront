# 🚀 Руководство по развертыванию SvelteKit Storefront

## 🌐 Облачные платформы (рекомендуется)

### 1. Vercel (рекомендуется для SvelteKit)

```bash
# Установить Vercel CLI
npm i -g vercel

# Развернуть
vercel

# Настроить переменные окружения в веб-интерфейсе:
# PUBLIC_SALEOR_API_URL=https://your-saleor-instance.com/graphql/
```

**Или через веб-интерфейс:**

1. Зайдите на [vercel.com](https://vercel.com)
2. Подключите ваш GitHub репозиторий
3. Настройте Environment Variables:
   - `PUBLIC_SALEOR_API_URL`
   - `PUBLIC_STOREFRONT_URL`
4. Deploy автоматически запустится

### 2. Netlify

```bash
# Установить Netlify CLI
npm i -g netlify-cli

# Развернуть
netlify deploy --prod
```

### 3. Cloudflare Pages

1. Зайдите на [dash.cloudflare.com](https://dash.cloudflare.com)
2. Pages → Connect to Git
3. Выберите репозиторий
4. Настройки сборки:
   - Build command: `pnpm run build`
   - Build output directory: `build`

## 💻 Локальное развертывание

### Быстрый старт с Docker

```bash
# 1. Склонировать репозиторий
git clone <your-repo>
cd saleor-storefront

# 2. Настроить окружение
cp .env.example .env
# Отредактируйте .env с вашим Saleor API URL

# 3. Развернуть
./deploy.sh
```

Приложение будет доступно на http://localhost:3000

### Ручная установка

```bash
# Установить зависимости
pnpm install

# Настроить переменные окружения
cp .env.example .env
# Отредактируйте .env

# Собрать проект
pnpm run build

# Запустить в production режиме
node build
```

## 🔧 Настройка переменных окружения

### Обязательные переменные:

```bash
# .env или в настройках хостинга
PUBLIC_SALEOR_API_URL=https://your-saleor-backend.com/graphql/
PUBLIC_STOREFRONT_URL=https://your-storefront-domain.com
SALEOR_APP_TOKEN=your-saleor-app-token  # Если нужен
```

## 🔍 Проверка развертывания

### Проверить что работает:

```bash
# Проверить ответ сервера
curl http://localhost:3000

# Или в браузере:
# - http://localhost:3000 - главная страница
# - http://localhost:3000/products - каталог продуктов
# - http://localhost:3000/cart - корзина
```

### Логи Docker:

```bash
# Посмотреть статус
docker-compose -f docker-compose.prod.yml ps

# Посмотреть логи
docker-compose -f docker-compose.prod.yml logs -f

# Остановить
docker-compose -f docker-compose.prod.yml down
```

## ⚙️ Продвинутая настройка

### Nginx reverse proxy (для VPS)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### PM2 для Node.js (без Docker)

```bash
# Установить PM2
npm install -g pm2

# Создать ecosystem file
echo 'module.exports = {
  apps: [{
    name: "saleor-storefront",
    script: "build/index.js",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    }
  }]
}' > ecosystem.config.js

# Запустить
pm2 start ecosystem.config.js

# Автозапуск при перезагрузке
pm2 startup
pm2 save
```

## 🔄 Обновление

```bash
# Обновить код
git pull origin main

# Обновить browserslist
npx update-browserslist-db@latest

# Пересобрать и запустить
docker-compose -f docker-compose.prod.yml up --build -d
```

## 🔧 Исправленные проблемы

- ✅ Удалено устаревшее `version` поле в Docker Compose
- ✅ Обновлен pnpm до 10.14.0
- ✅ Обновлен Node.js до 20.x (LTS)
- ✅ Исправлен tsconfig.json для SvelteKit
- ✅ Vercel runtime ошибки исправлены
- ✅ База данных browserslist обновляется автоматически
- ✅ Husky пропускается в Docker контейнерах

## 🎆 Готовые команды

### Docker команды (с авто-определением):

| Команда       | Описание                      | npm скрипт               |
| ------------- | ----------------------------- | ------------------------ |
| `./deploy.sh` | Полное развертывание с Docker | `pnpm run docker:deploy` |
| `./status.sh` | Проверка статуса контейнера   | `pnpm run docker:status` |
| `./logs.sh`   | Просмотр логов                | `pnpm run docker:logs`   |
| `./stop.sh`   | Остановка контейнера          | `pnpm run docker:stop`   |

### Обычные команды:

| Команда            | Описание                       |
| ------------------ | ------------------------------ |
| `pnpm run dev`     | Запуск в режиме разработки     |
| `pnpm run build`   | Сборка для production          |
| `pnpm run preview` | Предпросмотр production сборки |
| `node build`       | Запуск production сервера      |

---

**✨ Готово!** Ваш Saleor Storefront на SvelteKit развернут и готов к использованию.
