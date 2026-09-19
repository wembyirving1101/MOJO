import {readFileSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';
const {drills}=JSON.parse(readFileSync(new URL('../data/drills.json',import.meta.url),'utf8'));
test('Every mock drill has a distinct valid route and usable questions',()=>{
  assert.ok(drills.length>=3);
  assert.equal(new Set(drills.map(d=>d.id)).size,drills.length);
  for(const drill of drills){
    assert.match(drill.id,/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    for(const field of ['title','description','subject','topic'])assert.ok(drill[field].trim());
    assert.ok(drill.minutes>0&&drill.xp>=0&&drill.questions.length>0);
    assert.equal(new Set(drill.questions.map(q=>q.id)).size,drill.questions.length);
    for(const question of drill.questions){
      assert.ok(question.text.trim()&&question.explanation.trim());
      assert.ok(question.answers.length>=2);
      assert.equal(new Set(question.answers).size,question.answers.length);
      assert.ok(Number.isInteger(question.correct)&&question.correct>=0&&question.correct<question.answers.length);
    }
  }
});
test('Drill cards provide different practice sets',()=>{
  assert.equal(new Set(drills.map(d=>JSON.stringify(d.questions.map(q=>q.id)))).size,drills.length);
});
test('Every JSON drill exports a directly accessible page',()=>{
  assert.ok(existsSync('out/drill.html'));
  for(const drill of drills)assert.ok(existsSync(`out/drill/${drill.id}.html`),drill.id);
});
