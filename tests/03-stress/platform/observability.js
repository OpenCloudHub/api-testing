// tests/03-stress/platform/observability.js
import { sleep } from 'k6';
import { ENV } from '../../../config/environments.js';
import { PLATFORM_ENDPOINTS } from '../../../config/endpoints.js';
import { buildOptions } from '../../../config/thresholds.js';
import { get } from '../../../helpers/http.js';

export const options = buildOptions('stress');

export function setup() {
  console.log('='.repeat(60));
  console.log('💪 Stress Test: Observability Services');
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default function () {
  get(`${ENV.platform.observability.grafana}${PLATFORM_ENDPOINTS.grafana.health}`, 'grafana-health');
  sleep(0.05 + Math.random() * 0.05);
}

export function teardown() {
  console.log('='.repeat(60));
  console.log('✅ Observability stress test completed');
  console.log('='.repeat(60));
}
