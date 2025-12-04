# PetCareX Frontend

Angular-based frontend application for PetCareX project.

##  Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
# or
ng serve
```

The application will be available at `http://localhost:4200`

### Build

```bash
# Development build
ng build

# Production build
ng build --configuration=production
```

### Testing

```bash
# Unit tests
ng test

# E2E tests
ng e2e
```

---

##  Git Workflow

### Creating a New Feature Branch

```bash
# 1. Ensure you're on main and up to date
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/<issue-id>-<description>

# Example:
git checkout -b feature/101-pet-listing-page
```

### Commit Messages

Follow Conventional Commits:

```bash
# Feature
git commit -m "feat(pets): add pet listing component"

# Bug fix
git commit -m "fix(auth): resolve token refresh issue"

# Style/UI
git commit -m "style(pets): update pet card styling"
```

### Push & Create Pull Request

```bash
# Push your branch
git push origin feature/<your-branch-name>
```

Then create a PR on GitHub targeting the `main` branch.

---

##  Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── services/         # Angular services
│   │   ├── models/           # TypeScript interfaces/models
│   │   ├── guards/           # Route guards
│   │   ├── pipes/            # Custom pipes
│   │   ├── directives/       # Custom directives
│   │   └── shared/           # Shared modules
│   ├── assets/               # Static assets
│   ├── environments/         # Environment configs
│   └── styles/               # Global styles
├── public/                   # Public static files
└── package.json
```

---

##  File Naming Conventions

### Components

| Type | Pattern | Example |
|------|---------|---------|
| Component | `<name>.component.ts` | `pet-card.component.ts` |
| Template | `<name>.component.html` | `pet-card.component.html` |
| Styles | `<name>.component.css` | `pet-card.component.css` |
| Spec | `<name>.component.spec.ts` | `pet-card.component.spec.ts` |

### Services

| Type | Pattern | Example |
|------|---------|---------|
| Service | `<name>.service.ts` | `pet.service.ts` |
| Spec | `<name>.service.spec.ts` | `pet.service.spec.ts` |

### Models & Interfaces

| Type | Pattern | Example |
|------|---------|---------|
| Model/Interface | `<name>.model.ts` | `pet.model.ts` |
| Enum | `<name>.enum.ts` | `pet-status.enum.ts` |

### Other Files

| Type | Pattern | Example |
|------|---------|---------|
| Guard | `<name>.guard.ts` | `auth.guard.ts` |
| Pipe | `<name>.pipe.ts` | `truncate.pipe.ts` |
| Directive | `<name>.directive.ts` | `click-outside.directive.ts` |
| Interceptor | `<name>.interceptor.ts` | `auth.interceptor.ts` |
| Resolver | `<name>.resolver.ts` | `pet.resolver.ts` |

### Folder Naming

- Use **kebab-case** for folder names
- Use **plural** for feature folders: `pets/`, `users/`, `appointments/`
- Use **singular** for shared folders: `shared/`, `core/`, `layout/`

---

##  Code Style Guidelines

### TypeScript/Angular

- Use **PascalCase** for class names: `PetCardComponent`
- Use **camelCase** for variables and functions: `getPetById()`
- Use **UPPER_SNAKE_CASE** for constants: `MAX_FILE_SIZE`
- Prefix interfaces with `I` (optional): `IPet` or just `Pet`
- Use meaningful, descriptive names

### CSS/SCSS

- Use **BEM** methodology for class names: `.pet-card__title--active`
- Use CSS variables for theming
- Keep styles scoped to components

### Example Component

```typescript
// pet-card.component.ts
@Component({
  selector: 'app-pet-card',
  templateUrl: './pet-card.component.html',
  styleUrls: ['./pet-card.component.css']
})
export class PetCardComponent implements OnInit {
  @Input() pet: Pet;
  
  constructor(private petService: PetService) {}
  
  ngOnInit(): void {
    // initialization logic
  }
}
```

---

##  Related Documentation

- [Main Project README](../README.md)
- [Backend README](../backend/README.md)
- [Angular Documentation](https://angular.io/docs)

