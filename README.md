

# Jobify – Student Job Matching Platform

**Jobify** is a full-stack web application designed to help **students discover relevant job and internship opportunities** through **skill-based matching**.
The platform supports secure authentication, opportunity browsing, and an intelligent recommendation system.

---

## Tech Stack

### Backend

* **ASP.NET Core (C#)** – RESTful API
* **Entity Framework Core** – Database ORM
* **SQL Server** – Relational database
* **JWT Authentication** – Secure session handling
* **Google & GitHub OAuth** – Social login
* **Role-based authorization** – Student / Recruiter

### Frontend

* **React** – UI development
* **Vite** – Fast development & build tool
* **CSS** – Component-based styling
* **React Router** – Client-side routing

### Tools

* **Git & GitHub** – Version control
* **Visual Studio / VS Code** – Development
* **Swagger** – API testing
* **Figma** – UI/UX design

---

## Project Structure

Jobify/
├── Jobify/                      # Backend (ASP.NET Core)
│   ├── Controllers/
│   ├── Data/
│   ├── DTOs/
│   ├── Migrations/
│   ├── Models/
│   ├── Services/
│   │   ├── JwtService.cs
│   ├── Program.cs
│   └── Jobify.csproj
│
├── pages/                       # Frontend (React)
├── styles/                      # CSS
├── public/                      # Static assets
├── Jobify.sln
├── package.json
└── README.md

---

## Authentication & Login Flow

Jobify implements a **secure multi-option authentication system**:

### Student Login

* Email & password signup/login
* Google OAuth
* GitHub OAuth
* JWT token stored on successful login

### Recruiter Login

* Email & password signup
* Requires **admin approval** before accessing recruiter features

### Password Management

* Forgot password flow
* Token-based password reset via email

---

## User Roles

* **Student**

  * Create and update profile
  * Add skills, portfolio, and experience
  * Browse opportunities
  * Receive job recommendations

* **Recruiter**

  * Create and manage opportunities
  * Define required and mandatory skills
  * Review applicants

---

## Opportunity Pages

Recruiters can create **job or internship opportunities** with:

* Title & description
* Required skills
* Skill weights (importance)
* Mandatory skills

Students can:

* Browse all available opportunities
* View detailed opportunity pages
* Be matched automatically through the recommendation system

---

## Recommendation System

Jobify includes a **skill-based recommendation engine** that matches students to opportunities.

### How it works:

1. **Skill normalization**

   * Handles synonyms (e.g. `js` → `javascript`)
2. **Mandatory skill filtering**

   * Opportunities missing required skills are excluded
3. **Weighted skill matching**

   * Matches student skills with job skill importance
4. **Threshold filtering**

   * Only opportunities above a minimum match score are recommended
5. **Ranking**

   * Results are sorted by best match score

The system returns a **ranked list of recommended opportunities** for each student.

---

## Architecture Overview

* **Controllers** → Handle HTTP requests and responses
* **Services** → Business logic (auth, tokens, recommendations)
* **Models** → Database entities
* **EF Core Migrations** → Database versioning
* **Frontend Pages** → User interaction & flows

---

## Features Implemented

* Secure authentication (JWT + OAuth)
* Role-based access control
* Opportunity creation & browsing
* Skill-based job recommendation system
* Password reset functionality
* Clean frontend routing and UI


