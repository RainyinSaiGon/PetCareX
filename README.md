## PetCareX

PetCareX is a full-stack veterinary clinic management platform: a NestJS API backend, an Angular 19 frontend, and a SQL Server database. It supports multi-branch clinic operations including customers, pets, appointments, inventory, billing and medical records.

This README gives a concise, up-to-date developer guide to run, test and contribute to the project.

## Key features

- Admin portal: dashboard, analytics, employee & branch management, service configuration and reporting.
- Customer portal: product catalog, shopping cart, order history, pet profiles and appointment booking.
- Doctor portal: appointment queue, medical examinations, prescriptions and vaccination records.
- Inventory & sales: product catalog, stock tracking across warehouses/branches, invoices and price history.
- Appointments & scheduling: customer booking, doctor schedules, calendar views and notifications.
- Billing & payments: invoice generation, payment tracking and basic receipt management.
- Multi-branch & RBAC: multi-clinic support with role-based access (Admin, Employee, Doctor, Customer).
- Security & validation: bcrypt password hashing, JWT authentication, input validation and guards.
- Extensible architecture: modular NestJS structure, TypeORM entities, and seed/migration scripts for automation.

## Tech stack
- Backend: NestJS, TypeORM, TypeScript
- Frontend: Angular 19, TypeScript
- Database: Microsoft SQL Server (mssql / msnodesqlv8)

## Quick start (developer)
1. Clone the repository

```bash
git clone https://github.com/RainyinSaiGon/PetCareX.git
cd PetCareX
```

2. Configure environment (backend)

Create `backend/.env` (or copy from a sample) and set DB + JWT values. Example:

```env
DATABASE_HOST=localhost
DATABASE_PORT=1433
DATABASE_USERNAME=sa
DATABASE_PASSWORD=your-password
DATABASE_NAME=PetCareX

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
PORT=3000
CORS_ORIGIN=http://localhost:4200
```

3. Install dependencies and run

Backend (development):

```bash
cd backend
npm install
npm run start:dev    # NestJS with hot reload (port 3000 by default)
```

Frontend:

```bash
cd frontend
npm install
npm start            # Angular dev server (port 4200)
```

There is a convenience `start.bat` at repository root intended to help start both sides on Windows.

## Database helpers & seed
- Initialize DB helper script: `npm run db:init` (backend)
- Seed sample data: `npm run db:seed` or `npm run db:seed:full` (backend)

Run from the `backend` folder, e.g.:

```bash
cd backend
npm run db:init
npm run db:seed
```

## Useful scripts
- Backend (in `backend/package.json`):
	- `npm run start` — compile & run
	- `npm run start:dev` — watch mode (dev)
	- `npm run build` — build dist
	- `npm run db:init` — run DB init script
	- `npm run db:seed` / `db:seed:full` — seed data
	- `npm run test` / `test:e2e` — unit / e2e tests

- Frontend (in `frontend/package.json`):
	- `npm start` — `ng serve`
	- `npm run build` — production build
	- `npm test` — run frontend tests

## Running tests
- Backend: from `backend/` run `npm run test` (unit) and `npm run test:e2e` (e2e)
- Frontend: from `frontend/` run `npm test`

## Environment & configuration notes
- The backend uses `@nestjs/config` and expects environment variables (DB, JWT, PORT, CORS_ORIGIN). Keep secrets out of VCS.
- If you plan to run on a different DB host or port, update `DATABASE_HOST` and `DATABASE_PORT` accordingly.

## API overview
Authentication endpoints and common resource roots live under `/api` (example):
- POST /api/auth/login — obtain JWT
- GET /api/auth/profile — current user
- Customer routes: `/api/customer/*` (products, doctors, appointments)
- Admin routes: `/api/admin/*` (analytics, management)

For exact contract and request/response shapes, refer to the controllers in `backend/src`.

## Folder structure
Below is a high-level view of the repository layout. See each subfolder for details.

```
PetCareX/
├── backend/                  # NestJS API server
│   ├── src/
│   │   ├── auth/             # Authentication controllers, strategies, DTOs
│   │   ├── entities/         # TypeORM entities (many domain tables)
│   │   ├── modules/          # Feature modules (admin, customer, doctor, sales...)
│   │   ├── scripts/          # DB helpers & seed scripts (init-db, seed-data, create-admin)
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── .env.example          # (recommended) environment variable template
├── frontend/                 # Angular 19 application
│   ├── src/app/              # Angular modules, components, services
│   ├── src/assets/           # images, static assets (product images under public/)
│   └── angular.json
├── database/                 # SQL scripts and sample data
│   ├── petcarex_data.sql
│   └── migrations/
├── start.bat                 # convenience script for Windows dev start
└── README.md
```

## Troubleshooting
- Backend DB connection error: verify SQL Server is running and credentials in `backend/.env` are correct.
- CORS or auth issues: confirm `CORS_ORIGIN` and `JWT_SECRET` match your environment.

## Contributing
Contributions are welcome. Typical workflow:
1. Fork -> branch -> commit -> PR
2. Follow the existing TypeScript & linting conventions

## License
This project is provided under the MIT License.

## Contact
- Repository: https://github.com/RainyinSaiGon/PetCareX

