"use client";

import { useActionState } from "react";

import { signIn, type SignInState } from "@/app/login/actions";

const initialState: SignInState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="marketing-login-form">
      <label htmlFor="email">
        E-mail
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </label>
      <label htmlFor="password">
        Senha
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      {state.error ? (
        <p role="alert" className="marketing-login-error">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="marketing-login-submit">
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
