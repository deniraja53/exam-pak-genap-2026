import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExamIcons } from './components/Icons';
import { CinematicBackground } from './components/CinematicBackground';
import { questionsData, Question, MultipleChoiceQuestion, IsianQuestion, EssayQuestion } from './data/questionsData';
import { GuruPanel } from './components/GuruPanel';
import { sendExamResultToGoogleSheets, sendTeacherEmail, ExamResultPayload } from './services/submission';

export default function App() {
  // Navigation & Screen states
  const [appState, setAppState] = useState<'loading' | 'login' | 'petunjuk' | 'pilih-kelas' | 'exam' | 'selesai'>('loading');
  const [showGuruPanel, setShowGuruPanel] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Student Identity
  const [studentName, setStudentName] = useState('');
  const [schoolName, setSchoolName] = useState('SDN KEJURON MADIUN');
  const [selectedClassId, setSelectedClassId] = useState<4 | 5 | null>(null);

  // Config parameters
  const [webAppUrl, setWebAppUrl] = useState('https://script.google.com/macros/s/AKfycbz2P2DtbhVsVWhOzXYyPqXD0y8Yj83vt6hLnNeTA8zjqtIU3JtMSsjr5au361ts6fn-/exec');
  const [teacherEmail, setTeacherEmail] = useState('deniraja53@guru.sd.belajar.id');

  // Exam Progress states
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [studentAnswers, setStudentAnswers] = useState<{ [qId: number]: string }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]); // "ragu-ragu"
  const [timeLeft, setTimeLeft] = useState(90 * 60); // 90 minutes in seconds
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string>('');

  // Security violations monitoring
  const [violationsCount, setViolationsCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [violationMessage, setViolationMessage] = useState('');

  // Final Results
  const [evaluationResult, setEvaluationResult] = useState<{
    correctCountPG: number;
    correctCountIsian: number;
    pgScore: number;
    isianScore: number;
    totalPossibleScore: number;
    tentativeScore: number; // percentage
  } | null>(null);

  // Network State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState('');
  
  // Web browser alert/confirm iframe safety
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [unansweredCountOnSubmit, setUnansweredCountOnSubmit] = useState(0);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initial Cinematic Loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppState('login');
      // Load raw settings
      try {
        const queryUrl = localStorage.getItem('pak_exam_gas_url');
        if (queryUrl) {
          setWebAppUrl(queryUrl);
        } else {
          localStorage.setItem('pak_exam_gas_url', 'https://script.google.com/macros/s/AKfycbz2P2DtbhVsVWhOzXYyPqXD0y8Yj83vt6hLnNeTA8zjqtIU3JtMSsjr5au361ts6fn-/exec');
        }
        const savedEmail = localStorage.getItem('pak_exam_teacher_email');
        if (savedEmail) {
          setTeacherEmail(savedEmail);
        } else {
          localStorage.setItem('pak_exam_teacher_email', 'deniraja53@guru.sd.belajar.id');
        }
      } catch (e) {
        console.error(e);
      }
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  // Sync settings helper
  const handleSaveWebAppUrl = (url: string) => {
    setWebAppUrl(url);
    localStorage.setItem('pak_exam_gas_url', url);
  };

  const handleSaveTeacherEmail = (email: string) => {
    setTeacherEmail(email);
    localStorage.setItem('pak_exam_teacher_email', email);
  };

  // 10-second Autosave handler
  useEffect(() => {
    if (appState === 'exam' && selectedClassId) {
      const saveInterval = setInterval(() => {
        try {
          const autoSaveObj = {
            studentName,
            schoolName,
            classId: selectedClassId,
            answers: studentAnswers,
            flagged: flaggedQuestions,
            timeLeft,
            timeSaved: new Date().toLocaleTimeString('id-ID')
          };
          localStorage.setItem('pak_exam_autosave_state', JSON.stringify(autoSaveObj));
          setLastSavedTime(autoSaveObj.timeSaved);
        } catch (e) {
          console.error("Autosave failed", e);
        }
      }, 10000);

      return () => clearInterval(saveInterval);
    }
  }, [appState, studentAnswers, flaggedQuestions, timeLeft, selectedClassId, studentName, schoolName]);

  // Exam Countdown clock
  useEffect(() => {
    if (appState === 'exam' && isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleFinalSubmit(true); // Auto-submit when time completes
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [appState, isTimerRunning]);

  // FULLSCREEN SECURITY MECHANISMS
  useEffect(() => {
    if (appState !== 'exam') return;

    // Listeners for anti-cheat
    const handleFullscreenChange = () => {
      const isFullscreenNow = !!document.fullscreenElement;
      if (!isFullscreenNow) {
        triggerSecurityViolation("Keluar dari Mode Layar Penuh (Fullscreen)");
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerSecurityViolation("Berpindah Tab / Meninggalkan Jendela Ujian");
      }
    };

    const handleWindowBlur = () => {
      triggerSecurityViolation("Membuka Program/Aplikasi Lain (Kehilangan Fokus)");
    };

    // Right-click & shortcut prevention
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevents key combinations: Ctrl+C, Ctrl+V, F12, Ctrl+U, Ctrl+Shift+I
      if (
        (e.ctrlKey && e.key === 'c') ||
        (e.ctrlKey && e.key === 'v') ||
        (e.ctrlKey && e.key === 'r') || // reload
        e.key === 'F12' ||
        e.key === 'F5' ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.shiftKey && e.key === 'I')
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [appState]);

  // Execute security violation resets
  const triggerSecurityViolation = (reason: string) => {
    // Increase count
    setViolationsCount(prev => {
      const nextCount = prev + 1;
      
      // Promptly update the reset logout process as requested:
      setViolationMessage(reason);
      setShowViolationModal(true);
      
      // Stop timer
      setIsTimerRunning(false);

      // Force exit full screen instantly
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
      }

      // Action: Reset answers, logout and reset!
      try {
        localStorage.removeItem('pak_exam_autosave_state');
      } catch (e) {
        console.error(e);
      }
      
      return nextCount;
    });
  };

  const handleResolveViolation = () => {
    // Standard execution: log student out completely & restore default parameters
    setShowViolationModal(false);
    setStudentAnswers({});
    setFlaggedQuestions([]);
    setTimeLeft(90 * 60);
    setAppState('login');
  };

  // Initiate exam process with fullscreen command
  const startExamProcess = () => {
    if (!selectedClassId) return;
    
    // Command request fullscreen
    const docEl = document.documentElement;
    docEl.requestFullscreen()
      .then(() => {
        // Fullscreen successful! Load specific questions and begin timer
        const selectedClass = questionsData.find(c => c.id === selectedClassId);
        if (selectedClass) {
          setCurrentQuestions(selectedClass.questions);
          // Check for existing valid autosave
          try {
            const savedStateStr = localStorage.getItem('pak_exam_autosave_state');
            if (savedStateStr) {
              const savedState = JSON.parse(savedStateStr);
              if (savedState.classId === selectedClassId && savedState.studentName === studentName) {
                // Restore answers gracefully
                setStudentAnswers(savedState.answers || {});
                setFlaggedQuestions(savedState.flagged || []);
                setTimeLeft(savedState.timeLeft || (90 * 60));
              }
            }
          } catch(e) {
            console.error(e);
          }
          
          setCurrentIdx(0);
          setAppState('exam');
          setIsTimerRunning(true);
          setViolationsCount(0);
        }
      })
      .catch((err) => {
        console.error("Gagal memasuki mode fullscreen. Membuka dalam mode normal...", err);
        // Force start exam anyway for easy test evaluation
        const selectedClass = questionsData.find(c => c.id === selectedClassId);
        if (selectedClass) {
          setCurrentQuestions(selectedClass.questions);
          setCurrentIdx(0);
          setAppState('exam');
          setIsTimerRunning(true);
          setViolationsCount(0);
        }
      });
  };

  // Helper toggle flagged
  const toggleFlagged = (qId: number) => {
    if (flaggedQuestions.includes(qId)) {
      setFlaggedQuestions(prev => prev.filter(id => id !== qId));
    } else {
      setFlaggedQuestions(prev => [...prev, qId]);
    }
  };

  const selectAnswerForPG = (qId: number, optionKey: string) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [qId]: optionKey,
    }));
  };

  const writeAnswerForIsianOrEssay = (qId: number, text: string) => {
    setStudentAnswers((prev) => ({
      ...prev,
      [qId]: text,
    }));
  };

  const triggerSubmissionCheck = () => {
    const unansweredCount = currentQuestions.filter(q => !studentAnswers[q.id] || studentAnswers[q.id].trim() === '').length;
    setUnansweredCountOnSubmit(unansweredCount);
    setShowSubmitModal(true);
  };

  // CALCULATE GRADES AUTOMATICALLY
  const handleFinalSubmit = async (isTimeExpired = false) => {
    // Hide custom modal confirmation if shown
    setShowSubmitModal(false);

    // Stop counting
    setIsTimerRunning(false);
    setIsSubmitting(true);
    setSubmitFeedback("Sedang mengoreksi otomatis pilihan ganda dan isian...");

    // Auto grading logic
    let correctPG = 0;
    let correctIsian = 0;

    const pgQuestions = currentQuestions.filter(q => q.type === 'pg') as MultipleChoiceQuestion[];
    const isianQuestions = currentQuestions.filter(q => q.type === 'isian') as IsianQuestion[];
    const essayQuestions = currentQuestions.filter(q => q.type === 'essay') as EssayQuestion[];

    // Grade Multiple Choice (PG)
    pgQuestions.forEach((q) => {
      const sAns = studentAnswers[q.id];
      if (sAns && sAns.trim().toLowerCase() === q.correctKey.toLowerCase()) {
        correctPG++;
      }
    });

    // Grade Short Answers (Isian)
    isianQuestions.forEach((q) => {
      const sAns = studentAnswers[q.id];
      if (sAns) {
        // clean input answer
        const cleanAns = sAns.trim().toLowerCase();
        const isCorrect = q.correctAnswers.some(ans => cleanAns.includes(ans.toLowerCase()));
        if (isCorrect) {
          correctIsian++;
        }
      }
    });

    const pgScoreObtained = correctPG * 1;
    const isianScoreObtained = correctIsian * 2;
    const maxScorePossible = 70; // 30 or 35 PG (depending on class) plus isian and essay weights
    
    // Formula weight calculation: PG (1 point each), Isian (2 points each). 
    // Manual review essay remains 0 until scored by teacher, but maximum possible formula calculation is computed.
    const scorePreEssay = pgScoreObtained + isianScoreObtained;
    const currentClass = questionsData.find(c => c.id === selectedClassId);
    const maxClassScore = currentClass?.stats.maxScore || 70;
    
    // Calculate initial estimated grade percentage
    const tentativePercentage = (scorePreEssay / maxClassScore) * 100;

    setEvaluationResult({
      correctCountPG: correctPG,
      correctCountIsian: correctIsian,
      pgScore: pgScoreObtained,
      isianScore: isianScoreObtained,
      totalPossibleScore: maxClassScore,
      tentativeScore: tentativePercentage
    });

    // Structure essay answer logs for teacher review
    const essayGradingLogs = essayQuestions.map((eq) => ({
      question: eq.question,
      answer: studentAnswers[eq.id] || '',
      reference: eq.referenceAnswer,
      maxScore: eq.score,
      assignedScore: 0 // initialized, teacher manually modifies later
    }));

    // Generate Payload
    const currentClassName = selectedClassId === 4 ? "Kelas 4" : "Kelas 5";
    const pgMetricString = `${correctPG} / ${pgQuestions.length} Benar`;
    const isianMetricString = `${correctIsian} / ${isianQuestions.length} Benar (Skor: ${isianScoreObtained}/20)`;
    const finalViolationStatus = violationsCount > 0 
      ? `MELANGGAR - Keluar Fullscreen ${violationsCount} Kali` 
      : "AMAN - Patuh Aturan Selama Ujian";

    const payload: ExamResultPayload = {
      nama: studentName,
      sekolah: schoolName,
      kelas: currentClassName,
      nilaiPG: pgMetricString,
      nilaiIsian: isianMetricString,
      essayAnswers: essayGradingLogs,
      nilaiAkhir: tentativePercentage,
      waktuSubmit: new Date().toLocaleDateString('id-ID', {
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      }) + " " + new Date().toLocaleTimeString('id-ID'),
      statusPelanggaran: finalViolationStatus,
      violationsCount: violationsCount
    };

    try {
      // 1. Send / Simulate Spreadsheet Upload
      setSubmitFeedback("Mengirimkan lembar jawaban ke Google Spreadsheet SDN Kejuron...");
      const spreadsheetResult = await sendExamResultToGoogleSheets(payload, webAppUrl);

      // 2. Send / Simulate Teacher Notification Email
      setSubmitFeedback("Mengirimkan laporan ringkas otomatis ke Guru Kelas...");
      await sendTeacherEmail(payload, teacherEmail, webAppUrl);

      // 3. Cache results to local submissions list for Teacher Review
      const existingSubmissionsStr = localStorage.getItem('pak_exam_submissions') || '[]';
      const submissions = JSON.parse(existingSubmissionsStr);
      
      // Inject unique ID to match in dashboard later
      const newSubmission = {
        ...payload,
        id: "SUB-" + Date.now() + "-" + Math.floor(Math.random() * 1000)
      };
      
      submissions.push(newSubmission);
      localStorage.setItem('pak_exam_submissions', JSON.stringify(submissions));

      // 4. Remove temporary autosave variables
      localStorage.removeItem('pak_exam_autosave_state');

      // Exit full screen cleanly when completed
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
      }

      setAppState('selesai');
    } catch (e: any) {
      console.error(e);
      setAppState('selesai');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Utility to count progress
  const countAnswered = () => {
    return currentQuestions.filter(q => studentAnswers[q.id] && studentAnswers[q.id].trim() !== '').length;
  };

  // Convert seconds remaining to readable clock format
  const formatClock = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const isLoginPage = appState === 'login';

  return (
    <div 
      className="min-h-screen text-slate-50 flex flex-col font-sans transition-all duration-1000 relative overflow-hidden bg-slate-950 bg-cover bg-center bg-no-repeat"
      style={{ 
        backgroundImage: isLoginPage 
          ? `linear-gradient(to right, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 100%), url('https://lh3.googleusercontent.com/d/186weYELaR0giDP2TNvcl-Iq7jKIJ13tv')` 
          : `linear-gradient(rgba(10, 23, 18, 0.93), rgba(6, 15, 12, 0.97)), url('https://lh3.googleusercontent.com/d/186weYELaR0giDP2TNvcl-Iq7jKIJ13tv')`
      }}
    >
      {/* Decorative ambient lights & patterns */}
      <CinematicBackground />

      {/* Embedded teacher Admin Trigger top corner bar */}
      {isLoginPage && (
        <div className="fixed top-3 right-4 z-40 flex items-center gap-3">
          <button
            onClick={() => setShowGuruPanel(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-white/5 hover:bg-white/15 border border-white/10 text-white rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md cursor-pointer transition shadow-md"
            id="btn-admin-panel"
          >
            <ExamIcons.Admin size={13} className="animate-spin duration-3000" /> Guru Panel
          </button>
        </div>
      )}

      {/* Main Container Wrapper */}
      <main className="flex-1 flex flex-col justify-center items-center p-4">
        
        {/* State 1: CINEMATIC LOGO LOADING SCREEN */}
        {appState === 'loading' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="text-center space-y-6 max-w-lg p-10 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[30px] shadow-2xl relative"
          >
            <motion.div
              initial={{ scale: 0.8, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 1, type: "spring" }}
              className="flex justify-center"
            >
              <div className="relative flex items-center justify-center p-2">
                <img 
                  src="https://lh3.googleusercontent.com/d/1--F3GW0ESYSLaHEUvMoMFIQSOFLwAX52" 
                  alt="Logo SDN Kejuron" 
                  className="w-20 h-20 object-contain z-10" 
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>

            <div className="space-y-2">
              <motion.h1 
                initial={{ opacity: 0, letterSpacing: "-0.05em" }}
                animate={{ opacity: 1, letterSpacing: "0.1em" }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-3xl font-black text-amber-400 tracking-wider font-display uppercase"
              >
                PAK EXAM
              </motion.h1>
              <h2 className="text-base font-semibold text-emerald-300">SDN KEJURON KOTA MADIUN</h2>
              <p className="text-xs text-white/60 tracking-wide uppercase font-mono">Pendidikan Agama Kristen & Budi Pekerti</p>
            </div>

            <div className="flex justify-center pt-2">
              <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden border border-white/10">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="h-full bg-amber-500 shadow-[0_0_10px_#f59e0b]"
                />
              </div>
            </div>
            
            <p className="text-[10px] text-amber-500/60 font-mono animate-pulse font-bold tracking-wide">Menyiapkan sistem ujian aman...</p>
          </motion.div>
        )}

        {/* State 2: STUDENT LOGIN CARD PAGE */}
        {appState === 'login' && (
          <AnimatePresence>
            <div className="w-full min-h-[85vh] flex flex-col lg:flex-row justify-center lg:justify-end items-center lg:pr-12 md:p-6 drop-shadow-2xl">
              <motion.div 
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                  background: "linear-gradient(135deg, rgba(8, 20, 15, 0.85) 0%, rgba(12, 10, 5, 0.92) 100%)",
                  boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 25px rgba(245, 158, 11, 0.15)"
                }}
                className="w-full max-w-[460px] border border-amber-500/30 rounded-[32px] p-6 sm:p-9 relative overflow-hidden backdrop-blur-xl flex flex-col justify-between"
              >
                {/* Subtle glowing highlights inside the card */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-6">
                  {/* Top Emblem */}
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="relative flex items-center justify-center p-1 animate-fade-in">
                      {/* School Logo from Google Drive */}
                      <div className="relative w-24 h-24 flex items-center justify-center z-10 transition hover:scale-105">
                        <img 
                          src="https://lh3.googleusercontent.com/d/1--F3GW0ESYSLaHEUvMoMFIQSOFLwAX52" 
                          alt="Logo SDN Kejuron" 
                          className="w-24 h-24 object-contain animate-fade-in"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-extrabold text-amber-400 tracking-[0.2em] font-sans uppercase">
                        SELAMAT DATANG
                      </span>
                      <h2 className="text-3xl font-black text-white font-sans tracking-tight leading-tight uppercase font-display drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        Di Portal Sekolah
                      </h2>
                    </div>

                    {/* Glowing separator */}
                    <div className="flex items-center justify-center gap-2.5 py-1">
                      <div className="h-[1px] w-14 bg-gradient-to-r from-transparent via-amber-400/30 to-amber-400/60" />
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
                      <div className="h-[1px] w-14 bg-gradient-to-l from-transparent via-amber-400/30 to-amber-400/60" />
                    </div>

                    <p className="text-xs text-slate-300 font-sans tracking-wide">
                      Silakan masuk untuk melanjutkan
                    </p>

                    {/* Integrated Spreadsheet Connection Status Badge */}
                    <div className="pt-2 flex justify-center">
                      <div className={`px-3 py-1 rounded-full text-[10px] uppercase font-mono tracking-wider font-bold inline-flex items-center gap-1.5 transition border ${
                        webAppUrl 
                          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${webAppUrl ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                        {webAppUrl ? '✓ Spreadsheet Terbuka' : '⚡ Mode Simulasi Lokal'}
                      </div>
                    </div>
                  </div>

                  {/* Form Inputs styled with NAMA : and SEKOLAH : */}
                  <div className="space-y-5">
                    {/* Name Input */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-xs text-slate-300 font-bold font-sans tracking-widest uppercase flex items-center gap-1">
                        NAMA :
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="Masukkan nama Anda"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-sans text-slate-100 placeholder-slate-500 hover:border-white/20 focus:outline-hidden focus:border-amber-400/60 focus:bg-black/60 transition shadow-inner"
                          id="input-student-name"
                        />
                      </div>
                    </div>

                    {/* School Input */}
                    <div className="flex flex-col gap-1.5 text-left">
                      <label className="text-xs text-slate-300 font-bold font-sans tracking-widest uppercase flex items-center gap-1">
                        SEKOLAH :
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="Masukkan nama sekolah"
                          value={schoolName}
                          onChange={(e) => setSchoolName(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-sans text-slate-100 placeholder-slate-500 hover:border-white/20 focus:outline-hidden focus:border-amber-400/60 focus:bg-black/60 transition shadow-inner"
                          id="input-school-name"
                        />
                      </div>
                    </div>

                    {/* Secure Info Prompt bar */}
                    <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex gap-2.5 items-start text-left shadow-xs">
                      <ExamIcons.Info className="text-amber-400 shrink-0 mt-0.5" size={13} />
                      <span className="text-[10px] text-gray-400 leading-relaxed font-sans font-medium">
                        Sistem sumatif terproteksi penuh. Disarankan membuka di jendela penuh browser untuk kestabilan tinggi.
                      </span>
                    </div>

                    {/* MASUK submit button */}
                    <button
                      onClick={() => {
                        if (!studentName.trim() || !schoolName.trim()) {
                          alert("Silakan lengkapi nama siswa dan sekolah asal terlebih dahulu.");
                          return;
                        }
                        setAppState('petunjuk');
                      }}
                      className="w-full py-4 bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-900 border border-emerald-500/30 text-white font-sans font-black text-sm tracking-widest rounded-xl shadow-[0_4px_25px_rgba(6,78,59,0.5)] active:scale-[0.99] transition-all uppercase flex items-center justify-center gap-2 cursor-pointer mt-2 group"
                      id="btn-login-submit"
                    >
                      MASUK
                      <ExamIcons.Next size={16} className="text-white group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Bottom Badge decor separator */}
                <div className="flex items-center justify-center gap-3 mt-10">
                  <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-white/10" />
                  <div className="flex items-center justify-center p-1.5 rounded-md bg-white/5 border border-white/10 text-amber-400/80">
                    <ExamIcons.Book size={12} />
                  </div>
                  <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-white/10" />
                </div>

              </motion.div>
            </div>
          </AnimatePresence>
        )}

        {/* State 3: RULES / PETUNJUK UJIAN */}
        {appState === 'petunjuk' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-[30px] p-6 sm:p-8 backdrop-blur-xl shadow-2xl font-sans"
          >
            <div className="text-center space-y-2 pb-4 border-b border-white/10 flex flex-col items-center justify-center">
              <img 
                src="https://lh3.googleusercontent.com/d/1--F3GW0ESYSLaHEUvMoMFIQSOFLwAX52" 
                alt="Logo SDN Kejuron" 
                className="w-14 h-14 object-contain" 
                referrerPolicy="no-referrer"
              />
              <h2 className="text-2xl font-black text-amber-300 tracking-tight uppercase font-display mt-2">TATA TERTIB & PETUNJUK UJIAN</h2>
              <p className="text-xs text-gray-350">Bacalah dengan saksama seluruh peraturan sebelum mulai ujian.</p>
            </div>

            <div className="py-6 space-y-4 text-left">
              <div className="space-y-3.5 text-slate-200 text-sm leading-relaxed">
                <div className="flex gap-3 items-start">
                  <span className="w-5 h-5 bg-amber-500/20 border border-amber-500/35 text-amber-300 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">1</span>
                  <span>Ujian dikerjakan di dalam <b>Mode Layar Penuhan (Fullscreen)</b> yang aman.</span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="w-5 h-5 bg-amber-500/20 border border-amber-500/35 text-amber-300 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">2</span>
                  <span>Peserta dilarang keras mencoba keluar jendela fullscreen, memperkecil tab browser, membidik layar, atau berpindah ke tab lain.</span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="w-5 h-5 bg-amber-500/20 border border-amber-500/35 text-amber-300 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">3</span>
                  <span>Durasi pengerjaan adalah <b>90 Menit</b>. Timer countdown akan aktif di bar atas.</span>
                </div>
                <div className="flex gap-3 items-start">
                  <span className="w-5 h-5 bg-amber-500/20 border border-amber-500/35 text-amber-300 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-sm">4</span>
                  <span>Sistem melakukan autosave kelipatan 10 detik guna kelancaran koneksi.</span>
                </div>
              </div>

              {/* Strict alert threat in red box */}
              <div className="bg-rose-950/25 border border-rose-500/30 rounded-[20px] p-4.5 flex gap-3 text-rose-300 backdrop-blur-md shadow-xs">
                <ExamIcons.Warning className="shrink-0 mt-0.5 text-rose-450 animate-pulse" size={24} />
                <div className="space-y-1">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-rose-350">Peringatan Keras Anti Cheat!</h4>
                  <p className="text-xs leading-relaxed font-sans text-rose-200">
                    “Jika keluar fullscreen atau berpindah tab, maka dianggap sebagai tindakan pelanggaran tata tertib dan seluruh pengerjaan jawaban ujian otomatis akan direset dan logout ke menu awal.”
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center gap-4 border-t border-white/10 pt-5">
              <button
                onClick={() => setAppState('login')}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-emerald-100 rounded-full text-xs transition uppercase font-bold tracking-wider border border-white/15 cursor-pointer shadow-xs"
              >
                Kembali
              </button>
              <button
                onClick={() => setAppState('pilih-kelas')}
                className="px-7 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:scale-[1.02] text-slate-950 font-sans font-extrabold text-xs tracking-widest rounded-full transition uppercase flex items-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(245,158,11,0.3)]"
                id="btn-confirm-instructions"
              >
                Saya Mengerti & Lanjut <ExamIcons.Next size={14} />
              </button>
            </div>
          </motion.div>
        )}
             {/* State 4: CHOOSE CLASS (PILIH KELAS) */}
        {appState === 'pilih-kelas' && (
          <div className="w-full max-w-4xl space-y-8 text-center animate-fade-in">
            <div className="space-y-2">
              <span className="p-1 px-3 bg-white/5 border border-white/10 text-emerald-300 rounded-full text-[10px] font-mono tracking-wide inline-block uppercase shadow-xs">Grade Selection</span>
              <h2 className="text-3xl font-black text-amber-300 tracking-tight uppercase font-display">PILIH KELAS JALUR EVALUASI</h2>
              <p className="text-xs text-gray-300">Silakan pilih kelas Anda untuk memuat instrumen sumatif yang sesuai.</p>
            </div>
 
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {questionsData.map((cls) => (
                <motion.div
                  key={cls.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 hover:border-amber-400/50 rounded-[28px] p-6 text-left flex flex-col justify-between transition group relative shadow-lg"
                >
                  <div className="absolute top-4 right-4 text-emerald-400/20 group-hover:text-amber-400/40 transition">
                    <img 
                      src="https://lh3.googleusercontent.com/d/1--F3GW0ESYSLaHEUvMoMFIQSOFLwAX52" 
                      alt="Logo SDN Kejuron" 
                      className="w-12 h-12 object-contain opacity-20 group-hover:opacity-40 transition" 
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <span className="text-[9px] font-bold text-amber-400 tracking-widest font-mono uppercase bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/15 inline-block">SDN KEJURON</span>
                    <h3 className="text-2xl font-black text-emerald-100 tracking-wider">KELAS {cls.id}</h3>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">{cls.description}</p>
                    
                    {/* Diagnostic list */}
                    <ul className="text-xs text-emerald-300 space-y-1.5 pt-3 border-t border-white/10">
                      <li className="flex items-center gap-2 font-medium">
                        <ExamIcons.Check size={12} className="text-amber-400" /> {cls.stats.pgCount} Butir Pilihan Ganda
                      </li>
                      <li className="flex items-center gap-2 font-medium">
                        <ExamIcons.Check size={12} className="text-amber-400" /> {cls.stats.isianCount} Butir Isian Singkat
                      </li>
                      <li className="flex items-center gap-2 font-medium">
                        <ExamIcons.Check size={12} className="text-amber-400" /> {cls.stats.essayCount} Butir Uraian / Essay
                      </li>
                    </ul>
                  </div>
 
                  <div className="pt-6">
                    <button
                      onClick={() => {
                        setSelectedClassId(cls.id as 4 | 5);
                        // Delay tiny amount and invoke full screen
                        setTimeout(() => {
                          setSelectedClassId(cls.id as 4 | 5);
                        }, 50);
                      }}
                      className={`w-full py-2.5 px-4 rounded-full font-bold text-xs transition duration-200 tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer ${
                        selectedClassId === cls.id 
                          ? 'bg-amber-400 text-slate-950 shadow-md' 
                          : 'bg-white/5 text-emerald-300 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      Pilih & Verifikasi Kelas {cls.id}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
 
            {selectedClassId && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto bg-white/5 backdrop-blur-md p-5 rounded-[24px] border border-white/10 text-center space-y-3 shadow-xl"
              >
                <p className="text-xs text-amber-200 font-sans font-medium">
                  Informasi: Anda memilih <b>Kelas {selectedClassId}</b>. Sistem akan mengunci dan memasuki fullscreen setelah menekan tombol di bawah.
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setSelectedClassId(null)}
                    className="px-5 py-1.5 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-xs border border-white/10 rounded-full cursor-pointer transition uppercase font-bold tracking-wider"
                  >
                    Batal
                  </button>
                  <button
                    onClick={startExamProcess}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:scale-[1.02] text-slate-950 font-bold text-xs rounded-full cursor-pointer transition uppercase flex items-center gap-1.5 shadow-[0_4px_15px_rgba(245,158,11,0.3)]"
                    id="btn-start-exam"
                  >
                    Mulai Ujian Sekarang <ExamIcons.Lock size={12} />
                  </button>
                </div>
              </motion.div>
            )}
 
            <p className="text-[10px] text-gray-400 font-mono">Peserta Aktif: {studentName} • {schoolName}</p>
          </div>
        )}

        {/* State 5: FULLSCREEN SECURE EXAM PANEL */}
        {appState === 'exam' && currentQuestions.length > 0 && (
          <div className="w-full max-w-7xl h-[92vh] flex flex-col bg-white/5 border border-white/10 rounded-[30px] overflow-hidden shadow-2xl relative backdrop-blur-xl animate-fade-in">
            
            {/* Exam Header */}
            <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4 text-left select-none">
              <div className="flex items-center gap-3">
                <div className="p-1 rounded-full bg-white/10 flex items-center justify-center">
                  <img 
                    src="https://lh3.googleusercontent.com/d/1--F3GW0ESYSLaHEUvMoMFIQSOFLwAX52" 
                    alt="Logo SDN" 
                    className="w-7 h-7 object-contain shrink-0" 
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <h2 className="text-sm font-black text-amber-300 tracking-tight font-sans uppercase">PAK EXAM SDN KEJURON</h2>
                  <p className="text-[10px] text-gray-300">
                    Siswa: <span className="text-emerald-300 font-extrabold">{studentName}</span> • Kelas {selectedClassId} • Status: <span className="text-emerald-400 font-bold">Terproteksi</span>
                  </p>
                </div>
              </div>

              {/* Middle Section: Auto save indicators */}
              <div className="hidden lg:flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-gray-400 font-mono text-left">
                  Autosave Aktif {lastSavedTime ? `(Tersimpan ${lastSavedTime})` : '• Menunggu interval...'}
                </span>
              </div>

              {/* End Section: Clock Timer */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/35 text-orange-300 font-mono text-sm font-bold shadow-xs">
                  <ExamIcons.Timer size={16} className="animate-pulse" />
                  <span>{formatClock(timeLeft)}</span>
                </div>
                <button
                  onClick={triggerSubmissionCheck}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:scale-[1.02] text-white font-bold text-xs rounded-full shadow-lg transition duration-150 uppercase tracking-wider cursor-pointer"
                  id="btn-finished-exam"
                >
                  Selesai Ujian
                </button>
              </div>
            </div>

            {/* Exam Workspace */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Left Sidebar: Numbers panel */}
              <aside className="w-64 border-r border-white/10 bg-white/5 flex flex-col p-4 select-none">
                <span className="text-[11px] font-sans font-extrabold uppercase tracking-wider text-emerald-300 block border-b border-white/10 pb-2 mr-1 mb-4 text-left">
                  Daftar Nomor Soal
                </span>

                {/* Question stats counter */}
                <div className="grid grid-cols-3 gap-1.5 text-center mb-4 text-[10px]">
                  <div className="bg-white/5 border border-white/10 p-1.5 rounded-xl">
                    <span className="text-amber-200 block font-bold text-xs">{countAnswered()}</span>
                    <span className="text-gray-400 font-sans font-semibold">Terjawab</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-1.5 rounded-xl">
                    <span className="text-amber-200 block font-bold text-xs">{flaggedQuestions.length}</span>
                    <span className="text-gray-400 font-sans font-semibold">Ragu</span>
                  </div>
                  <div className="bg-white/5 border border-white/10 p-1.5 rounded-xl">
                    <span className="text-amber-200 block font-bold text-xs">{currentQuestions.length - countAnswered()}</span>
                    <span className="text-gray-400 font-sans font-semibold">Belum</span>
                  </div>
                </div>

                {/* Navigation matrix */}
                <div className="flex-1 overflow-y-auto pr-1">
                  <div className="grid grid-cols-4 gap-2">
                    {currentQuestions.map((q, idx) => {
                      const isAnswered = studentAnswers[q.id] && studentAnswers[q.id].trim() !== '';
                      const isFlagged = flaggedQuestions.includes(q.id);
                      let borderClass = 'border-white/10 bg-white/5 text-emerald-100 hover:bg-white/15';
                      
                      if (currentIdx === idx) {
                        borderClass = 'bg-amber-400 text-slate-950 border-2 border-amber-400 font-extrabold scale-102 shadow-md rounded-xl';
                      } else if (isFlagged) {
                        borderClass = 'bg-amber-500/20 border border-amber-500 text-amber-300 font-semibold rounded-xl';
                      } else if (isAnswered) {
                        borderClass = 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-100 rounded-xl';
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentIdx(idx)}
                          className={`w-full py-2.5 rounded-xl text-xs font-mono font-medium transition duration-150 flex items-center justify-center cursor-pointer ${
                            currentIdx === idx ? borderClass : borderClass + " rounded-xl"
                          }`}
                        >
                          {q.id}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category Legends */}
                <div className="border-t border-emerald-900/10 pt-3 text-[10px] space-y-1 text-left text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-emerald-800/10 border border-emerald-500/20 rounded" />
                    <span>PG: No. 1 - {selectedClassId === 4 ? 30 : 35}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-emerald-800/10 border border-emerald-500/25 rounded" />
                    <span>Isian: No. {selectedClassId === 4 ? 31 : 36} - {selectedClassId === 4 ? 40 : 45}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-emerald-800/10 border border-emerald-500/25 rounded" />
                    <span>Essay: No. {selectedClassId === 4 ? 41 : 46} - {selectedClassId === 4 ? 45 : 50}</span>
                  </div>
                </div>
              </aside>

              {/* Main Workspace Panels */}
              <section className="flex-1 flex flex-col p-6 overflow-y-auto justify-between bg-white/5">
                
                {/* Upper: Question & Inputs display */}
                <div className="space-y-6">
                  
                  {/* Category Type Tab */}
                  <div className="flex justify-between items-center bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10 shadow-xs">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-300 font-mono">
                      {currentQuestions[currentIdx].type === 'pg' ? "SOAL BAGIAN I: PILIHAN GANDA" : 
                       currentQuestions[currentIdx].type === 'isian' ? "SOAL BAGIAN II: ISIAN SINGKAT" : 
                       "SOAL BAGIAN III: ESSAY / URAIAN"}
                    </span>
                    <span className="text-xs text-gray-300 font-medium">Soal {currentIdx + 1} dari {currentQuestions.length}</span>
                  </div>

                  {/* Active Question Title Card */}
                  <div className="bg-white/5 p-6 rounded-[24px] border border-white/10 text-left space-y-4 shadow-sm">
                    <p className="text-base sm:text-lg text-amber-100 font-sans tracking-wide leading-relaxed font-medium whitespace-pre-line select-none">
                      {currentQuestions[currentIdx].question}
                    </p>
                  </div>

                  {/* Options Input Fields Container */}
                  <div className="mt-4">
                    
                    {/* Render Category A: Multiple choice */}
                    {currentQuestions[currentIdx].type === 'pg' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-left">
                        {(currentQuestions[currentIdx] as MultipleChoiceQuestion).options.map((opt) => {
                          const isSelected = studentAnswers[currentQuestions[currentIdx].id] === opt.key;
                          return (
                            <button
                              key={opt.key}
                              onClick={() => selectAnswerForPG(currentQuestions[currentIdx].id, opt.key)}
                              className={`p-4 rounded-[20px] text-left transition select-none flex items-start gap-4 border cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-500/15 border-amber-500/70 text-amber-200 shadow-md'
                                  : 'bg-white/5 border-white/10 text-emerald-100 hover:bg-white/10'
                              }`}
                            >
                              <span className={`w-7 h-7 rounded-xl text-xs font-bold font-mono uppercase flex items-center justify-center shrink-0 border transition ${
                                isSelected 
                                  ? 'bg-amber-400 text-slate-950 border-amber-400' 
                                  : 'bg-white/10 border-white/15 text-emerald-250'
                              }`}>
                                {opt.key}
                              </span>
                              <span className="text-sm font-sans pr-1 sm:pt-[2px] leading-relaxed">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Render Category B: Isian Singkat */}
                    {currentQuestions[currentIdx].type === 'isian' && (
                      <div className="text-left space-y-2.5 max-w-xl">
                        <label className="text-xs text-emerald-350 font-sans font-bold uppercase tracking-wider block">Tuliskan Jawaban Singkat Anda:</label>
                        <input
                          type="text"
                          value={studentAnswers[currentQuestions[currentIdx].id] || ''}
                          onChange={(e) => writeAnswerForIsianOrEssay(currentQuestions[currentIdx].id, e.target.value)}
                          placeholder="Ketik jawaban singkat disini (misal: syukur / perpecahan)..."
                          className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3.5 text-sm focus:outline-hidden focus:border-amber-400 focus:bg-white/10 text-slate-100 placeholder-slate-400/50 shadow-inner transition-all"
                        />
                        <span className="text-[10px] text-gray-400 block leading-relaxed pr-1 italic">
                          Catatan: Gunakan huruf kecil yang baku dan ringkas sesuai intisari pelajaran untuk penilaian otomatis yang presisi.
                        </span>
                      </div>
                    )}

                    {/* Render Category C: Essay / Uraian */}
                    {currentQuestions[currentIdx].type === 'essay' && (
                      <div className="text-left space-y-2.5">
                        <label className="text-xs text-emerald-350 font-sans font-bold uppercase tracking-wider block">Jawaban Essay Lengkap & Jelas:</label>
                        <textarea
                          rows={6}
                          value={studentAnswers[currentQuestions[currentIdx].id] || ''}
                          onChange={(e) => writeAnswerForIsianOrEssay(currentQuestions[currentIdx].id, e.target.value)}
                          placeholder="Tuliskan jawaban lengkap dengan uraian poin-poin yang jelas..."
                          className="w-full bg-white/5 border border-white/10 rounded-[24px] p-5 text-sm focus:outline-hidden focus:border-amber-400 focus:bg-white/10 text-slate-100 placeholder-slate-400/50 shadow-inner transition-all"
                        />
                        <span className="text-[10px] text-gray-400 block font-sans">
                          Catatan: Jawaban essay/uraian Anda akan disimpan dan diperiksa secara manual oleh guru melalui Guru Dashboard.
                        </span>
                      </div>
                    )}

                  </div>

                </div>

                {/* Sub-Footer panel navigation */}
                <div className="border-t border-white/10 pt-5 flex items-center justify-between gap-4 mt-8 flex-wrap">
                  
                  {/* Left Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                      disabled={currentIdx === 0}
                      className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-emerald-100 rounded-full text-xs uppercase font-bold border border-white/10 disabled:opacity-35 disabled:pointer-events-none flex items-center gap-1 cursor-pointer transition shadow-xs"
                    >
                      <ExamIcons.Prev size={13} /> Kembali Soal
                    </button>
                    
                    {/* Ragu-Ragu Check */}
                    <button
                      type="button"
                      onClick={() => toggleFlagged(currentQuestions[currentIdx].id)}
                      className={`px-5 py-2.5 text-xs uppercase font-extrabold border rounded-full transition-all flex items-center gap-2 cursor-pointer ${
                        flaggedQuestions.includes(currentQuestions[currentIdx].id)
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-md'
                          : 'bg-white/5 border-white/10 hover:text-amber-350 hover:bg-white/10 text-gray-400'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={flaggedQuestions.includes(currentQuestions[currentIdx].id)} 
                        onChange={() => {}} // handled by click
                        className="rounded border-gray-600 outline-hidden pointer-events-none text-amber-505 bg-transparent" 
                      />
                      <span>Ragu - Ragu</span>
                    </button>
                  </div>

                  {/* Right controls */}
                  <button
                    onClick={() => {
                      if (currentIdx < currentQuestions.length - 1) {
                        setCurrentIdx(prev => prev + 1);
                      } else {
                        triggerSubmissionCheck();
                      }
                    }}
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-full transition flex items-center gap-1 cursor-pointer shadow-[0_4px_15px_rgba(245,158,11,0.3)] hover:scale-[1.02]"
                  >
                    {currentIdx < currentQuestions.length - 1 ? (
                      <>Soal Berikut <ExamIcons.Next size={13} /></>
                    ) : (
                      <>Selesai & Kumpulkan Ujian <ExamIcons.Done size={13} /></>
                    )}
                  </button>

                </div>

              </section>

            </div>
          </div>
        )}

        {/* State 6: HALAMAN SELESAI */}
        {appState === 'selesai' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-[32px] p-6 sm:p-8 backdrop-blur-md text-center shadow-2xl font-sans animate-fade-in"
          >
            <div className="space-y-5">
              <div className="flex justify-center">
                <div className="p-1 rounded-full bg-white/10 border border-white/20 inline-block animate-bounce">
                  <img 
                    src="https://lh3.googleusercontent.com/d/1--F3GW0ESYSLaHEUvMoMFIQSOFLwAX52" 
                    alt="Logo SDN Kejuron" 
                    className="w-16 h-16 object-contain" 
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
 
              <div className="space-y-1">
                <span className="p-1 px-3 bg-white/5 border border-white/10 text-emerald-300 rounded-full text-[10px] font-mono tracking-wider inline-block uppercase font-bold shadow-xs">Sumatif Berhasil</span>
                <h2 className="text-3xl font-black text-amber-300 uppercase font-display tracking-tight">TERIMA KASIH, {studentName}!</h2>
                <p className="text-xs text-gray-300">Lembar jawaban ujian Pendidikan Agama Kristen telah tersimpan & terkirim lengkap.</p>
              </div>
 
              {/* Score evaluation ring */}
              {evaluationResult && (
                <div className="bg-white/5 rounded-3xl p-5 border border-white/10 text-left space-y-4 max-w-md mx-auto shadow-sm">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-widest font-mono text-center pb-2 border-b border-white/10">RINGKASAN PEROLEHAN NILAI</h4>
                  
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="text-xs text-gray-300 leading-relaxed">
                        • Benar PG: <span className="font-bold text-amber-200">{evaluationResult.correctCountPG} Soal</span> 
                        <span className="text-gray-400 block text-[10px] mt-0.5">(Skor: {evaluationResult.pgScore} poin)</span>
                      </div>
                      <div className="text-xs text-gray-300 leading-relaxed">
                        • Benar Isian: <span className="font-bold text-amber-200">{evaluationResult.correctCountIsian} Soal</span> 
                        <span className="text-gray-400 block text-[10px] mt-0.5">(Skor: {evaluationResult.isianScore} poin)</span>
                      </div>
                      <div className="text-xs text-emerald-300 leading-relaxed italic block">
                        • Uraian/Essay: <span className="font-bold">Menunggu Koreksi Guru</span>
                      </div>
                    </div>
 
                    <div className="text-center p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl shrink-0">
                      <span className="text-[9px] text-gray-400 block tracking-wider uppercase">Nilai Sementara</span>
                      <span className="text-2xl font-black text-amber-300 font-mono inline-block mt-0.5">
                        {evaluationResult.tentativeScore.toFixed(0)}
                      </span>
                      <span className="text-gray-400 text-xs block font-mono">/ 100</span>
                    </div>
                  </div>
 
                  <span className="text-[10px] text-gray-400 block leading-relaxed pt-2.5 border-t border-white/10 text-center font-sans">
                    Hasil ujian sementara dihitung dari PG + Isian Singkat. Guru SDN Kejuron akan memvalidasi jawaban essay/uraian Anda di panel.
                  </span>
                </div>
              )}
 
              {/* Confirmation stats indicators check */}
              <div className="bg-white/5 border border-white/10 rounded-full py-1.5 px-4 inline-flex items-center gap-2 max-w-xs text-xs text-emerald-300 font-medium shadow-xs">
                <ExamIcons.Success size={16} className="text-emerald-400 animate-pulse" /> Unduhan Data ke Guru Berhasil terkirim!
              </div>
 
              <div className="pt-6 border-t border-white/10 max-w-md mx-auto">
                <button
                  onClick={() => {
                    setAppState('login');
                    setStudentName('');
                    setSelectedClassId(null);
                    setStudentAnswers({});
                    setFlaggedQuestions([]);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:scale-[1.01] hover:from-amber-400 hover:to-amber-500 text-slate-950 font-sans font-extrabold text-xs tracking-wider rounded-full shadow-[0_4px_15px_rgba(245,158,11,0.3)] transition uppercase cursor-pointer"
                >
                  SELESAI & KELUAR PORTAL
                </button>
              </div>
 
            </div>
          </motion.div>
        )}

      </main>

      {/* Network / Submit loading overlay indicator */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-center items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-emerald-900/50 border-t-amber-500 rounded-full animate-spin" />
            <img 
              src="https://lh3.googleusercontent.com/d/1--F3GW0ESYSLaHEUvMoMFIQSOFLwAX52" 
              alt="Logo SDN Kejuron" 
              className="w-8 h-8 object-contain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" 
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-base font-bold text-amber-200 mt-2 font-sans">{submitFeedback}</p>
          <p className="text-xs text-gray-400 font-sans font-medium">Mohon tunggu, jangan tutup browser atau memuat ulang halaman...</p>
        </div>
      )}

      {/* Security reset violation indicator screen */}
      {showViolationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-lg flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.95 }} 
            animate={{ scale: 1 }}
            className="w-full max-w-md bg-gradient-to-b from-rose-950 via-slate-950 to-slate-950 border-2 border-rose-500/50 rounded-2xl p-6 text-center space-y-4 shadow-2xl text-rose-200"
          >
            <div className="p-3 bg-rose-500/10 rounded-full border border-rose-500/30 text-rose-400 inline-block animate-pulse">
              <ExamIcons.Warning size={40} />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-rose-400 uppercase tracking-wide">PELANGGARAN DIDETEKSI!</h3>
              <p className="text-xs text-rose-300">
                Sistem kami mendeteksi aktivitas mencurigakan yang melanggar tata tertib ujian:
              </p>
            </div>

            <div className="bg-rose-950/50 py-3 px-4 rounded-xl border border-rose-500/25 font-mono text-xs text-left">
              🔴 Pelanggaran: <span className="text-amber-300 font-bold font-sans">{violationMessage}</span>
            </div>

            <p className="text-[11px] text-gray-300 leading-relaxed font-sans mt-2">
              Berdasarkan tata tertib, seluruh jawaban pengerjaan ujian Anda otomatis <b>DIRESET / DIHAPUS</b> dan Anda akan dikeluarkan dari sesi ujian ini.
            </p>

            <button
              onClick={handleResolveViolation}
              className="w-full py-3 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 font-bold text-xs uppercase tracking-wider text-white rounded-lg transition cursor-pointer"
            >
              Kembali ke Login Peserta
            </button>
          </motion.div>
        </div>
      )}

      {/* Custom React Confirm Submission Modal (iframe-safe alternative to dialogs) */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-gradient-to-b from-emerald-950 via-slate-950 to-slate-950 border border-emerald-500/30 rounded-[28px] p-6 sm:p-8 space-y-5 text-center shadow-2xl relative overflow-hidden"
          >
            {/* Ambient visual overlay */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Emblem */}
            <div className="flex justify-center">
              <div className="p-1 rounded-full bg-white/10 border border-white/20 inline-block animate-bounce">
                <img 
                  src="https://lh3.googleusercontent.com/d/1--F3GW0ESYSLaHEUvMoMFIQSOFLwAX52" 
                  alt="Logo SDN Kejuron" 
                  className="w-16 h-16 object-contain" 
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-amber-400 tracking-[0.25em] font-sans uppercase">
                KONFIRMASI SELESAI UJIAN
              </span>
              <h3 className="text-xl font-black text-white font-sans tracking-tight">
                Kumpulkan Lembar Jawaban?
              </h3>
            </div>

            {unansweredCountOnSubmit > 0 ? (
              <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl space-y-1.5 text-left">
                <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-sans">
                  ⚠️ PERINGATAN GURU :
                </p>
                <p className="text-xs text-slate-350 leading-relaxed font-sans">
                  Anda masih memiliki <span className="text-amber-300 font-extrabold font-mono text-sm">{unansweredCountOnSubmit}</span> soal yang <b>BELUM DIJAWAB</b>. Mohon periksa kembali pengerjaan Anda agar nilai akhir maksimal.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-1.5 text-left">
                <p className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 font-sans">
                  ✓ SEMUA SOAL TERJAWAB :
                </p>
                <p className="text-xs text-slate-350 leading-relaxed font-sans text-justify">
                  Kerja bagus! Seluruh butir soal pilihan ganda, isian singkat, dan uraian/essay telah diisi. Apakah Anda bersedia mengirim rincian ujian ke database guru saat ini?
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 border border-white/10 hover:bg-white/5 active:scale-[0.98] text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer font-sans"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => handleFinalSubmit(true)}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-800 border border-emerald-500/30 text-white font-sans font-black text-xs tracking-widest rounded-xl shadow-[0_4px_25px_rgba(16,185,129,0.2)] active:scale-[0.98] transition cursor-pointer"
              >
                YA, KIRIM
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Popup Dialog: GURU DASHBOARD & SETTINGS PANEL */}
      {showGuruPanel && (
        <GuruPanel 
          onClose={() => setShowGuruPanel(false)}
          webAppUrl={webAppUrl}
          setWebAppUrl={handleSaveWebAppUrl}
          teacherEmail={teacherEmail}
          setTeacherEmail={handleSaveTeacherEmail}
        />
      )}

      {/* Embedded footer */}
      <footer className="py-4 border-t border-emerald-950/25 select-none text-center bg-slate-950/40 backdrop-blur-xs font-sans">
        <p className="text-[10px] text-emerald-500/50 leading-relaxed">
          PAK EXAM SDN KEJURON KOTA MADIUN • Pendidikan Agama Kristen Generasi Jujur Unggul Digital
        </p>
      </footer>
    </div>
  );
}
