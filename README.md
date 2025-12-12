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
    <li><a href="#thesis-context">Thesis Context</a></li>
    <li><a href="#features">Features</a></li>
    <li><a href="#architecture">Architecture</a></li>
    <li><a href="#getting-started">Getting Started</a></li>
    <li><a href="#configuration">Configuration</a></li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#test-types">Test Types</a></li>
    <li><a href="#running-tests">Running Tests</a></li>
    <li><a href="#kubernetes-testing">Kubernetes Testing</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

______________________________________________________________________

<h2 id="about">🎯 About</h2>

This repository contains the **k6-based performance testing suite** example for the OpenCloudHub ML platform. It provides comprehensive testing capabilities across all platform services—from quick smoke tests validating service health to extended soak tests that uncover memory leaks and stability issues.

### Why Performance Testing?

Performance testing is critical for ML platforms where inference latency directly impacts user experience:

- **Validate Correctness**: Ensure services respond correctly under various load conditions
- **Catch Regressions**: Identify performance degradation before reaching production
- **Capacity Planning**: Understand system limits for infrastructure sizing
- **SLA Compliance**: Ensure ML model inference latency meets defined thresholds

### Key Capabilities

| Capability              | Description                                               |
| ----------------------- | --------------------------------------------------------- |
| **Multi-Type Testing**  | Smoke, load, stress, spike, soak, and breakpoint tests    |
| **Service Coverage**    | ML models, MLOps tools, infrastructure, and observability |
| **Kubernetes Native**   | Run tests inside the cluster using k6-operator            |
| **Grafana Integration** | Results tagged for dashboard filtering and analysis       |

______________________________________________________________________

<h2 id="thesis-context">📚 Thesis Context</h2>

### Purpose in the Thesis

This work demonstrates how k6 can be integrated for continuous performance validation, with results feeding into Grafana dashboards for trend analysis across deployments.


### Related Repositories

| Repository                                                                        | Purpose                                                               |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [`gitops`](https://github.com/OpenCloudHub/gitops/tree/main/src/platform/testing) | ArgoCD application definitions and Kubernetes manifests for the tests |  |
| **`api-testing`** (this repo)                                                     | Performance testing suite                                             |



______________________________________________________________________

<h2 id="features">✨ Features</h2>

- 🚀 **Multiple Test Types** — Smoke, load, stress, spike, soak, and breakpoint tests with predefined profiles
- 📊 **Service Categories** — Organized tests for ML models, MLOps, infrastructure, and observability services
- 🔧 **Reusable Helpers** — Common HTTP utilities, data loading, and check functions
- ⚙️ **Configurable Thresholds** — Per-test-type thresholds tuned for local Kind/Minikube clusters
- 📈 **Automatic Reporting** — JSON output with detailed metrics per test run
- 🏷️ **Grafana Tagging** — All requests tagged for dashboard filtering (testid, test_type, test_target)
- 🐳 **DevContainer Ready** — Works out of the box in VS Code DevContainers
- ☸️ **Kubernetes Native** — Run tests inside the cluster using k6-operator

______________________________________________________________________

<h2 id="architecture">🏗️ Architecture</h2>

### Execution Modes

Tests can run in two modes:

| Mode           | Command                                                                                  | Description                                                |
| -------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Local**      | `make smoke`                                                                             | Run k6 directly from DevContainer against cluster services |
| **In-Cluster** | Via [gitops repo](https://github.com/OpenCloudHub/gitops/tree/main/src/platform/testing) | k6-operator runs tests inside Kubernetes                   |

### Local Execution

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  DevContainer                                                               │
│  ┌──────────┐     ┌───────────────┐     ┌────────────────────────────┐      │
│  │  make    │───▶│  k6 Runtime   │───▶│  Services (via Ingress)    │      │
│  │  smoke   │     │               │     │  *.opencloudhub.org        │      │
│  └──────────┘     └───────┬───────┘     └────────────────────────────┘      │
│                           │                                                 │
│                           ▼                                                 │
│                   results/<timestamp>/                                      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### In-Cluster Execution (k6-operator)

For Kubernetes-native testing, the [gitops repo](https://github.com/OpenCloudHub/gitops/tree/main/src/platform/testing) manages TestRun CRDs that use this repo's Docker image:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Kubernetes Cluster                                                         │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐       │
│  │  k6-operator     │──▶│  k6 Runner Pod   │──▶│ Services         │       │
│  │                  │    │  (k6-tests image)│    │ (internal DNS)   │       │
│  └──────────────────┘    └────────┬─────────┘    └──────────────────┘       │
│                                   │                                         │
│                                   ▼                                         │
│                           Prometheus (metrics)                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

The Docker image (`opencloudhuborg/k6-tests`) packages all tests, config, and data from this repo.

### Component Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Test Suite                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   config/                    helpers/                    tests/             │
│   ├── environments.js        ├── checks.js              ├── 01-smoke/       │
│   │   (service URLs)         │   (assertions)           ├── 02-load/        │
│   ├── endpoints.js           ├── data.js                ├── 03-stress/      │
│   │   (API paths)            │   (test data)            ├── 04-spike/       │
│   └── thresholds.js          └── http.js                ├── 05-soak/        │
│       (SLA limits)               (requests)             └── 06-breakpoint/  │
│                                                                             │
│   data/                      scripts/                   results/            │
│   ├── fashion-mnist.json     └── summary.sh            └── <timestamp>/     │
│   ├── wine.json                 (aggregation)              (JSON output)    │
│   └── qwen-prompts.json                                                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

______________________________________________________________________

<h2 id="getting-started">🚀 Getting Started</h2>

### Prerequisites

| Requirement          | Purpose                              |
| -------------------- | ------------------------------------ |
| Docker               | Container runtime for DevContainer   |
| VS Code              | IDE with DevContainers extension     |
| OpenCloudHub Cluster | Target platform (Minikube or remote) |

### Setup Steps

**1. Clone the repository**

```bash
git clone https://github.com/opencloudhub/api-testing.git
cd api-testing
```

**2. Open in DevContainer** (Recommended)

Press `Ctrl+Shift+P` → `Dev Containers: Rebuild and Reopen in Container`

The DevContainer includes k6 pre-installed and configured.

**3. Configure /etc/hosts** (for local cluster)

Ensure your host machine has cluster IPs mapped:

```bash
cat /etc/hosts | grep opencloudhub
# Should show entries like:
# 192.168.49.2 mlflow.internal.opencloudhub.org
# 192.168.49.2 api.opencloudhub.org
```

**4. Verify Setup**

```bash
make help    # Show all make targets
make list    # List available test scripts
```

**5. Run First Test**

```bash
make smoke-platform-mlops  # Quick health check
```

______________________________________________________________________

<h2 id="configuration">⚙️ Configuration</h2>

### Environment URLs (`config/environments.js`)

Defines service URLs per environment. Two environments are supported:

| Environment | Use Case                  | URL Pattern                  |
| ----------- | ------------------------- | ---------------------------- |
| `dev`       | Local testing via ingress | `https://*.opencloudhub.org` |
| `internal`  | In-cluster testing        | `http://*.svc.cluster.local` |

```javascript
// Example: Switch environment
// CLI: TEST_ENV=internal make smoke

const ENVIRONMENTS = {
  dev: {
    models: { api: 'https://api.opencloudhub.org' },
    platform: {
      mlops: { mlflow: 'https://mlflow.internal.opencloudhub.org' }
    }
  },
  internal: {
    platform: {
      mlops: { mlflow: 'http://mlflow.mlops.svc.cluster.local:5000' }
    }
  }
};
```

### Thresholds (`config/thresholds.js`)

Performance thresholds and load profiles per test type:

| Metric                  | Smoke | Load  | Stress | Spike | Soak |
| ----------------------- | ----- | ----- | ------ | ----- | ---- |
| `http_req_failed`       | <10%  | <5%   | <10%   | <15%  | <5%  |
| `http_req_duration` p95 | <3s   | <2.5s | <4s    | <5s   | <3s  |
| `checks` pass rate      | >90%  | >90%  | >85%   | >80%  | >90% |

### Endpoints (`config/endpoints.js`)

Common endpoint patterns by service type:

```javascript
// Custom ML models (FastAPI)
export const CUSTOM_MODEL_ENDPOINTS = {
  health: '/health',
  info: '/info',
  predict: '/predict'
};

// Base LLM models (OpenAI-compatible)
export const BASE_MODEL_ENDPOINTS = {
  models: '/models',
  chat: '/chat/completions'
};
```

______________________________________________________________________

<h2 id="project-structure">📁 Project Structure</h2>

```
api-testing/
├── config/                    # Configuration files
│   ├── endpoints.js           # API endpoint patterns by service type
│   ├── environments.js        # Service URLs per environment (dev, internal)
│   └── thresholds.js          # Performance thresholds and load profiles
│
├── data/                      # Test data files
│   ├── fashion-mnist.json     # Image samples (784 pixels each)
│   ├── wine.json              # Wine feature samples (13 features)
│   ├── qwen-prompts.json      # LLM prompt samples
│   └── rag-queries.json       # RAG query samples
│
├── helpers/                   # Reusable test utilities
│   ├── checks.js              # Standardized k6 check functions
│   ├── data.js                # Data loading (SharedArray) utilities
│   └── http.js                # HTTP request wrappers with checks
│
├── tests/                     # Test scripts organized by type
│   ├── 01-smoke/              # Quick health validation (10s, 1 VU)
│   │   ├── apps/              # Team applications
│   │   ├── models/            # ML model tests
│   │   │   ├── base/          # Base LLM models (qwen)
│   │   │   └── custom/        # Custom models (fashion-mnist, wine)
│   │   └── platform/          # Platform services
│   │       ├── gitops.js      # ArgoCD
│   │       ├── infrastructure.js  # MinIO, pgAdmin
│   │       ├── mlops.js       # MLflow, Argo Workflows
│   │       └── observability.js   # Grafana
│   ├── 02-load/               # Normal traffic (~7.5 min, 10-50 VUs)
│   ├── 03-stress/             # Beyond normal (~18 min, 5-20 VUs)
│   ├── 04-spike/              # Traffic bursts (~2.5 min, 3-25 VUs)
│   ├── 05-soak/               # Extended duration (~34 min, 5 VUs)
│   └── 06-breakpoint/         # Find limits (~10 min, 10-100 req/s)
│
├── scripts/
│   └── summary.sh             # Results aggregation script
│
├── results/                   # Test output (gitignored)
│   └── <timestamp>/           # Per-run results
│       ├── smoke-*.json       # Full k6 output
│       └── smoke-*-summary.json  # Aggregated metrics
│
├── Dockerfile                 # Container image for k6-operator
├── Makefile                   # Test orchestration commands
└── README.md                  # This documentation
```

______________________________________________________________________

<h2 id="test-types">📊 Test Types</h2>

Different test types validate different aspects of system behavior:

| Test           | Duration | VUs          | Purpose                   | When to Use              |
| -------------- | -------- | ------------ | ------------------------- | ------------------------ |
| **Smoke**      | 10s      | 1            | Quick health validation   | After deployments, CI/CD |
| **Load**       | ~7.5m    | 10→50        | Normal traffic simulation | Capacity validation      |
| **Stress**     | ~18m     | 5→20         | Beyond normal capacity    | Find breaking points     |
| **Spike**      | ~2.5m    | 3→25         | Sudden traffic bursts     | Test auto-scaling        |
| **Soak**       | 34m+     | 5            | Extended duration         | Find memory leaks        |
| **Breakpoint** | ~10m     | 10→100 req/s | Increasing until failure  | Max capacity             |

### Smoke Tests 🔍

Quick validation that services are alive and responding correctly.

```bash
make smoke              # All services
make smoke-platform     # Platform services only
make smoke-fashion-mnist  # Single model
```

### Load Tests 📈

Simulate expected production traffic patterns with ramping VUs.

```bash
make load               # All load tests
make load-fashion-mnist # Single model (~7.5 minutes)
```

### Stress Tests 💪

Push beyond normal capacity to observe degradation behavior.

```bash
make stress-fashion-mnist  # ~18 minutes
```

### Spike Tests ⚡

Sudden traffic bursts to test resilience and recovery.

```bash
make spike-fashion-mnist  # ~2.5 minutes
```

### Soak Tests 🕐

Extended duration to find memory leaks and connection exhaustion.

```bash
make soak-fashion-mnist  # ~34 minutes
```

### Breakpoint Tests 🔥

Continuously increase load until the system fails.

```bash
make breakpoint-fashion-mnist  # ~10 minutes
```

______________________________________________________________________

<h2 id="running-tests">🏃 Running Tests</h2>

### Quick Commands

```bash
# Run all smoke tests (recommended first step)
make smoke

# Run by category
make smoke-platform      # MLOps, GitOps, Infrastructure, Observability
make smoke-models        # Fashion MNIST, Wine, Qwen

# Run specific service
make smoke-fashion-mnist
make smoke-platform-mlops

# Different environment
TEST_ENV=internal make smoke
```

### View Results

```bash
# Show summary of latest run
make summary

# Browse result files
ls results/

# View detailed JSON
cat results/20251203-120000/smoke-platform-mlops-summary.json | jq
```

### Available Targets

Run `make help` to see all available targets:

```
Test Types:
  smoke      - Quick health checks (10s)
  load       - Normal load (~9min)
  stress     - Beyond normal (~18min)
  spike      - Sudden bursts (~2.5min)
  soak       - Extended duration (~34min)
  breakpoint - Find limits (~10min)

Targets:
  smoke               Run all smoke tests
  smoke-platform      Platform smoke tests
  smoke-models        Model smoke tests
  load                Run all load tests
  ...
```

______________________________________________________________________

<h2 id="kubernetes-testing">☸️ Kubernetes Testing</h2>

For in-cluster testing, see the [gitops repo testing section](https://github.com/OpenCloudHub/gitops/tree/main/src/platform/testing) which manages:

- **k6-operator** deployment
- **TestRun CRDs** for each test
- **Makefile** for easy execution (`make smoke-fashion-mnist`)
- **Prometheus integration** for metrics export

The tests use the Docker image built from this repo (`opencloudhuborg/k6-tests`), which packages all test scripts, config, and data.

### Docker Image

```bash
# Build locally
docker build -t opencloudhuborg/k6-tests:latest .

# Image contents
/tests/
├── config/      # Environment configs
├── helpers/     # Test utilities
├── tests/       # Test scripts
└── data/        # Test data
```

______________________________________________________________________

<h2 id="contributing">👥 Contributing</h2>

Contributions are welcome! This project follows OpenCloudHub's contribution standards.

### Adding a New Test

1. **Add service URL** to `config/environments.js`
2. **Create test file** following existing patterns in `tests/`
3. **Add make target** to `Makefile`
4. **Test locally** before submitting

### Code Style

- Use descriptive check names for Grafana filtering
- Follow existing file structure and naming conventions
- Add JSDoc comments for exported functions
- Use helpers from `helpers/` for consistency

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Commit with descriptive messages
4. Open PR against `main`

See [Contributing Guidelines](https://github.com/opencloudhub/.github/blob/main/.github/CONTRIBUTING.md) for details.

______________________________________________________________________

<h2 id="license">📄 License</h2>

Distributed under the **Apache 2.0 License**. See [LICENSE](LICENSE) for details.

______________________________________________________________________

<h2 id="contact">📬 Contact</h2>

**OpenCloudHub** — [GitHub Organization](https://github.com/opencloudhub)

Project Link: [https://github.com/opencloudhub/api-testing](https://github.com/opencloudhub/api-testing)

<p align="right">(<a href="#readme-top">back to top</a>)</p>