# WorkSync Architecture Overview

## 1. High-Level Architecture
WorkSync is engineered as a unified SaaS platform for team project collaboration and social media workflow automation.

### Architecture Highlights:
- **Clean Layered Backend**: Controller -> Service -> Repository -> Database.
- **Strict DTO Boundaries**: JPA entities are never leaked over REST APIs; standard envelope `ApiResponse<T>` is consistently returned.
- **Correlation ID Tracking**: Correlation IDs are generated at the boundary via a servlet filter, placed into SLF4J MDC, included in all structured logs, and returned in `X-Correlation-ID` response headers.
- **Enterprise Security**:
  - Stateless JWT access tokens (15-minute validity) + DB-tracked refresh tokens (7-day validity) with automated rotation.
  - BCrypt password hashing.
  - AES-256-GCM encryption for OAuth client credentials.
  - Fine-grained Method-Level RBAC using `@PreAuthorize` (`ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_MEMBER`).
- **High-Performance Read APIs**:
  - `Pageable` pagination & sorting on all listing endpoints.
  - JPQL with `JOIN FETCH` queries to eliminate Hibernate N+1 query overhead.
  - Multi-tier caching with Spring Cache & Ehcache 3 for analytics, project summaries, and dashboard KPIs.
- **Social Media Content Strategy Engine**:
  - Implements the **Strategy Design Pattern** (`ValidationStrategy`) to independently validate posts for Instagram, LinkedIn, and X.
  - Easily extensible for future platforms without altering core workflow code.
- **Kafka Event-Driven Reliability**:
  - Apache Kafka topics: `scheduled-posts` and `scheduled-posts-dlt`.
  - Consumer Group: `reliability-consumer-group`.
  - Exponential backoff retry handler (2s, 4s, 8s delays, 3 attempts).
  - Dead Letter Queue routing on exhaustion with full stacktrace, retry count, and original event metadata.
  - Safe DLQ reprocessing retaining original `eventId`.
  - Database-enforced idempotency with unique constraints on `eventId` preventing double-processing.
  - Live simulation API (`POST /api/tests/run`) for test automation and interactive verification.
- **Frontend State & UI**:
  - React 18 with Vite.
  - Redux Toolkit with domain-specific slices and `createEntityAdapter` for normalized collections (`ids` and `entities`).
  - Memoized selectors with Reselect.
  - FullCalendar with Drag-and-Drop scheduling synchronization.
  - Interactive Kanban board with drag-and-drop status workflows.
  - Recharts analytics powered by real backend aggregation endpoints.

---
