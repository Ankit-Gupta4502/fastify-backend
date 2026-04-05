const isProd = process.env.NODE_ENV === "production";

export const config = {
  frontend: {
    url: isProd
      ? process.env.FRONTEND_URL || "https://yourdomain.com"
      : "http://localhost:5173",
  },
  backend: {
    url: isProd
      ? process.env.PROD_BASE_URL || "https://api.yourdomain.com"
      : `http://localhost:${process.env.PORT || 8080}`,
  },
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID || "",
    clientSecret: process.env.INSTAGRAM_CLIENT_SECRET || "",
    redirectUri: process.env.INSTAGRAM_REDIRECT_URI || "",
    scopes: ["user_profile", "user_media"],
  },
  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID || "",
    clientSecret: process.env.YOUTUBE_CLIENT_SECRET || "",
    redirectUri: process.env.YOUTUBE_REDIRECT_URI || "",
    scopes: [
      "https://www.googleapis.com/auth/youtube.readonly",
      "https://www.googleapis.com/auth/youtube",
    ],
  },
  jwt: {
    expiresIn: "7d",
  },
} as const;
