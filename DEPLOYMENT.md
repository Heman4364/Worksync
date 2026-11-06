# WorkSync Deployment Guide

This guide covers both **instant public web access** and **permanent 24/7 cloud deployment** on free tiers.

---

## 1. 🚀 Instant Live Public Access (Active Now)

WorkSync is currently live on the public internet via Cloudflare's secure edge tunnel:

* **Live Public URL**: `https://intervals-condition-directly-recipients.trycloudflare.com`
* **Local Origin**: `http://localhost:3000` (Frontend) & `http://localhost:8080` (Backend API)
* **Encryption**: TLS 1.3 / SSL with Cloudflare Edge DDoS mitigation

Anyone on mobile, tablet, Mac, or PC can open this link to access the app, log in, or register a new workspace.

---

## 2. ☁️ 1-Click Cloud Deployment to Render (100% Free Tier)

The repository includes a ready-to-use [`render.yaml`](file:///c:/Users/prasa/OneDrive/Desktop/Worksync/render.yaml) blueprint:

1. Push this repository to your **GitHub** or **GitLab** account.
2. Sign up or log in at **[render.com](https://render.com)**.
3. In the Render Dashboard, click **New +** → **Blueprint**.
4. Select your `Worksync` repository.
5. Render will automatically detect `render.yaml` and provision:
   * **`worksync-backend`**: Dockerized Spring Boot Web Service
   * **`worksync-frontend`**: React Vite Static Site with automatic rewrite rules
   * **`worksync-db`**: Free Managed PostgreSQL Database
6. Click **Apply** to deploy!

---

## 3. 🚂 Deployment on Railway.app

1. Install Railway CLI or connect via the web console at **[railway.app](https://railway.app)**.
2. Add a **PostgreSQL** service with 1 click.
3. Deploy the backend using the included [`railway.json`](file:///c:/Users/prasa/OneDrive/Desktop/Worksync/railway.json) and [`Dockerfile.backend`](file:///c:/Users/prasa/OneDrive/Desktop/Worksync/Dockerfile.backend).
4. Deploy the frontend static build from `frontend/dist` or link to Vercel/Netlify.

---

## 4. 🐳 Docker Compose Deployment (Single Server / VPS)

To deploy on any cloud VM (such as an AWS EC2 instance, DigitalOcean Droplet, or Oracle Cloud Always Free VM):

```bash
# Clone and launch all services in background
docker compose up -d --build
```

This starts:
- PostgreSQL on port `5432`
- Apache Kafka in KRaft mode on port `9092`
- Spring Boot Backend on port `8080`
- React Frontend (Nginx) on port `3000`
