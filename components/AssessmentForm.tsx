import React from 'react';
import { DOMAINS, ASSESSMENT_OPTIONS } from '../constants';
import { Answers } from '../types';
import { ChevronRightIcon } from './icons';

interface AssessmentFormProps {
  answers: Answers;
  onAnswerChange: (questionId: string, value: string) => void;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({ answers, onAnswerChange }) => {
  return (
    <div className="space-y-8">
      {DOMAINS.map((domain) => (
        <div 
          key={domain.id} 
          className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md"
        >
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                {domain.id.toUpperCase()}
              </span>
              {domain.title}
            </h3>
            <p className="text-slate-500 text-sm mt-1 ml-1">{domain.description}</p>
          </div>

          <div className="p-6 space-y-6">
            {domain.questions.map((q) => (
              <div key={q.id} className="animate-slide-up">
                <p className="font-medium text-slate-700 mb-3 text-sm md:text-base">
                  {q.text}
                </p>
                {/* Changed grid layout to accommodate 6 options nicely (1 on mobile, 2 on tablet, 3 on desktop) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ASSESSMENT_OPTIONS.map((opt) => {
                    const isSelected = answers[q.id] === opt.value;
                    return (
                      <label
                        key={`${q.id}-${opt.value}`}
                        className={`
                          relative flex items-center px-4 py-3 rounded-lg cursor-pointer border text-sm font-medium transition-all duration-200
                          ${isSelected 
                            ? `${opt.colorClass} ring-2 ring-offset-1 ring-primary-200 shadow-sm` 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
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
                        <span>{opt.label}</span>
                        {isSelected && (
                          <div className="absolute top-1/2 right-3 -translate-y-1/2 w-2.5 h-2.5 bg-current rounded-full opacity-60"></div>
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