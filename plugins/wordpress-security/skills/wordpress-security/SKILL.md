---
name: wordpress-security
description: >
  WordPress security audit covering core updates, plugin/theme dependency
  updates, authentication hardening, file permissions, HTTP security headers,
  information disclosure, malware detection, database security, and backup
  verification. Produces a 0-100 health score with prioritized findings.
  Use when user says "WordPress security", "security audit", "is my site
  secure", "hacked site", "my site was hacked", "malware", "vulnerability
  check", "plugin updates", "outdated plugins", "hardening", "brute force
  protection", "security headers", "file permissions", "WordPress
  vulnerabilities", "security scan", "site got hacked", "suspicious
  activity", "security review", "lockdown WordPress", or "update plugins".
  For SEO-related audits, see market-seo-audit. For theme/structure audits,
  see wordpress-design. For REST API management, see wordpress-api.
metadata:
  version: 1.0.0
---

# WordPress Security Audit

You are an expert in WordPress security. Your goal is to identify security vulnerabilities, misconfigurations, outdated dependencies, and missing hardening measures — then provide actionable fixes prioritized by risk.

**Key references:**
- [WordPress Hardening](../../../../references/wordpress/wp-hardening.md) — file permissions, wp-config constants, server config
- [HTTP Security Headers](../../../../references/wordpress/security-headers.md) — header best practices with Apache/Nginx/PHP examples
- [Vulnerability Resources](../../../../references/wordpress/vulnerability-resources.md) — where to check for known CVEs

---

## Initial Assessment

**Check for product marketing context first:**
If `.agents/product-marketing-context.md` exists (or `.claude/product-marketing-context.md` in older setups), read it before asking questions. Use that context and only ask for information not already covered.

Before auditing, understand:

1. **Environment**
   - Hosting type? (shared, VPS, managed WordPress like WP Engine/Kinsta/Flywheel)
   - Do you have WP-CLI access? (many checks depend on it)
   - Do you have SSH/SFTP access to the server?
   - What web server? (Apache, Nginx, LiteSpeed)

2. **Current Security Posture**
   - Any security plugins installed? (Wordfence, Sucuri, iThemes Security, etc.)
   - Any recent security incidents or suspicious activity?
   - When was WordPress core last updated?
   - Is there a backup system in place?

3. **Scope**
   - Full security audit or specific concern? (e.g., "just check my headers" or "just check for outdated plugins")
   - Single site or multisite network?
   - Is the site public-facing and receiving traffic?

If the user has a **specific narrow concern** (e.g., "check my security headers" or "are my plugins up to date"), skip the full audit and focus on that area. Don't force a comprehensive audit when the user wants a targeted check.

If the user reports a **hacked site or active incident**, skip intake and go straight to the Malware & Integrity section — containment first, then full audit.

---

## Audit Workflow

### Step 1: Intake

Gather the information above. Adapt scope based on the user's response.

### Step 2: External Reconnaissance

Invoke the `wp-security-scanner` agent with:
- `url`: the site URL
- `include_ssl`: true

Run as a background agent. Wait for it to complete before proceeding.

The agent checks all publicly observable indicators via HTTP requests: version exposure (HTML generator tag, `/readme.html`, RSS feed, asset version hints), endpoint exposure (xmlrpc.php, REST API user enumeration, wp-login.php accessibility), HTTP security headers (all 7), and SSL/redirect behavior.

Store the full JSON output — it feeds Steps 6, 7, and 8.

### Step 3: Configuration Audit

If the user has file access (SSH/SFTP) or can share file contents:

**wp-config.php constants** — check for:
- `WP_DEBUG` — must be `false` in production
- `WP_DEBUG_DISPLAY` — must be `false` in production
- `WP_DEBUG_LOG` — should be `false` unless actively debugging (log file may be publicly accessible)
- `DISALLOW_FILE_EDIT` — should be `true` (disables theme/plugin editor)
- `DISALLOW_FILE_MODS` — recommended `true` for production (prevents installs/updates via wp-admin)
- `FORCE_SSL_ADMIN` — should be `true`
- `DISABLE_WP_CRON` — recommended `true` (use server cron instead)
- Authentication salts — all 8 must be set and unique

**File permissions** — see [wp-hardening.md](../../../../references/wordpress/wp-hardening.md) for target permissions:
```bash
# Check wp-config.php permissions
stat -c '%a %U:%G %n' wp-config.php

# Find files with 777 permissions
find . -perm 777 -type f
find . -perm 777 -type d

# Check uploads directory
ls -la wp-content/uploads/
```

**Server config:**
- `.htaccess` rules — directory listing disabled, xmlrpc blocked, PHP blocked in uploads
- Or Nginx equivalent rules

### Step 4: Dependency Audit

**WordPress Core:**
```bash
wp core version
wp core check-update
```

**Plugins:**
```bash
# Full plugin inventory with update status
wp plugin list --format=table --fields=name,status,version,update,update_version

# Plugins with available updates
wp plugin list --update=available --format=table
```

**Themes:**
```bash
wp theme list --format=table --fields=name,status,version,update,update_version
```

**PHP Version:**
```bash
php -v
# or
wp eval "echo phpversion();"
```

**MySQL/MariaDB Version:**
```bash
wp db query "SELECT VERSION();" --skip-column-names
```

For each outdated plugin/theme, assess:
- How far behind is the version? (1 minor = low risk, 1+ major = high risk)
- Is the plugin still actively maintained? (last updated date)
- Are there known vulnerabilities in the installed version? (check [vulnerability-resources.md](../../../../references/wordpress/vulnerability-resources.md))

Flag as **abandoned** any plugin not updated in 2+ years.

### Step 5: Authentication Audit

```bash
# List all users with roles
wp user list --format=table --fields=ID,user_login,user_email,roles

# Check for default "admin" username
wp user get admin 2>/dev/null && echo "Default admin username exists"

# Check for application passwords
wp user list --format=table --fields=ID,user_login | while read line; do
  wp user application-password list $ID --format=count 2>/dev/null
done
```

**Check for:**
- Default "admin" username (High severity)
- Multiple administrator accounts (review if all are necessary)
- Dormant accounts (users who haven't logged in for 6+ months)
- Application passwords that may be stale
- Whether a security plugin enforces login rate limiting
- Whether 2FA is enabled for all admin accounts

**Without WP-CLI:** Ask the user to check Users > All Users in wp-admin and report the count of administrators.

### Step 6: Header & SSL Audit

Use the `wp-security-scanner` output from Step 2 — the agent has already collected all HTTP security headers and SSL findings.

From `scanner.security_headers`, map each header's `status` to the report findings:
- `fail` on any of the 7 required headers → flag as Medium finding
- `warn` on `X-XSS-Protection` (value not `0`) → flag as Low finding
- `fail` on `information_leaking_headers.x_powered_by` → flag as Medium finding
- `fail` on `information_leaking_headers.server_version` → flag as Low finding

From `scanner.ssl`:
- `https_in_use: false` → Critical finding
- `http_redirects_to_https: false` → High finding
- `mixed_content_detected: true` → High finding
- `hsts_preload_eligible: false` with HSTS missing → note in report (Low)

See [security-headers.md](../../../../references/wordpress/security-headers.md) for remediation code (Apache/Nginx/PHP examples) for any failing headers.

### Step 7: Malware & Integrity Check

```bash
# Verify WordPress core files haven't been modified
wp core verify-checksums

# Check for suspicious files in the web root
ls -la *.php | grep -v -E '(index|wp-|xmlrpc|wp-config)'

# Look for recently modified PHP files (last 7 days)
find . -name "*.php" -mtime -7 -type f

# Search for common malware patterns in theme files
grep -r "eval(base64_decode" wp-content/themes/
grep -r "eval(gzinflate" wp-content/themes/
grep -r "eval(\$_" wp-content/
grep -r "assert(" wp-content/themes/
grep -r "preg_replace.*\/e" wp-content/

# Check for hidden admin accounts (users created recently)
wp user list --role=administrator --format=table --fields=ID,user_login,user_registered

# Check wp-cron events for unauthorized jobs
wp cron event list --format=table
```

**Signs of compromise:**
- Core checksum mismatches (files modified)
- Unknown PHP files in the web root (backdoors)
- Recently created admin accounts the site owner doesn't recognize
- Unauthorized cron jobs (spam, redirects, cryptomining)
- Base64-encoded or obfuscated code in theme/plugin files
- `.htaccess` with redirect rules to malicious domains
- Unknown files in `/wp-content/uploads/` with `.php` extension

### Step 8: Report Generation

Compile all findings into the output format below.

---

## Audit Categories — Detailed Checks

### 1. Core & Dependency Updates

- [ ] WordPress core is the latest stable version
- [ ] All active plugins have the latest version installed
- [ ] All active themes have the latest version installed
- [ ] No plugins abandoned (last update 2+ years ago)
- [ ] No plugins removed from the WordPress.org directory
- [ ] No known vulnerabilities in installed plugin versions
- [ ] No known vulnerabilities in installed theme versions
- [ ] PHP version is actively supported (not end-of-life)
- [ ] MySQL/MariaDB version is actively supported
- [ ] Auto-updates enabled for minor WordPress releases

### 2. Authentication & Access Control

- [ ] No default "admin" username
- [ ] Strong password policy enforced (via plugin or server config)
- [ ] Two-factor authentication enabled for all administrators
- [ ] Login attempts rate-limited (brute force protection)
- [ ] Admin area accessible only to authorized users (IP whitelist or VPN, if applicable)
- [ ] No unnecessary administrator accounts
- [ ] No dormant user accounts with elevated roles
- [ ] Application passwords reviewed and cleaned up
- [ ] WordPress login URL not using default `/wp-login.php` (optional hardening)
- [ ] Failed login attempts logged and monitored

### 3. File System Security

- [ ] `wp-config.php` permissions set to 440 or 400
- [ ] No files or directories with 777 permissions
- [ ] Directory listing disabled (`Options -Indexes`)
- [ ] PHP execution blocked in `/wp-content/uploads/`
- [ ] `wp-config.php` protected from direct HTTP access
- [ ] `wp-includes` protected from direct PHP access
- [ ] File editor disabled (`DISALLOW_FILE_EDIT`)
- [ ] Debug mode disabled in production (`WP_DEBUG`, `WP_DEBUG_DISPLAY`, `SCRIPT_DEBUG`)
- [ ] Debug log not publicly accessible (if `WP_DEBUG_LOG` was ever enabled, check `wp-content/debug.log`)
- [ ] Authentication salts set and unique (all 8 constants)

### 4. Database Security

- [ ] Database table prefix is not the default `wp_`
- [ ] Database user has minimum required privileges (no FILE, PROCESS, SUPER)
- [ ] Database not accessible from external hosts (bound to localhost)
- [ ] Database credentials not exposed in version control
- [ ] Post revisions limited (`WP_POST_REVISIONS`)
- [ ] Expired transients cleaned up periodically

### 5. HTTP Security Headers

- [ ] Strict-Transport-Security (HSTS) present with adequate max-age
- [ ] Content-Security-Policy present (even if permissive starter policy)
- [ ] X-Content-Type-Options set to `nosniff`
- [ ] X-Frame-Options set to `SAMEORIGIN` or `DENY`
- [ ] Referrer-Policy set
- [ ] Permissions-Policy set with restrictive defaults
- [ ] X-XSS-Protection set to `0` (deprecated auditor disabled)
- [ ] `X-Powered-By` header removed
- [ ] Server version not disclosed in headers

### 6. SSL/HTTPS Configuration

- [ ] SSL certificate valid and not expired
- [ ] SSL certificate covers all used domains/subdomains
- [ ] All pages served over HTTPS (no HTTP pages)
- [ ] HTTP to HTTPS redirect in place (301, not 302)
- [ ] No mixed content (HTTP resources on HTTPS pages)
- [ ] `FORCE_SSL_ADMIN` set to `true` in wp-config.php
- [ ] HSTS preload-ready (if appropriate for the site)

### 7. Information Disclosure

- [ ] WordPress version not exposed in HTML meta generator tag
- [ ] `/readme.html` not publicly accessible (or version info removed)
- [ ] WordPress version not exposed in RSS feed generator tag
- [ ] PHP version not exposed via `X-Powered-By` header
- [ ] Server software version not exposed in response headers
- [ ] Directory listing disabled
- [ ] Error messages do not reveal file paths or debug info
- [ ] REST API user enumeration disabled or restricted (`/wp-json/wp/v2/users`)
- [ ] Author archive enumeration prevented (`?author=N` redirects)
- [ ] `wp-content/debug.log` not publicly accessible

### 8. Plugin & Theme Security

- [ ] No inactive plugins installed (remove, don't just deactivate)
- [ ] No inactive themes installed (keep only active theme and one default theme)
- [ ] No nulled/pirated plugins or themes
- [ ] All plugins sourced from WordPress.org or reputable commercial vendors
- [ ] No plugins with known unpatched vulnerabilities
- [ ] Security plugin installed and configured (Wordfence, Sucuri, Solid Security, etc.)
- [ ] Security plugin firewall rules up to date
- [ ] Plugin and theme auto-updates configured (or managed deployment pipeline)

### 9. Backup & Recovery

- [ ] Automated backup schedule exists (daily for active sites)
- [ ] Backups include both database and files
- [ ] Backups stored off-site (not just on the same server)
- [ ] Backup retention policy in place (e.g., 30 days of daily backups)
- [ ] Backup restoration tested at least once
- [ ] Recovery plan documented (who does what, where backups are, how to restore)

### 10. Malware & Integrity

- [ ] WordPress core file checksums verified (`wp core verify-checksums`)
- [ ] No unknown PHP files in the web root directory
- [ ] No PHP files in the uploads directory
- [ ] No base64-encoded or obfuscated code in theme/plugin files
- [ ] No unauthorized admin accounts
- [ ] No unauthorized WP-Cron jobs
- [ ] `.htaccess` / server config contains no suspicious redirect rules
- [ ] No recently modified core files (unless a legitimate update)

---

## WP-CLI Commands Reference

Consolidated list of all WP-CLI commands used across the audit:

```bash
# Core
wp core version                          # Current WordPress version
wp core check-update                     # Available core updates
wp core verify-checksums                 # Verify core file integrity

# Plugins
wp plugin list --format=table            # All plugins with status/version
wp plugin list --update=available        # Plugins with pending updates
wp plugin list --status=inactive         # Inactive plugins (remove these)

# Themes
wp theme list --format=table             # All themes with status/version
wp theme list --status=inactive          # Inactive themes (remove extras)

# Users
wp user list --format=table              # All users with roles
wp user list --role=administrator        # Admin accounts specifically
wp user get admin                        # Check if "admin" username exists

# Configuration
wp config get WP_DEBUG                   # Check debug mode
wp config get DISALLOW_FILE_EDIT         # Check file editor status
wp config list --fields=name,value       # All config constants

# Database
wp db query "SELECT VERSION();"          # Database version
wp db query "SHOW GRANTS FOR CURRENT_USER();"  # Database permissions
wp db optimize                           # Optimize tables

# Cron
wp cron event list                       # Scheduled cron events

# Search/Cleanup
wp transient delete --expired            # Remove expired transients
wp post list --post_type=revision --format=ids  # Find revisions for cleanup
```

---

## Graceful Degradation (No WP-CLI)

Many checks require WP-CLI. When the user does not have WP-CLI access:

**Still possible without WP-CLI:**
- HTTP header checks (via `curl` or `web_fetch`)
- SSL/HTTPS checks (via `curl` or browser)
- Version exposure checks (via `web_fetch`)
- REST API enumeration check (via `web_fetch`)
- XML-RPC accessibility check (via `web_fetch`)
- Login page accessibility check
- File permission checks (if SSH access available)
- wp-config.php review (if file contents shared)

**Requires WP-CLI — provide commands for the site owner to run:**
- Plugin/theme inventory and update status
- User account audit
- Core file integrity verification
- Cron job listing
- Database permission check
- Transient/revision cleanup

**Template for WP-CLI delegation:**
When WP-CLI is not available, provide the site owner with a numbered list of commands to run, and ask them to share the output:

```
Please run these commands on your server and share the output:

1. wp plugin list --format=table --fields=name,status,version,update,update_version
2. wp theme list --format=table --fields=name,status,version,update,update_version
3. wp user list --role=administrator --format=table --fields=ID,user_login,user_registered
4. wp core version && wp core check-update
5. wp core verify-checksums
6. wp config get WP_DEBUG && wp config get DISALLOW_FILE_EDIT
```

---

## Output Format

### Health Score

Start at **100**, deduct per finding:

| Severity | Deduction |
|----------|-----------|
| Critical | -15 |
| High | -10 |
| Medium | -5 |
| Low | -2 |

Floor at **0**. A score of:
- **90-100** = Strong security posture
- **70-89** = Good with room for improvement
- **50-69** = Significant issues need attention
- **30-49** = Serious vulnerabilities present
- **0-29** = Critical — immediate action required

### Report Structure

**Executive Summary**
- Health score (0-100) with severity breakdown (N critical, N high, N medium, N low)
- Top 3-5 most urgent findings
- Quick wins (easy fixes with meaningful impact)

**Findings by Category**

For each finding:
- **Issue**: What's wrong (specific, not vague)
- **Severity**: Critical / High / Medium / Low
- **Impact**: What could happen if exploited or left unfixed
- **Evidence**: How you found it (URL, command output, file contents)
- **Fix**: Specific steps to remediate (include code/commands when possible)
- **Priority**: Immediate / This week / This month / When convenient

**Dependency Report Table**

| Component | Current | Latest | Last Updated | Status |
|-----------|---------|--------|-------------|--------|
| WordPress Core | 6.4.2 | 6.7.1 | — | Outdated |
| Plugin: contact-form-7 | 5.7 | 6.0.2 | 2024-11-15 | Outdated |
| Plugin: akismet | 5.3.7 | 5.3.7 | 2025-01-20 | OK |
| Theme: flavor | 1.0 | — | 2021-03-10 | Abandoned |
| PHP | 7.4 | 8.4 | — | End of Life |

**Prioritized Action Plan**

1. **Critical — Fix Immediately**
   - Finding summaries with one-line fix descriptions

2. **High — Fix This Week**
   - Finding summaries with one-line fix descriptions

3. **Medium — Fix This Month**
   - Finding summaries with one-line fix descriptions

4. **Low — Fix When Convenient**
   - Finding summaries with one-line fix descriptions

---

## Limitations

1. **`web_fetch` strips `<script>` tags** — cannot detect client-side injected content, inline JavaScript security measures, or JS-based WAF challenges. Note this limitation when reporting on client-side findings.

2. **This is a configuration audit, not a penetration test.** The skill checks for misconfigurations, outdated dependencies, and missing hardening measures. It does not attempt to exploit vulnerabilities, perform fuzzing, or test for application-logic bugs.

3. **WP-CLI dependency.** Many checks require WP-CLI access. Without it, the audit is limited to externally observable indicators and any file contents the user can share. See the Graceful Degradation section above.

4. **Plugin vulnerability data has lag.** Vulnerability databases may not include zero-day exploits or very recently disclosed issues. A clean vulnerability check does not guarantee zero risk.

5. **Managed hosting may restrict access.** Platforms like WP Engine, Kinsta, and Flywheel handle some security concerns at the infrastructure level (e.g., file permissions, server config) but may not allow the user to verify or change these settings.

---

## References

- [WordPress Hardening Guide](../../../../references/wordpress/wp-hardening.md) — file permissions, wp-config.php constants, .htaccess/Nginx rules, database hardening, PHP configuration
- [HTTP Security Headers](../../../../references/wordpress/security-headers.md) — all 7 headers with recommended values, Apache/Nginx/PHP implementation, WordPress plugin conflicts, scoring guide
- [Vulnerability Resources](../../../../references/wordpress/vulnerability-resources.md) — WPScan, Patchstack, Wordfence Intelligence, NVD lookup, manual check workflow, CVSS interpretation, abandoned plugin detection

---

## Related Skills

- **wordpress-design** — Broader WordPress site audit (9-section checklist including a lightweight security section). Use for site overhaul planning, theme architecture, and performance.
- **market-seo-audit** — Technical SEO audit that includes SSL/HTTPS checks in its Security section. Use for SEO-specific concerns.
- **wordpress-api** — WordPress REST API and WP-CLI management. Use for content management and API integration tasks.
