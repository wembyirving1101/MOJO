import skillTree from '../data/skill-tree.json' with { type: 'json' };

export type SkillNode = {
  id: string;
  parentId?: string;
  prerequisiteIds?: string[];
  name: string;
  subject: string;
  kind?: 'root' | 'category';
  icon: string;
  mastery: number;
  description: string;
};
// Shared catalog and prototype mastery values; real user progress is separate.
export const subjects = skillTree.subjects;
export const skillNodes: SkillNode[] = skillTree.nodes.map(node => {
  const {kind, ...fields} = node;
  if (kind !== undefined && kind !== 'root' && kind !== 'category') {
    throw new Error(`Invalid skill node kind: ${kind}`);
  }
  return {...fields, kind};
});

export function statusFor(node: SkillNode) {
  if(node.kind) return {status:node.kind==='root'?'Peta belajar':'Kelompok materi',color:'mint'};
  if(node.mastery===100) return {status:'Dikuasai',color:'mint'};
  if(node.mastery===0) return {status:'Belum mulai',color:'gray'};
  return node.mastery<50?{status:'Perlu latihan',color:'peach'}:{status:'Dipelajari',color:'mint'};
}

// parentId organizes the catalog; prerequisiteIds lists ALL required skills.
// Legacy nodes use their parent as their single incoming connection.
export function incomingIds(node: Pick<SkillNode, 'parentId' | 'prerequisiteIds'>): string[] {
  return [...new Set(node.prerequisiteIds ?? (node.parentId ? [node.parentId] : []))];
}

export function ancestorIds(nodes: SkillNode[], id: string) {
  const byId = new Map(nodes.map(n => [n.id, n]));
  const result = new Set<string>();
  function visit(key: string) {
    if (result.has(key) || !byId.has(key)) return;
    result.add(key);
    incomingIds(byId.get(key)!).forEach(visit);
  }
  visit(id);
  return result;
}

export function visibleTree(nodes: SkillNode[], subject: string, collapsed: Set<string>, query='') {
  const scoped = nodes.filter(n => subject === 'Keseluruhan' || n.subject === subject || n.kind === 'root')
    .filter(n => !(subject === 'Kuantitatif' && n.id === 'kuantitatif'))
    .map(n => subject === 'Kuantitatif' && incomingIds(n).includes('kuantitatif')
      ? {...n, parentId:'mojo', prerequisiteIds:incomingIds(n).map(id=>id==='kuantitatif'?'mojo':id)} : n);
  const byId = new Map(scoped.map(n => [n.id, n]));
  const term = query.trim().toLocaleLowerCase();
  if (term) {
    const retained = new Set<string>();
    for (const n of scoped) if (n.name.toLocaleLowerCase().includes(term)) {
      ancestorIds(scoped, n.id).forEach(id => retained.add(id));
    }
    return scoped.filter(n => retained.has(n.id));
  }
  // A shared descendant remains visible while any incoming branch is open.
  const memo = new Map<string, boolean>();
  const visiting = new Set<string>();
  function visible(id: string): boolean {
    if (memo.has(id)) return memo.get(id)!;
    if (visiting.has(id)) throw new Error('Cyclic skill relationship');
    visiting.add(id);
    const parents = incomingIds(byId.get(id)!).filter(p => byId.has(p));
    const result = !parents.length || parents.some(p => !collapsed.has(p) && visible(p));
    visiting.delete(id); memo.set(id, result); return result;
  }
  return scoped.filter(n => visible(n.id));
}

export type PositionedNode = SkillNode & {x:number;y:number};
export function layoutTree(nodes: SkillNode[]) {
  const nodeWidth=144, levelHeight=180, gap=40, padding=36;
  const byId=new Map(nodes.map(n=>[n.id,n]));
  if(byId.size!==nodes.length)throw new Error('Duplicate skill ID');
  const depths=new Map<string,number>(), visiting=new Set<string>();
  function depth(id:string):number {
    if(visiting.has(id))throw new Error('Cyclic skill relationship');
    if(depths.has(id))return depths.get(id)!;
    visiting.add(id);
    const parents=incomingIds(byId.get(id)!).filter(p=>byId.has(p));
    const value=parents.length?1+Math.max(...parents.map(depth)):0;
    visiting.delete(id);depths.set(id,value);return value;
  }
  nodes.forEach(n=>depth(n.id));
  // Assign each node one layout owner, but render every prerequisite edge.
  const owner=new Map<string,string>();
  const children=new Map<string,SkillNode[]>();
  for(const n of nodes){
    const parents=incomingIds(n).filter(p=>byId.has(p));
    const parent=parents.includes(n.parentId??'')?n.parentId:parents[0];
    if(parent){owner.set(n.id,parent);const list=children.get(parent)??[];list.push(n);children.set(parent,list);}
  }
  const widths=new Map<string,number>();
  function measure(id:string):number {
    const kids=children.get(id)??[];
    const width=Math.max(nodeWidth,kids.reduce((sum,n)=>sum+measure(n.id),0)+Math.max(0,kids.length-1)*gap);
    widths.set(id,width);return width;
  }
  const roots=nodes.filter(n=>!owner.has(n.id));roots.forEach(n=>measure(n.id));
  const positioned:PositionedNode[]=[];
  function place(node:SkillNode,left:number){
    positioned.push({...node,x:left+widths.get(node.id)!/2,y:padding+depths.get(node.id)!*levelHeight});
    let cursor=left;for(const child of children.get(node.id)??[]){place(child,cursor);cursor+=widths.get(child.id)!+gap;}
  }
  let cursor=padding;for(const root of roots){place(root,cursor);cursor+=widths.get(root.id)!+gap;}
  const positions=new Map(positioned.map(n=>[n.id,n]));
  // Center converging nodes between their prerequisite branches, preserving spacing.
  for(const level of [...new Set(depths.values())].sort((a,b)=>a-b)){
    const row=positioned.filter(n=>depths.get(n.id)===level);
    for(const n of row){const parents=incomingIds(n).map(id=>positions.get(id)).filter((p):p is PositionedNode=>!!p);if(parents.length>1)n.x=parents.reduce((sum,p)=>sum+p.x,0)/parents.length;}
    row.sort((a,b)=>a.x-b.x);
    for(let i=0;i<row.length;i++)row[i].x=Math.max(row[i].x,i?row[i-1].x+nodeWidth+gap:padding+nodeWidth/2);
  }
  const edges=positioned.flatMap(n=>incomingIds(n).filter(p=>positions.has(p)).map(p=>({from:positions.get(p)!,to:n})));
  return {nodes:positioned,edges,width:Math.max(320,cursor-gap+padding,...positioned.map(n=>n.x+nodeWidth/2+padding)),height:Math.max(300,...positioned.map(n=>n.y+144+padding)),nodeWidth};
}

// Keep nodes readable in large maps; whole-map fit is a separate explicit action.
export function explorationZoom(width:number,height:number,graphWidth:number,graphHeight:number){
  return Math.max(.6,Math.min(.85,(width-48)/Math.min(graphWidth,840),(height-48)/Math.min(graphHeight,600)));
}
