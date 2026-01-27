# Minikube Deployment Guide

Phase IV - Tasks T044-T053

This guide covers deploying the Todo application to a local Minikube cluster.

## Prerequisites

- Minikube installed (`minikube version`)
- kubectl installed (`kubectl version --client`)
- Docker Desktop running
- All K8s manifests created in `k8s/` directory

## Step-by-Step Deployment

### T044: Start Minikube Cluster

```bash
# Start Minikube with recommended resources
minikube start --cpus=4 --memory=4096

# Verify cluster is running
minikube status
```

### T045: Enable Ingress Addon

```bash
# Enable nginx ingress controller
minikube addons enable ingress

# Verify ingress controller is running
kubectl get pods -n ingress-nginx
```

### T046: Configure Docker Environment

```bash
# Point Docker CLI to Minikube's Docker daemon
# PowerShell (Windows):
& minikube -p minikube docker-env --shell powershell | Invoke-Expression

# Bash (Linux/Mac):
eval $(minikube docker-env)

# Verify you're using Minikube's Docker
docker images
```

### T047: Build Images Inside Minikube

```bash
# Build frontend image
docker build -t todo-frontend:latest -f docker/frontend/Dockerfile ./frontend

# Build backend image
docker build -t todo-backend:latest -f docker/backend/Dockerfile ./backend

# Verify images exist
docker images | grep todo
```

### T048: Create Kubernetes Secrets

Before applying secrets, encode your actual values:

```bash
# Encode your secrets (replace with actual values)
# PowerShell:
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("your-database-url"))
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("your-openai-api-key"))
[Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("your-better-auth-secret"))

# Bash:
echo -n "your-database-url" | base64
echo -n "your-openai-api-key" | base64
echo -n "your-better-auth-secret" | base64
```

Create `k8s/secrets.local.yaml` with your encoded values (do NOT commit this file):

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: todo-secrets
type: Opaque
data:
  database-url: <base64-encoded-database-url>
  openai-api-key: <base64-encoded-openai-key>
  better-auth-secret: <base64-encoded-auth-secret>
```

### T049: Apply All Manifests

```bash
# Apply secrets first (use your local secrets file)
kubectl apply -f k8s/secrets.local.yaml

# Apply configmap
kubectl apply -f k8s/configmap.yaml

# Apply deployments
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml

# Apply services
kubectl apply -f k8s/frontend-service.yaml
kubectl apply -f k8s/backend-service.yaml

# Apply ingress
kubectl apply -f k8s/ingress.yaml

# Or apply all at once (except secrets.local.yaml)
kubectl apply -f k8s/
```

### T050: Verify Pod Status

```bash
# Check all pods are Running
kubectl get pods -w

# Expected output (wait for Ready 1/1):
# NAME                                   READY   STATUS    RESTARTS   AGE
# backend-deployment-xxx-xxx             1/1     Running   0          30s
# backend-deployment-xxx-xxx             1/1     Running   0          30s
# frontend-deployment-xxx-xxx            1/1     Running   0          30s
# frontend-deployment-xxx-xxx            1/1     Running   0          30s

# Check deployment rollout status
kubectl rollout status deployment/frontend-deployment
kubectl rollout status deployment/backend-deployment

# View pod logs if needed
kubectl logs -l component=backend --tail=50
kubectl logs -l component=frontend --tail=50
```

### T051: Test Service Access

```bash
# Get frontend service URL
minikube service frontend-service --url

# Get backend service URL
minikube service backend-service --url

# Test backend health endpoint
curl $(minikube service backend-service --url)/health
```

### T052: Configure Local DNS

Get Minikube IP and add to hosts file:

```bash
# Get Minikube IP
minikube ip

# Add to hosts file:
# Windows (run as Administrator): C:\Windows\System32\drivers\etc\hosts
# Linux/Mac: /etc/hosts

# Add this line (replace with actual Minikube IP):
192.168.49.2  todo.local
```

### T053: Verify Ingress Routing

```bash
# Test frontend via ingress
curl http://todo.local/

# Test backend API via ingress
curl http://todo.local/api/health

# Open in browser
open http://todo.local
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod events
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>

# Check secrets are applied
kubectl get secrets
kubectl describe secret todo-secrets
```

### Image Pull Errors

```bash
# Ensure you're using Minikube's Docker daemon
eval $(minikube docker-env)

# Rebuild images
docker build -t todo-frontend:latest -f docker/frontend/Dockerfile ./frontend
docker build -t todo-backend:latest -f docker/backend/Dockerfile ./backend
```

### Ingress Not Working

```bash
# Check ingress controller is running
kubectl get pods -n ingress-nginx

# Check ingress resource
kubectl describe ingress todo-ingress

# Try direct service access first
minikube service frontend-service --url
```

### Health Check Failures

```bash
# Check probe status
kubectl describe pod <pod-name> | grep -A 10 "Liveness\|Readiness\|Startup"

# Verify health endpoint works
kubectl exec <pod-name> -- curl localhost:8000/health
```

## Clean Up

```bash
# Delete all resources
kubectl delete -f k8s/

# Stop Minikube
minikube stop

# Delete cluster (optional)
minikube delete
```

## Quick Reference

| Resource | Command |
|----------|---------|
| Check pods | `kubectl get pods` |
| Check services | `kubectl get svc` |
| Check ingress | `kubectl get ingress` |
| View logs | `kubectl logs -l component=backend` |
| Describe pod | `kubectl describe pod <name>` |
| Dashboard | `minikube dashboard` |
