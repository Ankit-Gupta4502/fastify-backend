import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "@tanstack/react-router";
import {
  type LoginBody,
  type RegisterBody,
  type ForgotPasswordBody,
  type OrganizationSizeBand,
} from "@yoga-app/shared";

import { loginFormOptions, registerFormOptions, forgotPasswordFormOptions } from "@/features/auth/schemas/auth.schema";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ApiRequestError } from "@/lib/http";
import { authApi } from "@/api";
import { getStoredUtm, hasSavedAcquisition, markAcquisitionSaved } from "@/shared/lib/utm";
import { userPreferencesApi } from "@/api/user-preferences";

function fireAcquisition() {
  if (hasSavedAcquisition()) return;
  const utm = getStoredUtm();
  if (!utm) return;
  userPreferencesApi.saveAcquisition(utm).then(() => markAcquisitionSaved()).catch(() => {});
}

export type LoginMode = "login" | "register" | "forgot";
export type AccountType = "individual" | "company";

export function useLogin(redirectTo?: string, referralCode?: string, orgInviteToken?: string) {
  const [mode, setMode] = useState<LoginMode>(referralCode || orgInviteToken ? "register" : "login");
  const [feedback, setFeedback] = useState<string | null>(null);
  const { login, register: registerUserMutation, getGoogleUrl } = useAuth();
  const navigate = useNavigate();
  const loginForm    = useForm<LoginBody>(loginFormOptions);
  const registerForm = useForm<RegisterBody>(registerFormOptions);
  const forgotForm   = useForm<ForgotPasswordBody>(forgotPasswordFormOptions);
  const isSubmitting = login.isPending || registerUserMutation.isPending;
  const [isForgotPending, setIsForgotPending] = useState(false);
  const [isGooglePending, setIsGooglePending] = useState(false);

  // "Sign up as a company" — irrelevant (and hidden) when arriving via an
  // org invite link, since that always joins an existing org instead.
  const [accountType, setAccountType] = useState<AccountType>("individual");
  const [orgName, setOrgName] = useState("");
  const [orgSizeBand, setOrgSizeBand] = useState<OrganizationSizeBand | "">("");

  async function onLoginSubmit(values: LoginBody) {
    setFeedback(null);
    try {
      await login.mutateAsync(values);
      fireAcquisition();
      navigate({ href: redirectTo || "/", replace: true });
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

    if (accountType === "company" && !orgInviteToken && (!orgName.trim() || !orgSizeBand)) {
      setFeedback("Please enter your organization name and team size");
      return;
    }

    try {
      await registerUserMutation.mutateAsync({
        ...values,
        ...(referralCode && { referralCode }),
        ...(orgInviteToken && { orgInviteToken }),
        ...(accountType === "company" && !orgInviteToken && {
          organization: { name: orgName.trim(), sizeBand: orgSizeBand as OrganizationSizeBand },
        }),
      });
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
    setFeedback(null);

    if (accountType === "company" && !orgInviteToken && (!orgName.trim() || !orgSizeBand)) {
      setFeedback("Please enter your organization name and team size");
      return;
    }

    setIsGooglePending(true);
    const callbackURL = redirectTo
      ? new URL(redirectTo, window.location.origin).toString()
      : window.location.origin;
    try {
      const response = await getGoogleUrl(callbackURL, {
        ref: referralCode,
        orgInviteToken,
        ...(accountType === "company" && !orgInviteToken && {
          orgName: orgName.trim(),
          orgSizeBand: orgSizeBand as string,
        }),
      });
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
    setAccountType("individual");
    setOrgName("");
    setOrgSizeBand("");
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
    accountType,
    setAccountType,
    orgName,
    setOrgName,
    orgSizeBand,
    setOrgSizeBand,
    onLoginSubmit,
    onRegisterSubmit,
    onForgotSubmit,
    handleGoogleSignIn,
    switchMode,
  };
}
