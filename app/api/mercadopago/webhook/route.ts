import { createServiceRoleClient } from "@/lib/supabase/server";
import { getMercadoPagoClient } from "@/lib/mercadopago";
import { PreApproval, WebhookSignatureValidator, InvalidWebhookSignatureError } from "mercadopago";
import { NextResponse, type NextRequest } from "next/server";

function mapearStatus(statusMp?: string): string {
  switch (statusMp) {
    case "authorized":
      return "ativa";
    case "paused":
      return "atrasada";
    case "cancelled":
      return "cancelada";
    default:
      return "trial";
  }
}

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id");
  const tipo = url.searchParams.get("type");

  try {
    WebhookSignatureValidator.validate({
      xSignature: request.headers.get("x-signature"),
      xRequestId: request.headers.get("x-request-id"),
      dataId,
      secret: process.env.MERCADOPAGO_WEBHOOK_SECRET!,
      toleranceSeconds: 300,
    });
  } catch (err) {
    if (err instanceof InvalidWebhookSignatureError) {
      console.error("Assinatura de webhook inválida:", err.reason);
      return NextResponse.json({ erro: "assinatura inválida" }, { status: 401 });
    }
    throw err;
  }

  // Só nos interessa notificação de assinatura (preapproval).
  if (tipo !== "subscription_preapproval" || !dataId) {
    return NextResponse.json({ ok: true });
  }

  const client = getMercadoPagoClient();
  const preApproval = new PreApproval(client);
  const assinaturaMp = await preApproval.get({ id: dataId });

  let referencia: { familiaId?: string; planoId?: string } = {};
  try {
    referencia = JSON.parse(assinaturaMp.external_reference || "{}");
  } catch {
    // referência ausente ou malformada — segue sem ela, atualiza pelo id
  }

  const service = createServiceRoleClient();
  await service
    .from("assinaturas")
    .update({
      status: mapearStatus(assinaturaMp.status),
      periodo_atual_fim: assinaturaMp.next_payment_date ?? null,
    })
    .eq("referencia_externa", dataId);

  return NextResponse.json({ ok: true });
}
