# OnTime Dental Platform

A modern dental clinic management platform built with Next.js, GraphQL, TypeScript, and MongoDB. This repository currently implements the authentication foundation with a GraphQL-based login workflow and a polished login experience.

## Tech stack

- **Next.js 14** with the App Router and TypeScript
- **GraphQL** API powered by Apollo Server
- **MongoDB** with Mongoose for data modeling
- **JWT** authentication utilities for secure token issuance
- **Tailwind CSS** for rapid UI development

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy `.env.example` to `.env.local` and update the values with your own secrets and MongoDB connection string.

   ```bash
   cp .env.example .env.local
   ```

3. **Seed an initial user (optional)**

   You can seed a user by inserting a document directly in MongoDB with a `bcrypt` hashed password, or create a dedicated mutation in a future step of the project.

4. **Run the development server**

   ```bash
   npm run dev
   ```

   The app will be available at [http://localhost:3000](http://localhost:3000). The `/api/graphql` endpoint exposes the GraphQL playground when accessed with a GraphQL client.

## Roadmap

- [x] Set up project foundation with Next.js, Tailwind CSS, and linting
- [x] Implement secure login mutation using GraphQL and MongoDB
- [x] Design a modern, responsive login screen
- [ ] Add user registration and password reset flows
- [ ] Build clinic management dashboards and scheduling modules
- [ ] Integrate role-based access control and audit logging

## License

This project uses only free and open-source dependencies.
