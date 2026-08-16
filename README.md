# WorkspaceHub

WorkspaceHub is a full-stack MERN SaaS project and team management web application designed for organizing work within companies. It enables users to create and manage projects, track individual tasks with comment discussions, schedule resource bookings, and control administrative permissions based on user roles. It is built with TypeScript on both the client and server.

The codebase is intentionally structured so permissions, booking conflict checks, and feature-flag enforcement are isolated and easy to break later in separate exercise branches.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT authentication
- Context API for client state
- Vercel

## Project Structure

```text
workspacehub/
  client/
  server/
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment examples and fill them in:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Recommended local values:

```env
# server/.env
PORT=5001
MONGODB_URI=mongodb://127.0.0.1:27017/workspacehub
JWT_SECRET=super-secret-jwt-key
CLIENT_ORIGIN=http://localhost:5173
```

```env
# client/.env
VITE_API_URL=http://localhost:5001
```

3. Start MongoDB locally or point `MONGODB_URI` at an existing instance.

4. Seed demo data:

```bash
npm run seed
```

5. Run the server and client in separate terminals:

```bash
npm run dev:server
npm run dev:client
```

## Demo Users

The seed script creates one organization with these users:

- `owner@workspacehub.dev` / `Password123!`
- `admin@workspacehub.dev` / `Password123!`
- `member@workspacehub.dev` / `Password123!`

## Scripts

- `npm run dev:server`
- `npm run dev:client`
- `npm run build`
- `npm run seed`

## Notes

- All protected API responses follow the same JSON envelope:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

- The booking overlap rule is isolated in the booking service.
- Feature-flag checks are isolated in a reusable middleware/service path.
- Permission logic is centralized in auth and permission helpers.

## Features

- Task count component onto a project's tile when viewing the Projects page.
- Compact member preview area on the dashboard that lets users quickly see who is on their team and their roles.
- Error alert message to display where an issue happens if a specific action fails.
- Form validation check to inspect booking details and in case of an error, showing a clear error message right on the form before a booking can be submitted.
- Show/hide comments toggle that shows how many comments a task has, that can expand to show the comments list in order to post, view, edit, or delete comments, or collapsed to keep the workspace clean.
- A newly typed task comment instantly shows up at the top of the task comments list.
- Task comment management edit and delete button options are shown only to the original author, organization owner and admins.

## Frontend Live Link

https://ai-se-project-workspacehub-client-git-workspac-93b026-lf-808mlb.vercel.app
