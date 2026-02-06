

# Jobify – Student Job Matching Platform

**Jobify** is a full-stack web application designed to help **students discover relevant job and internship opportunities** using **skill-based matching**.
The system provides secure authentication, opportunity management, and an intelligent recommendation engine.

---

## 🚀 Tech Stack

### Backend

* **ASP.NET Core (C#)** – RESTful API
* **Entity Framework Core** – ORM
* **SQL Server** – Database
* **JWT Authentication** – Secure access tokens
* **Google & GitHub OAuth** – Social login
* **DTOs (Data Transfer Objects)** – Clean API contracts

### Frontend

* **React** – UI development
* **Vite** – Development & build tool
* **Plain CSS** – Styling
* **React Router** – Client-side routing

### Tools

* **Git & GitHub** – Version control
* **Visual Studio / VS Code** – Development
* **Postman** – API testing
* **Figma** – UI/UX design

---

## 📁 Project Structure

```
Jobify/
├── Jobify/                      # Backend (ASP.NET Core)
│   ├── Controllers/
│   ├── Data/
│   ├── DTOs/
│   ├── Migrations/
│   ├── Models/
│   ├── Services/
│   │   ├── JwtService.cs
│   │   └── AuthService.cs
│   ├── Program.cs
│   └── Jobify.csproj
│
├── pages/                       # Frontend (React)
├── styles/                      # CSS
├── public/                      # Static assets
├── Jobify.sln
├── package.json
└── README.md
```

---

## 🔐 Authentication & Authorization

### Login & Signup

* Email and password authentication
* Google OAuth
* GitHub OAuth

### JWT Service

* Generates and validates JWT access tokens
* Embeds user ID and role in the token
* Used to protect secured API endpoints

### DTO Usage

* DTOs are used to:

  * Validate incoming requests
  * Prevent exposing database entities
  * Keep API responses clean and secure

---

## 👤 User Roles

* **Student**

  * Manage profile and skills
  * Browse opportunities
  * Receive personalized recommendations

* **Recruiter**

  * Create and manage job opportunities
  * Define required and mandatory skills
  * Review applicants
  * Requires admin approval

---

## 📄 Opportunity Management

Recruiters can:

* Create job and internship opportunities
* Define skill requirements and importance levels
* Add mandatory skills

Students can:

* Browse all opportunities
* View opportunity details
* Be matched automatically via recommendations

---

## 🤖 Recommendation System

Jobify includes a **skill-based recommendation engine** that:

1. Normalizes skill names
2. Filters out opportunities missing mandatory skills
3. Calculates weighted match scores
4. Applies a minimum match threshold
5. Returns ranked recommendations

---

## 🧠 Backend Architecture

* **Controllers** → API endpoints
* **Services** → Business logic (auth, JWT, recommendations)
* **DTOs** → Request/response models
* **Models** → Database entities
* **EF Core Migrations** → Schema management

---

## ✅ Implemented Features

* Secure JWT-based authentication
* OAuth login (Google & GitHub)
* Role-based authorization
* Opportunity creation & browsing
* Skill-based recommendation system
* Clean separation using DTOs

