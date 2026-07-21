import { type ReactNode } from "react";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { captureUtm } from "@/shared/lib/utm";
import { PAGE_SEO, ROOT_GLOBAL_META } from "@/shared/lib/seo";
import Layout from "@/app/layouts/public-layout";
import { ReactQueryProvider } from "../lib/react-query/query-client";
import { AuthWrapper } from "@/features/auth/components/auth-wrapper";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { fetchUserFn } from "@/features/auth/services/server-auth.service";
import { userApi } from "../api";
import type { RouterContext } from "../router";
import appCss from "../styles.css?url";

// Runs once at module load, before the first render — must happen before any
// component reads getStoredUtm() synchronously during render (see WorkshopCard, WorkshopDetail, etc).
captureUtm();

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async () => {
    // SSR — always fetch with forwarded cookies so guards have the user on first render
    if (typeof window === "undefined") {
      const user = await fetchUserFn();
      return { user };
    }

    // Client — store already hydrated from initial load, skip the fetch entirely
    const store = useAuthStore.getState();
    if (!store.isLoading) {
      return { user: store.user };
    }

    // First client load (store not yet hydrated) — fetch once and prime the store
    try {
      const result = await userApi.fetchDetail();
      const user = result.success && result.data ? result.data : null;
      store.setUser(user);
      return { user };
    } catch {
      store.setUser(null);
      return { user: null };
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      ...ROOT_GLOBAL_META,
      ...PAGE_SEO.home.meta,
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "manifest", href: "/site.webmanifest" },
      // NOTE: no canonical link here — every route sets its own via PAGE_SEO,
      // and TanStack Router doesn't dedupe links by `rel`, so a root-level
      // canonical would render alongside each page's own canonical tag.
    ],
  }),
  component: RootLayout,
  shellComponent: RootDocument,
});

const SHELL_HIDDEN_PREFIXES = ["/_user", "/instructor", "/admin", "/session/"];

function RootLayout() {
  const { matches } = useRouterState();
  const hideShell = matches.some((m) =>
    SHELL_HIDDEN_PREFIXES.some((prefix) => m.routeId.startsWith(prefix))
  );

  if (hideShell) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Outlet />
      </div>
    );
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ReactQueryProvider>
          <AuthWrapper>
            {children}
            <TanStackDevtools
              config={{ position: "bottom-right" }}
              plugins={[{ name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> }]}
            />
            <Scripts />
          </AuthWrapper>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
