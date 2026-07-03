# Setup Guide

## Installation Steps

### 1. System Requirements
- **macOS 10.15+** or Linux/Windows with Docker
- Node.js 18.x or later
- Docker & Docker Compose (optional but recommended)
- PostgreSQL 15+ with PostGIS

### 2. RentCast API Setup

1. Go to [rentcast.io](https://rentcast.io)
2. Sign up for an account
3. Generate an API key from your dashboard
4. You get 100 free MLS listings per week

### 3. AWS Setup (Optional, for Deployment)

1. Create an AWS account
2. Generate IAM credentials with access to:
   - EC2 (or ECS for containers)
   - RDS (for PostgreSQL)
   - S3 (for backups)
   - CloudWatch (for monitoring)
3. Note your Access Key ID and Secret Access Key

### 4. Database Setup

#### Option A: Using Docker (Recommended)
```bash
docker-compose up -d postgres
# Database automatically initialized with PostGIS
```

#### Option B: Manual PostgreSQL
```bash
# Install PostgreSQL 15 with PostGIS
# macOS:
brew install postgresql@15 postgis

# Linux (Ubuntu):
sudo apt-get install postgresql-15 postgresql-15-postgis

# Start PostgreSQL
brew services start postgresql@15  # macOS
sudo systemctl start postgresql     # Linux

# Create database
psql -U postgres
CREATE DATABASE mls_predictor;
\c mls_predictor
CREATE EXTENSION postgis;
\q

# Run migrations
cd backend
npm run migrate
```

### 5. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mls_predictor
PORT=3001
NODE_ENV=development
RENTCAST_API_KEY=your_rentcast_api_key_here
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=debug
EOF

# Install TypeScript globally (optional)
npm install -g typescript

# Build
npm run build

# Start development server
npm run dev

# Backend now running at http://localhost:3001
```

### 6. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file (optional for local dev)
touch .env

# Start development server
npm run dev

# Frontend now running at http://localhost:3000
```

### 7. Docker Compose Setup (All-in-One)

```bash
# From project root
docker-compose up -d

# Wait for all services to be ready (usually 30-60 seconds)
docker-compose ps

# Run migrations
docker-compose exec backend npm run migrate

# Access:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# Database: localhost:5432
```

## Configuration

### Backend Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `RENTCAST_API_KEY` | RentCast API key for fetching listings | `abc123xyz` |
| `PORT` | Backend server port | `3001` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `AWS_REGION` | AWS region for deployment | `us-east-1` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `LOG_LEVEL` | Logging level | `debug`, `info`, `warn`, `error` |

### Frontend Environment Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3001/api` |

## Verification

### Check Backend is Running
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok","timestamp":"2026-07-02T..."}
```

### Check Database Connection
```bash
# In backend terminal
npm run dev
# Should show: "Database connected successfully"
```

### Check Frontend is Running
```bash
# Navigate to http://localhost:3000 in browser
# Should see MLS Price Predictor interface
```

### Test API Endpoints
```bash
# Get listings
curl "http://localhost:3001/api/listings?limit=5"

# Get single listing (replace ID)
curl "http://localhost:3001/api/listings/{id}"
```

## First Run Steps

1. **Sync MLS Data**
   ```bash
   # This happens automatically weekly, or manually:
   curl -X POST http://localhost:3001/api/sync
   ```

2. **Load Sample Data** (Optional)
   ```bash
   cd backend
   npm run seed
   ```

3. **Create Predictions**
   - Use the web UI to search listings
   - Click "Get Prediction" on any listing
   - Or use batch endpoint for multiple listings

## Troubleshooting Setup Issues

### Port Already in Use
```bash
# Find process using port
lsof -i :3000  # or :3001 for backend

# Kill process
kill -9 <PID>

# Or use different port
PORT=3002 npm run dev  # backend
```

### Database Connection Failed
```bash
# Check PostgreSQL is running
ps aux | grep postgres

# Verify connection string
psql postgresql://postgres:postgres@localhost:5432/mls_predictor

# Check logs
docker-compose logs postgres
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors
```bash
# Make sure FRONTEND_URL matches your frontend URL
# In backend .env: FRONTEND_URL=http://localhost:3000
```

## Next Steps

1. **Configure RentCast API**
   - Add your API key to backend `.env`
   - Test with: `curl "http://localhost:3001/api/listings?limit=5"`

2. **Customize Prediction Engine**
   - Edit [backend/src/services/predictionEngine.ts](../backend/src/services/predictionEngine.ts)
   - Adjust rules, weights, and thresholds

3. **Deploy to AWS**
   - See deployment guide in README.md
   - Set up RDS PostgreSQL instance
   - Configure ECS or EC2 deployment

4. **Add More Features**
   - User authentication
   - Saved searches and alerts
   - Email notifications
   - Historical price tracking

## Support

- Check the main [README.md](README.md) for more info
- Review backend/frontend logs for errors
- Consult RentCast API documentation
- Check PostgreSQL/PostGIS installation
