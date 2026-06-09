import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, CalendarDays, Clock, IndianRupee, Users, UserCircle, ExternalLink, Video } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/StatCard";
import { NextClassCard } from "../-components/NextClassCard";
import { ScheduleList } from "../-components/ScheduleList";
import { useInstructorSchedule, useJoinRoom } from "@/hooks/use-rooms";
import { useInstructorWallet } from "@/hooks/use-instructors";
import { useInstructorDemoSessions } from "@/hooks/use-demo";
import { INSTRUCTOR_IANA, INSTRUCTOR_TIMEZONE_LABEL } from "@/constants/sessions";

export const Route = createFileRoute("/instructor/dashboard/")({
  component: InstructorDashboard,
});

function InstructorDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const schedule = useInstructorSchedule();
  const join = useJoinRoom();
  const wallet = useInstructorWallet();
  const demoSessions = useInstructorDemoSessions();
  const rooms = schedule.data?.data ?? [];
  const demos = demoSessions.data?.data ?? [];

  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  const total = rooms.length;
  const live = rooms.filter((r) => r.status === "active").length;
  const seats = rooms.reduce((sum, r) => sum + r.currentOccupancy, 0);
  const nextRoom = rooms.find((r) => r.status !== "active") ?? rooms[0];
  const balanceInr = wallet.data?.data?.balanceInr ?? 0;

  const handleJoin = (roomId: string) => {
    setJoinError(null);
    setJoiningId(roomId);
    join.mutate(roomId, {
      onSuccess: (result) => {
        const code = result.data?.hmsRoomCode ?? undefined;
        router.navigate({ to: "/session/$roomId", params: { roomId }, search: { code } });
      },
      onError: (err) => {
        setJoinError(err instanceof Error ? err.message : "Could not open studio");
        setJoiningId(null);
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">
            Instructor Console
          </p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight">
            Hello, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">
            Your schedule is shown in{" "}
            <span className="font-medium">{INSTRUCTOR_TIMEZONE_LABEL}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest">
            <span className="size-2 rounded-full bg-emerald-500 mr-2 animate-pulse inline-block" />
            Available
          </Badge>
          <Link
            to="/instructor/profile"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors border border-border/60 px-3 py-2 rounded-full hover:border-primary/40"
          >
            <UserCircle className="size-3.5" />
            Edit profile
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          label="Upcoming"
          value={String(total)}
          icon={CalendarDays}
          bg="bg-primary/10"
          accent="text-primary"
          loading={schedule.isLoading}
        />
        <StatCard
          label="Live now"
          value={String(live)}
          icon={Activity}
          bg="bg-accent/10"
          accent="text-accent"
          loading={schedule.isLoading}
        />
        <StatCard
          label="Seats booked"
          value={String(seats)}
          icon={Users}
          bg="bg-blue-50 dark:bg-blue-500/10"
          accent="text-blue-500"
          loading={schedule.isLoading}
        />
        <StatCard
          label="Time zone"
          value={INSTRUCTOR_IANA}
          icon={Clock}
          bg="bg-orange-50 dark:bg-orange-500/10"
          accent="text-orange-500"
        />
      </div>

      {/* Earnings banner */}
      <Link to="/instructor/earnings" className="block group">
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors px-6 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center shrink-0">
              <IndianRupee className="size-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Total Earnings
              </p>
              {wallet.isLoading ? (
                <div className="h-7 w-20 bg-muted/60 rounded animate-pulse mt-1" />
              ) : (
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{balanceInr.toLocaleString("en-IN")}
                </p>
              )}
            </div>
          </div>
          <span className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors pr-1">
            View history →
          </span>
        </div>
      </Link>

      {joinError && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 text-destructive px-4 py-3 text-sm">
          {joinError}
        </div>
      )}

      <NextClassCard room={nextRoom} isLoading={schedule.isLoading} joiningId={joiningId} onJoin={handleJoin} />

      <ScheduleList rooms={rooms} isLoading={schedule.isLoading} joiningId={joiningId} onJoin={handleJoin} />

      {/* Demo Sessions */}
      {(demoSessions.isLoading || demos.length > 0) && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Video className="size-4 text-primary" />
            <h2 className="text-lg font-bold tracking-tight">Assigned Demo Sessions</h2>
            {demos.length > 0 && (
              <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase tracking-wider">
                {demos.length}
              </Badge>
            )}
          </div>

          {demoSessions.isLoading ? (
            <div className="rounded-2xl border border-border/60 p-6 text-center text-sm text-muted-foreground animate-pulse">
              Loading demo sessions…
            </div>
          ) : (
            <div className="space-y-3">
              {demos.map((demo) => (
                <div
                  key={demo.id}
                  className="rounded-2xl border border-border/60 bg-card px-5 py-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm">{demo.userName}</p>
                      <p className="text-xs text-muted-foreground">{demo.userEmail}</p>
                    </div>
                    <Badge className="text-[10px] font-bold uppercase tracking-wider border rounded-full px-2.5 py-0.5 shrink-0 bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
                      {demo.status === "instructor_assigned" ? "Awaiting Link" : demo.status === "meeting_scheduled" ? "Scheduled" : "Completed"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-muted-foreground font-medium">Phone</p>
                      <p className="font-semibold">{demo.phone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground font-medium">Date & Time</p>
                      <p className="font-semibold">{demo.preferredDate} {demo.preferredTime}</p>
                      <p className="text-muted-foreground">{demo.timezone}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                      Goals
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {demo.purposes.map((p) => (
                        <span
                          key={p}
                          className="inline-block rounded-full bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  {demo.meetingLink && (
                    <a
                      href={demo.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 w-full justify-center py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                    >
                      <ExternalLink className="size-3.5" />
                      Join Demo Session
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
