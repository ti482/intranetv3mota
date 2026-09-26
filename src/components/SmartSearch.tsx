import React, { useState } from 'react';
import { SearchableItem, WorkspaceSource } from '../types';
import { 
  Search, 
  Sparkles, 
  FileText, 
  Table, 
  FolderGit2, 
  Globe, 
  HelpCircle, 
  ExternalLink, 
  Filter, 
  BookOpen, 
  CheckCircle2, 
  Eye, 
  X, 
  Copy, 
  Check, 
  Scale, 
  Clock, 
  Share2
} from 'lucide-react';

interface SmartSearchProps {
  items: SearchableItem[];
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const SmartSearch: React.FC<SmartSearchProps> = ({ items, isOpenModal, onCloseModal }) => {
  const [query, setQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | WorkspaceSource | 'pop'>('all');
  const [priorityMode, setPriorityMode] = useState<'balanced' | 'legal' | 'operational'>('balanced');
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiIntent, setAiIntent] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchableItem[]>(items);
  const [selectedPreviewItem, setSelectedPreviewItem] = useState<SearchableItem | null>(null);
  const [copied, setCopied] = useState(false);

  const quickPrompts = [
    'Qual o rito de precatórios no TRF1 e cálculo pela Selic?',
    'Memorial do Tema 1.100 do STF para gratificação de servidores',
    'Procedimento de contingência quando o PJe STJ está fora do ar',
    'Como renovar o Certificado Digital A1 no Google Chrome?',
    'Relação de sindicatos parceiros e próximas assembleias',
    'Minuta de Recurso Extraordinário com Agravo (ARE)',
  ];

  const handleSearch = async (overrideQuery?: string) => {
    const q = overrideQuery !== undefined ? overrideQuery : query;
    if (!q.trim()) {
      setSearchResults(items);
      setAiSummary(null);
      setAiIntent(null);
      return;
    }

    setLoading(true);

    try {
      // Call Gemini Smart Search API endpoint
      const response = await fetch('/api/gemini/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          availableItems: items.map(item => ({
            id: item.id,
            title: item.title,
            source: item.source,
            category: item.category,
            tribunal: item.tribunal,
            summary: item.summary,
            tags: item.tags,
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSummary(data.aiSummary || null);
        setAiIntent(data.searchIntent || null);

        if (data.matchedItemIds && Array.isArray(data.matchedItemIds) && data.matchedItemIds.length > 0) {
          const idMap = new Map(data.matchedItemIds.map((m: any) => [m.id, m]));
          
          let ranked = items
            .filter(item => idMap.has(item.id))
            .map(item => {
              const match = idMap.get(item.id) as any;
              return {
                ...item,
                relevanceScore: match?.relevanceScore || 85,
                highlight: match?.highlight || item.summary,
              };
            })
            .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

          // Apply priority boost
          if (priorityMode === 'legal') {
            ranked = ranked.sort((a, b) => {
              const aIsLegal = a.category === 'peca_juridica' ? 1 : 0;
              const bIsLegal = b.category === 'peca_juridica' ? 1 : 0;
              return bIsLegal - aIsLegal;
            });
          } else if (priorityMode === 'operational') {
            ranked = ranked.sort((a, b) => {
              const aIsOp = a.category === 'planilha_operacional' || a.category === 'procedimento_pop' ? 1 : 0;
              const bIsOp = b.category === 'planilha_operacional' || b.category === 'procedimento_pop' ? 1 : 0;
              return bIsOp - aIsOp;
            });
          }

          setSearchResults(ranked);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('API Smart search fallback to local semantic search:', err);
    }

    // Client-side intelligent fallback search
    const lower = q.toLowerCase();
    const filtered = items.filter(item => {
      const matchText = (item.title + ' ' + item.summary + ' ' + item.content + ' ' + item.tags.join(' ')).toLowerCase();
      return lower.split(' ').some(word => word.length > 2 && matchText.includes(word));
    });

    setSearchResults(filtered.length > 0 ? filtered : items);
    setAiSummary(`Resultados localizados com base nos termos indexados para "${q}".`);
    setLoading(false);
  };

  const getSourceIcon = (source: WorkspaceSource) => {
    switch (source) {
      case 'google_docs':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'google_sheets':
        return <Table className="w-4 h-4 text-emerald-400" />;
      case 'google_drive':
        return <FolderGit2 className="w-4 h-4 text-amber-400" />;
      case 'google_sites':
        return <Globe className="w-4 h-4 text-purple-400" />;
      case 'google_forms':
        return <HelpCircle className="w-4 h-4 text-rose-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSourceLabel = (source: WorkspaceSource) => {
    switch (source) {
      case 'google_docs':
        return 'Google Docs';
      case 'google_sheets':
        return 'Google Sheets';
      case 'google_drive':
        return 'Google Drive';
      case 'google_sites':
        return 'Google Sites (Intranet)';
      case 'google_forms':
        return 'Google Forms';
      default:
        return 'Workspace';
    }
  };

  const filteredItems = searchResults.filter(item => {
    if (sourceFilter === 'all') return true;
    if (sourceFilter === 'pop') return item.category === 'procedimento_pop';
    return item.source === sourceFilter;
  });

  const handleCopyContent = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Introduction */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Busca Semântica &amp; Indexador Integrado
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {items.length} fontes indexadas
              </span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
              Busca Inteligente Mota &amp; Advogados
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
              Pesquise em linguagem natural documentos do Google Drive, minutas jurídicas, planilhas de precatórios, procedimentos POP e murais da intranet com contextualização por IA.
            </p>
          </div>

          {/* Priority selector */}
          <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800 self-start md:self-center">
            <span className="text-[11px] font-medium text-slate-400 px-2 flex items-center gap-1">
              <Filter className="w-3 h-3 text-amber-400" />
              Foco:
            </span>
            <button
              onClick={() => setPriorityMode('balanced')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                priorityMode === 'balanced' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Equilibrado
            </button>
            <button
              onClick={() => setPriorityMode('legal')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                priorityMode === 'legal' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Peças Jurídicas
            </button>
            <button
              onClick={() => setPriorityMode('operational')}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                priorityMode === 'operational' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dados Operacionais
            </button>
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="mt-5 relative">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-amber-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Ex: Como é feito o cálculo do precatório do Tema 1.100 ou qual o rito de indisponibilidade do PJe?"
              className="w-full pl-12 pr-32 py-3.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all shadow-inner"
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="absolute right-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all shadow-md disabled:opacity-50 flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Analisando...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Buscar IA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-medium text-slate-400 mr-1">Sugestões rápidas:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(prompt);
                handleSearch(prompt);
              }}
              className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors truncate max-w-[280px]"
            >
              {prompt}
            </button>
          ))}
        </div>

      </div>

      {/* AI Synthesis Box (if search performed) */}
      {aiSummary && (
        <div className="bg-slate-900/90 rounded-xl p-5 border border-amber-500/30 shadow-lg relative animate-in fade-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex-shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Síntese da Inteligência Artificial
                </h4>
                {aiIntent && (
                  <span className="text-[11px] text-slate-400">
                    • Intenção: <span className="text-slate-200">{aiIntent}</span>
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {aiSummary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Source Filters Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSourceFilter('all')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
            sourceFilter === 'all'
              ? 'bg-slate-200 text-slate-900 font-bold'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Todas as Fontes ({items.length})
        </button>
        <button
          onClick={() => setSourceFilter('google_drive')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
            sourceFilter === 'google_drive'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <FolderGit2 className="w-3.5 h-3.5 text-amber-400" />
          Google Drive (Peças)
        </button>
        <button
          onClick={() => setSourceFilter('google_docs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
            sourceFilter === 'google_docs'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          Google Docs (Memoriais &amp; POP)
        </button>
        <button
          onClick={() => setSourceFilter('google_sheets')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
            sourceFilter === 'google_sheets'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Table className="w-3.5 h-3.5 text-emerald-400" />
          Google Sheets (Precatórios &amp; CRM)
        </button>
        <button
          onClick={() => setSourceFilter('google_sites')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
            sourceFilter === 'google_sites'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-purple-400" />
          Google Sites (Intranet)
        </button>
        <button
          onClick={() => setSourceFilter('pop')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap ${
            sourceFilter === 'pop'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
          Procedimentos POP
        </button>
      </div>

      {/* Results Count and List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>{filteredItems.length} resultado(s) indexado(s)</span>
          <span className="italic">Clique para visualizar o conteúdo diretamente na Intranet</span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedPreviewItem(item)}
              className="group bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg flex flex-col sm:flex-row sm:items-start justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                
                {/* Header metadata row */}
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700">
                    {getSourceIcon(item.source)}
                    <span>{getSourceLabel(item.source)}</span>
                  </span>

                  {item.tribunal && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 font-semibold text-[11px] border border-amber-500/20">
                      <Scale className="w-3 h-3" />
                      {item.tribunal}
                    </span>
                  )}

                  {item.relevanceScore && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold text-[11px] border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      {item.relevanceScore}% Relevância
                    </span>
                  )}

                  <span className="text-[11px] text-slate-500 ml-auto flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.lastUpdated}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h3>

                {/* Highlight or Summary */}
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
                  {item.highlight || item.summary}
                </p>

                {/* Tags and Author */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[11px] text-slate-400">Por {item.author}</span>
                  <span className="text-slate-600">•</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {item.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-1.5 py-0.5 text-[10px] rounded bg-slate-800/80 text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Action buttons */}
              <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPreviewItem(item);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver na Intranet</span>
                </button>
                <a
                  href={item.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors"
                  title="Abrir no Google Workspace"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Workspace</span>
                </a>
              </div>

            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="bg-slate-900 rounded-xl p-8 text-center border border-slate-800">
              <Search className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">Nenhum resultado encontrado para esta consulta.</p>
              <p className="text-xs text-slate-500 mt-1">Tente usar outros termos jurídicos ou selecione &apos;Todas as Fontes&apos;.</p>
            </div>
          )}
        </div>
      </div>

      {/* In-App Direct Document Preview Modal */}
      {selectedPreviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-slate-800 border border-slate-700">
                  {getSourceIcon(selectedPreviewItem.source)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-amber-400 font-semibold uppercase">
                      {getSourceLabel(selectedPreviewItem.source)}
                    </span>
                    {selectedPreviewItem.tribunal && (
                      <span className="text-[11px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {selectedPreviewItem.tribunal}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                    {selectedPreviewItem.title}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyContent(selectedPreviewItem.content)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors"
                  title="Copiar texto da minuta/documento"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <a
                  href={selectedPreviewItem.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Abrir no Workspace</span>
                </a>
                <button
                  onClick={() => setSelectedPreviewItem(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto space-y-4 font-sans text-sm text-slate-300 bg-slate-900/50">
              
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2">
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Resumo Executivo do Documento
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {selectedPreviewItem.summary}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>Autor: <strong className="text-slate-300">{selectedPreviewItem.author}</strong></span>
                  <span>•</span>
                  <span>Última atualização: <strong className="text-slate-300">{selectedPreviewItem.lastUpdated}</strong></span>
                </div>
              </div>

              {/* Full Text View formatted like Google Docs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Conteúdo Completo do Arquivo:</span>
                  <span className="text-[11px] text-slate-500 font-mono">Modo de Leitura Nativo</span>
                </div>
                <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs sm:text-[13px] leading-relaxed text-slate-300 whitespace-pre-wrap selection:bg-amber-500/30">
                  {selectedPreviewItem.content}
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-1.5 flex-wrap pt-2">
                <span className="text-xs text-slate-400 font-medium">Marcadores:</span>
                {selectedPreviewItem.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full text-[11px] bg-slate-800 text-amber-300/80 border border-slate-700"
                  >
                    #{t}
                  </span>
                ))}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Mota &amp; Advogados Associados • Edifício Athenas</span>
              <button
                onClick={() => setSelectedPreviewItem(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
              >
                Fechar Visualizador
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
