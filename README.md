# tayfunbudak.com.tr

Ürolog Op. Dr. Tayfun Budak'ın web sitesi. WordPress'ten Astro + Cloudflare'e taşınıyor.

- Yenileme planı: [`docs/PLAN.md`](docs/PLAN.md)

## Geliştirme

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # statik çıktı: dist/
```

Site tamamen statiktir (Astro). Anasayfa bölümleri `src/components/` altında, sayfa iskeleti `src/layouts/Base.astro` içindedir. Görseller `public/img/` klasöründedir.

## Yayın (Cloudflare Workers)

Depo, Cloudflare'deki **tayfunbudak-com-tr** Worker'ına bağlıdır (Workers Builds). `wrangler.jsonc` dosyası `dist/` klasörünü statik dosya olarak yayınlar.

Cloudflare panelinde Worker > **Settings > Build** ayarları:

| Ayar | Değer |
| --- | --- |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

Workers Builds, `wrangler.jsonc` içindeki derleme ayarını uygulamaz; derleme komutu panelde girilmelidir.

## Test aşaması

Site şu an test aşamasındadır ve arama motorlarına kapalıdır. Yayına geçmeden önce şunlar kaldırılmalıdır:

- `public/_headers` içindeki `X-Robots-Tag: noindex, nofollow`
- `public/robots.txt` içindeki `Disallow: /`
- `src/layouts/Base.astro` içindeki `<meta name="robots" content="noindex, nofollow" />`

Randevu formu test sürümünde gönderim yapmaz; gönderim Cloudflare Worker + Turnstile ile eklenecektir (bkz. plan).
