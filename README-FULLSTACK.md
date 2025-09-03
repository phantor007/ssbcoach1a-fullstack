# 🚀 SSB Coach 1A - Modern Full Stack Application

## 📋 **COMPLETE INSTALLATION GUIDE**

### **🎯 What You're Getting**

A complete, modern SSB preparation platform built with **Node.js frontend**, **Python backend**, and **MongoDB database** - a scalable microservices architecture.

### **🏗️ Architecture:**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   Node.js       │◄──►│   Python        │◄──►│   MongoDB       │
│   Express.js    │    │   FastAPI       │    │   Collections   │
│   Port 3000     │    │   Port 8000     │    │   Port 27017    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ **SYSTEM REQUIREMENTS**

### **Minimum Requirements:**
- **Node.js:** 18.0+
- **Python:** 3.9+
- **MongoDB:** 6.0+
- **RAM:** 4GB
- **Storage:** 2GB
- **OS:** Windows 10+, macOS 10.15+, Ubuntu 20.04+

### **Recommended (Docker):**
- **Docker:** 20.10+
- **Docker Compose:** 2.0+
- **RAM:** 8GB
- **Storage:** 5GB

## ⚡ **QUICK START OPTIONS**

### **🐳 Option A: Docker Setup (Recommended)**

**1. Prerequisites:**
```bash
# Install Docker Desktop
# Windows/Mac: https://www.docker.com/products/docker-desktop/
# Linux: sudo apt install docker.io docker-compose
```

**2. Clone & Start:**
```bash
# Extract the ZIP file
cd ssbcoach1a-fullstack

# Create environment file
cp .env.example .env

# Start all services
docker-compose up -d

# Check status
docker-compose ps
```

**3. Access Applications:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api/docs
- **MongoDB Admin:** http://localhost:8081 (dev only)
- **Redis Admin:** http://localhost:8082 (dev only)

### **🔧 Option B: Manual Setup**

**1. Setup MongoDB:**
```bash
# Install MongoDB Community Edition
# Windows: Download from https://www.mongodb.com/try/download/community
# Mac: brew install mongodb-community
# Linux: sudo apt install mongodb

# Start MongoDB
mongod --dbpath /data/db
```

**2. Setup Backend (Python):**
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export MONGODB_URL="mongodb://localhost:27017/ssbcoach1a"
export SECRET_KEY="your-secret-key"

# Start backend server
uvicorn main:app --reload --port 8000
```

**3. Setup Frontend (Node.js):**
```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
export API_BASE_URL="http://localhost:8000"
export SESSION_SECRET="your-session-secret"

# Start frontend server
npm run dev
```

## 🔑 **DEFAULT LOGIN CREDENTIALS**

### **Admin Access:**
- **URL:** http://localhost:3000/auth/login
- **Email:** admin@ssbcoach1a.com
- **Password:** admin123

### **Test Users:**
- **Student:** arjun@ssbcoach1a.com / admin123
- **Premium:** priya@ssbcoach1a.com / admin123
- **Navy Aspirant:** vikram@ssbcoach1a.com / admin123

### **Development Tools:**
- **MongoDB Admin:** admin / admin123
- **Redis Admin:** admin / admin123

## 📁 **PROJECT STRUCTURE**

```
ssbcoach1a-fullstack/
├── 📄 README.md                     ← This file
├── 🐳 docker-compose.yml            ← Docker orchestration
├── 🔧 .env                          ← Environment config
├── 
├── frontend/                        ← Node.js Frontend
│   ├── 📦 package.json              ← Dependencies
│   ├── 🚀 app.js                    ← Express server
│   ├── routes/                      ← Express routes
│   ├── views/                       ← EJS templates
│   ├── public/                      ← Static assets
│   └── middleware/                  ← Auth & validation
│
├── backend/                         ← Python Backend
│   ├── 📋 requirements.txt          ← Python dependencies
│   ├── 🐍 main.py                   ← FastAPI app
│   ├── models/                      ← Database models
│   ├── routes/                      ← API endpoints
│   ├── services/                    ← Business logic
│   └── utils/                       ← Helper functions
│
└── database/                        ← MongoDB Data
    ├── sample-data/                 ← JSON seed data
    │   ├── 👥 users.json            ← 8 sample users
    │   ├── 👨‍🏫 coaches.json          ← 4 expert coaches
    │   ├── 📝 tests.json            ← 6 practice tests
    │   └── 🏢 centers.json          ← 4 SSB centers
    └── init-scripts/                ← DB initialization
```

## 🚀 **FEATURES OVERVIEW**

### **✅ Core Platform Features:**
- 🤖 **AI-Powered Analysis** (simulated ML models)
- 📊 **Real-time Analytics** with MongoDB aggregation
- 🎮 **Gamification System** (points, badges, levels)
- 👥 **Multi-role Management** (6 user types)
- 📝 **Advanced Test Engine** with auto-scoring
- 🏢 **Content Management** (coaches, centers, blogs)
- 📱 **Mobile Responsive** (Tailwind CSS)
- 🔒 **JWT Authentication** with refresh tokens
- ⚡ **High Performance** (indexing, caching)
- 📈 **Admin Dashboard** with metrics

### **✅ Technical Features:**
- **Microservices Architecture** - Independent scaling
- **RESTful APIs** - Mobile app ready
- **Real-time Updates** - Socket.IO integration
- **Docker Support** - Easy deployment
- **Security** - CORS, rate limiting, validation
- **Monitoring** - Health checks, logging
- **Testing** - Unit & integration tests

## 🌐 **API ENDPOINTS**

### **Authentication:**
```
POST /api/auth/login          - User login
POST /api/auth/register       - User registration  
POST /api/auth/refresh        - Refresh JWT token
POST /api/auth/logout         - User logout
```

### **Users:**
```
GET  /api/users/profile       - Get user profile
PUT  /api/users/profile       - Update profile
GET  /api/users/stats         - User statistics
GET  /api/users/progress      - Learning progress
```

### **Tests:**
```
GET  /api/tests               - List available tests
POST /api/tests/{id}/attempt  - Start test attempt
PUT  /api/tests/attempt/{id}  - Submit test answers
GET  /api/tests/results/{id}  - Get detailed results
```

### **Analytics:**
```
GET  /api/analytics/dashboard - Dashboard metrics
GET  /api/analytics/trends    - Performance trends
POST /api/analytics/event     - Track user events
```

## 📊 **SAMPLE DATA INCLUDED**

### **👥 Users (8 accounts):**
- 1 Super Admin
- 2 Basic Students  
- 4 Premium Students
- 1 Admin user

### **👨‍🏫 Coaches (4 experts):**
- Col. Rajesh Khanna (Army - Leadership)
- Lt. Col. Meera Gupta (Air Force - Psychology)
- Commander Vikram Singh (Navy - GTO Tasks)
- Wing Commander Anita Malhotra (Air Force - Women Training)

### **📝 Tests (6 categories):**
- Officer Intelligence Rating (OIR)
- Picture Perception & Discussion Test (PPDT)  
- Psychology Tests (TAT, WAT, SRT)
- Group Testing Officer (GTO) Tasks
- Current Affairs for Defence
- Mock Interview Practice

### **🏢 Centers (4 locations):**
- SSB Allahabad (Army)
- AFSB Dehradun (Air Force)
- INS Chilka (Navy)
- SSB Bangalore (Army)

## 🔧 **CONFIGURATION**

### **Environment Variables (.env):**
```bash
# Application
NODE_ENV=development
ENVIRONMENT=development

# Database
MONGODB_URL=mongodb://admin:admin123@localhost:27017/ssbcoach1a?authSource=admin
REDIS_URL=redis://localhost:6379

# Authentication
SECRET_KEY=your-secret-key-change-in-production
SESSION_SECRET=your-session-secret-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# URLs
FRONTEND_URL=http://localhost:3000
API_BASE_URL=http://localhost:8000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8000

# Features
INIT_SAMPLE_DATA=true
ENABLE_AI_FEATURES=true
ENABLE_ANALYTICS=true
ENABLE_GAMIFICATION=true

# Email (Optional)
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
```

## 🐳 **DOCKER COMMANDS**

### **Basic Operations:**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and start
docker-compose up --build -d

# Check service status
docker-compose ps

# Execute commands in container
docker-compose exec backend python manage.py shell
docker-compose exec frontend npm run test
```

### **Development:**
```bash
# Start with development profile
docker-compose --profile development up -d

# Start only core services
docker-compose up -d mongodb redis backend frontend

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🚀 **PRODUCTION DEPLOYMENT**

### **Production Docker Setup:**
```bash
# Use production configuration
docker-compose -f docker-compose.yml --profile production up -d

# Scale services
docker-compose up -d --scale frontend=3 --scale backend=2

# Update environment for production
export NODE_ENV=production
export ENVIRONMENT=production
export DEBUG=false
```

### **Environment Setup:**
```bash
# Production environment variables
NODE_ENV=production
ENVIRONMENT=production
DEBUG=false
MONGODB_URL=mongodb://user:pass@mongo-cluster/ssbcoach1a
REDIS_URL=redis://redis-cluster:6379
SECRET_KEY=very-secure-secret-key
ALLOWED_ORIGINS=https://ssbcoach1a.com
```

## 🔍 **MONITORING & DEBUGGING**

### **Health Checks:**
```bash
# Check application health
curl http://localhost:3000/health
curl http://localhost:8000/health

# Check database connection
docker-compose exec mongodb mongosh --eval "db.runCommand('ping')"

# Check logs
docker-compose logs --tail=100 backend
docker-compose logs --tail=100 frontend
```

### **Common Issues:**
```bash
# MongoDB connection issues
docker-compose restart mongodb
docker-compose exec mongodb mongosh

# Permission issues
sudo chown -R $USER:$USER ./
chmod +x scripts/*

# Port conflicts
docker-compose down
lsof -i :3000 -i :8000 -i :27017
```

## 📱 **MOBILE & API ACCESS**

### **Mobile App Ready:**
- RESTful APIs for React Native/Flutter
- JWT authentication
- Real-time Socket.IO support
- Offline-capable design

### **API Documentation:**
- **Swagger UI:** http://localhost:8000/api/docs
- **ReDoc:** http://localhost:8000/api/redoc
- **OpenAPI:** http://localhost:8000/api/openapi.json

## 🧪 **TESTING**

### **Backend Tests:**
```bash
cd backend
pytest --cov=. --cov-report=html
```

### **Frontend Tests:**
```bash
cd frontend
npm test
npm run test:coverage
```

### **Integration Tests:**
```bash
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
```

## 🎯 **NEXT STEPS**

### **After Installation:**

**1. Explore the Platform:**
- Login with admin credentials
- Create test attempts
- Check analytics dashboard
- Try gamification features

**2. Customize Content:**
- Add more coaches via admin panel
- Create additional practice tests
- Update branding and colors
- Configure email notifications

**3. Scale for Production:**
- Setup SSL certificates
- Configure CDN for assets
- Setup monitoring (Prometheus/Grafana)
- Implement backup strategies

## 📞 **SUPPORT & TROUBLESHOOTING**

### **Common Solutions:**

**Port Already in Use:**
```bash
# Kill processes on ports
sudo lsof -ti:3000,8000,27017 | xargs kill -9
```

**Docker Issues:**
```bash
# Reset Docker environment
docker-compose down -v
docker system prune -f
docker-compose up --build -d
```

**Database Issues:**
```bash
# Reset MongoDB data
docker-compose down -v
docker volume rm ssbcoach1a_mongodb_data
docker-compose up -d
```

## 🎉 **SUCCESS CHECKLIST**

After installation, verify these work:

✅ **Frontend loads** at http://localhost:3000  
✅ **Backend API** accessible at http://localhost:8000/api/docs  
✅ **User registration** creates new accounts  
✅ **Login system** authenticates users  
✅ **Dashboard** displays user statistics  
✅ **Practice tests** can be taken and scored  
✅ **AI feedback** generates after tests  
✅ **Admin panel** accessible with admin account  
✅ **Real-time features** work via Socket.IO  
✅ **Mobile responsive** design functions  
✅ **MongoDB data** persists correctly  
✅ **Redis caching** improves performance  

## 🏆 **RESULT**

**You now have a complete, modern, scalable SSB preparation platform with:**

- **Professional UI/UX** with modern design
- **Microservices Architecture** for scalability  
- **AI-powered features** for enhanced learning
- **Real-time updates** and notifications
- **Comprehensive analytics** and reporting
- **Mobile-ready APIs** for future apps
- **Production deployment** capabilities
- **Full test coverage** and monitoring

**Total Setup Time:** 5-10 minutes with Docker  
**Ready for:** Development, Testing, Production  
**Scalable to:** Thousands of concurrent users  
**Technology:** Modern, industry-standard stack  

Your modern SSB Coach 1A platform is ready to serve aspiring defence officers! 🎯