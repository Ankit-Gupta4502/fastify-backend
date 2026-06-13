import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { type LoginBody, type RegisterBody, type ForgotPasswordBody } from "@yoga-app/shared";

import { loginFormOptions, registerFormOptions, forgotPasswordFormOptions } from "@/lib/validation/auth";
import { useAuth } from "@/hooks/use-auth";
import { ApiRequestError } from "@/lib/http";
import { useAuthStore } from "@/store/auth.store";
import { authApi } from "@/api";

/** Reads and clears the demo-class intent flag, returning the correct redirect path. */
function consumeDemoIntent(): "/" | "/demo" {
  if (localStorage.getItem("demoClassIntent")) {
    localStorage.removeItem("demoClassIntent");
    return "/demo";
  }
  return "/";
}

export type LoginMode = "login" | "register" | "forgot";

export function useLogin() {
  const [mode, setMode] = useState<LoginMode>("login");
  const [feedback, setFeedback] = useState<string | null>(null);
  const { login, register: registerUserMutation, getGoogleUrl } = useAuth();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate({ to: consumeDemoIntent() });
    }
  }, [isLoading, isAuthenticated, navigate]);

  const loginForm    = useForm<LoginBody>(loginFormOptions);
  const registerForm = useForm<RegisterBody>(registerFormOptions);
  const forgotForm   = useForm<ForgotPasswordBody>(forgotPasswordFormOptions);
  const isSubmitting = login.isPending || registerUserMutation.isPending;
  const [isForgotPending, setIsForgotPending] = useState(false);

  async function onLoginSubmit(values: LoginBody) {
    setFeedback(null);
    try {
      await login.mutateAsync(values);
      navigate({ to: consumeDemoIntent() });
    } catch (error) {
      setFeedback(error instanceof ApiRequestError || error instanceof Error ? error.message : "Login failed");
    }
  }

  async function onRegisterSubmit(values: RegisterBody) {
    setFeedback(null);
    try {
      await registerUserMutation.mutateAsync(values);
      setFeedback("Account created! Redirecting…");
      const dest = consumeDemoIntent();
      setTimeout(() => navigate({ to: dest }), 1500);
    } catch (error) {
      setFeedback(error instanceof ApiRequestError || error instanceof Error ? error.message : "Registration failed");
    }
  }

  async function onForgotSubmit(values: ForgotPasswordBody) {
    setFeedback(null);
    setIsForgotPending(true);
    try {
      await authApi.forgotPassword(values);
      setFeedback("success:If an account exists for that email, a reset link is on its way.");
    } catch (error) {
      setFeedback(error instanceof ApiRequestError || error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsForgotPending(false);
    }
  }

  async function handleGoogleSignIn() {
    // Keep the intent flag alive — the home-page beforeLoad will consume it
    // after Google redirects back to the origin.
    const callbackURL = window.location.origin;
    try {
      const response = await getGoogleUrl(callbackURL);
      if (response.data?.url) window.location.assign(response.data.url);
    } catch (error) {
      setFeedback(error instanceof ApiRequestError || error instanceof Error ? error.message : "Google sign-in failed");
    }
  }

  const switchMode = (next: LoginMode) => {
    setMode(next);
    setFeedback(null);
    loginForm.reset();
    registerForm.reset();
    forgotForm.reset();
  };

  return {
    mode,
    feedback,
    loginForm,
    registerForm,
    forgotForm,
    isSubmitting,
    isForgotPending,
    onLoginSubmit,
    onRegisterSubmit,
    onForgotSubmit,
    handleGoogleSignIn,
    switchMode,
  };
}
