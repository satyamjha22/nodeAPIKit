# NodeAPIKit

A Node.js REST API backend built with Express and MongoDB, featuring user authentication, post management, and secure password workflows.

## Features

- **User Authentication**
  - Signup, Signin, Signout
  - Email verification with code
  - JWT-based authentication
  - Middleware for protected routes

- **Password Management**
  - Change password (requires verification)
  - Forgot password workflow with code verification

- **Post Management**
  - Create, read, update, and delete posts (CRUD)
  - Each post linked to a user

- **Security**
  - Helmet for HTTP headers
  - CORS support
  - Passwords hashed with bcrypt
  - Sensitive fields excluded by default in queries

## Tech Stack

- Node.js
- Express
- MongoDB & Mongoose
- JWT for authentication
- Nodemailer for email
- Joi for validation

## Getting Started

1. **Clone the repository**
   ```sh
   git clone https://github.com/satyamjha22/nodeAPIKit.git
   cd nodeAPIKit
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file with:
   ```
   PORT=8000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_CODE_SENDING_EMAIL_ADDRESS=your_email@gmail.com
   NODE_CODE_SENDING_EMAIL_PASSWORD=your_app_password
   HMAC_VERIFICATION_CODE_SECRET=your_hmac_secret
   ```

4. **Run the app**
   ```sh
   npm run dev
   ```

## API Endpoints

### Auth

- `POST /signup` — Register a new user
- `POST /signin` — Login and get JWT token
- `POST /signout` — Logout
- `PATCH /send-verification-code` — Send email verification code
- `PATCH /verify-verification-code` — Verify email code
- `PATCH /change-password` — Change password (JWT required)
- `PATCH /send-forgot-password-code` — Send forgot password code
- `PATCH /verify-forgot-password-code` — Reset password with code

### Posts

- `GET /all-posts` — Get all posts
- `GET /single-post` — Get a single post
- `POST /create-post` — Create a post (JWT required)
- `PUT /update-post` — Update a post (JWT required)
- `DELETE /delete-post` — Delete a post (JWT required)

## Contributing

Pull requests are welcome! For major changes, please open an issue first.

## License

MIT
