import React, { useState, useEffect, useCallback } from 'react';
import { DOMAINS } from './constants';
import { Answers, CalculationResult } from './types';
import AssessmentForm from './components/AssessmentForm';
import ResultsView from './components/ResultsView';
import { 
  initAuth, 
  saveAssessmentData, 
  loadAssessmentData, 
  isFirebaseReady 
} from './services/firebase';
import { SaveIcon, CloudDownloadIcon, InfoIcon, AlertTriangleIcon } from './components/icons';

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<CalculationResult | null>(null);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [loading, setLoading] = useState(false);

  // Initialize Auth
  useEffect(() => {
    if (isFirebaseReady()) {
      initAuth((user) => {
        if (user) {
          setUserId(user.uid);
          handleLoad(user.uid, true); // Auto-load
        } else {
          setUserId(null);
        }
      });
    }
  }, []);

  // Notification Helper
  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Calculation Logic
  const calculateResults = useCallback(() => {
    const totalQuestions = DOMAINS.reduce((acc, d) => acc + d.questions.length, 0);
    let totalScore = 0;
    let totalScoreableQuestions = 0;
    let answeredCount = 0;
    const domainScores: CalculationResult['domainScores'] = [];

    DOMAINS.forEach((domain) => {
      let domainTotal = 0;
      let domainMax = 0;
      let domainAnswered = 0;

      domain.questions.forEach((q) => {
        const val = answers[q.id];
        if (val !== undefined && val !== null) {
          answeredCount++;
          domainAnswered++;
          const numericVal = parseInt(val, 10);
          
          if (numericVal > 0) {
            // Not N/A
            totalScore += numericVal;
            totalScoreableQuestions++;
            domainTotal += numericVal;
            // Max score per question is now 5
            domainMax += 5; 
          }
        }
      });

      if (domainMax > 0) {
        const percentage = Math.round((domainTotal / domainMax) * 100);
        domainScores.push({
          subject: domain.title.split('. ')[1] || domain.title, // Short title
          score: percentage,
          fullMark: 100
        });
      }
    });

    // Max possible score is number of applicable questions * 5
    const maxPossibleScore = totalScoreableQuestions * 5;
    const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

    // CMMI Levels Logic
    let maturityLevel = 'Inicial (Nivel 1)';
    let recommendation = 'El SGSI es impredecible y reactivo. Se recomienda establecer la Política de Seguridad, definir el alcance y realizar una evaluación formal de riesgos para pasar al Nivel 2.';

    if (percentage > 90) {
      maturityLevel = 'Mejora Continua (Nivel 5)';
      recommendation = '¡Nivel de excelencia CMMI! Su SGSI se enfoca en la mejora continua y la innovación, utilizando análisis cuantitativos para optimizar los procesos de seguridad.';
    } else if (percentage > 70) {
      maturityLevel = 'Medido (Nivel 4)';
      recommendation = 'Los procesos de seguridad son medidos, controlados y predecibles. Enfóquese en métricas de rendimiento y objetivos cuantitativos para la toma de decisiones basada en datos.';
    } else if (percentage > 50) {
      maturityLevel = 'Estandarizado (Nivel 3)';
      recommendation = 'Los procesos de seguridad están estandarizados, bien caracterizados y documentados (Política, Procedimientos, Responsabilidades). Priorice la capacitación sistemática del personal.';
    } else if (percentage > 30) {
      maturityLevel = 'Repetible (Nivel 2)';
      recommendation = 'Los proyectos se planifican y ejecutan siguiendo políticas básicas. Concéntrese en mantener controles básicos como copias de seguridad, gestión de acceso y seguridad física.';
    }

    setResults({
      totalScore,
      maxPossibleScore,
      percentage,
      answeredCount,
      totalQuestions,
      maturityLevel,
      recommendation,
      domainScores
    });
  }, [answers]);

  // Handlers
  const handleAnswerChange = (qId: string, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
    if (showResults) setShowResults(false);
  };

  const handleSave = async () => {
    calculateResults(); 
    setShowResults(true);
    
    if (!userId) {
        if (!isFirebaseReady()) {
            notify("Resultados calculados. (Modo Demo)", 'info');
        } else {
            notify("Esperando autenticación...", "error");
        }
        return;
    }

    setLoading(true);
    try {
      await saveAssessmentData(userId, answers);
      notify("Evaluación guardada exitosamente.", "success");
    } catch (e) {
      console.error(e);
      notify("Error al guardar en la nube.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLoad = async (uid: string, silent = false) => {
    if (!isFirebaseReady()) {
        if (!silent) notify("Backend no configurado.", "error");
        return;
    }
    
    setLoading(true);
    try {
      const data = await loadAssessmentData(uid);
      if (data) {
        setAnswers(data);
        if (!silent) notify("Evaluación cargada.", "success");
      } else if (!silent) {
        notify("No se encontraron datos previos.", "info");
      }
    } catch (e) {
      console.error(e);
      if (!silent) notify("Error al cargar datos.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 bg-slate-50 font-sans">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl text-white font-medium animate-fade-in flex items-center gap-3 ${
          notification.type === 'success' ? 'bg-emerald-600' : 
          notification.type === 'error' ? 'bg-rose-600' : 'bg-slate-800'
        }`}>
          <div className="w-2 h-2 rounded-full bg-white"></div>
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 transition-all">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-primary-600 to-primary-500 text-white p-2 rounded-lg shadow-sm">
               <span className="font-black text-lg tracking-tight leading-none">27K</span>
            </div>
            <div>
                <h1 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">Autoevaluación ISO 27001</h1>
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Modelo de Madurez CMMI</p>
            </div>
          </div>
          <div className="text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-lg text-slate-500 border border-slate-200">
            {userId ? `ID: ${userId.slice(0, 6)}...` : '● Modo Local'}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Hero Section */}
        {!showResults && (
          <section className="mb-10 relative overflow-hidden bg-slate-900 rounded-3xl text-white shadow-2xl ring-1 ring-slate-900/5">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary-500 opacity-20 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-600 opacity-20 blur-3xl"></div>
            
            <div className="relative p-8 sm:p-10">
                <div className="max-w-3xl">
                    <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
                        Evalúe la seguridad de su información
                    </h2>
                    <p className="text-slate-300 text-lg mb-8 leading-relaxed max-w-2xl">
                        Diagnóstico profesional basado en los controles de ISO/IEC 27001:2022. 
                        Obtenga un análisis visual de sus fortalezas y una hoja de ruta clara hacia la certificación.
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm font-medium">
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 hover:bg-white/20 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                            <span>5 Niveles CMMI</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 hover:bg-white/20 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            <span>7 Dominios Críticos</span>
                        </div>
                    </div>
                </div>
            </div>
          </section>
        )}

        {/* Sticky Actions Bar */}
        <div className="sticky top-16 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4 mb-8 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 shadow-sm flex flex-wrap gap-4 justify-between items-center transition-all">
           <div className="flex items-center gap-3">
                <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 font-bold text-sm">
                    {Math.round((Object.keys(answers).length / DOMAINS.reduce((acc,d) => acc + d.questions.length, 0)) * 100)}%
                </div>
                <div>
                   <p className="text-sm font-bold text-slate-700">Progreso de Evaluación</p>
                   <p className="text-xs text-slate-500">{Object.keys(answers).length} preguntas respondidas</p>
                </div>
           </div>
           
           <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={() => userId && handleLoad(userId)}
                disabled={loading || !userId}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all disabled:opacity-50 shadow-sm text-sm active:scale-95"
              >
                <CloudDownloadIcon className="w-4 h-4" />
                <span className="">Cargar</span>
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/30 transition-all shadow-md disabled:opacity-70 text-sm active:scale-95"
              >
                {loading ? 'Procesando...' : showResults ? 'Recalcular' : 'Ver Resultados'}
                <SaveIcon className="w-4 h-4" />
              </button>
           </div>
        </div>

        {/* Warning for incomplete data */}
        {results && results.answeredCount < results.totalQuestions && showResults && (
             <div className="mb-8 bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-4 animate-fade-in">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
                    <AlertTriangleIcon className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-amber-900">Atención: Evaluación Parcial</h4>
                    <p className="text-sm text-amber-700 mt-1">El diagnóstico de madurez será más preciso cuando complete todas las preguntas. Actualmente se asume puntaje 0 para los campos vacíos.</p>
                </div>
             </div>
        )}

        {/* Main Content Area */}
        {showResults && results ? (
          <div className="space-y-8">
            <ResultsView results={results} />
            <div className="flex justify-center pt-12 pb-8">
                <button 
                    onClick={() => setShowResults(false)}
                    className="group flex items-center gap-2 text-slate-500 font-medium hover:text-primary-600 transition-colors px-6 py-3 rounded-full hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span> 
                    Volver al cuestionario para editar respuestas
                </button>
            </div>
          </div>
        ) : (
          <AssessmentForm answers={answers} onAnswerChange={handleAnswerChange} />
        )}

      </main>

      <footer className="mt-auto py-10 border-t border-slate-200 bg-white text-center">
        <div className="max-w-5xl mx-auto px-4">
            <p className="text-slate-800 font-semibold mb-2">Sistema de Autoevaluación ISO 27001</p>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
            Herramienta simplificada para el análisis de brechas de seguridad de la información en PYMEs.
            </p>
            <div className="mt-6 text-xs text-slate-400 font-mono">v2.0.1 • 2025</div>
        </div>
      </footer>
    </div>
  );
}