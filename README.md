This is the Next.js frontend for the holycat-ecommerce sample app. It uses the App Router and Tailwind CSS for layout and styling.

Features implemented

- Product listing and product detail pages.
- Register and Login pages wired to the backend auth endpoints.
- Cart UI with add/view/update/remove operations.
- Global toast notifications (`ToastProvider`) used for success/error messages.

Quickstart (frontend)

1. Install dependencies

```powershell
cd ecommerce-frontend
npm install
```

2. Start the dev server

```powershell
npm run dev
```

Open http://localhost:3000 in the browser. The frontend is typically served on port 3000.

Connecting to the backend

- The frontend expects the backend API at `http://localhost:4000` by default. The backend must be running for auth and cart flows to work.
- Because the backend sets an httpOnly cookie on login, the frontend must send credentials with requests. The code calls axios with `withCredentials: true` so that cookies are included automatically.

Pages & Components

- `app/page.js` — homepage
- `app/products` — product listing
- `app/products/[id]` — product detail with `AddToCartButton` component
- `app/login/page.js` — login form (show/hide password, toasts on success/error)
- `app/register/page.js` — register form (show/hide password, toasts)
- `app/cart/page.js` — cart view with quantity controls and remove
- `app/components/ToastProvider.js` — global toast system (listens for `window.dispatchEvent(new CustomEvent('toast', { detail }))`)
- `app/components/Header.js` — header that shows auth state and cart count (listens for `authChanged` and `cartUpdated` events).

Notes and recommendations

- The app uses cookie-based auth (httpOnly cookie). For this reason you should enable CORS with credentials on the backend (already done in the sample) and keep using `withCredentials` on frontend requests.
- Because cookies are used, add CSRF protection before deploying to production (e.g. double-submit token or `csurf`).
- Product images are currently placeholders — to show real product images, update the backend seed or product records with image URLs and adjust `ProductCard` to render them.
- The toast system is implemented as a simple global listener — you can replace it with a library like react-hot-toast if you prefer.

Build & deploy

```powershell
# build
npm run build

# preview
npm run start
```

Testing & development tips

- Start the backend first (see `ecommerce-backend/README.md`), then start the frontend.
- Use the seeded test user (email: `test@example.com`, password: `secret`) to exercise login + cart flows.
