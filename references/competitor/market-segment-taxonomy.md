# Market Segment Taxonomy

A classification system for mapping competitors into market segments. The classifier agent uses website signals to determine each entity's position across four dimensions.

---

## Industry Verticals

Classify each competitor into one primary vertical based on homepage messaging, product descriptions, and customer references.

| Vertical | Website Signals |
|----------|----------------|
| SaaS / Software | App screenshots, login buttons, "platform" language, API docs, changelog |
| E-commerce / Retail | Product catalog, shopping cart, shipping info, product reviews |
| Agency / Services | "We help...", client logos, case studies, team bios, "contact us for a quote" |
| Media / Publishing | Article feeds, author bylines, subscription prompts, ad placements |
| Marketplace | Two-sided messaging (buyers + sellers/providers), listing pages, search/filter UI |
| FinTech | Financial product language, compliance badges, security certifications, banking integrations |
| HealthTech | HIPAA mentions, clinical language, provider/patient portals, health data references |
| EdTech | Course catalogs, learning paths, student/instructor language, LMS features |
| Real Estate | Property listings, agent profiles, MLS references, virtual tours |
| Manufacturing / Industrial | Product specs, CAD downloads, distributor locators, certifications |
| Construction / Trades | Service area pages, project galleries, license numbers, brand dealer badges |
| Hospitality / Food | Menus, reservations, location hours, delivery integrations |
| Professional Services | Credentials (CPA, JD, etc.), practice areas, partner bios, regulatory references |
| Non-profit | Mission statement, donate button, impact reports, volunteer sign-up |
| Infrastructure / DevTools | CLI documentation, GitHub links, "deploy" language, pricing by usage/compute |

If a competitor spans multiple verticals, assign the **primary** vertical (where >50% of homepage messaging focuses) and note the secondary in the `evidence` field.

---

## Business Models

Determine from pricing pages, product language, and customer references.

| Model | Detection Signals |
|-------|-------------------|
| **B2B** | "Teams", "enterprise", "per seat", company logos as social proof, demo request CTAs, SOC 2 / compliance badges |
| **B2C** | Individual-focused language ("you", "your"), consumer pricing, app store badges, personal testimonials |
| **B2B2C** | Both business and end-user messaging, partner programs, white-label mentions, API-first language |
| **D2C** | Brand-owned product, no third-party retailers prominent, "shop now" CTAs, shipping/returns policy |
| **Marketplace** | Separate buyer/seller flows, commission language, "list your...", two-sided trust signals |
| **Hybrid** | Mixed signals from above -- note the primary model and the secondary |

---

## Target Segment Size

Determine from pricing tiers, customer logos, feature messaging, and sales process indicators.

| Segment | Detection Signals |
|---------|-------------------|
| **Enterprise** (1000+ employees) | "Contact sales", custom pricing, SSO/SAML, audit logs, SLAs, Fortune 500 logos, compliance certifications |
| **Mid-Market** (100-1000) | Named pricing tiers with "business" or "professional" labels, team management features, moderate price points ($50-500/mo) |
| **SMB** (10-100) | Self-serve signup, monthly pricing under $100, "small business" language, simple onboarding |
| **Prosumer / PLG** (1-10) | Freemium model, individual plans, "get started free", product-led growth indicators, viral/sharing features |
| **Consumer** | App store presence, individual pricing, personal use cases, no business features |

---

## Pricing Models

Detect from pricing pages. If no pricing page exists, note `"not_found"`.

| Model | Detection Signals |
|-------|-------------------|
| **Per-seat** | "Per user/month", team size sliders, "add seats" |
| **Usage-based** | "Pay for what you use", metered billing, usage tiers, API call pricing |
| **Flat-rate** | Single price for all features, "one plan" messaging |
| **Freemium** | Free tier prominently displayed, "upgrade" CTAs, feature gating |
| **Enterprise-custom** | "Contact us for pricing", "request a quote", no public prices |
| **Quote-based** | "Get a free estimate", "request a quote" for services, no fixed pricing |
| **Subscription-tiered** | 2-4 named tiers (e.g., Starter / Pro / Enterprise), feature comparison table |

---

## Classification Confidence

| Level | Criteria |
|-------|----------|
| **High** | Clear signals from homepage + pricing page + about page. Unambiguous positioning. |
| **Medium** | Signals from homepage only, or some ambiguity between categories. |
| **Low** | Minimal website content, site under construction, or genuinely ambiguous positioning. |

Always include the specific evidence that led to each classification decision in the `evidence` field.
