const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Finance Dashboard API",
    version: "1.0.0",
    description:
      "Authentication, financial records CRUD, and dashboard aggregations.",
  },
  servers: [{ url: "http://localhost:3000" }],
  tags: [
    { name: "Auth" },
    { name: "Records" },
    { name: "Dashboard" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          error: {
            type: "object",
            properties: {
              message: { type: "string", example: "Invalid credentials" },
              code: { type: "string", example: "INVALID_CREDENTIALS" },
            },
          },
        },
      },
      AuthTokenResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          refreshToken: { type: "string" },
        },
        example: {
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Samiksha" },
          email: { type: "string", example: "samiksha@example.com" },
          password: { type: "string", example: "password123" },
          role: { type: "string", enum: ["viewer", "analyst", "admin"], example: "viewer" },
          status: { type: "string", enum: ["active", "inactive"], example: "active" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "samiksha@example.com" },
          password: { type: "string", example: "password123" },
        },
      },
      RefreshRequest: {
        type: "object",
        required: ["refreshToken"],
        properties: {
          refreshToken: { type: "string" },
        },
      },
      LogoutRequest: {
        type: "object",
        properties: {
          refreshToken: { type: "string" },
        },
      },
      LogoutResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
        },
      },
      FinancialRecord: {
        type: "object",
        properties: {
          _id: { type: "string" },
          user: { type: "string" },
          amount: { type: "number" },
          type: { type: "string", enum: ["income", "expense"] },
          category: { type: "string" },
          date: { type: "string", format: "date-time" },
          note: { type: "string" },
          isDeleted: { type: "boolean" },
          createdAt: { type: "string" },
          updatedAt: { type: "string" },
        },
        example: {
          _id: "663f1a2b3c4d5e6f708192a3",
          user: "663e0a1b2c3d4e5f60718293",
          amount: 2500,
          type: "expense",
          category: "Food",
          date: "2026-04-01T00:00:00.000Z",
          note: "Dinner",
          isDeleted: false,
          createdAt: "2026-04-02T10:00:00.000Z",
          updatedAt: "2026-04-02T10:00:00.000Z",
        },
      },
      RecordsListResponse: {
        type: "object",
        properties: {
          records: {
            type: "array",
            items: { $ref: "#/components/schemas/FinancialRecord" },
          },
          pagination: {
            type: "object",
            properties: {
              page: { type: "integer" },
              limit: { type: "integer" },
              total: { type: "integer" },
              totalPages: { type: "integer" },
            },
          },
        },
        example: {
          records: [
            {
              _id: "663f1a2b3c4d5e6f708192a3",
              user: "663e0a1b2c3d4e5f60718293",
              amount: 2500,
              type: "expense",
              category: "Food",
              date: "2026-04-01T00:00:00.000Z",
              note: "Dinner",
              isDeleted: false,
              createdAt: "2026-04-02T10:00:00.000Z",
              updatedAt: "2026-04-02T10:00:00.000Z",
            },
          ],
          pagination: { page: 1, limit: 10, total: 42, totalPages: 5 },
        },
      },
      SummaryResponse: {
        type: "object",
        properties: {
          totalIncome: { type: "number" },
          totalExpenses: { type: "number" },
          netBalance: { type: "number" },
        },
        example: { totalIncome: 10000, totalExpenses: 4200, netBalance: 5800 },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
              example: {
                name: "Samiksha",
                email: "samiksha@example.com",
                password: "password123",
                role: "viewer",
                status: "active",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "User created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthTokenResponse" },
                example: {
                  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
          "409": {
            description: "Duplicate email",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
          "429": {
            description: "Rate limit exceeded",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and get access/refresh tokens",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
              example: { email: "samiksha@example.com", password: "password123" },
            },
          },
        },
        responses: {
          "200": {
            description: "Login successful",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthTokenResponse",
                },
                example: {
                  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
          "401": {
            description: "Invalid credentials",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
          "429": {
            description: "Rate limit exceeded",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token using refresh token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RefreshRequest" },
              example: { refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            },
          },
        },
        responses: {
          "200": {
            description: "Token refreshed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthTokenResponse" },
                example: {
                  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
          "401": {
            description: "Invalid/expired refresh token",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout (blacklist current access token and optionally revoke refresh token)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LogoutRequest" },
              example: { refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
            },
          },
        },
        responses: {
          "200": {
            description: "Logged out",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/LogoutResponse" }, example: { success: true } },
            },
          },
          "401": {
            description: "Invalid access token",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
    },

    "/records": {
      get: {
        tags: ["Records"],
        summary: "List financial records (with filtering + pagination)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", required: false, schema: { type: "integer", example: 1 } },
          { name: "limit", in: "query", required: false, schema: { type: "integer", example: 10 } },
          { name: "date", in: "query", required: false, schema: { type: "string", example: "2026-04-01" } },
          { name: "type", in: "query", required: false, schema: { type: "string", enum: ["income", "expense"] } },
          { name: "category", in: "query", required: false, schema: { type: "string", example: "Salary" } },
          { name: "search", in: "query", required: false, schema: { type: "string", example: "rent" } },
        ],
        responses: {
          "200": {
            description: "Records fetched",
            content: { "application/json": { schema: { $ref: "#/components/schemas/RecordsListResponse" }, example: { records: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } } } },
          },
          "400": {
            description: "Validation error",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
          "401": {
            description: "Unauthorized",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
          "403": {
            description: "Forbidden (viewer is read-only)",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
          },
        },
      },
      post: {
        tags: ["Records"],
        summary: "Create a financial record (Analyst/Admin only)",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["amount", "type", "category", "date"],
                properties: {
                  amount: { type: "number", example: 2500 },
                  type: { type: "string", enum: ["income", "expense"], example: "expense" },
                  category: { type: "string", example: "Food" },
                  date: { type: "string", example: "2026-04-01" },
                  note: { type: "string", example: "Dinner" },
                },
              },
              example: {
                amount: 2500,
                type: "expense",
                category: "Food",
                date: "2026-04-01",
                note: "Dinner",
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Record created",
            content: { "application/json": { schema: { $ref: "#/components/schemas/FinancialRecord" }, example: { _id: "663f1a2b3c4d5e6f708192a3", user: "663e0a1b2c3d4e5f60718293", amount: 2500, type: "expense", category: "Food", date: "2026-04-01T00:00:00.000Z", note: "Dinner", isDeleted: false, createdAt: "2026-04-02T10:00:00.000Z", updatedAt: "2026-04-02T10:00:00.000Z" } } },
          },
          "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/records/{id}": {
      put: {
        tags: ["Records"],
        summary: "Update a financial record (Analyst/Admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, example: "663f1a..." },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  amount: { type: "number", example: 1234 },
                  type: { type: "string", enum: ["income", "expense"], example: "income" },
                  category: { type: "string", example: "Salary" },
                  date: { type: "string", example: "2026-04-03" },
                  note: { type: "string", example: "Updated note" },
                },
              },
              example: { amount: 3000, note: "Updated" },
            },
          },
        },
        responses: {
          "200": {
            description: "Record updated",
            content: { "application/json": { schema: { $ref: "#/components/schemas/FinancialRecord" }, example: { _id: "663f1a2b3c4d5e6f708192a3", user: "663e0a1b2c3d4e5f60718293", amount: 3000, type: "expense", category: "Food", date: "2026-04-03T00:00:00.000Z", note: "Updated", isDeleted: false, createdAt: "2026-04-02T10:00:00.000Z", updatedAt: "2026-04-02T12:00:00.000Z" } } },
          },
          "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Record not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      delete: {
        tags: ["Records"],
        summary: "Soft delete a financial record (Admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: { type: "string" }, example: "663f1a..." },
        ],
        responses: {
          "200": {
            description: "Record soft deleted",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean", example: true } },
                },
                example: { success: true },
              },
            },
          },
          "400": { description: "Validation error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "404": { description: "Record not found", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },

    "/dashboard/summary": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard summary",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Summary fetched",
            content: { "application/json": { schema: { $ref: "#/components/schemas/SummaryResponse" }, example: { totalIncome: 10000, totalExpenses: 4200, netBalance: 5800 } } },
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/dashboard/category-breakdown": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard category breakdown",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Category breakdown fetched",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      category: { type: "string" },
                      incomeTotal: { type: "number" },
                      expenseTotal: { type: "number" },
                      netBalance: { type: "number" },
                    },
                  },
                },
                example: [
                  { category: "Food", incomeTotal: 0, expenseTotal: 3200, netBalance: -3200 },
                  { category: "Salary", incomeTotal: 10000, expenseTotal: 0, netBalance: 10000 },
                ],
              },
            },
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/dashboard/monthly-trends": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard monthly trends",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Monthly trends fetched",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      month: { type: "string", example: "2026-04" },
                      incomeTotal: { type: "number" },
                      expenseTotal: { type: "number" },
                      netBalance: { type: "number" },
                    },
                  },
                },
                example: [
                  { month: "2026-03", incomeTotal: 8000, expenseTotal: 3500, netBalance: 4500 },
                  { month: "2026-04", incomeTotal: 10000, expenseTotal: 4200, netBalance: 5800 },
                ],
              },
            },
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "403": { description: "Forbidden", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
  },
};

module.exports = { swaggerSpec };

