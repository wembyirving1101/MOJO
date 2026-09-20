'use client';
import {useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {BookOpen,MessageCircle,GitFork,Lightbulb,Sigma,ChartNoAxesColumnIncreasing,Equal,Triangle,Sparkles,Check,X,Search,Target,Plus,Minus,Maximize2,LocateFixed} from 'lucide-react';
import {skillNodes,layoutTree,visibleTree,statusFor,explorationZoom,type SkillNode} from '../lib/skill-tree';
export const skillIcons = {book:BookOpen,message:MessageCircle,branches:GitFork,bulb:Lightbulb,sigma:Sigma,chart:ChartNoAxesColumnIncreasing,equal:Equal,triangle:Triangle,sparkles:Sparkles,check:Check,x:X,search:Search,target:Target};
export function iconFor(node:SkillNode){return skillIcons[node.icon as keyof typeof skillIcons]??BookOpen;}
export default function SkillMap({subject,query,selected,onSelect}:{subject:string;query:string;selected:string;onSelect:(id:string)=>void}){
  const [collapsed,setCollapsed]=useState<Set<string>>(()=>new Set());
  const [zoom,setZoom]=useState<number|null>(null);
  const [viewport,setViewport]=useState({width:640,height:490});
  const container=useRef<HTMLDivElement>(null);
  const pointer=useRef<{x:number;y:number;left:number;top:number}|null>(null);
  const graph=useMemo(()=>layoutTree(visibleTree(skillNodes,subject,collapsed,query)),[subject,collapsed,query]);
  const fit=Math.min(1,(viewport.width-24)/graph.width,(viewport.height-24)/graph.height);
  const autoZoom=explorationZoom(viewport.width,viewport.height,graph.width,graph.height);
  const scale=zoom??autoZoom;
  const width=Math.max(viewport.width,graph.width*scale),height=Math.max(viewport.height,graph.height*scale);
  const offsetX=(width-graph.width*scale)/2,offsetY=0;
  useEffect(()=>{const element=container.current;if(!element)return;const observer=new ResizeObserver(([entry])=>setViewport({width:entry.contentRect.width,height:entry.contentRect.height}));observer.observe(element);return()=>observer.disconnect();},[]);
  const previousCamera=useRef<{scale:number;offsetX:number;offsetY:number;width:number;height:number}|null>(null);
  const pendingFocus=useRef<string|null>(null);
  const root=graph.nodes.find(n=>n.kind==='root')??graph.nodes[0];
  const activePath=new Set<string>();
  let ancestor=graph.nodes.find(n=>n.id===selected);
  while(ancestor&&!activePath.has(ancestor.id)){activePath.add(ancestor.id);ancestor=graph.nodes.find(n=>n.id===ancestor?.parentId);}
  function centerNode(id:string,behavior:ScrollBehavior='smooth'){
    const n=graph.nodes.find(n=>n.id===id),e=container.current;
    if(n&&e)e.scrollTo({left:offsetX+n.x*scale-viewport.width/2,top:n.kind==='root'?0:Math.max(0,n.y*scale-viewport.height*.3),behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':behavior});
  }
  useLayoutEffect(()=>{
    const e=container.current;if(!e)return;
    const old=previousCamera.current;
    if(pendingFocus.current){centerNode(pendingFocus.current,'auto');pendingFocus.current=null;}
    else if(root&&(!old||(zoom===null&&(old.width!==viewport.width||old.height!==viewport.height)))){centerNode(root.id,'auto');}
    else if(old&&old.scale!==scale){
      const worldX=(e.scrollLeft+old.width/2-old.offsetX)/old.scale;
      const worldY=(e.scrollTop+old.height/2-old.offsetY)/old.scale;
      e.scrollLeft=offsetX+worldX*scale-viewport.width/2;
      e.scrollTop=Math.max(0,worldY*scale-viewport.height/2);
    }
    previousCamera.current={scale,offsetX,offsetY,width:viewport.width,height:viewport.height};
  },[scale,offsetX,offsetY,viewport.width,viewport.height,graph,zoom]);
  function returnToMe(){onSelect('mojo');pendingFocus.current='mojo';setZoom(null);centerNode('mojo');}
  const matchingCount=skillNodes.filter(n=>(subject==='Keseluruhan'||n.subject===subject)&&n.name.toLowerCase().includes(query.toLowerCase())).length;
  return <div className="dynamic-map"><div className="graph-viewport" ref={container} tabIndex={0} aria-label={`Peta skill ${subject}. Gunakan tombol zoom atau geser untuk menjelajahi.`}
    onPointerDown={e=>{if(e.pointerType!=='mouse'||(e.target as HTMLElement).closest('button'))return;pointer.current={x:e.clientX,y:e.clientY,left:e.currentTarget.scrollLeft,top:e.currentTarget.scrollTop};e.currentTarget.setPointerCapture(e.pointerId);}}
    onPointerMove={e=>{if(!pointer.current)return;e.currentTarget.scrollLeft=pointer.current.left-(e.clientX-pointer.current.x);e.currentTarget.scrollTop=pointer.current.top-(e.clientY-pointer.current.y);}}
    onPointerUp={()=>{pointer.current=null;}} onPointerCancel={()=>{pointer.current=null;}}>
    <div className="graph-scroll-space" style={{width,height}}><div className="graph-surface" style={{width:graph.width,height:graph.height,transform:`translate(${offsetX}px,${offsetY}px) scale(${scale})`}}>
    <svg className="graph-edges" width={graph.width} height={graph.height} aria-hidden="true">{graph.edges.map(({from,to})=>{const sy=from.y+110,ty=to.y,mid=(sy+ty)/2;return <path key={to.id} className={activePath.has(to.id)?'travel-edge':to.mastery>0?'learned-edge':''} d={`M ${from.x} ${sy} C ${from.x} ${mid}, ${to.x} ${mid}, ${to.x} ${ty}`}/>;})}</svg>
    {graph.nodes.map(node=>{const Icon=iconFor(node),state=statusFor(node);const children=skillNodes.filter(n=>n.parentId===node.id);return <div className={`graph-node ${state.color} ${node.kind??''} ${selected===node.id?'is-selected':''}`} style={{left:node.x-72,top:node.y}} key={node.id}>
      <button className="graph-select" onClick={()=>{onSelect(node.id);centerNode(node.id)}} title={node.name} aria-pressed={selected===node.id} aria-label={`${node.name} — ${state.status}`}><span className="graph-disc"><Icon size={29} strokeWidth={2.6}/></span><span className="graph-label">{node.name}</span>{selected===node.id&&<span className="traveler-label">Kamu di sini</span>}</button>
      {children.length>0&&<button className="branch-toggle" aria-label={`${collapsed.has(node.id)?'Buka':'Tutup'} cabang ${node.name}`} aria-expanded={!collapsed.has(node.id)} onClick={()=>setCollapsed(old=>{const next=new Set(old);if(next.has(node.id))next.delete(node.id);else next.add(node.id);return next;})}>{collapsed.has(node.id)?<Plus size={13}/>:<Minus size={13}/>}<span>{children.length}</span></button>}
    </div>;})}</div></div>
    {!matchingCount&&<div className="graph-empty">Tidak ada skill “{query}”. Coba kata lain.</div>}
  </div><div className="graph-bottom"><span>{query?'Hasil pencarian & jalur prasyarat':'Mulai dari Me · Pilih skill untuk menjelajah'}</span><div className="graph-controls"><button aria-label="Perkecil peta" disabled={scale<=.15} onClick={()=>setZoom(Math.max(.15,scale-.15))}><Minus size={17}/></button><span>{Math.round(scale*100)}%</span><button aria-label="Perbesar peta" disabled={scale>=3} onClick={()=>setZoom(Math.min(3,scale+.15))}><Plus size={17}/></button><button aria-label="Kembali ke Me" title="Kembali ke titik awal" onClick={returnToMe}><LocateFixed size={17}/></button><button aria-label="Tampilkan seluruh peta" title="Pas dengan layar" onClick={()=>{setZoom(fit);pendingFocus.current=root?.id??null;container.current?.scrollTo({left:0,top:0})}}><Maximize2 size={17}/></button></div></div></div>;
}
