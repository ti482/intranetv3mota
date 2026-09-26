import React, { useState } from 'react';
import { POPProcedure } from '../types';
import { 
  BookOpen, 
  FileCheck2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  ShieldCheck, 
  Search,
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface WikiPopProps {
  procedures: POPProcedure[];
}

export const WikiPop: React.FC<WikiPopProps> = ({ procedures }) => {
  const [selectedPopId, setSelectedPopId] = useState<string>(procedures[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Step check tracking for audit checklist
  const [checkedSteps, setCheckedSteps] = useState<{ [key: string]: boolean }>({});

  const toggleCheck = (stepKey: string) => {
    setCheckedSteps(prev => ({
      ...prev,
      [stepKey]: !prev[stepKey],
    }));
  };

  const selectedProcedure = procedures.find(p => p.id === selectedPopId) || procedures[0];

  const filteredProcedures = procedures.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Wiki Corporativa &amp; Procedimentos Operacionais Padrão (POP)
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Baseada em Google Docs Institucionais
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
            Manuais de Procedimentos &amp; Rotinas da Banca
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Padronização de protocolo nos Tribunais Superiores, contingências de sistemas judiciais, gestão de certificados digitais e sustentação oral.
          </p>
        </div>
      </div>

      {/* Main Layout: List on Left, Active Procedure on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Procedure List & Search */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar POP..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            {filteredProcedures.map((pop) => (
              <div
                key={pop.id}
                onClick={() => setSelectedPopId(pop.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedProcedure.id === pop.id
                    ? 'bg-blue-500/10 border-blue-500/40 text-blue-200 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-amber-400">
                      {pop.code}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                      {pop.category}
                    </span>
                  </div>
                  <div className="text-xs font-semibold leading-tight line-clamp-1">
                    {pop.title}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Versão {pop.version} • {pop.steps.length} etapas
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Selected Procedure Document View */}
        <div className="lg:col-span-2 space-y-4">
          {selectedProcedure && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
              
              {/* Document Header */}
              <div className="border-b border-slate-800 pb-4 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded">
                      {selectedProcedure.code}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 font-semibold">
                      {selectedProcedure.category}
                    </span>
                  </div>
                  <span className="font-mono text-slate-400">
                    Vigência: {selectedProcedure.effectiveDate} • Versão {selectedProcedure.version}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white leading-tight">
                  {selectedProcedure.title}
                </h3>

                <div className="text-xs text-slate-400 flex items-center gap-2 pt-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Aprovado por: <strong className="text-slate-200">{selectedProcedure.approvedBy}</strong></span>
                </div>
              </div>

              {/* Critical Invariants / Rules */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Regras Críticas &amp; Diretrizes Fatais</span>
                </div>
                <ul className="space-y-1.5 text-xs text-amber-200 list-disc list-inside">
                  {selectedProcedure.criticalRules.map((rule, idx) => (
                    <li key={idx} className="leading-relaxed">{rule}</li>
                  ))}
                </ul>
              </div>

              {/* Step by Step with Interactive Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                  <span>Etapas do Procedimento &amp; Checklist de Execução</span>
                  <span className="text-[11px] text-slate-400 font-normal">Marque para conferência da auditoria</span>
                </div>

                <div className="space-y-3">
                  {selectedProcedure.steps.map((step) => {
                    const stepKey = `${selectedProcedure.id}-step-${step.order}`;
                    const isChecked = checkedSteps[stepKey] || false;

                    return (
                      <div
                        key={step.order}
                        onClick={() => toggleCheck(stepKey)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                          isChecked
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className={`mt-0.5 p-1 rounded-md border flex items-center justify-center ${
                          isChecked
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'border-slate-600 bg-slate-900 text-transparent'
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>

                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-white">
                              Passo {step.order}: {step.title}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-slate-400 border border-slate-800">
                              Resp: {step.responsible}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {step.instructions}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};
