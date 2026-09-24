'use client';

import {useEffect, useRef, useState} from 'react';
import Link from 'next/link';
import {ArrowLeft, ArrowRight, Check, Infinity as InfinityIcon} from 'lucide-react';
import {generateQuestion} from '../../lib/relaxed-questions';
import type {DrillQuestion} from '../../lib/drills';

type Review = {question: DrillQuestion; answer: number};
type Session = {
  question: DrillQuestion | null; selected: number | null; checked: boolean;
  answered: number; score: number; finished: boolean; recent: Review[];
};
const emptySession: Session = {question: null, selected: null, checked: false, answered: 0, score: 0, finished: false, recent: []};

export default function RelaxedSession({skillIds, topic, subject}: {skillIds: string[]; topic: string; subject: string}) {
  const [session, setSession] = useState<Session>(emptySession);
  const heading = useRef<HTMLHeadingElement>(null);
  // Generate after hydration so random questions agree with the initial server render.
  useEffect(() => {
    setSession({...emptySession, question: generateQuestion(skillIds[0], 1)});
  }, [skillIds.join(',')]);
  useEffect(() => {heading.current?.focus();}, [session.question?.id, session.finished]);
  const {question, selected, checked, answered, score, finished, recent} = session;

  function checkAnswer() {
    setSession(current => {
      if (!current.question || current.selected === null || current.checked) return current;
      return {...current, checked: true, answered: current.answered + 1,
        score: current.score + Number(current.selected === current.question.correct),
        recent: [...current.recent, {question: current.question, answer: current.selected}].slice(-20)};
    });
  }
  function nextQuestion() {
    if (!checked) return;
    const skillId = skillIds[answered % skillIds.length];
    let next = generateQuestion(skillId, answered + 1);
    for (let retry = 0; retry < 8 && next.text === question?.text; retry++) next = generateQuestion(skillId, answered + 1);
    setSession(current => current.checked ? {...current, question: next, selected: null, checked: false} : current);
  }
  function restart() {
    setSession({...emptySession, question: generateQuestion(skillIds[0], 1)});
  }

  return <div className="drill-page">
    <header className="drill-page-header"><Link href="/drill" className="drill-back"><ArrowLeft size={19}/>Kembali ke Drill</Link><Link href="/" className="drill-wordmark">Mojo<span>.</span></Link><span className="drill-demo-tag">Tanpa batas waktu</span></header>
    <main className="drill-session-main">
      {finished ? <section className="drill-result">
        <p className="eyebrow">SESUAI RITMEMU</p><h1 ref={heading} tabIndex={-1}>Cukup untuk hari ini.</h1><p>{answered ? 'Setiap soal adalah satu langkah maju. Kamu bisa berlatih lagi kapan pun.' : 'Belum ada jawaban yang diperiksa. Mulai lagi saat kamu siap.'}</p>
        <div className="result-stats"><div><strong>{answered}</strong><span>Soal dikerjakan</span></div><div><strong>{score}</strong><span>Jawaban benar</span></div><div><strong>{answered ? `${Math.round(score / answered * 100)}%` : '—'}</strong><span>Akurasi</span></div></div>
        <div className="result-actions"><button className="primary" onClick={restart}>Mulai sesi baru <ArrowRight size={18}/></button><Link className="session-secondary" href="/drill">Pilih materi lain</Link></div>
        {recent.length > 0 && <div className="answer-review"><h2>Pembahasan {recent.length} soal terakhir</h2>{recent.map(({question: q, answer}, i) => <article key={q.id}><span className={answer === q.correct ? 'review-correct' : 'review-wrong'}>{answer === q.correct ? 'Benar' : 'Perlu latihan'} · Soal {answered - recent.length + i + 1}</span><h3>{q.text}</h3><p>Jawabanmu: {q.answers[answer].text}</p><p><strong>Jawaban benar: {q.answers[q.correct].text}</strong></p><p>{q.explanation}</p></article>)}</div>}
      </section> : <>
        <div className="session-heading"><div><p className="eyebrow">{subject} · {topic}</p><h1 ref={heading} tabIndex={-1}>Latihan Santai<span className="mint-text">.</span></h1><p>Tidak perlu buru-buru. Berhenti kapan pun kamu mau.</p></div><span className="session-time"><InfinityIcon size={21}/>Tanpa batas waktu</span></div>
        <div className="session-columns"><section className="session-question-card">
          {question ? <><div className="session-progress-label"><strong>Soal {checked ? answered : answered + 1}</strong><span>{answered} dikerjakan · {score} benar</span></div>
            <h2 className="session-question" id="relaxed-question">{question.text}</h2>
            <div className="answers" role="group" aria-labelledby="relaxed-question">{question.answers.map((answer, i) => <button key={answer.id} disabled={checked} aria-pressed={selected === i} className={`answer ${selected === i ? 'chosen' : ''} ${checked && i === question.correct ? 'correct' : ''} ${checked && selected === i && i !== question.correct ? 'incorrect' : ''}`} onClick={() => setSession(current => ({...current, selected: i}))}><b>{String.fromCharCode(65 + i)}</b><span>{answer.text}</span>{checked && i === question.correct && <Check size={18}/>}</button>)}</div>
            {checked && <div className="explanation" role="status"><strong>{selected === question.correct ? 'Tepat sekali!' : 'Yuk, pahami bersama.'}</strong><p>{question.explanation}</p></div>}
            <div className="session-actions"><button className="session-secondary" onClick={() => setSession(current => ({...current, finished: true}))}>Akhiri sesi</button><button className="primary" disabled={selected === null} onClick={checked ? nextQuestion : checkAnswer}>{checked ? 'Soal berikutnya' : 'Periksa jawaban'}<ArrowRight size={18}/></button></div>
          </> : <p role="status">Menyiapkan soal...</p>}
        </section><aside className="session-side"><InfinityIcon size={32}/><h2>Belajar tanpa tekanan.</h2><p>Soal baru tersedia setiap kali kamu lanjut. Tidak ada target jumlah soal atau batas waktu.</p><p className="session-note">Pahami pembahasannya, istirahat jika perlu, lalu lanjut sesuai ritmemu.</p><p className="session-note">Ringkasan berlaku selama sesi ini dibuka. Memuat ulang halaman memulai sesi baru.</p></aside></div>
      </>}
    </main><footer className="drill-page-footer">Pelan-pelan, asal terus jalan. <span>✦</span></footer>
  </div>;
}
