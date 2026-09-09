import Anthropic from "@anthropic-ai/sdk";
import { submitLead, type LeadInput } from "./webhooks";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOKENS = 1024;

// Limite de idas y vueltas con tool use dentro de un mismo turno, para
// evitar un loop infinito si el modelo insiste en llamar a la tool.
const MAX_TOOL_ITERATIONS = 4;

const COLLECT_LEAD_TOOL: Anthropic.Tool = {
  name: "collect_lead",
  description:
    "Registra los datos de contacto de un lead que quiere ser contactado por la agencia sobre programas de Work and Travel.",
  input_schema: {
    type: "object",
    properties: {
      nombre: { type: "string", description: "Nombre de pila del lead." },
      apellido: { type: "string", description: "Apellido del lead." },
      telefono: {
        type: "string",
        description: "Telefono de contacto del lead.",
      },
      email: {
        type: "string",
        description: "Email de contacto del lead, opcional.",
      },
      mensaje: {
        type: "string",
        description:
          "Mensaje o comentario adicional que el lead haya compartido, opcional.",
      },
    },
    required: ["nombre", "apellido", "telefono"],
  },
};

let client: Anthropic | null = null;

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Falta la variable de entorno ANTHROPIC_API_KEY");
  }
  if (!client) {
    client = new Anthropic({ apiKey });
  }
  return client;
}

export interface ChatModelResponse {
  answer: string;
  grounded: boolean;
  sources: string[];
}

const FALLBACK_RESPONSE: ChatModelResponse = {
  answer:
    "No pude procesar la respuesta correctamente. Te recomiendo consultar directamente a la embajada de Estados Unidos o al Departamento de Estado (travel.state.gov).",
  grounded: false,
  sources: [],
};

function parseModelResponse(rawText: string): ChatModelResponse {
  try {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);

    return {
      answer: typeof parsed.answer === "string" ? parsed.answer : "",
      grounded: Boolean(parsed.grounded),
      sources: Array.isArray(parsed.sources) ? parsed.sources : [],
    };
  } catch {
    return FALLBACK_RESPONSE;
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

const REQUIRED_LEAD_FIELDS = ["nombre", "apellido", "telefono"] as const;

/**
 * El schema de la tool no obliga al modelo a respetar "required" al pie de
 * la letra, y Haiku a veces llama a collect_lead antes de tener los tres
 * datos. Validamos aca para no mandar leads incompletos o inventados al
 * webhook real de n8n: si falta algo, se lo devolvemos a Claude como error
 * de la tool para que siga pidiendo lo que falta.
 */
function validateLeadInput(
  input: unknown
): { valid: true; lead: LeadInput } | { valid: false; missing: string[] } {
  const record = (input && typeof input === "object" ? input : {}) as Record<
    string,
    unknown
  >;

  const missing = REQUIRED_LEAD_FIELDS.filter(
    (field) => !isNonEmptyString(record[field])
  );
  if (missing.length > 0) {
    return { valid: false, missing };
  }

  const lead: LeadInput = {
    nombre: record.nombre as string,
    apellido: record.apellido as string,
    telefono: record.telefono as string,
  };
  if (isNonEmptyString(record.email)) lead.email = record.email;
  if (isNonEmptyString(record.mensaje)) lead.mensaje = record.mensaje;

  return { valid: true, lead };
}

async function runToolUse(
  toolUse: Anthropic.ToolUseBlock
): Promise<Anthropic.ToolResultBlockParam> {
  if (toolUse.name !== "collect_lead") {
    return {
      type: "tool_result",
      tool_use_id: toolUse.id,
      content: `Tool desconocida: ${toolUse.name}`,
      is_error: true,
    };
  }

  const validation = validateLeadInput(toolUse.input);
  if (!validation.valid) {
    return {
      type: "tool_result",
      tool_use_id: toolUse.id,
      content: `Faltan datos obligatorios (${validation.missing.join(
        ", "
      )}). Pedile esos datos al usuario antes de volver a llamar a la tool.`,
      is_error: true,
    };
  }

  const result = await submitLead(validation.lead);

  return {
    type: "tool_result",
    tool_use_id: toolUse.id,
    content: JSON.stringify(result),
    is_error: !result.ok,
  };
}

export async function askClaude(
  systemPrompt: string,
  messages: Anthropic.MessageParam[]
): Promise<ChatModelResponse> {
  const anthropic = getClient();
  const conversation: Anthropic.MessageParam[] = [...messages];

  for (let iteration = 0; iteration < MAX_TOOL_ITERATIONS; iteration++) {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: systemPrompt,
      tools: [COLLECT_LEAD_TOOL],
      messages: conversation,
    });

    const toolUseBlocks = response.content.filter(
      (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
    );

    if (response.stop_reason !== "tool_use" || toolUseBlocks.length === 0) {
      const textBlock = response.content.find(
        (block) => block.type === "text"
      );
      const rawText =
        textBlock && textBlock.type === "text" ? textBlock.text : "";
      return parseModelResponse(rawText);
    }

    conversation.push({ role: "assistant", content: response.content });

    const toolResults = await Promise.all(toolUseBlocks.map(runToolUse));
    conversation.push({ role: "user", content: toolResults });
  }

  return FALLBACK_RESPONSE;
}
