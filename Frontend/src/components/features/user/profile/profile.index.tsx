import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  MoreHorizontal,
  Mail,
  Grid3X3,
  MessageSquare,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Post {
  id: string;
  image: string;
  likes: number;
  comments: number;
}
const MOCK_POSTS: Post[] = Array.from({ length: 9 }).map((_, i) => ({
  id: `${i}`,
  image: `https://picsum.photos/seed/${i + 50}/400/400`,
  likes: Math.floor((i + 1) * 12.5), // Use deterministic math if you want to be safe
  comments: Math.floor((i + 1) * 2.2),
}));

const UserProfile = () => {
  // Mock data for the posts grid

  return (
    <div className="max-w-4xl mx-auto bg-background min-h-screen border-x">
      {/* 1. Header & Cover Image */}
      <div className="relative group">
        <div className="h-48 md:h-64 bg-slate-200 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1557683316-973673baf926"
            alt="Cover"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Avatar - Positioned to overlap cover */}
        <div className="absolute -bottom-16 left-6 ring-4 ring-background rounded-full overflow-hidden">
          <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background">
            <AvatarImage
              src="https://github.com/shadcn.png"
              alt="User Profile"
            />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* 2. Action Buttons */}
      <div className="flex justify-end p-4 pt-6 gap-2">
        <Button variant="outline" size="icon" className="rounded-full">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="rounded-full">
          <Mail className="h-4 w-4" />
        </Button>
        <Button className="rounded-full px-6 font-bold bg-primary text-primary-foreground">
          Follow
        </Button>
      </div>

      {/* 3. User Info */}
      <div className="px-6 mt-8 space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Alex Rivera</h1>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            >
              Pro
            </Badge>
          </div>
          <p className="text-muted-foreground">@arivera_design</p>
        </div>

        <p className="text-md leading-relaxed max-w-2xl">
          Digital Architect & UI Enthusiast. Building the future of social web.
          Currently exploring the intersection of AI and Generative Art. 🎨✨
        </p>

        {/* Metadata (Location, Link, Join Date) */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" /> San Francisco, CA
          </div>
          <div className="flex items-center gap-1 text-primary hover:underline cursor-pointer">
            <LinkIcon className="h-4 w-4" /> arivera.design
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" /> Joined March 2022
          </div>
        </div>

        {/* Following/Followers Stats */}
        <div className="flex gap-6 text-sm">
          <div className="flex gap-1">
            <span className="font-bold text-foreground">1.2k</span>
            <span className="text-muted-foreground">Following</span>
          </div>
          <div className="flex gap-1">
            <span className="font-bold text-foreground">48.5k</span>
            <span className="text-muted-foreground">Followers</span>
          </div>
        </div>
      </div>

      {/* 4. Tabbed Content Feed */}
      <div className="mt-8">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start h-12 bg-transparent border-b rounded-none px-6 gap-8">
            <TabsTrigger
              value="posts"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 bg-transparent shadow-none"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 bg-transparent shadow-none"
            >
              Media
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 bg-transparent shadow-none"
            >
              Likes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="p-0">
            {/* Image Grid Layout */}
            <div className="grid grid-cols-3 gap-1 mt-1 px-1">
              {MOCK_POSTS.map((post) => (
                <div
                  key={post.id}
                  className="relative aspect-square group cursor-pointer overflow-hidden"
                >
                  <img
                    src={post.image}
                    alt="Post"
                    className="object-cover w-full h-full transition-opacity group-hover:opacity-90"
                  />
                  {/* Hover Overlay for Stats */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white gap-4 transition-opacity">
                    <span className="flex items-center gap-1 font-semibold">
                      <Heart className="h-5 w-5 fill-white" /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1 font-semibold">
                      <MessageSquare className="h-5 w-5 fill-white" />{" "}
                      {post.comments}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="media">
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <Grid3X3 className="h-12 w-12 mb-4 opacity-20" />
              <p>No media found</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default UserProfile;
