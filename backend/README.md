# PetCareX Backend

NestJS-based backend API for PetCareX project.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Database (PostgreSQL/MySQL - as configured)

### Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server
npm run start:dev
```

The API will be available at `http://localhost:3000`

### Build

```bash
# Build for production
npm run build

# Start production server
npm run start:prod
```

### Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 🌿 Git Workflow

### Creating a New Feature Branch

```bash
# 1. Ensure you're on main and up to date
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/<issue-id>-<description>

# Example:
git checkout -b feature/102-pet-api-endpoints
```

### Commit Messages

Follow Conventional Commits:

```bash
# Feature
git commit -m "feat(pets): add CRUD endpoints for pets"

# Bug fix
git commit -m "fix(auth): resolve JWT validation issue"

# Database
git commit -m "feat(db): add pet entity migration"
```

### Push & Create Pull Request

```bash
# Push your branch
git push origin feature/<your-branch-name>
```

Then create a PR on GitHub targeting the `main` branch.

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── modules/              # Feature modules
│   │   ├── pets/
│   │   │   ├── dto/
│   │   │   ├── entities/
│   │   │   ├── pets.controller.ts
│   │   │   ├── pets.service.ts
│   │   │   └── pets.module.ts
│   │   ├── users/
│   │   └── auth/
│   ├── common/               # Shared utilities
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── config/               # Configuration files
│   ├── database/             # Database config & migrations
│   ├── app.module.ts
│   └── main.ts
├── test/                     # E2E tests
└── package.json
```

---

## 📝 File Naming Conventions

### Module Files

| Type | Pattern | Example |
|------|---------|---------|
| Module | `<name>.module.ts` | `pets.module.ts` |
| Controller | `<name>.controller.ts` | `pets.controller.ts` |
| Service | `<name>.service.ts` | `pets.service.ts` |
| Spec | `<name>.spec.ts` | `pets.service.spec.ts` |

### Data Transfer Objects (DTOs)

| Type | Pattern | Example |
|------|---------|---------|
| Create DTO | `create-<name>.dto.ts` | `create-pet.dto.ts` |
| Update DTO | `update-<name>.dto.ts` | `update-pet.dto.ts` |
| Response DTO | `<name>-response.dto.ts` | `pet-response.dto.ts` |
| Query DTO | `<name>-query.dto.ts` | `pet-query.dto.ts` |

### Entities

| Type | Pattern | Example |
|------|---------|---------|
| Entity | `<name>.entity.ts` | `pet.entity.ts` |
| Repository | `<name>.repository.ts` | `pet.repository.ts` |

### Common Files

| Type | Pattern | Example |
|------|---------|---------|
| Guard | `<name>.guard.ts` | `jwt-auth.guard.ts` |
| Decorator | `<name>.decorator.ts` | `current-user.decorator.ts` |
| Filter | `<name>.filter.ts` | `http-exception.filter.ts` |
| Interceptor | `<name>.interceptor.ts` | `logging.interceptor.ts` |
| Pipe | `<name>.pipe.ts` | `validation.pipe.ts` |
| Middleware | `<name>.middleware.ts` | `logger.middleware.ts` |

### Folder Naming

- Use **plural** for resource modules: `pets/`, `users/`, `appointments/`
- Use **singular** for utility folders: `common/`, `config/`, `database/`
- Use **kebab-case** for multi-word folders: `jwt-auth/`

---

## 🎨 Code Style Guidelines

### TypeScript/NestJS

- Use **PascalCase** for class names: `PetsController`, `PetEntity`
- Use **camelCase** for methods and variables: `findAllPets()`, `petId`
- Use **UPPER_SNAKE_CASE** for constants: `JWT_SECRET`
- Suffix classes appropriately: `Service`, `Controller`, `Module`, `Guard`, etc.

### Example Module Structure

```typescript
// pets.controller.ts
@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get()
  findAll(): Promise<Pet[]> {
    return this.petsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Pet> {
    return this.petsService.findOne(id);
  }

  @Post()
  create(@Body() createPetDto: CreatePetDto): Promise<Pet> {
    return this.petsService.create(createPetDto);
  }
}
```

```typescript
// create-pet.dto.ts
export class CreatePetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  breed?: string;

  @IsNumber()
  @IsPositive()
  age: number;
}
```

```typescript
// pet.entity.ts
@Entity('pets')
export class Pet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  breed: string;

  @Column()
  age: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

---

## 📚 API Documentation

Once the server is running, Swagger documentation is available at:
```
http://localhost:3000/api
```

---

## 🔗 Related Documentation

- [Main Project README](../README.md)
- [Frontend README](../frontend/README.md)
- [NestJS Documentation](https://docs.nestjs.com/)

