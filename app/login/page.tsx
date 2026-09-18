import { entrar } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; redirect?: string }>;
}) {
  const { erro, redirect } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="card w-full max-w-sm">
        <h1 className="text-xl font-bold mb-6">Entrar</h1>
        {erro && (
          <p className="text-sm text-expense mb-4 bg-expense/10 border border-expense/30 rounded-lg px-3 py-2">
            {erro}
          </p>
        )}
        <form action={entrar} className="space-y-4">
          <input type="hidden" name="redirect" value={redirect || "/painel/dashboard"} />
          <div>
            <label className="block text-xs text-ink-soft mb-1.5">E-mail</label>
            <input name="email" type="email" required className="input-field" />
          </div>
          <div>
            <label className="block text-xs text-ink-soft mb-1.5">Senha</label>
            <input name="senha" type="password" required className="input-field" />
          </div>
          <button type="submit" className="btn-primary w-full mt-2">
            Entrar
          </button>
        </form>
        <p className="text-xs text-ink-soft mt-5 text-center">
          Ainda não é cliente?{" "}
          <a href="/" className="text-gold hover:underline">
            Ver planos
          </a>
        </p>
      </div>
    </main>
  );
}
