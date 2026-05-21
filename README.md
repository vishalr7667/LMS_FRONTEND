# 🎬 TerraByte — LMS Frontend

> A modern Learning Management System frontend built with Next.js & Module CSS.

🔗 **Live Demo:** [lms-frontend-gamma-seven.vercel.app](https://lms-frontend-gamma-seven.vercel.app)

---

## 📌 About

TerraByte is a full-stack LMS platform where users can browse courses, 
purchase them, and track their learning progress. This repository contains 
the frontend application.

**Backend Repo:** [LMS_BACKEND](https://github.com/vishalr7667/LMS_BACKEND)

---

## ✨ Features

- 🎓 Course browsing with category filters
- 🔐 JWT-based authentication (Login / Register)
- 💳 Course purchase flow with payment integration
- 📊 Student progress tracking per module
- 🛡️ Role-based UI — Student vs Admin views
- 📱 Fully responsive design
- ⚡ Server-side rendering with Next.js SSR

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Module CSS |
| Language | JavaScript |
| Auth | JWT (via Backend API) |
| Deployment | Vercel |

---

## 📁 Project Structure
````
src/
├── app/              → Next.js App Router pages
├── components/       → Reusable UI components
├── lib/              → API calls & utilities
````

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/vishalr7667/LMS_FRONTEND.git

# Navigate to project
cd LMS_FRONTEND

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Add your NEXT_PUBLIC_API_URL=your_backend_url

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 👨‍💻 Author

**Vishal Kumar** — Full Stack Developer
- LinkedIn: [vishal-rajput-60502b384](https://linkedin.com/in/vishal-rajput-60502b384)
- GitHub: [@vishalr7667](https://github.com/vishalr7667)
- Portfolio: [portfolio-vishal-kumars-projects.vercel.app](https://portfolio-vishal-kumars-projects.vercel.app)