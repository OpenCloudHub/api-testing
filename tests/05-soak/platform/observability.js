// tests/05-soak/platform/observability.js
import { group, sleep } from 'k6';
import { ENV } from '../../../config/environments.js';
import { PLATFORM_ENDPOINTS } from '../../../config/endpoints.js';
import { buildOptions } from '../../../config/thresholds.js';
import { get, checkDuration } from '../../../helpers/http.js';

export const options = buildOptions('soak');

export function setup() {
  console.log('='.repeat(60));
  console.log('🕐 Soak Test: Observability Services');
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default function () {
  group('Grafana', () => {
    const { response, ok } = get(
      `${ENV.platform.observability.grafana}${PLATFORM_ENDPOINTS.grafana.health}`,
      'grafana-health'
    );
    if (ok) checkDuration(response, 'grafana-health', 2000);
  });

  sleep(1 + Math.random() * 0.5);
}

export function teardown() {
  console.log('='.repeat(60));
  console.log('✅ Observability soak test completed');
  console.log('='.repeat(60));
}
