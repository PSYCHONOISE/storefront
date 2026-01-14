# Fix for dotenv-cli Production Build Error

## Проблема

При выполнении `./dev.sh start production` возникала ошибка:

```
ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL  Command "dotenv-cli" not found
Did you mean "pnpm exec dotenv"?
```

## Причина

Скрипт `scripts/build-clean.sh` использовал жестко закодированную команду `dotenv-cli`, но при работе с pnpm правильная команда может быть `dotenv` (без `-cli` суффикса). Это связано с тем, как pnpm exec работает с пакетами в devDependencies.

## Решение

Обновлен `scripts/build-clean.sh` с той же логикой детекции пакетного менеджера, что и в `dev.sh`:

1. **Детекция команды dotenv**:
   - pnpm: использует `pnpm exec dotenv`
   - npm: использует `npx dotenv-cli`

2. **Умная детекция**: Скрипт автоматически проверяет, какая команда доступна

3. **Fallback**: Если pnpm не может выполнить `dotenv`, переключается на npm

## Исправленная логика

```bash
# Проверяем, может ли pnpm выполнить dotenv
if pnpm exec dotenv --help > /dev/null 2>&1; then
    DOTENV_CMD="dotenv"  # pnpm uses 'dotenv'
else
    DOTENV_CMD="dotenv-cli"  # npm uses 'dotenv-cli'
fi
```

## Результат

Теперь все команды работают корректно:

- ✅ `./dev.sh start development`
- ✅ `./dev.sh start production`
- ✅ `./dev.sh start test`
- ✅ `npm run build:production`

## Затронутые файлы

- `scripts/build-clean.sh` - исправлена логика детекции dotenv
