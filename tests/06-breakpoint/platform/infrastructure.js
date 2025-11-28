// tests/06-breakpoint/platform/infrastructure.js
import { ENV } from '../../../config/environments.js';
import { PLATFORM_ENDPOINTS } from '../../../config/endpoints.js';
import { buildOptions } from '../../../config/thresholds.js';
import { healthCheck } from '../../../helpers/http.js';

export const options = buildOptions('breakpoint');

export function setup() {
  console.log('='.repeat(60));
  console.log('🔥 Breakpoint Test: Infrastructure Services');
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default function () {
  healthCheck(
    `${ENV.platform.infrastructure['minio-api']}${PLATFORM_ENDPOINTS['minio-api'].health}`,
    'minio-api-health'
  );
}

export function teardown() {
  console.log('='.repeat(60));
  console.log('✅ Infrastructure breakpoint test completed');
  console.log('='.repeat(60));
}
