// tests/01-smoke/models/base/qwen.js
import http from 'k6/http';
import { group, sleep } from 'k6';
import { ENV, getBaseModelUrl } from '../../../../config/environments.js';
import { buildOptions } from '../../../../config/thresholds.js';
import { checkHealth, checkCompletion, checkJsonField } from '../../../../helpers/checks.js';

const TEST_TYPE = 'stress';
const TEST_TARGET = 'model-qwen';

const MODEL_URL = getBaseModelUrl('qwen-0.5b');

export const options = buildOptions(TEST_TYPE, TEST_TARGET, {
  'qwen-health': {
    exec: 'testHealth',
  },
  'qwen-completion': {
    exec: 'testCompletion',
  },
}, {
  'http_req_duration{scenario:qwen-health}': ['p(95)<2000'],
  'http_req_duration{scenario:qwen-completion}': ['p(95)<30000'], // LLMs are slow
});

export function testHealth() {
  group('qwen-health', () => {
    let res = http.get(`${MODEL_URL}/models`, { tags: { name: 'qwen-models' } });
    checkHealth(res, 'qwen-models');
    checkJsonField(res, 'qwen-models', 'data');
  });
  sleep(0.5);
}

export function testCompletion() {
  group('qwen-completion', () => {
    const payload = {
      model: 'qwen-0.5b',
      messages: [{ role: 'user', content: 'Hello, who are you?' }],
      max_tokens: 50,
    };
    const res = http.post(`${MODEL_URL}/chat/completions`, JSON.stringify(payload), {
      headers: { 'Content-Type': 'application/json' },
      tags: { name: 'qwen-chat' },
      timeout: '60s',
    });
    checkCompletion(res, 'qwen-chat');
  });
  sleep(1);
}

export default function () {
  testHealth();
  testCompletion();
}