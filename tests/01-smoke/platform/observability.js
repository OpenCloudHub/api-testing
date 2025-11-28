// tests/01-smoke/platform/observability.js
import { group } from 'k6';
import { ENV } from '../../../config/environments.js';
import { PLATFORM_ENDPOINTS } from '../../../config/endpoints.js';
import { buildOptions } from '../../../config/thresholds.js';
import { get, healthCheck, checkDuration, checkHasField } from '../../../helpers/http.js';

export const options = buildOptions('smoke');

export function setup() {
  console.log('='.repeat(60));
  console.log('🧪 Smoke Test: Observability Services');
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default function () {
  group('Grafana', () => {
    const baseUrl = ENV.platform.observability.grafana;
    const endpoints = PLATFORM_ENDPOINTS.grafana;

    const { response, healthy } = healthCheck(`${baseUrl}${endpoints.root}`, 'grafana-root');
    if (healthy) {
      checkDuration(response, 'grafana-root', 2000);
    }

    // API health
    const healthRes = get(`${baseUrl}${endpoints.health}`, 'grafana-health');
    if (healthRes.ok) {
      checkDuration(healthRes.response, 'grafana-health', 2000);
      checkHasField(healthRes.response, 'grafana-health', 'database');
    }
  });
}

export function teardown() {
  console.log('='.repeat(60));
  console.log('✅ Observability smoke test completed');
  console.log('='.repeat(60));
}
