# CREOLE - Center for Research in Ethnoscience, Orality, Language & Education

A TKDL-style platform to document and protect Haitian traditional knowledge with comprehensive access controls, benefit-sharing, and audit capabilities.

## Services & Ports

- **Frontend (Next.js 14)**: http://localhost:3000
- **Backend API (NestJS)**: http://localhost:4000
- **Keycloak**: http://localhost:8080 (Admin: admin/admin)
- **MinIO Console**: http://localhost:9001 (Access: creoleminio/creoleminio123)
- **MinIO API**: http://localhost:9000
- **NLP Service**: http://localhost:8000
- **PostgreSQL**: localhost:5432

## Quick Start

```bash
# 1. Copy environment configuration
cp .env.example .env

# 2. Start all services
docker compose up --build

# 3. Wait for services to be healthy (check docker compose ps)

# 4. Seed the database with initial data
docker compose exec backend npm run seed
```

## Demo Users

Login at http://localhost:3000:

- **Admin**: admin@creole / adminpass (role: admin)
- **Examiner**: examiner@creole / examinerpass (role: examiner)
- **Community User**: user@creole / userpass (role: community_user)

## Using the Application

### Basic Workflow

1. **Sign In**: Click "Sign in" in the toolbar → authenticate via Keycloak
2. **Browse Records**: Search and view traditional knowledge records from the home page
3. **Submit New Records**: Use the Intake page to submit new records (requires authentication)
4. **Request Access**: For restricted/secret records, submit an access request
5. **Admin Functions**: 
   - Review access requests in Admin Inbox
   - Manage benefit-sharing contracts and payouts

### Key Features

- **OIDC Authentication**: Secure PKCE flow with Keycloak
- **Access Tiers**: Public, Restricted, and Secret record classifications
- **Media Management**: File uploads with automatic SHA-256 hashing
- **Text Redaction**: Automatic redaction of sensitive information in text files
- **Image Redaction**: Manual region-based blurring for images
- **Audit Trail**: Hash-chained audit log with optional external anchoring
- **Benefit Sharing**: Contract management and payout tracking

### API Endpoints

- Health Check: `GET http://localhost:4000/health`
- Records: `GET/POST http://localhost:4000/v1/records`
- Labels: `GET http://localhost:4000/v1/labels`
- Access Requests: `POST/GET/PATCH http://localhost:4000/v1/access-requests`
- Media: `POST/GET http://localhost:4000/v1/media`
- Contracts: `GET/POST http://localhost:4000/v1/benefit/contracts`

## Audit Anchoring

The system supports external audit anchoring via the `ANCHOR_URL` environment variable. 
To enable:

1. Set `ANCHOR_URL` to your immudb/notary HTTP endpoint
2. The system will POST audit hashes: `{hash: string, ts: number}`
3. If not configured, hashes are logged to `/tmp/creole-anchor.log`

## Development

### Running Tests

```bash
# Playwright E2E tests
docker compose exec frontend npm run test:e2e
```

### Accessing Services Directly

- PostgreSQL: `docker compose exec db psql -U creole -d creole`
- MinIO Shell: `docker compose exec minio sh`
- Backend Shell: `docker compose exec backend sh`

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│   Next.js   │────▶│   NestJS     │────▶│ PostgreSQL │
│   Frontend  │     │   Backend    │     └────────────┘
└─────────────┘     └──────────────┘            │
       │                    │                    │
       ▼                    ▼                    ▼
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  Keycloak   │     │    MinIO     │     │    NLP     │
│    OIDC     │     │   Storage    │     │  Service   │
└─────────────┘     └──────────────┘     └────────────┘
```

## License

Proprietary - All rights reserved