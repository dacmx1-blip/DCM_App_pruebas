import React, { useState, useEffect, useCallback } from 'react';
import { DOMAINS, ASSESSMENT_OPTIONS } from './constants';
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
    // Mapped from 5-point scale percentages:
    // Level 5 average = 100%
    // Level 4 average = 80%
    // Level 3 average = 60%
    // Level 2 average = 40%
    // Level 1 average = 20%

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
    // Hide results if user changes answers to encourage re-calculation
    if (showResults) setShowResults(false);
  };

  const handleSave = async () => {
    calculateResults(); // Calculate first
    setShowResults(true);
    
    if (!userId) {
        if (!isFirebaseReady()) {
            notify("Resultados calculados. (Guardado deshabilitado en modo demo)", 'info');
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
        // We don't auto-show results on load, user should check form
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
    <div className="min-h-screen pb-20">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-fade-in ${
          notification.type === 'success' ? 'bg-emerald-600' : 
          notification.type === 'error' ? 'bg-rose-600' : 'bg-slate-800'
        }`}>
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 text-white p-1.5 rounded-md">
               <span className="font-bold text-lg tracking-tighter">ISO</span>
            </div>
            <h1 className="font-bold text-slate-800 text-lg hidden sm:block">Autoevaluación 27001:2022</h1>
          </div>
          <div className="text-xs font-mono bg-slate-100 px-3 py-1 rounded-full text-slate-500">
            ID: {userId ? userId.slice(0, 8) + '...' : 'Modo Local'}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Introduction */}
        {!showResults && (
          <section className="mb-8 bg-gradient-to-br from-primary-800 to-primary-900 rounded-2xl p-8 text-white shadow-xl">
            <h2 className="text-2xl font-bold mb-2">Evalúe su Nivel de Madurez CMMI</h2>
            <p className="text-primary-100 max-w-2xl mb-6 leading-relaxed">
              Herramienta de diagnóstico profesional para PYMEs basada en los controles de la norma ISO 27001:2022.
              Complete el cuestionario para visualizar sus fortalezas y áreas de mejora.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
               <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  <InfoIcon className="w-4 h-4" />
                  <span>5 Niveles CMMI</span>
               </div>
               <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                  <InfoIcon className="w-4 h-4" />
                  <span>7 Dominios Clave</span>
               </div>
            </div>
          </section>
        )}

        {/* Actions Bar */}
        <div className="sticky top-20 z-20 bg-slate-50/95 backdrop-blur-sm py-4 mb-6 border-b border-slate-200 flex flex-wrap gap-3 justify-between items-center">
           <div className="text-sm text-slate-500 font-medium">
              Progreso: {Object.keys(answers).length} respuestas
           </div>
           <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={() => userId && handleLoad(userId)}
                disabled={loading || !userId}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 shadow-sm text-sm"
              >
                <CloudDownloadIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Cargar</span>
              </button>
              <button 
                onClick={handleSave}
                disabled={loading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-md disabled:opacity-70 text-sm"
              >
                {loading ? 'Procesando...' : 'Guardar y Calcular'}
                <SaveIcon className="w-4 h-4" />
              </button>
           </div>
        </div>

        {/* Incomplete Warning */}
        {results && results.answeredCount < results.totalQuestions && showResults && (
             <div className="mb-8 bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex items-start gap-3">
                <AlertTriangleIcon className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                    <h4 className="font-bold text-amber-800">Evaluación Incompleta</h4>
                    <p className="text-sm text-amber-700">El resultado del nivel CMMI puede no ser preciso hasta que complete todos los campos.</p>
                </div>
             </div>
        )}

        {/* Content Area */}
        {showResults && results ? (
          <div className="space-y-8">
            <ResultsView results={results} />
            <div className="flex justify-center pt-8">
                <button 
                    onClick={() => setShowResults(false)}
                    className="text-primary-600 font-semibold hover:underline hover:text-primary-800"
                >
                    ← Volver al cuestionario para editar
                </button>
            </div>
          </div>
        ) : (
          <AssessmentForm answers={answers} onAnswerChange={handleAnswerChange} />
        )}

      </main>

      <footer className="mt-12 py-8 border-t border-slate-200 bg-slate-100 text-center">
        <div className="max-w-4xl mx-auto px-4">
            <p className="text-slate-500 text-sm">
            Basado en los requisitos y controles principales de ISO/IEC 27001:2022.
            </p>
            <p className="text-slate-400 text-xs mt-2">
            © 2025 Herramienta de Autoevaluación.
            </p>
        </div>
      </footer>
    </div>
  );
}