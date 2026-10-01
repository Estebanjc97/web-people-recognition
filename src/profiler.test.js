import { test } from 'node:test';
import assert from 'node:assert';
import { fakeProfile } from './profiler.js';

test('perfil falso estable por nombre y distinto entre personas', () => {
  assert.deepStrictEqual(fakeProfile('Ana'), fakeProfile('Ana'));
  assert.notDeepStrictEqual(fakeProfile('Ana'), fakeProfile('Luis'));
  assert.ok(!fakeProfile('Ana').join().includes('undefined'));
});
