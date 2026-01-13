# PetCareX — Pet Care Management System

![Node.js](https://img.shields.io/badge/Node-18.x-informational?logo=node.js&color=3C873A) ![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E) ![Angular](https://img.shields.io/badge/Angular-19.x-DD0031) ![SQL Server](https://img.shields.io/badge/SQL%20Server-2019-blue)

PetCareX is a full-stack veterinary clinic management platform that supports multi-branch operations, appointments, medical records, inventory, and sales. This README follows a clean, developer-friendly layout with quick-start steps, features, screenshots, and contribution notes.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
- [Database & seeds](#database--seeds)
- [Folder structure](#folder-structure)
- [Contributing](#contributing)
- [License & Contact](#license--contact)

---

## Features

### Guest features
- Browse product catalog
- View doctors and clinic branches

### Authenticated user (Customer)
- Manage pets, appointments, orders and profile
- Shopping cart and checkout

### Doctor portal
- Appointment queue and medical exam records
- Prescriptions and vaccination history

### Admin / Staff
- Multi-branch management, employee management
- Inventory, invoices, sales reporting and analytics
- Role-based access control (RBAC)

Security: bcrypt password hashing, JWT-based auth, input validation and role guards.

---

## Tech Stack

- Backend: NestJS, TypeORM, TypeScript
- Frontend: Angular 19, TypeScript, RxJS
- Database: Microsoft SQL Server (mssql or msnodesqlv8)

---

## Screenshots

Add screenshots into `docs/screenshots/` and reference them here. Example:

![UI Screenshot](docs/screenshots/dashboard.png)

If you want, I can capture and add a set of screenshots from the running app (if accessible).

---

## Getting Started

Prerequisites
- Node 18+ and npm or yarn
- Microsoft SQL Server (local or Azure)

Clone & run

```bash
git clone https://github.com/RainyinSaiGon/PetCareX.git
cd PetCareX
```

Backend (development)

```bash
cd backend
npm install
# create or copy .env (see .env.example if present)
npm run start:dev
```

Frontend

```bash
cd frontend
npm install
npm start
```

There is a `start.bat` at the repo root for convenient Windows dev startup.

---

## Database & seeds

From the `backend/` folder:

```bash
npm run db:init      # run DB init helper
npm run db:seed      # seed sample data
```

If the project contains large SQL dumps, keep them in `database/` and avoid committing snapshots larger than GitHub's limits.

---

## Folder structure

```
PetCareX/
├── backend/              # NestJS API server (src, scripts, package.json)
├── frontend/             # Angular app (src, assets, angular.json)
├── database/             # SQL scripts and sample data
├── docs/                 # docs + screenshots (recommended)
├── start.bat
└── README.md
```

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit and push your changes
4. Open a Pull Request and describe your changes

Please follow the code style used in the project and run tests where applicable.

---

## License & Contact

This project is licensed under the MIT License.

- Repository: https://github.com/RainyinSaiGon/PetCareX

---

If you'd like, I can apply the dark-themed styling, insert badges for exact package versions, add `.env.example`, or populate `docs/screenshots/` with images copied from the frontend — tell me which and I will proceed.
2. Follow the existing TypeScript & linting conventions

