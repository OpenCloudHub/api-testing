// tests/01-smoke/platform/infrastructure.js
import { group } from 'k6';
import { ENV } from '../../../config/environments.js';
import { PLATFORM_ENDPOINTS } from '../../../config/endpoints.js';
import { buildOptions } from '../../../config/thresholds.js';
import { get, healthCheck, checkDuration } from '../../../helpers/http.js';

export const options = buildOptions('smoke');

export function setup() {
  console.log('='.repeat(60));
  console.log('🧪 Smoke Test: Infrastructure Services');
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default function () {
  group('MinIO Console', () => {
    const baseUrl = ENV.platform.infrastructure['minio-console'];
    const endpoints = PLATFORM_ENDPOINTS['minio-console'];

    const { response, healthy } = healthCheck(`${baseUrl}${endpoints.root}`, 'minio-console-root');
    if (healthy) {
      checkDuration(response, 'minio-console-root', 2000);
    }
  });

  group('MinIO API', () => {
    const baseUrl = ENV.platform.infrastructure['minio-api'];
    const endpoints = PLATFORM_ENDPOINTS['minio-api'];

    const { response, healthy } = healthCheck(`${baseUrl}${endpoints.health}`, 'minio-api-health');
    if (healthy) {
      checkDuration(response, 'minio-api-health', 2000);
    }
  });

  group('pgAdmin', () => {
    const baseUrl = ENV.platform.infrastructure.pgadmin;
    const endpoints = PLATFORM_ENDPOINTS.pgadmin;

    const { response, healthy } = healthCheck(`${baseUrl}${endpoints.root}`, 'pgadmin-root');
    if (healthy) {
      checkDuration(response, 'pgadmin-root', 3000);  // pgAdmin can be slow
    }
  });
}

export function teardown() {
  console.log('='.repeat(60));
  console.log('✅ Infrastructure smoke test completed');
  console.log('='.repeat(60));
}
