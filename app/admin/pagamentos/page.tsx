import { verificarContaConectada } from "@/lib/mercadopago";

export const dynamic = "force-dynamic";

export default async function PagamentosPage() {
  let conta: Awaited<ReturnType<typeof verificarContaConectada>> | null = null;
  let erro: string | null = null;

  try {
    conta = await verificarContaConectada();
  } catch (e) {
    erro =
      "Não consegui confirmar a conta com o Mercado Pago. Confira se MERCADOPAGO_ACCESS_TOKEN " +
      "está preenchido corretamente nas variáveis de ambiente.";
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-lg font-bold mb-2">Conta que recebe os pagamentos</h1>
      <p className="text-sm text-ink-soft mb-6">
        Isto é uma checagem em tempo real, direto na API do Mercado Pago — não é uma configuração
        salva aqui no sistema. Confira se os dados abaixo batem com a SUA conta antes de publicar.
      </p>

      {erro && (
        <div className="card border-expense/40">
          <p className="text-sm text-expense">{erro}</p>
        </div>
      )}

      {conta && (
        <div className="card space-y-4">
          <div className="flex items-center gap-2 text-income text-sm font-semibold mb-2">
            <span>✅</span> Access Token válido e conectado
          </div>
          <div>
            <p className="text-xs text-ink-soft mb-1">Nome na conta</p>
            <p className="font-semibold">{conta.nome}</p>
          </div>
          <div>
            <p className="text-xs text-ink-soft mb-1">E-mail</p>
            <p className="font-semibold">{conta.email}</p>
          </div>
          <div>
            <p className="text-xs text-ink-soft mb-1">Documento cadastrado</p>
            <p className="font-semibold">{conta.documento}</p>
          </div>
          <div>
            <p className="text-xs text-ink-soft mb-1">Tipo de conta / país</p>
            <p className="font-semibold">
              {conta.tipoConta} · {conta.pais}
            </p>
          </div>
          <p className="text-xs text-ink-soft pt-2 border-t border-line">
            Se o nome, e-mail ou documento acima não forem seus, o Access Token configurado
            pertence à conta errada — troque o valor de{" "}
            <code className="text-gold">MERCADOPAGO_ACCESS_TOKEN</code> pelo gerado na SUA conta,
            em Suas integrações → sua aplicação → Credenciais.
          </p>
        </div>
      )}
    </div>
  );
}
