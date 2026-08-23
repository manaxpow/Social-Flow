import { cn } from "@/lib/utils";
import hawaiianBg from "@/assets/auth-register-hawaiian.png";

interface AuthBrandPanelProps {
  className?: string;
}

export function AuthBrandPanel({ className }: Readonly<AuthBrandPanelProps>) {
  return (
    <aside
      className={cn(
        "relative hidden h-dvh overflow-hidden bg-brand-soft lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:px-10 lg:py-12",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <img
          src={hawaiianBg}
          alt=""
          width={343}
          height={512}
          className="absolute inset-0 size-full max-w-none object-fill"
        />
      </div>

      <div className="relative flex w-full max-w-[400px] flex-col items-center text-center">
        <p className="font-manrope text-4xl leading-10 font-extrabold tracking-[-0.04em] text-brand-deep">
          SocialFlow
        </p>
        <h2 className="mt-4 font-manrope text-4xl leading-10 font-extrabold tracking-[-0.04em] text-brand-deep">
          Connect with your
          <br />
          community.
        </h2>
        <p className="mt-5 max-w-[20.5rem] font-manrope text-base leading-7 text-brand-teal/90">
          Experience a calmer, more focused way to share your moments and ideas
          with the people who matter.
        </p>
      </div>
    </aside>
  );
}
