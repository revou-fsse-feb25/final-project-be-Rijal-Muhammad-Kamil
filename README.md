# Event Management System - Backend API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">Sistem manajemen event berbasis NestJS dengan TypeScript, Prisma ORM, dan PostgreSQL</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://nodejs.org" target="_blank"><img src="https://img.shields.io/badge/node-%3E%3D16-brightgreen.svg" alt="Node Version" /></a>
  <a href="https://www.postgresql.org/" target="_blank"><img src="https://img.shields.io/badge/database-PostgreSQL-blue.svg" alt="Database" /></a>
</p>

## 📋 Deskripsi

Event Management System adalah aplikasi backend yang dibangun menggunakan NestJS framework untuk mengelola sistem event, tiket, dan transaksi. Sistem ini mendukung berbagai jenis pengguna (attendee, event organizer, admin) dengan fitur-fitur lengkap untuk manajemen event dari pembuatan hingga pembelian tiket.

## 🏗️ Arsitektur Sistem

### Tech Stack
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (JSON Web Token)
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Password Hashing**: bcrypt

### Struktur Proyek
```
src/
├── auth/                 # Modul autentikasi
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   └── dto/
├── common/               # Utilities bersama
│   ├── decorator/        # Custom decorators
│   ├── guard/           # Guards (JWT, Role)
│   ├── interceptor/     # Interceptors
│   └── jwt/             # JWT configuration
├── event/               # Modul event
│   ├── event.controller.ts
│   ├── event.service.ts
│   ├── event.module.ts
│   ├── dto/
│   └── repository/
├── event-organizer/     # Modul event organizer
│   ├── event-organizer.controller.ts
│   ├── event-organizer.service.ts
│   ├── event-organizer.module.ts
│   ├── dto/
│   └── repository/
├── transaction/         # Modul transaksi
│   ├── transaction.controller.ts
│   ├── transaction.service.ts
│   ├── transaction.module.ts
│   ├── dto/
│   └── repository/
├── user/               # Modul user
│   ├── user.controller.ts
│   ├── user.service.ts
│   ├── user.module.ts
│   ├── dto/
│   └── repository/
├── prisma/             # Prisma service
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── app.module.ts       # Root module
└── main.ts            # Entry point
```

## 🗄️ Database Schema (ERD)

### Entitas Utama

#### 1. **User**
- Primary Key: `user_id`
- Fields: email, password, role, first_name, last_name, date_of_birth, gender, phone_number, status
- Roles: `ATTENDEE`, `EVENT_ORGANIZER`, `ADMIN`
- Status: `ACTIVE`, `SUSPENDED`

#### 2. **EventOrganizer**
- Primary Key: `organizer_id`
- Foreign Key: `user_id` (One-to-One dengan User)
- Fields: name, address, description, logo_url

#### 3. **EventCategory**
- Primary Key: `category_id`
- Fields: name (unique)

#### 4. **Event**
- Primary Key: `event_id`
- Foreign Keys: `category_id`, `organizer_id`
- Fields: title, description, terms, location, image_url, status
- Status: `ACTIVE`, `INACTIVE`, `COMPLETED`

#### 5. **EventPeriod**
- Primary Key: `period_id`
- Foreign Key: `event_id`
- Fields: name, start_date, end_date, start_time, end_time, status
- Status: `UPCOMING`, `ONGOING`, `COMPLETED`

#### 6. **TicketTypeCategory**
- Primary Key: `category_id`
- Fields: name (unique)
- Contoh: VIP, Regular, Early Bird

#### 7. **TicketType**
- Primary Key: `type_id`
- Foreign Keys: `period_id`, `category_id`
- Fields: price, discount, quota, status
- Status: `AVAILABLE`, `SOLD_OUT`

#### 8. **Ticket**
- Primary Key: `ticket_id`
- Foreign Keys: `type_id`, `transaction_id`
- Fields: ticket_code (unique)

#### 9. **Transaction**
- Primary Key: `transaction_id`
- Foreign Key: `user_id` (nullable)
- Fields: total_price, payment_method, status
- Payment Methods: `CREDIT_CARD`, `BANK_TRANSFER`, `OVO`, `DANA`, `GOPAY`
- Status: `PENDING`, `SUCCESS`, `FAILED`, `CANCELED`

### Relasi Database
```
User (1) ←→ (0..1) EventOrganizer
User (1) ←→ (0..*) Transaction
EventCategory (1) ←→ (0..*) Event
EventOrganizer (1) ←→ (0..*) Event
Event (1) ←→ (0..*) EventPeriod
EventPeriod (1) ←→ (0..*) TicketType
TicketTypeCategory (1) ←→ (0..*) TicketType
TicketType (1) ←→ (0..*) Ticket
Transaction (1) ←→ (0..*) Ticket
```

## 🚀 Instalasi dan Setup

### Prerequisites
- Node.js (>= 16.x)
- PostgreSQL (>= 12.x)
- npm atau yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd final-project-be-Rijal-Muhammad-Kamil
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Buat file `.env` di root directory:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/event_management"
DIRECT_URL="postgresql://username:password@localhost:5432/event_management"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"

# Application
PORT=3000
NODE_ENV=development
```

### 4. Database Setup
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npm run seed
```

### 5. Jalankan Aplikasi
```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

## 📚 API Documentation

Setelah aplikasi berjalan, akses dokumentasi Swagger di:
```
http://localhost:3000/api
```

### Endpoint Utama

#### Authentication
- `POST /auth/login` - Login user
- `POST /auth/register` - Register user baru

#### Users
- `GET /users` - Get all users (Admin only)
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update user profile
- `DELETE /users/:id` - Delete user (Admin only)

#### Event Organizers
- `POST /event-organizers` - Create event organizer
- `GET /event-organizers` - Get all event organizers
- `GET /event-organizers/:id` - Get event organizer by ID
- `PUT /event-organizers/:id` - Update event organizer
- `DELETE /event-organizers/:id` - Delete event organizer

#### Events
- `POST /events` - Create new event
- `GET /events` - Get all events
- `GET /events/:id` - Get event by ID
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event
- `POST /events/:id/ticket-types` - Create ticket type for event

#### Transactions
- `POST /transactions` - Create new transaction
- `GET /transactions/my-transactions` - Get current user transactions
- `GET /transactions/:id` - Get transaction by ID
- `GET /transactions/user/:userId` - Get transactions by user ID
- `PATCH /transactions/:id` - Update transaction

## 🔐 Authentication & Authorization

### JWT Authentication
Sistem menggunakan JWT untuk autentikasi. Setiap request yang memerlukan autentikasi harus menyertakan token di header:
```
Authorization: Bearer <jwt-token>
```

### Role-Based Access Control
- **ATTENDEE**: Dapat membeli tiket, melihat event, mengelola profil
- **EVENT_ORGANIZER**: Semua hak ATTENDEE + dapat membuat dan mengelola event
- **ADMIN**: Semua hak + dapat mengelola semua data sistem

### Guards
- `JwtAuthGuard`: Memverifikasi JWT token
- `RoleGuard`: Memverifikasi role user untuk akses endpoint tertentu

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## 📦 Scripts Available

```bash
# Development
npm run start:dev      # Start dengan watch mode
npm run start:debug    # Start dengan debug mode

# Production
npm run build          # Build aplikasi
npm run start:prod     # Start production

# Database
npm run seed           # Seed database dengan data sample

# Code Quality
npm run lint           # ESLint check
npm run format         # Prettier format

# Testing
npm run test           # Unit tests
npm run test:watch     # Unit tests dengan watch mode
npm run test:e2e       # End-to-end tests
npm run test:cov       # Test coverage
```

## 🔧 Configuration

### Prisma Configuration
File konfigurasi: `prisma/schema.prisma`
- Database provider: PostgreSQL
- Client generator: prisma-client-js

### NestJS Configuration
- Global validation pipes
- Swagger documentation
- CORS enabled
- Global exception filters

## 🚀 Deployment

### Production Checklist
1. Set environment variables
2. Run database migrations
3. Build aplikasi: `npm run build`
4. Start production: `npm run start:prod`

### Environment Variables untuk Production
```env
NODE_ENV=production
DATABASE_URL=<production-database-url>
JWT_SECRET=<strong-secret-key>
PORT=3000
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Code Style
- Gunakan ESLint dan Prettier
- Follow NestJS best practices
- Tulis unit tests untuk fitur baru
- Update dokumentasi jika diperlukan

## 📄 License

Project ini menggunakan lisensi UNLICENSED.

## 👥 Team

- **Developer**: Rijal Muhammad Kamil
- **Framework**: NestJS
- **Database**: PostgreSQL dengan Prisma ORM

## 📞 Support

Jika ada pertanyaan atau issue, silakan buat issue di repository ini atau hubungi tim development.

---

**Built with ❤️ using NestJS and TypeScript**
