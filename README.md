## jfrs Candy Admin

Lightweight admin dashboard for blog management built with Vue 3, Vite and Element Plus.

This repository contains the frontend admin panel used to manage posts, categories, tags and site settings.

### Features

- Vue 3 + Vite
- Pinia store
- Element Plus UI components
- Profile & settings pages, blog editor, dashboard and basic auth flow

---

### Quick start

1. Copy environment template and edit values as needed:

```bash
cp .env.example .env.local
# then edit .env.local
```

2. Install dependencies:

```bash
pnpm install
```

3. Start dev server:

```bash
pnpm dev
```

4. Build for production:

```bash
pnpm build
```

5. Preview production build locally:

```bash
pnpm preview
```

Notes: if you prefer npm or yarn use the equivalent commands (npm install / npm run dev / etc.).

### Environment variables

The project uses Vite and environment variables prefixed with `VITE_`. See `.env.example` for the full list. Important ones:

- `VITE_API_BASE_URL` — backend API base URL (e.g. http://localhost:3000)
- `VITE_API_TIMEOUT` — request timeout in ms
- `VITE_UPLOAD_URL` — upload endpoint base path or URL
- `VITE_APP_TITLE`, `VITE_APP_VERSION`, `VITE_APP_TECH_SUPPORT` — shown in UI

### Project structure (important folders)

- `src/api` — API wrappers
- `src/views` — page views
- `src/components` — reusable components
- `src/stores` — Pinia stores
- `src/utils` — helper utilities

### Contributing

1. Fork the repository
2. Create a feature branch: `feat/your-feature`
3. Commit and push your changes
4. Open a pull request and describe your changes

Please follow existing code styles, and add tests when appropriate.

---

### License

MIT
