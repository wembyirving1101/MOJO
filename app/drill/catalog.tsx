'use client';

import {useState} from 'react';
import Link from 'next/link';
import {ArrowLeft, ArrowRight, Search, Target, X, Clock3, BookOpen} from 'lucide-react';
import type {Drill} from '../../lib/drills';
import {drillSubjects, drillModes, subjectSkills, subjectDrills, overallDrill} from '../../lib/drill-catalog';
import {iconFor} from '../skill-map';
import {relaxedDrill, generatedSkills} from '../../lib/relaxed-questions';

export default function DrillCatalog({drills, subjectId}: {drills: Drill[]; subjectId?: string}) {
  const [query, setQuery] = useState('');
  const [selection, setSelection] = useState<string | null>(null);
  const subject = drillSubjects.find(node => node.id === subjectId);
  const skills = subjectSkills(subjectId ?? '');
  const available = subjectDrills(drills, subjectId ?? '');
  const selectedSkill = skills.find(node => node.id === selection);
  const needle = query.trim().toLocaleLowerCase();
  const visibleSubjects = drillSubjects.filter(node => node.name.toLocaleLowerCase().includes(needle) || subjectSkills(node.id).some(skill => skill.name.toLocaleLowerCase().includes(needle)));

  if (subject && selection) return <>
    <button className="picker-back" onClick={() => setSelection(null)}><ArrowLeft size={16}/>Kembali ke skill {subject.name}</button>
    <div className="page-heading"><div><p className="eyebrow">PILIH CARA BELAJARMU</p><h1>{selectedSkill?.name ?? `Tes keseluruhan ${subject.name}`}<span className="mint-text">.</span></h1><p>Pilih ritme latihan yang cocok untukmu.</p></div></div>
    <div className="drill-cards">{drillModes.map(mode => {
      const drill = mode.id === 'quick' ? relaxedDrill(subject.id, selectedSkill?.id) : overallDrill(drills, subject.id, mode.id, selectedSkill?.id);
      const Icon = mode.id === 'quick' ? Clock3 : mode.id === 'deep' ? BookOpen : Target;
      return <section className="drill-card" key={mode.id}><span className={`detail-icon ${mode.color}`}><Icon size={34}/></span><h2>{mode.name}</h2><p>{mode.description}</p>
        {drill ? <><span className="muted">{mode.id === 'quick' ? 'Soal tanpa batas · Tanpa batas waktu' : `${drill.questions.length} soal · ±${drill.minutes} menit`}</span><Link className="primary" href={`/drill/subject/${subject.id}/${mode.id}${selectedSkill ? `?skill=${encodeURIComponent(selectedSkill.id)}` : ''}`}>Mulai latihan <ArrowRight size={18}/></Link></> : <><span className="muted">Soal untuk pilihan ini belum tersedia.</span><button className="primary" disabled>Segera hadir</button></>}
      </section>;
    })}</div>
    <p className="catalog-session-note">Latihan menggunakan soal yang tersedia. Latihan Kelemahan memakai paket fokus yang sudah disiapkan; personalisasi dari profil dan penyimpanan hasil belum tersedia.</p>
  </>;

  return <>
    {subject && <Link className="picker-back" href="/drill"><ArrowLeft size={16}/>Semua materi</Link>}
    <div className="page-heading"><div><p className="eyebrow">SEDIKIT LATIHAN, BANYAK KEMAJUAN</p><h1>{subject?.name ?? 'Drills'}<span className="mint-text">.</span></h1><p>{subject ? 'Pilih satu skill atau uji pemahaman seluruh materi.' : 'Pilih materi, temukan skill, dan mulai langkah berikutnya.'}</p></div></div>
    <label className="catalog-search"><Search size={21}/><input aria-label={subject ? `Cari skill ${subject.name}` : 'Cari materi atau skill'} placeholder={subject ? `Cari skill ${subject.name.toLowerCase()}...` : 'Cari skill atau materi...'} value={query} onChange={e => setQuery(e.target.value)}/>{query && <button aria-label="Hapus pencarian" onClick={() => setQuery('')}><X size={18}/></button>}</label>
    {subject ? <>
      <button className="overall-option" onClick={() => setSelection('overall')}><Target size={25}/><span><strong>Tes keseluruhan {subject.name}</strong><small>Pilih Latihan Santai, Latihan Dalam, atau Latihan Kelemahan</small></span><ArrowRight size={20}/></button>
      <p className="picker-label">ATAU FOKUS SATU SKILL</p><div className="subject-skill-grid">{skills.filter(node => node.name.toLocaleLowerCase().includes(needle)).map(node => {
        const Icon = iconFor(node); const count = available.filter(d => d.skillId === node.id).length;
        return <button className="skill-option" key={node.id} onClick={() => setSelection(node.id)}><Icon size={22}/><span><strong>{node.name}</strong><small>{generatedSkills.includes(node.id) ? 'Latihan Santai tersedia' : count ? `${count} latihan tersedia` : 'Latihan segera hadir'}</small></span><ArrowRight size={18}/></button>;
      })}</div>
      {!skills.some(node => node.name.toLocaleLowerCase().includes(needle)) && <p className="catalog-empty" role="status">Skill tidak ditemukan dalam {subject.name}.</p>}
    </> : <>
      <div className="catalog-filters" aria-label="Kategori latihan"><button disabled>Semua</button><button className="current" aria-pressed="true">SNBT</button><button disabled>Populer</button></div>
      <div className="subject-card-grid">{visibleSubjects.map(node => {
        const Icon = iconFor(node);
        return <Link className={`subject-card subject-${node.id}`} key={node.id} href={`/drill/subject/${node.id}`}>
          <span className="subject-card-top"><span className="subject-symbol"><Icon size={36}/></span><span className="subject-badge">SNBT</span></span>
          <h2>{node.name}</h2><p>{node.description}</p><span className="subject-card-bottom"><span>{subjectSkills(node.id).length} skill untuk dijelajahi</span><ArrowRight size={22}/></span>
        </Link>;
      })}</div>
      {!visibleSubjects.length && <p className="catalog-empty" role="status">Tidak ada materi atau skill yang cocok. Coba kata lain.</p>}
    </>}
  </>;
}
