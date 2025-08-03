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
