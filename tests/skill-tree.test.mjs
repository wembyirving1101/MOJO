import test from 'node:test';
import assert from 'node:assert/strict';
import {skillNodes,subjects,visibleTree,layoutTree,explorationZoom} from '../lib/skill-tree.ts';
function checkLayout(nodes){
  const graph=layoutTree(nodes);
  assert.equal(graph.nodes.length,nodes.length);
  for(const n of graph.nodes){assert.ok(Number.isFinite(n.x)&&Number.isFinite(n.y));assert.ok(n.x>=72&&n.x+72<=graph.width);assert.ok(n.y+110<=graph.height);}
  for(let i=0;i<graph.nodes.length;i++)for(let j=i+1;j<graph.nodes.length;j++){
    const a=graph.nodes[i],b=graph.nodes[j];
    assert.ok(Math.abs(a.y-b.y)>=110||Math.abs(a.x-b.x)>=144,`Overlap: ${a.id}, ${b.id}`);
  }
  for(const {from,to} of graph.edges){assert.equal(to.parentId,from.id);assert.ok(from.y+110<to.y);}
  return graph;
}
test('Every subject and overview use valid connected trees',()=>{
  for(const subject of subjects){const nodes=visibleTree(skillNodes,subject,new Set());const graph=checkLayout(nodes);assert.equal(graph.edges.length,nodes.length-1);}
});
test('Overview collapse hides descendants; search reveals matching ancestry',()=>{
  const hidden=new Set(['bilangan','bacaan','logika','kosakata']);
  const overview=visibleTree(skillNodes,'Keseluruhan',hidden);
  assert.equal(overview.length,9);
  const found=visibleTree(skillNodes,'Keseluruhan',hidden,'persamaan');
  assert.deepEqual(found.map(n=>n.id),['mojo','kuantitatif','bilangan','aljabar','persamaan']);
  assert.equal(visibleTree(skillNodes,'Literasi',new Set(),'persamaan').length,0);
  checkLayout(overview);checkLayout(found);
});
test('New siblings, descendants, and independent roots never share node bounds',()=>{
  const nodes=[...skillNodes];
  for(let i=0;i<180;i++)nodes.push({id:`extra-${i}`,parentId:i<60?'persamaan':`extra-${i-60}`,name:`Skill tambahan ${i}`,subject:'Kuantitatif',icon:'book',mastery:0,description:''});
  const extended=checkLayout(nodes),original=layoutTree(skillNodes);
  assert.ok(extended.width>original.width);assert.ok(extended.height>original.height);
  checkLayout([...nodes,{...nodes[0],id:'independent',parentId:undefined}]);
});
test('A deep chain remains navigable and empty filters remain valid',()=>{
  const chain=Array.from({length:250},(_,i)=>({...skillNodes[0],id:`n${i}`,parentId:i?`n${i-1}`:undefined}));
  checkLayout(chain);assert.equal(layoutTree([]).nodes.length,0);
});
test('Malformed duplicate and cyclic relationships are rejected clearly',()=>{
  assert.throws(()=>layoutTree([skillNodes[0],skillNodes[0]]),/Duplicate/);
  assert.throws(()=>layoutTree([{...skillNodes[0],id:'a',parentId:'b'},{...skillNodes[0],id:'b',parentId:'a'}]),/Cyclic/);
});

test('Every subject starts at Me and preserves its category below the user',()=>{
  for(const subject of subjects){
    const graph=layoutTree(visibleTree(skillNodes,subject,new Set()));
    assert.equal(graph.nodes[0].name,'Me');
    assert.equal(graph.nodes[0].kind,'root');
    if(subject!=='Keseluruhan')assert.ok(graph.edges.some(e=>e.from.id==='mojo'&&e.to.subject===subject));
  }
});
test('Exploration zoom stays readable as trees grow on phone and desktop',()=>{
  for(const [w,h] of [[320,480],[640,490],[1200,700]]){
    for(const [gw,gh] of [[320,300],[2400,1000],[50000,50000]]){
      const scale=explorationZoom(w,h,gw,gh);
      assert.ok(scale>=.6&&scale<=.85);
    }
  }
  assert.ok(explorationZoom(320,480,2400,1000)<explorationZoom(1200,700,2400,1000));
});
