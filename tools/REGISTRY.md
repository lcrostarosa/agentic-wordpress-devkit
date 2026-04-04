# Tools Registry

Quick reference for AI agents to discover tool capabilities and integration methods.

## How to Use This Registry

1. **Find tools by category** — Browse sections below for tools in each domain
2. **Check integration methods** — See what APIs, MCPs, CLIs, or SDKs are available
3. **Read integration guides** — Detailed setup and common operations in `integrations/`

---

## Tool Index

| Tool | Category | API | MCP | CLI | SDK | Guide |
|------|----------|:---:|:---:|:---:|:---:|-------|
| adobe-analytics | Analytics | ✓ | - | [✓](clis/adobe-analytics.js) | ✓ | [adobe-analytics.md](integrations/adobe-analytics.md) |
| posthog | Analytics | ✓ | - | - | ✓ | [posthog.md](integrations/posthog.md) |
| segment | CDP | ✓ | - | [✓](clis/segment.js) | ✓ | [segment.md](integrations/segment.md) |
| google-search-console | SEO | ✓ | - | [✓](clis/google-search-console.js) | ✓ | [google-search-console.md](integrations/google-search-console.md) |
| close | CRM | ✓ | - | [✓](clis/close.js) | - | [close.md](integrations/close.md) |
| paddle | Payments | ✓ | - | [✓](clis/paddle.js) | ✓ | [paddle.md](integrations/paddle.md) |
| google-ads | Ads | ✓ | ✓ | [✓](clis/google-ads.js) | ✓ | [google-ads.md](integrations/google-ads.md) |
| linkedin-ads | Ads | ✓ | - | [✓](clis/linkedin-ads.js) | - | [linkedin-ads.md](integrations/linkedin-ads.md) |
| tiktok-ads | Ads | ✓ | - | [✓](clis/tiktok-ads.js) | ✓ | [tiktok-ads.md](integrations/tiktok-ads.md) |
| zapier | Automation | ✓ | ✓ | [✓](clis/zapier.js) | - | [zapier.md](integrations/zapier.md) |
| calendly | Scheduling | ✓ | - | [✓](clis/calendly.js) | - | [calendly.md](integrations/calendly.md) |
| outreach | Sales Engagement | ✓ | ✓ | [✓](clis/outreach.js) | - | [outreach.md](integrations/outreach.md) |
| firehose | Competitive Intelligence | ✓ | - | - | - | [firehose.md](integrations/firehose.md) |
| wordpress | CMS | ✓ | - | - | ✓ | [wordpress.md](integrations/wordpress.md) |

---

## By Category

### Analytics

Track user behavior, measure conversions, and analyze marketing performance.

- **[Adobe Analytics](integrations/adobe-analytics.md)** — Enterprise analytics with report suites, eVars, cross-channel attribution. CLI: `node clis/adobe-analytics.js`
- **[PostHog](integrations/posthog.md)** — Open-source product analytics with session replay, feature flags, and HogQL queries. API only.
- **[Segment](integrations/segment.md)** — Customer data platform for event routing, identity resolution, and audience management. CLI: `node clis/segment.js`

### SEO

Search engine optimization data and tools.

- **[Google Search Console](integrations/google-search-console.md)** — Search performance data, URL inspection, sitemaps, keyword opportunities. CLI: `node clis/google-search-console.js`

### CRM

Customer relationship management and sales pipeline.

- **[Close](integrations/close.md)** — SMB CRM with leads, contacts, opportunities, and task management. CLI: `node clis/close.js`

### Payments

Billing, subscriptions, and revenue management.

- **[Paddle](integrations/paddle.md)** — SaaS billing with subscriptions, products, pricing, transactions, and tax compliance. CLI: `node clis/paddle.js`

### Ads

Paid advertising campaign management across platforms.

- **[Google Ads](integrations/google-ads.md)** — PPC campaigns with GAQL queries, ad groups, keywords, performance reports. CLI: `node clis/google-ads.js`
- **[LinkedIn Ads](integrations/linkedin-ads.md)** — B2B advertising with URN-based targeting, job titles, lead gen forms. CLI: `node clis/linkedin-ads.js`
- **[TikTok Ads](integrations/tiktok-ads.md)** — Video advertising with campaign management and audience targeting. CLI: `node clis/tiktok-ads.js`

### Automation

Workflow orchestration and integration platforms.

- **[Zapier](integrations/zapier.md)** — Workflow automation with Zap management, webhooks, and task history. CLI: `node clis/zapier.js`

### Scheduling

Meeting booking and availability management.

- **[Calendly](integrations/calendly.md)** — Event types, scheduled events, invitees, and availability checks. CLI: `node clis/calendly.js`

### Sales Engagement

Outbound sales sequences and prospect management.

- **[Outreach](integrations/outreach.md)** — Sales engagement sequences, prospects, and outbound campaign management. CLI: `node clis/outreach.js`

### Competitive Intelligence

Market monitoring and competitive analysis data.

- **[Firehose](integrations/firehose.md)** — Real-time web monitoring with brand mentions, competitive intel, and Lucene query syntax. API only.

### CMS

Content management systems and publishing APIs.

- **[WordPress](integrations/wordpress.md)** — REST API and WP-CLI for posts, pages, media, categories, and tags.

---

## CLI Tools

All CLI tools in `clis/` are zero-dependency Node.js scripts (Node 18+). They share a common interface:

```bash
node clis/<tool>.js                    # Show usage/help
node clis/<tool>.js <command> --dry-run  # Preview request without sending
node clis/<tool>.js <command>            # Execute
```

**Features:**
- Environment variable authentication (one key per tool)
- `--dry-run` flag to preview API requests without sending
- JSON output for piping and parsing
- Zero external dependencies

**Available CLIs:** adobe-analytics, calendly, close, google-ads, google-search-console, linkedin-ads, outreach, paddle, segment, tiktok-ads, zapier
