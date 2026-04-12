# WordPress Performance Reference

## Core Web Vitals — Pass/Fail Thresholds

| Metric | Good | Needs Improvement | Poor | What it measures |
|--------|------|-------------------|------|-----------------|
| LCP (Largest Contentful Paint) | < 2.5s | 2.5s – 4.0s | > 4.0s | Loading — when the main content is visible |
| CLS (Cumulative Layout Shift) | < 0.1 | 0.1 – 0.25 | > 0.25 | Visual stability — do elements jump around? |
| INP (Interaction to Next Paint) | < 200ms | 200ms – 500ms | > 500ms | Responsiveness — how fast does the page react? |

INP replaced FID (First Input Delay) as a Core Web Vital in March 2024.

## TTFB Benchmarks by Hosting Tier

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

| Score | User experience | Priority |
|-------|----------------|----------|
| 90–100 | Fast | Maintain; minor optimizations only |
| 75–89 | Good | Fix the top 2–3 opportunities flagged by PageSpeed |
| 50–74 | Needs work | Systematic optimization required; likely missing page caching or large images |
| 25–49 | Poor | High user drop-off risk; multiple critical issues (server response + images + JS) |
| 0–24 | Very poor | Site is likely running without any performance optimization; start with caching and images |

Note: Managed WordPress hosts (Kinsta, WP Engine) should score 75+ with minimal optimization due to built-in caching. A score below 50 on managed hosting suggests a code-level issue (excessive queries, no image optimization, heavy plugins).

## Image Optimization

Images are typically the #1 performance bottleneck on WordPress sites.

### Size Limits

| Image role | Maximum file size | Format recommendation |
|-----------|------------------|----------------------|
| Hero / above-fold image | 150KB | WebP (AVIF for modern browsers) |
| Blog featured image | 100KB | WebP |
| Product gallery image | 80KB | WebP |
| Thumbnail | 20KB | WebP |
| Logo / SVG | 10KB | SVG preferred |
| Background video (loop) | 1MB | WebM |

### Format Strategy

Serve modern formats with fallbacks:
- **WebP** for broad compatibility (95%+ browser support)
- **AVIF** for maximum compression (growing support)
- Use a plugin like ShortPixel, Imagify, or EWWW for automatic conversion
- WordPress 6.1+ generates WebP by default if the server supports it

### Responsive Images

WordPress generates srcset automatically, but verify:
- Define custom image sizes for your theme's specific layout needs
- Set `sizes` attribute correctly (not just `100vw` for everything)
- Use `loading="lazy"` for below-the-fold images (WordPress does this by default for content images)
- Use `fetchpriority="high"` on the LCP image (hero image, above-the-fold feature image)
- Always set explicit `width` and `height` attributes to prevent CLS

**Important:** Adding `loading="lazy"` to the LCP image will **hurt** LCP. The LCP image must load eagerly with `fetchpriority="high"`:
```html
<img src="hero.webp" alt="..." width="1200" height="600" fetchpriority="high">
```

```php
// Register custom image sizes
function theme_custom_image_sizes() {
    add_image_size('hero-desktop', 1600, 900, true);
    add_image_size('hero-mobile', 800, 600, true);
    add_image_size('card-thumb', 400, 300, true);
}
add_action('after_setup_theme', 'theme_custom_image_sizes');
```

## CSS and JavaScript

### Critical CSS

Inline critical (above-the-fold) CSS and defer the rest:
- WP Rocket handles this automatically with its "Optimize CSS Delivery" option
- For manual implementation, use the Critical npm package to extract critical CSS
- Keep critical CSS under 14KB (fits in first TCP round trip)

### Script Loading

```php
function theme_enqueue_scripts() {
    // Defer non-critical JS
    wp_enqueue_script(
        'theme-scripts',
        get_stylesheet_directory_uri() . '/assets/js/main.js',
        [],
        filemtime(get_stylesheet_directory() . '/assets/js/main.js'),
        true // Load in footer
    );
}
add_action('wp_enqueue_scripts', 'theme_enqueue_scripts');

// Add defer attribute to non-critical scripts
function theme_defer_scripts($tag, $handle, $src) {
    $defer_handles = ['theme-scripts', 'contact-form-7'];
    if (in_array($handle, $defer_handles)) {
        return str_replace(' src', ' defer src', $tag);
    }
    return $tag;
}
add_filter('script_loader_tag', 'theme_defer_scripts', 10, 3);
```

### Remove Unused CSS/JS

Common sources of bloat:
- jQuery (if not needed, dequeue it on pages that don't use it)
- Block library CSS on pages not using blocks
- Plugin assets loaded globally instead of only on relevant pages

```php
// Remove block library CSS on non-block pages
function theme_remove_block_css() {
    if (!is_singular() || !has_blocks()) {
        wp_dequeue_style('wp-block-library');
        wp_dequeue_style('wp-block-library-theme');
    }
}
add_action('wp_enqueue_scripts', 'theme_remove_block_css', 100);
```

### Render-Blocking Resource Patterns

| Resource type | How to fix in WordPress |
|--------------|------------------------|
| CSS in `<head>` (critical) | Inline critical CSS (< 14KB); defer non-critical CSS |
| CSS in `<head>` (non-critical) | Use `media="print"` trick or loadCSS library |
| JavaScript without `async`/`defer` | Add `defer` to all non-critical scripts via `wp_script_add_data()` or WP Rocket settings |
| Google Fonts `<link>` in `<head>` | Self-host fonts; or use `rel="preconnect"` + `rel="stylesheet"` with `media` trick |
| External analytics (synchronous) | Load Google Analytics with `async` attribute (default in gtag.js); use WP plugin to defer |

## Font Optimization

### Self-Hosting Google Fonts

Self-hosting is faster than loading from Google's CDN (avoids extra DNS lookup and connection):

```php
// Preload the primary font
function theme_preload_fonts() {
    echo '<link rel="preload" href="' . esc_url(get_stylesheet_directory_uri()) . '/assets/fonts/dm-sans-variable.woff2" as="font" type="font/woff2" crossorigin>';
}
add_action('wp_head', 'theme_preload_fonts', 1);
```

```css
@font-face {
    font-family: 'DM Sans';
    src: url('./assets/fonts/dm-sans-variable.woff2') format('woff2');
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
}
```

### Font Loading Strategy

- Use `font-display: swap` to prevent invisible text during load
- Preload only the most critical font file (usually the body font regular weight)
- Use variable fonts to reduce total file count
- Subset fonts to include only needed character ranges (latin, latin-ext)
- Limit to 2 font families maximum

## Caching

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

```apache
# .htaccess
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/webp "access plus 1 year"
    ExpiresByType image/avif "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType font/woff2 "access plus 1 year"
</IfModule>
```

## Database Optimization

```sql
-- Remove all post revisions (back up first)
DELETE FROM wp_posts WHERE post_type = 'revision';

-- Remove expired transients
DELETE FROM wp_options WHERE option_name LIKE '%_transient_%' AND option_name LIKE '%_timeout_%' AND option_value < UNIX_TIMESTAMP();

-- Optimize autoloaded options
SELECT option_name, LENGTH(option_value) AS size 
FROM wp_options 
WHERE autoload = 'yes' 
ORDER BY size DESC 
LIMIT 20;
```

Use WP-Optimize or Advanced Database Cleaner for regular maintenance.

## Plugin Audit

### Evaluation Framework

For each installed plugin, evaluate:

1. **Is it active and doing something?** Deactivate and delete inactive plugins.
2. **Can native WordPress or theme functionality replace it?** Many plugins solve problems that theme.json, custom blocks, or a few lines of PHP can handle.
3. **What is its performance cost?** Check Query Monitor for database queries, HTTP requests, and load time impact per plugin.
4. **Is it maintained?** Check last update date, compatibility with current WP version, and support forum activity.

### Known-Heavy Plugin Overhead

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

### Lighter Alternatives

| Heavy Plugin | Lighter Alternative |
|-------------|-------------------|
| Yoast SEO (full) | Yoast SEO with unused modules disabled, or Rank Math |
| Jetpack (full suite) | Individual lightweight plugins for specific features |
| Slider Revolution | CSS-only hero sections or lightweight slider (Splide.js) |
| Visual Composer / WPBakery | Gutenberg blocks or Bricks |
| Contact Form 7 + reCAPTCHA | WPForms Lite or Fluent Forms + honeypot |

## Hosting Environment Capabilities

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

## Monitoring

Set up ongoing performance monitoring:
- **Google Search Console** for Core Web Vitals field data
- **PageSpeed Insights** for lab data checks
- **Query Monitor** plugin (dev only) for debugging slow queries and hooks
- **New Relic or Datadog** for server-side APM if hosting supports it
