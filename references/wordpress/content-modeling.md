# Content Modeling for WordPress

## Philosophy

Good content modeling separates content from presentation. The goal is to let content editors work with structured, meaningful fields rather than fighting with a visual editor to replicate a design.

## Custom Post Types

Register custom post types for distinct content entities:

```php
function theme_register_post_types() {
    // Services
    register_post_type('service', [
        'labels' => [
            'name'          => 'Services',
            'singular_name' => 'Service',
            'add_new_item'  => 'Add New Service',
            'edit_item'     => 'Edit Service',
        ],
        'public'       => true,
        'has_archive'  => true,
        'rewrite'      => ['slug' => 'services'],
        'supports'     => ['title', 'editor', 'thumbnail', 'excerpt'],
        'show_in_rest' => true, // Required for Gutenberg support
        'menu_icon'    => 'dashicons-hammer',
    ]);

    // Team Members
    register_post_type('team_member', [
        'labels' => [
            'name'          => 'Team Members',
            'singular_name' => 'Team Member',
        ],
        'public'       => true,
        'has_archive'  => false,
        'rewrite'      => ['slug' => 'team'],
        'supports'     => ['title', 'thumbnail'],
        'show_in_rest' => true,
        'menu_icon'    => 'dashicons-groups',
    ]);

    // Projects / Portfolio
    register_post_type('project', [
        'labels' => [
            'name'          => 'Projects',
            'singular_name' => 'Project',
        ],
        'public'       => true,
        'has_archive'  => true,
        'rewrite'      => ['slug' => 'projects'],
        'supports'     => ['title', 'editor', 'thumbnail', 'excerpt'],
        'show_in_rest' => true,
        'menu_icon'    => 'dashicons-portfolio',
    ]);

    // Testimonials
    register_post_type('testimonial', [
        'labels' => [
            'name'          => 'Testimonials',
            'singular_name' => 'Testimonial',
        ],
        'public'       => false,
        'show_ui'      => true,
        'supports'     => ['title'],
        'show_in_rest' => true,
        'menu_icon'    => 'dashicons-format-quote',
    ]);
}
add_action('init', 'theme_register_post_types');
```

## Custom Taxonomies

```php
function theme_register_taxonomies() {
    // Service Categories
    register_taxonomy('service_category', 'service', [
        'labels' => [
            'name'          => 'Service Categories',
            'singular_name' => 'Service Category',
        ],
        'hierarchical' => true,
        'public'       => true,
        'rewrite'      => ['slug' => 'service-category'],
        'show_in_rest' => true,
    ]);

    // Project Types
    register_taxonomy('project_type', 'project', [
        'labels' => [
            'name'          => 'Project Types',
            'singular_name' => 'Project Type',
        ],
        'hierarchical' => true,
        'public'       => true,
        'rewrite'      => ['slug' => 'project-type'],
        'show_in_rest' => true,
    ]);
}
add_action('init', 'theme_register_taxonomies');
```

## ACF Field Group Patterns

### Service Page Fields

```php
// Register via PHP (alternative to ACF GUI)
if (function_exists('acf_add_local_field_group')) {
    acf_add_local_field_group([
        'key'      => 'group_service_details',
        'title'    => 'Service Details',
        'fields'   => [
            [
                'key'   => 'field_service_tagline',
                'label' => 'Tagline',
                'name'  => 'service_tagline',
                'type'  => 'text',
                'instructions' => 'Short description shown in cards and listings (max 120 characters)',
                'maxlength' => 120,
            ],
            [
                'key'   => 'field_service_icon',
                'label' => 'Service Icon',
                'name'  => 'service_icon',
                'type'  => 'image',
                'return_format' => 'id',
                'preview_size'  => 'thumbnail',
            ],
            [
                'key'   => 'field_service_features',
                'label' => 'Key Features',
                'name'  => 'service_features',
                'type'  => 'repeater',
                'layout' => 'block',
                'sub_fields' => [
                    [
                        'key'   => 'field_feature_title',
                        'label' => 'Feature Title',
                        'name'  => 'title',
                        'type'  => 'text',
                    ],
                    [
                        'key'   => 'field_feature_description',
                        'label' => 'Description',
                        'name'  => 'description',
                        'type'  => 'textarea',
                        'rows'  => 3,
                    ],
                ],
            ],
            [
                'key'   => 'field_service_cta_text',
                'label' => 'CTA Button Text',
                'name'  => 'cta_text',
                'type'  => 'text',
                'default_value' => 'Get a Quote',
            ],
            [
                'key'   => 'field_service_cta_link',
                'label' => 'CTA Link',
                'name'  => 'cta_link',
                'type'  => 'link',
            ],
        ],
        'location' => [
            [
                [
                    'param'    => 'post_type',
                    'operator' => '==',
                    'value'    => 'service',
                ],
            ],
        ],
    ]);
}
```

### Team Member Fields

Typical field group for a team/about page:
- **Position/Title** (text)
- **Bio** (wysiwyg, limited toolbar)
- **Email** (email)
- **Phone** (text)
- **Social Links** (repeater: platform select + URL)
- **Headshot** (image, with crop guidance)
- **Display Order** (number, for manual sort control)

### Testimonial Fields

- **Client Name** (text)
- **Client Title/Company** (text)
- **Quote** (textarea)
- **Rating** (number, 1-5)
- **Client Photo** (image, optional)
- **Related Service** (relationship to service post type)

### Flexible Content for Landing Pages

ACF Flexible Content creates a "layout builder" experience with predefined sections:

```php
[
    'key'   => 'field_page_sections',
    'label' => 'Page Sections',
    'name'  => 'page_sections',
    'type'  => 'flexible_content',
    'layouts' => [
        'hero' => [
            'key'   => 'layout_hero',
            'name'  => 'hero',
            'label' => 'Hero Section',
            'sub_fields' => [/* heading, subheading, background image, CTA */],
        ],
        'features_grid' => [
            'key'   => 'layout_features',
            'name'  => 'features_grid',
            'label' => 'Features Grid',
            'sub_fields' => [/* repeater of icon + title + description */],
        ],
        'testimonial_slider' => [
            'key'   => 'layout_testimonials',
            'name'  => 'testimonial_slider',
            'label' => 'Testimonial Slider',
            'sub_fields' => [/* relationship to testimonial CPT */],
        ],
        'cta_banner' => [
            'key'   => 'layout_cta',
            'name'  => 'cta_banner',
            'label' => 'CTA Banner',
            'sub_fields' => [/* heading, description, button text, button link, background color */],
        ],
        'faq' => [
            'key'   => 'layout_faq',
            'name'  => 'faq',
            'label' => 'FAQ Section',
            'sub_fields' => [/* repeater of question + answer */],
        ],
    ],
]
```

### Rendering Flexible Content in Templates

```php
<?php if (have_rows('page_sections')) : ?>
    <?php while (have_rows('page_sections')) : the_row(); ?>
        <?php
        $layout = get_row_layout();
        get_template_part('template-parts/sections/section', $layout);
        ?>
    <?php endwhile; ?>
<?php endif; ?>
```

Each section lives in `template-parts/sections/section-{layout-name}.php`, keeping the main template clean and each section independently maintainable.

## Content Strategy Tips

- **Avoid "page builder in a field"** -- ACF WYSIWYG fields that contain entire page layouts defeat the purpose. Keep fields atomic and purposeful.
- **Use relationship fields** instead of duplicating content. If a testimonial appears on multiple service pages, create it once as a testimonial post and relate it.
- **Set sensible defaults** for every field so new content looks acceptable even before customization.
- **Add instructions to every field** explaining what it does, where it appears, and any constraints (character limits, image dimensions).
- **Use conditional logic** to show/hide fields based on other selections, keeping the editor interface clean.

## Options Pages

For site-wide settings that don't belong to any specific post:

```php
if (function_exists('acf_add_options_page')) {
    acf_add_options_page([
        'page_title' => 'Site Settings',
        'menu_title' => 'Site Settings',
        'menu_slug'  => 'site-settings',
        'capability' => 'manage_options',
        'position'   => 2,
        'icon_url'   => 'dashicons-admin-settings',
    ]);

    acf_add_options_sub_page([
        'page_title'  => 'Header & Footer',
        'menu_title'  => 'Header & Footer',
        'parent_slug' => 'site-settings',
    ]);

    acf_add_options_sub_page([
        'page_title'  => 'Social Media',
        'menu_title'  => 'Social Media',
        'parent_slug' => 'site-settings',
    ]);
}
```

Common options page fields: company info (name, address, phone, email), social media URLs, default CTA text/link, Google Analytics/Tag Manager IDs, business hours, and global announcement bar content.