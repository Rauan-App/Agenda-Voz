const express = require('express');
const cors    = require('cors');
const fetch   = require('node-fetch');

const app  = express();
const PORT = process.env.PORT || 3000;

// Sua chave fica APENAS no servidor, nunca exposta ao usuário
const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY;

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static('public'));

// ── Rota de saúde (Render usa para verificar se está online)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ── Rota principal: proxy para Anthropic
app.post('/api/interpretar', async (req, res) => {
  if (!ANTHROPIC_KEY) {
    return res.status(500).json({ error: 'Chave da API não configurada no servidor.' });
  }

  const { texto } = req.body;
  if (!texto || texto.trim().length < 2) {
    return res.status(400).json({ error: 'Texto vazio.' });
  }

  // Monta contexto de datas
  const hoje = new Date();
  const fmt  = d => d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  const todS = fmt(hoje);
  const tomS = fmt(new Date(hoje.getTime() + 86400000));
  const diasSemana = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
  const nxt = diasSemana.map((n,i) => {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() + ((i - hoje.getDay() + 7) % 7 || 7));
    return n + '=' + fmt(d);
  }).join(', ');

  const prompt = `Assistente de agenda em português brasileiro.
Hoje: ${diasSemana[hoje.getDay()]}, ${todS}. Amanhã: ${tomS}.
Próximos dias: ${nxt}.
Usuário disse: "${texto}"
Responda SOMENTE JSON sem markdown:
{"title":"título curto (máx 60 chars)","date":"YYYY-MM-DD","time":"HH:MM","loc":null,"priority":"alta|media|baixa","transcript":"o que entendeu","alarm":true}
Regras: hoje=${todS}, amanhã=${tomS}, dias sem data=próxima ocorrência, sem horário use "09:00".
alarm=true se mencionar "lembrar","alarme","aviso","não esquecer", senão false.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [{ role: 'user', content: [{ type: 'text', text: prompt }] }]
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Erro na API: ' + response.status);
    }

    const data = await response.json();
    const raw  = data.content.map(c => c.text || '').join('').replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(raw);
    res.json(parsed);

  } catch (e) {
    console.error('Erro:', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Agenda por Voz backend rodando na porta ${PORT}`);
});
