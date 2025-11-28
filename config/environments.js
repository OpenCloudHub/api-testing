// config/environments.js
// Base URLs organized by service category

const TEST_ENV = __ENV.TEST_ENV || 'dev';

const ENVIRONMENTS = {
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

    // Platform services - internal subdomains
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