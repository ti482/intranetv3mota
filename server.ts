import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20mb' }));

// ---------------------------------------------------------
// Persistent Data Storage (Tickets & Audits)
// ---------------------------------------------------------
const DATA_DIR = path.resolve(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const TICKETS_FILE = path.join(DATA_DIR, 'tickets.json');

const SEED_TICKETS = [
  {
    id: 'tk-1',
    protocol: 'MOTA-TI-2026-091',
    requesterName: 'Dra. Beatriz Alcântara Lima',
    requesterEmail: 'beatriz.lima@mota.adv.br',
    category: 'PJe/e-SAJ',
    subject: 'Certidão de indisponibilidade não carrega no PJe TRF1',
    description: 'Estou tentando assinar agravo de instrumento urgente e o assinador PJeOffice exibe erro de handshake TLS 1.3.',
    priority: 'Urgente',
    status: 'Em Análise',
    createdAt: '2026-09-25 09:30',
    updatedAt: '2026-09-25 09:45',
    assignedTo: 'Carlos Eduardo Siqueira',
  },
  {
    id: 'tk-2',
    protocol: 'MOTA-TI-2026-092',
    requesterName: 'Dr. Roberto Mota',
    requesterEmail: 'roberto.mota@mota.adv.br',
    category: 'Hardware/Rede',
    subject: 'Solicitação de acesso VPN seguro para sustentação oral no STF',
    description: 'Necessidade de túnel IP dedicado com prioridade QoS para transmissão em tempo real da sessão plenária do STF.',
    priority: 'Alta',
    status: 'Resolvido',
    solutionNotes: 'Configurada rota direta com link de redundância de fibra e túnel IPSec prioritário. Testes realizados com latência de 4ms.',
    createdAt: '2026-09-24 14:15',
    updatedAt: '2026-09-24 16:30',
    assignedTo: 'Carlos Eduardo Siqueira',
  },
  {
    id: 'tk-3',
    protocol: 'MOTA-TI-2026-093',
    requesterName: 'Lucas Mendes Santana',
    requesterEmail: 'lucas.santana@mota.adv.br',
    category: 'Sistemas/Software',
    subject: 'Falha de compilação de planilha de liquidação no PJe-Calc',
    description: 'Ao rodar o cálculo de juros pela Selic na execução do tema 1.100, os índices de 2021 estão divergentes da tabela do CJF.',
    priority: 'Média',
    status: 'Pendente',
    createdAt: '2026-09-26 11:00',
    updatedAt: '2026-09-26 11:00',
    assignedTo: 'Carlos Eduardo Siqueira',
  }
];

function loadTickets() {
  try {
    if (fs.existsSync(TICKETS_FILE)) {
      const data = fs.readFileSync(TICKETS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading tickets from file:', err);
  }
  // Initialize with seed
  try {
    fs.writeFileSync(TICKETS_FILE, JSON.stringify(SEED_TICKETS, null, 2), 'utf8');
  } catch (err) {
    console.error('Error initializing tickets file:', err);
  }
  return SEED_TICKETS;
}

function saveTickets(tickets: any[]) {
  try {
    fs.writeFileSync(TICKETS_FILE, JSON.stringify(tickets, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving tickets to file:', err);
  }
}

// ---------------------------------------------------------
// Authentication & Role Helpers
// ---------------------------------------------------------
const ADMIN_EMAIL = 'ti@mota.adv.br';
const ALLOWED_DOMAIN = 'mota.adv.br';

function determineRole(email: string) {
  const normalized = email.toLowerCase().trim();
  if (normalized === ADMIN_EMAIL) {
    return {
      role: 'ti_admin',
      roleTitle: 'Gestor de TI & Administrador Geral da Intranet',
      department: 'Tecnologia da Informação & Operações',
    };
  }
  if (normalized.includes('roberto') || normalized.includes('mota.adv') || normalized.includes('socio')) {
    return {
      role: 'partner',
      roleTitle: 'Sócio Fundador & Coordenador Geral',
      department: 'Diretoria Executiva',
    };
  }
  if (normalized.includes('beatriz') || normalized.includes('advogado') || normalized.includes('senior')) {
    return {
      role: 'senior_attorney',
      roleTitle: 'Advogado(a) Sênior - Ações Coletivas',
      department: 'Núcleo de Tribunais Superiores',
    };
  }
  return {
    role: 'trainee',
    roleTitle: 'Analista Jurídico / Colaborador',
    department: 'Pesquisa Jurisprudencial & Prazos',
  };
}

// ---------------------------------------------------------
// Real Google Authentication Verification Endpoint
// ---------------------------------------------------------
app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential, accessToken } = req.body;

    if (!credential && !accessToken) {
      return res.status(400).json({ error: 'Nenhum token Google informado.' });
    }

    let googleData: any = null;

    if (credential) {
      // Validate Google ID Token via Google's tokeninfo API
      const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
      const tokenRes = await fetch(tokenInfoUrl);
      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        console.error('Google token verification failed:', errText);
        return res.status(401).json({ error: 'Token de autenticação Google inválido ou expirado.' });
      }
      googleData = await tokenRes.json();
    } else if (accessToken) {
      // Validate Google Access Token via Google's userinfo API
      const userinfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!userinfoRes.ok) {
        return res.status(401).json({ error: 'Token de acesso Google inválido ou expirado.' });
      }
      googleData = await userinfoRes.json();
    }

    const email = (googleData.email || '').toLowerCase().trim();
    const isEmailVerified = googleData.email_verified === true || googleData.email_verified === 'true';
    const domain = email.split('@')[1];

    if (!isEmailVerified) {
      return res.status(403).json({ error: 'O e-mail da sua conta Google não foi verificado.' });
    }

    // Strict Domain & Admin Enforcement
    const isAllowed = domain === ALLOWED_DOMAIN || email === ADMIN_EMAIL;
    if (!isAllowed) {
      return res.status(403).json({
        error: `Acesso negado: A conta Google (${email}) não pertence ao domínio corporativo @${ALLOWED_DOMAIN}.`,
      });
    }

    const { role, roleTitle, department } = determineRole(email);

    const userProfile = {
      id: googleData.sub || `google-${Date.now()}`,
      name: googleData.name || email.split('@')[0],
      email: email,
      role: role,
      roleTitle: roleTitle,
      avatar: googleData.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      department: department,
    };

    res.json({ success: true, user: userProfile });
  } catch (error: any) {
    console.error('Auth verification error:', error);
    res.status(500).json({ error: 'Erro ao verificar credenciais com a Google.' });
  }
});

// ---------------------------------------------------------
// Persistent IT Tickets API
// ---------------------------------------------------------
app.get('/api/tickets', (_req, res) => {
  const tickets = loadTickets();
  res.json({ tickets });
});

app.post('/api/tickets', (req, res) => {
  try {
    const { requesterName, requesterEmail, category, subject, description, priority } = req.body;
    
    if (!requesterEmail || !subject || !description) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes para abrir chamado.' });
    }

    const tickets = loadTickets();
    const protocolNum = String(tickets.length + 94).padStart(3, '0');
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newTicket = {
      id: `tk-${Date.now()}`,
      protocol: `MOTA-TI-2026-${protocolNum}`,
      requesterName: requesterName || requesterEmail.split('@')[0],
      requesterEmail: requesterEmail.toLowerCase().trim(),
      category: category || 'Geral',
      subject: subject.trim(),
      description: description.trim(),
      priority: priority || 'Normal',
      status: 'Novo',
      createdAt: formattedDate,
      updatedAt: formattedDate,
      assignedTo: 'Carlos Eduardo Siqueira',
    };

    tickets.unshift(newTicket);
    saveTickets(tickets);

    res.status(201).json({ success: true, ticket: newTicket });
  } catch (error: any) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Erro ao registrar chamado de TI.' });
  }
});

app.patch('/api/tickets/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, solutionNotes, assignedTo, userEmail } = req.body;

    // Security Guard: Only ti@mota.adv.br can change ticket status
    if (userEmail && userEmail.toLowerCase() !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Apenas ti@mota.adv.br tem permissão para alterar o status do chamado.' });
    }

    const tickets = loadTickets();
    const index = tickets.findIndex((t: any) => t.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Chamado não encontrado.' });
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const currentTicket = tickets[index];
    tickets[index] = {
      ...currentTicket,
      ...(status ? { status } : {}),
      ...(solutionNotes !== undefined ? { solutionNotes } : {}),
      ...(assignedTo ? { assignedTo } : {}),
      updatedAt: formattedDate,
    };

    saveTickets(tickets);

    res.json({ success: true, ticket: tickets[index] });
  } catch (error: any) {
    console.error('Error updating ticket:', error);
    res.status(500).json({ error: 'Erro ao atualizar chamado.' });
  }
});

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint: AI Multi-turn Chat
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, modelChoice, thinking, systemPrompt } = req.body;
    
    // Choose model based on requirements
    let modelName = 'gemini-3.5-flash';
    if (modelChoice === 'pro' || thinking) {
      modelName = 'gemini-3.1-pro-preview';
    } else if (modelChoice === 'fast') {
      modelName = 'gemini-3.1-flash-lite';
    }

    const defaultSystem = `Você é o Assistente Jurídico e Operacional da banca Mota & Advogados Associados (OAB/DF 1413-A), fundada em 2000 em Brasília/DF. 
Sua especialidade abrange Ações Coletivas, Direito dos Servidores Públicos, Precatórios e atuação nos Tribunais Superiores (STF, STJ, TST e TRF1).
Você fornece respostas precisas, em português formal porém direto, com base nas rotinas da banca e nas jurisprudências vigentes.
Você também auxilia os membros da equipe no uso das ferramentas Google Workspace e MCP Servers corporativos da firma.`;

    const config: any = {
      systemInstruction: systemPrompt || defaultSystem,
    };

    if (thinking && modelName === 'gemini-3.1-pro-preview') {
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH,
      };
    }

    // Format contents for generateContent
    // Build array of contents
    const contents = (messages || []).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config,
    });

    res.json({
      text: response.text || 'Sem resposta disponível.',
      modelUsed: modelName,
    });
  } catch (error: any) {
    console.error('Gemini Chat error:', error);
    res.status(500).json({ error: error.message || 'Erro ao processar consulta com IA.' });
  }
});

// Endpoint: Smart Search with Natural Language Understanding & Re-ranking
app.post('/api/gemini/search', async (req, res) => {
  try {
    const { query, availableItems } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Termo de busca ausente.' });
    }

    const prompt = `Analise a seguinte consulta de busca de um advogado ou colaborador da banca Mota & Advogados Associados:
"${query}"

Abaixo está o índice de documentos e páginas da intranet corporativa (Google Drive, Docs, Sheets, Sites e POPs):
${JSON.stringify(availableItems, null, 2)}

Sua tarefa:
1. Identificar a intenção e os conceitos jurídicos/operacionais chave (ex: teses do STF, precatórios, rito de execução, suporte TI, certificado digital, modelos de petição).
2. Selecionar e ordenar os itens mais relevantes (máximo 8 itens).
3. Para cada item selecionado, fornecer:
   - "id": o identificador original do item
   - "relevanceScore": pontuação de 0 a 100
   - "highlight": um resumo ou trecho curto (1 a 2 frases) explicando por que este documento/item atende exatamente à busca.
4. Responder ESTRITAMENTE em formato JSON com a estrutura:
{
  "searchIntent": "explicação da intenção identificada",
  "keywords": ["termo1", "termo2"],
  "matchedItemIds": [
    { "id": "...", "relevanceScore": 95, "highlight": "..." }
  ],
  "aiSummary": "Uma síntese de 2 a 3 frases respondendo à dúvida ou indicando a ação recomendada."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    try {
      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch {
      res.json({
        searchIntent: query,
        keywords: [query],
        matchedItemIds: [],
        aiSummary: response.text || '',
      });
    }
  } catch (error: any) {
    console.error('Smart Search error:', error);
    res.status(500).json({ error: error.message || 'Erro ao processar busca inteligente.' });
  }
});

// Endpoint: Analyze Document Image / Scan (OCR & Legal Understanding)
app.post('/api/gemini/analyze-document', async (req, res) => {
  try {
    const { imageBase64, mimeType, prompt } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Imagem ou documento não enviado.' });
    }

    const customPrompt = prompt || `Analise este documento jurídico/operacional da banca Mota & Advogados Associados.
Extraia:
1. Tipo de documento (Despacho, Acórdão STF/STJ, Notificação Judicial, Certidão, Comprovante TI, Contrato).
2. Número do processo ou protocolo, tribunal/órgão e partes envolvidas.
3. Síntese do teor principal e conclusões.
4. Prazos identificados ou providências urgentes requeridas.
5. Palavras-chave e classificação sugerida para arquivamento no Google Drive.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType || 'image/jpeg',
              data: imageBase64.replace(/^data:[^;]+;base64,/, ''),
            },
          },
          { text: customPrompt },
        ],
      },
    });

    res.json({
      analysis: response.text || 'Não foi possível extrair a análise do documento.',
      modelUsed: 'gemini-3.1-pro-preview',
    });
  } catch (error: any) {
    console.error('Analyze Document error:', error);
    res.status(500).json({ error: error.message || 'Erro ao analisar imagem do documento.' });
  }
});

// Endpoint: Generate / Edit Visual Assets
app.post('/api/gemini/generate-image', async (req, res) => {
  try {
    const { prompt, aspectRatio, referenceImageBase64 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt ausente.' });
    }

    // If reference image provided, edit it
    if (referenceImageBase64) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: referenceImageBase64.replace(/^data:[^;]+;base64,/, ''),
              },
            },
            { text: prompt },
          ],
        },
      });

      let imageUrl = null;
      let textOutput = '';
      const candidate = response.candidates?.[0];
      if (candidate?.content?.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData?.data) {
            imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          } else if (part.text) {
            textOutput += part.text;
          }
        }
      }

      return res.json({ imageUrl, text: textOutput });
    }

    // Generate fresh image
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || '16:9',
          imageSize: '1K',
        },
      },
    });

    let imageUrl = null;
    let textOutput = '';
    const candidate = response.candidates?.[0];
    if (candidate?.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textOutput += part.text;
        }
      }
    }

    res.json({ imageUrl, text: textOutput });
  } catch (error: any) {
    console.error('Image Generation error:', error);
    res.status(500).json({ error: error.message || 'Erro ao gerar ou editar imagem.' });
  }
});

// Mount Vite or static dist
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Intranet Mota & Advogados server running on port ${PORT}`);
  });
}

startServer();
