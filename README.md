# LocalGuide

LocalGuide is a full-stack marketplace that connects travelers with local guides. Travelers post trip requirements, guides submit offers, bookings are paid via Stripe, and both sides can manage trip status, reviews, and disputes.

## Tech Stack

- Backend: Go, Fiber, GORM, PostgreSQL, JWT, Stripe, Google OAuth, SMTP email
- Frontend: Next.js (App Router), React, Tailwind CSS + DaisyUI, Axios, Zustand, Stripe.js
- Tests: Go tests, Selenium + Pytest end-to-end tests

## Repository Structure

```
localguide-back/    Go API, migrations, seeds, uploads
localguide-front/   Next.js app
selenium-tests/     End-to-end tests
```

## Key Features

- Authentication: register, login, JWT, Google OAuth, password reset email
- Marketplace flow: trip requirements, guide offers, accept/reject, booking
- Payments: Stripe (card + PromptPay), webhook handling, refunds
- Trip status: arrival confirmation, completion, no-show reporting and disputes
- Reviews: create/update/delete, helpful marks, guide responses
- Admin: guide verification, dispute resolution, manual payment release
- Uploads: user avatars and evidence files

## Getting Started

### Prerequisites

- Go 1.24+ (see `go.mod` toolchain)
- Node.js 18+ (pnpm or npm)
- PostgreSQL
- Stripe test keys (required)
- Optional: SMTP and Google OAuth credentials

### Backend (Go)

```bash
cd localguide-back
go mod download
go run main.go
```

The backend runs on `http://localhost:8080` and auto-migrates + seeds data on startup.

### Frontend (Next.js)

```bash
cd localguide-front
pnpm install
pnpm dev
```

The frontend runs on `http://localhost:3000`.

## Environment Variables

### Backend (.env in localguide-back)

```bash
# Database
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=postgres
DB_PORT=5432

# Auth
JWT_SECRET=your_jwt_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email (password reset)
SMTP_HOST=smtp.example.com
SMTP_USER=your_user
SMTP_PASS=your_pass
SMTP_FROM=no-reply@example.com

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URL=http://localhost:8080/api/auth/google/callback

# Optional
PORT=8080
```

### Frontend (.env.local in localguide-front)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Seed Data (Local Dev)

On startup, the backend seeds roles, provinces, languages, attractions, and sample users.

Sample accounts:

- user1@gmail.com / 12345678Za!
- guide1@gmail.com / 12345678Za!
- guide2@gmail.com / 12345678Za!
- guide3@gmail.com / 12345678Za!
- admin@gmail.com / 12345678Za!

## Tests

### Go API tests

```bash
cd localguide-back
go test ./...
```

### Selenium end-to-end tests

```bash
cd selenium-tests
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pytest tests/ -v
```

`selenium-tests/commands.sh` contains helper commands for setup and common test runs.
