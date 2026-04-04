# WordPress Hardening Guide

Reference for the wordpress-security audit skill. Covers file permissions, wp-config.php constants, server configuration, and database hardening.

---

## File Permissions

Set the minimum permissions needed. Overly permissive files are one of the most common WordPress vulnerabilities.

| Path | Permission | Owner | Notes |
|------|-----------|-------|-------|
| `/` (WordPress root) | 755 | `www-data:www-data` | Directories need execute |
| `wp-config.php` | 440 or 400 | `www-data:www-data` | Read-only, no write, no execute |
| `.htaccess` | 644 | `www-data:www-data` | Apache needs read; WP needs write for permalinks |
| `wp-content/` | 755 | `www-data:www-data` | Plugins/themes need write access here |
| `wp-content/uploads/` | 755 | `www-data:www-data` | Media uploads directory |
| `wp-content/plugins/` | 755 | `www-data:www-data` | Auto-updates need write |
| `wp-content/themes/` | 755 | `www-data:www-data` | Auto-updates need write |
| All `.php` files | 644 | `www-data:www-data` | Read + execute, no write |
| All directories | 755 | `www-data:www-data` | Never 777 |

**Red flags:**
- Any file or directory set to `777`
- `wp-config.php` writable by group or others (e.g., `666`, `644` on shared hosting)
- Upload directory with execute permissions on `.php` files

**Check command (WP-CLI not required):**
```bash
# Find files with 777 permissions
find /path/to/wordpress -perm 777 -type f
find /path/to/wordpress -perm 777 -type d

# Check wp-config.php specifically
stat -c '%a %U:%G %n' /path/to/wordpress/wp-config.php
```

---

## wp-config.php Security Constants

These constants should be set in `wp-config.php` before the `/* That's all, stop editing! */` line.

### Must-Have Constants

```php
/** Disable the file editor in wp-admin (Appearance > Theme Editor, Plugins > Plugin Editor) */
define('DISALLOW_FILE_EDIT', true);

/** Force SSL for wp-admin login and dashboard */
define('FORCE_SSL_ADMIN', true);

/** Disable display of PHP errors (must be off in production) */
define('WP_DEBUG', false);
define('WP_DEBUG_DISPLAY', false);
define('WP_DEBUG_LOG', false);

/** Disable script debugging */
define('SCRIPT_DEBUG', false);
```

### Recommended Constants

```php
/** Prevent plugin/theme installation and updates via wp-admin
    Use WP-CLI or deployment pipelines instead */
define('DISALLOW_FILE_MODS', true);

/** Limit post revisions to reduce database bloat */
define('WP_POST_REVISIONS', 5);

/** Shorten autosave interval (seconds) or extend it to reduce DB writes */
define('AUTOSAVE_INTERVAL', 120);

/** Set custom content directory (obscures default paths) */
// define('WP_CONTENT_DIR', dirname(__FILE__) . '/content');
// define('WP_CONTENT_URL', 'https://example.com/content');

/** Disable WordPress Cron (use real server cron instead) */
define('DISABLE_WP_CRON', true);
// Then add to server crontab:
// */15 * * * * cd /path/to/wordpress && php wp-cron.php > /dev/null 2>&1

/** Empty trash more frequently (days, default 30) */
define('EMPTY_TRASH_DAYS', 7);

/** Block external HTTP requests (whitelist specific hosts if needed) */
// define('WP_HTTP_BLOCK_EXTERNAL', true);
// define('WP_ACCESSIBLE_HOSTS', 'api.wordpress.org,downloads.wordpress.org');
```

### Authentication Salts

Verify that all 8 salt constants are set and unique (not default empty values):

```php
define('AUTH_KEY',         'unique-random-string');
define('SECURE_AUTH_KEY',  'unique-random-string');
define('LOGGED_IN_KEY',    'unique-random-string');
define('NONCE_KEY',        'unique-random-string');
define('AUTH_SALT',        'unique-random-string');
define('SECURE_AUTH_SALT', 'unique-random-string');
define('LOGGED_IN_SALT',   'unique-random-string');
define('NONCE_SALT',       'unique-random-string');
```

**Check command:**
```bash
wp config list --fields=name,value | grep -E '(AUTH_KEY|SECURE_AUTH_KEY|LOGGED_IN_KEY|NONCE_KEY|AUTH_SALT|SECURE_AUTH_SALT|LOGGED_IN_SALT|NONCE_SALT)'
```

If any salt is empty or contains `put your unique phrase here`, regenerate all salts.

---

## .htaccess Hardening (Apache)

Add these rules to the `.htaccess` file in the WordPress root directory.

### Block XML-RPC

```apache
# Block XML-RPC (unless needed for Jetpack, mobile apps, or pingbacks)
<Files xmlrpc.php>
    Order Deny,Allow
    Deny from all
    # Allow specific IPs if needed:
    # Allow from 192.168.1.0/24
</Files>
```

### Disable Directory Browsing

```apache
# Prevent directory listing
Options -Indexes
```

### Protect wp-config.php

```apache
# Deny access to wp-config.php
<Files wp-config.php>
    Order Allow,Deny
    Deny from all
</Files>
```

### Block PHP Execution in Uploads

```apache
# Place this in wp-content/uploads/.htaccess
<Files "*.php">
    Order Allow,Deny
    Deny from all
</Files>
```

### Protect wp-includes

```apache
# Block direct access to wp-includes files
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^wp-admin/includes/ - [F,L]
    RewriteRule !^wp-includes/ - [S=3]
    RewriteRule ^wp-includes/[^/]+\.php$ - [F,L]
    RewriteRule ^wp-includes/js/tinymce/langs/.+\.php - [F,L]
    RewriteRule ^wp-includes/theme-compat/ - [F,L]
</IfModule>
```

### Block Author Enumeration

```apache
# Prevent user enumeration via ?author=N
<IfModule mod_rewrite.c>
    RewriteCond %{QUERY_STRING} ^author=([0-9]*)
    RewriteRule .* - [F,L]
</IfModule>
```

---

## Nginx Equivalents

For servers running Nginx instead of Apache.

### Block XML-RPC

```nginx
location = /xmlrpc.php {
    deny all;
    return 403;
}
```

### Disable Directory Listing

```nginx
# Usually off by default in Nginx
autoindex off;
```

### Protect wp-config.php

```nginx
location = /wp-config.php {
    deny all;
}
```

### Block PHP in Uploads

```nginx
location ~* /wp-content/uploads/.*\.php$ {
    deny all;
}
```

### Block wp-includes PHP

```nginx
location ~* /wp-includes/.*\.php$ {
    deny all;
}

# Allow specific needed files
location ~ /wp-includes/js/tinymce/wp-tinymce\.php$ {
    allow all;
}
```

### Block Author Enumeration

```nginx
if ($args ~* "author=\d+") {
    return 403;
}
```

---

## Database Hardening

### Custom Table Prefix

The default `wp_` prefix is well-known. Changing it after installation is complex, but for new installs:

```php
// In wp-config.php — set during installation
$table_prefix = 'wp8x_';  // Use a random prefix
```

### Database User Permissions

The WordPress database user should have only the permissions it needs:

```sql
-- Minimum required privileges for WordPress
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, INDEX
ON wordpress_db.*
TO 'wp_user'@'localhost';

-- Do NOT grant: FILE, PROCESS, SUPER, GRANT OPTION, ALL PRIVILEGES
```

**Check current grants:**
```bash
wp db query "SHOW GRANTS FOR CURRENT_USER();"
```

### Cleanup

```bash
# Delete orphaned post revisions (keep latest 5 per post)
wp post delete $(wp post list --post_type=revision --format=ids) --force

# Delete expired transients
wp transient delete --expired

# Optimize database tables
wp db optimize
```

---

## PHP Configuration

These `php.ini` settings improve security. On shared hosting, use `.user.ini` or `php_value` in `.htaccess`.

```ini
; Hide PHP version from HTTP headers
expose_php = Off

; Do not display errors to visitors
display_errors = Off
display_startup_errors = Off

; Log errors to file instead
log_errors = On
error_log = /path/to/php-error.log

; Disable dangerous functions (adjust based on plugin needs)
disable_functions = exec,passthru,shell_exec,system,proc_open,popen,curl_multi_exec,parse_ini_file,show_source

; Limit file uploads
file_uploads = On
upload_max_filesize = 10M
max_file_uploads = 5

; Session security
session.cookie_httponly = 1
session.cookie_secure = 1
session.use_strict_mode = 1
```

**Note on `disable_functions`:** Some plugins (backup plugins, image processors) legitimately need `exec` or `proc_open`. Test thoroughly before deploying. WP-CLI itself requires these functions.

---

## Moving wp-config.php Above Web Root

WordPress automatically checks one directory above the web root for `wp-config.php`:

```
/home/user/wp-config.php          ← Moved here (not web-accessible)
/home/user/public_html/            ← WordPress root
/home/user/public_html/wp-admin/
/home/user/public_html/wp-content/
```

No code changes needed — WordPress checks the parent directory automatically. This prevents direct HTTP access to the file even if `.htaccess` rules fail.

**Caveat:** This does not work with all hosting setups (e.g., when multiple WordPress installs share a parent directory).
