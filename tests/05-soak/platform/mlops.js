// tests/05-soak/platform/mlops.js
import { group, sleep } from 'k6';
import { ENV } from '../../../config/environments.js';
import { PLATFORM_ENDPOINTS } from '../../../config/endpoints.js';
import { buildOptions } from '../../../config/thresholds.js';
import { get, healthCheck, checkDuration } from '../../../helpers/http.js';

export const options = buildOptions('soak');

export function setup() {
  console.log('='.repeat(60));
  console.log('🕐 Soak Test: MLOps Platform Services');
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default function () {
  group('MLflow', () => {
    const baseUrl = ENV.platform.mlops.mlflow;
    const endpoints = PLATFORM_ENDPOINTS.mlflow;

    const { response, ok } = get(`${baseUrl}${endpoints.health}`, 'mlflow-health');
    if (ok) checkDuration(response, 'mlflow-health', 2000);
  });

  group('Argo Workflows', () => {
    const baseUrl = ENV.platform.mlops['argo-workflows'];
    const endpoints = PLATFORM_ENDPOINTS['argo-workflows'];

    const { response, healthy } = healthCheck(`${baseUrl}${endpoints.root}`, 'argo-workflows-root');
    if (healthy) checkDuration(response, 'argo-workflows-root', 2000);
  });

  sleep(1 + Math.random() * 0.5);
}

export function teardown() {
  console.log('='.repeat(60));
  console.log('✅ MLOps soak test completed');
  console.log('='.repeat(60));
}
