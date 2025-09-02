# Goji Backend API

A Node.js Express server with MongoDB for passkey authentication.

## Features

- Passkey creation and verification
- User registration and authentication
- JWT token-based authentication
- MongoDB database integration
- HTTP request logging with Morgan
- TypeScript support

## Setup

1. Install dependencies:
```bash
bun install
```

2. Create environment file:
```bash
cp env.example .env
```

3. Update `.env` with your configuration:
```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/goji
JWT_SECRET=your-super-secret-jwt-key

# Email Configuration (Ethereal Email for testing)
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=maddison53@ethereal.email
EMAIL_PASS=jn7jnAPss4f63QBp6D
```

**Note**: This uses Ethereal Email for testing. Emails won't actually be delivered but you can view them at https://ethereal.email. For production, replace with real SMTP credentials.

4. Start MongoDB (make sure MongoDB is running locally or use MongoDB Atlas)

5. Run the server:
```bash
# Development mode with hot reload
bun run dev

# Production mode
bun run start
```

## API Endpoints

### Authentication
- `POST /api/auth/login/passkey` - Login with passkey
- `GET /api/auth/profile` - Get user profile (requires auth)

### Passkeys
- `POST /api/passkeys/create` - Create a new passkey
- `POST /api/passkeys/verify` - Verify a passkey
- `GET /api/passkeys/user/:email` - Get user's passkeys
- `DELETE /api/passkeys/:credentialId` - Deactivate a passkey

### Email Verification
- `POST /api/email/send-code` - Send verification code to email
- `POST /api/email/verify-code` - Verify email with code
- `POST /api/email/resend-code` - Resend verification code

### Health Check
- `GET /health` - Server health check

## Database Models

### User
- email (unique)
- name
- isEmailVerified
- hasPasskey
- lastLogin
- createdAt

### Passkey
- email
- credentialId (unique)
- deviceInfo
- isActive
- lastUsed
- createdAt

### VerificationCode
- email
- code (6-digit)
- createdAt
- expiresAt (10 minutes)
- isUsed

## Usage Examples

### Create a Passkey
```bash
curl -X POST http://localhost:4000/api/passkeys/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "credentialId": "unique-credential-id",
    "deviceInfo": {
      "platform": "ios"
    }
  }'
```

### Login with Passkey
```bash
curl -X POST http://localhost:4000/api/auth/login/passkey \
  -H "Content-Type: application/json" \
  -d '{
    "credentialId": "unique-credential-id"
  }'
```

### Send Email Verification Code
```