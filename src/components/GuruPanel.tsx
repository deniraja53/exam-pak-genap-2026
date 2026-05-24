import React, { useState, useEffect } from 'react';
import { ExamIcons } from './Icons';
import { googleAppsScriptTemplate, ExamResultPayload } from '../services/submission';

interface GuruPanelProps {
  onClose: () => void;
  webAppUrl: string;
  setWebAppUrl: (url: string) => void;
  teacherEmail: string;
  setTeacherEmail: (email: string) => void;
}

export const GuruPanel: React.FC<GuruPanelProps> = ({
  onClose,
  webAppUrl,
  setWebAppUrl,
  teacherEmail,
  setTeacherEmail,
}) => {
  const [activeTab, setActiveTab] = useState<'results' | 'setup' | 'script'>('results');
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  // Configuration editing states
  const [localWebAppUrl, setLocalWebAppUrl] = useState(webAppUrl);
  const [localTeacherEmail, setLocalTeacherEmail] = useState(teacherEmail);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setLocalWebAppUrl(webAppUrl);
  }, [webAppUrl]);

  useEffect(() => {
    setLocalTeacherEmail(teacherEmail);
  }, [teacherEmail]);

  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('guru_panel_logged_in') === 'true';
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginEmail.trim().toLowerCase() === 'deniraja53@guru.sd.belajar.id' && loginPassword === '25031991') {
      setIsLoggedIn(true);
      sessionStorage.setItem('guru_panel_logged_in', 'true');
      setLoginError('');
    } else {
      setLoginError('Kombinasi Email atau Password salah! Akses ditolak.');
    }
  };

  // Load submissions from localStorage
  const loadSubmissions = () => {
    try {
      const stored = localStorage.getItem('pak_exam_submissions');
      if (stored) {
        setSubmissions(JSON.parse(stored));
      } else {
        setSubmissions([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(googleAppsScriptTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGradeEssayElement = (subIndex: number, essayIdx: number, score: number) => {
    const updated = [...submissions];
    const sub = updated[subIndex];
    
    // Assign score
    sub.essayAnswers[essayIdx].assignedScore = Math.max(0, Math.min(sub.essayAnswers[essayIdx].maxScore || 3, score));
    
    // Recalculate total score
    // Max score calculation
    const maxScore = sub.kelas === "Kelas 4" ? 70 : 70;
    
    // PG score (already extracted, let's parse from string like "28 / 30" -> 28)
    const pgScore = parseInt(sub.nilaiPG.split(' ')[0]) || 0;
    // Isian score (parsed from "16 / 20" -> 16)
    const isianScore = parseInt(sub.nilaiIsian.split(' ')[0]) || 0;
    
    // Current Essay scores sum
    const totalEssayScore = sub.essayAnswers.reduce((sum: number, item: any) => sum + (item.assignedScore || 0), 0);
    
    const perolehanTotal = pgScore + isianScore + totalEssayScore;
    sub.nilaiAkhir = (perolehanTotal / maxScore) * 100;
    
    // Save
    localStorage.setItem('pak_exam_submissions', JSON.stringify(updated));
    setSubmissions(updated);
    if (selectedSub && selectedSub.id === sub.id) {
      setSelectedSub({ ...sub });
    }
  };

  const handleClearSubmissions = () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua hasil ujian yang tersimpan secara lokal?")) {
      localStorage.removeItem('pak_exam_submissions');
      loadSubmissions();
      setSelectedSub(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xl p-4 sm:p-6 flex items-center justify-center">
        <div 
          style={{
            background: "linear-gradient(135deg, rgba(8, 20, 15, 0.95) 0%, rgba(12, 10, 5, 0.98) 100%)",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.7), inset 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 30px rgba(245, 158, 11, 0.15)"
          }}
          className="w-full max-w-md border border-amber-500/30 rounded-[32px] p-6 sm:p-9 relative overflow-hidden"
        >
          {/* Subtle decoration lights */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-4">
            {/* Lock Emblem */}
            <div className="flex justify-center">
              <div className="relative p-4 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <ExamIcons.Lock size={40} className="animate-pulse" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-amber-400 tracking-[0.25em] font-sans uppercase">
                OTENTIKASI KHUSUS GURU
              </span>
              <h3 className="text-2xl font-black text-white font-sans tracking-tight">
                Keamanan Guru Panel
              </h3>
              <p className="text-xs text-slate-400 font-sans max-w-xs mx-auto">
                Silakan lakukan otentikasi akun Guru SDN Kejuron untuk membuka data pengerjaan ujian siswa.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4 pt-4 text-left">
              {loginError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-350 font-semibold text-center animate-shake">
                  {loginError}
                </div>
              )}

              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs text-slate-300 font-bold tracking-wider uppercase">
                  EMAIL BELAJAR.ID GURU :
                </label>
                <input
                  type="email"
                  required
                  placeholder="deniraja53@guru.sd.belajar.id"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-sans text-white placeholder-slate-600 focus:outline-hidden focus:border-amber-400/60 transition shadow-inner"
                />
              </div>

              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs text-slate-300 font-bold tracking-wider uppercase">
                  PASSWORD GURU :
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm font-sans text-white placeholder-slate-600 focus:outline-hidden focus:border-amber-400/60 transition shadow-inner"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 border border-white/10 hover:bg-white/5 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-800 to-emerald-900 hover:from-emerald-700 hover:to-emerald-800 border border-emerald-500/30 text-white font-sans font-black text-xs tracking-widest rounded-xl shadow-[0_4px_25px_rgba(6,78,59,0.3)] active:scale-[0.99] transition cursor-pointer"
                >
                  MASUK
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-md p-4 sm:p-6 flex items-center justify-center">
      <div className="w-full max-w-5xl rounded-[30px] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-white/5 px-6 py-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
              <ExamIcons.Admin className="text-amber-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-amber-300 font-sans tracking-tight">GURU DASHBOARD & SETTINGS</h2>
              <p className="text-xs text-emerald-300 font-mono">SDN Kejuron Kota Madiun • Control Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsLoggedIn(false);
                sessionStorage.removeItem('guru_panel_logged_in');
              }}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 text-rose-300 rounded-full text-xs font-bold uppercase transition flex items-center gap-1 cursor-pointer"
            >
              Keluar Sesi Guru
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/20 text-emerald-100 rounded-full text-xs font-semibold uppercase transition flex items-center gap-1 cursor-pointer"
            >
              <ExamIcons.Prev size={13} /> Kembali
            </button>
          </div>
        </div>

        {/* Tabs navigation */}
        <div className="flex border-b border-white/10 bg-white/5 px-6 py-2 overflow-x-auto gap-2">
          <button
            onClick={() => setActiveTab('results')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
              activeTab === 'results' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            📋 Hasil Ujian Siswa ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
              activeTab === 'setup' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            ⚙️ Integrasi Sheets & Email
          </button>
          <button
            onClick={() => setActiveTab('script')}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
              activeTab === 'script' 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            📜 Template Google Apps Script
          </button>
        </div>

        {/* Dynamic Panel Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          
          {activeTab === 'results' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-bold text-emerald-300 font-sans">Daftar Hasil Ujian Siswa</h3>
                  <p className="text-xs text-gray-400">Total {submissions.length} siswa telah menyelesaikan ujian dan tersimpan lokal.</p>
                </div>
                {submissions.length > 0 && (
                  <button
                    onClick={handleClearSubmissions}
                    className="px-3 py-1.5 bg-red-950/30 hover:bg-red-900/40 border border-red-500/40 text-red-300 text-xs rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <ExamIcons.Reset size={14} /> Bersihkan Data
                  </button>
                )}
              </div>

              {submissions.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-[24px] p-10 text-center text-emerald-300 font-sans shadow-lg">
                  <ExamIcons.Sheet className="mx-auto mb-3 opacity-35 text-amber-400 animate-pulse" size={48} />
                  <p className="font-bold text-amber-400 uppercase tracking-wider text-sm">Belum Ada Siswa yang Mengirim</p>
                  <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto leading-relaxed">Masuklah sebagai siswa kelas 4 atau 5 dari halaman depan, kerjakan ujian sampai selesai, lalu kirim hasil ujian untuk melihatnya di sini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Results List */}
                  <div className="lg:col-span-1 space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                    {submissions.map((sub, idx) => (
                      <div
                        key={sub.id || idx}
                        onClick={() => setSelectedSub(sub)}
                        className={`p-4 rounded-[18px] border text-left cursor-pointer transition-all ${
                          selectedSub?.id === sub.id
                            ? 'bg-amber-500/10 border-amber-500/70 shadow-lg shadow-amber-500/5'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-amber-200 text-sm truncate">{sub.nama}</h4>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            sub.kelas === "Kelas 5" ? "bg-cyan-950/45 text-cyan-300 border border-cyan-800/30" : "bg-teal-950/45 text-teal-300 border border-teal-800/30"
                          }`}>
                            {sub.kelas}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-1">{sub.sekolah}</p>
                        
                        <div className="mt-3 flex justify-between items-center border-t border-white/10 pt-2">
                          <div className="text-[10px] font-mono text-emerald-350">
                            Akhir: <span className="text-amber-400 font-bold">{sub.nilaiAkhir.toFixed(1)}%</span>
                          </div>
                          <span className={`text-[10px] flex items-center gap-1 ${sub.violationsCount > 0 ? 'text-rose-450 font-semibold' : 'text-emerald-300'}`}>
                            <ExamIcons.Security size={10} /> {sub.violationsCount > 0 ? `${sub.violationsCount} Pelanggaran` : 'Aman'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submission Inspector & Manual Essay Grade */}
                  <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-[24px] p-5 sm:p-6 shadow-inner">
                    {selectedSub ? (
                      <div className="space-y-4">
                        <div className="border-b border-emerald-900/30 pb-3 flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <span className="text-xs text-amber-400 font-mono font-semibold uppercase">{selectedSub.kelas} Exam Summary</span>
                            <h3 className="text-xl font-bold text-amber-100">{selectedSub.nama}</h3>
                            <p className="text-xs text-gray-400">{selectedSub.sekolah} • {selectedSub.waktuSubmit}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-gray-400 block font-mono">Nilai Akhir</span>
                            <span className="text-2xl font-black text-amber-300 font-mono bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 inline-block mt-0.5">
                              {selectedSub.nilaiAkhir.toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        {/* Grading stats row */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-emerald-950/35 border border-emerald-900/30 rounded-lg p-2.5 text-center">
                            <span className="text-[10px] text-emerald-400 block">Pilihan Ganda (PG)</span>
                            <span className="text-sm font-bold text-amber-200 mt-1 block">{selectedSub.nilaiPG}</span>
                          </div>
                          <div className="bg-emerald-950/35 border border-emerald-900/30 rounded-lg p-2.5 text-center">
                            <span className="text-[10px] text-emerald-400 block">Isian Singkat</span>
                            <span className="text-sm font-bold text-amber-200 mt-1 block">{selectedSub.nilaiIsian}</span>
                          </div>
                          <div className="bg-emerald-950/35 border border-emerald-900/30 rounded-lg p-2.5 text-center">
                            <span className="text-[10px] text-emerald-400 block">Pelanggaran Fullscreen</span>
                            <span className={`text-sm font-bold mt-1 block ${selectedSub.violationsCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                              {selectedSub.violationsCount} Kali
                            </span>
                          </div>
                        </div>

                        {/* Essay grading panel */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-amber-300 font-sans border-b border-emerald-900/20 pb-1 flex items-center gap-1.5">
                            ✍️ Penilaian Manual Jawaban Uraian / Essay ({selectedSub.essayAnswers?.length || 0} Soal)
                          </h4>

                          <div className="space-y-4 max-h-[35vh] overflow-y-auto pr-1">
                            {selectedSub.essayAnswers?.map((essay: any, jIdx: number) => (
                              <div key={jIdx} className="bg-emerald-950/15 border border-emerald-900/20 rounded-lg p-3 space-y-2">
                                <div className="flex justify-between items-start gap-2">
                                  <h5 className="text-xs font-bold text-emerald-300">Soal {jIdx + 1}: {essay.question}</h5>
                                  <span className="text-[10px] font-mono text-amber-400 whitespace-nowrap bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                                    Skor Maks: {essay.maxScore || 4}
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">Jawaban Siswa:</span>
                                  <div className="bg-slate-950/60 p-2.5 rounded text-xs text-amber-100 border border-slate-900 font-sans italic">
                                    {essay.answer || <span className="text-red-400/80 not-italic">Siswa tidak menjawab soal ini.</span>}
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <span className="text-[10px] uppercase tracking-wider text-emerald-400 block font-semibold">Referensi Kunci Jawaban:</span>
                                  <div className="bg-emerald-950/25 p-2.5 rounded text-xs text-emerald-200 border border-emerald-900/20 font-sans">
                                    {essay.reference}
                                  </div>
                                </div>

                                {/* Score Assigner */}
                                <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-emerald-900/10">
                                  <span className="text-xs text-emerald-300">Berikan Nilai untuk Soal ini:</span>
                                  <div className="flex items-center gap-1">
                                    {Array.from({ length: (essay.maxScore || 4) + 1 }).map((_, pt) => (
                                      <button
                                        key={pt}
                                        onClick={() => {
                                          const subIndex = submissions.findIndex(item => item.id === selectedSub.id);
                                          if (subIndex !== -1) {
                                            handleGradeEssayElement(subIndex, jIdx, pt);
                                          }
                                        }}
                                        className={`w-7 h-7 rounded text-xs font-mono font-bold transition flex items-center justify-center cursor-pointer ${
                                          (essay.assignedScore ?? 0) === pt
                                            ? 'bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20'
                                            : 'bg-emerald-900/30 text-emerald-300 hover:bg-emerald-800/40 border border-emerald-600/20'
                                        }`}
                                      >
                                        {pt}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    ) : (
                      <div className="text-center text-gray-400 py-16">
                        <ExamIcons.Info className="mx-auto mb-2 text-emerald-500" size={32} />
                        <p className="font-sans text-sm">Pilih siswa di sebelah kiri untuk melihat detail jawaban, status kecurangan, dan memberikan penilaian manual untuk kategori Soal Essay/Uraian.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'setup' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 sm:p-5 space-y-4">
                <h3 className="font-bold text-amber-300 text-sm font-sans flex items-center gap-1.5 border-b border-emerald-900/40 pb-2">
                  <ExamIcons.School size={18} /> Konfigurasi Integrasi Data Sekolah
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Aplikasi ini dirancang untuk mengirimkan hasil ujian secara instan ke Google Spreadsheet dan memberikan notifikasi email otomatis ke akun guru yang bersangkutan. 
                </p>

                {saveSuccess && (
                  <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-bold font-sans text-center flex items-center justify-center gap-2 animate-bounce">
                    <span>✓</span> Konfigurasi Sukses Tersimpan! Koneksi Google Spreadsheet SDN Kejuron telah aktif.
                  </div>
                )}

                <div className="space-y-4 pt-2">
                  {/* WebApp Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-emerald-300 font-sans font-medium flex items-center gap-1">
                      Google Apps Script Web App URL <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="https://script.google.com/macros/s/..."
                      value={localWebAppUrl}
                      onChange={(e) => setLocalWebAppUrl(e.target.value)}
                      className="w-full bg-slate-950/60 border border-emerald-800/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-emerald-500 font-mono focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-gray-400 leading-relaxed block">
                      Kosongkan untuk mengaktifkan <b>Mode Simulasi Visual</b> (sangat bagus untuk demonstrasi di AI Studio). Jika diisi dengan URL hasil deploy Web App dari Google Apps Script, data akan dikirimkan ke Spreadsheet asli.
                    </span>
                  </div>

                  {/* Email Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-emerald-300 font-sans font-medium">
                      Email Tujuan Notifikasi Guru
                    </label>
                    <input
                      type="email"
                      placeholder="deniraja53@guru.sd.belajar.id"
                      value={localTeacherEmail}
                      onChange={(e) => setLocalTeacherEmail(e.target.value)}
                      className="w-full bg-slate-950/60 border border-emerald-800/60 rounded-lg px-3 py-2 text-xs text-white focus:outline-emerald-500 font-mono focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-gray-400 block">
                      Email tujuan hasil pengerjaan otomatis & status kepatuhan ujian siswa. Default diatur ke account belajar guru Anda.
                    </span>
                  </div>

                  {/* Save Configuration Button */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setWebAppUrl(localWebAppUrl);
                        setTeacherEmail(localTeacherEmail);
                        setSaveSuccess(true);
                        setTimeout(() => setSaveSuccess(false), 4000);
                      }}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-sans font-black text-xs tracking-widest rounded-xl shadow-[0_4px_15px_rgba(245,158,11,0.3)] active:scale-[0.99] transition cursor-pointer uppercase flex items-center justify-center gap-2"
                    >
                      <ExamIcons.Success size={14} />
                      Simpan Konfigurasi Integrasi
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex gap-3 items-start">
                <ExamIcons.Success className="text-amber-400 shrink-0 mt-0.5" size={18} />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-amber-200 uppercase font-sans tracking-wide">Panduan Sambungan</h4>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    Untuk menautkan aplikasi ini ke spreadsheet Anda, buka tab <b>Template Google Apps Script</b> di atas, salin kodenya, kemudian tempelkan pada Google Sheet milik guru di menu <i>Extensions &gt; Apps Script</i>. Deploy sebagai Web App dengan izin akses "Anyone" (Siapa saja).
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'script' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-950/50 p-2.5 rounded-lg border border-emerald-900/30">
                <div className="text-left">
                  <h4 className="text-xs font-bold text-amber-300">Kode Google Apps Script Guna Integrasi</h4>
                  <p className="text-[10px] text-emerald-400">Gunakan ini untuk otomatis mendata ke Google Sheets plus kirim email.</p>
                </div>
                <button
                  onClick={handleCopyScript}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold border border-amber-400 rounded-lg text-xs transition flex items-center gap-1 shadow-md cursor-pointer"
                >
                  <ExamIcons.Sheet size={13} /> {copied ? "Tersalin!" : "Salin Kode"}
                </button>
              </div>

              <div className="bg-slate-950 rounded-xl border border-emerald-900/30 p-4 max-h-[40vh] overflow-y-auto">
                <pre className="text-[11px] text-emerald-200 font-mono text-left select-all whitespace-pre-wrap leading-relaxed">
                  {googleAppsScriptTemplate}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer info */}
        <div className="bg-slate-950/80 px-6 py-4 border-t border-emerald-900/40 text-center flex flex-col sm:flex-row justify-between items-center gap-2">
          <span className="text-[10px] text-gray-400 font-sans">© 2026 PAK EXAM SDN KEJURON. All Rights Reserved.</span>
          <span className="text-[10px] text-amber-400 font-mono">Kota Madiun, Jawa Timur • Terkoneksi Aman</span>
        </div>

      </div>
    </div>
  );
};
