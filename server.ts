import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '20mb' }));

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
