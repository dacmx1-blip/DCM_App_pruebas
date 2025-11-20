import React from 'react';
import { DOMAINS, ASSESSMENT_OPTIONS } from '../constants';
import { Answers } from '../types';

interface AssessmentFormProps {
  answers: Answers;
  onAnswerChange: (questionId: string, value: string) => void;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({ answers, onAnswerChange }) => {
  return (
    <div className="space-y-10">
      {DOMAINS.map((domain, index) => (
        <div 
          key={domain.id} 
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
        >
          {/* Header Section of Domain */}
          <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-200 text-slate-600 font-bold text-xs shadow-inner">
                    {index + 1}
                </span>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                {domain.title}
                </h3>
            </div>
            <p className="text-slate-500 text-sm pl-11 max-w-3xl leading-relaxed">{domain.description}</p>
          </div>

          {/* Questions Section */}
          <div className="p-8 space-y-10">
            {domain.questions.map((q) => (
              <div key={q.id} className="animate-slide-up group">
                <div className="flex flex-col md:flex-row md:items-baseline gap-2 mb-4">
                    <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{q.id.toUpperCase()}</span>
                    <p className="font-medium text-slate-800 text-base group-hover:text-primary-700 transition-colors">
                    {q.text}
                    </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {ASSESSMENT_OPTIONS.map((opt) => {
                    const isSelected = answers[q.id] === opt.value;
                    return (
                      <label
                        key={`${q.id}-${opt.value}`}
                        className={`
                          relative flex flex-col items-center justify-center px-2 py-3 rounded-xl cursor-pointer border transition-all duration-200 text-center h-full
                          ${isSelected 
                            ? `${opt.colorClass} ring-2 ring-offset-1 ring-primary-200 shadow-md transform -translate-y-0.5 font-bold` 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt.value}
                          checked={isSelected}
                          onChange={(e) => onAnswerChange(q.id, e.target.value)}
                          className="sr-only"
                        />
                        <span className="text-lg font-bold mb-1 block">{opt.value}</span>
                        <span className="text-[10px] uppercase tracking-tight leading-tight line-clamp-2 px-1">
                            {opt.label.split('(')[0]}
                        </span>
                        
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-current rounded-full"></div>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssessmentForm;