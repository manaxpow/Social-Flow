import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";

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
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/zod/auth/forgot-password.schema";
import { authService } from "@/services/auth/auth.service";
import { toast } from "sonner";
import { AuthBrandPanel } from "@/components/features/auth/auth-brand-panel";
import backIcon from "@/assets/auth/icon-back.svg";
import mailIcon from "@/assets/auth/icon-mail-forgot.svg";

const fieldClassName =
  "h-auto rounded-lg border-brand-field-border bg-white py-2.5 pr-[17px] pl-[41px] text-base text-brand-ink shadow-none placeholder:text-brand-subtle focus-visible:border-brand focus-visible:ring-brand/20 md:text-base";

const labelClassName = "text-xs font-medium tracking-[0.24px] text-brand-ink";

export default function ForgotPasswordPageComponent() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const isLoading = form.formState.isSubmitting;
  const submittedEmail = form.getValues("email");

  const onSubmit = async (values: ForgotPasswordValues) => {
    const response = await authService.forgotPassword(values.email);
    if (response.isSuccess) {
      toast.success("We've sent a password reset link to your email.");
      setIsSubmitted(true);
      return;
    }

    toast.error(response.error?.detail ?? "Something went wrong.");
  };

  return (
    <div className="flex h-dvh w-full overflow-hidden font-manrope">
      <AuthBrandPanel />

      <section className="flex h-dvh w-full flex-col items-center justify-center overflow-y-auto bg-brand-field px-8 py-8 lg:w-1/2">
        <div className="mb-6 text-center lg:hidden">
          <p className="text-2xl font-extrabold tracking-[-0.48px] text-brand-deep">
            SocialFlow
          </p>
        </div>

        <div className="flex w-full max-w-[440px] flex-col gap-2">
          <Link
            to="/auth/login"
            className="inline-flex w-fit items-center gap-1 text-sm font-semibold tracking-[0.14px] text-brand-muted transition-colors hover:text-brand-ink"
          >
            <img
              src={backIcon}
              alt=""
              width={16}
              height={16}
              className="block size-4"
            />
            Back to Login
          </Link>

          {isSubmitted ? (
            <>
              <h1 className="pt-4 text-[32px] leading-10 font-bold tracking-[-0.32px] text-brand-ink">
                Check your email
              </h1>
              <p className="text-base leading-6 text-brand-muted">
                We&apos;ve sent a password reset link to{" "}
                <span className="font-medium text-brand-ink">
                  {submittedEmail}
                </span>
                .
              </p>
              <div className="pt-6">
                <Button
                  asChild
                  className="h-auto w-full rounded-full bg-brand px-6 py-2 text-sm font-semibold tracking-[0.14px] text-white shadow-[0px_1px_1px_rgba(0,67,139,0.1)] hover:bg-brand/90"
                >
                  <Link to="/auth/login">Back to Login</Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="pt-4 text-[32px] leading-10 font-bold tracking-[-0.32px] text-brand-ink">
                Forgot Password?
              </h1>
              <p className="text-base leading-6 text-brand-muted">
                Enter your email and we&apos;ll send you a password reset link.
              </p>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="flex flex-col gap-6 pt-6"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="gap-1">
                        <FormLabel className={labelClassName}>
                          Email Address
                        </FormLabel>
                        <div className="relative">
                          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                            <img
                              src={mailIcon}
                              alt=""
                              width={20}
                              height={16}
                              className="block h-4 w-5"
                            />
                          </span>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="name@company.com"
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

                  <Button
                    type="submit"
                    className="h-auto w-full rounded-full bg-brand px-6 py-2 text-sm font-semibold tracking-[0.14px] text-white shadow-[0px_1px_1px_rgba(0,67,139,0.1)] hover:bg-brand/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              </Form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
