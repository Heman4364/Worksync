# WorkSync – Intelligent Team & Content Workflow Management System

> *"Plan smarter. Work together. Deliver faster."*

WorkSync is an enterprise-grade full-stack collaborative workspace and workflow automation SaaS platform. It combines robust project management with a multi-platform social media content management studio and an event-driven Apache Kafka reliability engine.

---

## 1. System Architecture & Tech Stack

### Frontend
- **Framework**: React 18 with Vite
- **State Management**: Redux Toolkit (RTK) with `createEntityAdapter` for normalized collections (`ids`, `entities`), `createAsyncThunk`, and memoized Reselect selectors
- **Styling**: Tailwind CSS with sleek Dark & Light modes
- **Visualizations**: Recharts interactive data visualization
- **Calendar & Drag-and-Drop**: FullCalendar (Month, Week, Day views) and `@hello-pangea/dnd` for Kanban workflows
- **Networking**: Axios with request correlation ID tracking (`X-Correlation-ID`) and response interceptor for automatic refresh token rotation
- **Real-Time**: STOMP over SockJS WebSocket broker (`/ws`)
- **Testing**: Vitest & React Testing Library (RTL)

### Backend
- **Framework**: Java 17, Spring Boot 3.3.5
- **Security**: Spring Security 6 with stateless JWT access tokens (15m), database-persisted refresh token rotation (7d), HttpOnly cookies, method-level RBAC (`@PreAuthorize`), and BCrypt password hashing
- **Cryptography**: AES-256-GCM authenticated encryption for sensitive third-party OAuth credentials
- **Data Persistence**: Spring Data JPA & Hibernate with JPQL `JOIN FETCH` queries eliminating N+1 SELECT overhead
- **Caching**: Spring Cache backed by Ehcache 3 with Jakarta JCache support
- **Event Streaming**: Apache Kafka (KRaft mode, no ZooKeeper) with Dead Letter Topic routing (`scheduled-posts-dlt`), exponential backoff retries (2s, 4s, 8s), and database-enforced idempotency
- **Observability**: SLF4J MDC request correlation filter and structured execution time logging
- **Databases**: PostgreSQL (Production) and H2 persistent file/in-memory database (Development & Testing)

---

## 2. Seeded Demonstration Credentials

On startup, WorkSync automatically seeds initial test data with three distinct role accounts:

| Role | Email | Password | Permissions & Scope |
|---|---|---|---|
| **ADMIN** | `admin@worksync.io` | `admin123` | Full workspace control, team management, member invitations, automation rule toggling, system settings, integration vault. |
| **MANAGER** | `manager@worksync.io` | `manager123` | Project creation, task assignment, deadline adjustments, team oversight, content review, project-level analytics. |
| **MEMBER** | `member@worksync.io` | `member123` | View assigned projects, move tasks on Kanban, add task comments, write drafts, view interactive calendar, receive notifications. |

---

## 3. Getting Started & Running WorkSync

### Option A: Local Development Run (Zero External Setup Required)

Both the backend and frontend can run seamlessly out of the box using embedded persistent storage.

#### 1. Start the Spring Boot Backend
```bash
# Navigate to the backend directory
cd backend

# Run with Maven Wrapper
..\mvnw.cmd spring-boot:run
```
The backend initializes at `http://localhost:8080`.
- H2 Web Console: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/worksyncdb`, User: `sa`, Password: `""`)

#### 2. Start the React Frontend
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (already installed)
npm install

# Start Vite dev server
npm run dev
```
Open your browser at `http://localhost:3000`.

---

### Option B: Full Docker Compose Run (PostgreSQL + Kafka KRaft + App)

To run the complete production topology including PostgreSQL 16 and Apache Kafka in KRaft mode:

```bash
# From the project root
docker-compose up --build -d
```

Services exposed:
- Frontend Client: `http://localhost:3000`
- Spring Boot Backend: `http://localhost:8080`
- PostgreSQL: `localhost:5432` (User: `worksync`, DB: `worksync`)
- Apache Kafka KRaft Broker: `localhost:9092`

---

## 4. Key Subsystem Highlights

### Multi-Platform Post Composer (Strategy Pattern)
Located in `backend/src/main/java/com/worksync/strategy/` and `frontend/src/features/content/ContentStudio.jsx`:
- Implements the **Strategy Design Pattern** (`ValidationStrategy`) with dedicated implementations for **Instagram**, **LinkedIn**, and **X**.
- Validates platform-specific character constraints (2,200 for Instagram, 3,000 for LinkedIn, 280 for X) and URL calculation (fixed 23 characters per t.co link on X).
- Enforces hashtag thresholds (warns if Instagram exceeds 30 hashtags) and checks for media presence.
- Live simulated preview mirrors the selected network's feed card.

### Apache Kafka Reliability Engine (Module 14)
Located in `backend/src/main/java/com/worksync/kafka/` and `frontend/src/features/kafka/KafkaReliabilityDashboard.jsx`:
- **Main Topic**: `scheduled-posts`
- **Dead Letter Topic (DLT)**: `scheduled-posts-dlt`
- **Consumer Group**: `reliability-consumer-group`
- **Exponential Backoff**: Initial delay of 2,000ms, multiplier of 2.0 (2,000ms, 4,000ms, 8,000ms, max 3 attempts).
- **Dead Letter Queue Routing**: After 3 failed attempts, messages are safely routed to DLQ with root-cause stack traces and failure logs.
- **Safe Reprocessing**: Operators can inspect DLQ entries and trigger reprocessing via `POST /api/events/{id}/retry`, strictly retaining the original `eventId`.
- **Database-Enforced Idempotency**: A unique index on `event_id` ensures duplicate deliveries are safely ignored as `DUPLICATE_IGNORED` without re-executing business actions across app restarts.
- **Automated Test Report Suite**: One-click verification of `SUCCESS`, `TEMPORARY`, `PERMANENT`, `DUPLICATE`, and `ALL` scenarios directly from the UI.

### Advanced Security Architecture
Located in `backend/src/main/java/com/worksync/security/`:
- **JWT & Token Rotation**: Access tokens expire in 15 minutes; refresh tokens (7 days) are rotated upon each renewal.
- **AES-256-GCM Encryption**: Third-party OAuth client secrets and integration tokens are encrypted using a 96-bit random IV and 128-bit authentication tag before being stored in the database.
- **Correlation ID Tracking**: Servlet filter populates SLF4J MDC and attaches `X-Correlation-ID` to all HTTP response headers for end-to-end tracing.

### Scalable Read APIs & Caching
Located in `backend/src/main/java/com/worksync/repository/` and `ehcache.xml`:
- Standard Spring Data `Pageable` pagination and sorting.
- JPQL queries use `JOIN FETCH` to eliminate Hibernate N+1 queries on task and project listings.
- Ehcache 3 caches dashboard analytics and project summaries, automatically invalidated on task mutations via `@CacheEvict`.

---

## 5. Automated Testing & Verification

### Running Backend Tests (JUnit 5 & MockMvc)
```bash
cd backend
..\mvnw.cmd test
```
*Executes all 13 unit, integration, encryption, and Kafka reliability tests.*

### Running Frontend Tests (Vitest & RTL)
```bash
cd frontend
npm test
```
*Executes React Testing Library behavioral component tests.*

### Apache JMeter Performance Benchmark
A performance test plan is available at `worksync-benchmark.jmx`.
Run with JMeter:
```bash
jmeter -n -t worksync-benchmark.jmx -l results.jtl -e -o benchmark-report/
```

---

## 6. Experiment Implementation Mapping

For complete academic and curriculum mapping, refer to:
[EXPERIMENT_IMPLEMENTATION_MAPPING.md](EXPERIMENT_IMPLEMENTATION_MAPPING.md)
It explicitly maps Experiments 1 through 7, 9, and the Kafka reliability subsystem to source files, entities, endpoints, and demonstration guides.
