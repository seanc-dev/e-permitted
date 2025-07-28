# Permit Submission Feature - TDD Plan

## Feature Overview

Allow users to submit basic permit requests with name, address, and permit type information to Kapiti Coast District Council.

## User Stories

### US-001: Submit Basic Permit Application

**As a** resident of Kapiti Coast  
**I want to** submit a permit application online  
**So that** I can avoid paper-based processes and get faster processing

**Acceptance Criteria:**

- [ ] User can access permit submission form
- [ ] Form includes required fields: name, address, permit type
- [ ] Form validates all required fields
- [ ] User receives confirmation upon successful submission
- [ ] Application is stored in database with unique reference
- [ ] AI analysis is triggered for submitted application

### US-002: Form Validation

**As a** user submitting a permit  
**I want to** receive immediate feedback on form errors  
**So that** I can correct issues before submission

**Acceptance Criteria:**

- [ ] Real-time validation of required fields
- [ ] Clear error messages for invalid inputs
- [ ] Form prevents submission with errors
- [ ] Email format validation
- [ ] Phone number format validation

### US-003: Permit Type Selection

**As a** user submitting a permit  
**I want to** select from available permit types  
**So that** I can apply for the correct permit category

**Acceptance Criteria:**

- [ ] Dropdown shows available permit types
- [ ] Each permit type has clear description
- [ ] Selection is required for submission
- [ ] Permit types are council-specific

## Technical Tasks

### Backend Tasks

#### T-001: Database Schema Setup

- [ ] Create Council model
- [ ] Create PermitType model
- [ ] Create User model
- [ ] Create Application model
- [ ] Set up Prisma migrations

#### T-002: API Endpoints

- [ ] POST /api/permits/submit - Submit application
- [ ] GET /api/permits/types - Get permit types
- [ ] GET /api/permits/:id - Get application status
- [ ] POST /api/users - Create user
- [ ] GET /api/councils - Get councils

#### T-003: Validation & Business Logic

- [ ] Input validation with Zod schemas
- [ ] Reference number generation
- [ ] AI integration for analysis
- [ ] Error handling middleware

#### T-004: Testing Backend

- [ ] Unit tests for controllers
- [ ] Integration tests for API endpoints
- [ ] Database integration tests
- [ ] AI service mocking

### Frontend Tasks

#### T-005: Form Components

- [ ] Permit submission form component
- [ ] Form validation with react-hook-form
- [ ] Error message display
- [ ] Loading states

#### T-006: API Integration

- [ ] API client service
- [ ] Error handling
- [ ] Loading states
- [ ] Success/error notifications

#### T-007: UI/UX

- [ ] Responsive form design
- [ ] Progress indicators
- [ ] Success confirmation page
- [ ] Accessibility compliance

#### T-008: Testing Frontend

- [ ] Component unit tests
- [ ] Form validation tests
- [ ] API integration tests
- [ ] E2E tests with Playwright

## Test Plan

### Unit Tests

#### Backend Tests

```typescript
describe("Permit Submission", () => {
  describe("submitPermitApplication", () => {
    it("should create application with valid data");
    it("should generate unique reference number");
    it("should trigger AI analysis");
    it("should return 400 for invalid data");
    it("should handle database errors");
  });

  describe("getPermitTypes", () => {
    it("should return active permit types");
    it("should filter by council");
    it("should handle empty results");
  });

  describe("getPermitApplication", () => {
    it("should return application by ID");
    it("should return 404 for non-existent application");
    it("should include related data");
  });
});
```

#### Frontend Tests

```typescript
describe("PermitSubmissionPage", () => {
  describe("Form Validation", () => {
    it("should show errors for missing required fields");
    it("should validate email format");
    it("should validate phone number format");
    it("should prevent submission with errors");
  });

  describe("Form Submission", () => {
    it("should submit form with valid data");
    it("should show loading state during submission");
    it("should show success message on completion");
    it("should handle API errors");
  });

  describe("User Experience", () => {
    it("should be accessible");
    it("should be responsive");
    it("should provide clear feedback");
  });
});
```

### Integration Tests

#### API Integration

```typescript
describe("API Integration", () => {
  it("should submit permit and return reference");
  it("should retrieve application status");
  it("should handle network errors");
  it("should validate all endpoints");
});
```

#### E2E Tests

```typescript
describe("E2E Permit Submission", () => {
  it("should complete full submission flow");
  it("should handle form validation errors");
  it("should show success confirmation");
  it("should work on mobile devices");
});
```

### Snapshot Tests

- [ ] Form component snapshots
- [ ] Success page snapshots
- [ ] Error state snapshots
- [ ] Loading state snapshots

## Implementation Order

1. **Database Setup** (T-001)
   - Create Prisma schema
   - Run migrations
   - Seed test data

2. **Backend API** (T-002, T-003)
   - Implement controllers
   - Add validation
   - Set up error handling

3. **Backend Tests** (T-004)
   - Write unit tests
   - Write integration tests
   - Ensure all tests pass

4. **Frontend Form** (T-005)
   - Create form component
   - Add validation
   - Implement UI

5. **Frontend Integration** (T-006)
   - Connect to API
   - Add error handling
   - Implement loading states

6. **Frontend Tests** (T-008)
   - Write component tests
   - Write E2E tests
   - Ensure all tests pass

7. **Polish & Deploy** (T-007)
   - UI/UX improvements
   - Accessibility audit
   - Performance optimization

## Success Criteria

- [ ] All acceptance criteria met
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code coverage > 80%
- [ ] No critical bugs
- [ ] Performance benchmarks met
- [ ] Accessibility compliance
- [ ] Mobile responsiveness
- [ ] Security audit passed

## Risk Mitigation

- **Database Performance**: Use proper indexing and query optimization
- **AI Service Reliability**: Implement fallback and error handling
- **Form Complexity**: Start simple, iterate based on feedback
- **Security**: Input validation, rate limiting, CORS configuration
- **Testing**: Comprehensive test coverage with CI/CD integration
