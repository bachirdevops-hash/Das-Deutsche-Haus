# ♿ Accessibility (WCAG) Audit

## Findings (heuristic review)
| # | Issue | WCAG | Severity |
|---|-------|------|----------|
| 1 | Many `<button>` icons lack `aria-label` | 4.1.2 | 🟡 |
| 2 | Color contrast: gold `#FFCE00` on white < 3:1 | 1.4.3 | 🟡 |
| 3 | Focus states on custom buttons need verification | 2.4.7 | 🟢 |
| 4 | No skip-to-content link | 2.4.1 | 🟢 |
| 5 | Form labels exist but error messages not `aria-live` | 3.3.1 | 🟡 |
| 6 | Modal dialogs from Radix — should be a11y-OK by default ✅ | | |
| 7 | Hero slideshow lacks pause control | 2.2.2 | 🟡 |
| 8 | Images mostly have `alt` (need to audit blog/activities) | 1.1.1 | 🟢 |

## Strengths
- ✅ Semantic HTML (`<nav>`, `<main>`, `<footer>`)
- ✅ Radix UI primitives (a11y-first)
- ✅ Keyboard navigation works on most elements
- ✅ Lang attribute set correctly

## Recommendations
1. Add `aria-label` to all icon-only buttons (lint rule: `jsx-a11y/control-has-associated-label`)
2. Increase gold contrast: use `#1A1A1A` text on gold (passes 4.5:1)
3. Implement pause/play on `HeroSlideshow`
4. Add `aria-live="polite"` to toast container (sonner)
5. Run `axe-core` automated tests in CI
