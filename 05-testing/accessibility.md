# Accessibility Testing

## Standards

- WCAG 2.1 Level AA compliance
- WAI-ARIA for dynamic content
- Keyboard navigable interfaces

## Automated Testing

| Tool | Scope | Integration |
|------|-------|-------------|
| axe-core | Component-level | Unit tests |
| Lighthouse | Page-level | CI |
| Pa11y | Site-wide | Scheduled |

## Manual Testing Checklist

- [ ] Keyboard-only navigation works
- [ ] Screen reader announces content correctly
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Focus indicators are visible
- [ ] Forms have proper labels
- [ ] Images have alt text
- [ ] Error messages are announced
- [ ] Page has proper heading hierarchy

## Testing Matrix

| Assistive Technology | Browser | Priority |
|---------------------|---------|----------|
| VoiceOver | Safari | P0 |
| NVDA | Chrome | P0 |
| JAWS | Edge | P1 |
| TalkBack | Chrome (Android) | P1 |

## Note

Full WCAG compliance validation requires manual testing with assistive technologies and expert accessibility review. Automated tools catch approximately 30-40% of issues.
