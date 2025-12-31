# Phase V Advanced Cloud Deployment Agent

## Purpose
Specialized agent for implementing Phase V: Advanced features with event-driven architecture (Kafka + Dapr) deployed to cloud Kubernetes (GKE/AKS/OKE).

## Scope
- Implement Advanced Level features (Recurring Tasks, Due Dates & Reminders)
- Implement Intermediate Level features (Priorities, Tags, Search, Filter, Sort)
- Event-driven architecture with Kafka
- Dapr integration for distributed runtime
- Cloud deployment (GKE/AKS/OKE)
- CI/CD with GitHub Actions

## Technology Stack

| Component | Technology |
|-----------|------------|
| Cloud Platform | GKE / AKS / OKE (Oracle free tier) |
| Event Streaming | Kafka (Redpanda Cloud / Strimzi) |
| Distributed Runtime | Dapr |
| Container Registry | Docker Hub / GCR / ACR |
| CI/CD | GitHub Actions |
| Monitoring | Prometheus + Grafana |

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                    KUBERNETES CLUSTER (Cloud)                   │
│                                                                 │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐       │
│  │  Frontend    │   │  Backend     │   │ Notification │       │
│  │  + Dapr      │──▶│  + Dapr      │──▶│  + Dapr      │       │
│  │  Sidecar     │   │  Sidecar     │   │  Sidecar     │       │
│  └──────────────┘   └──────┬───────┘   └──────┬───────┘       │
│                             │                  │               │
│                    ┌────────▼──────────────────▼─────┐         │
│                    │      Dapr Components            │         │
│                    │  - pubsub.kafka                 │         │
│                    │  - state.postgresql             │         │
│                    │  - jobs (reminders)             │         │
│                    │  - secretstores.kubernetes      │         │
│                    └────────┬────────────────────────┘         │
│                             │                                  │
│         ┌───────────────────┼────────────────┐                │
│         ▼                   ▼                ▼                │
│  ┌──────────┐     ┌──────────────┐   ┌──────────┐            │
│  │  Kafka   │     │   Neon DB    │   │ K8s      │            │
│  │ (Strimzi)│     │  (External)  │   │ Secrets  │            │
│  └──────────┘     └──────────────┘   └──────────┘            │
└────────────────────────────────────────────────────────────────┘
```

## Advanced Features

### Intermediate Level
1. **Priorities**: High, Medium, Low
2. **Tags/Categories**: Work, Home, Personal
3. **Search & Filter**: By keyword, status, priority, date
4. **Sort**: By due date, priority, created date

### Advanced Level
1. **Recurring Tasks**: Daily, Weekly, Monthly patterns
2. **Due Dates**: Date/time pickers
3. **Reminders**: Browser notifications, scheduled alerts

## Database Schema Additions

### Updated tasks table
```sql
ALTER TABLE tasks ADD COLUMN priority VARCHAR(10);  -- 'high', 'medium', 'low'
ALTER TABLE tasks ADD COLUMN tags TEXT[];           -- array of tags
ALTER TABLE tasks ADD COLUMN due_date TIMESTAMP;
ALTER TABLE tasks ADD COLUMN recurrence_pattern VARCHAR(20);  -- 'daily', 'weekly', 'monthly'
ALTER TABLE tasks ADD COLUMN reminder_time TIMESTAMP;
```

## Kafka Topics & Event Flow

### Topic: task-events
**Producer**: Backend (MCP Tools)
**Consumers**: Recurring Task Service, Audit Service

**Event Schema**:
```json
{
  "event_type": "created|updated|completed|deleted",
  "task_id": 123,
  "task_data": {...},
  "user_id": "user123",
  "timestamp": "2025-12-29T10:00:00Z"
}
```

### Topic: reminders
**Producer**: Backend (when due_date set)
**Consumer**: Notification Service

**Event Schema**:
```json
{
  "task_id": 123,
  "title": "Buy groceries",
  "due_at": "2025-12-30T14:00:00Z",
  "remind_at": "2025-12-30T13:45:00Z",
  "user_id": "user123"
}
```

### Topic: task-updates
**Producer**: Backend
**Consumer**: WebSocket Service (real-time sync)

## Dapr Integration

### Use Case 1: Pub/Sub (Kafka Abstraction)
```python
import httpx

# Publish via Dapr (no Kafka client needed)
await httpx.post(
    "http://localhost:3500/v1.0/publish/kafka-pubsub/task-events",
    json={
        "event_type": "created",
        "task_id": 1,
        "user_id": "user123"
    }
)
```

### Use Case 2: Dapr Jobs API (Scheduled Reminders)
```python
async def schedule_reminder(task_id: int, remind_at: datetime, user_id: str):
    """Schedule exact-time reminder using Dapr Jobs."""
    await httpx.post(
        f"http://localhost:3500/v1.0-alpha1/jobs/reminder-task-{task_id}",
        json={
            "dueTime": remind_at.isoformat(),
            "data": {
                "task_id": task_id,
                "user_id": user_id,
                "type": "reminder"
            }
        }
    )

@app.post("/api/jobs/trigger")
async def handle_job_trigger(request: Request):
    """Dapr calls this at scheduled time."""
    job_data = await request.json()

    if job_data["data"]["type"] == "reminder":
        # Publish to notification service
        await publish_event("reminders", "reminder.due", job_data["data"])

    return {"status": "SUCCESS"}
```

### Use Case 3: State Management
```python
# Save conversation state via Dapr
await httpx.post(
    "http://localhost:3500/v1.0/state/statestore",
    json=[{
        "key": f"conversation-{conv_id}",
        "value": {"messages": messages}
    }]
)
```

## Dapr Components Configuration

### pubsub.kafka
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kafka-pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: "kafka:9092"
    - name: consumerGroup
      value: "todo-service"
```

### state.postgresql
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.postgresql
  version: v1
  metadata:
    - name: connectionString
      secretKeyRef:
        name: db-secrets
        key: connection-string
```

### secretstores.kubernetes
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kubernetes-secrets
spec:
  type: secretstores.kubernetes
  version: v1
```

## Microservices Architecture

### 1. Backend Service (Main API)
- CRUD operations for tasks
- Publishes events to Kafka via Dapr
- Schedules reminders via Dapr Jobs

### 2. Notification Service
- Subscribes to "reminders" topic
- Sends push notifications / emails
- Stateless consumer

### 3. Recurring Task Service
- Subscribes to "task-events" topic
- When recurring task completed, creates next occurrence
- Uses Dapr state for tracking

### 4. Audit Service (Optional)
- Subscribes to "task-events" topic
- Maintains complete activity history
- Write-only service

## Kafka Setup Options

### Option 1: Strimzi (Self-Hosted on K8s)
```bash
# Install Strimzi operator
kubectl create namespace kafka
kubectl apply -f https://strimzi.io/install/latest?namespace=kafka

# Deploy Kafka cluster
kubectl apply -f - <<EOF
apiVersion: kafka.strimzi.io/v1beta2
kind: Kafka
metadata:
  name: todo-kafka
  namespace: kafka
spec:
  kafka:
    replicas: 1
    listeners:
      - name: plain
        port: 9092
        type: internal
    storage:
      type: ephemeral
  zookeeper:
    replicas: 1
    storage:
      type: ephemeral
EOF
```

### Option 2: Redpanda Cloud (Managed)
1. Sign up at redpanda.com/cloud
2. Create Serverless cluster (free tier)
3. Create topics: task-events, reminders, task-updates
4. Update Dapr component with bootstrap servers

## Cloud Deployment

### Google Cloud (GKE)
```bash
# Create cluster
gcloud container clusters create todo-cluster \
  --num-nodes=3 \
  --machine-type=e2-medium \
  --region=us-central1

# Get credentials
gcloud container clusters get-credentials todo-cluster

# Install Dapr
dapr init -k

# Deploy application
helm install todo ./helm
```

### Azure (AKS)
```bash
# Create cluster
az aks create \
  --name todo-cluster \
  --resource-group todo-rg \
  --node-count 3 \
  --generate-ssh-keys

# Get credentials
az aks get-credentials --name todo-cluster --resource-group todo-rg

# Install Dapr
dapr init -k

# Deploy
helm install todo ./helm
```

### Oracle Cloud (OKE - Free Tier)
```bash
# Create cluster via OCI console
# Always free: 4 OCPUs, 24GB RAM

# Configure kubectl
oci ce cluster create-kubeconfig --cluster-id <cluster-ocid>

# Install Dapr
dapr init -k

# Deploy
helm install todo ./helm
```

## CI/CD Pipeline (GitHub Actions)

### .github/workflows/deploy.yml
```yaml
name: Deploy to Cloud

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Frontend
        run: |
          docker build -t ${{ secrets.REGISTRY }}/todo-frontend:${{ github.sha }} ./frontend
          docker push ${{ secrets.REGISTRY }}/todo-frontend:${{ github.sha }}

      - name: Build Backend
        run: |
          docker build -t ${{ secrets.REGISTRY }}/todo-backend:${{ github.sha }} ./backend
          docker push ${{ secrets.REGISTRY }}/todo-backend:${{ github.sha }}

      - name: Deploy to Kubernetes
        run: |
          helm upgrade --install todo ./helm \
            --set frontend.image.tag=${{ github.sha }} \
            --set backend.image.tag=${{ github.sha }}
```

## Monitoring & Observability

### Prometheus + Grafana
```bash
# Install monitoring stack
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install monitoring prometheus-community/kube-prometheus-stack

# Access Grafana
kubectl port-forward svc/monitoring-grafana 3000:80
```

### Dapr Dashboard
```bash
# Install Dapr dashboard
dapr dashboard -k

# Access at http://localhost:8080
```

## Acceptance Criteria

### Part A: Advanced Features
- ✅ Priorities (high/medium/low) implemented
- ✅ Tags/categories functional
- ✅ Search and filter working
- ✅ Sort by multiple criteria
- ✅ Recurring tasks auto-spawn
- ✅ Due dates with date/time picker
- ✅ Reminders via Dapr Jobs

### Part B: Local Deployment
- ✅ Kafka deployed on Minikube (Strimzi or Redpanda)
- ✅ Dapr installed and configured
- ✅ All services running with Dapr sidecars
- ✅ Event-driven flows working

### Part C: Cloud Deployment
- ✅ Deployed to GKE/AKS/OKE
- ✅ Kafka production-ready
- ✅ Dapr components configured
- ✅ CI/CD pipeline functional
- ✅ Monitoring enabled
- ✅ Public URL accessible

## Success Metrics
- All advanced features working
- Event-driven architecture operational
- Kafka message flow verified
- Dapr integration complete
- Cloud deployment successful
- CI/CD pipeline green
- <2s latency for operations
- Zero data loss during deployments

## Deliverables
- Updated codebase with advanced features
- Kafka event schemas documented
- Dapr components configuration
- Helm charts for cloud deployment
- GitHub Actions workflow
- Monitoring dashboards configured
- Complete deployment documentation
- Demo video showing all features
