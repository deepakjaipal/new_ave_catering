# 🎨 Wholesale Market Client

Modern Next.js frontend application for the Wholesale Market platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 8+

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Production
```bash
# Build for production
npm run build

# Start production server
npm run start
```

### Docker
```bash
# Development
docker-compose up -d

# Production
./deploy.sh production
```

## 📁 Project Structure

```
client/
├── app/                    # Next.js App Router
├── components/             # React components
├── lib/                    # Utilities and configurations
├── public/                 # Static assets
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose
├── nginx.conf             # Nginx configuration
└── deploy.sh              # Deployment script
```

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Lint code
npm run type-check   # TypeScript type checking
npm run clean        # Clean build artifacts
```

## 🌐 Environment Variables

Copy `env.example` to `.env.local`:

```bash
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_NAME=Wholesale Market
```

## 🐳 Docker Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
./deploy.sh production
```

## 📊 Features

- ✅ **Next.js 15** with App Router
- ✅ **TypeScript** for type safety
- ✅ **Tailwind CSS** for styling
- ✅ **Redux Toolkit** for state management
- ✅ **Image Optimization** with Next.js Image
- ✅ **Code Splitting** and lazy loading
- ✅ **SEO Optimized** with metadata
- ✅ **Responsive Design** for all devices

## 🚀 Deployment Options

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Netlify
```bash
# Build
npm run build

# Deploy to Netlify
# Upload dist folder to Netlify
```

### AWS Amplify
```bash
# Connect your GitHub repository
# Configure build settings
# Deploy automatically
```

## 📱 Service URLs

- **Development**: http://localhost:3000
- **Production**: https://your-domain.com
- **Health Check**: http://localhost:3000/health

## 🔧 Configuration

### Next.js Configuration
- Image optimization enabled
- Compression enabled
- Security headers configured
- Bundle optimization

### Nginx Configuration
- Gzip compression
- Static file caching
- Rate limiting
- Security headers

## 📝 Logs

```bash
# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f client
```

## 🆘 Support

For support, create an issue or contact the development team.
