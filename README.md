# PPB_MODUL5_Kelompok38

Project Pembelajaran **Praktikum Pemrograman Perangkat Bergerak (PPB) — Modul 5: React Progressive Web App (PWA) II**.

## Informasi Kelompok
- **Kelompok:** 38
- **Anggota:**
  1. Haidar Rafi Apta Priatama (21120124140107)
  2. Shofwan Thufail Akhmad (21120124130066)
  3. Josh Peter Sirait (21120124140155)
  4. Chico Diar Ramadhan (21120124140150)

---

## Fitur & Implementasi Modul 5

1. **Progressive Web App (PWA):**
   - Offline-first caching dengan `vite-plugin-pwa` dan Workbox.
   - Web App Manifest lengkap dengan ikon adaptif (192x192 & 512x512).
   - In-app install banner dan offline status notification (`PWABadge`).

2. **Integrasi RESTful API & Supabase:**
   - Client HTTP berbasis Axios dengan custom request & response interceptors (`src/config/api.js`).
   - Integrasi Supabase PostgREST table untuk produk senjata (`/rest/v1/products`).
   - Dukungan operasi CRUD lengkap: Create, Read (search, filter, sort, pagination), Update, Delete.

3. **State Management & Custom React Hooks:**
   - `useGuns`: Fetching produk, pagination, error handling, refetch callback.
   - `useFavorites`: Manajemen produk favorit secara sinkron dengan Supabase dan fallback `localStorage`.
   - `useReviews`: Mengambil dan memposting review serta rating produk.

4. **Data Persistence & Offline Drafts:**
   - Auto-save form draft dengan `localStorage` (`draftStorage.js`).
   - Profile operator & pengaturan identitas pengguna (`userService.js`).

---

## Setup & Menjalankan Proyek

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables (.env)
Pastikan file `.env` telah terisi:
```env
VITE_API_BASE_URL=https://sxunubxupdxyupnebuid.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_TXg9-r3ZVI8YZMzE90nwsQ_PU9GAmzg
```

### 3. Mode Pengembangan (Development)
```bash
npm run dev
```

### 4. Mode Produksi (Build)
```bash
npm run build
npm run preview
```

---

## Deployment ke Vercel

1. Push repository ke GitHub:
   ```bash
   git add .
   git commit -m "Implementasi Modul 5 PWA II - Kelompok 38"
   git push -u origin main
   ```
2. Buka dashboard [Vercel](https://vercel.com/) dan import repository `PPB_MODUL5_Kelompok38`.
3. Tambahkan environment variables pada Vercel Settings:
   - `VITE_API_BASE_URL`: `https://sxunubxupdxyupnebuid.supabase.co`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`: `sb_publishable_TXg9-r3ZVI8YZMzE90nwsQ_PU9GAmzg`
4. Deploy!
