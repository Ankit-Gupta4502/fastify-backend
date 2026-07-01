import { type ReactNode, useEffect } from "react";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { captureUtm } from "@/lib/utm";
import { PAGE_SEO, ROOT_GLOBAL_META } from "@/lib/seo";
import Layout from "@/components/rootLayout/Layout";
import { ReactQueryProvider } from "../lib/react-query/query-client";
import { AuthWrapper } from "@/components/auth/AuthWrapper";
import { useAuthStore } from "@/store/auth.store";
import { fetchUserFn } from "@/lib/server-auth";
import { userApi } from "../api";
import type { RouterContext } from "../router";
import appCss from "../styles.css?url";

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
      ...PAGE_SEO.home.links,
    ],
  }),
  component: RootLayout,
  shellComponent: RootDocument,
});

const SHELL_HIDDEN_PREFIXES = ["/_user", "/instructor", "/admin", "/session/"];

function RootLayout() {
  useEffect(() => { captureUtm(); }, []);
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
