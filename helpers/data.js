// =============================================================================
// Test Data Loading Utilities
// =============================================================================
//
// Provides efficient data loading and sampling utilities for k6 tests.
// Uses SharedArray for memory-efficient data sharing across virtual users.
//
// Why SharedArray?
// ----------------
// In k6, each VU (virtual user) runs in its own JavaScript context. Without
// SharedArray, each VU would load its own copy of test data, consuming
// excessive memory. SharedArray loads data once and shares read-only access.
//
// Functions
// ---------
// - loadJsonData()      : Load JSON file into SharedArray
// - randomSample()      : Get random element from array
// - sequentialSample()  : Get element by index (wraps around)
//
// Usage
// -----
// // Load data once (outside default function)
// const WINE_DATA = loadJsonData('wine-samples', '../../data/wine.json');
//
// // Sample in test iterations
// export default function() {
//   const sample = randomSample(WINE_DATA);
//   http.post(url, JSON.stringify(sample));
// }
//
// Test Data Files
// ---------------
// - data/fashion-mnist.json : 10 image samples (784 pixels each)
// - data/wine.json          : 5 wine feature samples (13 features)
// - data/qwen-prompts.json  : 5 LLM prompt samples
// - data/rag-queries.json   : 10 RAG query samples
//
// See Also
// --------
// - k6 SharedArray docs: https://k6.io/docs/javascript-api/k6-data/sharedarray/
// =============================================================================

import { SharedArray } from 'k6/data';

// -----------------------------------------------------------------------------
// Load JSON Data
// -----------------------------------------------------------------------------
/**
 * Load JSON data file using SharedArray (efficient for multiple VUs).
 * Data is loaded once and shared read-only across all virtual users.
 *
 * @param {string} name - Unique name for the shared array
 * @param {string} path - Path relative to test file (e.g., '../../data/wine.json')
 * @returns {array} Loaded data as array
 *
 * @example
 * const WINE_DATA = loadJsonData('wine-samples', '../../data/wine.json');
 */
export function loadJsonData(name, path) {
  return new SharedArray(name, function () {
    try {
      const data = JSON.parse(open(path));
      const items = Array.isArray(data) ? data : [data];
      console.log(`✅ Loaded ${items.length} ${name} sample(s)`);
      return items;
    } catch (e) {
      console.error(`❌ Failed to load ${path}: ${e.message}`);
      return [];
    }
  });
}

// -----------------------------------------------------------------------------
// Random Sample
// -----------------------------------------------------------------------------
/**
 * Get random sample from array.
 * Useful for realistic load testing with varied input data.
 *
 * @param {array} data - Array to sample from
 * @returns {*} Random element from array
 * @throws {Error} If data array is empty
 *
 * @example
 * const sample = randomSample(WINE_DATA);
 */
export function randomSample(data) {
  if (!data || data.length === 0) {
    throw new Error('Data array is empty');
  }
  return data[Math.floor(Math.random() * data.length)];
}

// -----------------------------------------------------------------------------
// Sequential Sample
// -----------------------------------------------------------------------------
/**
 * Get sequential sample (wraps around) - useful for deterministic tests.
 * Each VU iteration gets the next element in order, cycling back to start.
 *
 * @param {array} data - Array to sample from
 * @param {number} index - Iteration index (usually __ITER)
 * @returns {*} Element at index (modulo array length)
 * @throws {Error} If data array is empty
 *
 * @example
 * // In default function
 * const sample = sequentialSample(DATA, __ITER);
 */
export function sequentialSample(data, index) {
  if (!data || data.length === 0) {
    throw new Error('Data array is empty');
  }
  return data[index % data.length];
}