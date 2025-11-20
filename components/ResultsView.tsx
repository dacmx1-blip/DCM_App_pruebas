import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { CalculationResult } from '../types';
import { ShieldCheckIcon } from './icons';

interface ResultsViewProps {
  results: CalculationResult;
}

const ResultsView: React.FC<ResultsViewProps> = ({ results }) => {
  // Dynamic styles based on maturity level
  const getLevelStyle = (level: string) => {
    if (level.includes('Nivel 5')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (level.includes('Nivel 4')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (level.includes('Nivel 3')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (level.includes('Nivel 2')) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  const levelColor = getLevelStyle(results.maturityLevel);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
        <div className="p-2 bg-primary-100 text-primary-700 rounded-lg">
          <ShieldCheckIcon className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Resultado del Diagnóstico CMMI</h2>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center transition-transform hover:scale-[1.02]">
          <div className="text-4xl font-extrabold text-primary-700 mb-2">{results.percentage}%</div>
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Cumplimiento Global</div>
        </div>

        <div className={`rounded-2xl p-6 shadow-sm border flex flex-col items-center justify-center text-center transition-transform hover:scale-[1.02] ${levelColor}`}>
          <div className="text-2xl font-bold mb-2">{results.maturityLevel}</div>
          <div className="text-sm font-medium opacity-80 uppercase tracking-wider">Nivel de Madurez</div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center transition-transform hover:scale-[1.02]">
          <div className="text-4xl font-extrabold text-slate-700 mb-2">
            {results.answeredCount}<span className="text-xl text-slate-400">/{results.totalQuestions}</span>
          </div>
          <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Controles Evaluados</div>
        </div>
      </div>

      {/* Recommendation & Chart Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recommendation Card */}
        <div className={`p-6 rounded-2xl border-l-4 shadow-sm ${levelColor.replace('bg-', 'bg-opacity-50 ')}`}>
          <h3 className="text-lg font-bold mb-3">Recomendación Estratégica</h3>
          <p className="text-base leading-relaxed opacity-90">
            {results.recommendation}
          </p>
        </div>

        {/* Radar Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-700 mb-6 text-center">Análisis por Dominio</h3>
          <div className="h-[350px] w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={results.domainScores}>
                {/* Increased grid visibility */}
                <PolarGrid stroke="#94a3b8" strokeWidth={1} />
                <PolarAngleAxis 
                  dataKey="subject" 
                  tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} 
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Puntuación"
                  dataKey="score"
                  stroke="#2563eb"
                  strokeWidth={4}
                  fill="#3b82f6"
                  fillOpacity={0.5}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1e40af', fontWeight: 600 }}
                  formatter={(value: number) => [`${value}%`, 'Cumplimiento']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView;