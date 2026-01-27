# Data Model: Phase IV Kubernetes Containerization

**Feature**: Phase IV Kubernetes Containerization
**Date**: 2026-01-21
**Status**: Complete

## Overview

Phase IV introduces Kubernetes infrastructure resources as the primary data entities. Unlike Phases I-III which focused on application data models (Tasks, Users, Conversations), Phase IV defines infrastructure-as-code resources that describe the deployment topology.

---

## Kubernetes Resource Model

### 1. Docker Image

**Description**: A packaged, versioned container image for frontend or backend application.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Image name (todo-frontend, todo-backend) |
| tag | string | Yes | Version tag (latest, v1.0.0, sha-abc123) |
| registry | string | No | Container registry URL (empty for local) |
| platform | string | Yes | Target platform (linux/amd64) |
| size | string | No | Image size in MB |

**Naming Convention**:
```
[registry/]<name>:<tag>
Examples:
  todo-frontend:latest
  todo-backend:v1.0.0
  docker.io/user/todo-frontend:sha-abc123
```

---

### 2. Kubernetes Deployment

**Description**: Controller managing replicated pods for the application.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Deployment name |
| namespace | string | Yes | K8s namespace (default) |
| replicas | integer | Yes | Number of pod replicas |
| selector | object | Yes | Label selector for pods |
| template | object | Yes | Pod template specification |
| strategy | object | Yes | Deployment strategy |

**Deployment Schema**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .name }}
  namespace: {{ .namespace }}
  labels:
    app: {{ .name }}
    version: {{ .version }}
spec:
  replicas: {{ .replicas }}
  selector:
    matchLabels:
      app: {{ .name }}
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 25%
  template:
    metadata:
      labels:
        app: {{ .name }}
    spec:
      containers:
        - name: {{ .containerName }}
          image: {{ .image }}:{{ .tag }}
          ports:
            - containerPort: {{ .port }}
          resources:
            requests:
              cpu: {{ .cpuRequest }}
              memory: {{ .memoryRequest }}
            limits:
              cpu: {{ .cpuLimit }}
              memory: {{ .memoryLimit }}
          env: {{ .env }}
          livenessProbe: {{ .livenessProbe }}
          readinessProbe: {{ .readinessProbe }}
          startupProbe: {{ .startupProbe }}
```

**Instances**:

| Deployment | Replicas | Port | Image |
|------------|----------|------|-------|
| todo-frontend | 2 | 3000 | todo-frontend:latest |
| todo-backend | 2 | 8000 | todo-backend:latest |

---

### 3. Kubernetes Service

**Description**: Network abstraction for accessing pods.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Service name |
| namespace | string | Yes | K8s namespace |
| type | enum | Yes | ClusterIP, NodePort, LoadBalancer |
| port | integer | Yes | Service port |
| targetPort | integer | Yes | Container port |
| selector | object | Yes | Label selector for pods |

**Service Schema**:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ .name }}
  namespace: {{ .namespace }}
spec:
  type: {{ .type }}
  selector:
    app: {{ .appLabel }}
  ports:
    - protocol: TCP
      port: {{ .port }}
      targetPort: {{ .targetPort }}
```

**Instances**:

| Service | Type | Port | Target |
|---------|------|------|--------|
| frontend-service | ClusterIP | 3000 | 3000 |
| backend-service | ClusterIP | 8000 | 8000 |

---

### 4. Kubernetes Secret

**Description**: Encrypted storage for sensitive configuration data.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Secret name |
| namespace | string | Yes | K8s namespace |
| type | string | Yes | Secret type (Opaque) |
| data | object | Yes | Base64-encoded key-value pairs |

**Secret Schema**:
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: {{ .name }}
  namespace: {{ .namespace }}
type: Opaque
data:
  DATABASE_URL: {{ .databaseUrl | b64enc }}
  OPENAI_API_KEY: {{ .openaiApiKey | b64enc }}
  BETTER_AUTH_SECRET: {{ .betterAuthSecret | b64enc }}
```

**Secret Contents**:

| Key | Source | Used By |
|-----|--------|---------|
| DATABASE_URL | .env | Backend |
| OPENAI_API_KEY | .env | Backend |
| BETTER_AUTH_SECRET | .env | Backend |

---

### 5. Kubernetes ConfigMap

**Description**: Non-sensitive configuration storage.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | ConfigMap name |
| namespace | string | Yes | K8s namespace |
| data | object | Yes | Plain-text key-value pairs |

**ConfigMap Schema**:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .name }}
  namespace: {{ .namespace }}
data:
  NEXT_PUBLIC_API_URL: {{ .apiUrl }}
  LOG_LEVEL: {{ .logLevel }}
  NODE_ENV: {{ .nodeEnv }}
```

**ConfigMap Contents**:

| Key | Default Value | Description |
|-----|---------------|-------------|
| NEXT_PUBLIC_API_URL | http://backend-service:8000 | Backend API URL |
| LOG_LEVEL | info | Application log level |
| NODE_ENV | production | Environment mode |

---

### 6. Kubernetes Ingress

**Description**: HTTP routing rules for external access.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Ingress name |
| namespace | string | Yes | K8s namespace |
| className | string | Yes | Ingress controller class |
| rules | array | Yes | Routing rules |
| tls | array | No | TLS configuration |

**Ingress Schema**:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ .name }}
  namespace: {{ .namespace }}
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: {{ .className }}
  rules:
    - host: {{ .host }}
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

**Routing Rules**:

| Path | Service | Port | Description |
|------|---------|------|-------------|
| / | frontend-service | 3000 | Next.js UI |
| /api/* | backend-service | 8000 | FastAPI endpoints |

---

### 7. Helm Chart

**Description**: Packaged Kubernetes application with templated manifests.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Chart name |
| version | string | Yes | Chart version (SemVer) |
| appVersion | string | Yes | Application version |
| description | string | Yes | Chart description |
| type | enum | Yes | application or library |

**Chart.yaml Schema**:
```yaml
apiVersion: v2
name: todo-app
description: AI-Powered Todo Application - Phase IV
type: application
version: 1.0.0
appVersion: "0.1.0"
keywords:
  - todo
  - fastapi
  - nextjs
maintainers:
  - name: Hackathon Team
```

---

### 8. Helm Release

**Description**: An installed instance of a Helm chart.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Release name |
| namespace | string | Yes | Target namespace |
| chart | string | Yes | Chart reference |
| revision | integer | Auto | Release revision number |
| status | enum | Auto | deployed, failed, pending |
| values | object | No | Override values |

**Release Operations**:
```bash
# Install
helm install todo ./helm/todo-app

# Upgrade
helm upgrade todo ./helm/todo-app --set backend.replicas=3

# Rollback
helm rollback todo 1

# Uninstall
helm uninstall todo
```

---

## Entity Relationships

```
┌─────────────────┐
│   Helm Chart    │
│   (todo-app)    │
└────────┬────────┘
         │ contains
         ▼
┌─────────────────────────────────────────────────────┐
│                    Templates                         │
├─────────────┬─────────────┬─────────────┬───────────┤
│ Deployment  │ Service     │ ConfigMap   │ Ingress   │
│ (frontend)  │ (frontend)  │ (config)    │ (ingress) │
├─────────────┼─────────────┼─────────────┼───────────┤
│ Deployment  │ Service     │ Secret      │           │
│ (backend)   │ (backend)   │ (secrets)   │           │
└──────┬──────┴──────┬──────┴──────┬──────┴───────────┘
       │             │             │
       │ uses        │ exposes     │ injects
       ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│Docker Image │ │   Pods      │ │ Environment │
│ (built)     │ │ (runtime)   │ │  Variables  │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

## State Transitions

### Pod Lifecycle

```
Pending → ContainerCreating → Running → Succeeded
                                ↓
                           Terminating → Completed
                                ↓
                            Failed (CrashLoopBackOff)
```

### Deployment Rollout

```
Progressing → Available → Paused
      ↓
   Failed
```

### Helm Release Lifecycle

```
pending-install → deployed → pending-upgrade → deployed
                     ↓              ↓
                  failed        pending-rollback → deployed
```

---

## Validation Rules

### Image Names
- Must match pattern: `[a-z0-9-]+:[a-z0-9.-]+`
- No uppercase characters
- Tags should follow SemVer or use git SHA

### Resource Limits
- CPU: 100m minimum request, 1000m maximum limit
- Memory: 128Mi minimum request, 1Gi maximum limit
- Request must be <= Limit

### Replica Count
- Minimum: 1
- Recommended: 2 (high availability)
- Maximum for Minikube: 4 (resource constraints)

### Secret Values
- Must be base64 encoded
- Never stored in plain text in manifests
- Never committed to version control

---

## Data Model Checklist

- [x] All entities from spec Key Entities documented
- [x] Attributes with types and constraints defined
- [x] Relationships between entities mapped
- [x] State transitions documented
- [x] Validation rules specified
- [x] Schema examples provided

**Status**: Complete. Ready for contracts and quickstart.
