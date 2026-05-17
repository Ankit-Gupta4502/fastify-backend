import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Flower2, MoveRight, Sparkles } from "lucide-react";
import {
  APP_NAME,
  DEFAULT_BACKEND_URL,
  DEFAULT_FRONTEND_URL,
  PUBLIC_USER_ROLE_VALUES,
  USER_ROLES,
  type LoginBody,
  type RegisterBody,
} from "@yoga-app/shared";

import {
  loginFormOptions,
  registerFormOptions,
} from "../features/auth/auth.form-options";
import { sessionQueryOptions } from "../features/auth/auth.query-options";
import {
  useLoginMutation,
  useRegisterMutation,
} from "../features/auth/use-auth-mutations";
import { useAuthStore } from "../features/auth/auth.store";
import { getGoogleSignInUrl } from "../features/auth/auth.api";
import { healthQueryOptions } from "../features/system/system.query-options";
import { API_BASE_URL, ApiRequestError } from "../lib/http";
import { Hero } from "@/components/Home/Hero";


export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [mode, setMode] = useState<"register" | "login">("register");
  const [feedback, setFeedback] = useState<string | null>(null);
  const healthQuery = useQuery({
    ...healthQueryOptions(),
    retry: false,
  });
  const sessionQuery = useQuery({
    ...sessionQueryOptions(),
    retry: false,
  });
  const registerMutation = useRegisterMutation();
  const loginMutation = useLoginMutation();
  const registerForm = useForm<RegisterBody>(registerFormOptions);
  const loginForm = useForm<LoginBody>(loginFormOptions);
  const isSubmitting = registerMutation.isPending || loginMutation.isPending;
  const authUser = useAuthStore((state) => state.authUser);
  const authRole = useAuthStore((state) => state.authRole);
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const clearAuthUser = useAuthStore((state) => state.clearAuthUser);

  useEffect(() => {
    const sessionUser = sessionQuery.data?.data?.user;

    if (sessionUser?.name && sessionUser.role) {
      setAuthUser({
        authUser: sessionUser.name,
        authRole: sessionUser.role,
      });
      return;
    }

    if ((sessionQuery.isSuccess && !sessionUser) || sessionQuery.isError) {
      clearAuthUser();
    }
  }, [
    clearAuthUser,
    sessionQuery.data,
    sessionQuery.isError,
    sessionQuery.isSuccess,
    setAuthUser,
  ]);

  async function handleRegisterSubmit(values: RegisterBody) {
    setFeedback(null);
    try {
      const response = await registerMutation.mutateAsync(values);
      setFeedback(response.message);
      registerForm.reset(registerFormOptions.defaultValues);
    } catch (error) {
      setFeedback(
        error instanceof ApiRequestError || error instanceof Error
          ? error.message
          : "Registration failed",
      );
    }
  }

  async function handleLoginSubmit(values: LoginBody) {
    setFeedback(null);
    try {
      const response = await loginMutation.mutateAsync(values);
      setFeedback(response.message);
    } catch (error) {
      setFeedback(
        error instanceof ApiRequestError || error instanceof Error
          ? error.message
          : "Login failed",
      );
    }
  }

  function handleGoogleSignIn() {
    setFeedback(null);
    const callbackURL =
      typeof window !== "undefined"
        ? window.location.origin
        : DEFAULT_FRONTEND_URL;
    window.location.assign(getGoogleSignInUrl(callbackURL));
  }

  return (
    <>
  <Hero/>    
    <main className="yoga-shell">
    <section className="hero-panel">
      <div className="hero-copy">
        <p className="eyebrow">TanStack Start + Fastify + shared schemas</p>
        <h1>Build the studio, not two disconnected apps.</h1>
        <p className="hero-text">
          {APP_NAME} now lives in a Turborepo workspace where auth schemas,
          response types, and product constants are shared between the
          Fastify backend and the frontend.
        </p>

        <div className="hero-grid">
          <article className="info-card">
            <Sparkles size={18} />
            <div>
              <h2>Shared validation</h2>
              <p>
                Client forms and backend auth routes use the same Zod
                contract.
              </p>
            </div>
          </article>
          <article className="info-card">
            <Flower2 size={18} />
            <div>
              <h2>Monorepo ready</h2>
              <p>
                `pnpm`, Turborepo, and workspace packages now drive builds
                and dev.
              </p>
            </div>
          </article>
          <article className="info-card">
            <CalendarDays size={18} />
            <div>
              <h2>Frontend starter</h2>
              <p>
                TanStack Start is scaffolded for yoga flows, booking UX, and
                dashboards.
              </p>
            </div>
          </article>
        </div>
      </div>

      <aside className="status-card">
        <p className="status-label">Workspace wiring</p>
        <dl>
          <div>
            <dt>Frontend</dt>
            <dd>{DEFAULT_FRONTEND_URL}</dd>
          </div>
          <div>
            <dt>Backend</dt>
            <dd>{API_BASE_URL || DEFAULT_BACKEND_URL}</dd>
          </div>
          <div>
            <dt>Health</dt>
            <dd>
              {healthQuery.data
                ? `Online at ${healthQuery.data.timestamp}`
                : "Backend not reachable yet"}
            </dd>
          </div>
          <div>
            <dt>Session</dt>
            <dd>
              {authUser && authRole
                ? `${authUser} (${authRole})`
                : "No active session"}
            </dd>
          </div>
        </dl>
      </aside>
    </section>
    <section className="workspace-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Starter app</p>
          <h2>Auth surface shared with the API</h2>
        </div>
        <div className="toggle-row">
          <button
            className={mode === "register" ? "toggle active" : "toggle"}
            onClick={() => setMode("register")}
            type="button"
          >
            Register
          </button>
          <button
            className={mode === "login" ? "toggle active" : "toggle"}
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>
        </div>
      </div>

      <div className="workspace-grid">
        <div className="auth-card">
          {mode === "register" ? (
            <form
              className="auth-form"
              onSubmit={registerForm.handleSubmit(handleRegisterSubmit)}
            >
              <label>
                <span>Name</span>
                <input
                  placeholder="Aarav Mehta"
                  {...registerForm.register("name")}
                />
                {registerForm.formState.errors.name ? (
                  <small>
                    {registerForm.formState.errors.name.message}
                  </small>
                ) : null}
              </label>

              <label>
                <span>Email</span>
                <input
                  placeholder="student@yoga.app"
                  type="email"
                  {...registerForm.register("email")}
                />
                {registerForm.formState.errors.email ? (
                  <small>
                    {registerForm.formState.errors.email.message}
                  </small>
                ) : null}
              </label>

              <label>
                <span>Password</span>
                <input
                  placeholder="Minimum 8 characters"
                  type="password"
                  {...registerForm.register("password")}
                />
                {registerForm.formState.errors.password ? (
                  <small>
                    {registerForm.formState.errors.password.message}
                  </small>
                ) : null}
              </label>

              <fieldset className="role-group">
                <legend>Join as</legend>
                <div className="role-options">
                  {PUBLIC_USER_ROLE_VALUES.map((role) => (
                    <label className="role-option" key={role}>
                      <input
                        type="radio"
                        value={role}
                        {...registerForm.register("role")}
                      />
                      <span>
                        {role === USER_ROLES.INSTRUCTOR
                          ? "Yoga instructor"
                          : "Normal user"}
                      </span>
                    </label>
                  ))}
                </div>
                {registerForm.formState.errors.role ? (
                  <small>
                    {registerForm.formState.errors.role.message}
                  </small>
                ) : null}
              </fieldset>

              <button
                className="submit-button"
                disabled={isSubmitting}
                type="submit"
              >
                Create account <MoveRight size={16} />
              </button>

              <div
                className="auth-divider"
                role="separator"
                aria-label="Alternative sign in methods"
              >
                <span>or</span>
              </div>

              <button
                className="google-button"
                disabled={isSubmitting}
                onClick={handleGoogleSignIn}
                type="button"
              >
                Sign in with Google
              </button>
            </form>
          ) : (
            <form
              className="auth-form"
              onSubmit={loginForm.handleSubmit(handleLoginSubmit)}
            >
              <label>
                <span>Email</span>
                <input
                  placeholder="student@yoga.app"
                  type="email"
                  {...loginForm.register("email")}
                />
                {loginForm.formState.errors.email ? (
                  <small>{loginForm.formState.errors.email.message}</small>
                ) : null}
              </label>

              <label>
                <span>Password</span>
                <input
                  placeholder="Your password"
                  type="password"
                  {...loginForm.register("password")}
                />
                {loginForm.formState.errors.password ? (
                  <small>
                    {loginForm.formState.errors.password.message}
                  </small>
                ) : null}
              </label>

              <label className="checkbox-row">
                <input
                  type="checkbox"
                  {...loginForm.register("rememberMe")}
                />
                <span>Keep me signed in on this device</span>
              </label>

              <fieldset className="role-group">
                <legend>Sign in as</legend>
                <div className="role-options">
                  {PUBLIC_USER_ROLE_VALUES.map((role) => (
                    <label className="role-option" key={role}>
                      <input
                        type="radio"
                        value={role}
                        {...loginForm.register("role")}
                      />
                      <span>
                        {role === USER_ROLES.INSTRUCTOR
                          ? "Yoga instructor"
                          : "Normal user"}
                      </span>
                    </label>
                  ))}
                </div>
                {loginForm.formState.errors.role ? (
                  <small>{loginForm.formState.errors.role.message}</small>
                ) : null}
              </fieldset>

              <button
                className="submit-button"
                disabled={isSubmitting}
                type="submit"
              >
                Sign in <MoveRight size={16} />
              </button>

              <div
                className="auth-divider"
                role="separator"
                aria-label="Alternative sign in methods"
              >
                <span>or</span>
              </div>

              <button
                className="google-button"
                disabled={isSubmitting}
                onClick={handleGoogleSignIn}
                type="button"
              >
                Sign in with Google
              </button>
            </form>
          )}

          {feedback ? <p className="feedback">{feedback}</p> : null}
        </div>

        <div className="notes-card">
          <h3>What is shared now</h3>
          <ul>
            <li>
              `registerBodySchema` and `loginBodySchema` live in
              `packages/shared`.
            </li>
            <li>
              Frontend and backend both use the same `ApiResponse` and
              constants.
            </li>
            <li>
              The backend CORS default now aligns with the Yoga app at port
              `3000`.
            </li>
          </ul>
        </div>
      </div>
    </section>
  </main>
    </>

  );
}
