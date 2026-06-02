import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginBodySchema,
  registerBodySchema,
  type LoginBody,
  type RegisterBody,
} from "@yoga-app/shared";

export const registerFormOptions = {
  resolver: zodResolver(registerBodySchema),
  defaultValues: {
    name: "",
    email: "",
    password: "",
  } satisfies RegisterBody,
};

export const loginFormOptions = {
  resolver: zodResolver(loginBodySchema),
  defaultValues: {
    email: "",
    password: "",
    rememberMe: true,
  } satisfies LoginBody,
};
