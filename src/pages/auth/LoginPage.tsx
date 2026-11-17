
import { useState, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, UserRound, LogIn } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');

  function handleLogin(event: SyntheticEvent<HTMLFormElement, SubmitEvent>) {
    event.preventDefault();

    // login de mock.
    navigate('/app/servidores');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            RH Saúde
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Entre para acessar o sistema
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="usuario"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Usuário
            </label>

            <div className="relative">
              <UserRound
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Digite seu usuário"
                required
                className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="senha"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Senha
            </label>

            <div className="relative">
              <LockKeyhole
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                required
                className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 font-medium text-white transition-colors hover:bg-teal-700"
          >
            <LogIn size={18} />
            Entrar
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Ambiente de demonstração
        </p>
      </div>
    </main>
  );
}
