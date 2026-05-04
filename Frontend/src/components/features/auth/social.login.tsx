import { Button } from "@/components/ui/button";
import { Chrome } from "lucide-react";
import { useState } from "react";

export const SocialLogin = () => {
  const [isLoading] = useState(false);

  return (
    <div>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-400">Or</span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        className="w-full h-11 border-gray-300 gap-2"
        onClick={() => console.log("Google Login")}
        disabled={isLoading}
      >
        <Chrome className="size-5" />
        Log in with Google
      </Button>
    </div>
  );
};
