# 🌾 AgriNexus AI

## Intelligent Agriculture Platform for Africa

AgriNexus AI is a comprehensive agricultural technology platform designed specifically for African farmers and agribusinesses. Built with AI-powered insights, real-time monitoring, and Africa-first features to transform farming across the continent.

## ✨ Key Features

- 🤖 **AI-Powered Intelligence**: Crop monitoring, disease detection, and yield prediction with 92% accuracy
- 📱 **Africa-First Design**: USSD, SMS integration, and offline-first architecture for rural connectivity
- 🏪 **Smart Marketplace**: Buy/sell platform with M-Pesa and local payment method integrations
- 📊 **Advanced Analytics**: Real-time data visualization and predictive insights
- 🔔 **Multi-Channel Notifications**: SMS, Push, Email, and USSD notifications
- 🌍 **Multilingual Support**: Available in 8 African languages
- 💬 **Community Features**: Cooperative management and farmer forums
- 🎨 **Apple Glass UI**: Beautiful glassmorphism design system

## 🚀 Live Demo

- URL: https://laurence77.github.io/agri-nexus-ai/
- Login: username `laurence`, password `1234`

Quick Links
- Login: https://laurence77.github.io/agri-nexus-ai/login
- Dashboard: https://laurence77.github.io/agri-nexus-ai/dashboard
- Marketplace: https://laurence77.github.io/agri-nexus-ai/marketplace
- Analytics: https://laurence77.github.io/agri-nexus-ai/analytics
- Admin: https://laurence77.github.io/agri-nexus-ai/admin

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Clone the repository
git clone https://github.com/laurence77/agri-nexus-ai.git

# Navigate to the project directory
cd agri-nexus-ai

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`
Default demo login: username `laurence`, password `1234`

## 🛠 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Design System**: Custom Apple Glass glassmorphism components
- **State Management**: React Context + TanStack Query
- **Routing**: React Router
- **Icons**: Lucide React
- **Charts**: Recharts
- **Authentication**: Custom auth context

## 📁 Project Structure

```text
src/
├── components/          # Reusable UI components
│   ├── africa/         # Africa-specific features
│   ├── ai/             # AI-powered components
│   ├── charts/         # Data visualization
│   ├── marketplace/    # Trading platform
│   ├── notifications/  # Alert system
│   └── support/        # Help & community
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── pages/              # Main application pages
├── styles/             # CSS and design system
└── types/              # TypeScript definitions
```

## 🌍 Africa-Focused Features

- **Local Payment Integration**: M-Pesa, Airtel Money, MTN Mobile Money
- **Offline-First Architecture**: Works with intermittent internet connectivity
- **USSD Support**: Access core features via USSD codes
- **Multi-Language**: English, Swahili, Hausa, Yoruba, Amharic, French, Portuguese, Arabic
- **Climate-Aware**: Tailored for African weather patterns and crops
- **Cooperative Tools**: Group management for farmer cooperatives

## 🚀 Deployment

### Vercel (Recommended)

```sh
npm run build
# Deploy the dist/ folder to Vercel
```

### Netlify

```sh
npm run build
# Deploy the dist/ folder to Netlify
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8080
CMD ["npm", "run", "preview"]
```

### GitHub Pages

This repo is preconfigured to deploy to GitHub Pages using Actions.

- Default branch: `main`
- Output folder: `dist/`
- SPA routing: `404.html` fallback is included

Steps:

1. Push to `main` (or trigger manually in the Actions tab) to build and publish.
2. In your repository Settings → Pages, set Source to “GitHub Actions”.
3. Your site will be available at:
   - User/org site: `https://<user>.github.io/` (repo named `<user>.github.io`)
   - Project site: `https://<user>.github.io/<repo>/` (any other repo name)

Notes:

- The workflow automatically sets the correct base path for project sites.
- To use a custom domain, add your domain in Settings → Pages and create a `CNAME` DNS record pointing to `<user>.github.io`.
- If you host at the repository root (user/org sites), no subpath is used.

### Local API Server (Payments)

For secure payment flows, a tiny Node server proxies Paystack requests so secrets never hit the browser.

- Start server: `npm run server` (defaults to `http://localhost:3001`)
- Configure client to call it via `VITE_API_BASE_URL` in `.env`
- Endpoints:
  - Paystack:
    - `POST /api/payments/paystack/init`
    - `GET /api/payments/paystack/verify/:reference`
  - Korapay (proxy):
    - `POST /api/payments/korapay/charges/initialize`
    - `GET /api/payments/korapay/charges/:reference`
    - `POST /api/payments/korapay/disbursements/single`
    - `POST /webhooks/korapay` (optional signature verify)
  - M-Pesa:
    - `POST /api/payments/mpesa/stkpush`
    - `GET /api/payments/mpesa/status/:checkoutRequestId`
  - MTN MoMo:
    - `POST /api/payments/mtn-momo/request`
    - `GET /api/payments/mtn-momo/status/:referenceId`

Server env required (not exposed to client):

```
PAYSTACK_SECRET_KEY=sk_live_...
```

In production, host these endpoints on a real backend (serverless or container).

### End-to-end Tests

Playwright is configured to build and preview the site, then run tests in CI.

- Run locally: `npx playwright install && npx playwright test`
- Config: `playwright.config.ts` (serves `vite preview` on `:4173`)

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](docs/) directory and deployed to GitHub Pages:

- **[User Account Types & Roles](docs/user-account-types.md)** - Complete guide to all 14+ user roles and permission system
- **[Platform Documentation](docs/)** - Full feature documentation and setup guides
- **Live Documentation Site**: Available at your GitHub Pages URL after deployment

The documentation covers:

- 🔐 Role-based access control (RBAC) system
- 👥 User management and permissions matrix
- 🏗️ System architecture and security features
- 📱 Mobile and offline capabilities
- 🌍 Multi-tenant and localization support

## 🤝 Contributing

We welcome contributions to AgriNexus AI! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for African farmers and agricultural communities
- Designed with input from agricultural extension officers across Kenya, Nigeria, Mali, and Ghana
- AI models trained on African crop and weather data

## 📞 Support

For support, email [support@agrinexus.ai](mailto:support@agrinexus.ai) or join our community forum.

---

**AgriNexus AI** - Empowering African Agriculture with Intelligent Technology 🌾
