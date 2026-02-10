# DashCortex API

Backend API for DashCortex Marketing Analytics Dashboard.

## 🏗️ Architecture

```
src/
├── config/           # Configuration files
├── common/           # Shared utilities, decorators, guards
├── entities/         # TypeORM entities
├── modules/
│   ├── auth/         # Authentication & Authorization
│   ├── users/        # User management
│   ├── connectors/   # External API integrations
│   ├── analytics/    # Analytics data endpoints
│   ├── kpi/          # KPI calculations
│   ├── exports/      # CSV/PDF export
│   └── etl/          # ETL pipeline
└── main.ts           # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials

# Run migrations
npm run migration:run

# Start development server
npm run start:dev
```

## 📚 API Documentation

Swagger documentation is available at: `http://localhost:3001/api/docs`

## 🔐 Authentication

The API supports:
- JWT Token Authentication
- Google OAuth2
- Refresh Token flow

## 🔌 Connectors

### Google Analytics 4
- OAuth2 authentication
- Real-time data
- Audience reports
- Acquisition reports

### Google Ads
- OAuth2 authentication
- Campaign management
- Keyword performance
- MCC support

### Meta Ads
- OAuth2 authentication
- Campaign/AdSet/Ad hierarchy
- Insights API
- Demographics breakdown

## 📊 Data Pipeline

1. **Raw Events** - Store incoming data
2. **Transform** - Normalize and clean
3. **Aggregate** - Calculate KPIs
4. **Cache** - Redis for performance

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 🚢 Deployment

```bash
# Build
npm run build

# Production start
npm run start:prod
```

## 📋 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | API port | Yes |
| `DB_HOST` | PostgreSQL host | Yes |
| `DB_PASSWORD` | PostgreSQL password | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | For Google connectors |
| `META_APP_ID` | Meta app ID | For Meta connectors |

## 📄 License

MIT
