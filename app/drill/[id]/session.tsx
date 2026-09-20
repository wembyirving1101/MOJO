'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ArrowLeft,ArrowRight,BookOpen,Check,Clock3,Dumbbell,Gem,RotateCcw,Trophy} from 'lucide-react';
import type {Drill} from '../../../lib/drills';
export default function DrillSession({drill}:{drill:Drill}){
  const [index,setIndex]=useState(0);
  const [answers,setAnswers]=useState<Record<string,number>>({});
  const [checked,setChecked]=useState<Record<string,boolean>>({});
  const [finished,setFinished]=useState(false);
  const [attemptId,setAttemptId]=useState<number | null>(null);
  const heading=useRef<HTMLHeadingElement>(null);
  const attemptStarted=useRef(false);
  const question=drill.questions[index];
  const total=drill.questions.length;
  const score=drill.questions.filter(q=>checked[q.id]&&answers[q.id]===q.correct).length;
  const answered=Object.values(checked).filter(Boolean).length;
  useEffect(()=>{heading.current?.focus();},[index,finished]);
  useEffect(() => {
  if (attemptStarted.current) return;

  attemptStarted.current = true;

  async function startAttempt() {
    try {
      const response = await fetch('/api/attempts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 1,
          drillId: drill.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal membuat attempt');
      }

      const data = await response.json();

      setAttemptId(data.id);

      console.log('Attempt started:', data);
    } catch (error) {
      console.error('Failed to start attempt:', error);
    }
  }

  startAttempt();
}, [drill.id]);
  function restart(){setIndex(0);setAnswers({});setChecked({});setFinished(false);}
  return <div className="drill-page"><header className="drill-page-header"><Link href="/drill" className="drill-back"><ArrowLeft size={19}/>Kembali ke Drill</Link><Link href="/" className="drill-wordmark">Mojo<span>.</span></Link><span className="drill-demo-tag">Latihan mockup</span></header>
    <main className="drill-session-main">{finished?<section className="drill-result"><span className="result-trophy"><Trophy size={44}/></span><p className="eyebrow">SATU LANGKAH LEBIH MAJU</p><h1 ref={heading} tabIndex={-1}>Latihan selesai!</h1><p>Kamu sudah menyelesaikan {drill.title.toLowerCase()}. Lihat kembali jawabanmu dan terus bertumbuh.</p><div className="result-stats"><div><strong>{score}<small>/{total}</small></strong><span>Jawaban benar</span></div><div><strong>{Math.round(score/total*100)}%</strong><span>Akurasi</span></div><div><strong>+{drill.xp}</strong><span>XP demo</span></div></div><div className="result-actions"><Link className="primary" href="/drill">Pilih latihan lain <ArrowRight size={18}/></Link><button className="session-secondary" onClick={restart}><RotateCcw size={17}/>Ulangi latihan</button></div><div className="answer-review"><h2>Pembahasan jawaban</h2>{drill.questions.map((q,i)=><article key={q.id}><span className={answers[q.id]===q.correct?'review-correct':'review-wrong'}>{answers[q.id]===q.correct?'Benar':'Perlu latihan'} · Soal {i+1}</span><h3>{q.text}</h3><p>Jawabanmu: {q.answers[answers[q.id]]??'Belum dijawab'}</p><p><strong>Jawaban benar: {q.answers[q.correct]}</strong></p><p>{q.explanation}</p></article>)}</div></section>:<><div className="session-heading"><div><p className="eyebrow"><Dumbbell size={16}/>{drill.subject}</p><h1 ref={heading} tabIndex={-1}>{drill.title}<span className="mint-text">.</span></h1><p>{drill.topic} · Satu soal, satu langkah lebih dekat.</p></div><span className="session-time"><Clock3 size={17}/>±{drill.minutes} menit</span></div><div className="session-columns"><section className="session-question-card"><div className="session-progress-label"><strong>Soal {index+1} <span>/ {total}</span></strong><span>{answered} dari {total} diperiksa</span></div><div className="quiz-progress" role="progressbar" aria-label="Soal yang diperiksa" aria-valuemin={0} aria-valuemax={total} aria-valuenow={answered}><span style={{width:`${answered/total*100}%`}}/></div><h2 className="session-question" id="question-title">{question.text}</h2><div className="answers" role="group" aria-labelledby="question-title">{question.answers.map((answer,i)=><button key={i} disabled={checked[question.id]} aria-pressed={answers[question.id]===i} className={`answer ${answers[question.id]===i?'chosen':''} ${checked[question.id]&&i===question.correct?'correct':''} ${checked[question.id]&&answers[question.id]===i&&i!==question.correct?'incorrect':''}`} onClick={()=>setAnswers({...answers,[question.id]:i})}><b>{String.fromCharCode(65+i)}</b><span>{answer}</span>{checked[question.id]&&i===question.correct&&<Check size={18}/>}</button>)}</div>{checked[question.id]&&<div className="explanation" role="status"><strong>{answers[question.id]===question.correct?'Tepat sekali!':'Belum tepat. Yuk, pahami bersama.'}</strong><p>{question.explanation}</p></div>}<div className="session-actions"><button className="session-secondary" disabled={index===0} onClick={()=>setIndex(index-1)}><ArrowLeft size={17}/>Sebelumnya</button><button className="primary" disabled={answers[question.id]===undefined} onClick={()=>{if(!checked[question.id])setChecked({...checked,[question.id]:true});else if(index===total-1)setFinished(true);else setIndex(index+1);}}>{!checked[question.id]?'Periksa jawaban':index===total-1?'Lihat hasil':'Selanjutnya'}<ArrowRight size={18}/></button></div></section><aside className="session-side"><span className="detail-icon mint"><BookOpen size={27}/></span><h2>Fokus satu per satu.</h2><p>{drill.description}</p><div className="session-side-divider"/><span><Gem size={18}/>+{drill.xp} XP setelah selesai</span><p className="session-note">Tidak perlu buru-buru. Pahami pembahasannya sebelum melanjutkan.</p><Link href="/drill">Lihat semua latihan <ArrowRight size={15}/></Link></aside></div></>}</main><footer className="drill-page-footer">Pelan-pelan, asal terus jalan. <span>✦</span></footer></div>;
}
