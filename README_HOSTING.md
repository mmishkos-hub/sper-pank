# Инструкция по запуску Sber PWA на обычном хостинге (без Python)

## Файлы для разных типов хостинга

### 1. Apache хостинг (самый распространённый)

Используйте файл `.htaccess` в корне сайта.

**Что делает:**
- Настраивает правильные MIME-типы для webmanifest и шрифтов
- Отключает кэширование для HTML файлов и Service Worker
- Настраивает маршрутизацию SPA (/app/main → Main.htm, /app/savings → Savings.htm)
- Обрабатывает legacy-пути (Sber Main_files → Main_files)

**Установка:**
1. Скопируйте `.htaccess` в корень вашего сайта на хостинге
2. Убедитесь, что модуль `mod_rewrite` включён (обычно включён по умолчанию)
3. Все остальные файлы проекта загрузите в ту же директорию

---

### 2. Nginx хостинг

Если у вас есть доступ к конфигурации Nginx, создайте файл `nginx.conf` или добавьте в существующую конфигурацию:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/site;
    index index.html;

    # Правильные MIME-типы
    types {
        application/manifest+json webmanifest;
        font/woff2 woff2;
        font/woff woff;
    }

    # Отключение кэширования для HTML и Service Worker
    location ~* \.(htm|html)$ {
        add_header Cache-Control "no-cache";
    }

    location = /sw.js {
        add_header Cache-Control "no-cache";
        add_header Service-Worker-Allowed "/";
    }

    location ~* \.webmanifest$ {
        default_type application/manifest+json;
    }

    location ~* \.(woff2|woff)$ {
        add_header Access-Control-Allow-Origin "*";
        add_header Cache-Control "public, max-age=31536000";
    }

    # Маршрутизация SPA
    location = / {
        try_files /index.html /index.html =404;
    }

    location = /app {
        try_files /Main.htm /Main.htm =404;
    }

    location = /app/ {
        try_files /Main.htm /Main.htm =404;
    }

    location /app/main {
        try_files /Main.htm /Main.htm =404;
    }

    location /app/savings {
        try_files /Savings.htm /Savings.htm =404;
    }

    # Legacy пути
    location ^~ /Sber%20Main_files/ {
        alias /path/to/your/site/Main_files/;
    }

    location ^~ /Sber%20Savings_files/ {
        alias /path/to/your/site/Savings_files/;
    }

    # Основной обработчик для SPA
    location /app/ {
        try_files $uri $uri/ /Main.htm;
    }

    # Fallback для всех остальных запросов
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

### 3. Статический хостинг (GitHub Pages, Netlify, Vercel, Cloudflare Pages)

#### GitHub Pages
Просто загрузите все файлы в репозиторий. GitHub Pages автоматически обрабатывает SPA.

Для маршрутизации может потребоваться создать `404.html`:
```html
<!DOCTYPE html>
<script>
  sessionStorage.redirect = location.href;
  location.replace("./");
</script>
```

#### Netlify
Создайте файл `netlify.toml`:
```toml
[[redirects]]
  from = "/"
  to = "/index.html"
  status = 200

[[redirects]]
  from = "/app/*"
  to = "/Main.htm"
  status = 200

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache"
    Service-Worker-Allowed = "/"

[[headers]]
  for = "/*.webmanifest"
  [headers.values]
    Content-Type = "application/manifest+json"
```

#### Vercel
Создайте файл `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/", "destination": "/index.html" },
    { "source": "/app", "destination": "/Main.htm" },
    { "source": "/app/main", "destination": "/Main.htm" },
    { "source": "/app/savings", "destination": "/Savings.htm" },
    { "source": "/app/(.*)", "destination": "/Main.htm" }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache" },
        { "key": "Service-Worker-Allowed", "value": "/" }
      ]
    },
    {
      "source": "/(.*).webmanifest",
      "headers": [
        { "key": "Content-Type", "value": "application/manifest+json" }
      ]
    }
  ]
}
```

---

## Структура файлов

Все файлы должны быть загружены на хостинг в следующем виде:

```
/ (корень сайта)
├── .htaccess              # Для Apache
├── index.html             # Точка входа
├── Main.htm               # Основное приложение
├── Savings.htm            # Страница сбережений
├── sw.js                  # Service Worker
├── manifest.webmanifest   # PWA манифест
├── pwa-register.js        # Регистрация PWA
├── hide-balances.js       # Скрипт скрытия балансов
├── Main_files/            # Ресурсы Main.htm
├── Savings_files/         # Ресурсы Savings.htm
├── fonts/                 # Шрифты
├── local-cdn/             # Локальный CDN
├── pwa-icons/             # Иконки PWA
└── welcome-capture/       # Изображения приветствия
```

---

## Проверка работы

После загрузки файлов на хостинг:

1. Откройте ваш сайт в браузере
2. Должна произойти автоматическая переадресация на `/app/main`
3. Проверьте консоль разработчика (F12) на наличие ошибок
4. Убедитесь, что Service Worker зарегистрирован (Application → Service Workers)
5. Проверьте, что все ресурсы загружаются (нет 404 ошибок)

---

## Примечания

- **HTTPS**: Для работы Service Worker требуется HTTPS (кроме localhost)
- **Кэш**: После обновления файлов может потребоваться очистка кэша браузера
- **CORS**: Шрифты настроены с CORS заголовками для корректной загрузки

---

## Удаление Python файлов

Файлы `serve-pwa.py` и `_inspect_spa.py` больше не нужны для работы на хостинге и могут быть удалены.
