---
name: frontend-design
description: 'UI/UX design, wireframes, design systems, responsive layouts, animations, and design quality review for production-ready interfaces. Expert in Three.js, WebGL, Tailwind CSS, shadcn/ui, and Vietnamese typography.'
---

# Frontend Design Skill

Elite UI/UX design skill: creating exceptional user interfaces combining trending design awareness, accessibility, and technical excellence.

## Design Principles

- **Mobile-First**: Always start with mobile, scale up to desktop
- **Accessibility**: WCAG 2.1 AA minimum (4.5:1 contrast ratio)
- **Performance**: Optimize animations, use prefers-reduced-motion
- **Conversion-Focused**: Every design decision serves user goals
- **Brand-Driven**: Maintain visual coherence and identity
- **Vietnamese-Ready**: All fonts must support Vietnamese diacritical marks

## Design Research Process

Before any design work:
1. Research trending designs on Dribbble, Behance, Awwwards
2. Analyze top competitors and market patterns
3. Review `./docs/design-guidelines.md` for existing patterns
4. If file doesn't exist, create it with foundational design system

## Technology Stack

### CSS Frameworks
- **Tailwind CSS**: Utility-first, highly customizable
- **shadcn/ui**: Pre-built accessible components
- **Vanilla CSS**: Maximum control for custom designs

### Animation Libraries
- **Framer Motion**: React animations
- **GSAP**: High-performance animations
- **CSS Animations**: Lightweight micro-interactions
- **Three.js / WebGL**: 3D and immersive experiences

### Typography (Vietnamese Support Required)
Preferred Google Fonts with Vietnamese character support:
- **Be Vietnam Pro** — Modern, versatile
- **Inter** — Clean, readable
- **Nunito** — Friendly, rounded
- **Source Sans 3** — Professional
- **Noto Sans** — Universal coverage

## Design System Template

```css
/* Design Tokens */
:root {
  /* Colors */
  --color-primary: hsl(220, 90%, 56%);
  --color-primary-dark: hsl(220, 90%, 40%);
  --color-surface: hsl(220, 20%, 10%);
  --color-text: hsl(220, 20%, 95%);
  --color-muted: hsl(220, 10%, 60%);

  /* Spacing */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 2rem;
  --space-xl: 4rem;

  /* Typography */
  --font-family: 'Be Vietnam Pro', sans-serif;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.25rem;
  --font-size-xl: 1.5rem;
  --font-size-2xl: 2rem;
  --font-size-3xl: 3rem;

  /* Borders */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 20px 40px rgba(0,0,0,0.5);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms ease;
}
```

## Component Guidelines

### Interactive Elements
- Minimum touch target: 44×44px
- Always provide hover, focus, and active states
- Use `cursor: pointer` for clickable elements
- Visible focus ring for keyboard navigation

### Responsive Breakpoints
```css
/* Mobile first */
/* xs: 0px+ (default) */
/* sm: 640px+ */
/* md: 768px+ */
/* lg: 1024px+ */
/* xl: 1280px+ */
/* 2xl: 1536px+ */
```

### Animation Standards
```css
/* Prefer transform and opacity — GPU composited */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Always respect user preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; }
}
```

## Quality Checklist

Before delivering any UI work:
- [ ] Mobile view tested (320px+)
- [ ] Tablet view tested (768px+)
- [ ] Desktop view tested (1024px+)
- [ ] Color contrast meets WCAG AA
- [ ] All text renders Vietnamese diacritical marks
- [ ] Keyboard navigation works
- [ ] No horizontal scroll on mobile
- [ ] Animations respect prefers-reduced-motion
- [ ] Touch targets are 44×44px minimum
- [ ] Images have alt text

## Documentation

Always update `./docs/design-guidelines.md` with:
- New color tokens added
- New component patterns
- Typography decisions
- Animation guidelines
