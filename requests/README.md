# API Request Examples

This directory contains `.http` files with example HTTP requests for testing the Password Manager API.

## What are .http files?

`.http` files are plain text files that contain HTTP requests. They provide a simple, version-controlled way to document and test API endpoints without needing external tools like Postman.

## How to Use

### Option 1: VS Code (Recommended)

1. Install the **REST Client** extension by Huachao Mao
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
   - Search for "REST Client"
   - Install the extension by Huachao Mao

2. Open any `.http` file in this directory

3. Click "Send Request" above any request, or:
   - **Windows/Linux**: `Ctrl+Alt+R`
   - **Mac**: `Cmd+Alt+R`

4. View the response in a split pane

### Option 2: JetBrains IDEs (IntelliJ, WebStorm, etc.)

JetBrains IDEs have built-in support for `.http` files:

1. Open any `.http` file
2. Click the green play button (¶) next to any request
3. View the response in the Run tool window

### Option 3: Command Line with curl

Each `.http` file documents the equivalent `curl` commands in comments.

## Available Files

### `health.http`
Health check and server status endpoints.

**Use this to:**
- Verify the server is running
- Check server health
- Test basic connectivity

**Quick test:**
```http
GET http://localhost:3000/health
```

### `auth.http`
Authentication endpoints (login and logout).

**Use this to:**
- Test user login
- Test user logout
- Test authentication error cases
- Learn the authentication flow

**Endpoints:**
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout

## Getting Started

### 1. Start the Server

Make sure the development server is running:

```bash
npm run dev
```

You should see:
```
=€ Password Manager API Server
Server running on port 3000
```

### 2. Test Health Check

Open `health.http` and send the health check request:

```http
GET http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-31T22:24:36.984Z",
  "environment": "development"
}
```

### 3. Test Authentication

**Note:** Since user registration is not yet implemented, you'll need to create test users manually or wait for the registration endpoint.

Once you have a test user, open `auth.http` and:

1. Update the variables at the top:
   ```http
   @testEmail = your-test@example.com
   @testPassword = YourPassword123!
   ```

2. Send the login request:
   ```http
   POST http://localhost:3000/auth/login
   ```

3. Copy the `accessToken` from the response

4. Update the `@accessToken` variable

5. Send the logout request

## Variables

`.http` files support variables for reusability:

```http
@baseUrl = http://localhost:3000
@testEmail = test@example.com

POST {{baseUrl}}/auth/login
```

### Global Variables

You can create environment-specific variables:

1. VS Code: Create `http-client.env.json` in this directory
2. IntelliJ: Use the HTTP Client environment settings

Example `http-client.env.json`:
```json
{
  "development": {
    "baseUrl": "http://localhost:3000",
    "testEmail": "dev@example.com"
  },
  "production": {
    "baseUrl": "https://api.yourapp.com",
    "testEmail": "prod@example.com"
  }
}
```

## Response Handling

### VS Code REST Client

- Responses appear in a split pane
- Click links in the response to navigate
- Save responses to files
- View response headers and body

### IntelliJ HTTP Client

- Responses appear in the Run tool window
- View formatted JSON responses
- Access response history
- Export responses

## Tips and Best Practices

### 1. Organize by Feature

Keep related endpoints in the same file:
- `auth.http` - All authentication endpoints
- `passwords.http` - Password management endpoints (future)
- `users.http` - User management endpoints (future)

### 2. Use Comments

Document expected responses and use cases:
```http
### Login with valid credentials
# Expected: 200 OK with tokens
POST {{baseUrl}}/auth/login
```

### 3. Test Error Cases

Include examples of error scenarios:
```http
### Login - Invalid credentials
# Expected: 401 Unauthorized
POST {{baseUrl}}/auth/login
```

### 4. Use Named Requests

Name your requests for better organization:
```http
# @name login
POST {{baseUrl}}/auth/login
```

### 5. Chain Requests

Use variables to chain requests together:
```http
# @name login
POST {{baseUrl}}/auth/login

###
# Use the response from login
@token = {{login.response.body.accessToken}}

POST {{baseUrl}}/auth/logout
Authorization: Bearer {{token}}
```

## Common Response Codes

| Code | Meaning | When It Happens |
|------|---------|-----------------|
| 200 | OK | Successful request |
| 201 | Created | Resource created successfully |
| 204 | No Content | Successful request, no response body |
| 400 | Bad Request | Invalid request format or missing fields |
| 401 | Unauthorized | Invalid credentials or missing auth |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Endpoint or resource doesn't exist |
| 423 | Locked | Account locked (e.g., too many failed attempts) |
| 500 | Internal Server Error | Server error |

## Troubleshooting

### Server Not Running

**Error:** `Failed to connect to localhost:3000`

**Solution:** Start the server with `npm run dev`

### Invalid Token

**Error:** `401 Unauthorized`

**Solution:**
1. Login again to get a fresh token
2. Update the `@accessToken` variable
3. Make sure you're copying the full token

### CORS Issues

**Error:** CORS policy error in browser

**Solution:**
- `.http` files bypass CORS restrictions
- If testing from a browser, ensure CORS is configured in `.env`

### Expired Token

**Error:** `401 Unauthorized - Token expired`

**Solution:**
- Access tokens expire after 15 minutes
- Login again to get a new token
- Use refresh token to get new access token (when implemented)

## Adding New Endpoints

When you add new endpoints to the API:

1. Create a new `.http` file or add to an existing one
2. Document the endpoint with comments
3. Include example requests for success and error cases
4. Update this README with the new file information

Example structure:
```http
###
# Endpoint Name
# Description of what this endpoint does
###

### Success case
# @name endpointSuccess
POST {{baseUrl}}/endpoint
Content-Type: application/json

{
  "field": "value"
}

###
# Expected Response (200 OK):
# { "success": true }
###

### Error case
# @name endpointError
POST {{baseUrl}}/endpoint
Content-Type: application/json

{}

###
# Expected Response (400 Bad Request):
# { "error": "Missing required field" }
###
```

## Resources

### REST Client Extension (VS Code)
- [Extension Page](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
- [Documentation](https://github.com/Huachao/vscode-restclient)

### IntelliJ HTTP Client
- [Documentation](https://www.jetbrains.com/help/idea/http-client-in-product-code-editor.html)

### Alternative Tools
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [HTTPie](https://httpie.io/)
- [curl](https://curl.se/)

## Contributing

When adding new API endpoints, please:

1. Add corresponding `.http` file examples
2. Include success and error cases
3. Document expected responses
4. Update this README
5. Use consistent formatting and naming conventions
