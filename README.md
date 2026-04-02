#  Finance Dashboard Backend

##  System Overview

This backend system is designed for a finance dashboard where users can manage financial records based on their roles.

It provides:

* Secure authentication using JWT (access + refresh tokens)
* Role-based access control (RBAC)
* Financial record management (CRUD operations)
* Advanced filtering, pagination, and search
* Dashboard analytics using aggregation queries

The system is built with a focus on clean architecture, scalability, and maintainability.

---

##  Features

###  Authentication & Authorization

* JWT-based authentication (access + refresh tokens)
* Secure user registration and login
* Token refresh and logout functionality

###  Role-Based Access Control

* Viewer → Read-only access
* Analyst → Create & update records
* Admin → Full access (including delete)

###  Financial Records Management

* Create, read, update, and soft delete financial records
* Filter by:

  * Date
  * Category
  * Type (income/expense)
* Advanced pagination and search support

###  Dashboard Analytics

* Total income
* Total expenses
* Net balance
* Category-wise breakdown
* Monthly trends

---

##  Additional Enhancements

* JWT Authentication (Access + Refresh Tokens)
  Secure authentication mechanism using tokens instead of sessions.

* Pagination
  Implemented in record listing APIs using `page` and `limit` query parameters.

* Search Support
  Allows searching records based on category or notes.

* Soft Delete
  Records are marked as deleted using `isDeleted` flag instead of being permanently removed.

* Rate Limiting
  Protects APIs from excessive requests using request throttling.

* API Documentation
  Complete Swagger documentation for all endpoints.

---

##  Tech Stack

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT (Authentication)
* Swagger (API Documentation)

---

##  Database Design

###  Users Collection

* name
* email (unique)
* password (hashed)
* role (viewer, analyst, admin)
* status (active/inactive)

###  Transactions Collection

* user (reference to User)
* amount
* type (income / expense)
* category
* date
* note
* isDeleted (soft delete flag)
* createdAt, updatedAt

---

##  Access Control Logic

The system enforces strict role-based permissions:

| Role    | Permissions                    |
| ------- | ------------------------------ |
| Viewer  | View records & dashboard only  |
| Analyst | View + Create + Update records |
| Admin   | Full access including delete   |

Access control is implemented using middleware that checks the user’s role before allowing access to endpoints.

---

##  Key Design Decisions

* Soft Delete
  Records are not permanently removed. Instead, an `isDeleted` flag is used to maintain data integrity.

* JWT Authentication
  Stateless authentication using access and refresh tokens for scalability.

* Rate Limiting
  Prevents API abuse by limiting repeated requests from clients.

* Aggregation Pipelines
  Used in dashboard APIs for efficient calculation of financial summaries and trends.

---

##  API Endpoints

###  Auth

* POST /auth/register
* POST /auth/login
* POST /auth/refresh
* POST /auth/logout

###  Records

* GET /records
* POST /records
* PUT /records/:id
* DELETE /records/:id

###  Dashboard

* GET /dashboard/summary
* GET /dashboard/category-breakdown
* GET /dashboard/monthly-trends

---

##  API Documentation

Swagger documentation available at:
http://localhost:3000/api-docs

---

##  Setup Instructions

```bash
git clone <your-repo-link>
cd finance-dashboard-backend
npm install
```

### Create `.env` file:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### Run the project:

```bash
npm run dev
```

---

##  Testing

APIs were tested using:

* Postman
* Swagger UI

---

##  Assumptions

* Analyst users cannot delete records
* Soft delete is used instead of permanent deletion
* Each user can access only their own records
* JWT is used instead of session-based authentication for simplicity

---

##  Future Improvements

* Unit and integration testing
* Role-based analytics customization
* Email notifications
* Frontend dashboard integration

---

##  Conclusion

This project demonstrates:

* Clean backend architecture
* Role-based access control
* Real-world financial data handling
* Scalable and maintainable API design

The implementation focuses on clarity, correctness, and practical backend engineering principles, aligning with real-world backend system requirements.
