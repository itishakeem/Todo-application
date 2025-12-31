# Phase IV Local Kubernetes Deployment Agent

## Purpose
Specialized agent for implementing Phase IV: Containerize and deploy Todo Chatbot to local Kubernetes (Minikube) using Docker, Helm, kubectl-ai, and kagent.

## Scope
- Containerize frontend and backend applications
- Create Helm charts for Kubernetes deployment
- Deploy to Minikube locally
- Use AI-assisted DevOps tools (Gordon, kubectl-ai, kagent)

## Technology Stack

| Component | Technology |
|-----------|------------|
| Containerization | Docker (Docker Desktop) |
| Docker AI | Gordon (Docker AI Agent) |
| Orchestration | Kubernetes (Minikube) |
| Package Manager | Helm Charts |
| AI DevOps | kubectl-ai, kagent |
| Application | Phase III Todo Chatbot |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MINIKUBE CLUSTER                          │
│                                                              │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐    │
│  │  Frontend    │   │  Backend     │   │  External    │    │
│  │  Deployment  │   │  Deployment  │   │  Services    │    │
│  │              │   │              │   │              │    │
│  │ - Next.js    │   │ - FastAPI    │   │ - Neon DB    │    │
│  │ - Replicas:2 │   │ - MCP Server │   │   (external) │    │
│  │              │   │ - Replicas:2 │   │              │    │
│  └──────┬───────┘   └──────┬───────┘   └──────────────┘    │
│         │                  │                                │
│  ┌──────▼──────────────────▼───────┐                        │
│  │       Ingress Controller        │                        │
│  └─────────────────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## Dockerfile Templates

### Frontend Dockerfile
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

### Backend Dockerfile
```dockerfile
FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0", "--port", "8000"]
```

## Helm Chart Structure

```
/helm
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── ingress.yaml
│   ├── configmap.yaml
│   └── secrets.yaml
```

## Kubernetes Resources

### Frontend Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: todo-frontend
  template:
    metadata:
      labels:
        app: todo-frontend
    spec:
      containers:
      - name: frontend
        image: todo-frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "http://backend-service:8000"
```

### Backend Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: todo-backend
  template:
    metadata:
      labels:
        app: todo-backend
    spec:
      containers:
      - name: backend
        image: todo-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: database-url
```

## AI-Assisted DevOps Tools

### Docker AI (Gordon)
```bash
# Check capabilities
docker ai "What can you do?"

# Build images
docker ai "Build optimized Docker images for Next.js and FastAPI apps"

# Troubleshoot
docker ai "Why is my container failing to start?"
```

### kubectl-ai
```bash
# Deploy applications
kubectl-ai "deploy the todo frontend with 2 replicas"

# Scale services
kubectl-ai "scale the backend to handle more load"

# Troubleshoot
kubectl-ai "check why the pods are failing"

# Debug
kubectl-ai "show me logs from failing backend pods"
```

### kagent
```bash
# Cluster health
kagent "analyze the cluster health"

# Optimize resources
kagent "optimize resource allocation for todo app"

# Security scan
kagent "check for security issues in deployments"
```

## Implementation Workflow

### Phase 1: Containerization
1. Create Dockerfiles for frontend and backend
2. Use Gordon: `docker ai "optimize my Dockerfiles for production"`
3. Build images locally
4. Test containers with docker-compose
5. Push to Docker Hub or local registry

### Phase 2: Helm Chart Creation
1. Use kubectl-ai to generate initial charts
2. `kubectl-ai "create helm chart for todo app with frontend and backend"`
3. Customize values.yaml with environment variables
4. Add secrets for DATABASE_URL, API keys
5. Configure ingress for external access

### Phase 3: Minikube Deployment
1. Start Minikube: `minikube start --cpus=4 --memory=8192`
2. Enable ingress: `minikube addons enable ingress`
3. Install Helm chart: `helm install todo ./helm`
4. Verify: `kubectl-ai "show me the status of todo app"`
5. Access: `minikube service todo-frontend`

### Phase 4: Validation
1. Check pod status: `kubectl get pods`
2. View logs: `kubectl logs -f deployment/todo-backend`
3. Test endpoints: `kubectl-ai "test the API endpoints"`
4. Use kagent: `kagent "validate the deployment is production-ready"`

## Configuration Management

### ConfigMap (Non-Sensitive)
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: todo-config
data:
  API_URL: "http://backend-service:8000"
  LOG_LEVEL: "info"
```

### Secrets (Sensitive)
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: todo-secrets
type: Opaque
data:
  database-url: <base64-encoded>
  openai-api-key: <base64-encoded>
  better-auth-secret: <base64-encoded>
```

## Networking

### Services
- **frontend-service**: ClusterIP, port 3000
- **backend-service**: ClusterIP, port 8000

### Ingress
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: todo-ingress
spec:
  rules:
  - host: todo.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 3000
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 8000
```

## Acceptance Criteria
- Dockerfiles created for frontend and backend
- Multi-stage builds for optimized images
- Helm chart with all necessary resources
- Successful deployment to Minikube
- All pods running and healthy
- Application accessible via ingress
- AI tools (Gordon, kubectl-ai, kagent) utilized
- Documentation for local setup

## Success Metrics
- Clean Docker images (<500MB for frontend, <200MB for backend)
- Helm chart follows best practices
- Zero-downtime deployment capability
- Proper resource limits and requests
- Health checks configured
- Logs accessible via kubectl

## Deliverables
- /docker directory with Dockerfiles
- /helm directory with Helm charts
- /k8s directory with raw manifests (optional)
- README-k8s.md with deployment instructions
- Screenshots/demo of working deployment
