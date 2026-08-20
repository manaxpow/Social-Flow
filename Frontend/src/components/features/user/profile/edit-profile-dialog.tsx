import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, User, Calendar, FileText } from "lucide-react";
import type { UserResponse } from "@/services/user/dtos/user.reponse";
import { useUpdateUserProfile } from "@/hooks/queries/useProfileQueries";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserResponse | null;
}

export const EditProfileDialog = ({
  open,
  onOpenChange,
  user,
}: EditProfileDialogProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState<number>(1);

  const updateProfileMutation = useUpdateUserProfile();

  useEffect(() => {
    if (open && user) {
      // Split full name into first and last name
      const nameParts = (user.fullName || "").trim().split(" ");
      if (nameParts.length > 1) {
        setLastName(nameParts.pop() || "");
        setFirstName(nameParts.join(" "));
      } else {
        setFirstName(user.fullName || "");
        setLastName("");
      }

      setBio(user.bio || "");

      if (user.dateOfBirth) {
        const d = new Date(user.dateOfBirth);
        if (!isNaN(d.getTime())) {
          setDateOfBirth(d.toISOString().split("T")[0]);
        } else {
          setDateOfBirth("");
        }
      } else {
        setDateOfBirth("");
      }

      // Map gender string or number
      if (typeof user.gender === "string") {
        const g = user.gender.toLowerCase();
        if (g === "female" || g === "2") setGender(2);
        else if (g === "other" || g === "3") setGender(3);
        else setGender(1);
      } else if (typeof user.gender === "number") {
        setGender(user.gender);
      } else {
        setGender(1);
      }
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfileMutation.mutateAsync({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        bio: bio.trim() || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
        gender: gender,
      });
      onOpenChange(false);
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] p-6 rounded-2xl">
        <DialogHeader className="pb-4 border-b border-slate-200 dark:border-slate-800">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <User className="h-5 w-5 text-[#0061FF]" />
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-semibold">
                First Name
              </Label>
              <Input
                id="firstName"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-10 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-semibold">
                Last Name
              </Label>
              <Input
                id="lastName"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-10 rounded-lg"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="bio" className="text-sm font-semibold flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-muted-foreground" /> Bio
              </Label>
              <span className="text-xs text-muted-foreground">
                {bio.length}/200
              </span>
            </div>
            <Textarea
              id="bio"
              placeholder="Tell people a little about yourself..."
              rows={3}
              maxLength={200}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="resize-none rounded-lg"
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dob" className="text-sm font-semibold flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" /> Date of Birth
            </Label>
            <Input
              id="dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="h-10 rounded-lg"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Gender</Label>
            <RadioGroup
              value={gender.toString()}
              onValueChange={(v) => setGender(parseInt(v, 10))}
              className="flex gap-6 pt-1"
            >
              <div className="flex items-center space-x-2 cursor-pointer">
                <RadioGroupItem value="1" id="gender-male" />
                <Label htmlFor="gender-male" className="cursor-pointer">Male</Label>
              </div>
              <div className="flex items-center space-x-2 cursor-pointer">
                <RadioGroupItem value="2" id="gender-female" />
                <Label htmlFor="gender-female" className="cursor-pointer">Female</Label>
              </div>
              <div className="flex items-center space-x-2 cursor-pointer">
                <RadioGroupItem value="3" id="gender-other" />
                <Label htmlFor="gender-other" className="cursor-pointer">Other</Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-200 dark:border-slate-800 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateProfileMutation.isPending}
              className="rounded-full px-5 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="rounded-full px-6 bg-[#0061FF] hover:bg-[#0050DD] text-white font-semibold cursor-pointer"
            >
              {updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
