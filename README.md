# Jobify – Student Job Matching & Assessment Platform

Jobify is a full-stack web application that connects students with job and internship opportunities through **skill-based matching, application tracking, location visualization, and integrated technical assessments**.

The platform goes beyond traditional job boards by combining **intelligent matching, recruiter workflows, and built-in coding evaluations** inside a single system.

---

# Features

## Skill-Based Matching

* Match percentage calculation
* Skills comparison breakdown
* Transparent reasoning behind matches

## Application Management

* Application status tracking
* Saved jobs functionality
* Centralized student dashboard

## Location Visualization

* Google Maps API integration
* Interactive job location display
* Map-based opportunity browsing

## Technical Assessments

* Dedicated assessment page
* Browser-based code editor
* Judge0 API integration for remote code execution
* Real-time execution results
* Timer-based assessment control

## Assessment Integrity

* Copy and paste disabled during assessments
* Tab-switch detection and flagging
* Controlled submission flow

---

# Tech Stack

## Backend

* C#
* ASP.NET Core Web API
* Entity Framework Core
* SQL Server
* JWT Authentication
* Google & GitHub OAuth
* Judge0 API integration

## Frontend

* React
* Vite
* React Router
* CSS
* Google Maps API

## Tools

* Git & GitHub
* Visual Studio / VS Code
* Swagger
* Jira

---

# Testing

The project includes a comprehensive automated test suite to validate the backend logic of the platform.

The tests verify controllers, services, business rules, validation logic, authorization behavior, and database side effects.

---

# Testing Approach

The project mainly uses **unit tests** built with:

* xUnit
* Entity Framework Core InMemory Database

These tests focus on:

* controller behavior
* service logic
* input validation
* edge cases
* role/authorization scenarios
* database state changes after actions

The goal is to ensure that important backend flows behave correctly without needing to run the full application manually for every scenario.

In addition to unit tests, the project also includes **integration tests** that validate how multiple components of the system interact together, including API controllers, authentication, and the database.

---

# Unit Tests

## What Is Covered

### Controllers

Controller tests verify the behavior of the API endpoints and backend actions, including:

* opportunities
* applications
* interviews
* profile-related helper logic

Examples of tested scenarios include:

* returning the correct response for valid and invalid requests
* preventing invalid status transitions
* checking recruiter/student ownership
* handling missing records
* creating, updating, deleting, closing, and reopening entities
* assessment-related flows such as start, save, submit, and reset
* save/unsave flows
* withdraw flows
* file retrieval behavior

---

### Services

Service tests verify backend business logic such as:

* notification behavior
* recommendation scoring
* CV review logic
* OCR/profile helper logic
* matching logic
* assessment scoring logic

These tests cover both normal and edge cases such as:

* empty inputs
* malformed values
* duplicate skills
* invalid JSON
* case-insensitive matching
* profile strength comparisons
* notification filtering and unread counts

---

# Integration Tests

Integration tests verify how multiple components of the system interact together.

This includes:

* API controllers
* authentication and authorization
* database persistence
* service layer logic

These tests simulate real user workflows by sending **HTTP requests to the API** and validating the responses.

---

# Integration Test Infrastructure

The integration tests use:

* WebApplicationFactory
* ASP.NET Core TestServer
* Entity Framework Core InMemory database
* custom test authentication handler

This allows the API to be tested **as if it were running normally**, without needing to start the full application.

---

# Integration Test Coverage

The integration tests cover the core workflow of the Jobify platform.

---

## Opportunities

Tests validate:

* retrieving available opportunities
* retrieving opportunities by company
* applying to opportunities
* saving and unsaving opportunities
* recruiter closing and reopening opportunities
* recruiter listing their own opportunities

---

## Applications

Tests validate the hiring pipeline, including:

* retrieving student applications
* retrieving individual applications
* recruiter viewing applicants for an opportunity
* recruiter updating application status
* withdrawing applications

Assessment flows such as:

* starting an assessment
* saving answers
* submitting assessments
* resetting attempts

---

## Interviews

Tests verify the interview lifecycle:

* recruiter scheduling interviews
* recruiter retrieving interviews
* student retrieving their interviews
* updating interview information
* deleting interviews
* preventing unauthorized interview actions

---

## Notifications

Tests validate the notification system, including:

* retrieving active notifications
* retrieving archived notifications
* unread notification counts
* marking notifications as read
* archiving notifications
* unarchiving notifications

These tests ensure notifications behave correctly for the authenticated user.

---

# Tools and Frameworks Used in Testing

* xUnit
* Entity Framework Core InMemory
* Moq
* ASP.NET Core TestServer
* WebApplicationFactory

---

# Running the Tests

Run all tests with:

```bash
dotnet test
```

This command executes:

* unit tests
* integration tests

across all test projects in the solution.

