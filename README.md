# 🎓 Mentixo-AI

An AI-powered educational platform for generating study materials, quizzes, and interactive learning experiences.

## ✨ Features

- 🤖 **AI-Powered Content Generation** - Generate notes, quizzes, and answers using Google Gemini
- 💬 **Interactive Chat** - Real-time conversations with AI for learning support
- 📝 **Study Notes** - Auto-generated comprehensive study materials
- 🧪 **Quiz Generation** - Create quizzes with multiple difficulty levels
- 📊 **Dashboard** - Track learning progress and statistics
- 📈 **Analytics** - Detailed usage analytics and learning insights
- 🔐 **Secure Authentication** - JWT-based authentication with refresh tokens
- 📱 **Responsive Design** - Works on desktop and mobile devices

## 🏗️ Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation

### Backend
- **Node.js + Express** - Server framework
- **Prisma** - ORM for database
- **PostgreSQL (Supabase)** - Database
- **Google Gemini API** - AI content generation
- **JWT** - Authentication
- **Browser LocalStorage** - Client-side caching

### Database
- **Supabase** - Managed PostgreSQL
- **Prisma** - Type-safe database access

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Supabase account (free at https://supabase.com)
- Google Gemini API key

### 1. Clone Repository
```bash
git clone <repository-url>
cd Mentixo-AI
```

### 2. Setup Server
```bash
cd server
npm install
```

### 3. Configure Environment
```bash
# Copy example env
cp .env.example .env

# Edit .env with your values:
# - DATABASE_URL (Supabase connection string)
# - GEMINI_API_KEY (Google Gemini API key)
# - JWT_SECRET (strong random string)
```

### 4. Setup Database
```bash
# Initialize database (creates all tables)
node scripts/init-db.js

# Generate Prisma Client
npx prisma generate
```

### 5. Start Server
```bash
npm run dev
```

### 6. Setup Client
```bash
cd ../client
npm install
npm run dev
```

### 7. Access Application
Open http://localhost:5173 in your browser

## 📚 Documentation

### Getting Started
- **[QUICK_START.md](./QUICK_START.md)** - 5-minute setup guide

### Setup & Configuration
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Supabase configuration
- **[COMMANDS.md](./COMMANDS.md)** - Common commands reference

### Migration & Architecture
- **[README_MIGRATION.md](./README_MIGRATION.md)** - Migration overview
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Detailed migration guide
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture

### Other
- **[AUTH0_REMOVAL.md](./AUTH0_REMOVAL.md)** - Auth0 removal details
- **[CLEANUP_SUMMARY.md](./CLEANUP_SUMMARY.md)** - Cleanup summary

## 🔐 Authentication

### Signup
```bash
POST /api/auth/signup
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Login
```bash
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Refresh Token
```bash
POST /api/auth/refresh
{
  "refreshToken": "eyJhbGc..."
}
```

### Logout
```bash
POST /api/auth/logout
Headers: Authorization: Bearer <accessToken>
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Chat
- `POST /api/chat` - Send message to AI
- `GET /api/chat/history` - Get chat history

### Notes
- `POST /api/notes` - Generate study notes
- `GET /api/notes/history` - Get notes history

### Quiz
- `POST /api/quiz` - Generate quiz
- `POST /api/quiz/:id/submit` - Submit quiz answers
- `GET /api/quiz/history` - Get quiz history

### Dashboard
- `GET /api/dashboard` - Get dashboard stats

### Analytics
- `GET /api/analytics/usage` - Get usage statistics
- `GET /api/analytics/history` - Get usage history
- `GET /api/analytics/global` - Get global analytics

### Upload
- `POST /api/upload` - Upload and process files

## 🗄️ Database Schema

### User
- `id` - Unique identifier
- `name` - User name
- `email` - Email address (unique)
- `password` - Hashed password
- `dailyUsage` - Daily usage count
- `dailyUploads` - Daily upload count
- `lastReset` - Last reset date

### Chat
- `id` - Unique identifier
- `userId` - Reference to user
- `title` - Chat title
- `messages` - Array of messages
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp

### Note
- `id` - Unique identifier
- `userId` - Reference to user
- `topic` - Note topic
- `content` - Note content
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp

### Quiz
- `id` - Unique identifier
- `userId` - Reference to user
- `topic` - Quiz topic
- `difficulty` - Difficulty level (easy/medium/hard)
- `questions` - Array of questions
- `score` - Quiz score (null if not submitted)
- `totalQuestions` - Total number of questions
- `createdAt` - Creation timestamp
- `updatedAt` - Update timestamp

### AuditLog
- `id` - Unique identifier
- `userId` - Reference to user
- `featureType` - Feature type (chat/notes/quiz/upload)
- `action` - Action performed
- `resourceId` - Reference to resource
- `metadata` - Additional metadata
- `timestamp` - Action timestamp

## 🔧 Configuration

### Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# API Keys
GEMINI_API_KEY=your_gemini_api_key

# Authentication
JWT_SECRET=your_strong_jwt_secret

# CORS
ALLOWED_ORIGINS=http://localhost:5173
```

## 🧪 Testing

### Test Signup
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Chat
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "What is machine learning?"}'
```

### View Database
```bash
npx prisma studio
```

## 📊 Performance

### Optimizations
- ✅ Indexed database queries
- ✅ Browser localStorage caching for AI responses
- ✅ Connection pooling
- ✅ Rate limiting
- ✅ Compression

### Monitoring
- Use Supabase dashboard for database monitoring
- Check application logs for errors
- Monitor API response times

## 🔒 Security

### Best Practices
- ✅ Passwords hashed with bcryptjs
- ✅ JWT tokens for authentication
- ✅ HTTPS in production
- ✅ Rate limiting on endpoints
- ✅ Input validation
- ✅ CORS protection
- ✅ Helmet security headers

## 🚀 Deployment

### Supabase
1. Create Supabase project
2. Get connection string
3. Set DATABASE_URL

### Backend (Heroku/Railway/Render)
1. Set environment variables
2. Deploy code
3. Run migrations: `npx prisma migrate deploy`

### Frontend (Vercel/Netlify)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set output directory: `dist`

## 📝 License

This project is licensed under the ISC License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review the troubleshooting section in MIGRATION_GUIDE.md
3. Open an issue on GitHub

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Video tutorials
- [ ] Collaborative learning
- [ ] Advanced analytics
- [ ] Gamification
- [ ] Multi-language support

## 📈 Statistics

- **Models**: 8 database models
- **Endpoints**: 17 API endpoints
- **Features**: 6 main features
- **Tech Stack**: React, Node.js, PostgreSQL, Prisma

## 🔄 Recent Updates (May 10, 2026)

### Fixed Issues
- ✅ Fixed signup/login token handling (accessToken vs token)
- ✅ Database initialization script created
- ✅ All database tables created successfully
- ✅ Authentication flow working correctly

### Changes Made
- Updated API service to handle three-parameter signup
- Fixed Login and Signup components to use correct token field
- Created database initialization script (`scripts/init-db.js`)
- Added pg package for direct database operations
- Removed Redis dependency in favor of browser localStorage

---

**Last Updated**: May 10, 2026
**Status**: ✅ Production Ready
**Version**: 2.0 (Supabase + Prisma)
**Auth**: ✅ Local Email/Password (Auth0 Removed)
