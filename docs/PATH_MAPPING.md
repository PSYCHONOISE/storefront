# Path Mapping Configuration

В проекте настроены удобные алиасы для путей, которые упрощают импорты и делают код более читаемым.

## Настроенные алиасы

| Алиас         | Путь                   | Описание                             |
| ------------- | ---------------------- | ------------------------------------ |
| `@`           | `./src`                | Корневая директория исходного кода   |
| `@lib`        | `./src/lib`            | Библиотеки и утилиты                 |
| `@components` | `./src/lib/components` | Svelte компоненты                    |
| `@stores`     | `./src/lib/stores`     | Svelte stores (состояние приложения) |
| `@gql`        | `./src/gql`            | Генерированные GraphQL типы          |
| `@graphql`    | `./src/graphql`        | GraphQL схемы и запросы              |

## Примеры использования

### До настройки path mapping:

```typescript
// Длинные относительные пути
import { cartStore } from "../../lib/stores/cart";
import ProductList from "../../lib/components/ProductList.svelte";
import type { ProductListItemFragment } from "../../gql/graphql";
import { executeGraphQL } from "../../../lib/graphql";
```

### После настройки path mapping:

```typescript
// Чистые и понятные импорты
import { cartStore } from "@stores/cart";
import ProductList from "@components/ProductList.svelte";
import type { ProductListItemFragment } from "@gql/graphql";
import { executeGraphQL } from "@lib/graphql";
```

## Конфигурационные файлы

Path mapping настроен в следующих файлах:

### 1. SvelteKit конфигурация

- `svelte.config.js`
- `svelte.config.docker.js`
- `svelte.config.local.js`

```javascript
kit: {
  alias: {
    "@": "./src",
    "@lib": "./src/lib",
    "@components": "./src/lib/components",
    "@stores": "./src/lib/stores",
    "@gql": "./src/gql",
    "@graphql": "./src/graphql",
  },
}
```

### 2. Vite конфигурация

- `vite.config.ts`

```typescript
resolve: {
  alias: {
    "@": path.resolve("./src"),
    "@lib": path.resolve("./src/lib"),
    "@components": path.resolve("./src/lib/components"),
    "@stores": path.resolve("./src/lib/stores"),
    "@gql": path.resolve("./src/gql"),
    "@graphql": path.resolve("./src/graphql"),
  },
}
```

## Преимущества

1. **Читаемость**: Импорты становятся более понятными и короткими
2. **Рефакторинг**: Легче перемещать файлы без изменения импортов
3. **Автокомплит**: IDE лучше поддерживает автодополнение
4. **Консистентность**: Единообразные импорты во всем проекте
5. **Простота**: Не нужно считать количество `../`

## Структура проекта

```
src/
├── lib/
│   ├── components/        # @components/*
│   │   ├── CartNavItem.svelte
│   │   ├── ProductList.svelte
│   │   └── ...
│   ├── stores/           # @stores/*
│   │   ├── cart.ts
│   │   ├── products.ts
│   │   └── ...
│   ├── utils/            # @lib/utils/*
│   ├── graphql.ts        # @lib/graphql
│   └── ...
├── gql/                  # @gql/*
│   └── graphql.ts        # Генерированные типы
├── graphql/              # @graphql/*
│   ├── ProductList.graphql
│   └── ...
└── routes/
    └── ...
```

## Рекомендации по использованию

1. **Используйте наиболее специфичный алиас**: `@components/Button.svelte` вместо `@lib/components/Button.svelte`
2. **Консистентность**: Используйте алиасы везде, избегайте смешивания с относительными путями
3. **Обновление**: При добавлении новых директорий рассмотрите возможность создания новых алиасов

## Добавление новых алиасов

Для добавления нового алиаса обновите конфигурацию в:

1. `svelte.config.js` (и его варианты)
2. `vite.config.ts`

Пример добавления алиаса для `@types`:

```javascript
// svelte.config.js
alias: {
  // ... существующие алиасы
  "@types": "./src/types",
}
```

```typescript
// vite.config.ts
resolve: {
  alias: {
    // ... существующие алиасы
    "@types": path.resolve("./src/types"),
  },
}
```
