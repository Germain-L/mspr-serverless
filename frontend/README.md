# COFRAP Authentication Frontend

A modern SvelteKit frontend for the COFRAP authentication system with Tailwind CSS styling.

## Features

- **Modern Authentication Flow**: Progressive user experience with username checking
- **Two-Factor Authentication (2FA)**: TOTP-based 2FA setup and verification
- **User Registration**: Account creation with secure password generation
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **Security**: Client-side validation and secure API communication

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   └── ui/           # Reusable UI components
│   ├── stores/           # Svelte stores for state management
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions and API layer
├── routes/
│   ├── +layout.svelte    # Root layout with header/navigation
│   ├── +page.svelte      # Main login page
│   ├── register/         # User registration flow
│   ├── setup-2fa/        # 2FA setup and verification
│   └── dashboard/        # Post-authentication dashboard
└── app.html              # App shell
```

## Key Components

### UI Components
- **Button**: Reusable button with variants and loading states
- **Input**: Form input with validation and error states
- **Alert**: Notification component for success/error messages
- **QRCodeDisplay**: QR code display for passwords and 2FA

### Pages
- **Login (`/`)**: Username/password authentication with conditional 2FA
- **Register (`/register`)**: Account creation with password generation
- **Setup 2FA (`/setup-2fa`)**: TOTP setup and verification
- **Dashboard (`/dashboard`)**: User account overview and settings

## API Integration

The frontend integrates with the following OpenFaaS functions:

- `check-user-status`: Check if user exists and has 2FA enabled
- `generate-password`: Create new user account with secure password
- `generate-2fa`: Setup TOTP-based 2FA for user
- `authenticate-user`: Authenticate user with password and optional 2FA

## Development

### Prerequisites

- Node.js 18+ 
- npm or pnpm

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Run unit tests
npm run test:unit

# Run e2e tests
npm run test:e2e

# Run all tests
npm run test
```

### Linting and Formatting

```bash
# Check formatting and lint
npm run lint

# Format code
npm run format
```

## Configuration

### API Endpoint

The API base URL is configured in `src/lib/utils/api.ts`:

```typescript
const API_BASE = 'https://openfaas.germainleignel.com/function';
```

### Tailwind Colors

Custom COFRAP branding colors are defined in `tailwind.config.js`:

```javascript
colors: {
  'cofrap': {
    50: '#f0f9ff',
    // ... other shades
    700: '#0369a1',
  }
}
```

## User Experience Flow

### 1. Authentication Flow
1. User enters username
2. System checks if user exists and has 2FA
3. User enters password
4. If 2FA enabled, user enters TOTP code
5. User is authenticated and redirected to dashboard

### 2. Registration Flow
1. User enters desired username
2. System generates secure password and shows QR code
3. User can optionally setup 2FA
4. User is ready to login

### 3. 2FA Setup Flow
1. System generates TOTP secret and QR code
2. User scans QR with authenticator app
3. User enters verification code to confirm setup
4. 2FA is enabled for the account

## Security Features

- **Input Validation**: Client-side validation for usernames and TOTP codes
- **Error Handling**: Secure error messages that don't expose system details
- **HTTPS**: All API communications over HTTPS
- **No Persistent Storage**: No sensitive data stored in localStorage/sessionStorage
- **CSP Ready**: Compatible with Content Security Policy

## Accessibility

- ARIA labels for screen readers
- Keyboard navigation support
- High contrast mode compatibility
- Focus management for forms and modals
- Semantic HTML structure

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers with ES2020 support

## Deployment

The frontend can be deployed to any static hosting service or as a Node.js application:

### Static Deployment
```bash
npm run build
# Deploy the contents of the 'build' directory
```

### Node.js Deployment
```bash
npm run build
npm run preview
```

### Docker Deployment

Create a `Dockerfile` in the frontend directory:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["node", "build"]
```

## Contributing

1. Follow the existing code style and patterns
2. Add tests for new features
3. Update documentation for API changes
4. Use semantic commit messages

## License

[Add your license information here]
