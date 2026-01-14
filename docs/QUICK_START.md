# 🚀 Быстрый старт

## 📦 Команда за 30 секунд

```bash
# Клонировать, настроить и запустить
git clone <your-repo-url> && cd saleor-storefront && \
cp .env.example .env && ./dev.sh docker development
```

## 📁 Пошаговая установка

```bash
# 1. Клонировать репозиторий
git clone <your-repo-url>
cd saleor-storefront

# 2. Настроить окружение
cp .env.example .env
# Отредактируйте .env файл - укажите PUBLIC_SALEOR_API_URL
```

## 🚀 Запуск

### Вариант 1: Docker (рекомендуется)

```bash
# Авто-определение docker-compose или docker compose
./deploy.sh

# Проверить статус
./status.sh

# Посмотреть логи
./logs.sh

# Остановить
./stop.sh
```

### Вариант 2: Локально

```bash
# Установить зависимости
pnpm install

# Разработка
pnpm run dev

# Продакшен
pnpm run build
node build
```

## 🌐 Открыть приложение

Перейдите на: http://localhost:3000

## 🔧 Настройка

Отредактируйте `.env` файл:

```bash
PUBLIC_SALEOR_API_URL=https://your-saleor-backend.com/graphql/
PUBLIC_STOREFRONT_URL=http://localhost:3000
```

📝 **Подробную документацию см. в [DEPLOYMENT.md](./DEPLOYMENT.md)**

---

## ⚠️ Частые проблемы и решения

### "During SSR, Vite can't find the '@gql'"

```bash
# Автоматическое исправление после npm install
# Либо вручную:
pnpm run setup
```

### "Port 3000 already in use"

```bash
# Остановить работающие контейнеры
./dev.sh stop development

# Или использовать другой порт
PORT=3001 ./dev.sh docker development
```

📋 **Полное руководство: [DEPLOYMENT_COMPLETE.md](./DEPLOYMENT_COMPLETE.md)**
