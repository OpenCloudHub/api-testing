// tests/05-soak/platform/infrastructure.js
import { group, sleep } from 'k6';
import { ENV } from '../../../config/environments.js';
import { PLATFORM_ENDPOINTS } from '../../../config/endpoints.js';
import { buildOptions } from '../../../config/thresholds.js';
import { healthCheck, checkDuration } from '../../../helpers/http.js';

export const options = buildOptions('soak');

export function setup() {
  console.log('='.repeat(60));
  console.log('🕐 Soak Test: Infrastructure Services');
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default function () {
  group('MinIO API', () => {
    const { response, healthy } = healthCheck(
      `${ENV.platform.infrastructure['minio-api']}${PLATFORM_ENDPOINTS['minio-api'].health}`,
      'minio-api-health'
    );
    if (healthy) checkDuration(response, 'minio-api-health', 2000);
  });

  group('MinIO Console', () => {
    const { response, healthy } = healthCheck(
      `${ENV.platform.infrastructure['minio-console']}${PLATFORM_ENDPOINTS['minio-console'].root}`,
      'minio-console-root'
    );
    if (healthy) checkDuration(response, 'minio-console-root', 2000);
  });

  sleep(1 + Math.random() * 0.5);
}

export function teardown() {
  console.log('='.repeat(60));
  console.log('✅ Infrastructure soak test completed');
  console.log('='.repeat(60));
}
