# HTTP Security Headers for WordPress

Reference for the wordpress-security audit skill. Covers each security header, recommended values, and WordPress-specific implementation methods.

---

## Header Reference

### 1. Strict-Transport-Security (HSTS)

Forces browsers to use HTTPS for all future requests to the domain.

**Recommended value:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

- `max-age=31536000` — enforce for 1 year (in seconds)
- `includeSubDomains` — apply to all subdomains
- `preload` — opt into browser preload lists (submit at hstspreload.org after testing)

**Start conservative:** Use `max-age=86400` (1 day) first, then increase after verifying no mixed content issues.

**Impact if misconfigured:** If any page serves HTTP-only resources, they will be blocked. Test thoroughly.

### 2. Content-Security-Policy (CSP)

Controls which sources can load scripts, styles, images, fonts, etc. The most powerful — and most complex — security header.

**Starter policy for WordPress:**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'
```

**Why `unsafe-inline` and `unsafe-eval`?** WordPress core, most themes, and most plugins inject inline scripts and use `eval()`. A strict CSP will break them. Start with `Content-Security-Policy-Report-Only` to identify violations before enforcing.

**Tightening over time:**
1. Deploy in `Report-Only` mode with a reporting endpoint
2. Identify all inline scripts and eval usage
3. Add nonces or hashes for legitimate inline scripts
4. Remove `unsafe-inline` and `unsafe-eval`

**Common WordPress sources to whitelist:**
- Google Fonts: `fonts.googleapis.com`, `fonts.gstatic.com`
- Google Analytics: `www.googletagmanager.com`, `www.google-analytics.com`
- Google reCAPTCHA: `www.google.com`, `www.gstatic.com`
- YouTube embeds: `www.youtube.com`, `www.youtube-nocookie.com`
- Gravatar: `secure.gravatar.com`, `*.gravatar.com`

### 3. X-Content-Type-Options

Prevents MIME-type sniffing. Browsers will respect the declared Content-Type.

**Recommended value:**
```
X-Content-Type-Options: nosniff
```

No configuration needed — always use this exact value. No WordPress compatibility issues.

### 4. X-Frame-Options

Prevents the site from being embedded in iframes (clickjacking protection).

**Recommended value:**
```
X-Frame-Options: SAMEORIGIN
```

- `DENY` — no framing at all
- `SAMEORIGIN` — only same-origin framing (recommended for WordPress, since wp-admin uses iframes internally)
- `ALLOW-FROM` — deprecated, use CSP `frame-ancestors` instead

**Note:** `frame-ancestors` in CSP supersedes this header but X-Frame-Options is still needed for older browsers.

### 5. Referrer-Policy

Controls how much referrer information is sent with requests.

**Recommended value:**
```
Referrer-Policy: strict-origin-when-cross-origin
```

This sends full URL for same-origin requests, only origin for cross-origin HTTPS, and nothing for HTTPS-to-HTTP downgrades.

**Alternative (stricter):** `no-referrer-when-downgrade` or `no-referrer`

### 6. Permissions-Policy

Controls access to browser features (camera, microphone, geolocation, etc.).

**Recommended value:**
```
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
```

- `()` means disabled for all origins
- `interest-cohort=()` opts out of Google FLoC/Topics (privacy)
- Add specific origins if your site uses these features: `geolocation=(self "https://maps.example.com")`

### 7. X-XSS-Protection

**Deprecated** — modern browsers have removed their XSS auditors. But still appears in security scanners.

**Recommended value:**
```
X-XSS-Protection: 0
```

Setting to `0` is now the recommended approach. The old `1; mode=block` value could itself introduce vulnerabilities in older browsers. Modern XSS protection comes from CSP.

---

## Implementation Methods

### Apache (.htaccess)

Add to the WordPress root `.htaccess` file, before the WordPress rewrite rules:

```apache
<IfModule mod_headers.c>
    # HSTS — enforce HTTPS
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"

    # Prevent MIME-type sniffing
    Header always set X-Content-Type-Options "nosniff"

    # Clickjacking protection
    Header always set X-Frame-Options "SAMEORIGIN"

    # Referrer policy
    Header always set Referrer-Policy "strict-origin-when-cross-origin"

    # Permissions policy
    Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()"

    # CSP — start with report-only, then enforce
    # Header always set Content-Security-Policy-Report-Only "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'"
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'"

    # Disable XSS auditor (deprecated, but scanners check for it)
    Header always set X-XSS-Protection "0"

    # Remove server version disclosure
    Header unset X-Powered-By
    Header always unset X-Powered-By
    ServerSignature Off
</IfModule>
```

**Requires:** `mod_headers` enabled (`a2enmod headers` on Debian/Ubuntu).

### Nginx

Add to the `server` block or an included conf file:

```nginx
# HSTS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Prevent MIME sniffing
add_header X-Content-Type-Options "nosniff" always;

# Clickjacking protection
add_header X-Frame-Options "SAMEORIGIN" always;

# Referrer policy
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# Permissions policy
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" always;

# CSP
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'" always;

# Disable XSS auditor
add_header X-XSS-Protection "0" always;

# Hide server tokens
server_tokens off;
more_clear_headers "X-Powered-By";
```

**Note:** The `always` parameter ensures headers are sent on error responses too (4xx, 5xx).

### PHP (functions.php or mu-plugin)

For managed hosting where you cannot edit server config:

```php
<?php
/**
 * Security Headers — add as mu-plugin at wp-content/mu-plugins/security-headers.php
 */
add_action('send_headers', function () {
    header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()');
    header('X-XSS-Protection: 0');
    header_remove('X-Powered-By');
});
```

**Limitation:** PHP-level headers only apply to PHP-generated responses. Static files (images, CSS, JS) served directly by the web server will not include these headers. Server-level config is preferred.

---

## Common WordPress Plugin Conflicts

- **Caching plugins** (WP Rocket, W3 Total Cache, LiteSpeed Cache) may strip or override headers. Check cached pages specifically.
- **Security plugins** (Wordfence, Sucuri, iThemes Security) may set their own headers. Avoid duplicating — check what the plugin already sets.
- **CDN services** (Cloudflare, Sucuri CDN, StackPath) may override or add headers at the edge. Configure headers at the CDN level if using one.

**Testing after changes:**
```bash
# Check headers on a specific page
curl -I https://example.com

# Check headers on a cached page (add cache-busting param)
curl -I "https://example.com/?nocache=$(date +%s)"

# Full header analysis
# Visit: securityheaders.com and enter the URL
```

---

## Scoring Guide

Used by the wordpress-security skill when scoring header findings:

| Header | Missing = | Present but weak = |
|--------|-----------|-------------------|
| HSTS | High | Medium (short max-age, no includeSubDomains) |
| CSP | Medium | Low (overly permissive but present) |
| X-Content-Type-Options | Medium | — (no weak config possible) |
| X-Frame-Options | Medium | Low (ALLOW-FROM deprecated) |
| Referrer-Policy | Low | — |
| Permissions-Policy | Low | — |
| X-XSS-Protection | Low | Low (set to `1` instead of `0`) |
