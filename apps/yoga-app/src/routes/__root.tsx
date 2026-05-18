import { type ReactNode } from "react";
import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { APP_NAME } from "@yoga-app/shared";
import Layout from "@/components/rootLayout/Layout";
import { ReactQueryProvider } from "../lib/react-query/query-client";
import { AuthWrapper } from "@/components/auth/AuthWrapper";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: `${APP_NAME} Workspace`,
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
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
              config={{
                position: "bottom-right",
              }}
              plugins={[
                {
                  name: "Tanstack Router",
                  render: <TanStackRouterDevtoolsPanel />,
                },
              ]}
            />
            <Scripts />
          </AuthWrapper>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
