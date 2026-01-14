# Type Safety Improvements: noUncheckedIndexedAccess

## Что добавлено

Включена опция `"noUncheckedIndexedAccess": true` в `tsconfig.json` для повышения безопасности типов.

### Что делает эта опция?

`noUncheckedIndexedAccess` заставляет TypeScript рассматривать все обращения к элементам массивов и свойствам объектов как потенциально `undefined`, что предотвращает runtime ошибки.

**Без noUncheckedIndexedAccess:**

```typescript
const arr = ["hello", "world"];
const item = arr[5]; // TypeScript думает, что это string
console.log(item.toUpperCase()); // Runtime ошибка!
```

**С noUncheckedIndexedAccess:**

```typescript
const arr = ["hello", "world"];
const item = arr[5]; // TypeScript знает, что это string | undefined
console.log(item?.toUpperCase()); // Безопасно!
```

## Исправленные места в коде

### 1. Обработка GraphQL ошибок

**Было:**

```typescript
if (result.checkoutLinesAdd?.errors?.length) {
	throw new Error(result.checkoutLinesAdd.errors[0].message || "Failed to add item");
}
```

**Стало:**

```typescript
if (result.checkoutLinesAdd?.errors?.length) {
	const firstError = result.checkoutLinesAdd.errors[0];
	throw new Error(firstError?.message || "Failed to add item");
}
```

### 2. Выбор вариантов продукта

**Было:**

```typescript
const selectedVariant = $derived(
	selectedVariantId
		? product?.variants?.find((v: any) => v.id === selectedVariantId)
		: product?.variants?.[0],
);
```

**Стало:**

```typescript
const selectedVariant = $derived(
	selectedVariantId
		? product?.variants?.find((v: any) => v.id === selectedVariantId)
		: (product?.variants?.[0] ?? undefined),
);
```

### 3. Проверки первого варианта

**Было:**

```typescript
checked={selectedVariantId === variant.id ||
    (!selectedVariantId && variant === product.variants[0])}
```

**Стало:**

```typescript
checked={selectedVariantId === variant.id ||
    (!selectedVariantId && product.variants?.[0] && variant === product.variants[0])}
```

### 4. Обработка ошибок GraphQL

**Было:**

```typescript
const message = errorResponse.errors.map((error) => error.message).join("\n");
```

**Стало:**

```typescript
const message = errorResponse.errors.map((error) => error.message).join("\n") || "Unknown GraphQL error";
```

## Преимущества

### ✅ Предотвращение runtime ошибок

- Нет больше `Cannot read property 'X' of undefined`
- Нет больше `Cannot read property 'X' of null`
- Нет больше неожиданных `undefined` значений

### ✅ Лучшая надежность

- Код теперь явно обрабатывает случаи отсутствия данных
- Меньше неожиданных крашей в production
- Более предсказуемое поведение приложения

### ✅ Улучшенная читаемость

- Явно видно, где данные могут отсутствовать
- Принудительная обработка edge cases
- Самодокументируемый код

### ✅ Соответствие best practices

- Следование строгим стандартам TypeScript
- Современный подход к type safety
- Готовность к будущим версиям TypeScript

## Типичные паттерны исправлений

### Прямое обращение к массиву

```typescript
// ❌ Небезопасно
const first = items[0];

// ✅ Безопасно
const first = items[0]; // TypeScript теперь знает что это T | undefined
if (first) {
	// Используем first
}

// ✅ Или с optional chaining
const name = items[0]?.name;
```

### Деструктуризация массивов

```typescript
// ❌ Небезопасно
const [first, second] = items;

// ✅ Безопасно
const [first, second] = items;
if (first && second) {
	// Используем first и second
}
```

### Вычисляемые свойства объектов

```typescript
// ❌ Небезопасно
const value = obj[key];

// ✅ Безопасно
const value = obj[key]; // TypeScript знает что это T | undefined
if (value !== undefined) {
	// Используем value
}
```

### Методы массивов с обращением к индексам

```typescript
// ❌ Небезопасно
const sorted = items.sort()[0];

// ✅ Безопасно
const sortedItems = items.sort();
const first = sortedItems[0];
if (first) {
	// Используем first
}
```

## Миграция существующего кода

При включении `noUncheckedIndexedAccess` в существующем проекте:

1. **Запустите type checker:**

   ```bash
   npm run check
   ```

2. **Исправьте ошибки по шаблону:**
   - Добавьте проверки на `undefined`
   - Используйте optional chaining `?.`
   - Добавьте fallback значения с `??`
   - Добавьте guard clauses с `if`

3. **Протестируйте изменения:**
   ```bash
   npm run build
   npm test
   ```

## Влияние на производительность

- **Compile time:** Незначительное увеличение времени компиляции
- **Runtime:** Нет влияния на производительность
- **Bundle size:** Нет влияния на размер бандла
- **Development:** Более безопасная разработка с меньшим количеством bugs

## Конфигурация

```json
// tsconfig.json
{
	"compilerOptions": {
		"strict": true,
		"noUncheckedIndexedAccess": true // ← Добавлено
	}
}
```

## Совместимость

- ✅ **TypeScript 4.1+:** Полная поддержка
- ✅ **SvelteKit:** Полная совместимость
- ✅ **Vite:** Работает без проблем
- ✅ **Существующий код:** Требует миграции
- ✅ **Библиотеки:** Не влияет на внешние библиотеки

## Заключение

Включение `noUncheckedIndexedAccess` значительно повышает type safety проекта с минимальными затратами на рефакторинг. Это современный стандарт для TypeScript проектов и рекомендуется для всех новых проектов.
