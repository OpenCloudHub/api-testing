// tests/04-spike/platform/infrastructure.js
import { sleep } from 'k6';
import { ENV } from '../../../config/environments.js';
import { PLATFORM_ENDPOINTS } from '../../../config/endpoints.js';
import { buildOptions } from '../../../config/thresholds.js';
import { healthCheck } from '../../../helpers/http.js';

export const options = buildOptions('spike');

export function setup() {
  console.log('='.repeat(60));
  console.log('📈 Spike Test: Infrastructure Services');
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default function () {
  healthCheck(
    `${ENV.platform.infrastructure['minio-api']}${PLATFORM_ENDPOINTS['minio-api'].health}`,
    'minio-api-health'
  );
  sleep(0.01);
}

export function teardown() {
  console.log('='.repeat(60));
  console.log('✅ Infrastructure spike test completed');
  console.log('='.repeat(60));
}
