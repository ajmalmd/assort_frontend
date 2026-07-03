# Assort Frontend

Frontend for **Assort**, a collaborative project management and team communication platform built with **React** and **Vite**.

---

## About Assort

- Work seamlessly across multiple organizations by switching workspaces.
- Manage projects, departments, tasks, and jobs from a unified dashboard.
- Collaborate with teammates using real-time chat and notifications.
- Secure authentication with invitation-based onboarding.

---

## Tech Stack

- React
- Vite
- React Router
- Redux Toolkit
- Axios
- Tailwind CSS
- WebSockets

---

## Features

- JWT Authentication
- Multi-Organization Workspace
- Organization Management
- Department Management
- Project Management
- Task & Job Management
- Team Chat
- Real-time Notifications
- Invitation Management
- Subscription Management
- Responsive User Interface
- Real-time Updates via WebSockets

---

## Project Structure

```text
src/
├── api/
├── assets/
├── components/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── services/
├── store/
├── styles/
└── utils/

public/

package.json
vite.config.js
```

---

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/ajmalmd/assort_frontend.git
cd assort_frontend
```

---

### 2. Install Dependencies

Using pnpm (recommended)

```bash
pnpm install
```

or using npm

```bash
npm install
```

or using yarn

```bash
yarn
```

---

### 3. Configure Environment Variables

Create a `.env` file in the project root.

Example:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_BASE_URL=ws://localhost:8000
```

---

### 4. Run Development Server

Using pnpm

```bash
pnpm dev
```

or npm

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:5173
```

---

## Building for Production

```bash
pnpm build
```

or

```bash
npm run build
```

---

## Preview Production Build

```bash
pnpm preview
```

or

```bash
npm run preview
```

---

## API Communication

The frontend communicates with the backend using **Axios**.

Authentication is handled using:

```text
Bearer JWT Token
```

---

## WebSocket Communication

The application uses WebSockets for real-time communication.

Available connections:

```text
ws://localhost:8000/ws/chat/

ws://localhost:8000/ws/notifications/
```

---

## Application Modules

The frontend consists of the following modules:

- Authentication
- Dashboard
- Organizations
- Departments
- Projects
- Invitations
- Chat
- Notifications
- Platform Administration
- Subscriptions

---

## Architecture

- Built with **React** and **Vite**.
- State management using **Redux Toolkit**.
- Routing handled by **React Router**.
- API communication through **Axios**.
- Styling implemented using **Tailwind CSS**.
- Real-time updates powered by **WebSockets**.
- Modular folder structure for scalable development.

---

## Available Scripts

### Install Dependencies

```bash
pnpm install
```

### Start Development Server

```bash
pnpm dev
```

### Build for Production

```bash
pnpm build
```

### Preview Production Build

```bash
pnpm preview
```

### Run Linter

```bash
pnpm lint
```

---

## Development Notes

- Configure the backend API URL using the `.env` file.
- Ensure the backend server is running before starting the frontend.
- WebSocket features require the backend ASGI server and Redis to be running.
- Follow the existing component and folder structure when adding new features.

---

## License

This project is intended for educational and portfolio purposes unless otherwise specified.