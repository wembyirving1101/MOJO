import test from 'node:test';
import assert from 'node:assert/strict';
import {generateQuestion, generatedSkills, relaxedDrill} from '../lib/relaxed-questions.ts';

test('Generated questions have distinct answers and correct arithmetic across the parameter range', () => {
  for (const skill of generatedSkills) {
    const texts = new Set();
    for (let i = 0; i < 1000; i++) {
      const values = [(i % 14) / 14, (i % 30) / 30, (i % 41) / 41];
      let call = 0;
      const random = () => values[call++ % 3];
      const q = generateQuestion(skill, i, random);
      const a = 2 + i % 14, b = 1 + i % 30, x = -15 + i % 41;
      const expected = {bilangan: a * b + x, aljabar: a + b, persamaan: x, fungsi: a * x + b, geometri: a * b, data: b}[skill];
      assert.equal(Number(q.answers[q.correct]), expected);
      assert.equal(new Set(q.answers).size, 4);
      assert.ok(q.explanation.length > 0);
      texts.add(q.text);
    }
    assert.ok(texts.size > 100, skill);
  }
});
test('Relaxed scope supports all quantitative skills without a database question pool', () => {
  assert.deepEqual(relaxedDrill('kuantitatif').generatedSkillIds, generatedSkills);
  assert.deepEqual(relaxedDrill('kuantitatif', 'persamaan').generatedSkillIds, ['persamaan']);
  assert.equal(relaxedDrill('kuantitatif', 'deduksi'), undefined);
  assert.equal(relaxedDrill('literasi'), undefined);
  assert.throws(() => generateQuestion('unknown', 1), /No generator/);
});
