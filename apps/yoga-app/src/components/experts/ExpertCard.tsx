import { Link } from "@tanstack/react-router";
import { Star, Users, ArrowRight } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Expert } from "@/constants/experts";

export function ExpertCard({ expert }: { expert: Expert }) {
  return (
    <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm hover:shadow-xl hover:border-primary/20 transition-all group rounded-2xl">
      <div className="aspect-[4/3] overflow-hidden relative">
        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center text-primary/40 font-bold">
          {expert.name}
        </div>
        <img 
          src={expert.image} 
          alt={expert.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-0" // Opacity 0 until real images added
          onLoad={(e) => (e.currentTarget.style.opacity = "1")}
        />
        <div className="absolute top-4 left-4">
          <Badge className="bg-background/80 text-foreground backdrop-blur-md border-none px-3 py-1">
            <Star className="size-3 fill-primary text-primary mr-1" />
            {expert.rating}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6 space-y-3">
        <div>
          <h3 className="text-xl font-bold tracking-tight">{expert.name}</h3>
          <p className="text-xs font-bold text-primary uppercase tracking-widest">{expert.role}</p>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {expert.bio}
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {expert.specialties.map(s => (
            <Badge key={s} variant="secondary" className="bg-secondary/50 text-[10px] uppercase font-bold">
              {s}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="size-4" />
          <span className="text-xs font-medium">{expert.students}+ Students</span>
        </div>
        <Button asChild variant="ghost" size="sm" className="group/btn text-primary hover:text-primary hover:bg-primary/5">
          <Link to="/experts/$expertId" params={{ expertId: expert.id }}>
            View Profile
            <ArrowRight className="ml-2 size-3 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
