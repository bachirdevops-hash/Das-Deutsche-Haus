# 🛠️ Maintainability Recommendations

## Code Quality Wins (1-2 weeks)
1. **Migrate to TypeScript** — catch 30% of bugs at compile
2. **Add Zod schemas** for all API contracts
3. **Domain modules** — group code by feature, not by layer
4. **Constants file** — status/role enums in one place
5. **API client SDK** — generated types for frontend

## Documentation
- Keep this `/app/docs` package in sync (PR template enforces docs update)
- Add JSDoc to key functions
- README per module

## Developer Experience
- Adopt `husky` + `lint-staged` for pre-commit linting
- Add `commitlint` for conventional commits
- Add Storybook for shadcn-based components
- CI: GitHub Actions running lint + tests on PR

## Monitoring (currently absent)
- **Sentry** for error tracking
- **PostHog or Plausible** for analytics
- **Better Stack** or **UptimeRobot** for uptime
- **MongoDB Atlas Charts** for DB observability
