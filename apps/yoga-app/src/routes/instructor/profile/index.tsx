import { createFileRoute } from "@tanstack/react-router";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInstructorProfile } from "@/features/instructor/hooks/use-instructors";
import { ProfileForm } from "@/features/instructor/components/profile-form";
import { AvailabilityForm } from "@/features/instructor/components/availability-form";

export const Route = createFileRoute("/instructor/profile/")({
  component: InstructorProfilePage,
});

function InstructorProfilePage() {
  const { data, isLoading, error } = useInstructorProfile();
  const profile = data?.data;

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary">
          Instructor Console
        </p>
        <h1 className="text-3xl font-serif font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground text-sm">
          This is what students see when they browse for instructors.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-destructive/5 border border-destructive/30 text-destructive p-6 text-sm">
          Could not load profile. Please try again.
        </div>
      ) : profile ? (
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <ProfileForm profile={profile} />
          </TabsContent>
          <TabsContent value="availability">
            <AvailabilityForm profile={profile} />
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
}
