# Contributing to BaiTech Backend

Thank you for considering contributing to BaiTech! We appreciate your time and effort in helping improve our platform.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)

---

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without permission

---

## Getting Started

### Prerequisites

- Node.js >= 18.x
- MongoDB >= 6.x
- Git
- Code editor (VS Code recommended)

### Initial Setup

1. **Fork the repository**
```bash
# Click 'Fork' on GitHub
```

2. **Clone your fork**
```bash
git clone https://github.com/YOUR_USERNAME/baitech-backend.git
cd baitech-backend
```

3. **Add upstream remote**
```bash
git remote add upstream https://github.com/baitech/baitech-backend.git
```

4. **Install dependencies**
```bash
npm install
```

5. **Set up environment**
```bash
cp .env.example .env
# Edit .env with your local configuration
```

6. **Start MongoDB**
```bash
# Using local MongoDB
mongod

# Or use Docker
docker run -d -p 27017:27017 mongo:6
```

7. **Run the application**
```bash
npm run dev
```

8. **Run tests**
```bash
npm test
```

---

## Development Workflow

### Branch Naming Convention

Use descriptive branch names following this pattern:

- `feature/` - New features
- `bugfix/` - Bug fixes
- `hotfix/` - Urgent fixes for production
- `refactor/` - Code refactoring
- `docs/` - Documentation updates
- `test/` - Adding or updating tests

**Examples:**
```
feature/ai-matching-algorithm
bugfix/payment-callback-error
hotfix/security-vulnerability
refactor/user-authentication
docs/api-documentation-update
test/booking-controller-tests
```

### Development Process

1. **Create a new branch**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes**
```bash
# Write code
# Add tests
# Update documentation
```

3. **Test your changes**
```bash
npm test
npm run lint
```

4. **Commit your changes**
```bash
git add .
git commit -m "feat: add AI matching algorithm"
```

5. **Keep your branch updated**
```bash
git fetch upstream
git rebase upstream/main
```

6. **Push to your fork**
```bash
git push origin feature/your-feature-name
```

7. **Create Pull Request**
   - Go to GitHub
   - Click "New Pull Request"
   - Fill in the template

---

## Coding Standards

### General Principles

- **DRY** (Don't Repeat Yourself)
- **KISS** (Keep It Simple, Stupid)
- **YAGNI** (You Aren't Gonna Need It)
- **SOLID** principles
- Write self-documenting code

### Code Style

We follow the **Airbnb JavaScript Style Guide** with some modifications.

#### Key Rules

1. **Use 2 spaces for indentation**
```javascript
// Good
function example() {
  return true;
}

// Bad
function example() {
    return true;
}
```

2. **Use single quotes for strings**
```javascript
// Good
const name = 'John';

// Bad
const name = "John";
```

3. **Use const/let, never var**
```javascript
// Good
const API_VERSION = 'v1';
let counter = 0;

// Bad
var counter = 0;
```

4. **Use arrow functions for callbacks**
```javascript
// Good
array.map(item => item.name);

// Bad
array.map(function(item) {
  return item.name;
});
```

5. **Use async/await over promises**
```javascript
// Good
async function getUser(id) {
  try {
    const user = await User.findById(id);
    return user;
  } catch (error) {
    throw error;
  }
}

// Bad
function getUser(id) {
  return User.findById(id)
    .then(user => user)
    .catch(error => throw error);
}
```

### File Structure

```javascript
// 1. External imports
const express = require('express');
const mongoose = require('mongoose');

// 2. Internal imports
const User = require('../models/User');
const { sendEmail } = require('../services/email.service');

// 3. Constants
const MAX_RETRY_ATTEMPTS = 3;

// 4. Helper functions (if small)
const formatDate = (date) => {
  // ...
};

// 5. Main exports
exports.getUser = async (req, res) => {
  // ...
};

// 6. Other exports
module.exports = {
  getUser,
  updateUser
};
```

### Naming Conventions

```javascript
// Variables & Functions: camelCase
const userName = 'John';
function getUserDetails() {}

// Classes & Constructors: PascalCase
class UserService {}

// Constants: UPPER_SNAKE_CASE
const MAX_LOGIN_ATTEMPTS = 5;
const API_BASE_URL = 'https://api.example.com';

// Private functions: _prefixWithUnderscore
function _privateHelper() {}

// Boolean variables: use is/has/can prefix
const isActive = true;
const hasPermission = false;
const canEdit = true;

// Arrays: plural names
const users = [];
const bookings = [];

// Functions: verb + noun
function getUserById() {}
function createBooking() {}
function updateProfile() {}
function deleteAccount() {}
```

### Comments

```javascript
/**
 * Get user by ID with related data
 * @param {String} userId - MongoDB ObjectId
 * @param {Object} options - Query options
 * @param {Boolean} options.includeDeleted - Include soft-deleted users
 * @returns {Promise<User>} User object
 * @throws {Error} If user not found
 */
async function getUserById(userId, options = {}) {
  // Validate user ID
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID');
  }

  // Build query
  const query = { _id: userId };
  if (!options.includeDeleted) {
    query.deletedAt = null;
  }

  // Execute query
  const user = await User.findOne(query);

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}
```

### Error Handling

```javascript
// Good - Specific error handling
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  if (error.name === 'ValidationError') {
    throw new ValidationError(error.message);
  } else if (error.code === 11000) {
    throw new DuplicateError('Resource already exists');
  } else {
    logger.error('Unexpected error:', error);
    throw new InternalServerError();
  }
}

// Bad - Swallowing errors
try {
  await riskyOperation();
} catch (error) {
  // Silent failure
}
```

### Database Queries

```javascript
// Good - Select only needed fields
const user = await User.findById(userId)
  .select('firstName lastName email')
  .lean();

// Bad - Return everything
const user = await User.findById(userId);

// Good - Use indexes
const users = await User.find({ role: 'technician', status: 'active' })
  .sort({ rating: -1 })
  .limit(20);

// Good - Pagination
const { skip, limit } = paginate(page, perPage);
const users = await User.find(query)
  .skip(skip)
  .limit(limit);
```

### Security Best Practices

```javascript
// Good - Sanitize input
const sanitizedInput = mongoSanitize(req.body);

// Good - Validate before processing
const { error, value } = schema.validate(req.body);
if (error) {
  return res.status(400).json({ error: error.details });
}

// Good - Never expose sensitive data
const user = await User.findById(id).select('-password -refreshTokens');

// Good - Use parameterized queries (Mongoose does this by default)
const user = await User.findOne({ email: userEmail });
```

---

## Git Workflow

### Commit Message Format

We use **Conventional Commits** specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Changes to build process or auxiliary tools
- `ci`: CI/CD changes

#### Examples

```bash
# Feature
git commit -m "feat(matching): add AI-powered technician matching algorithm"

# Bug fix
git commit -m "fix(auth): resolve JWT token expiration issue"

# Documentation
git commit -m "docs(api): update authentication endpoints documentation"

# Refactoring
git commit -m "refactor(booking): simplify booking status state machine"

# With breaking change
git commit -m "feat(payment)!: migrate to Stripe v3 API

BREAKING CHANGE: Payment integration now requires Stripe SDK v3"
```

### Keeping Your Fork Updated

```bash
# Fetch latest changes
git fetch upstream

# Update your main branch
git checkout main
git merge upstream/main

# Update your feature branch
git checkout feature/your-feature
git rebase upstream/main
```

---

## Pull Request Process

### Before Creating a PR

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No console.logs or debugging code
- [ ] Commits follow conventional commits format

### PR Template

Your PR should include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Code commented where needed
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing

## Screenshots (if applicable)
Add screenshots for UI changes
```

### Review Process

1. **Automated Checks**
   - Linting
   - Tests
   - Code coverage

2. **Code Review**
   - At least 1 approval required
   - Address all comments
   - Re-request review after changes

3. **Merge**
   - Squash and merge for feature branches
   - Rebase and merge for hotfixes

---

## Testing Guidelines

### Test Structure

```javascript
describe('User Controller', () => {
  describe('GET /api/v1/users/:id', () => {
    it('should return user when valid ID provided', async () => {
      // Arrange
      const userId = '507f1f77bcf86cd799439011';
      const mockUser = { _id: userId, name: 'John' };

      // Act
      const response = await request(app)
        .get(`/api/v1/users/${userId}`)
        .set('Authorization', `Bearer ${token}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject(mockUser);
    });

    it('should return 404 when user not found', async () => {
      const response = await request(app)
        .get('/api/v1/users/invalid-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });
});
```

### Test Coverage

- Aim for **80%+ code coverage**
- All controllers should have tests
- All models should have tests
- Critical services must have tests

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- user.test.js

# Watch mode
npm run test:watch
```

---

## Documentation

### Code Documentation

- Add JSDoc comments for all public functions
- Document complex algorithms
- Explain non-obvious code sections
- Keep README.md updated

### API Documentation

- Update Swagger/OpenAPI specs
- Include request/response examples
- Document error responses
- Update API_ROUTES_SUMMARY.md

### Markdown Files

- Use proper markdown formatting
- Include table of contents for long documents
- Add code examples
- Keep language clear and concise

---

## Issue Reporting

### Bug Reports

Include:
- **Description**: Clear description of the bug
- **Steps to Reproduce**: Detailed steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, Node version, etc.
- **Screenshots**: If applicable
- **Logs**: Relevant error logs

### Feature Requests

Include:
- **Problem**: What problem does this solve?
- **Solution**: Proposed solution
- **Alternatives**: Alternative solutions considered
- **Additional Context**: Any other relevant information

---

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

---

## Questions?

- Open an issue for questions
- Join our Discord community
- Email: dev@baitech.com

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to BaiTech!** 🎉
