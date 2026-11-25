import { useState } from "react";
import type { LoginData } from "../../types/auth.types";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, UserRound, LogIn } from "lucide-react";
import useAuth from "../../hooks/useAuth";

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  async function handleLogin(data: LoginData) {
    try {
      setServerError("");
      await signIn(data);
      navigate("/app/servidores");
    } catch (error) {
      setServerError("Erro ao realizar login. Verifique os dados informados.");
      console.error("Erro handleLogin", error);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            RH Saúde
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Acessar o sistema
          </p>
        </div>

        <form onSubmit={handleSubmit(handleLogin)} className="space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
              E-mail
            </label>
            <div className="relative">
              <UserRound
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="Digite seu e-mail"
                aria-invalid={!!errors.email}
                className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                {...register("email", {
                  required: "O e-mail é obrigatório",
                })}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              Senha
            </label>
            <div className="relative">
              <LockKeyhole
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Digite sua senha"
                aria-invalid={!!errors.password}
                className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                {...register("password", {
                  required: "A senha é obrigatória",
                })}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.password.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-300"
          >
            <LogIn size={18} />
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Ambiente de demonstração
        </p>
      </div>
    </main>
  );
}
