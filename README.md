# Smart Campus - Resource Management System

**IT3030 PAF Assignment 2026 (Semester 1)**  
Faculty of Computing – SLIIT

---

## 📋 Project Overview

A university modernization platform for managing facility and asset bookings (rooms, labs, equipment) and maintenance/incident handling (fault reports, technician updates, resolutions).

**Stack:** Spring Boot REST API + React Client + MySQL Database  
**Team Size:** 4 members (individual contribution assessed)

---

## 🎯 Core Modules

| Module | Description | Lead Member |
|--------|-------------|---|
| **A** | Facilities & Assets Catalogue | Member 1 |
| **B** | Booking Management | Member 2 |
| **C** | Maintenance & Incident Ticketing | Member 3 |
| **D** | Notifications | Member 4 |
| **E** | Authentication & Authorization | Member 4 |

---

## 🚀 Quick Start Guide

### Prerequisites

- **Java:** 17+
- **Maven:** 3.8+
- **Node.js:** 18+
- **MySQL:** 8.0+
- **Docker:** Optional (for containerized MySQL)
- **Git:** For version control

### Backend Setup

```bash
# Navigate to backend
cd backend

# Set environment variables (Windows PowerShell)
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "smartcampus123"
$env:GOOGLE_CLIENT_ID = "your-google-client-id"
$env:GOOGLE_CLIENT_SECRET = "your-google-client-secret"
$env:JWT_SECRET = "your-secret-key-minimum-256-bits"

# Build project
./mvnw clean package

# Run tests
./mvnw test

# Start server (development)
./mvnw spring-boot:run
# API runs on: http://localhost:8080
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# App runs on: http://localhost:5173

# Build for production
npm run build

# Code quality check
npm run lint
```

### Docker Setup (MySQL)

```bash
cd backend
docker-compose up -d
# MySQL: localhost:3306 (root / smartcampus123)
# Backend: http://localhost:8080
```

---

## 📁 Project Structure

```
Smart-Campus/
├── backend/
│   ├── src/main/java/com/smartcampus/
│   │   ├── entity/              # JPA Models (Database entities)
│   │   ├── repository/          # Data Access Layer (Spring Data JPA)
│   │   ├── service/             # Business Logic Layer
│   │   ├── controller/          # REST API Endpoints
│   │   ├── dto/                 # Data Transfer Objects
│   │   ├── exception/           # Custom Exceptions
│   │   ├── config/              # Security, CORS, Global handlers
│   │   ├── util/                # Helper utilities
│   │   └── SmartCampusBackendApplication.java
│   ├── src/test/java/           # Unit & Integration Tests
│   ├── schema.sql               # Database initialization
│   ├── pom.xml                  # Maven dependencies
│   └── docker-compose.yml       # Local development environment
├── frontend/
│   ├── src/
│   │   ├── App.tsx              # Main React component
│   │   ├── main.tsx             # Entry point
│   │   └── assets/              # Static files
│   ├── package.json             # NPM dependencies
│   └── vite.config.ts           # Vite build config
├── .github/
│   └── workflows/
│       └── build.yml            # CI/CD Pipeline
├── README.md                    # This file
└── SETUP_WORKFLOW.md            # Detailed implementation guide
```

---

## 📝 API Endpoints Overview

### Module A - Resources (4+ endpoints required)
```
GET    /api/resources              # List all resources
GET    /api/resources/{id}         # Get single resource
POST   /api/resources              # Create resource
PUT    /api/resources/{id}         # Update resource
DELETE /api/resources/{id}         # Delete resource
GET    /api/resources/type/{type}  # Filter by type
```

### Module B - Bookings (4+ endpoints required)
```
GET    /api/bookings               # List bookings
POST   /api/bookings               # Create booking
PUT    /api/bookings/{id}          # Update booking
DELETE /api/bookings/{id}          # Cancel booking
GET    /api/bookings/conflicts     # Check conflicts
```

### Module C - Maintenance Tickets (4+ endpoints required)
```
GET    /api/tickets                # List tickets
POST   /api/tickets                # Create ticket
PUT    /api/tickets/{id}           # Update status
DELETE /api/tickets/{id}           # Close ticket
POST   /api/tickets/{id}/comments  # Add comment
```

### Module D & E - Notifications & Auth (4+ endpoints required)
```
GET    /api/notifications          # List notifications
POST   /api/auth/login             # OAuth2 login
GET    /api/auth/user              # Current user
POST   /api/auth/logout            # Logout
```

---

## 🔄 GitHub Actions CI/CD

**Location:** `.github/workflows/build.yml`

**Automated Pipeline:**
- Builds backend and frontend
- Runs tests with MySQL service
- Validates code quality (ESLint)
- Caches dependencies for speed

---

## 🗄️ Database

**Schema:** `backend/schema.sql` (auto-initialized with docker-compose)

**Tables:**
- users (OAuth + roles)
- resources (facilities)
- bookings (with conflict checks)
- tickets + attachments (max 3 images)
- comments (on tickets)
- notifications (status updates)

---

## 📋 For Detailed Setup Instructions

See: **[SETUP_WORKFLOW.md](SETUP_WORKFLOW.md)** for:
- Complete package structure
- Implementation workflow by module
- Git branching strategy
- Member responsibility matrix
- Submission checklist

---

## 🚀 Start Implementation

1. **Read:** SETUP_WORKFLOW.md (full guide)
2. **Clone:** Repository to each team member's machine
3. **Branch:** Create feature branches per module
4. **Code:** Implement assigned endpoints and services
5. **Test:** Run GitHub Actions, Postman collection
6. **Submit:** By 27 April 2026, 11:45 PM GMT +5:30

---

**Status:** ✅ Setup Complete | 🚀 Ready for Implementation