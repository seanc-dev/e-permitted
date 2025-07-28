# E-Permitted Technical Architecture

## 🏗️ System Overview

E-Permitted is a full-stack TypeScript application built with modern web technologies, designed for scalability and maintainability. The system follows a layered architecture pattern with clear separation of concerns.

## 📐 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │   Pages     │ │ Components  │ │   Hooks     │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │   Services  │ │   Utils     │ │   Types     │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (Express)                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │ Controllers │ │  Services   │ │ Middleware  │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │   Routes    │ │   Utils     │ │   Types     │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Database (PostgreSQL)                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │   Councils  │ │ PermitTypes │ │   Users     │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │Applications │ │   Relations │ │   Indexes   │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐        │
│  │   OpenAI    │ │   Email     │ │   Storage   │        │
│  │   (AI)      │ │  Service    │ │   Service   │        │
│  └─────────────┘ └─────────────┘ └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Design Principles

### 1. **Separation of Concerns**

- **Frontend**: UI/UX, state management, user interactions
- **Backend**: Business logic, data processing, API endpoints
- **Database**: Data persistence, relationships, constraints
- **External Services**: AI analysis, notifications, file storage

### 2. **Type Safety**

- **TypeScript**: Strict mode enabled across entire stack
- **Zod**: Runtime validation for all API inputs
- **Prisma**: Type-safe database queries and migrations

### 3. **Test-Driven Development**

- **Unit Tests**: Individual component/function testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Complete user journey testing
- **Mock Services**: External service simulation

### 4. **Scalability**

- **Modular Architecture**: Easy to extend and maintain
- **Database Optimization**: Proper indexing and query optimization
- **Caching Strategy**: Redis for performance (future)
- **Microservices Ready**: Can be split into services (future)

## 🏛️ Frontend Architecture

### Technology Stack

- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Strict type checking
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **React Hook Form**: Form state management
- **Zod**: Schema validation

### Component Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Form/           # Form-specific components
│   └── UI/             # Generic UI components
├── pages/              # Page-level components
│   ├── HomePage.tsx    # Landing page
│   ├── PermitSubmissionPage.tsx
│   └── ApplicationStatusPage.tsx
├── hooks/              # Custom React hooks
├── services/           # API client and external services
├── utils/              # Utility functions
└── types/              # TypeScript type definitions
```

### State Management

- **Local State**: React useState for component state
- **Form State**: React Hook Form for form management
- **Global State**: Context API (future: Redux Toolkit)
- **Server State**: Custom hooks for API calls

### Routing Strategy

- **Client-side Routing**: React Router for SPA navigation
- **Route Protection**: Authentication guards (future)
- **Lazy Loading**: Code splitting for performance
- **404 Handling**: Proper error boundaries

## 🔧 Backend Architecture

### Technology Stack

- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **TypeScript**: Strict type checking
- **Prisma**: Database ORM
- **PostgreSQL**: Primary database
- **JWT**: Authentication (future)
- **OpenAI**: AI integration

### Layer Structure

```
src/
├── controllers/         # Request/response handlers
│   ├── permitController.ts
│   ├── councilController.ts
│   └── userController.ts
├── services/           # Business logic
│   └── aiService.ts
├── middleware/         # Express middleware
│   ├── errorHandler.ts
│   └── notFoundHandler.ts
├── routes/             # Route definitions
│   ├── permitRoutes.ts
│   ├── councilRoutes.ts
│   └── userRoutes.ts
├── utils/              # Utility functions
│   └── referenceGenerator.ts
└── types/              # TypeScript type definitions
```

### API Design

- **RESTful**: Standard HTTP methods and status codes
- **JSON**: All requests/responses in JSON format
- **Validation**: Zod schemas for input validation
- **Error Handling**: Consistent error response format
- **Rate Limiting**: Express rate limit middleware
- **CORS**: Cross-origin resource sharing configuration

### Database Design

```sql
-- Core entities
councils (id, name, code, country, region)
permit_types (id, name, code, description, council_id, requirements, fees)
users (id, email, first_name, last_name, phone, address)
applications (id, reference, status, user_id, council_id, permit_type_id, data, ai_analysis)

-- Relationships
councils -> permit_types (one-to-many)
councils -> applications (one-to-many)
users -> applications (one-to-many)
permit_types -> applications (one-to-many)
```

## 🗄️ Database Architecture

### Schema Design

- **Normalized**: Proper relationships and constraints
- **Flexible**: JSON fields for dynamic data
- **Indexed**: Performance optimization
- **Auditable**: Timestamps and soft deletes

### Data Models

#### Council

```typescript
interface Council {
  id: string;
  name: string;
  code: string;
  country: string;
  region?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### PermitType

```typescript
interface PermitType {
  id: string;
  name: string;
  code: string;
  description?: string;
  requirements?: Json;
  fees?: Json;
  councilId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### User

```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: Json;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Application

```typescript
interface Application {
  id: string;
  reference: string;
  status: ApplicationStatus;
  userId: string;
  councilId: string;
  permitTypeId: string;
  data: Json;
  documents?: Json;
  aiAnalysis?: Json;
  submittedAt: Date;
  updatedAt: Date;
  processedAt?: Date;
}
```

### Indexing Strategy

- **Primary Keys**: UUID for all tables
- **Foreign Keys**: Proper indexing on relationships
- **Search Indexes**: Full-text search on descriptions
- **Performance Indexes**: Composite indexes for common queries

## 🤖 AI Integration Architecture

### OpenAI Service

- **Asynchronous Processing**: Non-blocking AI analysis
- **Error Handling**: Graceful fallback on AI service failure
- **Caching**: Store analysis results in database
- **Rate Limiting**: Respect OpenAI API limits

### Analysis Pipeline

1. **Application Submission**: Trigger AI analysis
2. **Data Preparation**: Format application data for AI
3. **AI Processing**: Send to OpenAI for analysis
4. **Result Storage**: Save analysis in database
5. **Notification**: Alert user of analysis completion

## 🔒 Security Architecture

### Current Implementation

- **Input Validation**: Zod schemas for all inputs
- **SQL Injection**: Prisma ORM prevents injection
- **CORS**: Proper cross-origin configuration
- **Rate Limiting**: Express rate limit middleware
- **Error Handling**: No sensitive data in error responses

### Future Security Features

- **Authentication**: JWT token-based auth
- **Authorization**: Role-based access control
- **HTTPS**: SSL/TLS encryption
- **Data Encryption**: Sensitive data encryption
- **Audit Logging**: Security event logging

## 📊 Performance Architecture

### Current Optimizations

- **Database Indexes**: Proper indexing strategy
- **Query Optimization**: Efficient Prisma queries
- **Frontend Optimization**: Code splitting and lazy loading
- **Caching**: Browser caching for static assets

### Future Optimizations

- **Redis Caching**: Application-level caching
- **CDN**: Content delivery network
- **Database Sharding**: Horizontal scaling
- **Load Balancing**: Multiple server instances
- **Microservices**: Service decomposition

## 🧪 Testing Architecture

### Test Pyramid

```
    /\
   /  \     E2E Tests (Few)
  /____\    Integration Tests (Some)
 /______\   Unit Tests (Many)
```

### Testing Strategy

- **Unit Tests**: Individual functions and components
- **Integration Tests**: API endpoints and database operations
- **E2E Tests**: Complete user journeys
- **Performance Tests**: Load and stress testing

### Test Environment

- **Separate Database**: Test database isolation
- **Mock Services**: External service simulation
- **Test Data**: Consistent test fixtures
- **CI/CD Integration**: Automated testing pipeline

## 🚀 Deployment Architecture

### Development Environment

- **Docker Compose**: Local development stack
- **Hot Reload**: Development server with live updates
- **Environment Variables**: Configuration management
- **Database Migrations**: Automated schema updates

### Production Environment (Future)

- **Container Orchestration**: Kubernetes or Docker Swarm
- **Load Balancer**: Nginx or HAProxy
- **Database Clustering**: PostgreSQL replication
- **Monitoring**: APM and health checks
- **Logging**: Centralized log management

## 🔄 Data Flow Architecture

### Application Submission Flow

```
User Input → Form Validation → API Request →
Backend Validation → Database Storage →
AI Analysis → Status Update → User Notification
```

### Data Processing Pipeline

1. **Input Validation**: Frontend and backend validation
2. **Data Transformation**: Format data for storage
3. **Database Storage**: Persist application data
4. **AI Processing**: Asynchronous analysis
5. **Status Updates**: Real-time status changes
6. **User Notifications**: Email and in-app notifications

## 📈 Scalability Considerations

### Horizontal Scaling

- **Stateless Backend**: Easy to scale horizontally
- **Database Replication**: Read replicas for performance
- **Load Balancing**: Distribute traffic across instances
- **Microservices**: Service decomposition for scaling

### Vertical Scaling

- **Database Optimization**: Query and index optimization
- **Caching Strategy**: Redis for frequently accessed data
- **CDN**: Static asset delivery optimization
- **Resource Allocation**: CPU and memory optimization

## 🔧 Configuration Management

### Environment Variables

```bash
# Database
DATABASE_URL=postgresql://...

# Server
PORT=5000
NODE_ENV=development

# AI
OPENAI_API_KEY=...

# Security
JWT_SECRET=...
CORS_ORIGIN=...
```

### Configuration Strategy

- **Environment-specific**: Different configs per environment
- **Secret Management**: Secure handling of sensitive data
- **Validation**: Configuration validation at startup
- **Defaults**: Sensible defaults for development

## 📝 Monitoring and Observability

### Current Monitoring

- **Error Logging**: Comprehensive error tracking
- **Performance Metrics**: Response time monitoring
- **Health Checks**: Application health endpoints
- **Database Monitoring**: Query performance tracking

### Future Monitoring

- **APM**: Application performance monitoring
- **Distributed Tracing**: Request flow tracking
- **Metrics Dashboard**: Real-time metrics visualization
- **Alerting**: Automated alerting for issues

---

**Last Updated**: December 2024
**Architecture Version**: 1.0
**Next Review**: After Sprint 1 completion
