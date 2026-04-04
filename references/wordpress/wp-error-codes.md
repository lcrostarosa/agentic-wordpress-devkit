# WordPress Error Codes Reference

## HTTP Status Codes (WordPress-Specific Context)

| Code | WordPress Context | Common Cause | Triage Category |
|------|------------------|--------------|-----------------|
| 500 | Internal Server Error | PHP fatal error, plugin conflict, exhausted memory | backend |
| 503 | Service Unavailable | WP Engine/Kinsta health check failure, maintenance mode, shared hosting CPU throttle | backend |
| 403 | Forbidden | Incorrect file permissions, security plugin blocking request, .htaccess rules | backend |
| 404 | Not Found | Permalink structure flushed, post deleted, custom post type not registered | backend |
| 301/302 | Redirect | `siteurl`/`home` option mismatch, SSL plugin, wp-config.php forced redirect | backend |
| 429 | Too Many Requests | Rate limiting from security plugin or CDN (Cloudflare) | backend |

## PHP Error Levels

| Level | Site Impact | Debug mode needed? |
|-------|-------------|-------------------|
| Fatal Error | Site completely inaccessible (WSOD) | Not always — sometimes shown directly |
| Parse Error | Same as Fatal — syntax error in PHP file | No |
| Critical Error | WordPress core wrapper for Fatal errors (WP 5.2+) | No — shown as admin email notice |
| Warning | Site accessible but behavior may be wrong | Yes (WP_DEBUG = true) |
| Notice | Informational — rarely affects functionality | Yes |
| Deprecated | Using removed PHP/WP function — future compatibility risk | Yes |

## PHP Error Message → Cause Mapping

| Error pattern | Root cause | Implicated component |
|---------------|-----------|---------------------|
| `Fatal error: Call to undefined function wp_...()` | WordPress not fully loaded; direct PHP file access or mu-plugin load order issue | Plugin loading order or standalone script |
| `Fatal error: Cannot redeclare [function_name]()` | Two plugins/themes define the same function | Extract both file paths from stack trace |
| `Fatal error: Allowed memory size of ... exhausted` | PHP memory limit hit | Usually WooCommerce + heavy plugins; check `php.ini` or `wp-config.php` `WP_MEMORY_LIMIT` |
| `Fatal error: Maximum execution time of ... seconds exceeded` | Slow loop, slow query, or large import | Database query, cron job, or import plugin |
| `Fatal error: Class '...' not found` | Plugin dependency not loaded; autoloader failed | Check if required plugin is activated |
| `Parse error: syntax error, unexpected ...` | PHP syntax error in plugin/theme file — often from PHP version incompatibility | Check PHP version; plugin may require older PHP |
| `Warning: include_once(...): failed to open stream` | Plugin referencing a file that no longer exists after an update | Check `plugin_or_theme_implicated` from file path |
| `Warning: Cannot modify header information - headers already sent` | Output (whitespace or echo) before `wp_head()` — common in poorly coded plugins | Check line/file from error for premature output |
| `Fatal error: Uncaught Error: Call to a member function ... on null` | Object expected but null returned — often after a plugin deactivation left orphaned data | Identify the calling plugin from stack trace |

## White Screen of Death (WSOD) Disambiguation

| Symptom | Likely cause |
|---------|-------------|
| Completely blank white page, no browser console errors | PHP Fatal error with WP_DEBUG off |
| White page with a spinner in browser tab | JavaScript error preventing page render |
| White admin dashboard but frontend works | Admin-only plugin conflict (admin page hook) |
| White page on one URL, rest of site fine | Post-specific plugin conflict (e.g., page builder shortcode error) |
| White page after WordPress core update | Incompatible plugin or theme with new WP version |
| White page after PHP version change | Plugin using deprecated PHP syntax |

## WordPress REST API Error Codes

| Code | Meaning | Fix direction |
|------|---------|--------------|
| `rest_forbidden` | Authentication required or nonce invalid | Flush permalinks; check if security plugin blocks REST API |
| `rest_cookie_invalid_nonce` | Nonce mismatch — logged out or cached page | Clear caching plugin, ensure login state is not cached |
| `rest_no_route` | Endpoint does not exist | Plugin providing the route may be deactivated |
| `rest_invalid_param` | Request parameter failed validation | API call sending wrong data type |

## Known Plugin Conflict Pairs

| Plugin A | Plugin B | Conflict type |
|----------|----------|--------------|
| WP Rocket (page cache) | WP Super Cache | Both try to create the same cache files |
| Yoast SEO | All in One SEO | Duplicate meta tags; `wpseo_` function conflicts |
| Elementor | jQuery Migrate disabled by WP | Elementor 3.x requires jQuery Migrate to be available |
| Any SMTP plugin (WP Mail SMTP) | Second SMTP plugin | `phpmailer_init` hook conflict |
| WooCommerce + WPML | Polylang | Product language assignment conflicts |
| Wordfence | iThemes Security | Both modify `.htaccess` and `wp-login.php` — redirect loops |
| Autoptimize (aggressive CSS) | Elementor | Autoptimize removing Elementor's inline critical CSS |

## UI Issue Patterns

| Symptom | Likely cause | First step |
|---------|-------------|-----------|
| Layout broken on all pages after WordPress update | Block theme API change or deprecated template tag | Switch to Twenty Twenty-Four to isolate |
| Elementor editor blank after update | jQuery Migrate not available; Elementor minimum WP version not met | Update Elementor; check WP version requirement |
| Block editor showing "This block contains unexpected or invalid content" | Block markup was edited directly in the database or via a text editor | Use the "Attempt Block Recovery" option in the editor |
| CSS not loading on frontend | Caching plugin serving stale stylesheet; `wp_enqueue_styles` hook fired after output | Clear all caches; check hook priority |
| Images not loading after migration | Attachment URLs stored as absolute paths pointing to old domain | Update serialized URLs with `wp search-replace 'old-domain.com' 'new-domain.com' --all-tables` |
| Mobile layout broken (desktop fine) | Missing `<meta name="viewport">`; page builder inline styles overriding media queries | Inspect HTML source for viewport meta; check page builder responsive settings |
| Admin bar showing on frontend | `show_admin_bar(false)` removed from theme; role capability issue | Add `add_filter('show_admin_bar', '__return_false');` to functions.php |
