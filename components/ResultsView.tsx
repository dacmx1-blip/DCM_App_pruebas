import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { CalculationResult } from '../types';
import { ShieldCheckIcon } from './icons';

interface ResultsViewProps {
  results: CalculationResult;
}

const ResultsView: React.FC<ResultsViewProps> = ({ results }) => {
  // Dynamic styles based on maturity level
  const getLevelStyle = (level: string) => {
    if (level.includes('Nivel 5')) return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-100';
    if (level.includes('Nivel 4')) return 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-100';
    if (level.includes('Nivel 3')) return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100';
    if (level.includes('Nivel 2')) return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100';
    return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-100';
  };

  const getBarColor = (score: number) => {
    if (score >= 80) return '#3b82f6'; // blue-500
    if (score >= 50) return '#f59e0b'; // amber-500
    return '#ef4444'; // red-500
  };

  const levelColor = getLevelStyle(results.maturityLevel);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 text-white text-xs p-2 rounded shadow-lg z-50">
          <p className="font-bold">{label}</p>
          <p>{`Cumplimiento: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
          <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl shadow-lg shadow-primary-200">
            <ShieldCheckIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Diagnóstico de Madurez</h2>
            <p className="text-slate-500 text-sm">Resultados basados en ISO 27001:2022</p>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Global Compliance */}
            <div className="relative overflow-hidden bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col items-center justify-center text-center group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                <div className="text-5xl font-black text-slate-800 mb-2 tracking-tight group-hover:scale-110 transition-transform duration-300">
                    {results.percentage}<span className="text-2xl text-slate-400 font-normal">%</span>
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cumplimiento Global</div>
            </div>

            {/* Maturity Level */}
            <div className={`relative overflow-hidden rounded-xl p-6 border flex flex-col items-center justify-center text-center ring-4 ring-opacity-30 ${levelColor}`}>
                <div className="text-xl font-bold mb-2 px-4 py-1 rounded-full bg-white bg-opacity-60 backdrop-blur-sm shadow-sm">
                    {results.maturityLevel}
                </div>
                <div className="text-xs font-bold opacity-70 uppercase tracking-widest mt-2">Nivel CMMI Alcanzado</div>
            </div>

            {/* Controls Count */}
            <div className="relative overflow-hidden bg-slate-50 rounded-xl p-6 border border-slate-200 flex flex-col items-center justify-center text-center">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-400 to-slate-600"></div>
                <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-black text-slate-700">{results.answeredCount}</span>
                    <span className="text-xl font-medium text-slate-400">/{results.totalQuestions}</span>
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Controles Evaluados</div>
            </div>
        </div>
      </div>

      {/* Charts & Recommendations Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Horizontal Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-slate-800">Desglose por Dominio</h3>
             <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-500 rounded">Escala 0-100%</span>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={results.domainScores}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis 
                    dataKey="subject" 
                    type="category" 
                    width={120}
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={24} background={{ fill: '#f8fafc' }}>
                    {results.domainScores.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommendation Card */}
        <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-full relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full ${levelColor.replace('bg-', 'bg-opacity-100 bg-').split(' ')[0]}`}></div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    Recomendación Estratégica
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                    {results.recommendation}
                </p>
                
                <div className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Siguientes Pasos Sugeridos</h4>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"></span>
                            Revisar controles con puntaje inferior al 50%.
                        </li>
                        <li className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"></span>
                            Documentar evidencias para auditoría.
                        </li>
                        <li className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0"></span>
                            Establecer plan de acción correctiva.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;