import React, { useState } from 'react';
import { CrmEntity } from '../types';
import { 
  Users, 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  Scale, 
  Search, 
  ExternalLink,
  Plus,
  MessageSquare
} from 'lucide-react';

interface CrmModuleProps {
  entities: CrmEntity[];
}

export const CrmModule: React.FC<CrmModuleProps> = ({ entities }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEntities = entities.filter(e => 
    e.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.sigla.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.baseRepresentada.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Módulo CRM MOTA • Relações Institucionais
            </span>
            <span className="text-xs text-slate-400 font-mono">
              34 Sindicatos &amp; Associações
            </span>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
            Gestão de Entidades de Classe &amp; Ações Coletivas
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            Mapeamento completo das entidades representativas de servidores públicos parceiras da banca, total de servidores substituídos e calendário de assembleias coletivas.
          </p>
        </div>

        <div className="relative w-full sm:w-64 self-start md:self-center">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar sindicato ou associação..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Grid of Partner Entities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEntities.map((entity) => (
          <div
            key={entity.id}
            className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-5 shadow-lg space-y-4 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">{entity.sigla}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    {entity.tipo}
                  </span>
                </div>
                <h4 className="text-xs text-slate-300 font-medium mt-0.5">
                  {entity.nome}
                </h4>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  {entity.totalSubstituidos.toLocaleString('pt-BR')}
                </span>
                <div className="text-[10px] text-slate-500 uppercase">Substituídos</div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1.5 text-slate-300">
              <div>
                <span className="text-slate-400">Base Representada: </span>
                <strong className="text-slate-200">{entity.baseRepresentada}</strong>
              </div>
              <div>
                <span className="text-slate-400">Contato Principal: </span>
                <strong className="text-slate-200">{entity.contatoPrincipal}</strong> ({entity.cargoContato})
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-500" />
                  {entity.email}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Phone className="w-3 h-3 text-slate-500" />
                  {entity.telefone}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                <span>{entity.acoesAtivas} Ações Coletivas Ativas</span>
              </div>

              {entity.proximaAssembleia && (
                <div className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
                  <Calendar className="w-3 h-3 text-cyan-400" />
                  <span>Assembleia: {entity.proximaAssembleia}</span>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
