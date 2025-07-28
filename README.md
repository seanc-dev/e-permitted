# E-Permitted

AI-powered e-permitting web application for Kapiti Coast District Council and beyond.

## 🏗️ Architecture

This is a full-stack TypeScript application with:

- **Frontend**: React + Vite + TypeScript
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI Integration**: OpenAI API
- **Testing**: Jest + React Testing Library + Playwright

## 📁 Project Structure

```
e-permitted/
├── backend/                 # Express API server
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   ├── prisma/             # Database schema & migrations
│   └── tests/              # Backend tests
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   └── tests/              # Frontend tests
├── cursor-plans/           # TDD feature plans
├── docs/                   # Documentation
└── docker/                 # Docker configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Git

### Setup

1. **Clone and install dependencies:**

   ```bash
   git clone <repository-url>
   cd e-permitted
   npm install
   ```

2. **Environment setup:**

   ```bash
   cp .env.example .env
   # Edit .env with your database and OpenAI API credentials
   ```

3. **Database setup:**

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```

## 🧪 Testing

### Running Tests

```bash
# All tests
npm test

# Backend only
npm run test:backend

# Frontend only
npm run test:frontend

# End-to-end tests
npm run test:e2e
```

### Test-Driven Development

We follow strict TDD:

1. **Plan**: Create feature plan in `cursor-plans/<feature>-plan.md`
2. **Test**: Write failing tests first
3. **Implement**: Minimal code to pass tests
4. **Verify**: Run tests and iterate
5. **Commit**: Clear, descriptive commits

## 🏛️ Council Configuration

The application is designed to support multiple councils:

- **Kapiti Coast District Council** (primary)
- Extensible configuration system for other NZ councils
- Future: Global council support

Each council has its own:

- Permit types and requirements
- Validation rules
- Fee structures
- Document templates

## 🤖 AI Integration

OpenAI API powers:

- Intelligent form validation
- Permit classification
- User guidance and recommendations
- Document analysis

## 📝 Development Workflow

1. Create feature plan following TDD
2. Write comprehensive tests
3. Implement minimal working code
4. Run full test suite
5. Commit with clear messages
6. Document any API changes

## 🐳 Docker

```bash
# Build and run with Docker
docker-compose up --build
```

## 📄 License

MIT License - see LICENSE file for details.
# e-permitted
