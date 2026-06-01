import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { type LoginBody, type RegisterBody } from "@yoga-app/shared";

import { loginFormOptions, registerFormOptions } from "@/lib/validation/auth";
import { useAuth } from "@/hooks/use-auth";
import { ApiRequestError } from "@/lib/http";
import { useAuthStore } from "@/store/auth.store";

export function useLogin() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [feedback, setFeedback] = useState<string | null>(null);
  const { login, register: registerUserMutation, getGoogleUrl } = useAuth();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate({ to: "/" });
  }, [isLoading, isAuthenticated, navigate]);

  const loginForm    = useForm<LoginBody>(loginFormOptions);
  const registerForm = useForm<RegisterBody>(registerFormOptions);
  const isSubmitting = login.isPending || registerUserMutation.isPending;

  async function onLoginSubmit(values: LoginBody) {
    setFeedback(null);
    try {
      await login.mutateAsync(values);
      navigate({ to: "/" });
    } catch (error) {
      setFeedback(error instanceof ApiRequestError || error instanceof Error ? error.message : "Login failed");
    }
  }

  async function onRegisterSubmit(values: RegisterBody) {
    setFeedback(null);
    try {
      await registerUserMutation.mutateAsync(values);
      setFeedback("Account created! Redirecting…");
      setTimeout(() => navigate({ to: "/" }), 1500);
    } catch (error) {
      setFeedback(error instanceof ApiRequestError || error instanceof Error ? error.message : "Registration failed");
    }
  }

  function handleGoogleSignIn() {
    const callbackURL = typeof window !== "undefined" ? window.location.origin : "";
    window.location.assign(getGoogleUrl(callbackURL));
  }

  const switchMode = (next: "login" | "register") => {
    setMode(next);
    setFeedback(null);
    loginForm.reset();
    registerForm.reset();
  };

  return {
    mode,
    feedback,
    loginForm,
    registerForm,
    isSubmitting,
    onLoginSubmit,
    onRegisterSubmit,
    handleGoogleSignIn,
    switchMode,
  };
}
