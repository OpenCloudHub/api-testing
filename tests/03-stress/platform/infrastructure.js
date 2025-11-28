// tests/03-stress/platform/infrastructure.js
import { group, sleep } from 'k6';
import { ENV } from '../../../config/environments.js';
import { PLATFORM_ENDPOINTS } from '../../../config/endpoints.js';
import { buildOptions } from '../../../config/thresholds.js';
import { healthCheck } from '../../../helpers/http.js';

export const options = buildOptions('stress');

export function setup() {
  console.log('='.repeat(60));
  console.log('💪 Stress Test: Infrastructure Services');
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default function () {
  // Focus on MinIO API as most critical
  healthCheck(
    `${ENV.platform.infrastructure['minio-api']}${PLATFORM_ENDPOINTS['minio-api'].health}`,
    'minio-api-health'
  );

  sleep(0.05 + Math.random() * 0.05);
}

export function teardown() {
  console.log('='.repeat(60));
  console.log('✅ Infrastructure stress test completed');
  console.log('='.repeat(60));
}
