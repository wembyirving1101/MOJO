import skillTree from '../data/skill-tree.json' with { type: 'json' };

export type SkillNode = {
  id: string;
  parentId?: string;
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

export function visibleTree(nodes: SkillNode[], subject: string, collapsed: Set<string>, query='') {
  const scoped=nodes.filter(n=>subject==='Keseluruhan'||n.subject===subject||n.kind==='root');
  const byId=new Map(scoped.map(n=>[n.id,n]));
  const matches=new Set(scoped.filter(n=>n.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).map(n=>n.id));
  const retained=new Set(matches);
  if(query.trim()) for(const id of matches){let parent=byId.get(id)?.parentId;const seen=new Set<string>();while(parent&&byId.has(parent)&&!seen.has(parent)){seen.add(parent);retained.add(parent);parent=byId.get(parent)?.parentId;}}
  return scoped.filter(n=>{
    if(query.trim()) return retained.has(n.id);
    let parent=n.parentId;const seen=new Set<string>();
    while(parent&&byId.has(parent)&&!seen.has(parent)){if(collapsed.has(parent))return false;seen.add(parent);parent=byId.get(parent)?.parentId;}
    return true;
  });
}

export type PositionedNode = SkillNode & {x:number;y:number};
// Each subtree owns a disjoint horizontal span. Parents are centered over their
// children; the canvas grows with both breadth and depth, without fixed slots.
export function layoutTree(nodes: SkillNode[]) {
  const nodeWidth=144, levelHeight=164, gap=24, padding=36;
  const byId=new Map(nodes.map(n=>[n.id,n]));
  if(byId.size!==nodes.length)throw new Error('Duplicate skill ID');
  const children=new Map<string,SkillNode[]>();
  for(const n of nodes){if(n.parentId&&byId.has(n.parentId)){const list=children.get(n.parentId)??[];list.push(n);children.set(n.parentId,list);}}
  const widths=new Map<string,number>(), visiting=new Set<string>();
  function measure(id:string):number {if(visiting.has(id))throw new Error('Cyclic skill relationship');if(widths.has(id))return widths.get(id)!;visiting.add(id);const kids=children.get(id)??[];const width=Math.max(nodeWidth,kids.reduce((sum,n)=>sum+measure(n.id),0)+Math.max(0,kids.length-1)*gap);visiting.delete(id);widths.set(id,width);return width;}
  nodes.forEach(n=>measure(n.id));
  const roots=nodes.filter(n=>!n.parentId||!byId.has(n.parentId));
  const positioned:PositionedNode[]=[];
  function place(node:SkillNode,left:number,depth:number){positioned.push({...node,x:left+widths.get(node.id)!/2,y:padding+depth*levelHeight});let cursor=left;for(const child of children.get(node.id)??[]){place(child,cursor,depth+1);cursor+=widths.get(child.id)!+gap;}}
  let cursor=padding;for(const root of roots){place(root,cursor,0);cursor+=widths.get(root.id)!+gap;}
  const positions=new Map(positioned.map(n=>[n.id,n]));
  const edges=positioned.filter(n=>n.parentId&&positions.has(n.parentId)).map(n=>({from:positions.get(n.parentId!)!,to:n}));
  return {nodes:positioned,edges,width:Math.max(320,cursor-gap+padding),height:Math.max(300,...positioned.map(n=>n.y+144+padding)),nodeWidth};
}

// Keep nodes readable in large maps; whole-map fit is a separate explicit action.
export function explorationZoom(width:number,height:number,graphWidth:number,graphHeight:number){
  return Math.max(.6,Math.min(.85,(width-48)/Math.min(graphWidth,840),(height-48)/Math.min(graphHeight,600)));
}
