# WordPress Performance Thresholds Reference

## Core Web Vitals — Pass/Fail Thresholds

| Metric | Good | Needs Improvement | Poor | What it measures |
|--------|------|-------------------|------|-----------------|
| LCP (Largest Contentful Paint) | < 2.5s | 2.5s – 4.0s | > 4.0s | Loading — when the main content is visible |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1 – 0.25 | > 0.25 | Visual stability — do elements jump around? |
| INP (Interaction to Next Paint) | < 200ms | 200ms – 500ms | > 500ms | Responsiveness — how fast does the page react? |

INP replaced FID (First Input Delay) as a Core Web Vital in March 2024.

## TTFB Benchmarks by Hosting Tier

TTFB (Time to First Byte) measures server response time before any content reaches the browser.

| Hosting type | Good TTFB | Needs Work | Critical | Notes |
|--------------|-----------|-----------|----------|-------|
| Managed WP (WP Engine, Kinsta, Flywheel) | < 200ms | 200–500ms | > 500ms | Built-in page caching and CDN expected |
| Cloud VPS (DigitalOcean, Vultr) with page caching | < 300ms | 300–800ms | > 800ms | WP Rocket or LiteSpeed Cache needed |
| Shared hosting (SiteGround, Bluehost, Hostinger) | < 600ms | 600–1500ms | > 1500ms | Shared resources; neighbor effect possible |
| Local development (no caching) | < 100ms | 100–500ms | > 500ms | Should be near-instant; if slow, DB query issue |
| WooCommerce checkout / cart page | < 800ms | 800–1500ms | > 1500ms | Dynamic pages bypass most caches |

## Page Weight Budgets by Site Type

| Site type | Ideal total size | Maximum before alert | Primary culprits |
|-----------|-----------------|---------------------|-----------------|
| Marketing landing page | < 500KB | 1.5MB | Hero image, unoptimized fonts, multiple JS bundles |
| Blog post | < 600KB | 1.5MB | Featured image, commenting plugin JS, social share widgets |
| WooCommerce product page | < 800KB | 2.5MB | Product gallery images, WooCommerce scripts, cross-sell widgets |
| WooCommerce category page | < 1MB | 3MB | Multiple product thumbnails |
| Homepage (block theme, no page builder) | < 600KB | 1.5MB | Multiple hero sections, video embeds |
| Homepage (Elementor/Bricks) | < 800KB | 2MB | Page builder CSS/JS overhead ~150–300KB |

## PageSpeed Score Interpretation

PageSpeed scores are 0–100 based on lab data (simulated mobile network, Moto G Power device).

| Score | User experience | Priority |
|-------|----------------|----------|
| 90–100 | Fast | Maintain; minor optimizations only |
| 75–89 | Good | Fix the top 2–3 opportunities flagged by PageSpeed |
| 50–74 | Needs work | Systematic optimization required; likely missing page caching or large images |
| 25–49 | Poor | High user drop-off risk; multiple critical issues (server response + images + JS) |
| 0–24 | Very poor | Site is likely running without any performance optimization; start with caching and images |

Note: Managed WordPress hosts (Kinsta, WP Engine) should score 75+ with minimal optimization due to built-in caching. A score below 50 on managed hosting suggests a code-level issue (excessive queries, no image optimization, heavy plugins).

## Caching Layer Hierarchy

WordPress performance depends on four caching layers, from fastest (closest to user) to slowest (closest to database):

### Layer 1: CDN (Content Delivery Network)
- **What it caches**: Static assets (images, CSS, JS, fonts), and optionally full HTML pages
- **Typical TTFB reduction**: 50–80% for global users
- **WordPress implementation**: Cloudflare (free tier works), BunnyCDN, Kinsta CDN (built-in), KeyCDN
- **When absent**: All requests hit the origin server, regardless of user location

### Layer 2: Page Cache
- **What it caches**: Full rendered HTML of pages — the single biggest performance win for most WordPress sites
- **Typical TTFB reduction**: 80–95% (from 1–3s to 50–200ms)
- **WordPress implementation**: WP Rocket, LiteSpeed Cache (requires LiteSpeed server), W3 Total Cache (page cache module), SG Optimizer (SiteGround only)
- **When absent**: Every request runs PHP and MySQL, even for static blog posts

### Layer 3: Object Cache
- **What it caches**: Database query results, transients, user sessions in memory (Redis or Memcached)
- **Typical query reduction**: 30–70% fewer database queries on dynamic pages
- **WordPress implementation**: Redis Object Cache plugin (connects to Redis server), built-in on Kinsta/WP Engine
- **When absent**: Every WP_Query runs a fresh database query; especially painful on WooCommerce and membership sites

### Layer 4: Browser Cache
- **What it caches**: Static assets in the user's browser (CSS, JS, images, fonts)
- **Typical impact**: Repeat visitors load pages 3–10x faster
- **WordPress implementation**: Set via `.htaccess` `Cache-Control` headers, or via WP Rocket / Autoptimize
- **When absent**: Browser re-downloads all assets on every page load; no benefit for repeat visitors

## Known-Heavy Plugin Overhead

| Plugin | Typical queries/page | Memory overhead | Notes |
|--------|---------------------|-----------------|-------|
| WooCommerce (basic shop) | +40–80 queries | +15–25MB | Cart/session checks on every page |
| WooCommerce + Product Add-ons | +80–120 queries | +30MB | Significant on category pages |
| Elementor (many widgets) | +10–20 queries | +20–30MB | Inline CSS per-widget adds DOM bloat |
| WPML (3+ languages) | +20–40 queries | +15MB | Multiplies query count with language joins |
| Yoast SEO (large site, XML sitemap) | +5–10 queries | +10MB | Sitemap generation cached; not per-request |
| LearnDash | +30–60 queries | +20MB | Course/lesson access checks on every page |
| WP Rocket | -30–70% queries | +5MB | Reduces total queries via caching — net positive |
| Query Monitor (active on live site) | +5–10 queries | +5MB | Should be deactivated on production |
| Gravity Forms + many forms | +10–20 queries | +10MB | Entry storage and conditional logic |
| WPML + WooCommerce | +60–140 queries | +40MB | Combined overhead; consider dedicated server |

## Image Optimization Thresholds

### When is a single image "too large"?

| Image role | Maximum file size | Format recommendation |
|-----------|------------------|----------------------|
| Hero / above-fold image | 150KB | WebP (AVIF for modern browsers) |
| Blog featured image | 100KB | WebP |
| Product gallery image | 80KB | WebP |
| Thumbnail | 20KB | WebP |
| Logo / SVG | 10KB | SVG preferred |
| Background video (loop) | 1MB | WebM |

### `loading="lazy"` important caveat

Adding `loading="lazy"` to the LCP (Largest Contentful Paint) image will **hurt** LCP, not help it. The LCP image must load eagerly (no lazy loading) and should have `fetchpriority="high"`.

Correct LCP image tag:
```html
<img src="hero.webp" alt="..." width="1200" height="600" fetchpriority="high">
```

### Responsive image sizes

WordPress automatically generates multiple sizes. The `sizes` and `srcset` attributes tell the browser which size to download based on viewport:
```html
<img srcset="image-400.webp 400w, image-800.webp 800w, image-1200.webp 1200w"
     sizes="(max-width: 768px) 100vw, 800px"
     src="image-800.webp" alt="...">
```

## Render-Blocking Resource Patterns

Resources that block the browser from painting anything until they finish downloading:

| Resource type | How to fix in WordPress |
|--------------|------------------------|
| CSS in `<head>` (critical) | Inline critical CSS (< 14KB); defer non-critical CSS |
| CSS in `<head>` (non-critical) | Use `media="print"` trick or loadCSS library |
| JavaScript without `async`/`defer` | Add `defer` to all non-critical scripts via `wp_script_add_data()` or WP Rocket settings |
| Google Fonts `<link>` in `<head>` | Self-host fonts; or use `rel="preconnect"` + `rel="stylesheet"` with `media` trick |
| External analytics (synchronous) | Load Google Analytics with `async` attribute (default in gtag.js); use WP plugin to defer |

## Hosting Environment Performance Capabilities

| Feature | Shared | Cloud VPS | Managed WP |
|---------|--------|-----------|-----------|
| Page caching | Plugin required | Plugin required | Built-in |
| Object caching (Redis) | Rarely available | Manual setup | Built-in (Kinsta/WP Engine) |
| CDN | Not included | Manual setup | Often included |
| PHP-FPM | Usually not | Configurable | Yes |
| HTTP/2 or HTTP/3 | Varies | Configurable | Yes |
| OPcache | Usually enabled | Configurable | Yes |
| Gzip/Brotli compression | Usually enabled | Configurable | Yes |
| Slow query log | No | Yes (MySQL config) | Via dashboard (WP Engine/Kinsta) |
