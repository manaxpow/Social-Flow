import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Mail, Phone, Calendar, Briefcase, GraduationCap, Heart } from "lucide-react";
import { Label } from "@/components/ui/label";

interface AboutTabProps {
  name?: string;
  bio?: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
  birthday?: string;
  gender?: string;
  work?: string;
  education?: string;
  relationshipStatus?: string;
  joinedDate?: string;
  isLoading?: boolean;
}

export const AboutTab = ({
  name = "User Name",
  bio,
  email,
  phone,
  location,
  website,
  birthday,
  gender,
  work,
  education,
  relationshipStatus,
  joinedDate,
  isLoading = false,
}: AboutTabProps) => {
  if (isLoading) {
    return (
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Bio</Label>
              <div className="h-16 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <Label>Work</Label>
              <div className="h-5 w-3/4 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <Label>Education</Label>
              <div className="h-5 w-2/3 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <div className="h-5 w-1/2 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date?: string): string => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <CardTitle>About</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bio Section */}
        {bio && (
          <div className="space-y-2">
            <Label className="text-base font-semibold">Bio</Label>
            <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
          </div>
        )}

        {/* Contact Info Section */}
        {(email || phone) && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Contact Info</Label>
            {email && (
              <div className="flex items-start gap-3 text-sm">
                <Mail className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <a href={`mailto:${email}`} className="text-[#0061FF] hover:underline transition-colors">
                  {email}
                </a>
              </div>
            )}
            {phone && (
              <div className="flex items-start gap-3 text-sm">
                <Phone className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <a href={`tel:${phone}`} className="text-[#0061FF] hover:underline transition-colors">
                  {phone}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Basic Info Section */}
        {(birthday || gender || relationshipStatus) && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Basic Info</Label>
            {birthday && (
              <div className="flex items-start gap-3 text-sm">
                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span>Birthday: {formatDate(birthday)}</span>
              </div>
            )}
            {gender && (
              <div className="flex items-start gap-3 text-sm">
                <span className="w-4 h-4 mt-0.5 flex items-center justify-center text-muted-foreground flex-shrink-0">
                  ⚧
                </span>
                <span>Gender: {gender}</span>
              </div>
            )}
            {relationshipStatus && (
              <div className="flex items-start gap-3 text-sm">
                <Heart className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span>Relationship: {relationshipStatus}</span>
              </div>
            )}
          </div>
        )}

        {/* Work & Education Section */}
        {(work || education) && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Work & Education</Label>
            {work && (
              <div className="flex items-start gap-3 text-sm">
                <Briefcase className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span>{work}</span>
              </div>
            )}
            {education && (
              <div className="flex items-start gap-3 text-sm">
                <GraduationCap className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <span>{education}</span>
              </div>
            )}
          </div>
        )}

        {/* Location Section */}
        {location && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Location</Label>
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span>{location}</span>
            </div>
          </div>
        )}

        {/* Website Section */}
        {website && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Website</Label>
            <div className="flex items-start gap-3 text-sm">
              <span className="w-4 h-4 mt-0.5 flex items-center justify-center text-muted-foreground flex-shrink-0">
                🔗
              </span>
              <a
                href={website.startsWith("http") ? website : `https://${website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0061FF] hover:underline transition-colors"
              >
                {website}
              </a>
            </div>
          </div>
        )}

        {/* Joined Date */}
        {joinedDate && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Joined SocialFlow</Label>
            <div className="flex items-start gap-3 text-sm">
              <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
              <span>{new Date(joinedDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};