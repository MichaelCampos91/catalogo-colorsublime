import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  getPostOrderSettings,
  updatePostOrderSettings,
  DEFAULT_POST_ORDER_SETTINGS,
  type PostOrderDestinationType,
  type PostOrderSettings,
} from "@/lib/database"
import { requireAuth, authErrorResponse } from "@/lib/auth"

const VALID_TYPES: PostOrderDestinationType[] = ["confirmation", "whatsapp", "url"]

// GET público: /catalog (não autenticado) precisa ler o destino no momento da confirmação.
export async function GET() {
  try {
    const settings = await getPostOrderSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error("API: Erro ao buscar configurações:", error)
    // Fallback seguro para não quebrar o fluxo público
    return NextResponse.json(DEFAULT_POST_ORDER_SETTINGS)
  }
}

// PUT autenticado (admin): atualiza o destino pós-pedido.
export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const cookieToken = cookieStore.get("auth_token")?.value
    await requireAuth(request, cookieToken)
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Token não fornecido"
    return authErrorResponse(msg, 401)
  }

  try {
    const body = await request.json().catch(() => ({}))
    const rawType = (body as Record<string, unknown>).destination_type

    if (typeof rawType !== "string" || !VALID_TYPES.includes(rawType as PostOrderDestinationType)) {
      return NextResponse.json(
        { error: "destination_type inválido. Use confirmation, whatsapp ou url." },
        { status: 400 },
      )
    }
    const destination_type = rawType as PostOrderDestinationType

    const whatsapp_phone = String((body as Record<string, unknown>).whatsapp_phone ?? "").replace(/\D/g, "")
    const whatsapp_message = String((body as Record<string, unknown>).whatsapp_message ?? "")
    const redirect_url = String((body as Record<string, unknown>).redirect_url ?? "").trim()

    // Validações mínimas por modo (sem bloquear demais)
    if (destination_type === "whatsapp" && !whatsapp_phone) {
      return NextResponse.json({ error: "Informe o número do WhatsApp." }, { status: 400 })
    }
    if (destination_type === "url") {
      if (!redirect_url) {
        return NextResponse.json({ error: "Informe a URL de destino." }, { status: 400 })
      }
      try {
        // Aceita apenas http(s)
        const parsed = new URL(redirect_url)
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          throw new Error("Protocolo inválido")
        }
      } catch {
        return NextResponse.json({ error: "URL de destino inválida. Use http(s)://..." }, { status: 400 })
      }
    }

    const settings: PostOrderSettings = {
      destination_type,
      whatsapp_phone,
      whatsapp_message,
      redirect_url,
    }
    const updated = await updatePostOrderSettings(settings)
    return NextResponse.json(updated)
  } catch (error) {
    console.error("API: Erro ao salvar configurações:", error)
    return NextResponse.json(
      {
        error: "Erro ao salvar configurações",
        message: error instanceof Error ? error.message : "Erro desconhecido",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
