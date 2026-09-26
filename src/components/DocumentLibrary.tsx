import React, { useState } from 'react';
import { LegalDocument } from '../types';
import { 
  FolderGit2, 
  FileText, 
  Scale, 
  ExternalLink, 
  Download, 
  Copy, 
  Check, 
  Eye, 
  X, 
  Search, 
  Folder, 
  Sparkles,
  Sliders
} from 'lucide-react';

interface DocumentLibraryProps {
  documents: LegalDocument[];
}

export const DocumentLibrary: React.FC<DocumentLibraryProps> = ({ documents }) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchDoc, setSearchDoc] = useState('');
  const [activeDoc, setActiveDoc] = useState<LegalDocument | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Dynamic template variable filler state
  const [variablesState, setVariablesState] = useState<{ [key: string]: string }>({});

  const folders = [
    { id: 'all', name: 'Todas as Pastas' },
    { id: 'Tribunais Superiores / STF', name: 'STF (Recursos & Memoriais)' },
    { id: 'Tribunais Superiores / STJ', name: 'STJ (Recursos Especiais)' },
    { id: 'Execuções & Precatórios / TRF1', name: 'TRF1 (Execuções & Precatórios)' },
    { id: 'Contratos & Administrativo', name: 'Contratos & Honorários Coletivos' },
  ];

  const filteredDocs = documents.filter(doc => {
    const matchFolder = selectedFolder === 'all' || doc.folder === selectedFolder;
    const matchSearch = doc.title.toLowerCase().includes(searchDoc.toLowerCase()) || 
                        doc.description.toLowerCase().includes(searchDoc.toLowerCase());
    return matchFolder && matchSearch;
  });

  const handleOpenDoc = (doc: LegalDocument) => {
    setActiveDoc(doc);
    // Initialize variable inputs
    const initialVars: { [key: string]: string } = {};
    doc.variables.forEach(v => {
      initialVars[v] = '';
    });
    setVariablesState(initialVars);
  };

  const getComputedDocumentText = () => {
    if (!activeDoc) return '';
    let text = activeDoc.fullText;
    Object.entries(variablesState).forEach(([key, val]) => {
      if (val.trim()) {
        text = text.replaceAll(key, val);
      }
    });
    return text;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getComputedDocumentText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <FolderGit2 className="w-3.5 h-3.5" />
              Google Drive Compartilhado • Núcleo Jurídico
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Repositório Oficial de Peças &amp; Modelos
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
            Hub de Modelos &amp; Peças Jurídicas
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Biblioteca de minutas padronizadas, recursos aos Tribunais Superiores (STF/STJ) e contratos de honorários coletivos mantidos no Google Drive institucional.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://drive.google.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir Google Drive</span>
          </a>
        </div>
      </div>

      {/* Folder Navigation & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {folders.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFolder(f.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedFolder === f.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>{f.name}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchDoc}
            onChange={(e) => setSearchDoc(e.target.value)}
            placeholder="Filtrar modelos..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => handleOpenDoc(doc)}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-xl p-5 shadow-lg flex flex-col justify-between gap-3 cursor-pointer group transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  <Scale className="w-3 h-3" />
                  {doc.tribunal}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {doc.fileFormat} • Atualizado em {doc.lastModified}
                </span>
              </div>

              <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                {doc.title}
              </h4>

              <div className="text-xs text-slate-400 font-mono">
                Pasta: {doc.folder}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {doc.description}
              </p>

              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Variáveis:</span>
                {doc.variables.map((v, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-950 text-[10px] font-mono text-cyan-300 border border-slate-800">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preencher &amp; Visualizar Minuta</span>
              </button>
              <a
                href={doc.driveUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Abrir no Google Docs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* In-App Document Viewer & Variable Replacement Modal */}
      {activeDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono text-amber-400 font-semibold uppercase">
                    {activeDoc.folder} • {activeDoc.tribunal}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {activeDoc.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Texto Copiado!' : 'Copiar Petição'}</span>
                </button>
                <a
                  href={activeDoc.driveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Google Docs</span>
                </a>
                <button
                  onClick={() => setActiveDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Split View: Dynamic Variables inputs on the left, Real-time Document Text on the right */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              
              {/* Left Column: Form to fill variables */}
              <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-800 p-4 bg-slate-950/50 overflow-y-auto space-y-3 flex-shrink-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Preenchimento Rápido</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Preencha os campos abaixo para substituir as variáveis diretamente no texto da petição:
                </p>

                <div className="space-y-3 pt-1">
                  {activeDoc.variables.map((variable) => (
                    <div key={variable} className="space-y-1">
                      <label className="text-[11px] font-mono font-semibold text-cyan-300">
                        {variable}
                      </label>
                      <input
                        type="text"
                        value={variablesState[variable] || ''}
                        onChange={(e) => setVariablesState({ ...variablesState, [variable]: e.target.value })}
                        placeholder={`Inserir ${variable.replace(/[\[\]]/g, '').toLowerCase()}...`}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800">
                  <button
                    onClick={() => {
                      const cleared: { [key: string]: string } = {};
                      activeDoc.variables.forEach(v => cleared[v] = '');
                      setVariablesState(cleared);
                    }}
                    className="w-full py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-medium"
                  >
                    Limpar Variáveis
                  </button>
                </div>
              </div>

              {/* Right Column: Interactive Document Canvas */}
              <div className="flex-1 p-6 overflow-y-auto bg-slate-900/40">
                <div className="max-w-2xl mx-auto bg-slate-950 p-6 sm:p-8 rounded-xl border border-slate-800 shadow-2xl font-serif text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap selection:bg-amber-500/30">
                  {getComputedDocumentText()}
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Mota &amp; Advogados Associados (OAB/DF 1413-A) • Edifício Athenas</span>
              <button
                onClick={() => setActiveDoc(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold"
              >
                Concluir
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
