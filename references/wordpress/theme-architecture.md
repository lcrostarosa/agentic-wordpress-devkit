# Theme Architecture Reference

## Block Themes (Full Site Editing)

Block themes use the Site Editor and theme.json for global configuration. Templates and template parts are HTML files containing block markup.

### Directory Structure

```
theme-name/
├── style.css              # Theme metadata (required)
├── theme.json             # Global settings and styles
├── functions.php          # Enqueue, hooks, custom logic
├── templates/             # Full page templates
│   ├── index.html         # Fallback (required)
│   ├── single.html        # Single posts
│   ├── page.html          # Static pages
│   ├── archive.html       # Archive/listing pages
│   ├── 404.html           # Not found
│   ├── search.html        # Search results
│   └── home.html          # Blog homepage
├── parts/                 # Reusable template parts
│   ├── header.html
│   ├── footer.html
│   └── sidebar.html
├── patterns/              # Block patterns
│   ├── hero.php
│   ├── cta.php
│   └── testimonials.php
└── assets/
    ├── fonts/
    ├── images/
    └── css/
```

### theme.json Essentials

```json
{
  "$schema": "https://schemas.wp.org/trunk/theme.json",
  "version": 3,
  "settings": {
    "appearanceTools": true,
    "color": {
      "palette": [
        { "slug": "primary", "color": "#1a1a2e", "name": "Primary" },
        { "slug": "secondary", "color": "#16213e", "name": "Secondary" },
        { "slug": "accent", "color": "#e94560", "name": "Accent" },
        { "slug": "surface", "color": "#f8f9fa", "name": "Surface" },
        { "slug": "on-surface", "color": "#212529", "name": "On Surface" }
      ],
      "defaultPalette": false,
      "defaultGradients": false
    },
    "typography": {
      "fontFamilies": [
        {
          "fontFamily": "'DM Sans', sans-serif",
          "slug": "body",
          "name": "Body",
          "fontFace": [
            {
              "fontFamily": "DM Sans",
              "fontWeight": "400 700",
              "fontStyle": "normal",
              "fontDisplay": "swap",
              "src": ["file:./assets/fonts/dm-sans-variable.woff2"]
            }
          ]
        },
        {
          "fontFamily": "'Fraunces', serif",
          "slug": "heading",
          "name": "Heading",
          "fontFace": [
            {
              "fontFamily": "Fraunces",
              "fontWeight": "400 900",
              "fontStyle": "normal",
              "fontDisplay": "swap",
              "src": ["file:./assets/fonts/fraunces-variable.woff2"]
            }
          ]
        }
      ],
      "fontSizes": [
        { "slug": "small", "size": "0.875rem", "name": "Small" },
        { "slug": "medium", "size": "1rem", "name": "Medium" },
        { "slug": "large", "size": "1.25rem", "name": "Large" },
        { "slug": "x-large", "size": "1.75rem", "name": "Extra Large" },
        { "slug": "xx-large", "size": "2.5rem", "name": "2XL" }
      ],
      "fluid": true
    },
    "spacing": {
      "spacingScale": {
        "steps": 7,
        "mediumStep": 1.5,
        "unit": "rem",
        "operator": "*",
        "increment": 1.5
      }
    },
    "layout": {
      "contentSize": "720px",
      "wideSize": "1200px"
    }
  },
  "styles": {
    "typography": {
      "fontFamily": "var(--wp--preset--font-family--body)",
      "fontSize": "var(--wp--preset--font-size--medium)",
      "lineHeight": "1.65"
    },
    "elements": {
      "heading": {
        "typography": {
          "fontFamily": "var(--wp--preset--font-family--heading)",
          "fontWeight": "700",
          "lineHeight": "1.2"
        }
      },
      "link": {
        "color": {
          "text": "var(--wp--preset--color--accent)"
        },
        ":hover": {
          "color": {
            "text": "var(--wp--preset--color--primary)"
          }
        }
      }
    }
  }
}
```

### Block Pattern Example

```php
<?php
/**
 * Title: Hero Section
 * Slug: theme-name/hero
 * Categories: featured
 * Keywords: hero, banner, header
 */
?>
<!-- wp:group {"align":"full","style":{"spacing":{"padding":{"top":"var:preset|spacing|60","bottom":"var:preset|spacing|60"}}},"backgroundColor":"primary","textColor":"surface","layout":{"type":"constrained"}} -->
<div class="wp-block-group alignfull has-primary-background-color has-surface-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--60);padding-bottom:var(--wp--preset--spacing--60)">
  <!-- wp:heading {"textAlign":"center","level":1,"fontSize":"xx-large"} -->
  <h1 class="wp-block-heading has-text-align-center has-xx-large-font-size">Your Headline Here</h1>
  <!-- /wp:heading -->
  <!-- wp:paragraph {"align":"center","fontSize":"large"} -->
  <p class="has-text-align-center has-large-font-size">Supporting text that explains your value proposition clearly and concisely.</p>
  <!-- /wp:paragraph -->
  <!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
  <div class="wp-block-buttons">
    <!-- wp:button {"backgroundColor":"accent","textColor":"surface"} -->
    <div class="wp-block-button"><a class="wp-block-button__link has-surface-color has-accent-background-color has-text-color has-background wp-element-button">Get Started</a></div>
    <!-- /wp:button -->
  </div>
  <!-- /wp:buttons -->
</div>
<!-- /wp:group -->
```

## Classic Themes

### Template Hierarchy

WordPress loads templates in a specific order of specificity. Understanding this hierarchy is essential for classic theme development:

```
single-{post-type}-{slug}.php
  → single-{post-type}.php
    → single.php
      → singular.php
        → index.php

page-{slug}.php
  → page-{id}.php
    → page.php
      → singular.php
        → index.php

archive-{post-type}.php
  → archive.php
    → index.php

category-{slug}.php
  → category-{id}.php
    → category.php
      → archive.php
        → index.php

taxonomy-{taxonomy}-{term}.php
  → taxonomy-{taxonomy}.php
    → taxonomy.php
      → archive.php
        → index.php
```

### Child Theme Setup

```php
<?php
// functions.php -- child theme
function child_theme_enqueue_styles() {
    // Enqueue parent theme stylesheet
    wp_enqueue_style(
        'parent-style',
        get_template_directory_uri() . '/style.css',
        [],
        wp_get_theme()->parent()->get('Version')
    );

    // Enqueue child theme stylesheet
    wp_enqueue_style(
        'child-style',
        get_stylesheet_directory_uri() . '/style.css',
        ['parent-style'],
        wp_get_theme()->get('Version')
    );
}
add_action('wp_enqueue_scripts', 'child_theme_enqueue_styles');
```

## Page Builder Comparison

| Feature | Elementor Pro | Bricks | Oxygen | Beaver Builder |
|---------|--------------|--------|--------|----------------|
| Markup quality | Heavy, nested divs | Clean, semantic | Clean, semantic | Moderate |
| Performance | Heavier baseline | Lightweight | Lightweight | Moderate |
| Learning curve | Low | Medium | High | Low |
| Template ecosystem | Massive | Growing | Small | Moderate |
| Dynamic data | Good | Excellent | Excellent | Limited |
| WooCommerce | Full builder | Full builder | Full builder | Basic |
| Pricing model | Subscription | Lifetime available | Lifetime | Subscription |
| Theme dependency | Needs Hello or similar | IS the theme | IS the theme | Works with any |

### Bricks Builder Quick Start

Bricks replaces the theme entirely. Install Bricks as a theme, then build templates in the Bricks editor.

Key concepts:
- **Templates** map to WordPress template hierarchy (header, footer, single, archive, etc.)
- **Conditions** control where templates display (e.g., "All Pages", "Single Posts in Category X")
- **Dynamic data** uses `{post_title}`, `{post_content}`, `{acf_field_name}` syntax
- **Custom elements** can be created with PHP for reusable components

### Elementor Performance Tips

If using Elementor, minimize performance impact:
- Use Hello Starter theme (minimal baseline)
- Disable unused widgets in Elementor settings
- Use Elementor's built-in CSS/JS optimization
- Avoid nesting sections inside sections inside sections
- Use CSS Grid via custom CSS instead of Elementor's column system for complex layouts
- Set breakpoints intentionally rather than relying on defaults