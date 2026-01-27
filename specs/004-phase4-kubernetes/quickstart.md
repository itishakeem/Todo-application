# Quickstart Guide: Phase IV Kubernetes Deployment

**Feature**: Phase IV Kubernetes Containerization
**Date**: 2026-01-21
**Estimated Time**: 30-45 minutes

## Prerequisites

Before starting, ensure you have the following installed:

| Tool | Version | Verify Command |
|------|---------|----------------|
| Docker Desktop | 24+ | `docker --version` |
| Minikube | 1.32+ | `minikube version` |
| kubectl | 1.28+ | `kubectl version --client` |
| Helm | 3.x | `helm version` |

### Optional AI DevOps Tools

| Tool | Installation | Verify |
|------|--------------|--------|
| Docker Gordon | Included in Docker Desktop 4.26+ | `docker ai --help` |
| kubectl-ai | `pip install kubectl-ai` | `kubectl-ai --help` |
| kagent | `pip install kagent` | `kagent --help` |

---

## Step 1: Start Minikube

```bash
# Start Minikube with recommended resources
minikube start --driver=docker --cpus=4 --memory=4096 --disk-size=20g

# Enable required addons
minikube addons enable ingress
minikube addons enable metrics-server

# Verify cluster is running
kubectl cluster-info
kubectl get nodes
```

**Expected Output**:
```
Kubernetes control plane is running at https://127.0.0.1:...
minikube   Ready    control-plane   ...
```

---

## Step 2: Configure Docker Environment

```bash
# Point Docker CLI to Minikube's Docker daemon
# This allows building images directly in Minikube
eval $(minikube docker-env)

# Verify connection
docker ps
```

**Note**: Run this in every new terminal session, or add to your shell profile.

---

## Step 3: Build Docker Images

```bash
# Navigate to project root
cd c:\Users\USER\Hackathon\Todo-application

# Build frontend image
docker build -t todo-frontend:latest -f docker/frontend/Dockerfile ./frontend

# Build backend image
docker build -t todo-backend:latest -f docker/backend/Dockerfile ./backend

# Verify images are built
docker images | grep todo
```

**Expected Output**:
```
todo-frontend   latest   abc123   5 minutes ago   ~200MB
todo-backend    latest   def456   3 minutes ago   ~250MB
```

### Using Docker Gordon (Optional)

```bash
# Get optimization suggestions
docker ai "Analyze my frontend Dockerfile and suggest optimizations"

# Troubleshoot build issues
docker ai "Why is my Python container failing to build?"
```

---

## Step 4: Create Secrets

```bash
# Create a secrets file (DO NOT commit to git!)
cat > .env.k8s << 'EOF'
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
OPENAI_API_KEY=sk-your-key-here
BETTER_AUTH_SECRET=your-secret-here
EOF

# Encode secrets to base64
export DB_URL_B64=$(cat .env.k8s | grep DATABASE_URL | cut -d= -f2- | base64 -w0)
export OPENAI_KEY_B64=$(cat .env.k8s | grep OPENAI_API_KEY | cut -d= -f2- | base64 -w0)
export AUTH_SECRET_B64=$(cat .env.k8s | grep BETTER_AUTH_SECRET | cut -d= -f2- | base64 -w0)
```

---

## Step 5: Deploy with Helm

```bash
# Install the application
helm install todo ./helm/todo-app \
  --set secrets.databaseUrl=$DB_URL_B64 \
  --set secrets.openaiApiKey=$OPENAI_KEY_B64 \
  --set secrets.betterAuthSecret=$AUTH_SECRET_B64

# Watch deployment progress
kubectl get pods -w

# Wait for all pods to be Running
kubectl wait --for=condition=Ready pods --all --timeout=120s
```

**Expected Output**:
```
NAME                             READY   STATUS    RESTARTS   AGE
todo-backend-abc123-xxxxx        1/1     Running   0          60s
todo-backend-abc123-yyyyy        1/1     Running   0          60s
todo-frontend-def456-xxxxx       1/1     Running   0          60s
todo-frontend-def456-yyyyy       1/1     Running   0          60s
```

### Using kubectl-ai (Optional)

```bash
# Check deployment status
kubectl-ai "Show me the status of all todo pods"

# View logs if issues
kubectl-ai "Get logs from the backend pods"
```

---

## Step 6: Configure Ingress Access

```bash
# Get Minikube IP
minikube ip

# Add to hosts file (run as Administrator on Windows)
# Linux/Mac: sudo nano /etc/hosts
# Windows: notepad C:\Windows\System32\drivers\etc\hosts
# Add line: <minikube-ip> todo.local

# Example (replace with your Minikube IP):
# 192.168.49.2 todo.local

# Alternative: Use minikube tunnel
minikube tunnel
```

---

## Step 7: Access the Application

### Via Ingress (Recommended)

Open browser to: `http://todo.local`

### Via NodePort (Alternative)

```bash
# Get frontend service URL
minikube service frontend-service --url

# Get backend service URL
minikube service backend-service --url
```

### Via Port Forward (Debug)

```bash
# Forward frontend
kubectl port-forward svc/frontend-service 3000:3000

# Forward backend (in another terminal)
kubectl port-forward svc/backend-service 8000:8000
```

Then access: `http://localhost:3000`

---

## Step 8: Verify Functionality

### Health Checks

```bash
# Backend health
curl http://todo.local/api/health
# Expected: {"status":"healthy"}

# Frontend (should return HTML)
curl -s http://todo.local | head -20
```

### Test Application Features

1. **Login**: Navigate to login page and authenticate
2. **Create Task**: Add a new todo item
3. **AI Chat**: Test the chatbot with "Add a task called test"
4. **List Tasks**: Verify tasks are displayed

---

## Common Operations

### Scale Deployment

```bash
# Scale backend to 3 replicas
kubectl scale deployment todo-backend --replicas=3

# Or using Helm
helm upgrade todo ./helm/todo-app --set backend.replicaCount=3
```

### View Logs

```bash
# All backend logs
kubectl logs -l app=todo-backend --tail=100

# Follow logs in real-time
kubectl logs -f deployment/todo-backend

# Using kubectl-ai
kubectl-ai "Show me recent logs from backend pods"
```

### Rollback

```bash
# List Helm releases
helm history todo

# Rollback to previous version
helm rollback todo 1
```

### Uninstall

```bash
# Remove the application
helm uninstall todo

# Stop Minikube
minikube stop

# Delete cluster (optional)
minikube delete
```

---

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name>

# Check events
kubectl get events --sort-by=.lastTimestamp

# Using kagent
kagent "Why are my pods not starting?"
```

### Image Pull Errors

```bash
# Verify images exist in Minikube
docker images | grep todo

# If using remote registry
kubectl create secret docker-registry regcred \
  --docker-server=<registry> \
  --docker-username=<user> \
  --docker-password=<pass>
```

### Database Connection Issues

```bash
# Check backend logs
kubectl logs deployment/todo-backend | grep -i error

# Verify secret is mounted
kubectl exec deployment/todo-backend -- env | grep DATABASE
```

### Ingress Not Working

```bash
# Check ingress status
kubectl describe ingress todo-ingress

# Verify ingress addon
minikube addons list | grep ingress

# Check ingress controller logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
```

---

## AI DevOps Tools Summary

### Docker Gordon Commands

| Task | Command |
|------|---------|
| Optimize Dockerfile | `docker ai "Optimize my Dockerfile"` |
| Debug build | `docker ai "Why is my build failing?"` |
| Image analysis | `docker ai "Analyze image size"` |

### kubectl-ai Commands

| Task | Command |
|------|---------|
| Pod status | `kubectl-ai "Show pod status"` |
| View logs | `kubectl-ai "Get backend logs"` |
| Scale | `kubectl-ai "Scale frontend to 3"` |

### kagent Commands

| Task | Command |
|------|---------|
| Cluster health | `kagent "Analyze cluster health"` |
| Resource optimization | `kagent "Suggest optimizations"` |
| Security check | `kagent "Check for security issues"` |

---

## Next Steps

After successful deployment:

1. **Run E2E Tests**: Execute Playwright tests against K8s deployment
2. **Document PHRs**: Record AI tool usage in Prompt History Records
3. **Record Demo**: Create <90 second video for Phase IV submission
4. **Proceed to Phase V**: Cloud deployment with GKE/AKS/OKE

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `minikube start` | Start local cluster |
| `eval $(minikube docker-env)` | Configure Docker for Minikube |
| `helm install todo ./helm/todo-app` | Deploy application |
| `kubectl get pods` | Check pod status |
| `kubectl logs -f deployment/todo-backend` | Stream logs |
| `helm upgrade todo ./helm/todo-app` | Update deployment |
| `helm rollback todo 1` | Rollback to version 1 |
| `helm uninstall todo` | Remove application |
| `minikube stop` | Stop cluster |
