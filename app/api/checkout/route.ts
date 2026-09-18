import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { criarAssinaturaMercadoPago } from "@/lib/mercadopago";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const planoId = String(formData.get("planoId") || "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL(`/cadastro`, request.url));
  }

  // Busca o plano (dado público) e o perfil do usuário logado.
  const [{ data: plano }, { data: perfil }] = await Promise.all([
    supabase.from("planos").select("*").eq("id", planoId).single(),
    supabase.from("perfis").select("familia_id").eq("id", user.id).single(),
  ]);

  if (!plano || !perfil) {
    return NextResponse.redirect(new URL("/?erro=plano-invalido", request.url));
  }

  const assinatura = await criarAssinaturaMercadoPago({
    planoNome: plano.nome,
    precoCentavos: plano.preco_centavos,
    intervalo: plano.intervalo,
    emailCliente: user.email!,
    familiaId: perfil.familia_id,
    planoId: plano.id,
    urlRetorno: `${process.env.NEXT_PUBLIC_SITE_URL}/painel/assinatura`,
  });

  // Registra a assinatura como pendente — o webhook confirma quando o
  // cliente autorizar o pagamento do lado do Mercado Pago.
  const service = createServiceRoleClient();
  await service.from("assinaturas").insert({
    familia_id: perfil.familia_id,
    plano_id: plano.id,
    status: "trial",
    processador: "mercadopago",
    referencia_externa: assinatura.id,
  });

  return NextResponse.redirect(assinatura.init_point!);
}
