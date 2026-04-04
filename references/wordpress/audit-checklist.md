# WordPress Site Audit Checklist

Use this checklist to evaluate the current state of a WordPress site before an overhaul. Score each section to prioritize what needs the most attention.

## 1. Theme and Structure Audit

- [ ] What theme is active? Is it a block theme, classic theme, or builder-based?
- [ ] Is it a child theme or has the parent been modified directly?
- [ ] What WordPress version is running? Is it current?
- [ ] What PHP version is the server running? (8.1+ recommended)
- [ ] Is the theme still maintained/updated by its developer?
- [ ] How many custom templates or template overrides exist?
- [ ] Are there hardcoded URLs, paths, or content in templates?

## 2. Plugin Audit

- [ ] Total plugin count (active and inactive)
- [ ] List each active plugin with: purpose, last updated date, performance impact
- [ ] Are there inactive plugins still installed? (security risk)
- [ ] Are there plugin conflicts or duplicate functionality?
- [ ] Which plugins handle critical functions (forms, SEO, caching, security)?
- [ ] Are premium plugins licensed and receiving updates?

## 3. Performance Audit

Run these tools and record results:
- [ ] **Google PageSpeed Insights** (mobile and desktop scores)
- [ ] **GTmetrix** (waterfall analysis)
- [ ] **WebPageTest** (TTFB, full load time, requests)

Specific metrics:
- [ ] LCP value and what element is the LCP
- [ ] CLS value and what causes layout shifts
- [ ] INP value
- [ ] TTFB (Time to First Byte) -- indicates hosting/server quality
- [ ] Total page weight (target: under 2MB for typical pages)
- [ ] Total HTTP requests (target: under 50 for typical pages)
- [ ] Is a caching plugin active and configured?
- [ ] Is an object cache (Redis/Memcached) in use?
- [ ] Are images optimized and served in modern formats?
- [ ] Are fonts self-hosted or loaded from external CDNs?
- [ ] Is CSS/JS minified and concatenated?
- [ ] Are unused CSS/JS assets loading on pages that don't need them?

## 4. SEO Audit

- [ ] Is an SEO plugin installed and configured? (Yoast, Rank Math, etc.)
- [ ] Does every page have a unique title tag and meta description?
- [ ] Is the heading hierarchy correct? (One H1 per page, logical nesting)
- [ ] Is there a working XML sitemap? Is it submitted to Search Console?
- [ ] Are there crawl errors in Search Console?
- [ ] Is robots.txt properly configured?
- [ ] Are canonical URLs set correctly?
- [ ] Is schema markup implemented? What types?
- [ ] Are there broken internal or external links?
- [ ] Is the URL structure clean and logical?
- [ ] Are images using descriptive alt text?
- [ ] Is the site indexed properly? (site:domain.com in Google)
- [ ] Are there thin or duplicate content pages?
- [ ] Is there a 301 redirect strategy for old/changed URLs?

## 5. Content and Information Architecture

- [ ] How many pages exist? How many are meaningful?
- [ ] Is the navigation structure logical and shallow (3 clicks to any page)?
- [ ] Are there custom post types? Are they used correctly?
- [ ] Is content structured with ACF/custom fields or dumped into the WYSIWYG editor?
- [ ] Is there a blog? When was the last post published?
- [ ] Are there orphan pages (not linked from navigation or other pages)?
- [ ] Is there a clear conversion path on each page type?
- [ ] Does the homepage communicate the value proposition immediately?

## 6. Design and UX Audit

- [ ] Is there a consistent visual design system (colors, typography, spacing)?
- [ ] Does the site look professional and current or dated?
- [ ] Is the design responsive across mobile, tablet, and desktop?
- [ ] Are touch targets appropriately sized on mobile (44x44px minimum)?
- [ ] Is body text readable (size, contrast, line length, line height)?
- [ ] Are CTAs clear and visually prominent?
- [ ] Is the overall layout cluttered or focused?
- [ ] Do forms work correctly and have clear validation?
- [ ] Is there a 404 page that helps users navigate?

## 7. Accessibility Audit

Run axe DevTools or WAVE and record findings:
- [ ] Total accessibility violations found
- [ ] Are all images using alt text?
- [ ] Is color contrast WCAG AA compliant?
- [ ] Can the entire site be navigated by keyboard?
- [ ] Are form inputs properly labeled?
- [ ] Is there a "Skip to content" link?
- [ ] Are focus indicators visible?
- [ ] Is the site navigable with a screen reader?
- [ ] Are ARIA attributes used correctly (or overused)?

## 8. Security Audit

- [ ] Is SSL/HTTPS active on all pages?
- [ ] Is the WordPress admin URL changed or protected?
- [ ] Are login attempts rate-limited?
- [ ] Is two-factor authentication enabled for admins?
- [ ] Are file permissions set correctly?
- [ ] Is XML-RPC disabled if not needed?
- [ ] Is there a security plugin active? (Wordfence, Sucuri, iThemes Security)
- [ ] When was the last backup taken? Is there an automated backup schedule?
- [ ] Are there any known vulnerabilities in installed plugins/themes?

## 9. Hosting and Infrastructure

- [ ] What hosting provider and plan?
- [ ] What server stack? (Apache/Nginx, PHP version, MySQL version)
- [ ] Is there a CDN active?
- [ ] Is there a staging environment for testing changes?
- [ ] What is the uptime track record?
- [ ] Is there server-level caching?
- [ ] What is the geographic server location relative to the target audience?

## Scoring and Prioritization

After completing the audit, score each section 1-5:

| Section | Score (1-5) | Priority | Notes |
|---------|------------|----------|-------|
| Theme/Structure | | | |
| Plugins | | | |
| Performance | | | |
| SEO | | | |
| Content/IA | | | |
| Design/UX | | | |
| Accessibility | | | |
| Security | | | |
| Hosting | | | |

Priority order for the overhaul should generally be:
1. Security issues (fix immediately)
2. Hosting/infrastructure (foundation must be solid)
3. Theme/structure (determines what's possible)
4. Performance (affects everything)
5. SEO (preserves existing value)
6. Design/UX (the visible transformation)
7. Content/IA (ongoing work)
8. Accessibility (integrate throughout)