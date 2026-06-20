# AWS Operations Dashboard

An enterprise-grade, high-performance web dashboard designed to simulate and monitor real-time infrastructure metrics. This application is optimized for AWS portfolio screenshots and demonstrates realistic application activity for CloudWatch dashboards, Application Load Balancer (ALB) health checks, Auto Scaling group actions, and RDS monitoring.

## 🚀 Features

1. **Operations Overview**: Real-time stats (Total Employees, Total Departments, DB Record Count, System Health) alongside live rolling graphs for CPU/Memory utilization, department distribution, and hiring scale.
2. **Employee Registry**: Full CRUD support (Create, Read, Update, Delete) containing fields for Name, Email, Department assignment, Salary, and Status.
3. **Department Directory**: Full CRUD support tracking Name, Manager, and Fiscal budget allocations.
4. **Operations Stress Center**:
   - **CPU Stress Generator**: Spawns multiple worker threads to run intensive math loops for 10-300 seconds, raising the instance CPU utilization to 85%-99% without blocking Express's event loop (meaning `/health` checks continue to respond).
   - **Database Stress (Bulk SQL)**: Performs high-speed multi-row bulk insertions of configurable counts (100 to 10,000 employees) to simulate active write IOPS.
   - **Health Probe Diagnostic**: Simulates Application Load Balancer (ALB) checks by querying the `/health` endpoint and returning raw headers/payload.
5. **AWS Metadata Integration**: Actively queries the Link-Local IMDSv2 metadata service (`169.254.169.254`) on EC2 to fetch Instance ID and Availability Zone details, falling back to local configurations during local/mock runs.

---

## 🛠 Technology Stack

- **Frontend**: React (Vite), TailwindCSS (AWS Dark/Orange UI theme), Chart.js (with `react-chartjs-2`), Axios.
- **Backend**: Node.js, Express, `mysql2` (promise pools), `worker_threads` (for CPU loading).
- **Database**: MySQL 8.0.
- **Orchestration**: Docker, Docker Compose (Multi-stage build).

---

## 📁 Repository Structure

```
root/
├── frontend/             # React + Vite application
│   ├── src/              # Views and components
│   ├── package.json      # Frontend package configuration
│   └── vite.config.js    # Dev proxies for backend (port 5000)
├── backend/              # Node.js + Express API server
│   ├── config/           # Database pool connector
│   ├── routes/           # REST endpoints (health, CRUD, operations)
│   ├── workers/          # Multi-threaded CPU stress script
│   └── package.json      # Backend package configuration
├── Dockerfile            # Multi-stage production build (builds UI -> runs Node)
├── docker-compose.yml    # App and MySQL service containers
├── database.sql          # Seed DB tables and corporate records
├── package.json          # Root concurrently scripts
└── .env.example          # Sample environment key/values
```

---

## 📦 Getting Started

### Option 1: Docker Compose (Recommended)

To launch the database and the dashboard together, run:

```bash
docker-compose up -d --build
```

- Access the dashboard at: **`http://localhost:3000`**
- The database port `3306` is exposed on the host for inspection.
- The app automatically starts once the database passes its internal healthcheck ping.

### Option 2: Local Development (Separate processes)

1. **Prerequisites**: Ensure you have Node.js 18+ and a local MySQL instance running.
2. **Database Setup**: Execute the `database.sql` file in your MySQL terminal to initialize tables and populate sample seeds.
3. **Environment setup**: Copy `.env.example` to `.env` in the root (and in `backend/` if launching separately), adjusting MySQL details:
   ```bash
   cp .env.example .env
   ```
4. **Install all dependencies**: Run the utility installer script from the root folder:
   ```bash
   npm run install:all
   ```
5. **Start Dev Servers**: Spin up both the Express server (port 5000) and the Vite app (port 5173 with automatic backend proxying) simultaneously:
   ```bash
   npm run dev
   ```
6. Open **`http://localhost:5173`** in your browser.

---

## ☁️ Production AWS Deployment Architecture

This application is built for target deployment on AWS:

1. **Database Tier**: RDS MySQL Multi-AZ database instance inside isolated database subnets.
2. **Compute Tier**: EC2 instances managed by an **Auto Scaling Group (ASG)** spanning multiple Availability Zones.
3. **Traffic Layer**: **Application Load Balancer (ALB)** distributing HTTP requests across port 3000 targets.
4. **Health Monitoring**: ALB routes `/health` checks to instances. If CPU spikes, ASG scaling policies check metrics. Since stress events use secondary threads, the server remains responsive to health checks, avoiding premature EC2 terminations!
