# DESIGN.md

## Design Philosophy

Build a premium modern fashion ecommerce experience.

The UI should feel:
- Minimal
- Elegant
- Clean
- Premium
- Spacious
- Smooth
- Modern

Avoid:
- Overly colorful UI
- Heavy gradients
- Thick borders
- Crowded layouts
- Excessive animations
- Generic “AI-looking” designs

The experience should resemble:
- Apple
- Shopify
- Zara
- Linear

---

# Brand Personality

The brand is:
- Modern
- Fashion-forward
- Premium
- Youthful
- Minimal

Tone:
- Confident
- Clean
- Elegant
- Simple

---

# Color System

## Base Colors

Background:
- #FFFFFF

Foreground:
- #0F0F0F

Secondary Background:
- #F5F5F5

Muted Background:
- #FAFAFA

Border:
- #E5E7EB

Primary:
- #111111

Primary Hover:
- #222222

Text Secondary:
- #6B7280

Danger:
- #EF4444

Success:
- #22C55E

Avoid using strong saturated colors.

---

# Typography

Use:
- Inter
or
- Geist

Typography style:
- Clean
- Sharp
- Minimal

## Font Sizes

Hero Title:
- 56px
- font-weight: 700

Section Title:
- 32px
- font-weight: 600

Card Title:
- 18px
- font-weight: 600

Body:
- 15px to 16px

Small Text:
- 13px to 14px

Line height should feel spacious.

Avoid dense text blocks.

---

# Spacing

Use generous whitespace.

Spacing scale:
- 4
- 8
- 12
- 16
- 24
- 32
- 48
- 64

Sections should breathe.

Never cram components together.

---

# Border Radius

Cards:
- 16px

Buttons:
- 14px

Inputs:
- 12px

Images:
- 20px

Avoid sharp corners.

---

# Shadows

Use soft subtle shadows only.

Example:
- shadow-sm
- shadow-md

Never use heavy dark shadows.

---

# Layout

Use a clean grid system.

Desktop container:
- max-width: 1280px

Product cards should have:
- Large imagery
- Clean typography
- Minimal distractions

Homepage should prioritize:
1. Hero banner
2. Featured products
3. Categories
4. New arrivals
5. Promotions
6. Newsletter

---

# Navbar

Style:
- Sticky
- Transparent on top
- Blur background on scroll

Navbar should feel premium and lightweight.

Include:
- Logo
- Categories
- Search
- Cart
- Profile

---

# Buttons

Primary Button:
- Black background
- White text
- Smooth hover

Secondary Button:
- White background
- Black border

Buttons should feel soft and modern.

No neon colors.

---

# Product Cards

Product cards should contain:
- Large product image
- Product name
- Price
- Optional rating

Hover effects:
- Slight image zoom
- Soft shadow increase

Avoid excessive overlays.

---

# Product Detail Page

Layout:
- Large gallery on left
- Product info on right

Include:
- Size selection
- Color selection
- Quantity selector
- Add to cart
- Buy now

The product image must dominate visually.

---

# Cart UI

Cart should feel:
- Simple
- Fast
- Minimal

Avoid clutter.

Show:
- Product image
- Name
- Variant
- Quantity
- Price

Use clean dividers.

---

# Checkout Experience

Checkout must feel:
- Trustworthy
- Calm
- Simple

Use:
- Step-by-step layout
- Minimal distractions

Prioritize readability.

---

# Animations

Use subtle smooth animations.

Preferred:
- Fade in
- Slide up
- Soft hover transitions

Duration:
- 150ms to 300ms

Avoid:
- Bounce animations
- Aggressive motion
- Over-animated UI

Use Framer Motion sparingly.

---

# Icons

Use:
- Lucide Icons

Icons should be:
- Thin
- Clean
- Minimal

---

# Forms

Inputs should be:
- Large
- Comfortable
- Minimal

Focus state:
- Soft ring
- Subtle border highlight

Avoid glowing effects.

---

# Mobile Experience

Mobile-first design.

Spacing and typography should remain breathable.

Bottom navigation is allowed on mobile.

Touch targets must be large.

---

# Dark Mode

Dark mode should feel:
- Elegant
- Cinematic
- Premium

Dark Background:
- #090909

Card Background:
- #111111

Text:
- #F5F5F5

Borders:
- #262626

Avoid pure black everywhere.

---

# Admin Dashboard

Admin dashboard style:
- Linear inspired
- Minimal
- Professional

Use:
- Sidebar
- Soft backgrounds
- Clean tables
- Rounded cards

Dashboard should feel modern SaaS.

---

# Component Rules

Always:
- Use consistent spacing
- Keep layouts clean
- Maintain visual hierarchy
- Prioritize readability

Never:
- Over-design components
- Use random colors
- Mix too many styles
- Add unnecessary decorations

---

# Tech Preferences

Preferred stack:
- React
- Vite
- TailwindCSS
- shadcn/ui
- Framer Motion

Use Tailwind utility classes cleanly.

Prefer reusable components.

---

# AI Instructions

When generating UI:
- Prioritize premium minimalism
- Maintain consistency
- Keep spacing generous
- Use modern ecommerce patterns
- Focus on product imagery
- Avoid generic template appearance

All pages must feel like part of the same design system.