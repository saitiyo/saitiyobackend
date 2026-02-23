# Bidocumenti Backend

Bidocumenti is a personal Electronic Document Management System (EDMS) app. This repository contains the backend API built with Express.js and TypeScript.

## Features
- User authentication
- Document management
- Dashboard and analytics
- RESTful API

## Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd bidocumentibackend
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Running the App
Start the development server:
```bash
npm run dev
```

The server will start on the default port (see `src/server.ts`).

### Environment Variables
Create a `.env` file in the root directory and add your configuration (e.g., database URL, JWT secret).

### Database
This project uses Prisma as the ORM. Update your database connection in `prisma/schema.prisma` and run migrations as needed.

## Project Structure
- `src/` - Source code
  - `middleware/` - Express middlewares
  - `services/` - Business logic and route handlers
- `prisma/` - Prisma schema and migrations

## License
MIT
