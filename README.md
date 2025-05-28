# QRLocker - Document Management System

A full-stack document management system with QR code integration for easy document access and tracking. Built with React, Node.js, Express, and MongoDB.

## 🚀 Project Overview

QRLocker is a comprehensive document management system that allows organizations to store, manage, and track document access through QR codes. Users can upload documents, generate unique QR codes for each document, and track scan analytics in real-time.

## ✨ Key Features

### 📄 Document Management
- **File Upload & Storage** - Support for multiple file formats (PDF, DOC, images)
- **Version Control** - Track document versions with upload history
- **Metadata Management** - Organize by department, machine ID, and custom tags
- **Document Search & Filtering** - Advanced search capabilities

### 🔐 Authentication & Authorization
- **Role-Based Access Control** - Admin, Supervisor, and User roles
- **JWT Authentication** - Secure token-based authentication
- **Permission Management** - Granular access control per document
- **User Management** - Complete user CRUD operations (Admin only)

### 📱 QR Code Integration
- **Automatic QR Generation** - Unique QR codes for each document
- **Mobile-Friendly Viewer** - Optimized document viewing on mobile devices
- **Scan Tracking** - Real-time scan analytics and logging
- **QR Code Management** - Generate, update, and deactivate QR codes

### 📊 Analytics & Reporting
- **Scan Analytics** - Track document access patterns
- **User Statistics** - Monitor user activity and engagement
- **Department Reports** - Department-wise document usage
- **Real-time Dashboard** - Live metrics and insights

### 🎨 Modern UI/UX
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Tailwind CSS** - Clean, modern interface
- **Dark/Light Theme Support** - User preference settings
- **Interactive Components** - Smooth animations and transitions

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Modern icon library
- **QRCode.react** - QR code generation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Multer** - File upload middleware
- **QRCode** - Server-side QR code generation
- **Bcrypt** - Password hashing

### Security & Middleware
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API rate limiting
- **XSS Protection** - Cross-site scripting prevention
- **MongoDB Sanitization** - Input sanitization

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd qrlocker-document-management
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/qrlocker

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Server Configuration
NODE_ENV=development
PORT=5000

# Frontend URL (for CORS and QR codes)
FRONTEND_URL=http://localhost:5173

# File Storage Configuration
STORAGE_TYPE=local
# For AWS S3 (optional)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_BUCKET_NAME=your-bucket-name
AWS_REGION=your-aws-region
```

### 3. Frontend Setup
```bash
cd client
npm install
```

Create a `.env` file in the client directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Database Setup
Start MongoDB service and run the seed scripts:
```bash
cd server
npm run seed-users    # Creates default users
npm run seed-documents # Creates sample documents (optional)
```

### 5. Start the Application

**Start Backend Server:**
```bash
cd server
npm run dev
```

**Start Frontend Development Server:**
```bash
cd client
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/health

## 📁 Project Structure

```
qrlocker-document-management/
├── client/                          # React frontend application
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Documents/         # Document-related components
│   │   │   ├── Layout/            # Layout components
│   │   │   ├── QR/                # QR code components
│   │   │   ├── Reports/           # Analytics components
│   │   │   ├── UI/                # Generic UI components
│   │   │   └── Users/             # User management components
│   │   ├── context/               # React context providers
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── pages/                 # Page components
│   │   ├── services/              # API service layer
│   │   ├── types/                 # TypeScript type definitions
│   │   └── utils/                 # Utility functions
│   ├── package.json
│   └── vite.config.ts
├── server/                          # Node.js backend application
│   ├── src/
│   │   ├── config/                # Configuration files
│   │   ├── controllers/           # Route controllers
│   │   ├── middleware/            # Express middleware
│   │   ├── models/                # Mongoose models
│   │   ├── routes/                # API routes
│   │   ├── services/              # Business logic services
│   │   └── utils/                 # Utility functions
│   ├── uploads/                   # File storage directory
│   └── package.json
└── README.md
```

## 🔌 API Documentation

### Authentication Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/auth/logout` | User logout | Private |
| GET | `/api/auth/me` | Get current user | Private |

### Document Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/documents` | Get all documents | Private |
| POST | `/api/documents` | Create/upload document | Private |
| GET | `/api/documents/:id` | Get document by ID | Private |
| PUT | `/api/documents/:id` | Update document | Supervisor+ |
| DELETE | `/api/documents/:id` | Delete document | Admin |
| GET | `/api/documents/:id/versions` | Get document versions | Private |
| POST | `/api/documents/:id/versions` | Upload new version | Private |

### QR Code Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/qrcodes` | Generate QR code | Supervisor+ |
| GET | `/api/qrcodes/:qr_id` | Get QR code details | Private |
| PUT | `/api/qrcodes/:qr_id` | Update QR code | Supervisor+ |
| DELETE | `/api/qrcodes/:qr_id` | Delete QR code | Admin |
| GET | `/api/qrcodes/:qr_id/view` | View document via QR | Public |
| GET | `/api/qrcodes/:qr_id/stats` | Get QR scan statistics | Supervisor+ |

### User Management Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | Get all users | Admin |
| POST | `/api/users` | Create new user | Admin |
| GET | `/api/users/:id` | Get user by ID | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |
| PUT | `/api/users/:id/password` | Update user password | Admin |
| GET | `/api/users/stats` | Get user statistics | Admin |

### Analytics Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/logs/scan` | Get scan logs | Supervisor+ |
| GET | `/api/logs/analytics` | Get scan analytics | Supervisor+ |

### File Endpoints
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/files/download/:filePath` | Download file | Private |
| GET | `/api/files/stream/:filePath` | Stream file | Private |

## 🔧 Environment Variables

### Backend (.env)
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGODB_URI` | MongoDB connection string | Yes | `mongodb://localhost:27017/qrlocker` |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `JWT_EXPIRE` | JWT expiration time | No | `7d` |
| `JWT_COOKIE_EXPIRE` | Cookie expiration (days) | No | `7` |
| `NODE_ENV` | Environment mode | No | `development` |
| `PORT` | Server port | No | `5000` |
| `FRONTEND_URL` | Frontend URL for CORS | Yes | `http://localhost:5173` |
| `STORAGE_TYPE` | Storage type (local/s3) | No | `local` |
| `AWS_ACCESS_KEY_ID` | AWS access key (if using S3) | No | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key (if using S3) | No | - |
| `AWS_BUCKET_NAME` | S3 bucket name (if using S3) | No | - |
| `AWS_REGION` | AWS region (if using S3) | No | - |

### Frontend (.env)
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_URL` | Backend API URL | Yes | `http://localhost:5000/api` |

## 🚀 Deployment

### Backend Deployment (Render/Railway/Heroku)
1. Set environment variables in your hosting platform
2. Ensure MongoDB Atlas or cloud database is configured
3. Update `FRONTEND_URL` to your deployed frontend URL
4. Deploy using your platform's deployment process

### Frontend Deployment (Vercel/Netlify)
1. Build the production version:
```bash
cd client
npm run build
```
2. Deploy the `dist` folder to your hosting platform
3. Configure environment variables in your hosting platform
4. Update `VITE_API_URL` to your deployed backend URL

### Docker Deployment (Optional)
Create `docker-compose.yml` for containerized deployment:
```yaml
version: '3.8'
services:
  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/qrlocker
    depends_on:
      - mongo
  
  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend
  
  mongo:
    image: mongo:4.4
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## 👥 Default User Accounts

After running the user seed script, you can log in with these demo accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password123 |
| Supervisor | supervisor@example.com | password123 |
| User | user@example.com | password123 |

⚠️ **Important**: Change these default passwords in production!

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository**
```bash
git fork <repository-url>
```

2. **Create a Feature Branch**
```bash
git checkout -b feature/your-feature-name
```

3. **Make Your Changes**
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

4. **Test Your Changes**
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

5. **Commit Your Changes**
```bash
git commit -m "feat: add your feature description"
```

6. **Push and Create Pull Request**
```bash
git push origin feature/your-feature-name
```

### Code Style Guidelines
- Use TypeScript for new frontend code
- Follow ESLint configurations
- Use meaningful variable and function names
- Add JSDoc comments for functions
- Maintain consistent formatting

### Reporting Issues
- Use the GitHub issue tracker
- Provide detailed descriptions
- Include steps to reproduce
- Add relevant screenshots or logs

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2024 QRLocker Document Management

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🆘 Support & Help

### Documentation
- [API Documentation](./docs/api.md)
- [Deployment Guide](./docs/deployment.md)
- [User Manual](./docs/user-guide.md)

### Community
- **GitHub Issues**: For bug reports and feature requests
- **Discussions**: For questions and community support
- **Wiki**: For additional documentation and guides

### Contact
- **Project Maintainer**: [Your Name]
- **Email**: your-email@example.com
- **Website**: [Your Website]

---

## 🎯 Roadmap

### Version 2.0 (Planned Features)
- [ ] Mobile app for iOS/Android
- [ ] Advanced document OCR and search
- [ ] Workflow automation
- [ ] Integration with cloud storage providers
- [ ] Advanced reporting and analytics
- [ ] Multi-language support
- [ ] API rate limiting and quotas
- [ ] Advanced user permissions

### Version 1.1 (In Progress)
- [ ] Email notifications
- [ ] Document expiration dates
- [ ] Bulk operations
- [ ] Advanced search filters
- [ ] Export functionality

---

**Built with ❤️ for better document management**
