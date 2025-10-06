# Platform Enhancements - CREOLE TKDL v2.0

This document outlines the comprehensive enhancements made to the CREOLE Traditional Knowledge Digital Library platform.

## 📋 Table of Contents

1. [Advanced Search & Discovery](#1-advanced-search--discovery)
2. [Enhanced Data Management](#2-enhanced-data-management)
3. [Community Engagement](#3-community-engagement)
4. [Analytics & Reporting](#4-analytics--reporting)
5. [API Enhancements](#5-api-enhancements)
6. [Security & Compliance](#6-security--compliance)
7. [UX/UI Improvements](#7-uxui-improvements)
8. [Content Capabilities](#8-content-capabilities)
9. [Collaboration Features](#9-collaboration-features)
10. [Performance & Scalability](#10-performance--scalability)

---

## 1. Advanced Search & Discovery

### Full-Text Search
- **PostgreSQL FTS**: Integrated full-text search using PostgreSQL's `tsvector` and `tsquery`
- **Multi-language support**: Search across Haitian Creole, French, and English content
- **Relevance ranking**: Results ranked by `ts_rank` for better accuracy
- **Fuzzy matching**: ILIKE fallback for partial matches

### Faceted Search
- **Dynamic facets**: Auto-generated facets for:
  - Creole classification (C-FOOD, C-MED, etc.)
  - Access tiers (public, restricted, secret)
  - Communities
  - Regions
  - TK labels
- **Count aggregation**: Shows number of records per facet value
- **Multi-select filtering**: Combine multiple filters

### Advanced Filtering
- **Date range filtering**: Search by creation/update dates
- **Array filtering**: Filter by TK labels, regions, IPC codes using JSONB operators
- **Community filtering**: Find records from specific communities
- **Status filtering**: Filter by draft, published, archived status

### Pagination & Sorting
- **Configurable pagination**: Page size and offset support
- **Multiple sort options**:
  - Relevance (for search queries)
  - Date (newest/oldest)
  - Title (alphabetical)
- **Metadata in response**: Total count, page info, total pages

**Files**:
- `backend/src/records/dto/search-records.dto.ts` - Enhanced search DTO
- `backend/src/records/records.service.ts` - Search implementation
- `frontend/components/AdvancedSearch.tsx` - Search UI

---

## 2. Enhanced Data Management

### Versioning System
- **Automatic versioning**: Track all changes to records
- **Version snapshots**: Complete record state saved per version
- **Diff calculation**: Track what changed between versions
- **Version history**: View all versions of a record
- **Revert capability**: Roll back to previous versions
- **Audit trail**: Who made changes and when

### Bulk Operations
- **CSV Import**: Bulk import records from CSV files
- **JSON Import**: Import multiple records as JSON array
- **CSV Export**: Export records to CSV format
- **JSON Export**: Export records as JSON
- **BibTeX Export**: Academic citation export
- **Validation**: Pre-import validation with error reporting

### Cross-Referencing
- **Record relations**: Link related records with typed relationships:
  - Related
  - Derived from
  - Variant of
  - Supersedes
  - Part of
  - Contradicts
- **Bidirectional links**: Track both incoming and outgoing relationships
- **Similarity detection**: Auto-suggest similar records based on:
  - Classification
  - Community
  - Region overlap
  - TK label overlap

**Files**:
- `backend/src/records/entities/record-version.entity.ts` - Version tracking
- `backend/src/records/entities/record-relation.entity.ts` - Record relationships
- `backend/src/records/records-version.service.ts` - Version management
- `backend/src/records/records-bulk.service.ts` - Import/export
- `backend/src/records/records-relation.service.ts` - Relationship management

---

## 3. Community Engagement

### User Profiles
- **Extended profiles**:
  - Display name, bio, affiliation
  - Community association
  - Areas of expertise
  - Languages spoken
  - Public/private visibility
- **Contribution tracking**: Count of submitted records
- **Reputation system**: Score based on contributions and reviews
- **Activity tracking**: Last active timestamp

### Comments & Annotations
- **Threaded comments**: Support for nested replies
- **Moderation**: Admin approval workflow (pending/approved/rejected/flagged)
- **Voting**: Upvote/downvote comments
- **User attribution**: Track comment authors

### Community Voting
- **Verification votes**: Community members can verify accuracy
- **Quality indicators**:
  - Verify (this is accurate)
  - Accurate (confirms information)
  - Helpful (useful contribution)
  - Flag (report issues)
- **Aggregate statistics**: Total votes per type displayed

**Files**:
- `backend/src/users/user-profile.entity.ts` - User profiles
- `backend/src/records/entities/record-comment.entity.ts` - Comments
- `backend/src/records/entities/record-vote.entity.ts` - Voting
- `backend/src/records/records-comment.service.ts` - Comment management
- `backend/src/records/records-vote.service.ts` - Vote management

---

## 4. Analytics & Reporting

### Event Tracking
- **Comprehensive tracking**:
  - Views
  - Searches
  - Downloads
  - Access requests
  - Shares
  - Exports
- **Session tracking**: Anonymous session IDs
- **User attribution**: Link events to authenticated users
- **Metadata capture**: Context-specific data (search terms, filters)
- **IP & user agent**: Track origin

### Dashboard Analytics
- **Event distribution**: Pie chart of event types
- **Daily activity**: Line chart of activity over time
- **Top records**: Most viewed content
- **Top searches**: Popular search terms
- **Unique users**: Distinct user count

### Record Analytics
- **View count**: Automatic increment on view
- **Download tracking**: Track media downloads
- **Daily trends**: Activity chart per record
- **Unique viewers**: Distinct viewer count
- **Time-range analysis**: Configurable time periods

### Export Capabilities
- **Dashboard export**: Export analytics data
- **Record metrics**: Export per-record statistics
- **User activity**: Export user behavior data
- **Custom date ranges**: Filter by time period

**Files**:
- `backend/src/analytics/analytics.entity.ts` - Event tracking
- `backend/src/analytics/analytics.service.ts` - Analytics aggregation
- `frontend/components/AnalyticsDashboard.tsx` - Dashboard UI

---

## 5. API Enhancements

### GraphQL API
- **Schema definition**: Complete GraphQL schema in `schema.gql`
- **Query support**:
  - Single and multiple record queries
  - Advanced search with all filters
  - Analytics queries
  - User profile queries
  - Version history queries
- **Mutation support**:
  - Record CRUD operations
  - Comment creation
  - Voting
  - Relationship creation
  - Profile updates
- **Type safety**: Strong typing for all operations

### REST API Documentation
- **Swagger/OpenAPI**: Auto-generated API docs at `/api/docs`
- **Interactive testing**: Try endpoints directly from docs
- **Authentication support**: OAuth2 and Bearer token auth
- **Comprehensive descriptions**: All endpoints documented
- **Examples**: Request/response examples
- **Tag organization**: Grouped by feature area

### Rate Limiting
- **Multi-tier limits**:
  - Short: 10 req/second
  - Medium: 100 req/minute
  - Long: 1000 req/hour
- **Endpoint-specific limits**:
  - Public: 20/minute
  - Search: 60/minute
  - Upload: 10/minute
  - Export: 5/hour
- **Throttle protection**: Prevent abuse

### API Key Management
- (Ready for implementation with existing rate limiting infrastructure)

**Files**:
- `backend/src/graphql/schema.gql` - GraphQL schema
- `backend/src/swagger.config.ts` - Swagger configuration
- `backend/src/security/rate-limit.config.ts` - Rate limiting

---

## 6. Security & Compliance

### Two-Factor Authentication (2FA)
- **TOTP support**: Time-based one-time passwords
- **QR code generation**: Easy mobile app setup
- **Backup codes**: Recovery options
- **Verification**: Token validation with time window

### GDPR Compliance
- **Right to access**: Export all user data
- **Right to be forgotten**:
  - Full deletion option
  - Anonymization option
- **Right to rectification**: Update personal data
- **Data portability**: Export in JSON/CSV/XML formats
- **Consent management**: Track data processing consent

### IP Restrictions
- **Whitelist guard**: Restrict access by IP address
- **Flexible configuration**: Per-endpoint IP restrictions
- **X-Forwarded-For support**: Works behind proxies

### Advanced Audit Log
- **Comprehensive logging**: All sensitive operations logged
- **Exportable**: Download audit logs
- **Filtering**: Search by user, action, date range
- **Tamper evidence**: Hash-chained entries

**Files**:
- `backend/src/security/two-factor.service.ts` - 2FA implementation
- `backend/src/security/gdpr.service.ts` - GDPR compliance
- `backend/src/security/ip-whitelist.guard.ts` - IP restrictions

---

## 7. UX/UI Improvements

### Internationalization (i18n)
- **Three languages**:
  - Haitian Creole (ht) - Default
  - French (fr)
  - English (en)
- **Translation files**: JSON-based translations
- **Dynamic switching**: Change language on the fly
- **Server-side support**: SSR-compatible
- **RTL ready**: Prepared for future RTL languages

### Dark Mode
- **Theme provider**: Next.js theme support
- **System preference**: Auto-detect OS theme
- **Manual toggle**: User-controlled switching
- **No flash**: Seamless transitions
- **Persistent**: Remembers user choice

### Responsive Design
- **Mobile-first**: Optimized for mobile devices
- **Breakpoint system**: Tablets, desktop, large screens
- **Touch-friendly**: Larger tap targets on mobile
- **Adaptive layouts**: Reflow for different sizes

### Accessibility
- **WCAG 2.1 AA compliance**:
  - Semantic HTML
  - ARIA labels
  - Keyboard navigation
  - Screen reader support
- **Color contrast**: Sufficient contrast ratios
- **Focus indicators**: Clear focus states
- **Alt text**: Image descriptions

**Files**:
- `frontend/next-i18next.config.js` - i18n configuration
- `frontend/public/locales/*/common.json` - Translations
- `frontend/components/ThemeProvider.tsx` - Theme support
- `frontend/components/ThemeToggle.tsx` - Dark mode toggle

---

## 8. Content Capabilities

### Rich Text Editor
- **WYSIWYG editing**: Quill.js editor
- **Formatting options**:
  - Headers (H1-H3)
  - Bold, italic, underline, strikethrough
  - Lists (ordered, unordered)
  - Indentation
  - Links and images
- **Clean output**: Sanitized HTML
- **Read-only mode**: Display formatted content

### Enhanced Media Support
- **Media types**:
  - Images (JPEG, PNG, GIF)
  - Videos (MP4, WebM)
  - Audio (MP3, OGG, WAV)
  - Documents (PDF, DOC)
- **Metadata extraction**:
  - Image EXIF data
  - Video duration, resolution, codec
  - Audio bitrate, duration
- **Thumbnail generation**: Auto-generate previews
- **Transcription**: Audio/video to text
- **OCR**: Extract text from images/PDFs
- **Subtitle generation**: SRT/VTT format

### Geographic Mapping
- **Interactive maps**: Leaflet.js integration
- **Multiple locations**: Support for multiple geographic points
- **Location types**:
  - Origin
  - Practice area
  - Sacred site
  - Collection site
- **GeoJSON support**: Complex geometries (points, polygons, lines)
- **Privacy controls**: Hide sensitive locations
- **EXIF extraction**: GPS coordinates from photos

### Timeline Visualization
- **Historical events**: Track knowledge evolution
- **Event types**:
  - Historical milestones
  - Seasonal practices
  - Lifecycle events
  - Ceremonial occasions
  - Knowledge transmission
- **Flexible dating**:
  - Exact dates
  - Approximate dates
  - Relative dating (before/after)
  - Era-based (pre-colonial, etc.)
- **Recurring events**: Annual ceremonies, seasonal practices

**Files**:
- `backend/src/media/media-enhanced.entity.ts` - Enhanced media metadata
- `backend/src/media/media-processing.service.ts` - Media processing
- `backend/src/records/entities/record-location.entity.ts` - Geographic data
- `backend/src/records/entities/record-timeline.entity.ts` - Timeline events
- `frontend/components/RichTextEditor.tsx` - Rich text UI
- `frontend/components/RecordMap.tsx` - Map visualization

---

## 9. Collaboration Features

### Review Workflow
- **Submission**: Authors submit records for review
- **Assignment**: Admins assign reviewers
- **Due dates**: Track review deadlines
- **Checklist**: Standardized review criteria:
  - Content accuracy
  - Proper classification
  - Appropriate TK labels
  - Correct access tier
  - No sensitive info exposed
  - Complete metadata
  - Community consent
- **Quality scoring**: 1-5 rating system
- **Review notes**: Detailed feedback
- **Status tracking**: Pending, in progress, approved, rejected, revision requested
- **Overdue tracking**: Identify late reviews

### Multi-User Editing
- **Collaboration sessions**: Real-time collaboration tracking
- **Active user list**: See who's editing
- **Cursor positions**: Track where users are working
- **Proposed changes**: Queue changes before committing
- **Record locking**: Prevent concurrent edits
- **Auto-cleanup**: Close stale sessions

### Draft System
- **Draft status**: Work-in-progress records
- **Auto-save**: (Infrastructure ready)
- **Version control**: Track draft iterations
- **Publish workflow**: Submit for review when ready

### Citation Generation
- **Multiple formats**:
  - APA
  - MLA
  - Chicago
  - Harvard
  - BibTeX
- **Batch citations**: Generate for multiple records
- **Bibliography**: Formatted reference lists
- **Proper attribution**: Community and source credit

**Files**:
- `backend/src/workflow/review-assignment.entity.ts` - Review assignments
- `backend/src/workflow/collaboration-session.entity.ts` - Collaboration sessions
- `backend/src/workflow/workflow.service.ts` - Review workflow
- `backend/src/workflow/collaboration.service.ts` - Real-time collaboration
- `backend/src/citation/citation.service.ts` - Citation generation

---

## 10. Performance & Scalability

### Redis Caching
- **Cache layer**: Redis for frequently accessed data
- **Cached data**:
  - Individual records
  - Search results
  - Facet aggregations
  - Analytics dashboards
  - User profiles
- **TTL strategy**:
  - Short: 1 minute (volatile data)
  - Medium: 5 minutes (search results)
  - Long: 1 hour (aggregations)
  - Day: 24 hours (static content)
- **Cache invalidation**: Smart invalidation on updates

### Background Job Processing
- **Bull queue**: Redis-backed job queues
- **Export jobs**: Async generation of large exports
- **Indexing jobs**:
  - Update search vectors
  - Full reindexing
  - Analytics aggregation
- **Media processing**: Async thumbnail, transcription, OCR

### Database Optimization
- **Indexes**: Strategic indexes on:
  - Title fields
  - Classification
  - Access tier
  - Community
  - Status
  - Search vectors
- **Query optimization**: Query builder for complex searches
- **JSONB operators**: Efficient array queries
- **Connection pooling**: (TypeORM default)

### CDN Support
- **Static assets**: Ready for CDN integration
- **Media files**: MinIO presigned URLs
- **Cache headers**: (Infrastructure ready)

**Files**:
- `backend/src/cache/cache.config.ts` - Redis configuration
- `backend/src/jobs/export.processor.ts` - Export jobs
- `backend/src/jobs/indexing.processor.ts` - Search indexing jobs
- `docker-compose.yml` - Redis service added

---

## 🚀 Getting Started with New Features

### 1. Install Dependencies

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd frontend
npm install
```

### 2. Update Environment Variables

Add to `.env`:
```env
REDIS_HOST=redis
REDIS_PORT=6379
```

### 3. Start Services

```bash
docker compose up --build
```

### 4. Access New Features

- **API Documentation**: http://localhost:4000/api/docs
- **GraphQL Playground**: http://localhost:4000/graphql
- **Analytics Dashboard**: http://localhost:3000/analytics
- **Advanced Search**: http://localhost:3000/search

---

## 📊 Feature Comparison

| Feature | Before | After |
|---------|--------|-------|
| Search | Basic keyword (ILIKE) | Full-text + faceted + filters |
| Export | None | CSV, JSON, BibTeX |
| Versioning | None | Full version history |
| Comments | None | Threaded with moderation |
| Analytics | None | Comprehensive dashboard |
| API Docs | None | Swagger + GraphQL |
| i18n | None | HT, FR, EN support |
| Collaboration | None | Multi-user + review workflow |
| Media | Basic upload | Video/audio transcription, OCR |
| Maps | None | Interactive with GeoJSON |

---

## 🔧 Configuration Options

### Search Configuration
- Adjust relevance ranking weights in `records.service.ts`
- Customize facet calculations
- Modify pagination defaults

### Analytics Configuration
- Set event retention period
- Configure aggregation intervals
- Customize dashboard metrics

### Security Configuration
- Adjust rate limits in `rate-limit.config.ts`
- Configure 2FA settings
- Set IP whitelists

### Performance Configuration
- Tune Redis cache TTLs
- Adjust job queue concurrency
- Configure database pool size

---

## 📝 API Examples

### GraphQL Query
```graphql
query SearchRecords {
  records(
    q: "traditional medicine"
    creole_class: "C-MED"
    limit: 10
    include_facets: true
  ) {
    data {
      id
      title_ht
      community
      view_count
    }
    meta {
      total
      totalPages
    }
    facets {
      community {
        value
        count
      }
    }
  }
}
```

### REST API
```bash
# Advanced search
GET /v1/records?q=medicine&creole_class=C-MED&page=1&limit=20&include_facets=true

# Export to BibTeX
POST /v1/records/export
Content-Type: application/json
{
  "format": "bibtex",
  "filters": { "creole_class": "C-MED" }
}

# Get analytics
GET /v1/analytics/dashboard?startDate=2024-01-01&endDate=2024-12-31
```

---

## 🎓 Training Resources

1. **Search**: Use advanced filters to find specific records
2. **Versioning**: Track changes and revert if needed
3. **Comments**: Engage with community on records
4. **Analytics**: Monitor platform usage
5. **Collaboration**: Work together on reviews

---

## 🐛 Troubleshooting

### Redis Connection Issues
- Ensure Redis container is running: `docker ps | grep redis`
- Check Redis health: `docker exec creole-redis redis-cli ping`

### Search Not Working
- Rebuild search vectors: Run indexing job
- Check PostgreSQL FTS configuration

### Export Timing Out
- Large exports are processed async
- Check export job status

---

## 📈 Future Enhancements

- Machine learning for auto-classification
- Blockchain anchoring for immutability
- Mobile native apps
- Real-time collaborative editing (WebSockets)
- AI-powered similarity detection
- Advanced NLP for Haitian Creole

---

## 📞 Support

For questions about new features:
1. Check this documentation
2. Review API docs at `/api/docs`
3. Open an issue on GitHub

