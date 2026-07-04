import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, LogOut, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLeaveRoom } from "@/hooks/use-rooms";
import { hmsPrebuiltUrl } from "@/lib/hms";

export const Route = createFileRoute("/session/$roomId/")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search.code === "string" ? search.code : undefined,
  }),
  component: SessionPage,
});

function SessionPage() {
  const { roomId } = Route.useParams();
  const { code } = Route.useSearch();
  const router = useRouter();
  const leave = useLeaveRoom();
  const [error, setError] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);

  const url = hmsPrebuiltUrl(code);

  const handleLeave = () => {
    setError(null);
    leave.mutate(roomId, {
      onSuccess: () => router.navigate({ to: "/rooms" }),
      onError: (err) =>
        setError(err instanceof Error ? err.message : "Could not leave"),
    });
  };

  if (!url) {
    return (
      <div className="max-w-2xl mx-auto py-20">
        <Card className="border-none bg-card/60 rounded-3xl shadow-lg">
          <CardContent className="p-10 text-center space-y-5">
            <AlertTriangle className="size-10 text-primary/60 mx-auto" />
            <h2 className="text-2xl font-serif font-bold">Session link expired</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We couldn't find a valid join code for this room. Head back to the
              rooms list and try again.
            </p>
            <Button asChild className="rounded-full px-6">
              <Link to="/rooms">Back to rooms</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-8 h-[calc(100vh-4rem)] flex flex-col bg-background">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border/40 bg-background/80 backdrop-blur">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          <Link to="/rooms">
            <ArrowLeft className="size-4 mr-2" />
            Rooms
          </Link>
        </Button>
        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Live Session
        </div>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full gap-2 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleLeave}
          disabled={leave.isPending}
        >
          <LogOut className="size-4" />
          {leave.isPending ? "Leaving..." : "Leave"}
        </Button>
      </div>

      {error && (
        <div className="px-4 py-2 text-sm text-destructive bg-destructive/5">
          {error}
        </div>
      )}

      <div className="relative flex-1 min-h-0">
        {iframeLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        )}
        <iframe
          title="Live yoga session"
          src={url}
          allow="camera; microphone; fullscreen; speaker; display-capture; autoplay"
          className="absolute inset-0 size-full border-0"
          onLoad={() => setIframeLoading(false)}
        />
      </div>
    </div>
  );
}
