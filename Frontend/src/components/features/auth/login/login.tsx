import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginSchema, type LoginValues } from "@/lib/zod/auth/login.schema";
import { toast } from "sonner";
import { useAppDispatch } from "@/stores/hook";
import { loginAction } from "@/stores/auth/auth.slice";
import type { ErrorApiResponse } from "@/types/error.response";
import { authService } from "@/services/auth/auth.service";
import { AuthBrandPanel } from "@/components/features/auth/auth-brand-panel";
import { cn } from "@/lib/utils";
import mailIcon from "@/assets/auth/icon-mail.svg";
import lockIcon from "@/assets/auth/icon-lock.svg";

const REMEMBER_EMAIL_KEY = "socialflow:remember-email";

const fieldClassName =
  "h-11 rounded-lg border-brand-field-border bg-brand-field px-3 py-[9px] pl-[41px] text-sm text-brand-ink shadow-none placeholder:text-brand-subtle focus-visible:border-brand focus-visible:ring-brand/20";

const labelClassName =
  "text-sm font-semibold tracking-[0.14px] text-brand-muted";

export default function LoginPageComponent() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const from = location.state?.from || "/";

  useEffect(() => {
    const savedEmail = window.localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (savedEmail) {
      form.setValue("email", savedEmail);
      setRememberMe(true);
    }
  }, [form]);

  const persistRememberedEmail = (email: string) => {
    if (rememberMe) {
      window.localStorage.setItem(REMEMBER_EMAIL_KEY, email);
      return;
    }
    window.localStorage.removeItem(REMEMBER_EMAIL_KEY);
  };

  const onSubmit = async (values: LoginValues) => {
    persistRememberedEmail(values.email);

    const resultAction = await dispatch(loginAction(values));

    if (loginAction.fulfilled.match(resultAction)) {
      toast.success("Login successful!");
      navigate(from, { replace: true });
    }

    if (loginAction.rejected.match(resultAction)) {
      const errorData = resultAction.payload as ErrorApiResponse;
      const errorCode = errorData?.code;
      const remaining = errorData?.remainingAttempts;

      if (errorCode === "Auth.EmailNotConfirmed") {
        toast.error(
          errorData?.detail ?? "Please confirm your email before logging in.",
          {
            action: {
              label: "Resend email",
              onClick: async () => {
                const res = await authService.resendConfirmation(values.email);
                if (res.isSuccess) {
                  toast.success("Confirmation email sent! Check your inbox.");
                } else {
                  toast.error("Failed to send email. Please try again.");
                }
              },
            },
          },
        );
      } else if (remaining !== undefined) {
        toast.warning(`Login failed. ${remaining} attempts remaining.`);
      } else {
        toast.error(errorData?.detail ?? "Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="flex h-dvh w-full overflow-hidden font-manrope">
      <AuthBrandPanel />

      <section className="flex h-dvh w-full flex-col items-center justify-center overflow-y-auto bg-white px-8 py-8 lg:w-1/2">
        <div className="mb-6 text-center lg:hidden">
          <p className="text-2xl font-extrabold tracking-[-0.48px] text-brand-deep">
            SocialFlow
          </p>
        </div>

        <div className="relative flex w-full max-w-[420px] flex-col gap-6 rounded-xl border border-brand-line bg-white p-[33px] shadow-[0px_10px_15px_-3px_rgba(0,0,0,0.1),0px_4px_6px_-4px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-[32px] leading-10 font-bold tracking-[-0.32px] text-brand-ink">
              Welcome Back
            </h1>
            <p className="text-base text-brand-muted">
              Please enter your details to sign in.
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-6 pt-2"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="gap-1">
                    <FormLabel className={labelClassName}>Email</FormLabel>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <img
                          src={mailIcon}
                          alt=""
                          width={16.667}
                          height={13.333}
                          className="block h-[13.333px] w-[16.667px]"
                        />
                      </span>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          disabled={isLoading}
                          {...field}
                          className={fieldClassName}
                        />
                      </FormControl>
                    </div>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="gap-1">
                    <FormLabel className={labelClassName}>Password</FormLabel>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <img
                          src={lockIcon}
                          alt=""
                          width={13.333}
                          height={17.5}
                          className="block h-[17.5px] w-[13.333px]"
                        />
                      </span>
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          disabled={isLoading}
                          {...field}
                          className={cn(fieldClassName, "pr-11")}
                        />
                      </FormControl>
                      <button
                        type="button"
                        onClick={() => setShowPassword((open) => !open)}
                        className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center text-brand-subtle transition-colors hover:text-brand-ink"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <Eye className="size-5" />
                        ) : (
                          <EyeOff className="size-5" />
                        )}
                      </button>
                    </div>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="size-4 shrink-0 cursor-pointer rounded-[4px] border border-brand-field-border bg-brand-field accent-brand"
                  />
                  <span className="pl-2 text-xs font-medium tracking-[0.24px] text-brand-muted">
                    Remember me
                  </span>
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-xs font-semibold tracking-[0.24px] text-brand hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="h-auto w-full rounded-full bg-brand px-[17px] py-[13px] text-sm font-semibold tracking-[0.14px] text-white shadow-[0px_1px_1px_rgba(0,0,0,0.05)] hover:bg-brand/90"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : "Log In"}
              </Button>
            </form>
          </Form>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-brand-line" />
            </div>
            <span className="relative bg-white px-2 text-xs font-medium tracking-[0.24px] text-brand-subtle">
              OR
            </span>
          </div>

          <Button
            asChild
            variant="outline"
            className="h-auto w-full rounded-full border-brand-line bg-brand-soft px-[17px] py-[13px] text-sm font-semibold tracking-[0.14px] text-brand shadow-[0px_1px_1px_rgba(0,0,0,0.05)] hover:bg-brand-soft/80 hover:text-brand"
          >
            <Link to="/auth/register">Create New Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
