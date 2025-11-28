<a id="readme-top"></a>

<!-- PROJECT LOGO & TITLE -->

<div align="center">
  <a href="https://github.com/opencloudhub">
  <picture>
    <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/opencloudhub/.github/main/assets/brand/assets/logos/primary-logo-light.svg">
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/opencloudhub/.github/main/assets/brand/assets/logos/primary-logo-dark.svg">
    <!-- Fallback -->
    <img alt="OpenCloudHub Logo" src="https://raw.githubusercontent.com/opencloudhub/.github/main/assets/brand/assets/logos/primary-logo-dark.svg" style="max-width:700px; max-height:175px;">
  </picture>
  </a>

<h1 align="center">API Testing Suite</h1>

<p align="center">
    Performance and reliability testing for OpenCloudHub platform using k6.<br />
    <a href="https://github.com/opencloudhub"><strong>Explore OpenCloudHub »</strong></a>
  </p>
</div>

______________________________________________________________________

<details>
  <summary>📑 Table of Contents</summary>
  <ol>
    <li><a href="#about">About</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#test-types">Test Types</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#running-tests">Running Tests</a></li>
    <li><a href="#kubernetes-testing">Running Tests in Kubernetes</a></li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#service-categories">Service Categories</a></li>
    <li><a href="#configuration">Configuration</a></li>
    <li><a href="#adding-new-tests">Adding New Tests</a></li>
    <li><a href="#troubleshooting">Troubleshooting</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

______________________________________________________________________

<h2 id="about">🧪 About</h2>

This repository contains the k6-based performance testing suite for the OpenCloudHub ML platform. It provides testing across all platform services, from quick smoke tests to soak tests that find memory leaks and stability issues.

**Why Performance Testing?**

- Validate services respond correctly under various load conditions
- Catch regressions before they reach production
- Understand system limits and capacity planning
- Ensure ML model inference latency meets SLAs

**Architecture:**
```
k6 Tests → Platform Services (Ingress) → Kubernetes Pods
    ↓
Results → JSON/Console Output → Analysis
```

______________________________________________________________________

<h2 id="features">✨ Features</h2>

- 🚀 **Multiple Test Types**: Smoke, load, stress, spike, soak, and breakpoint tests
- 📊 **Service Categories**: Organized tests for ML models, MLOps, infrastructure, and observability
- 🔧 **Reusable Helpers**: Common HTTP utilities and data loading functions
- ⚙️ **Configurable Thresholds**: Per-test-type thresholds tuned for local Kind clusters
- 📈 **Automatic Reporting**: JSON output with detailed metrics per test run
- 🐳 **DevContainer Ready**: Works out of the box in VS Code DevContainers
- ☸️ **Kubernetes Native**: Run tests inside the cluster using k6-operator

______________________________________________________________________

<h2 id="test-types">📊 Test Types</h2>

Different test types serve different purposes in validating system behavior:

| Test           | Duration | VUs    | Purpose                       | When to Use                         |
| -------------- | -------- | ------ | ----------------------------- | ----------------------------------- |
| **Smoke**      | 10s      | 1      | Quick health validation       | After deployments, CI/CD pipelines  |
| **Load**       | ~9m      | 5-10   | Normal traffic simulation     | Capacity validation                 |
| **Stress**     | ~8m      | 5-20   | Beyond normal capacity        | Find breaking points                |
| **Spike**      | ~3m      | 3-25   | Sudden traffic bursts         | Test auto-scaling, resilience       |
| **Soak**       | 30m+     | 5      | Extended duration             | Find memory leaks, stability issues |
| **Breakpoint** | ~10m     | 10-100 | Increasing load until failure | Determine max capacity              |

### Test Type Details

**🔍 Smoke Tests**

Quick validation that services are alive and responding. Run after every deployment.
```bash
make smoke                # All services
make smoke-fashion-mnist  # Single model
```

**📈 Load Tests**

Simulate expected production traffic patterns. Validates response times under normal conditions.
```bash
make load                 # All load tests
make load-fashion-mnist   # Single model
```

**💪 Stress Tests**

Push the system beyond normal capacity to find its limits and observe degradation behavior.
```bash
make stress-fashion-mnist
```

**📈 Spike Tests**

Sudden traffic bursts to test system resilience and recovery.
```bash
make spike-fashion-mnist
```

**🕐 Soak Tests**

Extended duration tests to find memory leaks, connection exhaustion, or gradual degradation.
```bash
make soak-fashion-mnist  # 30 min sustained load
```

**🔥 Breakpoint Tests**

Continuously increase load until the system fails to determine maximum capacity.
```bash
make breakpoint-fashion-mnist
```

______________________________________________________________________

<h2 id="getting-started">🚀 Getting Started</h2>

### Prerequisites

- Docker
- VS Code with DevContainers extension (recommended)
- Access to OpenCloudHub cluster (Minikube or remote)

### Setup

1. **Clone the repository**
```bash
   git clone https://github.com/opencloudhub/api-testing.git
   cd api-testing
```

2. **Open in DevContainer** (Recommended)

   VSCode: `Ctrl+Shift+P` → `Dev Containers: Rebuild and Reopen in Container`

   The DevContainer includes k6 pre-installed and configured.

3. **Configure /etc/hosts** (for local Minikube cluster)

   Ensure your host machine has the cluster IPs mapped:
```bash
   cat /etc/hosts | grep opencloudhub
   # Should show entries like:
   # 10.103.251.179 mlflow.internal.opencloudhub.org
   # 10.103.251.179 api.opencloudhub.org
```

4. **Verify Setup**
```bash
   make list    # Show available tests
   make help    # Show all make targets
```

______________________________________________________________________

<h2 id="running-tests">🏃 Running Tests</h2>

All tests are run via `make` commands. Results are saved to `results/<timestamp>/`.

### Quick Commands
```bash
# Run all smoke tests (recommended first step)
make smoke

# Run specific category
make smoke-platform      # All platform services
make smoke-models        # All ML models

# Run specific service
make smoke-fashion-mnist
make smoke-platform-mlops

# Run load tests
make load
make load-fashion-mnist

# Run stress/spike/soak/breakpoint
make stress-fashion-mnist
make spike-fashion-mnist
make soak-fashion-mnist
make breakpoint-fashion-mnist
```

### Environment Selection
```bash
# Use different environment (default: dev)
TEST_ENV=prod make smoke

# Available environments: dev, cluster
```

### Viewing Results
```bash
# Show summary of latest test run
make summary

# Results are saved with timestamps
ls results/

# View summary JSON
cat results/2025-11-28_00-38-37/smoke-fashion-mnist-summary.json | jq
```

______________________________________________________________________

<h2 id="kubernetes-testing">☸️ Running Tests in Kubernetes</h2>

Tests can run inside the Kubernetes cluster using the [k6-operator](https://grafana.com/docs/k6/latest/set-up/set-up-distributed-k6/usage/executing-k6-scripts-with-testrun-crd/). This enables:

- Testing internal services without ingress exposure
- Distributed load testing across multiple pods
- Integration with ArgoCD hooks for post-deployment validation
- Results visible in Grafana dashboards

### Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│ Kubernetes Cluster                                              │
│                                                                 │
│  ┌──────────────┐     ┌──────────────┐     ┌────────────────┐  │
│  │ k6-operator  │────▶│ TestRun CRD  │────▶│ k6 Runner Pod  │  │
│  └──────────────┘     └──────────────┘     └───────┬────────┘  │
│                                                     │           │
│                              ┌──────────────────────┘           │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────────┐
│  │ Target Services (internal DNS)                              │
│  │ • mlflow.mlops.svc.cluster.local                            │
│  │ • argocd-server.argocd.svc.cluster.local                    │
│  │ • grafana.observability.svc.cluster.local                   │
│  └─────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

### Prerequisites

1. **k6-operator** installed in the cluster (managed via [gitops repo](https://github.com/opencloudhub/gitops) at `src/platform/testing/k6-operator/`)
2. **k6-tests image** built and pushed to Docker Hub

### How It Works

Tests are packaged into a container image that the k6-operator pulls and executes:
```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  api-testing    │      │   Docker Hub    │      │   k6-operator   │
│  repo           │─────▶│   k6-tests      │◀─────│   TestRun CRD   │
│  (CI builds)    │ push │   image         │ pull │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

**Test Image Structure:**
```dockerfile
FROM grafana/k6:latest
COPY config/ /tests/config/
COPY helpers/ /tests/helpers/
COPY tests/ /tests/tests/
COPY data/ /tests/data/
WORKDIR /tests
```

CI automatically builds and pushes on changes to the `main` branch.

### TestRun CRDs

TestRun custom resources are defined in the [gitops repo](https://github.com/opencloudhub/gitops) under `src/platform/testing/k6-tests/`. Example:
```yaml
apiVersion: k6.io/v1alpha1
kind: TestRun
metadata:
  name: smoke-platform-mlops
  namespace: k6-testing
spec:
  parallelism: 1
  script:
    localFile: /tests/tests/01-smoke/platform/mlops.js
  arguments: --insecure-skip-tls-verify
  cleanup: post
  runner:
    image: docker.io/opencloudhub/k6-tests:latest
    env:
      - name: TEST_ENV
        value: "cluster"
    resources:
      limits:
        cpu: 200m
        memory: 256Mi
      requests:
        cpu: 100m
        memory: 128Mi
```

### Running Tests in Cluster

**Manual execution:**
```bash
# Apply a TestRun
kubectl apply -f src/platform/testing/k6-tests/smoke-platform-mlops.yaml

# Watch logs
kubectl logs -f -l app=k6 -n k6-testing

# Check status
kubectl get testruns -n k6-testing

# Clean up (if cleanup: post is not set)
kubectl delete testrun smoke-platform-mlops -n k6-testing
```

### Cluster Environment

When running inside the cluster, tests use internal service DNS. The `cluster` environment is configured in `config/environments.js`:
```javascript
cluster: {
  platform: {
    mlops: {
      mlflow: 'http://mlflow.mlops.svc.cluster.local:5000',
    },
    gitops: {
      argocd: 'http://argocd-server.argocd.svc.cluster.local',
    },
  },
}
```

Set `TEST_ENV=cluster` in the TestRun's runner env to use these URLs.

### Available TestRuns

| TestRun                 | Target                   | Description            |
| ----------------------- | ------------------------ | ---------------------- |
| `smoke-platform-mlops`  | MLflow, Argo Workflows   | MLOps services health  |
| `smoke-platform-gitops` | ArgoCD                   | GitOps services health |
| `smoke-platform-infra`  | MinIO, pgAdmin           | Infrastructure health  |
| `smoke-platform-obs`    | Grafana                  | Observability health   |
| `smoke-fashion-mnist`   | Fashion MNIST classifier | Model inference smoke  |
| `smoke-wine`            | Wine classifier          | Model inference smoke  |
| `smoke-qwen`            | Qwen LLM                 | LLM inference smoke    |

______________________________________________________________________

<h2 id="project-structure">📁 Project Structure</h2>
```
```

______________________________________________________________________

<h2 id="service-categories">🏷️ Service Categories</h2>

Tests are organized by service category to allow targeted testing:

### ML Models (`tests/*/models/`)

ML inference services with standard endpoints. Tested with actual prediction data.

| Model             | Type       | Endpoints                                      | Test Data                 |
| ----------------- | ---------- | ---------------------------------------------- | ------------------------- |
| **fashion-mnist** | Custom     | `/health`, `/info`, `/predict`                 | `data/fashion-mnist.json` |
| **wine**          | Custom     | `/health`, `/info`, `/predict`                 | `data/wine.json`          |
| **qwen-0.5b**     | Base (LLM) | `/models`, `/completions`, `/chat/completions` | `data/qwen-prompts.json`  |

**Endpoints tested:**

- `GET /` - Service info
- `GET /health` - Health check with model status
- `GET /info` - Model metadata (URI, version, classes)
- `POST /predict` - Actual predictions with test data

### Platform Services (`tests/*/platform/`)

Infrastructure and tooling services. Health checks only (no data payloads).

| Category           | Services               | Purpose                                     |
| ------------------ | ---------------------- | ------------------------------------------- |
| **MLOps**          | MLflow, Argo Workflows | Experiment tracking, workflow orchestration |
| **GitOps**         | ArgoCD                 | Deployment management                       |
| **Infrastructure** | MinIO, pgAdmin         | Object storage, database admin              |
| **Observability**  | Grafana                | Monitoring dashboards                       |

### Team Applications (`tests/*/apps/`)

Custom applications built on the platform.

| App              | Endpoints                            |
| ---------------- | ------------------------------------ |
| **demo-backend** | `/api/`, `/api/health`, `/api/query` |

______________________________________________________________________

<h2 id="configuration">⚙️ Configuration</h2>

### Service URLs (`config/environments.js`)

Define service URLs per environment:
```javascript
const ENVIRONMENTS = {
  dev: {
    insecureSkipTLSVerify: true,
    models: {
      api: 'https://api.opencloudhub.org',
      custom: {
        'fashion-mnist': {
          path: '/models/custom/fashion-mnist-classifier',
        },
      },
    },
    platform: {
      mlops: {
        mlflow: 'https://mlflow.internal.opencloudhub.org',
      },
    },
  },
  cluster: {
    insecureSkipTLSVerify: true,
    platform: {
      mlops: {
        mlflow: 'http://mlflow.mlops.svc.cluster.local:5000',
      },
    },
  },
};
```

### Load Profiles (`config/thresholds.js`)

Adjust VUs and thresholds per test type:
```javascript
export const LOAD_PROFILES = {
  smoke: { vus: 1, duration: '10s' },
  load: {
    stages: [
      { duration: '1m', target: 5 },
      { duration: '3m', target: 5 },
      { duration: '1m', target: 0 },
    ],
  },
};

export const THRESHOLDS = {
  smoke: {
    http_req_failed: ['rate<0.10'],
    http_req_duration: ['p(95)<3000'],
    checks: ['rate>0.90'],
  },
};
```

### Endpoints (`config/endpoints.js`)

Common endpoint patterns by service type:
```javascript
export const CUSTOM_MODEL_ENDPOINTS = {
  root: '/',
  health: '/health',
  info: '/info',
  predict: '/predict',
};
```

______________________________________________________________________

<h2 id="adding-new-tests">🎨 Adding New Tests</h2>

### Adding a New ML Model

1. **Add to environments.js:**
```javascript
   custom: {
     'my-model': {
       path: '/models/custom/my-model',
     },
   },
```

2. **Add test data:**
```bash
   cat > data/my-model.json << EOF
   [
     {"feature1": 1.0, "feature2": 2.0},
     {"feature1": 1.5, "feature2": 2.5}
   ]
   EOF
```

3. **Create test file:**
```bash
   cp tests/01-smoke/models/custom/fashion-mnist.js \
      tests/01-smoke/models/custom/my-model.js
   # Edit to use 'my-model' instead of 'fashion-mnist'
```

4. **Add to Makefile:**
```makefile
   .PHONY: smoke-my-model
   smoke-my-model: $(RUN_DIR)
   	$(K6) tests/01-smoke/models/custom/my-model.js \
   		--out json=$(RUN_DIR)/smoke-my-model.json \
   		--summary-export=$(RUN_DIR)/smoke-my-model-summary.json
```

5. **Add TestRun for Kubernetes (optional):**

   Create `smoke-my-model.yaml` in the gitops repo under `src/platform/testing/k6-tests/`.

### Adding a New Platform Service

1. **Add to environments.js:**
```javascript
   platform: {
     myservice: {
       'my-service': 'https://my-service.internal.opencloudhub.org',
     },
   },
```

2. **Add endpoints to endpoints.js:**
```javascript
   'my-service': {
     root: '/',
     health: '/health',
   },
```

3. **Create test file following existing patterns.**

______________________________________________________________________

<h2 id="troubleshooting">🐛 Troubleshooting</h2>

### Connection Errors
```bash
# Verify service is accessible
curl -k https://mlflow.internal.opencloudhub.org/

# Check /etc/hosts has correct IP
cat /etc/hosts | grep opencloudhub

# Verify in devcontainer (should use host network)
nslookup mlflow.internal.opencloudhub.org
```

### TLS Errors

Ensure `insecureSkipTLSVerify: true` in `config/environments.js` for local dev.

### Data Loading Errors
```bash
# Verify data files exist and are valid JSON
ls -lh data/
jq . data/fashion-mnist.json | head -20
```

### Slow Performance (Kind)

- Reduce VUs in `config/thresholds.js`
- Increase timeout thresholds
- Allocate more resources to Kind cluster

### Test Not Found
```bash
# List available tests
make list

# Check test file exists
ls tests/01-smoke/models/custom/
```

### Kubernetes TestRun Issues
```bash
# Check operator is running
kubectl get pods -n k6-testing

# Check TestRun status
kubectl describe testrun smoke-platform-mlops -n k6-testing

# Check runner pod logs
kubectl logs -l app=k6 -n k6-testing

# Verify image is accessible
kubectl run test --image=opencloudhub/k6-tests:latest --rm -it -- ls /tests/
```

______________________________________________________________________

<h2 id="contributing">👥 Contributing</h2>

Contributions are welcome! This project follows OpenCloudHub's contribution standards.

**Adding Tests:**

1. Follow existing file structure and naming conventions
2. Use helpers from `helpers/http.js` and `helpers/data.js`
3. Add make target for new tests
4. Test locally before submitting
5. Add TestRun CRD for Kubernetes execution if applicable

Please see our [Contributing Guidelines](https://github.com/opencloudhub/.github/blob/main/.github/CONTRIBUTING.md) and [Code of Conduct](https://github.com/opencloudhub/.github/blob/main/.github/CODE_OF_CONDUCT.md) for more details.

______________________________________________________________________

<h2 id="license">📄 License</h2>

Distributed under the Apache 2.0 License. See [LICENSE](LICENSE) for more information.

______________________________________________________________________

<h2 id="acknowledgements">🙏 Acknowledgements</h2>

- [k6](https://k6.io/) - Modern load testing tool
- [k6-operator](https://github.com/grafana/k6-operator) - Kubernetes operator for k6
- [Grafana](https://grafana.com/) - Visualization and monitoring
- [Ray Serve](https://docs.ray.io/en/latest/serve/) - ML model serving

<p align="right">(<a href="#readme-top">back to top</a>)</p>