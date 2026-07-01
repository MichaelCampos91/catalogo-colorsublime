"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-sonner-toast"
import { Settings, Loader2 } from "lucide-react"

type DestinationType = "confirmation" | "whatsapp" | "url"

type PostOrderSettings = {
  destination_type: DestinationType
  whatsapp_phone: string
  whatsapp_message: string
  redirect_url: string
}

const DEFAULTS: PostOrderSettings = {
  destination_type: "confirmation",
  whatsapp_phone: "",
  whatsapp_message: "",
  redirect_url: "",
}

export function PostOrderSettings() {
  const toast = useToast()
  const [settings, setSettings] = useState<PostOrderSettings>(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/settings")
        if (!res.ok) throw new Error(`Erro ${res.status}`)
        const data = await res.json()
        setSettings({
          destination_type: (data.destination_type as DestinationType) ?? "confirmation",
          whatsapp_phone: data.whatsapp_phone ?? "",
          whatsapp_message: data.whatsapp_message ?? "",
          redirect_url: data.redirect_url ?? "",
        })
      } catch (error) {
        console.error("Erro ao carregar configurações:", error)
        toast.error({
          title: "Erro ao carregar configurações",
          description: error instanceof Error ? error.message : "Erro desconhecido",
        })
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || err.message || `Erro ${res.status}`)
      }
      const updated = await res.json()
      setSettings({
        destination_type: updated.destination_type,
        whatsapp_phone: updated.whatsapp_phone ?? "",
        whatsapp_message: updated.whatsapp_message ?? "",
        redirect_url: updated.redirect_url ?? "",
      })
      toast.success({
        title: "Configurações salvas",
        description: "O destino após a confirmação do pedido foi atualizado.",
      })
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
      toast.error({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-600" />
          <CardTitle className="text-lg font-bold">Destino após confirmação do pedido</CardTitle>
        </div>
        <CardDescription>
          Escolha para onde o cliente será direcionado após confirmar o pedido no catálogo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            Carregando configurações...
          </div>
        ) : (
          <div className="space-y-5">
            <RadioGroup
              value={settings.destination_type}
              onValueChange={(v) =>
                setSettings((prev) => ({ ...prev, destination_type: v as DestinationType }))
              }
              className="gap-3"
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <RadioGroupItem value="confirmation" id="dest-confirmation" className="mt-1" />
                <div>
                  <span className="text-sm font-medium">Página de confirmação (padrão)</span>
                  <p className="text-xs text-gray-500">
                    O cliente vê uma página com o resumo do pedido (/confirmed).
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <RadioGroupItem value="whatsapp" id="dest-whatsapp" className="mt-1" />
                <div>
                  <span className="text-sm font-medium">WhatsApp</span>
                  <p className="text-xs text-gray-500">
                    Abre uma conversa no WhatsApp com a mensagem do pedido preenchida.
                  </p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <RadioGroupItem value="url" id="dest-url" className="mt-1" />
                <div>
                  <span className="text-sm font-medium">URL personalizada</span>
                  <p className="text-xs text-gray-500">
                    Redireciona o cliente para qualquer URL informada.
                  </p>
                </div>
              </label>
            </RadioGroup>

            {settings.destination_type === "whatsapp" && (
              <div className="space-y-4 rounded-lg border p-4 bg-gray-50">
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-phone">Número do WhatsApp (com DDI e DDD)</Label>
                  <Input
                    id="whatsapp-phone"
                    inputMode="numeric"
                    placeholder="5518998048419"
                    value={settings.whatsapp_phone}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, whatsapp_phone: e.target.value.replace(/\D/g, "") }))
                    }
                  />
                  <p className="text-xs text-gray-500">Apenas números. Ex.: 5518998048419</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-message">Mensagem</Label>
                  <Textarea
                    id="whatsapp-message"
                    rows={5}
                    value={settings.whatsapp_message}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, whatsapp_message: e.target.value }))
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Placeholders disponíveis:{" "}
                    <code className="px-1 bg-gray-200 rounded">{"{nome}"}</code>{" "}
                    <code className="px-1 bg-gray-200 rounded">{"{pedido}"}</code>{" "}
                    <code className="px-1 bg-gray-200 rounded">{"{itens}"}</code>
                  </p>
                </div>
              </div>
            )}

            {settings.destination_type === "url" && (
              <div className="space-y-2 rounded-lg border p-4 bg-gray-50">
                <Label htmlFor="redirect-url">URL de destino</Label>
                <Input
                  id="redirect-url"
                  type="url"
                  placeholder="https://exemplo.com/obrigado"
                  value={settings.redirect_url}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, redirect_url: e.target.value }))
                  }
                />
                <p className="text-xs text-gray-500">Use uma URL completa começando com http:// ou https://</p>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar configuração"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
