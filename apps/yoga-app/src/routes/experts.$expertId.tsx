import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Star, Users, CheckCircle2, Calendar, MessageSquare } from "lucide-react";
import { EXPERTS } from "@/constants/experts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export const Route = createFileRoute("/experts/$expertId")({
  loader: ({ params }) => {
    const expert = EXPERTS.find((e) => e.id === params.expertId);
    if (!expert) throw notFound();
    return { expert };
  },
  component: ExpertDetailPage,
});

function ExpertDetailPage() {
  const { expert } = Route.useLoaderData();

  return (
    <div className="py-12 space-y-12">
      <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground hover:text-foreground">
        <Link to="/experts">
          <ArrowLeft className="mr-2 size-4" />
          Back to Experts
        </Link>
      </Button>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Left: Image and Quick Stats */}
        <div className="space-y-8">
          <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-border/40 relative">
            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center text-primary/40 font-bold text-2xl">
              {expert.name}
            </div>
            <img 
              src={expert.image} 
              alt={expert.name}
              className="w-full h-full object-cover relative z-10 opacity-0 transition-opacity"
              onLoad={(e) => (e.currentTarget.style.opacity = "1")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="border-none bg-secondary/30 text-center p-6 rounded-2xl">
              <Star className="size-5 text-primary mx-auto mb-2 fill-primary" />
              <p className="text-2xl font-bold">{expert.rating}</p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Rating</p>
            </Card>
            <Card className="border-none bg-secondary/30 text-center p-6 rounded-2xl">
              <Users className="size-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{expert.students}+</p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Students</p>
            </Card>
          </div>
          
          <Button className="w-full h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20 gap-2">
            <Calendar className="size-5" />
            Book a Session
          </Button>
          <Button variant="outline" className="w-full h-14 rounded-2xl text-base font-bold gap-2">
            <MessageSquare className="size-5" />
            Send Message
          </Button>
        </div>

        {/* Right: Bio and Details */}
        <div className="lg:col-span-2 space-y-10">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight">{expert.name}</h1>
            <p className="text-xl text-primary font-medium">{expert.role}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {expert.specialties.map(s => (
                <Badge key={s} className="bg-primary/10 text-primary border-none px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-serif font-bold">About the Instructor</h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {expert.fullBio}
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-2xl font-serif font-bold">Teaching Style</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Mindful & Rhythmic",
                "Accessible to all levels",
                "Strong focus on alignment",
                "Deep spiritual grounding"
              ].map(item => (
                <div key={item} className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/40 shadow-sm">
                  <CheckCircle2 className="size-5 text-primary" />
                  <span className="font-medium text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
