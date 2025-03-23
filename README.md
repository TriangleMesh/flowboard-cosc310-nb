# Flowboard

A modern project management application built with Next.js, Appwrite, and Tailwind CSS.

## Team

- **Qingyun**
- **Germain**

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Routes](#api-routes)
- [Contributing](#contributing)

## Overview

Flowboard is a collaborative project management tool that allows teams to organize their work in workspaces, projects, and tasks. It provides a clean, intuitive interface for managing team workflows and tracking progress.

## Features

- **Authentication**: User registration, login, and session management
- **Workspaces**: Create and manage team workspaces
- **Projects**: Organize work into projects within workspaces
- **Tasks**: Create, assign, and track tasks with different statuses
- **Members**: Manage workspace members with different roles
- **Real-time Updates**: Stay in sync with your team's progress

## Project Structure

### Root Structure

```
flowboard/
├── src/                  # Source code
├── public/               # Static assets
├── certificates/         # SSL certificates for development
├── .next/                # Next.js build output
├── node_modules/         # Dependencies
├── .env.local            # Environment variables
├── package.json          # Project metadata and dependencies
├── tsconfig.json         # TypeScript configuration
└── tailwind.config.ts    # Tailwind CSS configuration
```

### Source Code Structure

```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Authentication pages
│   ├── (dashboard)/      # Dashboard pages
│   ├── (standalone)/     # Standalone pages
│   ├── api/              # API routes
│   ├── globals.css       # Global styles
│   └── layout.tsx        # Root layout
├── components/           # Shared UI components
│   ├── ui/               # Basic UI components
│   └── ...               # Higher-level components
├── features/             # Feature modules
│   ├── auth/             # Authentication
│   ├── workspaces/       # Workspaces
│   ├── projects/         # Projects
│   ├── tasks/            # Tasks
│   └── members/          # Members
├── lib/                  # Utility functions and libraries
│   ├── appwrite.ts       # Appwrite client setup
│   ├── session-middleware.ts # Session handling
│   └── utils.ts          # General utilities
└── config.ts             # Application configuration
```

### Features Breakdown

#### Authentication (`src/features/auth/`)

- **Components**: Login and registration forms
- **Server**: Authentication API routes
- **Schemas**: Validation schemas for auth forms
- **Constants**: Authentication-related constants

#### Workspaces (`src/features/workspaces/`)

- **Components**: Workspace creation, listing, and management UI
- **Server**: Workspace API routes
- **Types**: Workspace data models
- **Schemas**: Validation schemas for workspace forms
- **API**: Client-side API hooks for workspaces
- **Hooks**: Custom hooks for workspace functionality

#### Projects (`src/features/projects/`)

- **Components**: Project creation, listing, and management UI
- **Server**: Project API routes
- **Types**: Project data models
- **Schemas**: Validation schemas for project forms
- **API**: Client-side API hooks for projects
- **Hooks**: Custom hooks for project functionality

#### Tasks (`src/features/tasks/`)

- **Components**: Task creation, listing, and management UI
- **Server**: Task API routes
- **Types**: Task data models and enums
- **Schemas**: Validation schemas for task forms
- **API**: Client-side API hooks for tasks
- **Hooks**: Custom hooks for task functionality

#### Members (`src/features/members/`)

- **Components**: Member management UI
- **Server**: Member API routes
- **Types**: Member roles and data models
- **Utils**: Utility functions for member operations

### Components Breakdown

#### UI Components (`src/components/ui/`)

Basic UI components built with Tailwind CSS and Radix UI:

- **Button**: Button component with variants
- **Card**: Card container component
- **Dialog**: Modal dialog component
- **Dropdown**: Dropdown menu component
- **Form**: Form components with validation
- **Input**: Text input component
- **Select**: Select dropdown component
- **Tabs**: Tabbed interface component
- **Avatar**: User avatar component
- **Badge**: Status badge component
- **Calendar**: Date picker calendar
- **Checkbox**: Checkbox input component
- **And more...**

#### Higher-level Components (`src/components/`)

- **Navbar**: Application navigation bar
- **Sidebar**: Application sidebar navigation
- **Projects**: Project listing component
- **Workspace-Switcher**: Component to switch between workspaces
- **Date-Picker**: Date selection component
- **Mobile-Sidebar**: Mobile-responsive sidebar
- **Query-Provider**: React Query provider setup

### API Routes

The application uses Hono.js for API routes:

- **/api/auth**: Authentication endpoints
- **/api/workspaces**: Workspace management
- **/api/projects**: Project management
- **/api/tasks**: Task management
- **/api/members**: Member management

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (see below)
4. Run the development server:
   ```bash
   npm run dev
   ```
   
For HTTPS development:
```bash
npx next dev --experimental-https
```

## Environment Variables

Create a `.env.local` file with the following variables:

```
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT=
NEXT_APPWRITE_KEY=
NEXT_PUBLIC_APPWRITE_DATABASE_ID=
NEXT_PUBLIC_APPWRITE_WORKSPACES_ID=
NEXT_PUBLIC_APPWRITE_PROJECTS_ID=
NEXT_PUBLIC_APPWRITE_MEMBERS_ID=
NEXT_PUBLIC_APPWRITE_TASKS_ID=
NEXT_PUBLIC_APPWRITE_IMAGES_BUCKET_ID=
```

## Contributing

1. Create a feature branch:
   ```bash
   git checkout -b feature-name
   ```
2. Make your changes
3. Commit your changes:
   ```bash
   git commit -m "Description of changes"
   ```
4. Push to the branch:
   ```bash
   git push origin feature-name
   ```
5. Create a pull request
## Test Summary

**Total Time:** 20.89 seconds  
**Authentication API Tests:** 9 total, 9 passed  
**Projects API Tests:** 8 total, 8 passed  
**Workspaces API Tests:** 8 total, 8 passed  
**Tasks API Tests:** 8 total, 8 passed  
**Members API Tests:** 3 total, 3 passed  

---

#### **Authentication API Tests**

##### **POST /register**
- **Duration:** 631 ms
   - ✅ Passed: Should fail to register with an existing email (**586 ms**)
   - ✅ Passed: Should fail to register with missing fields (**45 ms**)

##### **POST /login**
- **Duration:** 2.12 seconds
   - ✅ Passed: Should login successfully and set a session cookie (**1.57 s**)
   - ✅ Passed: Should fail to login with invalid credentials (**526 ms**)
   - ✅ Passed: Should fail to login with missing fields (**24 ms**)

##### **GET /current**
- **Duration:** 327 ms
   - ✅ Passed: Should retrieve the current user when authenticated (**290 ms**)
   - ✅ Passed: Should return 401 Unauthorized if not logged in (**37 ms**)

##### **POST /logout**
- **Duration:** 586 ms
   - ✅ Passed: Should logout the user and clear the session cookie (**555 ms**)
   - ✅ Passed: Should fail to logout if not logged in (**31 ms**)

---

#### **Projects API Tests**

##### **POST /projects**
- **Duration:** 1.28 seconds
   - ✅ Passed: Should create a new project successfully (**959 ms**)
   - ✅ Passed: Should fail to create a project without `workspaceId` (**298 ms**)
   - ✅ Passed: Should fail to create a project with invalid permissions (**26 ms**)

##### **GET /projects**
- **Duration:** 1.26 seconds
   - ✅ Passed: Should fetch all projects for a workspace successfully (**960 ms**)
   - ✅ Passed: Should fail to fetch projects without `workspaceId` (**284 ms**)
   - ✅ Passed: Should fail to fetch projects with invalid permissions (**20 ms**)

##### **PATCH /projects/:projectId**
- **Duration:** 1.17 seconds
   - ✅ Passed: Should update a project successfully (**1.14 s**)
   - ✅ Passed: Should fail to update a project with invalid permissions (**29 ms**)

---

#### **Workspaces API Tests**

##### **GET /workspaces**
- **Duration:** 615 ms
   - ✅ Passed: Should return an empty list if no workspaces exist (**615 ms**)

##### **POST /workspaces**
- **Duration:** 909 ms
   - ✅ Passed: Should create a new workspace successfully (**870 ms**)
   - ✅ Passed: Should fail to create a workspace with missing name (**39 ms**)

##### **PATCH /workspaces/:workspaceId**
- **Duration:** 910 ms
   - ✅ Passed: Should update workspace details successfully (**872 ms**)
   - ✅ Passed: Should fail to update workspace details without admin role (**38 ms**)

##### **POST /workspaces/:workspaceId/reset-invite-code**
- **Duration:** 953 ms
   - ✅ Passed: Should reset the invite code successfully (**916 ms**)
   - ✅ Passed: Should fail to reset invite code without admin role (**37 ms**)

##### **POST /workspaces/:workspaceId/join**
- **Duration:** 545 ms
   - ✅ Passed: Should fail to join a workspace if already a member (**545 ms**)

---

#### **Tasks API Tests**

##### **POST /tasks**
- **Duration:** 2 sec 479 ms
   - ✅ Passed: Should create a new task with status TODO successfully (**1 sec 65 ms**)
   - ✅ Passed: Should create a new task successfully with status IN_PROGRESS (**1 sec 102 ms**)
   - ✅ Passed: Should return 400 when required fields are missing (**294 ms**)
   - ✅ Passed: Should return 401 when no session cookie is provided (**18 ms**)

##### **GET /tasks**
- **Duration:** 4 sec 27 ms
   - ✅ Passed: Should fetch tasks successfully with valid workspaceId (**1 sec 277 ms**)
   - ✅ Passed: Should filter tasks by status (**1 sec 274 ms**)
   - ✅ Passed: Should return an error if workspaceId is missing (**240 ms**)
   - ✅ Passed: Should return tasks sorted by creation date descending (**1 sec 236 ms**)

---

#### **Members API Tests**

##### **GET /members**
- **Duration:** 3 sec 76 ms
   - ✅ Passed: Should fetch members successfully with valid workspaceId (**1 sec 20 ms**)
   - ✅ Passed: Should return 401 Unauthorized if user is not a member of the workspace (**1 sec 776 ms**)
   - ✅ Passed: Should return 400 Bad Request if workspaceId is missing (**280 ms**)






## License

[MIT License](LICENSE)
