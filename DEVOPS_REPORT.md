# DevOps & Cloud Deployment Report

## CHALO — AI-Powered Ride-Hailing Platform

---

**Course:** DevOps & Cloud Computing

**Academic Year:** 2025–2026

**Team Size:** 6 Members

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Docker Containerization](#3-docker-containerization)
4. [Cloud Infrastructure (AWS)](#4-cloud-infrastructure-aws)
5. [CI/CD Pipeline (GitHub Actions)](#5-cicd-pipeline-github-actions)
6. [Environment Variables & Secrets Management](#6-environment-variables--secrets-management)
7. [LLM Integration — AI-Powered FAQ Chat](#7-llm-integration--ai-powered-faq-chat)
8. [Mobile Deployment (Android APK)](#8-mobile-deployment-android-apk)
9. [Monitoring & Health Checks](#9-monitoring--health-checks)
10. [Team Roles & Responsibilities](#10-team-roles--responsibilities)
11. [Cost Analysis](#11-cost-analysis)
12. [Conclusion](#12-conclusion)
13. [References](#13-references)

---

## 1. Project Overview

### 1.1 What is CHALO?

CHALO is a full-stack shared auto-rickshaw ride-hailing progressive web application (PWA) designed for Ahmedabad, India. It enables passengers to discover routes, track shuttles in real-time on an interactive map, view fares, and read driver reviews — all from a lightweight, mobile-friendly interface.

### 1.2 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Vanilla JS + Vite | SPA with Leaflet maps, responsive UI |
| **Backend** | Node.js + Express | REST API (16 endpoints) |
| **Database** | SQLite (better-sqlite3) | Lightweight, file-based relational DB |
| **Auth** | JWT + bcryptjs | Token-based authentication |
| **Containerization** | Docker (multi-stage) | Consistent build & deploy |
| **Cloud** | AWS ECS Fargate | Serverless container hosting |
| **CI/CD** | GitHub Actions | Automated build → deploy pipeline |
| **Mobile** | Capacitor | Android APK generation |
| **AI (upcoming)** | OpenAI / Gemini API | AI-powered FAQ chat assistant |

### 1.3 AI-Powered FAQ Chat Feature (Upcoming)

To enhance user experience, CHALO will integrate an **AI-powered FAQ chatbot** using LLM APIs (OpenAI GPT / Google Gemini). This feature will:

- Answer passenger queries about routes, fares, and schedules in natural language
- Provide real-time shuttle status through conversational interface
- Reduce support overhead by handling common questions automatically
- Use context-aware responses based on route and driver data from the database

The chatbot will be implemented as a new frontend component (`src/components/ChatWidget.js`) communicating with a dedicated backend endpoint (`/api/chat`) that proxies requests to the LLM API with CHALO-specific context.

---

## 2. System Architecture

### 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER DEVICES                                │
│                                                                     │
│   ┌───────────┐    ┌───────────┐    ┌───────────────┐              │
│   │  Browser   │    │  Browser  │    │ Android APK   │              │
│   │ (Desktop)  │    │ (Mobile)  │    │ (Capacitor)   │              │
│   └─────┬─────┘    └─────┬─────┘    └───────┬───────┘              │
│         │                │                   │                      │
│         └────────────────┼───────────────────┘                      │
│                          │ HTTPS (Port 5000)                        │
└──────────────────────────┼──────────────────────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │   AWS ECS Fargate       │
              │   ap-south-1 (Mumbai)   │
              │                         │
              │  ┌───────────────────┐  │
              │  │  Docker Container  │  │
              │  │                   │  │
              │  │  ┌─────────────┐  │  │
              │  │  │  Express.js  │  │  │
              │  │  │  (REST API)  │  │  │
              │  │  └──────┬──────┘  │  │
              │  │         │         │  │
              │  │  ┌──────▼──────┐  │  │
              │  │  │   SQLite     │  │  │
              │  │  │  (in-file)   │  │  │
              │  │  └─────────────┘  │  │
              │  │                   │  │
              │  │  ┌─────────────┐  │  │
              │  │  │ Static SPA  │  │  │
              │  │  │ (dist/)     │  │  │
              │  │  └─────────────┘  │  │
              │  └───────────────────┘  │
              └─────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │   Supporting Services    │
              │                          │
              │  ┌────────┐ ┌─────────┐  │
              │  │  ECR   │ │CloudWatch│  │
              │  │(Images)│ │ (Logs)  │  │
              │  └────────┘ └─────────┘  │
              └──────────────────────────┘
```

### 2.2 CI/CD Pipeline Architecture

```
  Developer          GitHub           GitHub Actions         AWS
  ┌──────┐       ┌──────────┐     ┌──────────────┐     ┌──────────┐
  │      │ push  │          │      │              │     │          │
  │ Code ├───►──►│  main    │trigger│  Workflow    │     │   ECR    │
  │      │       │  branch  │─────►│  (Ubuntu)    │────►│ Registry │
  └──────┘       └──────────┘      │              │     │          │
                                   │ 1. Checkout  │     └────┬─────┘
                                   │ 2. AWS Auth  │          │
                                   │ 3. ECR Login │          │
                                   │ 4. Build     │──────►──┘
                                   │ 5. Push      │
                                   │ 6. Deploy    │──────►──┐
                                   └──────────────┘          │
                                                         ┌───▼─────┐
                                                         │  ECS     │
                                                         │ Service  │
                                                         │(Rolling  │
                                                         │ Update)  │
                                                         └─────────┘
```

### 2.3 Data Flow Diagram

```
┌─────────┐    HTTP/REST     ┌────────────┐    SQL Queries    ┌─────────┐
│         │ ──────────────►  │            │ ──────────────►   │         │
│  Client │   GET /api/...   │  Express   │   SELECT/INSERT   │ SQLite  │
│  (SPA)  │   POST /api/...  │  Server    │   UPDATE/DELETE   │Database │
│         │ ◄──────────────  │            │ ◄──────────────   │         │
└─────────┘   JSON Response  └────────────┘   Result Rows     └─────────┘
                                │
                                │ (Upcoming)
                                ▼
                          ┌────────────┐
                          │  LLM API   │
                          │ OpenAI /   │
                          │  Gemini    │
                          └────────────┘
```

---

## 3. Docker Containerization

### 3.1 Why Docker?

Docker ensures that the application runs identically across all environments — developer laptops, CI runners, and production servers. It eliminates "works on my machine" problems by packaging the application with all its dependencies.

### 3.2 Multi-Stage Dockerfile

The project uses a **multi-stage build** to minimize the final image size:

```dockerfile
# ──────────────── Stage 1: Build ────────────────
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install                # Install ALL dependencies (including dev)
COPY . .
RUN npm run build              # Vite builds frontend → dist/

# ──────────────── Stage 2: Production ────────────────
FROM node:20-slim AS production
RUN apt-get update && apt-get install -y python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev    # Only production dependencies
COPY --from=build /app/dist ./dist    # Built frontend
COPY server/ ./server/               # Backend code
RUN mkdir -p data                     # SQLite directory

EXPOSE 5000
ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "server/index.js"]
```

**Key decisions:**

| Decision | Rationale |
|----------|-----------|
| Multi-stage build | Build tools (Vite, 250+ dev packages) stay in build stage; production image is ~200 MB vs ~600 MB |
| `node:20-slim` base | 40% smaller than full `node:20` image, sufficient for production |
| `python3 make g++` install | Required by `better-sqlite3` native addon compilation |
| Separate COPY for dist/ and server/ | Only copies what's needed — no source files in production image |

### 3.3 Docker Compose (Local Development)

```yaml
version: '3.8'

services:
  chalo:
    build: .
    ports:
      - "5000:5000"
    volumes:
      - chalo-data:/app/data      # Persist SQLite across restarts
    environment:
      - NODE_ENV=production
      - PORT=5000
    restart: unless-stopped

volumes:
  chalo-data:                      # Named volume for DB persistence
```

**Docker Compose benefits:**
- Single command (`docker compose up`) to start the entire application
- Named volume `chalo-data` persists the SQLite database across container restarts
- `restart: unless-stopped` ensures automatic recovery from crashes

### 3.4 Image Size Comparison

| Stage | Base Image | Size | Contains |
|-------|-----------|------|----------|
| Build | `node:20` (~1.1 GB) | ~1.3 GB | All source + dev dependencies |
| **Production** | `node:20-slim` (~250 MB) | **~280 MB** | Only runtime code + production deps |

---

## 4. Cloud Infrastructure (AWS)

### 4.1 AWS Services Used

| AWS Service | Role | Configuration |
|-------------|------|---------------|
| **ECS (Elastic Container Service)** | Container orchestration | Fargate launch type (serverless) |
| **ECR (Elastic Container Registry)** | Docker image storage | Private repo: `chalo-app` |
| **Fargate** | Serverless compute | 0.25 vCPU, 512 MB RAM |
| **CloudWatch Logs** | Centralized logging | Log group: `/ecs/chalo-app` |
| **IAM** | Access management | `ecsTaskExecutionRole` for pull/deploy |
| **VPC** | Network isolation | `awsvpc` network mode |

### 4.2 ECS Task Definition

The task definition (`task-definition.json`) defines how the container runs on ECS:

```json
{
  "family": "chalo-app-task",
  "requiresCompatibilities": ["FARGATE"],
  "networkMode": "awsvpc",
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::900670598284:role/ecsTaskExecutionRole",
  "containerDefinitions": [{
    "name": "chalo-container",
    "image": "<IMAGE>",
    "portMappings": [{ "containerPort": 5000, "hostPort": 5000 }],
    "environment": [
      { "name": "NODE_ENV", "value": "production" },
      { "name": "PORT", "value": "5000" }
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/chalo-app",
        "awslogs-region": "ap-south-1"
      }
    }
  }]
}
```

### 4.3 Why Fargate?

| Factor | ECS on EC2 | ECS on Fargate |
|--------|-----------|----------------|
| Server management | User manages EC2 instances | **AWS manages servers** |
| Scaling | Manual or auto-scaling groups | **Automatic, per-task** |
| Pricing | Pay for entire EC2 instance | **Pay per-task per-second** |
| Over-provisioning | Common (wasted resources) | **None — exact resource allocation** |
| Patching | User responsibility | **AWS responsibility** |

For a lightweight application like CHALO (0.25 vCPU, 512 MB), Fargate is the optimal choice — no servers to manage, no wasted capacity, and costs as low as $9.73/month.

### 4.4 Region Selection: ap-south-1 (Mumbai)

- **Low latency**: Target users are in Ahmedabad, India — same subcontinent
- **Compliance**: Data stays within India, meeting potential data sovereignty requirements
- **Cost**: Mumbai region pricing is competitive compared to us-east-1

---

## 5. CI/CD Pipeline (GitHub Actions)

### 5.1 Pipeline Overview

The entire deployment is automated through a **GitHub Actions workflow** (`.github/workflows/aws-deploy.yml`). Every push to the `main` branch triggers a fresh build and deployment with zero downtime.

```
   Push to main
       │
       ▼
  ┌─────────────┐
  │  Checkout    │    Clone repository
  │  Code        │
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │  Configure   │    Authenticate with AWS
  │  AWS Creds   │    using GitHub Secrets
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │  Login to    │    Get ECR auth token
  │  Amazon ECR  │
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │  Build       │    docker build → tag with
  │  & Push      │    git commit SHA → push to ECR
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │  Update Task │    Replace <IMAGE> placeholder
  │  Definition  │    with new ECR image URI
  └──────┬──────┘
         │
  ┌──────▼──────┐
  │  Deploy to   │    Rolling update with
  │  ECS Service │    wait-for-service-stability
  └─────────────┘
```

### 5.2 Workflow Configuration

```yaml
name: Deploy to Amazon ECS

on:
  push:
    branches: ["main"]

env:
  AWS_REGION: ap-south-1
  ECR_REPOSITORY: chalo-app
  ECS_SERVICE: chalo-service
  ECS_CLUSTER: chalo-cluster
  ECS_TASK_DEFINITION: task-definition.json
  CONTAINER_NAME: chalo-container
```

### 5.3 Deployment Steps in Detail

| Step | Action | Tool/Action Used |
|------|--------|-----------------|
| 1. Checkout | Clone the repository | `actions/checkout@v4` |
| 2. AWS Auth | Configure credentials | `aws-actions/configure-aws-credentials@v4` |
| 3. ECR Login | Authenticate Docker to ECR | `aws-actions/amazon-ecr-login@v2` |
| 4. Build & Push | Build image, tag with commit SHA, push | Custom shell script |
| 5. Render Task Def | Inject new image URI into task definition | `aws-actions/amazon-ecs-render-task-definition@v1` |
| 6. Deploy | Update ECS service, wait for stability | `aws-actions/amazon-ecs-deploy-task-definition@v1` |

### 5.4 GitHub Secrets (Security)

The pipeline uses **GitHub repository secrets** to store sensitive credentials — they are never exposed in code or logs:

| Secret | Purpose | Where Used |
|--------|---------|-----------|
| `AWS_ACCESS_KEY_ID` | AWS IAM authentication | Step 2 (Configure AWS credentials) |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM authentication | Step 2 (Configure AWS credentials) |

### 5.5 Image Tagging Strategy

Each deployment tags the Docker image with the **Git commit SHA**:

```bash
docker build -t $ECR_REGISTRY/chalo-app:a1b2c3d .
docker push $ECR_REGISTRY/chalo-app:a1b2c3d
```

**Benefits:**
- **Traceability**: Every running container can be traced back to an exact commit
- **Rollback**: Reverting to a previous version means redeploying a specific SHA tag
- **Audit trail**: ECR retains image history for compliance

### 5.6 Zero-Downtime Deployment

ECS performs a **rolling update** by default:
1. New task starts alongside the old task
2. Health check passes on the new task
3. Old task is drained and stopped
4. Traffic seamlessly shifts to the new version

The `wait-for-service-stability: true` flag ensures the workflow only reports success after the new deployment is fully healthy.

---

## 6. Environment Variables & Secrets Management

### 6.1 Environment Variable Architecture

```
┌─────────────────────────────────────────────────────┐
│              ENVIRONMENT VARIABLES                   │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │   .env.local  │  │  .env.mobile │  │ ECS Task  │  │
│  │  (dev, local) │  │  (APK build) │  │  Defn     │  │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘  │
│         │                 │                │         │
│         ▼                 ▼                ▼         │
│  ┌──────────────────────────────────────────────┐   │
│  │              Application Code                │   │
│  │  process.env.VAR_NAME                        │   │
│  │  import.meta.env.VITE_VAR_NAME               │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │GitHub Secrets│  │  AWS Secrets  │                 │
│  │ (CI/CD creds)│  │  Manager (opt)│                 │
│  └──────────────┘  └──────────────┘                 │
└─────────────────────────────────────────────────────┘
```

### 6.2 Variable Inventory

| Variable | Scope | Default | Set In | Description |
|----------|-------|---------|--------|-------------|
| `PORT` | Backend | `5000` | ECS Task Def, docker-compose | Server port |
| `NODE_ENV` | Backend | `development` | ECS Task Def, Dockerfile | Environment mode |
| `JWT_SECRET` | Backend | *(hardcoded fallback)* | Needs to be set in ECS Task Def | JWT signing key |
| `VITE_API_BASE_URL` | Frontend (build-time) | `''` (same-origin) | `.env.mobile` | Backend URL for APK |
| `AWS_ACCESS_KEY_ID` | CI/CD only | — | GitHub Secrets | AWS authentication |
| `AWS_SECRET_ACCESS_KEY` | CI/CD only | — | GitHub Secrets | AWS authentication |
| `OPENAI_API_KEY` *(upcoming)* | Backend | — | ECS Task Def or `.env` | LLM API key for FAQ chat |
| `GEMINI_API_KEY` *(upcoming)* | Backend | — | ECS Task Def or `.env` | Gemini API key for FAQ chat |

### 6.3 `.env` File Pattern

```
# .env.local (development — NOT committed to git)
PORT=5000
NODE_ENV=development
JWT_SECRET=my-dev-secret-key

# .env.mobile (mobile build — NOT committed)
VITE_API_BASE_URL=http://13.202.93.200:5000
```

The `.gitignore` ensures `.env` and `.env.*` files are never committed:

```gitignore
.env
.env.*
!.env.example
```

### 6.4 Secrets Security Best Practices (Implemented)

| Practice | Status | Implementation |
|----------|--------|---------------|
| No secrets in source code | Partial | JWT_SECRET has hardcoded fallback — **to be moved to env var** |
| `.env` in `.gitignore` | Done | Prevents accidental commits |
| GitHub Secrets for CI/CD | Done | AWS credentials stored securely |
| Separate build-time vs runtime vars | Done | `VITE_*` (build) vs `process.env.*` (runtime) |
| No secrets in Docker image | Done | Image contains no `.env` files |

---

## 7. LLM Integration — AI-Powered FAQ Chat

### 7.1 Feature Description

The upcoming AI-powered FAQ chat feature will allow passengers to ask questions in natural language and receive contextual answers about CHALO services. This integrates Large Language Model (LLM) APIs into the existing architecture.

### 7.2 Architecture for LLM Integration

```
┌──────────┐     POST /api/chat      ┌──────────────┐     API Call     ┌──────────┐
│          │ ──────────────────────►  │              │ ──────────────►  │          │
│  Chat    │   { question: "..." }   │  /api/chat   │   Prompt +      │  OpenAI  │
│  Widget  │                         │  Endpoint    │   Context       │  GPT-4o  │
│  (SPA)   │ ◄────────────────────── │              │ ◄──────────────  │   or     │
│          │   { answer: "..." }     │  Express     │   Response      │ Gemini   │
└──────────┘                         └──────┬───────┘                 └──────────┘
                                            │
                                     ┌──────▼───────┐
                                     │   SQLite DB  │
                                     │  (Context:   │
                                     │  routes,     │
                                     │  fares,      │
                                     │  stops)      │
                                     └──────────────┘
```

### 7.3 Implementation Plan

**Backend — New endpoint (`server/routes/apiChat.js`):**

```javascript
const express = require('express');
const router = express.Router();

// POST /api/chat — AI-powered FAQ response
router.post('/', async (req, res) => {
  const { question } = req.body;

  // 1. Fetch context from database (routes, fares, stops)
  const context = buildContextFromDB(); // route names, fares, schedules

  // 2. Call LLM API (OpenAI or Gemini)
  const response = await callLLM(question, context);

  // 3. Return answer
  res.json({ answer: response });
});

async function callLLM(question, context) {
  const fetch = (await import('node-fetch')).default;
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',        // Cost-efficient model
      messages: [
        { role: 'system', content: `You are a helpful assistant for the CHALO ride-hailing app in Ahmedabad. Answer questions about routes, fares, and shuttle services. Context: ${context}` },
        { role: 'user', content: question }
      ],
      max_tokens: 200,              // Limit response length
      temperature: 0.3              // Factual, not creative
    })
  });
  const data = await response.json();
  return data.choices[0].message.content;
}
```

**Frontend — Chat widget component (`src/components/ChatWidget.js`):**

```javascript
// Floating chat button + expandable chat panel
// Uses the existing api.js request helper
export async function sendChatMessage(question) {
  const response = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify({ question })
  });
  return response.json();
}
```

### 7.4 LLM Provider Comparison

| Feature | OpenAI (GPT-4o-mini) | Google Gemini (1.5 Flash) |
|---------|----------------------|--------------------------|
| **Cost per 1M tokens** | $0.15 input / $0.60 output | $0.075 input / $0.30 output |
| **Context window** | 128K tokens | 1M tokens |
| **Latency** | ~500ms | ~300ms |
| **Free tier** | None (pay-per-use) | 15 RPM free |
| **API complexity** | Simple REST | Simple REST |
| **Recommended for** | Reliable, well-documented | Cost-sensitive, high-volume |

**Recommendation:** Start with **Gemini 1.5 Flash** during development (free tier), switch to **GPT-4o-mini** for production if higher reliability is needed.

### 7.5 Cost Estimation for AI Feature

| Metric | Value |
|--------|-------|
| Estimated daily questions | 100–500 |
| Average tokens per question | 150 input + 100 output |
| Daily tokens | ~75,000–125,000 |
| Monthly tokens | ~2.25M–3.75M |
| Monthly cost (GPT-4o-mini) | **$0.34–$0.56** |
| Monthly cost (Gemini Flash) | **$0.17–$0.28** |
| Monthly cost (GPT-4o) | **$5.63–$9.38** |

### 7.6 Environment Variables for AI Integration

```bash
# .env.production (to be added)
OPENAI_API_KEY=sk-proj-...          # or
GEMINI_API_KEY=AIza...
LLM_PROVIDER=openai                 # or "gemini" — controls which API to call
LLM_MODEL=gpt-4o-mini              # or "gemini-1.5-flash"
```

These will be added to the ECS task definition as environment variables (not hardcoded) following the same secrets management pattern used for AWS credentials.

---

## 8. Mobile Deployment (Android APK)

### 8.1 Capacitor Integration

The web application is converted to a native Android APK using **Capacitor** (by the Ionic team):

```
┌─────────────────────────────────────────────────────┐
│              APK Build Pipeline                      │
│                                                      │
│   npm run build:mobile                               │
│         │                                            │
│         ▼                                            │
│   Vite Build (--mode mobile)                         │
│   Reads .env.mobile → VITE_API_BASE_URL              │
│   Produces dist/ with production API URL             │
│         │                                            │
│         ▼                                            │
│   npx cap sync android                               │
│   Copies dist/ → android/app/src/main/assets/        │
│   Updates native project config                      │
│         │                                            │
│         ▼                                            │
│   Android Studio Build                               │
│   Generates debug/release APK                        │
└─────────────────────────────────────────────────────┘
```

### 8.2 Capacitor Configuration

```json
{
  "appId": "com.chalo.app",
  "appName": "Chalo",
  "webDir": "dist",
  "server": {
    "androidScheme": "http",
    "cleartext": true
  },
  "plugins": {
    "Geolocation": {
      "permissions": ["location"]
    }
  }
}
```

### 8.3 Android Permissions

```xml
<!-- AndroidManifest.xml -->
<application android:usesCleartextTraffic="true" ...>
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

---

## 9. Monitoring & Health Checks

### 9.1 Health Check Endpoint

```javascript
// server/index.js
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

The AWS load balancer periodically calls `/api/health` to verify the container is responsive. If the health check fails, ECS automatically replaces the task.

### 9.2 CloudWatch Logging

All `console.log` and `console.error` output from the container is automatically shipped to AWS CloudWatch Logs:

- **Log Group:** `/ecs/chalo-app`
- **Log Stream:** Per-container instance (prefixed with `ecs/`)
- **Retention:** Default (never expire)
- **Access:** Via AWS Console or AWS CLI

**Example CloudWatch query:**

```
# View recent server startup logs
fields @timestamp, @message
| filter @logStream like /ecs/
| sort @timestamp desc
| limit 20
```

### 9.3 Monitoring Stack

| Monitoring Aspect | Tool | Status |
|-------------------|------|--------|
| Container health | ECS health checks | Implemented |
| Application logs | CloudWatch Logs | Implemented |
| API uptime | `/api/health` endpoint | Implemented |
| Error tracking | Console logs | Manual |
| Performance metrics | CloudWatch Container Insights | Available (not enabled) |
| Alerting | CloudWatch Alarms | Available (not configured) |

---

## 10. Team Roles & Responsibilities

### 10.1 Team Structure (6 Members)

```
                    ┌──────────────┐
                    │  Project Lead │
                    │  (Member 1)   │
                    └──────┬───────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
     ┌──────▼──────┐ ┌────▼─────┐ ┌──────▼──────┐
     │  Frontend   │ │ Backend  │ │   DevOps    │
     │  (Member 2) │ │(Member 4)│ │ (Member 5)  │
     │  (Member 3) │ │(Member 6)│ │             │
     └─────────────┘ └──────────┘ └─────────────┘
```

### 10.2 Role Breakdown

| Role | Members | Responsibilities |
|------|---------|-----------------|
| **Frontend Developer** | Member 2, Member 3 | SPA development, UI/UX design, map integration (Leaflet), responsive layouts, Capacitor mobile build, AI chat widget UI |
| **Backend Developer** | Member 4 | Express API development, SQLite schema design, authentication (JWT), route/shuttle logic, AI chat endpoint |
| **DevOps Engineer** | Member 5 | Docker containerization, AWS infrastructure (ECS/ECR), CI/CD pipeline (GitHub Actions), environment configuration, monitoring setup |
| **AI/LLM Integration** | Member 6 | LLM API integration (OpenAI/Gemini), prompt engineering, context building from database, chat response optimization, API key management |
| **Project Lead / Full-Stack** | Member 1 | Architecture decisions, code review, feature prioritization, documentation, cross-team coordination |

### 10.3 Workflow & Collaboration

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEVELOPMENT WORKFLOW                         │
│                                                                  │
│  1. Feature Branch    ──►  Create branch from main               │
│  2. Develop & Test    ──►  Local dev + Docker testing            │
│  3. Code Review       ──►  Pull Request with team review         │
│  4. Merge to Main     ──►  Triggers CI/CD automatically         │
│  5. Auto Deploy       ──►  GitHub Actions → ECR → ECS           │
│  6. Verify            ──►  Health check + CloudWatch logs        │
└─────────────────────────────────────────────────────────────────┘
```

### 10.4 Git Branching Strategy

```
main (production) ────●────●────●────●────
                      │    │    │    │
feature/login    ──●──┘    │    │    │
feature/routes       ──●───┘    │    │
feature/chat             ──●────┘    │
bugfix/auth                 ──●─────┘
```

- `main` — production branch, protected, auto-deploys on push
- `feature/*` — individual feature branches
- `bugfix/*` — bug fix branches
- All merges via Pull Request with at least one reviewer

---

## 11. Cost Analysis

### 11.1 AWS Monthly Cost Breakdown

| Resource | Configuration | Monthly Cost |
|----------|--------------|-------------|
| ECS Fargate (compute) | 0.25 vCPU × 730 hrs | $7.39 |
| ECS Fargate (memory) | 512 MB × 730 hrs | $1.62 |
| ECR (container storage) | ~150 MB | $0.02 |
| CloudWatch Logs | ~500 MB/month | $0.25 |
| Data Transfer (outbound) | ~5 GB/month | $0.45 |
| **Total Infrastructure** | | **$9.73/month** |
| LLM API (Gemini Flash) | ~3M tokens/month | **$0.28/month** |
| **Grand Total** | | **$10.01/month** |

### 11.2 Cost Scaling Projections

| Users/Month | Compute (scale) | LLM API | Total/Month |
|-------------|----------------|---------|-------------|
| 0–100 | $9.73 (1 task) | $0.28 | ~$10 |
| 100–1,000 | $15–20 (2–3 tasks) | $1.50 | ~$20 |
| 1,000–10,000 | $40–60 (5–8 tasks) | $15 | ~$75 |
| 10,000+ | $100+ (10+ tasks) | $50+ | $150+ |

---

## 12. Conclusion

The CHALO project demonstrates a complete DevOps lifecycle for a cloud-native web application:

1. **Containerization with Docker** — Multi-stage builds produce optimized production images (~280 MB), with Docker Compose enabling one-command local development. The containerized approach ensures consistency across development, CI, and production environments.

2. **Cloud Deployment on AWS** — ECS Fargate provides serverless container hosting with no server management overhead. The ap-south-1 (Mumbai) region ensures low latency for Indian users while maintaining cost efficiency at ~$10/month.

3. **Automated CI/CD Pipeline** — GitHub Actions enables zero-downtime deployments triggered by code pushes. Every deployment is tagged with a Git commit SHA for full traceability, and the pipeline uses GitHub Secrets for secure credential management.

4. **Environment Variable Strategy** — Build-time variables (`VITE_*`) and runtime variables (`process.env.*`) are separated. Secrets are managed through GitHub Secrets and ECS task environment variables, never hardcoded in source code.

5. **LLM Integration for AI Features** — The upcoming AI-powered FAQ chat demonstrates how LLM APIs (OpenAI/Gemini) can be integrated into the existing architecture with minimal cost overhead (~$0.28/month) while significantly enhancing user experience.

6. **Team Collaboration** — A 6-member team structure with clear role boundaries (Frontend ×2, Backend ×2, DevOps ×1, AI Integration ×1) enables parallel development with a Git branching strategy and automated deployment pipeline.

The key takeaway is that **DevOps practices are not just about tools — they are about automation, consistency, and collaboration**. By containerizing the application, automating deployments, and managing secrets properly, the CHALO platform achieves reliable, scalable, and cost-effective cloud hosting that a student team can maintain.

---

## 13. References

1. Docker Documentation. (2025). "Multi-stage Builds." https://docs.docker.com/build/building/multi-stage/

2. Amazon Web Services. (2025). "Amazon ECS Documentation." https://docs.aws.amazon.com/ecs/

3. Amazon Web Services. (2025). "AWS Fargate — Serverless Compute for Containers." https://aws.amazon.com/fargate/

4. GitHub. (2025). "GitHub Actions Documentation." https://docs.github.com/en/actions

5. Ionic Team. (2025). "Capacitor — Cross-platform Native Runtime." https://capacitorjs.com/

6. OpenAI. (2025). "API Documentation — Chat Completions." https://platform.openai.com/docs/api-reference/chat

7. Google. (2025). "Gemini API Documentation." https://ai.google.dev/docs

8. Node.js. (2025). "Express.js — Fast, Unopinionated Web Framework." https://expressjs.com/

9. SQLite. (2025). "About SQLite." https://www.sqlite.org/about.html

10. AWS Pricing. (2025). "Amazon ECS Pricing — Asia Pacific (Mumbai)." https://aws.amazon.com/ecs/pricing/

---

*Report generated for DevOps & Cloud Computing — April 2026*
