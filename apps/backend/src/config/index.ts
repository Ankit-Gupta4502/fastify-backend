import { DEFAULT_FRONTEND_URL } from "@yoga-app/shared";

const isProd = process.env.NODE_ENV === "production";

export const config = {
  frontend: {
    url: isProd
      ? process.env.FRONTEND_URL || "https://yourdomain.com"
      : process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL,
  },
  backend: {
    url: isProd
      ? process.env.PROD_BASE_URL || "https://api.yourdomain.com"
      : `http://localhost:${process.env.PORT || 8080}`,
  },
} as const;
