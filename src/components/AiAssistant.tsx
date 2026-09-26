import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, UserProfile } from '../types';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  BrainCircuit, 
  Zap, 
  Sliders, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Server, 
  Copy, 
  Check, 
  RefreshCw, 
  Terminal, 
  Cpu, 
  ExternalLink,
  ShieldCheck,
  Building2,
  MessageSquare
} from 'lucide-react';

interface AiAssistantProps {
  currentUser: UserProfile;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ currentUser }) => {
  const [subTab, setSubTab] = useState<'chat' | 'ocr' | 'image' | 'mcp_guide'>('chat');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Olá, ${currentUser.name}! Sou o Agente de Inteligência Artificial da banca Mota & Advogados Associados (OAB/DF 1413-A).
Estou conectado aos conhecimentos de Ações Coletivas, Teses do STF/STJ, Precatórios e às diretrizes corporativas do Google Workspace. Como posso apoiar suas peças ou operações hoje?`,
      timestamp: '10:00',
      modelUsed: 'gemini-3.5-flash',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  
  // Model settings
  const [modelChoice, setModelChoice] = useState<'pro' | 'general' | 'fast'>('general');
  const [thinkingMode, setThinkingMode] = useState(false);
  const [roleOption, setRoleOption] = useState<string>('stf_specialist');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Roles definition
  const roles: { [key: string]: { name: string; systemPrompt: string; badge: string } } = {
    stf_specialist: {
      name: 'Especialista em Tribunais Superiores (STF/STJ/TST)',
      badge: 'STF / STJ',
      systemPrompt: `Você é o Consultor Jurídico Sênior da banca Mota & Advogados Associados (OAB/DF 1413-A). 
Sua expertise é focada em recursos extraordinários (ARE), agravos em recurso especial (AREsp), prequestionamento explícito, repercussão geral e teses repetitivas sobre servidores públicos federais (ex: Temas 1.100 e 1.150). Responda com rigor técnico e citação dos artigos do CPC e da CF/88.`,
    },
    precatorios: {
      name: 'Auditor de Precatórios, RPVs & Liquidação',
      badge: 'Precatórios / Fazenda',
      systemPrompt: `Você é o Auditor de Cálculos e Precatórios da banca Mota & Advogados Associados. 
Sua especialidade é a execução contra a Fazenda Pública, aplicação da Taxa Selic (EC 113/2021), retenção de PSS, destaque de honorários advocatícios (art. 22 Lei 8.906/94) e cronograma orçamentário dos Tribunais Regionais Federais.`,
    },
    workspace_ti: {
      name: 'Consultor de TI & Workspace MCP Server',
      badge: 'Google Workspace TI',
      systemPrompt: `Você é o Arquiteto de Sistemas e Integrações Google Workspace da banca Mota & Advogados Associados, auxiliando o gestor Carlos Eduardo Siqueira (ti@mota.adv.br). 
Você instrui sobre Google Apps Script, configuração de MCP Servers para Gemini e agentes externos, segurança de Drives Compartilhados e automações no Google Chat.`,
    },
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || chatLoading) return;

    const userText = inputMessage;
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMessage('');
    setChatLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newMsg].map(m => ({ role: m.role, content: m.content })),
          modelChoice,
          thinking: thinkingMode,
          systemPrompt: roles[roleOption].systemPrompt,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha na resposta do servidor.');
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        role: 'assistant',
        content: data.text || 'Sem resposta.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed,
        thinkingMode: thinkingMode,
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `Desculpe, ocorreu uma instabilidade na consulta de IA: ${err.message || 'Verifique o status da API.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  // OCR & Image Understanding State
  const [docImageBase64, setDocImageBase64] = useState<string | null>(null);
  const [ocrPrompt, setOcrPrompt] = useState('Analise esta notificação / despacho judicial e extraia partes, número do processo, prazos fatais e providências recomendadas.');
  const [ocrResult, setOcrResult] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeDocument = async () => {
    if (!docImageBase64) return;
    setOcrLoading(true);
    setOcrResult(null);

    try {
      const res = await fetch('/api/gemini/analyze-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: docImageBase64,
          prompt: ocrPrompt,
        }),
      });

      const data = await res.json();
      setOcrResult(data.analysis || 'Não foi possível analisar.');
    } catch (err: any) {
      setOcrResult(`Erro ao analisar imagem: ${err.message}`);
    } finally {
      setOcrLoading(false);
    }
  };

  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState('Logotipo elegante de escritório de advocacia com edifício contemporâneo em Brasília, tons de azul escuro e dourado.');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setImageLoading(true);

    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: '16:9',
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setImageLoading(false);
    }
  };

  // MCP Guide Copy
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Inteligência Artificial Nativa &amp; Model Context Protocol (MCP)
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Modelos: Gemini 3.1 Pro Preview, 3.5 Flash &amp; 3.1 Flash Lite
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
            Agente Jurídico Gemini &amp; Central MCP Workspace
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Assistente conversacional multi-turnos com raciocínio profundo, análise visual de notificações/documentos, gerador de peças e arquitetura de MCP Servers para TI.
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setSubTab('chat')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
            subTab === 'chat'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bot className="w-4 h-4 text-amber-400" />
          <span>Chatbot Multi-Turnos (Gemini)</span>
        </button>

        <button
          onClick={() => setSubTab('ocr')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
            subTab === 'ocr'
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 text-blue-400" />
          <span>Análise Visual de Documentos / OCR (Pro)</span>
        </button>

        <button
          onClick={() => setSubTab('image')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
            subTab === 'image'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ImageIcon className="w-4 h-4 text-purple-400" />
          <span>Criador &amp; Editor Visual (Gemini Image)</span>
        </button>

        <button
          onClick={() => setSubTab('mcp_guide')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap ${
            subTab === 'mcp_guide'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Server className="w-4 h-4 text-cyan-400" />
          <span>Guia Estratégico MCP Server (TI)</span>
        </button>
      </div>

      {/* SUBTAB 1: MULTI-TURN CHAT */}
      {subTab === 'chat' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl flex flex-col h-[650px] overflow-hidden">
          
          {/* Chat Settings Bar */}
          <div className="p-3.5 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            
            {/* Role selector */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Papel do Agente:
              </span>
              <select
                value={roleOption}
                onChange={(e) => setRoleOption(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs font-semibold focus:ring-1 focus:ring-amber-500"
              >
                <option value="stf_specialist">STF &amp; Tribunais Superiores</option>
                <option value="precatorios">Precatórios &amp; Fazenda Pública</option>
                <option value="workspace_ti">TI &amp; Workspace MCP</option>
              </select>
            </div>

            {/* Model & Thinking Mode toggles */}
            <div className="flex items-center gap-3">
              
              {/* Model Choice */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setModelChoice('pro')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    modelChoice === 'pro' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title="gemini-3.1-pro-preview para raciocínio complexo"
                >
                  Pro Preview
                </button>
                <button
                  type="button"
                  onClick={() => setModelChoice('general')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    modelChoice === 'general' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title="gemini-3.5-flash para tarefas gerais"
                >
                  Flash 3.5
                </button>
                <button
                  type="button"
                  onClick={() => setModelChoice('fast')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    modelChoice === 'fast' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                  title="gemini-3.1-flash-lite para respostas ultra-rápidas"
                >
                  Lite Fast
                </button>
              </div>

              {/* High Thinking Toggle (gemini-3.1-pro-preview with ThinkingLevel.HIGH) */}
              <label 
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${
                  thinkingMode
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
                title="Ativa ThinkingLevel.HIGH com gemini-3.1-pro-preview para teses complexas"
              >
                <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                <input
                  type="checkbox"
                  checked={thinkingMode}
                  onChange={(e) => {
                    setThinkingMode(e.target.checked);
                    if (e.target.checked) setModelChoice('pro');
                  }}
                  className="hidden"
                />
                <span>Thinking Alto</span>
              </label>

            </div>

          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-sans text-sm">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isUser
                      ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-500/30 font-bold text-xs'
                      : 'bg-slate-800 text-amber-300 ring-2 ring-slate-700'
                  }`}>
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-2xl rounded-2xl p-4 shadow-md space-y-1.5 ${
                    isUser
                      ? 'bg-amber-600 text-white rounded-tr-none'
                      : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}>
                    <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 pb-1 border-b border-slate-800/40">
                      <span className="font-semibold">
                        {isUser ? currentUser.name : roles[roleOption].badge}
                      </span>
                      <div className="flex items-center gap-2">
                        {m.modelUsed && (
                          <span className="font-mono text-amber-400/90">{m.modelUsed}</span>
                        )}
                        {m.thinkingMode && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            Thinking HIGH
                          </span>
                        )}
                        <span>{m.timestamp}</span>
                      </div>
                    </div>

                    <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
                      {m.content}
                    </div>
                  </div>
                </div>
              );
            })}

            {chatLoading && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 text-amber-300 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 rounded-tl-none text-xs text-slate-400 flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span>
                    {thinkingMode ? 'Processando raciocínio profundo no STF/STJ (Thinking Level HIGH)...' : 'Elaborando resposta jurídica com Gemini...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Pergunte sobre teses jurídicas, regras de precatórios, rito do STF ou rotinas do escritório..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
              <button
                type="submit"
                disabled={chatLoading || !inputMessage.trim()}
                className="p-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition-all shadow-md flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* SUBTAB 2: DOCUMENT IMAGE OCR & UNDERSTANDING */}
      {subTab === 'ocr' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400 font-bold uppercase">
              <FileText className="w-4 h-4" />
              <span>Modelo: gemini-3.1-pro-preview</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              Análise Multimodal de Notificações, Despachos &amp; Certidões
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Faça upload de fotos de despachos judiciais, intimações do DJe ou certidões para extração de dados e síntese processual.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Upload Area */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-6 text-center bg-slate-950 cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {docImageBase64 ? (
                  <div className="space-y-2">
                    <img
                      src={docImageBase64}
                      alt="Documento"
                      className="max-h-60 mx-auto rounded-lg object-contain shadow-md"
                    />
                    <span className="text-xs text-emerald-400 font-medium">Imagem carregada com sucesso. Clique para substituir.</span>
                  </div>
                ) : (
                  <div className="space-y-2 py-6">
                    <Upload className="w-10 h-10 text-slate-500 mx-auto" />
                    <p className="text-xs font-semibold text-slate-300">
                      Clique para selecionar foto ou arraste o arquivo do despacho
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">PNG, JPG, WEBP até 15MB</p>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Instruções para a IA Gemini 3.1 Pro:
                </label>
                <textarea
                  rows={3}
                  value={ocrPrompt}
                  onChange={(e) => setOcrPrompt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleAnalyzeDocument}
                disabled={!docImageBase64 || ocrLoading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {ocrLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analisando com Gemini 3.1 Pro...</span>
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-4 h-4" />
                    <span>Executar Análise &amp; OCR Jurídico</span>
                  </>
                )}
              </button>
            </div>

            {/* Analysis Output */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
                  <span>Resultado da Análise Cognitiva</span>
                  <span className="text-blue-400 font-mono">gemini-3.1-pro-preview</span>
                </div>

                {ocrResult ? (
                  <div className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed max-h-[420px] overflow-y-auto">
                    {ocrResult}
                  </div>
                ) : (
                  <div className="py-20 text-center text-slate-500 text-xs">
                    Envie um documento e clique em &apos;Executar Análise&apos; para visualizar os apontamentos da IA.
                  </div>
                )}
              </div>

              {ocrResult && (
                <div className="pt-3 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => navigator.clipboard.writeText(ocrResult)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copiar Síntese</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SUBTAB 3: IMAGE GENERATOR / VISUAL ASSETS */}
      {subTab === 'image' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold uppercase">
              <ImageIcon className="w-4 h-4" />
              <span>Modelo: gemini-3.1-flash-image</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              Criação &amp; Edição de Ativos Visuais da Firma
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Gere banners para comunicados institucionais, informativos aos sindicatos e murais do escritório com prompts em português.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Descreva a Imagem Desejada:
                </label>
                <textarea
                  rows={4}
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Ex: Banner corporativo para o informativo sobre Precatórios 2027 com a sede em Brasília e elementos da Justiça Federal..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <button
                onClick={handleGenerateImage}
                disabled={imageLoading || !imagePrompt.trim()}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {imageLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Gerando imagem com Gemini 3.1 Flash Image...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Gerar Imagem com IA</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-center min-h-[250px]">
              {generatedImageUrl ? (
                <img
                  src={generatedImageUrl}
                  alt="Imagem Gerada"
                  className="max-h-72 w-full object-contain rounded-lg shadow-lg"
                />
              ) : (
                <div className="text-center text-slate-500 text-xs space-y-1">
                  <ImageIcon className="w-10 h-10 mx-auto text-slate-600" />
                  <p>A prévia da imagem gerada aparecerá aqui.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* SUBTAB 4: MCP SERVER GUIDE FOR TI */}
      {subTab === 'mcp_guide' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase">
                <Server className="w-4 h-4" />
                <span>Arquitetura de Integrações • Domínio @mota.adv.br</span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                Guia Estratégico: Google Workspace MCP Server &amp; Agentes
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Elaborado especialmente para <strong className="text-amber-300">Carlos Eduardo Siqueira (ti@mota.adv.br)</strong>.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 self-start sm:self-center">
              Plano Workspace Nativo
            </span>
          </div>

          <div className="space-y-6 text-xs text-slate-300 leading-relaxed">
            
            {/* Step 1: MCP Server Overview */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  1. O que é o Google Workspace MCP Server e Por Que Adotá-lo?
                </h4>
                <button
                  onClick={() => handleCopyCode(`{
  "mcpServers": {
    "google-workspace": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-google-workspace"
      ],
      "env": {
        "GOOGLE_WORKSPACE_CREDENTIALS": "/etc/mota-workspace-key.json",
        "GOOGLE_WORKSPACE_DELEGATED_USER": "ti@mota.adv.br"
      }
    }
  }
}`, 'code-mcp-config')}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  {copiedCode === 'code-mcp-config' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode === 'code-mcp-config' ? 'Copiado!' : 'Copiar Config'}</span>
                </button>
              </div>

              <p>
                O <strong>Model Context Protocol (MCP)</strong> é o protocolo aberto da indústria que permite a qualquer agente de inteligência artificial (Google AI Studio, Gemini CLI, Claude Code, Langflow) conectar-se com segurança aos repositórios do <strong>Google Drive, Google Docs, Google Sheets e Google Calendar</strong> da banca sem expor dados confidenciais a provedores externos não autorizados.
              </p>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-cyan-200 overflow-x-auto">
{`{
  "mcpServers": {
    "google-workspace": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-google-workspace"],
      "env": {
        "GOOGLE_WORKSPACE_CREDENTIALS": "/etc/mota-workspace-key.json",
        "GOOGLE_WORKSPACE_DELEGATED_USER": "ti@mota.adv.br"
      }
    }
  }
}`}
              </div>
            </div>

            {/* Step 2: Google Chat Webhook Integration */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  2. Automação de Alertas no Google Chat via Apps Script Triggers
                </h4>
                <button
                  onClick={() => handleCopyCode(`function onFormSubmitTicket(e) {
  var webhookUrl = "https://chat.googleapis.com/v1/spaces/SPACES_ID/messages?key=AIza...&token=...";
  var responses = e.namedValues;
  var payload = {
    "text": "🚨 *Novo Chamado de TI Aberto na Intranet*\\n" +
            "• Protocolo: " + responses['Protocolo'][0] + "\\n" +
            "• Solicitante: " + responses['Solicitante'][0] + "\\n" +
            "• Assunto: " + responses['Assunto'][0] + "\\n" +
            "• Prioridade: " + responses['Prioridade'][0]
  };
  UrlFetchApp.fetch(webhookUrl, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  });
}`, 'code-apps-script')}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
                >
                  {copiedCode === 'code-apps-script' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode === 'code-apps-script' ? 'Copiado!' : 'Copiar Script'}</span>
                </button>
              </div>

              <p>
                Para eliminar a necessidade de servidores Node/Next dedicados para disparo de notificações, configure um trigger de <strong>Google Apps Script</strong> diretamente na planilha do formulário de chamados de TI que envia um webhook formatado para o Espaço <strong>#suporte-ti</strong> do Google Chat:
              </p>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-200 overflow-x-auto">
{`function onFormSubmitTicket(e) {
  var webhookUrl = "https://chat.googleapis.com/v1/spaces/SPACES_ID/messages?key=...&token=...";
  var responses = e.namedValues;
  var payload = {
    "text": "🚨 *Novo Chamado TI Aberto na Intranet*\\n" +
            "• Protocolo: " + responses['Protocolo'][0] + "\\n" +
            "• Solicitante: " + responses['Solicitante'][0] + "\\n" +
            "• Assunto: " + responses['Assunto'][0] + "\\n" +
            "• Prioridade: " + responses['Prioridade'][0]
  };
  UrlFetchApp.fetch(webhookUrl, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload)
  });
}`}
              </div>
            </div>

            {/* Step 3: Google Workspace Shared Drives Segregation */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-2">
              <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                3. Matriz de Permissões de Shared Drives (Drives Compartilhados)
              </h4>
              <p>
                No Google Workspace corporativo da firma, os dados sensíveis devem ser divididos em Drives Compartilhados distintos:
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pt-1">
                <li><strong className="text-slate-200">Drive &apos;STF &amp; STJ - Ações Coletivas&apos;:</strong> Acesso de Leitor/Comentador para estagiários, Administrador de Conteúdo para advogados.</li>
                <li><strong className="text-slate-200">Drive &apos;Financeiro &amp; Precatórios&apos;:</strong> Restrito aos e-mails de sócios (<code className="text-amber-400">roberto.mota@mota.adv.br</code>) e TI. Download bloqueado para contas externas.</li>
                <li><strong className="text-slate-200">Drive &apos;Biblioteca &amp; POPs&apos;:</strong> Leitura pública para todos os colaboradores com e-mail corporativo <code className="text-cyan-400">@mota.adv.br</code>.</li>
              </ul>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
