# CREOLE — Center for Research in Ethnoscience, Orality, Language & Education

Traditional Knowledge Digital Library (TKDL-style) platform for documenting and protecting Haitian traditional knowledge and cultural expressions.

---

## 🎉 **NEW: Version 2.0 - Comprehensive Platform Enhancements**

**The platform has been massively upgraded with 10 major feature categories!**

📖 **[View Complete Enhancement Documentation →](ENHANCEMENTS.md)**
📋 **[See All New Files & Features →](NEW_FILES_SUMMARY.md)**

### Highlights of New Features:
- 🔍 **Advanced Search**: Full-text search, faceted filtering, relevance ranking
- 📊 **Analytics Dashboard**: Comprehensive tracking and visualizations
- 🔒 **2FA & GDPR**: Enhanced security and compliance
- 🌍 **Internationalization**: Haitian Creole, French, English support
- 🎨 **Dark Mode**: Theme support with system preference detection
- 🗺️ **Interactive Maps**: Geographic visualization with Leaflet
- 📈 **GraphQL API**: Complete API with Swagger documentation
- 🤝 **Collaboration**: Multi-user editing and review workflow
- 🎬 **Rich Media**: Video/audio transcription, OCR, rich text editor
- ⚡ **Redis Cache**: Performance optimization with background jobs

**Total Addition**: 49 files changed | 4,261+ lines of code added | 13 new database entities

---

## 🏗️ Architecture

- **Backend**: NestJS + TypeORM + PostgreSQL + GraphQL + Swagger
- **Frontend**: Next.js 14 (App Router) with SSR + i18n + Dark Mode
- **Auth**: Keycloak OIDC with PKCE flow + 2FA
- **Storage**: MinIO for media files
- **Cache**: Redis for performance optimization
- **Jobs**: Bull queue for background processing
- **NLP**: FastAPI service for text/image redaction + OCR + transcription
- **Containerization**: Docker Compose orchestration

## 🚀 Quick Start

1. **Setup environment**:
```bash
cp .env.example .env
```

2. **Start all services**:
```bash
docker compose up --build
```

3. **Seed initial data** (after services are healthy):
```bash
docker compose exec backend npm run seed
```

## 🌐 Service URLs

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000/health
- **Keycloak**: http://localhost:8080 (admin/admin)
- **MinIO Console**: http://localhost:9001
- **NLP Service**: http://localhost:8000/health

## 👥 Demo Users

- **Admin**: `admin@creole` / `adminpass` (role: admin)
- **Examiner**: `examiner@creole` / `examinerpass` (role: examiner)
- **User**: `user@creole` / `userpass` (role: community_user)

## ✨ Key Features

### Authentication & Authorization
- OIDC PKCE flow with Keycloak
- Role-based access control (admin, examiner, community_user)
- HTTP-only session cookies for security

### Traditional Knowledge Management
- Records with multilingual support (Haitian Creole, French, English)
- Classification system (C-FOOD, C-MED, C-RIT, C-MUS, C-CRAFT, C-AGRI, C-ORAL, C-EDU)
- TK/BC Labels for culturally appropriate access control
- Access tiers: public, restricted, secret

### Access Control
- Access requests for restricted/secret records
- Admin approval workflow with notifications
- Audit trail with hash-chaining for tamper evidence

### Media & Redaction
- SHA-256 hashing for all uploads
- Automatic text redaction (PII, sacred terms)
- Image redaction with region-based blurring
- MinIO storage with presigned URLs

### Benefit Sharing
- Contract management for communities
- Payout tracking and administration
- Terms negotiation support

### Notifications & Monitoring
- Email notifications (SMTP)
- Webhook integrations
- Audit log with optional external anchoring

## 📝 Usage Guide

### 1. Sign In
Click "Sign in" in the toolbar → authenticate with Keycloak using demo credentials

### 2. Submit Traditional Knowledge
- Navigate to "Intake" to submit new records
- Choose appropriate classification and access tier
- Add TK Labels for usage restrictions

### 3. Request Access (for restricted content)
- Find a restricted/secret record
- Submit access request with justification
- Admin reviews and approves/denies

### 4. Admin Functions
- **Access Requests**: Review pending requests at `/dashboard/requests`
- **Contracts**: Manage benefit-sharing at `/admin/contracts`
- **Media**: Uploaded text files are auto-redacted

### 5. Media Upload & Redaction
- Upload files via API or forms
- Text files: automatically redacted (emails, phones, sacred terms)
- Images: manual redaction via region selection

## 🔐 Security Features

- **Hash-chained audit log**: Tamper-evident record of all actions
- **External anchoring**: Optional integration with immudb/notary services
- **SHA-256 verification**: All media files are hashed
- **Redaction pipeline**: Automatic PII and sacred content protection

## 🧪 Testing

Run Playwright E2E tests:
```bash
docker compose exec frontend npm run test:e2e
```

## 🔧 Configuration

### Audit Anchoring
Set `ANCHOR_URL` in `.env` to point to an external notary service (e.g., immudb) for additional tamper protection.

### SMTP Email
Configure SMTP settings in `.env` for email notifications. Falls back to console logging if not configured.

### Webhook Notifications
Set `WEBHOOK_URL` to receive JSON payloads for system events.

## 📦 Development Notes

- TypeORM uses `synchronize: true` in dev mode (disable for production)
- Keycloak realm is auto-imported from `keycloak/realm-export/creole-realm.json`
- MinIO bucket is auto-created on first startup
- NLP service includes demo redaction rules (extend as needed)

## 🌍 Roadmap

- [ ] Production migrations system
- [ ] Enhanced IPC patent classification mapping
- [ ] Multi-language NLP models
- [ ] Blockchain anchoring integration
- [ ] Community governance dashboard
- [ ] Mobile application

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For questions and support, please open an issue in the GitHub repository.