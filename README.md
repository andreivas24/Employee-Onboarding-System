# Employee Onboarding System

A full-stack Employee Onboarding Management platform built with Spring Boot, React, PostgreSQL and JWT Authentication.

The application automates the employee onboarding workflow between HR, Manager, Finance and IT departments, providing request tracking, approvals, notifications, comments, profile management and reporting capabilities.

---

## Features

### Authentication & Security

- User Registration
- Login
- JWT Authentication
- Forgot Password via Email
- Reset Password via Secure Token
- Role-based Access Control

### User Roles

- ADMIN
- HR
- MANAGER
- FINANCE
- IT
- VIEWER

### Employee Onboarding Workflow

- Create onboarding requests
- Multi-step approval process
- Manager approval
- Finance approval
- IT provisioning
- Request rejection and resubmission
- Complete onboarding history

### Notifications

- Real-time role-based notifications
- Unread notification counter
- Mark notification as read
- Mark all notifications as read

### Profile Management

- Update profile information
- Upload profile image
- Persistent profile picture
- User profile page

### Collaboration

- Jira-style comments per onboarding request
- Comment history

### Reporting

- Dashboard statistics
- Excel export

---

## Tech Stack

### Backend

- Java 21
- Spring Boot
- Spring Security
- JWT
- Hibernate / JPA
- PostgreSQL
- Maven
- Mailtrap

### Frontend

- React
- TypeScript
- Axios
- CSS

---

## Screenshots

### Login

![Login](screenshots/login.png)

---

### Dashboard

![Dashboard](screenshots/dashboard.png)

---

### Create Request

![Create Request](screenshots/create-request.png)

---

### Notifications

![Notifications](screenshots/notifications.png)

---

### Profile Page

![Profile](screenshots/profile.png)

---

### Admin Panel

![Admin Panel](screenshots/admin-panel.png)

---

### Forgot Password

![Forgot Password](screenshots/forgot-password.png)

---

### Comments

![Comments](screenshots/comments.png)

---

## Database

Main entities:

- User
- OnboardingRequest
- OnboardingHistory
- Notification
- OnboardingComment
- PasswordResetToken

---

## Workflow

HR
↓
Manager Approval
↓
Finance Approval
↓
IT Provisioning
↓
Completed

Rejected requests can be resubmitted and reviewed again.

---

## Installation

### Backend

```bash
git clone <repository>
cd backend

mvn clean install
mvn spring-boot:run
```

### Frontend

```bash
cd frontend

npm install
npm run dev
```

---

## Environment Variables

```properties
JWT_SECRET=your-secret-key

MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_USERNAME=your-username
MAIL_PASSWORD=your-password
```

---

## Author

Andrei Vasilache

GitHub:
https://github.com/andreivas24
