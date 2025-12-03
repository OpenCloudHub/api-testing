// =============================================================================
// Environment Configuration
// =============================================================================
//
// Defines base URLs for all services organized by environment and category.
// Supports multiple deployment targets: external routes (dev) and internal
// Kubernetes service DNS (internal/cluster).
//
// Environments
// ------------
// - dev      : External HTTPS routes through ingress (default)
// - internal : Direct Kubernetes service DNS (for in-cluster testing)
//
// Service Categories
// ------------------
// - models.custom       : Custom ML models (fashion-mnist, wine)
// - models.base         : Base LLM models (qwen-0.5b)
// - platform.mlops      : MLflow, Argo Workflows
// - platform.gitops     : ArgoCD
// - platform.infra      : MinIO, pgAdmin
// - platform.obs        : Grafana
// - apps                : Demo applications
//
// Usage
// -----
// Set environment via CLI: k6 run -e TEST_ENV=internal script.js
// Access in tests:
//   import { ENV, getCustomModelUrl } from '../config/environments.js';
//   const mlflowUrl = ENV.platform.mlops.mlflow;
//
// See Also
// --------
// - config/endpoints.js  : Endpoint path patterns
// - config/thresholds.js : Performance thresholds
// =============================================================================

// Get target environment from k6 CLI argument (defaults to 'dev')
const TEST_ENV = __ENV.TEST_ENV || 'dev';

const ENVIRONMENTS = {
  // ===========================================================================
  // DEV - External HTTPS routes (validates full user path)
  // Used for both local testing and in-cluster k6-operator runs
  // ===========================================================================
  dev: {
    insecureSkipTLSVerify: true,

    // Models - path-based routing on api gateway
    models: {
      api: 'https://api.opencloudhub.org',
      custom: {
        'fashion-mnist': {
          path: '/models/custom/fashion-mnist-classifier',
          dashboard: 'https://fashion-mnist-classifier.dashboard.opencloudhub.org',
        },
        wine: {
          path: '/models/custom/wine-classifier',
          dashboard: 'https://wine-classifier.dashboard.opencloudhub.org',
        },
      },
      base: {
        'qwen-0.5b': {
          path: '/models/base/qwen-0.5b/v1',
          dashboard: 'https://qwen-0.5b.dashboard.opencloudhub.org',
        },
      },
    },

    // Platform services - external subdomains
    platform: {
      mlops: {
        mlflow: 'https://mlflow.internal.opencloudhub.org',
        'argo-workflows': 'https://argo-workflows.internal.opencloudhub.org',
      },
      gitops: {
        argocd: 'https://argocd.internal.opencloudhub.org',
      },
      infrastructure: {
        'minio-console': 'https://minio.internal.opencloudhub.org',
        'minio-api': 'https://minio-api.internal.opencloudhub.org',
        pgadmin: 'https://pgadmin.internal.opencloudhub.org',
      },
      observability: {
        grafana: 'https://grafana.internal.opencloudhub.org',
      },
    },

    // Team applications
    apps: {
      'demo-backend': 'https://demo-app.opencloudhub.org',
    },
  },

  // ===========================================================================
  // INTERNAL - Direct service DNS (for testing services without ingress)
  // Use when you want to bypass gateway and test services directly
  // ===========================================================================
  internal: {
    insecureSkipTLSVerify: true,

    models: {
      api: 'http://istio-ingressgateway.istio-ingress.svc.cluster.local',
      custom: {
        'fashion-mnist': {
          path: '/models/custom/fashion-mnist-classifier',
          dashboard: null,
        },
        wine: {
          path: '/models/custom/wine-classifier',
          dashboard: null,
        },
      },
      base: {
        'qwen-0.5b': {
          path: '/models/base/qwen-0.5b/v1',
          dashboard: null,
        },
      },
    },

    platform: {
      mlops: {
        mlflow: 'http://mlflow.mlops.svc.cluster.local:5000',
        'argo-workflows': 'http://argo-workflows-server.mlops.svc.cluster.local:2746',
      },
      gitops: {
        argocd: 'http://argocd-server.argocd.svc.cluster.local',
      },
      infrastructure: {
        'minio-console': 'http://minio-console.minio-tenant.svc.cluster.local:9090',
        'minio-api': 'http://minio.minio-tenant.svc.cluster.local:9000',
        pgadmin: 'http://pgadmin.storage.svc.cluster.local',
      },
      observability: {
        grafana: 'http://grafana.observability.svc.cluster.local:3000',
      },
    },

    apps: {
      'demo-backend': 'http://demo-app-backend.demo-app.svc.cluster.local:8000',
    },
  },
};

export const ENV = ENVIRONMENTS[TEST_ENV];
export const TEST_ENV_NAME = TEST_ENV;

// Helper: Build full URL for a custom model endpoint
export function getCustomModelUrl(name) {
  const model = ENV.models.custom[name];
  if (!model) throw new Error(`Custom model not found: ${name}`);
  return `${ENV.models.api}${model.path}`;
}

// Helper: Build full URL for a base model endpoint
export function getBaseModelUrl(name) {
  const model = ENV.models.base[name];
  if (!model) throw new Error(`Base model not found: ${name}`);
  return `${ENV.models.api}${model.path}`;
}

// Helper: Get all platform services as flat list for health checks
export function getAllPlatformServices() {
  const services = [];
  for (const [category, categoryServices] of Object.entries(ENV.platform)) {
    for (const [name, url] of Object.entries(categoryServices)) {
      services.push({ category, name, url });
    }
  }
  return services;
}