// tests/03-stress/platform/mlops.js
import { group, sleep } from 'k6';
import { ENV } from '../../../config/environments.js';
import { PLATFORM_ENDPOINTS } from '../../../config/endpoints.js';
import { buildOptions } from '../../../config/thresholds.js';
import { get, healthCheck } from '../../../helpers/http.js';

export const options = buildOptions('stress');

export function setup() {
  console.log('='.repeat(60));
  console.log('💪 Stress Test: MLOps Platform Services');
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default function () {
  group('MLflow', () => {
    const baseUrl = ENV.platform.mlops.mlflow;
    const endpoints = PLATFORM_ENDPOINTS.mlflow;
    get(`${baseUrl}${endpoints.health}`, 'mlflow-health');
  });

  group('Argo Workflows', () => {
    const baseUrl = ENV.platform.mlops['argo-workflows'];
    const endpoints = PLATFORM_ENDPOINTS['argo-workflows'];
    healthCheck(`${baseUrl}${endpoints.root}`, 'argo-workflows-root');
  });

  sleep(0.05 + Math.random() * 0.05);
}

export function teardown() {
  console.log('='.repeat(60));
  console.log('✅ MLOps stress test completed');
  console.log('='.repeat(60));
}
