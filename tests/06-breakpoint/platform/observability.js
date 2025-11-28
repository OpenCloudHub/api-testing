// tests/06-breakpoint/platform/observability.js
import { ENV } from '../../../config/environments.js';
import { PLATFORM_ENDPOINTS } from '../../../config/endpoints.js';
import { buildOptions } from '../../../config/thresholds.js';
import { get } from '../../../helpers/http.js';

export const options = buildOptions('breakpoint');

export function setup() {
  console.log('='.repeat(60));
  console.log('🔥 Breakpoint Test: Observability Services');
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
}

export default function () {
  get(`${ENV.platform.observability.grafana}${PLATFORM_ENDPOINTS.grafana.health}`, 'grafana-health');
}

export function teardown() {
  console.log('='.repeat(60));
  console.log('✅ Observability breakpoint test completed');
  console.log('='.repeat(60));
}
