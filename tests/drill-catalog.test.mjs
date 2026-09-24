import test from 'node:test';
import assert from 'node:assert/strict';
import {drillSubjects, subjectSkills, subjectDrills, overallDrill} from '../lib/drill-catalog.ts';
const question = {id:'q1',text:'Example',answers:['A','B'],correct:0,explanation:'A'};
const drills = [
  {id:'a',skillId:'persamaan',subject:'Old subject label',questions:[question]},
  {id:'b',skillId:'deduksi',questions:[{...question,id:'q2'}]},
  {id:'c',skillId:'persamaan',questions:[question,{...question,id:'q3'}]},
  {id:'unknown',skillId:'missing',questions:[question]},
  {id:'empty',skillId:'fungsi',questions:[]},
];
test('Every skill is offered only under its catalog subject', () => {
  assert.equal(drillSubjects.length,4);
  const ids = drillSubjects.flatMap(s => subjectSkills(s.id).map(n => n.id));
  assert.equal(ids.length,new Set(ids).size);
  assert.ok(subjectSkills('kuantitatif').some(n => n.id === 'persamaan'));
  assert.ok(!subjectSkills('literasi').some(n => n.id === 'persamaan'));
  assert.deepEqual(subjectSkills('missing'),[]);
});
test('Drills match stable skill IDs, regardless of legacy subject labels', () => {
  assert.deepEqual(subjectDrills(drills,'kuantitatif').map(d => d.id),['a','c']);
});
test('Overall tests deduplicate shared questions and exclude other subjects', () => {
  const result = overallDrill(drills,'kuantitatif');
  assert.deepEqual(result.questions.map(q => q.id),['q1','q3']);
  assert.equal(result.subject,'Kuantitatif');
  assert.equal(overallDrill(drills,'literasi'),undefined);
  assert.equal(overallDrill(drills,'missing'),undefined);
});
test('Mode selection keeps quick, deep, and focus question pools separate', () => {
  const sets = drills.slice(0,3).map((d,i) => ({...d,mode:['quick','focus','deep'][i]}));
  assert.deepEqual(overallDrill(sets,'kuantitatif','quick').questions.map(q => q.id),['q1']);
  assert.deepEqual(overallDrill(sets,'kuantitatif','deep').questions.map(q => q.id),['q1','q3']);
  assert.equal(overallDrill(sets,'kuantitatif','focus'),undefined);
  assert.equal(overallDrill(sets,'kuantitatif','invalid'),undefined);
  assert.equal(overallDrill(sets,'kuantitatif','quick','deduksi'),undefined);
  assert.ok(overallDrill(sets,'kuantitatif','quick','persamaan'));
});
