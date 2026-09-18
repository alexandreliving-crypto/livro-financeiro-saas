import { MercadoPagoConfig, PreApproval, User } from "mercadopago";

export function getMercadoPagoClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  });
}

// Consulta a própria API do Mercado Pago para confirmar a quem pertence o
// Access Token configurado — é essa conta que recebe o dinheiro das
// assinaturas. Use isso para conferir a ligação antes de publicar.
export async function verificarContaConectada() {
  const client = getMercadoPagoClient();
  const user = new User(client);
  const perfil = await user.get();

  return {
    nome: [perfil.first_name, perfil.last_name].filter(Boolean).join(" ") || perfil.nickname || "—",
    email: perfil.email ?? "—",
    documento: perfil.identification
      ? `${perfil.identification.type} ${perfil.identification.number}`
      : "—",
    tipoConta: perfil.user_type ?? "—",
    pais: perfil.site_id ?? "—",
  };
}

type CriarAssinaturaInput = {
  planoNome: string;
  precoCentavos: number;
  intervalo: "mensal" | "anual";
  emailCliente: string;
  familiaId: string;
  planoId: string;
  urlRetorno: string;
};

// Cria a assinatura no Mercado Pago e devolve o link (init_point) para onde o
// cliente deve ser redirecionado. Lá ele autoriza o cartão numa página segura
// do próprio Mercado Pago — nosso sistema nunca vê o número do cartão.
export async function criarAssinaturaMercadoPago({
  planoNome,
  precoCentavos,
  intervalo,
  emailCliente,
  familiaId,
  planoId,
  urlRetorno,
}: CriarAssinaturaInput) {
  const client = getMercadoPagoClient();
  const preApproval = new PreApproval(client);

  const resposta = await preApproval.create({
    body: {
      reason: `Assinatura ${planoNome}`,
      payer_email: emailCliente,
      back_url: urlRetorno,
      // familia_id + plano_id viajam junto para o webhook saber a quem
      // pertence essa assinatura quando a notificação chegar.
      external_reference: JSON.stringify({ familiaId, planoId }),
      auto_recurring: {
        frequency: intervalo === "mensal" ? 1 : 12,
        frequency_type: "months",
        transaction_amount: precoCentavos / 100,
        currency_id: "BRL",
      },
    },
  });

  return resposta; // resposta.init_point é o link do checkout
}
