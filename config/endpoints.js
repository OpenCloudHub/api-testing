// =============================================================================
// API Endpoint Configuration
// =============================================================================
//
// Central configuration for all API endpoints across the OpenCloudHub platform.
// Defines standard endpoint patterns by service type to ensure consistency.
//
// Service Types
// -------------
// - Custom Models    : FastAPI-based ML models (fashion-mnist, wine)
// - Base Models      : OpenAI-compatible LLM endpoints (qwen)
// - Platform         : Infrastructure services (MLflow, ArgoCD, MinIO, etc.)
// - Applications     : Demo/team applications (RAG backend)
//
// Usage
// -----
// Import the relevant endpoint constant in test files:
//   import { CUSTOM_MODEL_ENDPOINTS } from '../config/endpoints.js';
//   const healthUrl = `${baseUrl}${CUSTOM_MODEL_ENDPOINTS.health}`;
//
// See Also
// --------
// - config/environments.js : Base URLs for each environment
// - config/thresholds.js   : Performance thresholds per test type
// =============================================================================

// -----------------------------------------------------------------------------
// Custom ML Models (fashion-mnist, wine)
// -----------------------------------------------------------------------------
// FastAPI-based model servers with standard prediction endpoints.
// These models are deployed via Ray Serve with a consistent API contract.
export const CUSTOM_MODEL_ENDPOINTS = {
  root: '/',
  health: '/health',
  info: '/info',
  predict: '/predict',
  docs: '/docs',
  openapi: '/openapi.json',
};

// -----------------------------------------------------------------------------
// Base LLM Models (qwen-0.5b)
// -----------------------------------------------------------------------------
// OpenAI-compatible API for large language models.
// Uses vLLM as the inference engine with standard chat completions format.
export const BASE_MODEL_ENDPOINTS = {
  models: '/models',
  completions: '/completions',
  chat: '/chat/completions',
};

// -----------------------------------------------------------------------------
// Ray Serve Dashboards
// -----------------------------------------------------------------------------
// Dashboard endpoints for monitoring Ray Serve model deployments.
// Each model has its own dashboard for metrics and debugging.
export const RAY_DASHBOARD_ENDPOINTS = {
  root: '/',
  // Add more as needed
};

// -----------------------------------------------------------------------------
// Platform Service Endpoints
// -----------------------------------------------------------------------------
// Health check and API endpoints for core platform services.
// Note: Endpoint availability may vary based on service configuration.
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

// -----------------------------------------------------------------------------
// Demo Application Endpoints
// -----------------------------------------------------------------------------
// RAG-powered demo backend application.
// Provides prompt-based query interface with admin endpoints.
export const DEMO_BACKEND_ENDPOINTS = {
  root: '/api/',
  health: '/api/health',
  docs: '/api/docs',
  prompt: '/api/prompt',
  query: '/api/query',
  reloadPrompt: '/api/admin/reload-prompt',
};