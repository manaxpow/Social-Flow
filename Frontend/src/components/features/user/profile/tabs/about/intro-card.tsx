import { MapPin, Link as LinkIcon, Calendar, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface IntroCardProps {
  name?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedDate?: string;
  work?: string;
  isLoading?: boolean;
}

export const IntroCard = ({
  bio,
  location,
  website,
  joinedDate,
  work,
  isLoading = false,
}: IntroCardProps) => {
  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Intro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Intro</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bio && <p className="text-sm">{bio}</p>}
        
        <div className="space-y-3">
          {work && (
            <div className="flex items-start gap-3 text-sm">
              <Briefcase className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span>{work}</span>
            </div>
          )}
          
          {location && (
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span>{location}</span>
            </div>
          )}
          
          {website && (
            <div className="flex items-start gap-3 text-sm">
              <LinkIcon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <a
                href={website.startsWith("http") ? website : `https://${website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {website}
              </a>
            </div>
          )}
          
          {joinedDate && (
            <div className="flex items-start gap-3 text-sm">
              <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span>Joined {joinedDate}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};