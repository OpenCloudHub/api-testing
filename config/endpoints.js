// config/endpoints.js
// Common endpoint patterns by service type

// Custom models (fashion-mnist, wine) - FastAPI with standard endpoints
export const CUSTOM_MODEL_ENDPOINTS = {
  root: '/',
  health: '/health',
  info: '/info',
  predict: '/predict',
  docs: '/docs',
  openapi: '/openapi.json',
};

// Base models (qwen) - OpenAI-compatible API
export const BASE_MODEL_ENDPOINTS = {
  models: '/models',
  completions: '/completions',
  chat: '/chat/completions',
};

// Ray Serve dashboards
export const RAY_DASHBOARD_ENDPOINTS = {
  root: '/',
  // Add more as needed
};

// Platform service health endpoints (best-effort, may vary)
export const PLATFORM_ENDPOINTS = {
  // MLflow
  mlflow: {
    root: '/',
    health: '/health',
    api: '/api/2.0/mlflow/experiments/search',
  },
  // ArgoCD
  argocd: {
    root: '/',
    health: '/healthz',
    api: '/api/version',
  },
  // Argo Workflows
  'argo-workflows': {
    root: '/',
    health: '/healthz',
  },
  // MinIO Console
  'minio-console': {
    root: '/',
  },
  // MinIO API
  'minio-api': {
    health: '/minio/health/live',
  },
  // Grafana
  grafana: {
    root: '/',
    health: '/api/health',
  },
  // pgAdmin
  pgadmin: {
    root: '/',
  },
};

// Demo RAG backend endpoints
export const DEMO_BACKEND_ENDPOINTS = {
  root: '/api/',
  health: '/api/health',
  docs: '/api/docs',
  prompt: '/api/prompt',
  query: '/api/query',
  reloadPrompt: '/api/admin/reload-prompt',
};