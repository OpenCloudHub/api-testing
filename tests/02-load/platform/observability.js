// tests/02-load/platform/observability.js
import { group, sleep } from 'k6';
import { ENV } from '../../../config/environments.js';
import { PLATFORM_ENDPOINTS } from '../../../config/endpoints.js';
import { buildOptions } from '../../../config/thresholds.js';
import { get, healthCheck, checkDuration } from '../../../helpers/http.js';

export const options = buildOptions('load');

export function setup() {
  console.log('='.repeat(60));
  console.log('📊 Load Test: Observability Services');
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default function () {
  group('Grafana', () => {
    const baseUrl = ENV.platform.observability.grafana;
    const endpoints = PLATFORM_ENDPOINTS.grafana;

    if (Math.random() < 0.5) {
      const { response, healthy } = healthCheck(`${baseUrl}${endpoints.root}`, 'grafana-root');
      if (healthy) checkDuration(response, 'grafana-root', 2000);
    } else {
      const { response, ok } = get(`${baseUrl}${endpoints.health}`, 'grafana-health');
      if (ok) checkDuration(response, 'grafana-health', 2000);
    }
  });

  sleep(0.2 + Math.random() * 0.3);
}

export function teardown() {
  console.log('='.repeat(60));
  console.log('✅ Observability load test completed');
  console.log('='.repeat(60));
}
