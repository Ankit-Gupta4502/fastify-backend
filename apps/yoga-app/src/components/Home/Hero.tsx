"use client"
import { Button } from "@/components/ui/button"
import { Play, Heart } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif tracking-tight text-balance">
              Your journey to{" "}
              <span className="text-primary">inner peace</span>{" "}
              starts here.
            </h1>
            <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
              Solara blends ancient mindfulness practices with modern wellness technology to help you navigate life with clarity, balance, and profound calm.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base">
                Start Free Trial
              </Button>
              <Button 
                variant="outline" 
                className="rounded-full px-8 py-6 text-base border-foreground/20 hover:bg-foreground/5"
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Preview
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="h-10 w-10 rounded-full bg-primary/20 ring-2 ring-background flex items-center justify-center text-xs font-medium">
                  JA
                </div>
                <div className="h-10 w-10 rounded-full bg-accent/30 ring-2 ring-background flex items-center justify-center text-xs font-medium">
                  MC
                </div>
                <div className="h-10 w-10 rounded-full bg-primary/30 ring-2 ring-background flex items-center justify-center text-xs font-medium">
                  ER
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Joined by <span className="font-semibold text-foreground">12k+</span> mindful souls
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/images/meditation-window.jpg"
                alt="Person meditating by a sunlit window"
                width={600}
                height={500}
                className="w-full h-auto object-cover"/>
            </div>
            {/* Daily Mood Card */}
            <div className="absolute -bottom-6 -left-6 md:left-auto md:-right-6 bg-card rounded-2xl shadow-xl p-4 w-64">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-foreground">Daily Mood</span>
                <Heart className="h-4 w-4 text-primary fill-primary" />
              </div>
              <div className="flex gap-1 items-end h-16 mb-2">
                <div className="flex-1 bg-primary/40 rounded-t-sm" style={{ height: '40%' }}></div>
                <div className="flex-1 bg-primary/50 rounded-t-sm" style={{ height: '55%' }}></div>
                <div className="flex-1 bg-primary/60 rounded-t-sm" style={{ height: '70%' }}></div>
                <div className="flex-1 bg-primary rounded-t-sm" style={{ height: '100%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground">
                Inner peace increased by <span className="text-primary font-semibold">14%</span> today
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
