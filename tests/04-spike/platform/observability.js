// tests/04-spike/platform/observability.js
import { sleep } from 'k6';
import { ENV } from '../../../config/environments.js';
import { PLATFORM_ENDPOINTS } from '../../../config/endpoints.js';
import { buildOptions } from '../../../config/thresholds.js';
import { get } from '../../../helpers/http.js';

export const options = buildOptions('spike');

export function setup() {
  console.log('='.repeat(60));
  console.log('📈 Spike Test: Observability Services');
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default function () {
  get(`${ENV.platform.observability.grafana}${PLATFORM_ENDPOINTS.grafana.health}`, 'grafana-health');
  sleep(0.01);
}

export function teardown() {
  console.log('='.repeat(60));
  console.log('✅ Observability spike test completed');
  console.log('='.repeat(60));
}
