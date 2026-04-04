# PHP Error Patterns Reference

## Reading a PHP Stack Trace

A PHP fatal error stack trace has this anatomy:

```
Fatal error: Uncaught Error: Call to undefined function wc_get_product() in
/var/www/html/wp-content/plugins/my-custom-plugin/includes/class-product.php:142
Stack trace:
#0 /var/www/html/wp-content/plugins/my-custom-plugin/includes/class-product.php(142): wc_get_product()
#1 /var/www/html/wp-content/themes/my-theme/functions.php(88): My_Plugin->get_product(42)
#2 /var/www/html/wp-includes/class-wp-hook.php(310): {closure}()
```

Extract:
- **Error type**: "Uncaught Error" (PHP 7+) or "Fatal error" (older)
- **Error class**: `Call to undefined function`
- **Called function**: `wc_get_product()` — the function prefix `wc_` identifies WooCommerce as the missing dependency
- **Originating file**: `/wp-content/plugins/my-custom-plugin/includes/class-product.php`
- **Plugin folder**: `my-custom-plugin` (segment after `/plugins/`)
- **Line number**: `142`

## Plugin Name Extraction Rules

From a file path like `/var/www/html/wp-content/plugins/woocommerce/src/Internal/...`:

1. Find the segment after `/plugins/` → `woocommerce`
2. That is the plugin folder name (matches directory in `/wp-content/plugins/`)
3. The actual plugin display name may differ — `woocommerce` = "WooCommerce", `elementor` = "Elementor", `yoast-seo` = "Yoast SEO"

From `/wp-content/themes/my-child-theme/functions.php`:
1. Find the segment after `/themes/` → `my-child-theme`
2. This is the active theme or child theme

Common plugin folder → display name mappings:
| Folder | Display Name |
|--------|-------------|
| `woocommerce` | WooCommerce |
| `elementor` | Elementor |
| `elementor-pro` | Elementor Pro |
| `bricks` | Bricks Builder |
| `wordpress-seo` | Yoast SEO |
| `all-in-one-seo-pack` | All in One SEO |
| `wp-rocket` | WP Rocket |
| `contact-form-7` | Contact Form 7 |
| `acf` or `advanced-custom-fields` | Advanced Custom Fields |
| `wpml-multilingual-cms` | WPML |
| `woocommerce-subscriptions` | WooCommerce Subscriptions |

## Database Error Patterns

### "Error establishing a database connection"
WordPress-level wrapper. The underlying MySQL error is one of:

| Underlying cause | Signal | Fix direction |
|-----------------|--------|--------------|
| Wrong credentials | MySQL error: "Access denied for user 'dbuser'@'localhost'" | Check `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST` in wp-config.php |
| MySQL server down | MySQL error: "Can't connect to MySQL server on 'localhost'" | Check hosting panel → MySQL service status; contact host |
| Too many connections | MySQL error: "Too many connections" | Shared hosting connection limit hit; upgrade or use persistent connections |
| Wrong DB host | Error on anything other than `localhost` | Some hosts require the actual hostname, not `localhost` |

### "Table 'wp_options' doesn't exist" (table prefix mismatch)

Occurs after migration when the source database had a different `$table_prefix` than wp-config.php.

Diagnosis:
1. Run `wp db tables` to see actual table names in the database
2. Extract the prefix from the actual table names (e.g., `wpx3_options` → prefix is `wpx3_`)
3. Compare to `$table_prefix` in wp-config.php

Fix: Update `$table_prefix` in wp-config.php to match the actual prefix in the database.

### Charset/Collation Errors

```
Incorrect string value: '\xF0\x9F\x98...' for column 'post_content'
```

- Post content contains emoji (4-byte UTF-8) but database is using `utf8` (3-byte) instead of `utf8mb4`
- Fix: Convert database to `utf8mb4` using `wp db convert-to-utf8mb4`

### MySQL Server Has Gone Away

```
Error: MySQL server has gone away
```
- Query took too long (timeout) OR packet size exceeded `max_allowed_packet`
- Common during imports, WooCommerce order processing, or WPML language sync
- Fix: Increase `max_allowed_packet` and `wait_timeout` in `my.cnf` (server access required) or split the operation into smaller chunks

## Redirect Loop Patterns

### ERR_TOO_MANY_REDIRECTS — Cause Matrix

| Cause | Signal | Fix |
|-------|--------|-----|
| HTTPS forced in wp-config.php but SSL terminates at proxy | `define('FORCE_SSL_ADMIN', true)` or `$_SERVER['HTTPS']` check present; hosting is behind CloudFlare/load balancer | Add `$_SERVER['HTTPS'] = 'on';` before `require_once ABSPATH . 'wp-settings.php';` |
| siteurl and home option mismatch | `wp option get siteurl` and `wp option get home` return different protocols (http vs https) | Correct both options via `wp option update siteurl/home` |
| SSL plugin redirecting when WordPress already redirects | Two redirect rules firing (WP core + security plugin) | Deactivate SSL plugin; configure redirect at server/.htaccess level only |
| Caching plugin cached a 301 redirect | TTFB instant even on redirect loop (cached) | Clear all caches; set caching to exclude redirect responses |
| Incorrect `.htaccess` rule | Custom `RewriteRule` in .htaccess creating circular redirect | Restore default WordPress `.htaccess` block |

Default WordPress `.htaccess` block (safe to restore):
```apache
# BEGIN WordPress
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /
RewriteRule ^index\.php$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.php [L]
</IfModule>
# END WordPress
```

## PHP Version Incompatibility Signals

### PHP 8.0 Breaking Changes

| Deprecated/removed | Pattern in error | Fix |
|-------------------|-----------------|-----|
| `create_function()` removed | `Fatal error: Undefined function create_function` | Plugin needs update; no easy workaround |
| String to non-string comparison changes | `Warning: strcmp() expects parameter 1 to be string, int given` | Plugin using loose comparisons; update or replace |
| `each()` removed (actually removed in 8.0) | `Fatal error: Uncaught Error: Call to undefined function each()` | Plugin very outdated; replace it |

### PHP 8.1 Breaking Changes

| Deprecated/removed | Pattern in error | Fix |
|-------------------|-----------------|-----|
| Passing null to non-nullable string params | `Deprecated: trim(): Passing null to parameter #1 is deprecated` | Plugin cleanup needed; usually non-fatal but noisy |
| `FILTER_SANITIZE_STRING` deprecated | `Deprecated: FILTER_SANITIZE_STRING is deprecated` | Plugin uses old sanitization constant |

### PHP 8.2 Breaking Changes

| Deprecated/removed | Pattern in error | Fix |
|-------------------|-----------------|-----|
| `${variable}` string interpolation | `Deprecated: Using ${var} in strings is deprecated` | Plugin uses old string interpolation syntax |
| Dynamic properties deprecated | `Deprecated: Creation of dynamic property ... is deprecated` | Plugin adds undeclared properties to objects |

### Checking PHP Version via WP-CLI

```bash
wp eval 'echo phpversion();'
```

## Permission Error Patterns

### File System Permission Errors

```
Warning: file_get_contents(/var/www/html/wp-content/uploads/2024/01/file.jpg): 
failed to open stream: Permission denied
```

Standard WordPress file permission recommendations:
- Directories: `755` (rwxr-xr-x)
- Files: `644` (rw-r--r--)
- `wp-config.php`: `600` (rw-------)

Fix via WP-CLI (if SSH available):
```bash
find /path/to/wordpress -type d -exec chmod 755 {} \;
find /path/to/wordpress -type f -exec chmod 644 {} \;
chmod 600 /path/to/wordpress/wp-config.php
```

Fix via hosting panel: cPanel → File Manager → select files → Change Permissions

## Memory and Execution Time Errors

### Memory Limit

```
Fatal error: Allowed memory size of 134217728 bytes exhausted (tried to allocate 4096 bytes)
```

`134217728 bytes` = 128 MB. Default PHP memory limit.

Fix options (in order of preference):
1. Add to `wp-config.php` (before `require_once ABSPATH . 'wp-settings.php'`):
   ```php
   define('WP_MEMORY_LIMIT', '256M');
   ```
2. Add to `.htaccess`:
   ```apache
   php_value memory_limit 256M
   ```
3. Add to `php.ini` (if server access):
   ```ini
   memory_limit = 256M
   ```

### Execution Time

```
Fatal error: Maximum execution time of 30 seconds exceeded
```

Fix options:
1. Add to `wp-config.php`:
   ```php
   set_time_limit(120);
   ```
2. Identify the slow operation (usually an import, cron job, or external API call) and optimize it rather than just increasing the timeout
