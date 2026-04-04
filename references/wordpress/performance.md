# WordPress Performance Optimization

## Core Web Vitals Targets

- **LCP (Largest Contentful Paint):** < 2.5 seconds
- **CLS (Cumulative Layout Shift):** < 0.1
- **INP (Interaction to Next Paint):** < 200ms

## Image Optimization

Images are typically the #1 performance bottleneck on WordPress sites.

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

## Caching

### Page Caching

Options by hosting type:
- **Managed WP hosts** (Kinsta, WP Engine): server-level caching built in, minimal plugin config needed
- **VPS/dedicated**: use LiteSpeed Cache (if LiteSpeed server), WP Super Cache, or WP Rocket
- **Shared hosting**: WP Rocket or WP Super Cache

### Object Caching

For dynamic sites with logged-in users, database queries are the bottleneck:
- **Redis** (preferred) or **Memcached** for persistent object cache
- Most managed hosts offer one-click Redis
- Install the Redis Object Cache plugin and verify it's connected

### Browser Caching

Set appropriate cache headers:
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

## Plugin Audit Framework

For each installed plugin, evaluate:

1. **Is it active and doing something?** Deactivate and delete inactive plugins.
2. **Can native WordPress or theme functionality replace it?** Many plugins solve problems that theme.json, custom blocks, or a few lines of PHP can handle.
3. **What is its performance cost?** Check Query Monitor for database queries, HTTP requests, and load time impact per plugin.
4. **Is it maintained?** Check last update date, compatibility with current WP version, and support forum activity.

### Common Heavy Plugins and Lighter Alternatives

| Heavy Plugin | Lighter Alternative |
|-------------|-------------------|
| Yoast SEO (full) | Yoast SEO with unused modules disabled, or Rank Math |
| Jetpack (full suite) | Individual lightweight plugins for specific features |
| Slider Revolution | CSS-only hero sections or lightweight slider (Splide.js) |
| Visual Composer / WPBakery | Gutenberg blocks or Bricks |
| Contact Form 7 + reCAPTCHA | WPForms Lite or Fluent Forms + honeypot |

## Monitoring

Set up ongoing performance monitoring:
- **Google Search Console** for Core Web Vitals field data
- **PageSpeed Insights** for lab data checks
- **Query Monitor** plugin (dev only) for debugging slow queries and hooks
- **New Relic or Datadog** for server-side APM if hosting supports it