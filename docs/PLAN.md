# tayfunbudak.com.tr — Yenileme Planı

> Durum: **Planlama** · Son güncelleme: 2026-11-05

WordPress üzerindeki mevcut siteyi, hızlı, güvenli ve bakımı kolay, modern bir statik siteye taşıma planı.

---

## 1. Mevcut durum (envanter)

| Konu | Bulgu |
|---|---|
| Altyapı | WordPress + **The7** teması, Slider Revolution, WPML (5 dil), Yoast SEO Premium **v13.1** (çok eski), Jetpack, Contact Form 7 + WPForms, SG Optimizer / SG Security, Google Site Kit |
| Hosting / DNS / E-posta | Üçü de **SiteGround**'da (NS: `ns1/ns2.siteground.net`, MX: `mx10/20/30.antispam.mailspamprotection.com`) |
| İçerik (TR) | 19 sayfa, 2 blog yazısı, 76 medya (73 görsel, 3 dosya, çoğu 2019–2021 tarihli) |
| İçerik (EN/DE/AR/RU) | Her dilde 17 sayfa + 1 yazı |
| Analitik | Universal Analytics `UA-42266774-1` (Google 2023'te kapattı, **çalışmıyor**) + GA4 etiketi `GT-KVMBZW` |
| Logo | `YeniLogo.png` (1754×560). Renkleri **lacivert `#201444`** ve **bordo `#ac1f2d`**. Tema mavisi `#00569f` logoyla uyumsuz |

**Mevcut sitede tespit edilen sorunlar** (yeni sitede düzelecek):
- Yoast'ın ürettiği canonical adresi bozuk (`http://https%3A%2F%2Ftayfunbudak.com.tr%2Fblog%2F`). Bu, arama motorlarına yanlış adres bildiriyor.
- `user-scalable=0` mobilde yakınlaştırmayı engelliyor. Erişilebilirlik açısından sorunlu.
- Kapanmış UA etiketi hâlâ yükleniyor, ağır eklentiler sayfayı yavaşlatıyor.
- BPH sayfasının adresi anlamsız: `/prostat/prostat-2/`.

---

## 2. Alınan kararlar

| Konu | Karar |
|---|---|
| Altyapı | **Astro**. Statik site, içerik Markdown dosyalarında, yönetim paneli yok. Güncellemeler git üzerinden yapılır (Cenk ya da Claude) |
| Hosting | **Cloudflare** (ücretsiz). Cloudflare'in yeni projeler için önerdiği **Workers Static Assets** kullanılır (Pages'in yerini alan, aynı ücretsiz yapı). GitHub'a her push'ta otomatik yayın (Workers Builds), her branch için önizleme adresi |
| E-posta | **SiteGround'da kalır**. DNS Cloudflare'e taşınır, posta kayıtları (MX/SPF/DKIM/DMARC) birebir kopyalanır |
| Diller | **TR (varsayılan) + EN**. DE/AR/RU sayfaları 301 ile EN karşılıklarına yönlendirilir |
| Tasarım | **Mevcut logo korunur**. 3–4 profesyonel anasayfa alternatifi hazırlanır, biri seçilir |
| İçerik | **Düzenleyerek taşıma**. Tıbbi içerik aynı kalır; yapı, okunabilirlik ve SEO iyileştirilir. Değişiklikleri Dr. Budak onaylar |
| Hasta görüşleri | **Kaldırılır**, yerine DoktorTakvimi / Google değerlendirmelerine link konur (sağlık tanıtım yönetmeliği) |
| Özellikler | WhatsApp + tıkla-ara, online randevu, iletişim formu + harita, blog, SSS, YouTube videoları |

---

## 3. Teknik mimari

```
GitHub (erceko/tayfunbudak.com.tr)
   │  push
   ▼
Cloudflare Workers (Static Assets) ──► statik HTML/CSS (Astro build)
   │
   ├─ /api/contact   → küçük Worker betiği: Turnstile doğrulama → e-posta gönderimi (Resend)
   ├─ _redirects     → eski WP adresleri için 301 yönlendirmeleri
   └─ Cloudflare DNS → site: Worker (Custom Domain) · MX/SPF/DKIM: SiteGround (değişmez)
```

- **Framework:** Astro (güncel kararlı sürüm), TypeScript, Tailwind CSS.
- **İçerik:** Astro Content Collections, şemalı Markdown/MDX (`src/content/{sayfalar,hastaliklar,blog,sss}/{tr,en}/…`). Başlık, açıklama ve tarih alanları şemayla doğrulanır; eksik alan olursa build hata verir.
- **Çoklu dil:** Astro i18n. TR önek almaz (`/prostat/`), EN `/en/` altında (`/en/prostate/`). Her sayfada `hreflang` etiketleri ve dil değiştirici bulunur.
- **Görseller:** `astro:assets` ile otomatik AVIF/WebP ve boyutlandırma, lazy-load.
- **İletişim / randevu formu:** Cloudflare Worker (`/api/contact`) + **Turnstile** (görünmez spam koruması). Mesajlar **Resend** üzerinden gönderilir; ayrı bir alt alan adı (`send.tayfunbudak.com.tr`) kullanıldığı için SiteGround e-postasına dokunulmaz. Formda KVKK aydınlatma metni onay kutusu yer alır.
- **Randevu:** DoktorTakvimi profiline/widget'ına yönlendirme + kendi "randevu talep" formumuz (aynı Worker).
- **WhatsApp / Ara:** Mobilde ekranın altına sabit iki buton: `wa.me/90…` ve `tel:`. Masaüstünde başlıkta yer alır.
- **Harita:** Google Maps, "tıkla-yükle" yöntemiyle eklenir: önce statik önizleme görünür, harita tıklanınca yüklenir. Böylece sayfa hızlı kalır ve izinsiz çerez bırakılmaz. Yanında "Yol tarifi al" linki olur.
- **YouTube:** `lite-youtube` yöntemi. Video yalnızca tıklanınca yüklenir.
- **Analitik:** Varsayılan olarak **Cloudflare Web Analytics** (çerezsiz, çerez banner'ı gerektirmez). GA4 istenirse çerez onayıyla eklenir *(açık soru, bkz. §9)*.
- **SEO:** Sayfa bazında title/description, otomatik `sitemap.xml`, `robots.txt`, Open Graph görselleri. JSON-LD şemaları: `Physician`, `MedicalClinic`, `MedicalWebPage`, `FAQPage`, `BreadcrumbList`, `Article`.
- **Kalite hedefleri:** Lighthouse'ta dört kategoride de 95+, WCAG 2.1 AA, sayfa başına < 100 KB JS (hedef ≈ 0 KB).

---

## 4. Yeni site haritası ve URL'ler

**İlke:** Türkçe URL'ler **aynen korunur**. Böylece Google sıralamaları kaybolmaz. Değişen tüm adresler 301 ile yeni adrese yönlendirilir.

| Sayfa | TR URL | EN URL |
|---|---|---|
| Anasayfa | `/` | `/en/` |
| Özgeçmiş | `/ozgecmis/` | `/en/resume/` |
| Hastalıklar (yeni özet sayfası) | `/hastaliklar/` | `/en/conditions/` |
| Erektil Disfonksiyon | `/erektil-disfonksiyon-ed/` | `/en/erectile-dysfunction-ed/` |
| ED1000 | `/ed1000/` | `/en/ed1000/` |
| İdrar Yolu Taşları | `/idrar-yolu-taslari/` | `/en/urinary-tract-stones/` |
| Mesane | `/mesane/` | `/en/bladder/` |
| Prostat | `/prostat/` | `/en/prostate/` ⟵ `/en/prostate-2/prostate/` |
| BPH | `/prostat/bph-iyi-huylu-prostat-buyumesi/` ⟵ `/prostat/prostat-2/` | `/en/prostate/bph/` |
| Prostat Kanseri | `/prostat-kanseri/` | `/en/prostate-cancer/` *(yeni çeviri)* |
| Prostat Biyopsisi | `/prostat-biyopsisi/` | `/en/prostate-biopsy/` |
| Varikosel | `/varikosel/` | `/en/varicocele/` |
| Vazektomi | `/vazektomi-erkek-dogum-kontrol-yontemi/` | `/en/vasectomy-male-contraception/` |
| Sünnet | `/sunnet/` | `/en/circumcision/` |
| Kondilom | `/kondilom/` | `/en/condyloma/` |
| Blog | `/blog/` | `/en/blog/` |
| Blog yazıları | `/sunnetblog/`, `/ilginc-vakalar-serisi-1/` (kökte kalır) | `/en/everything-you-want-to-know-about-circumcision/` |
| SSS (yeni) | `/sss/` | `/en/faq/` |
| İletişim & Randevu (yeni) | `/iletisim/` | `/en/contact/` |
| KVKK metinleri | `/aydinlatma-metni/`, `/kisisel-verilerin-islenmesi-ve-korunmasi-politikasi/`, `/cerez-politikasi/`, `/acik-riza-metni/` | mevcut EN slug'ları |

**Yönlendirmeler (`_redirects`):**
- Tüm `/de/…`, `/ar/…`, `/ru/…` adresleri (her dilde 18 adres) EN karşılığına 301 ile yönlenir.
- `/prostat/prostat-2/` ve `/en/prostate-2/prostate/` yeni adreslerine yönlenir.
- `www.` adresi kök alan adına, `http` adresleri `https`'e yönlenir.
- WP artıkları: `/feed/`, `/wp-admin/`, `/?p=…`, `/wp-content/uploads/…` görselleri (önemli olanlar yeni adresine, diğerleri 410).
- Tam liste, WP REST API'den script ile otomatik üretilir ve testle doğrulanır.

---

## 5. Tasarım

**Logo:** Mevcut logo korunur ve vektöre (SVG) çevrilir. Orijinal vektör dosyası varsa o kullanılır. Marka renkleri logodan alınır: lacivert `#201444` + bordo `#ac1f2d`.

**3–4 anasayfa alternatifi** (masaüstü + mobil, tarayıcıda gezilebilir canlı önizleme):

| | Yön | Karakter |
|---|---|---|
| **A** | *Klinik Ferah* | Beyaz zemin, bol boşluk, lacivert metin, bordo yalnızca vurgu ve butonlarda. Sade sans-serif yazı tipi. Sakin ve güven veren bir görünüm |
| **B** | *Deneyim & Prestij* | Lacivert ağırlıklı bölümler, serif başlıklar, 30+ yıllık deneyimi öne çıkaran zaman çizelgesi. Nişantaşı muayenehanesine yakışan butik bir his |
| **C** | *Modern Medikal* | Yumuşak gri-mavi tonlar, yuvarlatılmış kartlar, ikonlu "Hastalıklar" ızgarası, belirgin randevu çağrısı. Mobil öncelikli tasarım |
| **D** | *Bilgi Rehberi* | İçerik öncelikli, dergi tarzı tipografi. Blog, SSS ve "hangi belirtide ne yapmalı" rehberleri ön planda. SEO'ya en güçlü katkıyı yapan seçenek |

Akış: 4 anasayfa önizlemesi → seçim / karma → iç sayfa şablonları (hastalık sayfası, özgeçmiş, blog, iletişim) → onay.

**Ortak bileşenler:** başlık + dil değiştirici, mobil alt bar (WhatsApp/Ara/Randevu), hastalık kartları, "Belirtiler / Tanı / Tedavi / SSS" sayfa şablonu, CTA bandı, adres + harita bloğu, footer (KVKK linkleri, sosyal medya, DoktorTakvimi).

**Hero için alınan kararlar** (tasarım turlarında netleşti):
- **Fotoğraf:** mevcut sitedeki gibi mavi-lacivert tonlu ameliyathane fonunda, siyah formalı fotoğraf. Takım elbiseli portre ve muayenehane fotoğrafı hero'da kullanılmaz.
- **Logo:** her zaman renkli sürüm. Bu yüzden başlık şeridi açık renkli (beyaz) olur; beyaz logo kullanılmaz.
- **Motto:** "Önce zarar verme." hero'da yer almaz. Doktor için önemli olduğundan sitenin başka bir yerinde (ör. Özgeçmiş) Latincesiyle birlikte kullanılabilir.
- **Yazı tipi:** yalnızca sans-serif.
- **ED1000** en önemli hizmet olarak hero'da ya da hemen altında öne çıkarılır.
- **Sağlık Turizmi Yetki Belgesi** hiçbir yerde kullanılmaz (bkz. §9).

---

## 6. İçerik düzenleme kuralları

1. **Tıbbi içerik değişmez.** Sadece yapı, dil ve biçim iyileştirilir. Her değişiklik, Dr. Budak'ın onayı için önce/sonra karşılaştırmasıyla sunulur.
2. Her hastalık sayfası aynı iskelete oturtulur: *Nedir? → Belirtiler → Tanı → Tedavi seçenekleri → Sık sorulan sorular → Randevu çağrısı*. Paragraflar kısa tutulur, başlık hiyerarşisi (H1/H2/H3) doğru kurulur, sayfalar arasına iç linkler eklenir.
3. Her sayfaya özgün meta açıklama ve sosyal medya paylaşım görseli hazırlanır.
4. **Sağlık tanıtım yönetmeliğine uyum:** hasta yorumu, önce/sonra görseli, "en iyi", "garantili", "%100" gibi kesin sonuç vaatleri kullanılmaz. ED1000 seans/sonuç ifadeleri ölçülü tutulur. Yayından önce bir hukukçunun göz atması önerilir.
5. **Özgeçmiş** okunaklı bir zaman çizelgesine dönüşür (Kabataş Erkek Lisesi → Cerrahpaşa → Budapeşte → Taksim EAH → …).
6. **EN çeviriler** gözden geçirilir; makine çevirisi izlenimi veren kısımlar düzeltilir. "Prostat Kanseri" sayfası EN'e yeni çevrilir.
7. **KVKK metinleri** aynen taşınır; yalnızca yeni altyapıyla değişen kısımlar güncellenir (çerez kullanımı, form işleme, Cloudflare/Resend alt işleyenleri).

---

## 7. Yayına geçiş — kesintisiz ve e-posta bozulmadan

1. **Yedek:** SiteGround'dan tam site yedeği (dosyalar + veritabanı) ve **DNS zone dışa aktarımı** alınır.
2. **Cloudflare:** Domain Cloudflare'e eklenir (Free plan). Cloudflare'in otomatik taradığı kayıtlar, SiteGround zone dosyasıyla **satır satır** karşılaştırılır: MX, SPF, **DKIM** (`default._domainkey`), DMARC, `mail.`/`webmail.` kayıtları. Posta kayıtları "DNS only" (gri bulut) olarak ayarlanır.
3. **Test:** Site, `*.workers.dev` önizleme adresinde uçtan uca test edilir (form, yönlendirmeler, mobil, Lighthouse).
4. **Geçiş:** Domain kayıt firmasının panelinde nameserver'lar SiteGround'dan Cloudflare'e çevrilir. Worker'a alan adı (Custom Domain) bağlanır, SSL otomatik oluşur.
5. **Doğrulama:** E-posta gönderme/alma, iletişim formu ve tüm eski URL'lerin 301 kontrolü (script) yapılır. Search Console'a yeni `sitemap.xml` gönderilir.
6. **Geri dönüş planı:** Sorun çıkarsa nameserver'lar SiteGround'a geri çevrilir. WP sitesi bu sürede silinmez, sadece arka planda kalır.
7. **Kapanış (2–4 hafta sonra):** WordPress SiteGround'dan kaldırılır (e-posta hesabı devam eder). Search Console'daki hata raporları izlenir.

---

## 8. Fazlar

| Faz | İş | Çıktı |
|---|---|---|
| **0 — Planlama** | Envanter, kararlar, bu doküman | `docs/PLAN.md` ✅ |
| **1 — Tasarım** | Logonun SVG'ye çevrilmesi, 4 anasayfa alternatifi → seçim → iç sayfa şablonları | Canlı önizlemeler |
| **2 — Altyapı** | Astro iskeleti, i18n, layout ve bileşenler, Cloudflare Workers Builds bağlantısı | Önizleme adresi |
| **3 — İçerik göçü** | WP REST API → Markdown dönüştürme scripti, görsel optimizasyonu, düzenleme + Dr. Budak onayı | `src/content/**` |
| **4 — Özellikler** | Form + Turnstile, randevu, WhatsApp/ara, harita, SSS, YouTube, SEO/JSON-LD, `_redirects` | — |
| **5 — Kalite kontrol** | Lighthouse, erişilebilirlik, mobil cihaz testleri, kırık link ve yönlendirme testleri | Test raporu |
| **6 — Yayın** | DNS geçişi (§7), izleme, WP'nin kaldırılması | Canlı site |

---

## 9. Açık konular / ihtiyaç listesi

- [ ] Logonun **orijinal vektör dosyası** (AI / EPS / SVG / PDF) var mı? Yoksa PNG'den SVG'ye çevirilecek.
- [ ] **WhatsApp numarası** teyidi (0530 661 90 00 mı?) ve form mesajlarının **gideceği e-posta adresi**.
- [ ] Domain'in **kayıtlı olduğu firma** (.com.tr). Nameserver değişikliği orada yapılacak.
- [ ] **Cloudflare hesabı** (yoksa açılması) ve GitHub repo'suna (Workers Builds) bağlanması.
- [ ] SiteGround'dan **DNS zone dışa aktarımı** ve tam yedek.
- [ ] **Güncel fotoğraflar:** Dr. Budak portresi (profesyonel çekim varsa), muayenehane iç/dış mekan. Mevcut fotoğraflar 2019 tarihli.
- [ ] **DoktorTakvimi:** profilde online randevu açık mı, gömülebilir widget var mı?
- [ ] Sitede gösterilecek **YouTube videoları**.
- [ ] **SSS** için Dr. Budak'ın en sık duyduğu sorular. Yoksa taslağı Claude hazırlar, Dr. Budak onaylar.
- [ ] **Analitik:** çerezsiz Cloudflare Web Analytics yeterli mi, yoksa GA4'e (çerez onayıyla) devam mı?
- [x] Anasayfadaki **"Sağlık Turizmi" logosu** yeni sitede kalacak mı? **Hayır.** Sağlık Turizmi Yetki Belgesi (logo, belge görseli, ST-2999 numarası, "Uluslararası hastalar" bölümü ve ilgili SSS sorusu) yeni sitenin hiçbir yerinde kullanılmayacak.

---

## 10. Riskler

| Risk | Önlem |
|---|---|
| DNS taşınırken e-postanın kesilmesi | Zone dosyasıyla satır satır karşılaştırma, posta kayıtları "DNS only", geçiş sonrası gönderme/alma testi |
| SEO kaybı | Aynı alan adı, aynı TR URL'leri, eksiksiz 301 haritası, Search Console takibi |
| Mevzuat (sağlık tanıtımı / KVKK) | Hasta yorumu yok, ölçülü dil, KVKK metinlerinin güncellenmesi, hukukçu kontrolü önerisi |
| Panelsiz yapıda içerik güncelleme zorluğu | İçerik düz Markdown dosyalarında durur. İleride gerekirse Astro'ya sonradan bir panel (Keystatic) eklenebilir |
