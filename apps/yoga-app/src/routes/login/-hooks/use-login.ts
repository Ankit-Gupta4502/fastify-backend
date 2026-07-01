import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import { type LoginBody, type RegisterBody, type ForgotPasswordBody } from "@yoga-app/shared";

import { loginFormOptions, registerFormOptions, forgotPasswordFormOptions } from "@/lib/validation/auth";
import { useAuth } from "@/hooks/use-auth";
import { ApiRequestError } from "@/lib/http";
import { authApi } from "@/api";
import { getStoredUtm, clearUtm } from "@/lib/utm";
import { userPreferencesApi } from "@/api/user-preferences";

function fireAcquisition() {
  const utm = getStoredUtm();
  if (!utm) return;
  userPreferencesApi.saveAcquisition(utm).then(() => clearUtm()).catch(() => {});
}

export type LoginMode = "login" | "register" | "forgot";

export function useLogin() {
  const [mode, setMode] = useState<LoginMode>("login");
  const [feedback, setFeedback] = useState<string | null>(null);
  const { login, register: registerUserMutation, getGoogleUrl } = useAuth();
  const navigate = useNavigate();
  const loginForm    = useForm<LoginBody>(loginFormOptions);
  const registerForm = useForm<RegisterBody>(registerFormOptions);
  const forgotForm   = useForm<ForgotPasswordBody>(forgotPasswordFormOptions);
  const isSubmitting = login.isPending || registerUserMutation.isPending;
  const [isForgotPending, setIsForgotPending] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);

  async function onLoginSubmit(values: LoginBody) {
    setFeedback(null);
    try {
      await login.mutateAsync(values);
      navigate({ to: "/", replace: true });
    } catch (error) {
      if (error instanceof ApiRequestError && error.payload?.error === "EMAIL_NOT_VERIFIED") {
        navigate({ to: "/verify-email" });
        return;
      }
      setFeedback(error instanceof ApiRequestError || error instanceof Error ? error.message : "Login failed");
    }
  }

  async function onRegisterSubmit(values: RegisterBody) {
    setFeedback(null);
    try {
      await registerUserMutation.mutateAsync(values);
      fireAcquisition();
      setFeedback("Account created! Redirecting…");
      setTimeout(() => navigate({ to: "/verify-email", replace: true }), 1500);
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
    setIsGooglePending(true);
    const callbackURL = window.location.origin;
    try {
      const response = await getGoogleUrl(callbackURL);
      if (response.data?.url) window.location.assign(response.data.url);
    } catch (error) {
      setFeedback(error instanceof ApiRequestError || error instanceof Error ? error.message : "Google sign-in failed");
      setIsGooglePending(false);
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
    isGooglePending,
    onLoginSubmit,
    onRegisterSubmit,
    onForgotSubmit,
    handleGoogleSignIn,
    switchMode,
  };
}
