import { cadastrar } from "./actions";

export default async function CadastroPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string }>;
}) {
  const { erro } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="card w-full max-w-sm">
        <h1 className="text-xl font-bold mb-6">Criar sua conta</h1>
        {erro && (
          <p className="text-sm text-expense mb-4 bg-expense/10 border border-expense/30 rounded-lg px-3 py-2">
            {erro}
          </p>
        )}
        <form action={cadastrar} className="space-y-4">
          <div>
            <label className="block text-xs text-ink-soft mb-1.5">Seu nome</label>
            <input name="nome" type="text" required className="input-field" />
          </div>
          <div>
            <label className="block text-xs text-ink-soft mb-1.5">
              Nome da família (aparece no painel)
            </label>
            <input name="nomeFamilia" type="text" placeholder="Ex.: Família Silva" className="input-field" />
          </div>
          <div>
            <label className="block text-xs text-ink-soft mb-1.5">E-mail</label>
            <input name="email" type="email" required className="input-field" />
          </div>
          <div>
            <label className="block text-xs text-ink-soft mb-1.5">Senha (mín. 8 caracteres)</label>
            <input name="senha" type="password" required minLength={8} className="input-field" />
          </div>
          <button type="submit" className="btn-primary w-full mt-2">
            Criar conta
          </button>
        </form>
        <p className="text-xs text-ink-soft mt-5 text-center">
          Já tem conta?{" "}
          <a href="/login" className="text-gold hover:underline">
            Entrar
          </a>
        </p>
      </div>
    </main>
  );
}
