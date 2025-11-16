# Social Sync Backend

A robust, scalable backend API built with Fastify, TypeScript, and PostgreSQL for managing user authentication and social media account synchronization.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Features](#features)
- [Getting Started](#getting-started)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Environment Variables](#environment-variables)
- [Development](#development)
- [Database Migrations](#database-migrations)

## Overview

Social Sync Backend is a RESTful API designed to handle user authentication, OTP verification, and management of connected social media accounts across multiple platforms. The application follows a clean, modular architecture pattern with separation of concerns between routes, controllers, middleware, and data access layers.

## Tech Stack

### Core Technologies
- **Runtime**: Node.js with TypeScript
- **Framework**: Fastify v5.4.0 - High-performance web framework
- **Database**: PostgreSQL with connection pooling via `pg`
- **ORM**: Drizzle ORM v0.44.3 - Type-safe SQL ORM
- **Validation**: Zod v4.0.10 - Schema validation

### Key Dependencies
- **Authentication**: 
  - `jose` v6.0.12 - JWT encoding/decoding
  - `bcrypt` v6.0.0 - Password hashing
  - `@fastify/cookie` v11.0.2 - Cookie management
- **Middleware**: 
  - `@fastify/cors` v11.0.1 - Cross-Origin Resource Sharing
  - `@fastify/env` v5.0.2 - Environment variable validation
  - `@fastify/express` v4.0.2 - Express.js compatibility
- **Build Tools**:
  - `tsup` v8.5.0 - Fast TypeScript bundler
  - `tsx` v4.20.3 - TypeScript execution
  - `drizzle-kit` v0.31.4 - Database migration tool

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   HTTP Client   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│      Fastify Server             │
│  ┌───────────────────────────┐  │
│  │  Middleware Layer         │  │
│  │  - CORS                   │  │
│  │  - Cookie Parser          │  │
│  │  - Auth Middleware        │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  Route Layer              │  │
│  │  - User Routes (/user)    │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  Controller Layer         │  │
│  │  - UserController         │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  Validation Layer         │  │
│  │  - Zod Schemas            │  │
│  └───────────────────────────┘  │
└────────┬─────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│      Database Layer             │
│  ┌───────────────────────────┐  │
│  │  Drizzle ORM              │  │
│  │  - Schema Definitions     │  │
│  │  - Query Builder          │  │
│  │  - Type Inference         │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  PostgreSQL Pool          │  │
│  │  - Connection Pooling     │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

### Design Patterns

1. **Plugin Pattern**: Fastify plugins for modular code organization
2. **Controller Pattern**: Controllers handle HTTP request/response logic
3. **Middleware Pattern**: Pre-request handlers for authentication and validation
4. **Repository Pattern**: Drizzle ORM abstracts database access
5. **Validation Pattern**: Zod schemas validate request data before processing

### Request Flow

1. **HTTP Request** → Fastify receives request
2. **CORS Middleware** → Validates cross-origin requests
3. **Cookie Parser** → Extracts cookies if present
4. **Route Matching** → Fastify matches route to controller method
5. **Validation** → Zod schema validates request body/query/params
6. **Auth Middleware** (if protected) → Validates JWT token
7. **Controller** → Business logic execution
8. **Database Query** → Drizzle ORM executes query
9. **Response** → JSON response sent to client

## Project Structure

```
social-sync-backend/
├── src/
│   ├── db/
│   │   └── index.ts              # Database connection and Fastify plugin
│   ├── index.ts                  # Application entry point
│   ├── middleware/
│   │   └── auth.middleware.ts    # JWT authentication middleware
│   ├── migrations/               # Database migration files
│   │   ├── 0000_busy_silhouette.sql
│   │   └── meta/
│   ├── models/                   # Database schema definitions
│   │   ├── accounts.schema.ts    # Social media accounts table
│   │   ├── otp.schema.ts         # OTP verification table
│   │   ├── serivces.schema.ts    # Social media services table
│   │   └── user.schema.ts        # Users table
│   ├── schema/
│   │   └── schema.ts             # Consolidated schema exports and relations
│   ├── types/
│   │   └── fastify.d.ts          # TypeScript type augmentations
│   ├── users/
│   │   ├── user.controller.ts    # User-related HTTP handlers
│   │   └── user.validation.schema.ts  # Zod validation schemas
│   └── utils/
│       └── index.ts              # Utility functions (JWT, bcrypt, Zod helpers)
├── drizzle.config.ts             # Drizzle ORM configuration
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

### Directory Descriptions

#### `src/db/`
- **Purpose**: Database connection setup and Fastify plugin registration
- **Key File**: `index.ts` - Creates PostgreSQL connection pool and decorates Fastify instance with Drizzle ORM

#### `src/middleware/`
- **Purpose**: HTTP request middleware
- **Auth Middleware**: Validates JWT tokens from Authorization header, extracts user payload

#### `src/models/`
- **Purpose**: Database table schema definitions using Drizzle ORM
- **Files**: Each file defines a PostgreSQL table schema with TypeScript types

#### `src/schema/`
- **Purpose**: Centralized schema exports and relationship definitions
- **Relations**: Defines foreign key relationships between tables (users ↔ accounts, services ↔ accounts)

#### `src/users/`
- **Purpose**: User-related business logic
- **Controller**: Handles HTTP routes for authentication and user management
- **Validation**: Zod schemas for request validation

#### `src/utils/`
- **Purpose**: Shared utility functions
- **Functions**: JWT encoding/decoding, password hashing, OTP generation, Zod validation helpers

## Database Schema

### Tables

#### `user`
Stores user account information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique user identifier |
| `name` | VARCHAR(255) | NOT NULL | User's full name |
| `email` | VARCHAR(255) | NOT NULL | User's email address (should be unique) |
| `password` | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| `phone` | VARCHAR(255) | DEFAULT '' | User's phone number |
| `created_at` | TIMESTAMP | DEFAULT now() | Account creation timestamp |

#### `otp`
Stores one-time password codes for email verification.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique OTP record identifier |
| `email` | VARCHAR | NOT NULL | Email address for OTP |
| `code` | VARCHAR | NOT NULL | 4-digit OTP code |
| `is_used` | BOOLEAN | DEFAULT false | Whether OTP has been used |

#### `services`
Stores available social media service configurations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique service identifier |
| `slug` | TEXT | NOT NULL, UNIQUE | URL-friendly service identifier (e.g., "instagram", "youtube") |
| `display_name` | TEXT | NOT NULL | Human-readable service name |
| `auth_type` | TEXT | NOT NULL, DEFAULT 'oauth2' | Authentication method |
| `enabled` | BOOLEAN | NOT NULL, DEFAULT true | Whether service is active |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp |

#### `accounts`
Stores connected social media accounts for users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique account identifier |
| `user_id` | UUID | NOT NULL, FK → user.id | Associated user |
| `service_id` | UUID | NOT NULL, FK → services.id | Associated service |
| `provider_account_id` | TEXT | NOT NULL | Account ID on the provider's platform |
| `username` | TEXT | | Username on the platform |
| `display_name` | TEXT | | Display name on the platform |
| `access_token` | TEXT | | OAuth access token |
| `refresh_token` | TEXT | | OAuth refresh token |
| `expires_at` | TIMESTAMPTZ | | Token expiration timestamp |
| `scopes` | TEXT[] | | Array of granted OAuth scopes |
| `metadata` | JSONB | DEFAULT '{}' | Additional platform-specific data |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Connection timestamp |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT now() | Last update timestamp |

### Relationships

```
user (1) ──→ (many) accounts
services (1) ──→ (many) accounts
```

- **User ↔ Accounts**: One user can have multiple connected social media accounts
- **Services ↔ Accounts**: One service can have multiple account connections

### Foreign Key Constraints

- `accounts.user_id` → `user.id` (ON DELETE CASCADE)
- `accounts.service_id` → `services.id` (ON DELETE CASCADE)

## Features

### Authentication
- **User Registration**: Email-based signup with OTP verification
- **User Login**: Email/password authentication with JWT tokens
- **OTP Verification**: 4-digit OTP codes sent via email (generation only, email sending not implemented)
- **JWT Authentication**: Bearer token-based authentication for protected routes
- **Cookie Support**: JWT tokens stored in HTTP-only cookies

### User Management
- **User Profile**: Fetch authenticated user details
- **Password Security**: bcrypt hashing with 10 salt rounds
- **Input Validation**: Comprehensive Zod validation schemas

### Social Media Integration (Schema Ready)
- **Multi-Platform Support**: Schema designed to support multiple social media platforms
- **OAuth2 Ready**: Account table supports OAuth tokens and scopes
- **Metadata Storage**: Flexible JSONB column for platform-specific data

### API Features
- **CORS Enabled**: Cross-origin requests supported
- **Error Handling**: Centralized error handler with status codes
- **Type Safety**: Full TypeScript support with inferred types
- **Request Validation**: Zod schema validation before processing

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- PostgreSQL database (local or cloud-hosted)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social-sync-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=8080
   DATABASE_URL=postgresql://user:password@localhost:5432/social_sync
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   ```

4. **Set up the database**
   ```bash
   # Generate migrations from schema
   npm run db:generate

   # Apply migrations to database
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:8080`

### Production Build

```bash
# Build the application
npm run build

# Start the production server
npm start
```

### Docker Setup

For easier management, use the provided Docker scripts. See [Docker Guide](./DOCKER.md) and [Scripts Guide](./scripts/README.md) for detailed instructions.

#### Quick Start with Docker

**Development:**
```bash
# Start development services
./scripts/docker-dev.sh start

# Run migrations
./scripts/docker-dev.sh migrate

# View logs
./scripts/docker-dev.sh logs
```

**Production:**
```bash
# Build and start production services
./scripts/docker-prod.sh build
./scripts/docker-prod.sh start

# Create database backup
./scripts/docker-prod.sh backup

# View status
./scripts/docker-prod.sh status
```

#### Using Docker Compose Directly

**Development:**
```bash
docker-compose -f docker-compose.dev.yml up
```

**Production:**
```bash
docker-compose up -d
```

## API Endpoints

### Base URL
```
http://localhost:8080
```

### Authentication Endpoints

#### POST `/user/sign-up`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "password": "SecurePass123!",
  "otp": "1234"
}
```

**Validation Rules:**
- `name`: Minimum 2 characters
- `email`: Valid email format
- `phone`: Minimum 10 characters
- `password`: 
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- `otp`: Must match a valid, unused OTP for the email

**Response:** `200 OK`
```json
{
  "message": "Sign up successful",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `422`: Email already exists, Invalid OTP, or validation errors
- `500`: Internal server error

---

#### POST `/user/sign-in`
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Validation Rules:**
- `email`: Valid email format
- `password`: Same rules as sign-up

**Response:** `200 OK`
```json
{
  "message": "Login successful",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Note:** JWT token is set as an HTTP-only cookie named `token`.

**Error Responses:**
- `422`: Invalid email or password, or validation errors
- `500`: Internal server error

---

#### GET `/user/detail`
Get authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:** `200 OK`
```json
{
  "message": "User details fetched successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401`: Unauthorized (missing or invalid token)
- `500`: Internal server error

---

#### POST `/user/send-email`
Generate and store an OTP code for email verification.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Validation Rules:**
- `email`: Valid email format

**Response:** `200 OK`
```json
{
  "message": "OTP sent successfully"
}
```

**Note:** This endpoint generates an OTP but does not send emails. Email sending logic needs to be implemented separately.

**Error Responses:**
- `422`: Invalid email format
- `500`: Internal server error

## Authentication

### JWT Token Structure

The JWT payload contains:
```typescript
{
  id: string;      // User UUID
  email: string;   // User email
  name: string;    // User name
  iat: number;     // Issued at timestamp
  exp: number;     // Expiration timestamp
}
```

### Token Storage

- **HTTP-Only Cookies**: Tokens are stored in cookies for enhanced security
- **Bearer Token**: Alternative authentication via `Authorization: Bearer <token>` header
- **Expiration**: Tokens expire after 7 days (configurable)

### Protected Routes

Routes protected by authentication middleware:
- `GET /user/detail`

The `AuthMiddleware` validates the JWT token from either:
1. `Authorization: Bearer <token>` header
2. Cookie named `token`

### Password Security

- **Hashing Algorithm**: bcrypt
- **Salt Rounds**: 10
- **Password Requirements**: 
  - Minimum 8 characters
  - Must contain uppercase, lowercase, number, and special character

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `8080` | Server port number |
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `JWT_SECRET` | Yes | `dev-secret` | Secret key for JWT signing (change in production!) |

### Example `.env` file
```env
PORT=8080
DATABASE_URL=postgresql://postgres:password@localhost:5432/social_sync
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-recommended
```

## Development

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload (tsx watch) |
| `npm run build` | Build production bundle (tsup) |
| `npm start` | Start production server (requires build first) |
| `npm test` | Run tests (not configured) |
| `npm run db:generate` | Generate database migrations from schema |
| `npm run db:push` | Push schema changes to database (dev only) |
| `npm run db:drop` | Drop database tables (use with caution!) |
| `npm run db:introspect` | Generate schema from existing database |

### Development Workflow

1. **Make schema changes** in `src/models/*.schema.ts`
2. **Update relations** in `src/schema/schema.ts` if needed
3. **Generate migration**: `npm run db:generate`
4. **Review migration** in `src/migrations/`
5. **Apply migration**: `npm run db:push` (dev) or apply manually in production
6. **Update TypeScript types** (automatically inferred from schema)

### Type Safety

The project leverages TypeScript's type inference:
- **Database Types**: Automatically inferred from Drizzle schemas
- **Request Types**: Augmented via Fastify type declarations
- **JWT Payload**: Typed via `JwtPayload` interface

### Code Organization Best Practices

- **Controllers**: Handle HTTP request/response logic
- **Middleware**: Reusable pre-request handlers
- **Validation**: Zod schemas in validation files
- **Database**: All queries via Drizzle ORM (no raw SQL)
- **Utilities**: Reusable helper functions

## Database Migrations

### Migration Workflow

1. **Define Schema**: Update table schemas in `src/models/`
2. **Export Schema**: Ensure schemas are exported in `src/schema/schema.ts`
3. **Generate Migration**: Run `npm run db:generate`
4. **Review Migration**: Check generated SQL in `src/migrations/`
5. **Apply Migration**: 
   - Development: `npm run db:push`
   - Production: Execute SQL manually or use migration tool

### Migration Files

Migrations are stored in `src/migrations/`:
- SQL files: `0000_<name>.sql`
- Metadata: `meta/_journal.json`, `meta/0000_snapshot.json`

### Drizzle Configuration

The `drizzle.config.ts` file configures:
- Schema location: `./src/schema/schema.ts`
- Output directory: `./src/migrations`
- Database dialect: `postgresql`
- Connection: From `DATABASE_URL` environment variable

## Security Considerations

### Current Implementation
- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ HTTP-only cookies
- ✅ Input validation with Zod
- ✅ SQL injection protection (via Drizzle ORM)
- ✅ Error message sanitization

### Recommendations for Production
- ⚠️ Change `JWT_SECRET` to a strong, randomly generated key
- ⚠️ Implement rate limiting
- ⚠️ Add HTTPS/TLS encryption
- ⚠️ Implement email sending for OTP codes
- ⚠️ Add password reset functionality
- ⚠️ Implement token refresh mechanism
- ⚠️ Add request logging and monitoring
- ⚠️ Configure CORS origins explicitly (currently allows all origins)
- ⚠️ Add database connection pooling limits
- ⚠️ Implement proper error logging

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure code follows existing patterns
4. Test your changes
5. Submit a pull request

## License

ISC

---

**Built with ❤️ using Fastify, TypeScript, and Drizzle ORM**

