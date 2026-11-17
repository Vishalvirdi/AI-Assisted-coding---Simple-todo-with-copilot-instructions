# Copilot Instructions

## Tech Stack
- **Frontend:** React with functional components and hooks only (no class components)
- **Backend:** Node.js (Express) REST API
- **Styling:** Tailwind CSS
- **E2E Testing:** Playwright
- **Language:** Prefer TypeScript over JavaScript, with `strict` mode enabled

## General Rules
- Write production-ready code only for both frontend and backend: no placeholder logic, no `TODO` stubs, no `console.log` debugging left behind.
- Handle all errors and edge cases explicitly; never swallow errors silently.
- Keep functions small and single-purpose. Follow DRY and SOLID principles.
- Never hardcode secrets, URLs, or environment-specific values; read them from environment variables (`process.env`, `import.meta.env`) and validate them at startup.
- Do not add a new dependency when the existing stack can do the job. Use well-maintained, widely used packages only.

## Reusable Code
- Build everything as reusable components or utilities. Do not duplicate UI or logic.
- Create shared UI components in `src/components/ui/` and use them everywhere instead of raw HTML elements:
  - `Button` (variants: primary, secondary, danger, ghost; sizes; `loading` and `disabled` states)
  - `TextField` / `Input` (label, error message, helper text, `forwardRef` support)
  - `Select`, `Checkbox`, `TextArea`, `Modal`, `Card`, `Spinner`, `Alert`
- Components take typed props, are accessible (ARIA attributes, keyboard support, visible focus states, labels tied to inputs), and contain no business logic.
- Move shared stateful logic into custom hooks (`useAuth`, `useFetch`, `useForm`, `useDebounce`).
- Keep API calls in a single API client layer (`src/services/`), never inline `fetch` calls in components.
- Backend: share middleware, validators, error classes, and response helpers instead of repeating logic across routes.

## Frontend (React)
- Use functional components with hooks: `useState`, `useEffect`, `useMemo`, `useCallback`, `useContext`, `useReducer`.
- Follow the Rules of Hooks; include complete dependency arrays and clean up effects (abort controllers, listeners, timers).
- Handle loading, error, and empty states for every data-driven view.
- Use error boundaries for critical sections of the app.
- Lazy-load routes with `React.lazy` and `Suspense`.
- Never use `dangerouslySetInnerHTML`. If it is unavoidable, sanitize the content with DOMPurify first.
- Do not store tokens or sensitive data in `localStorage` or `sessionStorage`; rely on httpOnly cookies.

## Styling (Tailwind CSS)
- Use Tailwind utility classes only; no inline styles and no separate CSS files except for Tailwind config and base layers.
- Define colors, spacing, and fonts in `tailwind.config` theme tokens, not hard-coded arbitrary values.
- Use `clsx` / `tailwind-merge` for conditional class names inside reusable components.
- Design mobile-first and make every layout responsive. Support dark mode where applicable.

## Backend (Node.js)
- Structure the code in layers: `routes/` → `controllers/` → `services/` → `models/` / `repositories/`, plus `middleware/`, `validators/`, `utils/`, `config/`.
- Use `async/await` with centralized error-handling middleware; never send raw stack traces to clients.
- Return consistent JSON responses: `{ success, data, error: { code, message } }` with correct HTTP status codes.
- Use a structured logger (pino or winston). Never log passwords, tokens, or personal data.
- Implement graceful shutdown, health-check endpoints, and environment-based configuration.

## Security (Mandatory for Every API Endpoint)
Follow the **OWASP Top 10** and **OWASP API Security Top 10** for all code.

### Authentication
- Every endpoint is protected by default. Public endpoints must be explicitly marked and justified.
- Use JWT access tokens with short expiry (e.g. 15 minutes) and rotating refresh tokens stored in `httpOnly`, `Secure`, `SameSite=Strict` cookies.
- Hash passwords with `bcrypt` (cost factor ≥ 12) or `argon2`. Never store or log plaintext passwords.
- Enforce strong password rules, and lock or throttle accounts after repeated failed logins.

### Authorization (Role-Based Access Control)
- Apply role-based access control (RBAC) middleware on every protected route, e.g. `authorize('admin')`, `authorize('user', 'admin')`.
- Follow the principle of least privilege: give each role only the permissions it needs.
- Check resource ownership on the server for every request to prevent IDOR / Broken Object Level Authorization (a user may only access their own records unless their role allows otherwise).
- Never trust roles, user IDs, or permissions sent from the client; always take them from the verified token or session.
- Frontend route guards are for UX only; the backend must always enforce authorization.

### Input Validation and Injection Prevention
- Validate and sanitize all input (body, params, query, headers) with a schema validator such as `zod` or `joi`. Reject unknown fields.
- Use parameterized queries or an ORM (Prisma / Sequelize / Mongoose). Never build queries with string concatenation.
- Guard against NoSQL injection (e.g. `express-mongo-sanitize`) and prevent mass assignment by whitelisting the fields that may be updated.
- Validate file uploads: type, size, and file name. Store uploads outside the web root.

### HTTP and Transport Security
- Use `helmet` for secure headers, including a strict Content Security Policy.
- Configure CORS with an explicit allowlist of origins; never use `*` with credentials.
- Apply rate limiting (`express-rate-limit`), with stricter limits on auth endpoints.
- Enforce HTTPS in production and limit request body size (e.g. `express.json({ limit: '10kb' })`).
- Protect cookie-based auth against CSRF (SameSite cookies plus CSRF tokens where needed).
- Disable the `x-powered-by` header.

### Data Protection and Error Handling
- Never return sensitive fields (password hashes, tokens, internal IDs) in API responses; use response DTOs or serializers.
- Return generic error messages to clients and log the details on the server only.
- Keep secrets in environment variables or a secrets manager; never commit `.env` files.
- Keep dependencies up to date and run `npm audit` regularly.

## Testing (Playwright E2E)
- Write end-to-end tests with Playwright in `tests/e2e/`.
- Use descriptive test names that state the expected behavior, e.g. `test('user can log in with valid credentials')`.
- Use the Page Object Model for reusable page interactions, and fixtures for shared setup such as authenticated users.
- Select elements with `getByRole`, `getByLabel`, or `getByTestId`; avoid brittle CSS or XPath selectors.
- Never use hard waits (`waitForTimeout`); rely on Playwright auto-waiting and web-first assertions.
- Cover the happy path, validation errors, and security cases: unauthenticated access, forbidden role access, and access to another user's data.
- Keep tests independent and isolated, and clean up any data they create.

## Naming Conventions
- Components: PascalCase (`UserProfile.tsx`, `Button.tsx`)
- Hooks: camelCase with `use` prefix (`useUserData.ts`)
- Utilities and services: camelCase (`formatDate.ts`, `authService.ts`)
- Backend files: camelCase with role suffix (`userController.ts`, `authMiddleware.ts`, `userRoutes.ts`)
- Constants: UPPER_SNAKE_CASE (`MAX_LOGIN_ATTEMPTS`)
- Types and interfaces: PascalCase (`User`, `ApiResponse`)
- Playwright tests: `*.spec.ts` (`login.spec.ts`)
- API routes: plural, lowercase, kebab-case nouns (`/api/v1/users`, `/api/v1/order-items`)
