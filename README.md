# PetCareX

This is the repository for our CS12002_Database Advanced project

## 📁 Project Structure

```
PetCareX/
├── backend/          # NestJS backend API
├── frontend/         # Angular frontend application
├── docker-compose.yml
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker (optional)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd PetCareX
```

2. Install dependencies for both frontend and backend:
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Or use Docker:
```bash
docker-compose up
```

---

## 🌿 Git Workflow & Branching Strategy

### Branch Naming Convention

We follow a structured branch naming convention:

| Branch Type | Pattern | Example |
|-------------|---------|---------|
| Feature | `feature/<issue-id>-<short-description>` | `feature/123-user-authentication` |
| Bug Fix | `bugfix/<issue-id>-<short-description>` | `bugfix/456-login-error` |
| Hotfix | `hotfix/<issue-id>-<short-description>` | `hotfix/789-critical-security-fix` |
| Release | `release/<version>` | `release/1.0.0` |
| Documentation | `docs/<short-description>` | `docs/api-documentation` |

### Creating a New Branch for a Feature

```bash
# 1. Make sure you're on the main branch and it's up to date
git checkout main
git pull origin main

# 2. Create and switch to a new feature branch
git checkout -b feature/<issue-id>-<short-description>

# Example:
git checkout -b feature/101-pet-profile-page
```

### Making Commits

Follow the **Conventional Commits** specification:

```
<type>(<scope>): <subject>

[optional body]
[optional footer]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(auth): add user login functionality"
git commit -m "fix(pets): resolve pet image upload issue"
git commit -m "docs(readme): update installation instructions"
```

### Creating a Pull Request (PR)

1. **Push your branch to remote:**
```bash
git push origin feature/<your-branch-name>
```

2. **Create a Pull Request on GitHub/GitLab:**
   - Go to the repository on GitHub/GitLab
   - Click "New Pull Request" or "Create Merge Request"
   - Select your branch as the source and `main` as the target
   - Fill in the PR template

3. **PR Title Format:**
```
[TYPE] Short description (#issue-number)

Example:
[FEATURE] Add pet profile page (#101)
[BUGFIX] Fix login validation error (#202)
```

4. **PR Description Template:**
```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Refactoring
- [ ] Other (please describe)

## Related Issue
Closes #<issue-number>

## Checklist
- [ ] My code follows the project's coding standards
- [ ] I have tested my changes locally
- [ ] I have updated documentation if needed
- [ ] All tests pass
```

5. **Request Reviews:**
   - Assign at least 1-2 reviewers
   - Address all review comments before merging

---

## File Naming Conventions

### General Rules

- Use **lowercase** letters
- Use **hyphens** (`-`) to separate words (kebab-case)
- Be descriptive but concise
- Include file type suffix where applicable

### Frontend (Angular)

| File Type | Pattern | Example |
|-----------|---------|---------|
| Component | `<name>.component.ts` | `pet-profile.component.ts` |
| Component HTML | `<name>.component.html` | `pet-profile.component.html` |
| Component CSS | `<name>.component.css` | `pet-profile.component.css` |
| Service | `<name>.service.ts` | `pet.service.ts` |
| Module | `<name>.module.ts` | `pet.module.ts` |
| Interface/Model | `<name>.model.ts` | `pet.model.ts` |
| Guard | `<name>.guard.ts` | `auth.guard.ts` |
| Pipe | `<name>.pipe.ts` | `date-format.pipe.ts` |
| Directive | `<name>.directive.ts` | `highlight.directive.ts` |
| Spec (Test) | `<name>.spec.ts` | `pet.service.spec.ts` |

### Backend (NestJS)

| File Type | Pattern | Example |
|-----------|---------|---------|
| Controller | `<name>.controller.ts` | `pets.controller.ts` |
| Service | `<name>.service.ts` | `pets.service.ts` |
| Module | `<name>.module.ts` | `pets.module.ts` |
| Entity | `<name>.entity.ts` | `pet.entity.ts` |
| DTO | `<name>.dto.ts` | `create-pet.dto.ts` |
| Interface | `<name>.interface.ts` | `pet.interface.ts` |
| Guard | `<name>.guard.ts` | `jwt-auth.guard.ts` |
| Middleware | `<name>.middleware.ts` | `logger.middleware.ts` |
| Decorator | `<name>.decorator.ts` | `roles.decorator.ts` |
| Spec (Test) | `<name>.spec.ts` | `pets.service.spec.ts` |

### Folder Structure Naming

- Use **plural** names for resource folders (e.g., `pets/`, `users/`)
- Use **singular** names for utility/shared folders (e.g., `common/`, `shared/`)

---

## 🔄 Code Review Guidelines

### For Authors
- Keep PRs small and focused (ideally < 400 lines)
- Write clear commit messages
- Self-review before requesting reviews
- Respond to feedback promptly

### For Reviewers
- Review within 24 hours if possible
- Be constructive and respectful
- Approve only when confident in the changes
- Use suggestions for minor fixes

---

## 👥 Team Members

| Name | Role |
|------|------|
| TBD | TBD |

---

## 📄 License

This project is for educational purposes as part of CS12002_Database Advanced course.
