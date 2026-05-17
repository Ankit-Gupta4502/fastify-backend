import { createFileRoute } from "@tanstack/react-router";
import { 
  Trophy, 
  Calendar, 
  Clock, 
  Flame, 
  TrendingUp, 
  Activity,
  Heart,
  Plus
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_user/dashboard")({
  component: UserDashboard,
});

function UserDashboard() {
  const { user } = useAuthStore();

  const stats = [
    { label: "Total Sessions", value: "24", icon: Calendar, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Practice Minutes", value: "840", icon: Clock, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Day Streak", value: "12", icon: Flame, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Calm Index", value: "92%", icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
  ];

  const recentSessions = [
    { name: "Morning Vinyasa Flow", instructor: "Sarah Chen", date: "Today, 7:00 AM", duration: "45m", calories: "240" },
    { name: "Deep Tissue Release", instructor: "Michael Ross", date: "Yesterday", duration: "60m", calories: "180" },
    { name: "Mindfulness Meditation", instructor: "Aisha Jallow", date: "May 15", duration: "20m", calories: "40" },
  ];

  const goals = [
    { name: "Morning Routine", progress: 85, target: "20/21 days", color: "bg-primary" },
    { name: "Advanced Flexibility", progress: 62, target: "Level 4", color: "bg-accent" },
    { name: "Daily Meditation", progress: 40, target: "10m/day", color: "bg-blue-500" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold tracking-tight">Namaste, {user?.name}</h1>
          <p className="text-muted-foreground">Here is your progress on the journey to inner peace.</p>
        </div>
        <Button className="rounded-full shadow-lg shadow-primary/20 gap-2">
          <Plus className="size-4" />
          <span>New Session</span>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={cn("size-12 rounded-2xl flex items-center justify-center shrink-0", stat.bg)}>
                <stat.icon className={cn("size-6", stat.color)} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Chart & Activity Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm bg-card/50 overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Practice Intensity</CardTitle>
                  <CardDescription>Visualizing your effort over the last 14 days</CardDescription>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">
                  <TrendingUp className="size-3" />
                  <span>+14% vs last month</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {/* Custom CSS Bar Chart */}
              <div className="h-48 flex items-end gap-2 md:gap-3">
                {[35, 45, 30, 60, 85, 40, 55, 70, 95, 50, 65, 80, 45, 100].map((h, i) => (
                  <div key={i} className="flex-1 group relative">
                    <div 
                      className="w-full bg-primary/20 rounded-t-lg transition-all duration-500 group-hover:bg-primary" 
                      style={{ height: `${h}%` }}
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {h} mins
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
                <span>2 Weeks Ago</span>
                <span>Last Week</span>
                <span>Today</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card/50">
            <CardHeader>
              <CardTitle className="text-xl">Recent Sessions</CardTitle>
              <CardDescription>Your latest mindfulness activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentSessions.map((session, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors group cursor-pointer border border-transparent hover:border-border/50">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-full bg-background flex items-center justify-center text-primary border border-border/50">
                        <Activity className="size-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{session.name}</p>
                        <p className="text-xs text-muted-foreground">{session.instructor} • {session.date}</p>
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold">{session.duration}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{session.calories} kcal</p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" className="w-full text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/5">
                  View Full History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Goals & Milestones */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-card/50">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Trophy className="size-5 text-primary" />
                <CardTitle className="text-xl">Active Goals</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {goals.map((goal, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-foreground">{goal.name}</span>
                    <span className="text-muted-foreground font-medium">{goal.target}</span>
                  </div>
                  <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full rounded-full transition-all duration-1000", goal.color)} 
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-right font-bold text-muted-foreground uppercase tracking-widest">
                    {goal.progress}% Complete
                  </p>
                </div>
              ))}
              <Button variant="outline" className="w-full rounded-xl text-xs font-bold uppercase tracking-widest py-5">
                Manage Goals
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12">
               <Flame className="size-24" />
            </div>
            <CardContent className="p-8 relative z-10 space-y-4">
               <h3 className="text-xl font-serif font-bold">Unstoppable!</h3>
               <p className="text-primary-foreground/90 leading-relaxed text-sm">
                 You've practiced for 12 days straight. Only 2 days left to hit your bi-weekly milestone.
               </p>
               <Button className="w-full bg-white text-primary hover:bg-white/90 rounded-xl font-bold py-5">
                 View Rewards
               </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
