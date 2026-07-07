import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `Você é um leitor especializado em cartas do eFootball/eFHUB/eFootBase.
Extraia os dados visíveis da imagem com o máximo de precisão e devolva somente JSON válido.
Nunca invente números. Se não tiver certeza, use null ou array vazio.
Converta posições para códigos ingleses do jogo: CF, SS, LWF, RWF, LMF, RMF, AMF, CMF, DMF, CB, LB, RB, GK.
Não use números de atributos/modelo corporal como pontos de treino.
Pontos de treino devem vir do campo Nível máximo: pontos = (nível - 1) * 2 quando o nível estiver claro.
Habilidades devem ser nomes em PT-BR quando aparecerem na imagem.`;

const USER_PROMPT = `Leia a imagem e retorne este JSON:
{
  "playerName": string|null,
  "overall": number|null,
  "mainPosition": "CF"|"SS"|"LWF"|"RWF"|"LMF"|"RMF"|"AMF"|"CMF"|"DMF"|"CB"|"LB"|"RB"|"GK"|null,
  "playstyle": string|null,
  "height": number|null,
  "weight": number|null,
  "age": number|null,
  "level": number|null,
  "trainingPointsTotal": number|null,
  "boosters": [{"name": string, "value": number|null}],
  "positionRatings": {"CF"?:number,"SS"?:number,"LWF"?:number,"RWF"?:number,"LMF"?:number,"RMF"?:number,"AMF"?:number,"CMF"?:number,"DMF"?:number,"CB"?:number,"LB"?:number,"RB"?:number,"GK"?:number},
  "attributes": {
    "offensiveAwareness"?:number,"ballControl"?:number,"dribbling"?:number,"tightPossession"?:number,"lowPass"?:number,"loftedPass"?:number,"finishing"?:number,"heading"?:number,"placeKicking"?:number,"curl"?:number,"defensiveAwareness"?:number,"defensiveEngagement"?:number,"tackling"?:number,"aggression"?:number,"goalkeeperAwareness"?:number,"goalkeeperCatching"?:number,"goalkeeperParrying"?:number,"goalkeeperReflexes"?:number,"goalkeeperReach"?:number,"speed"?:number,"acceleration"?:number,"kickingPower"?:number,"jump"?:number,"physicalContact"?:number,"balance"?:number,"stamina"?:number
  },
  "nativeSkills": string[],
  "rawImportantText": string[]
}`;

function readOutputText(payload: any): string {
  if (typeof payload?.output_text === 'string') return payload.output_text;
  const chunks: string[] = [];
  for (const item of payload?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (typeof content?.text === 'string') chunks.push(content.text);
    }
  }
  return chunks.join('\n');
}

function extractJson(text: string) {
  const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
  try { return JSON.parse(cleaned); } catch {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Resposta da IA não trouxe JSON.');
  return JSON.parse(match[0]);
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: 'OPENAI_API_KEY não configurada. Usando OCR local.' }, { status: 501 });
    }

    const body = await request.json();
    const imageDataUrl = String(body?.imageDataUrl ?? '');
    if (!imageDataUrl.startsWith('data:image/')) {
      return NextResponse.json({ ok: false, error: 'Imagem inválida.' }, { status: 400 });
    }

    const model = process.env.OPENAI_VISION_MODEL || 'gpt-4.1-mini';
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        instructions: SYSTEM_PROMPT,
        input: [
          {
            role: 'user',
            content: [
              { type: 'input_text', text: USER_PROMPT },
              { type: 'input_image', image_url: imageDataUrl, detail: 'high' }
            ]
          }
        ]
      })
    });

    const payload = await response.json();
    if (!response.ok) {
      return NextResponse.json({ ok: false, error: payload?.error?.message ?? 'Falha na leitura Vision AI.' }, { status: response.status });
    }

    const outputText = readOutputText(payload);
    const parsed = extractJson(outputText);
    return NextResponse.json({ ok: true, card: parsed });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Erro inesperado.' }, { status: 500 });
  }
}
