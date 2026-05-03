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
  FormMessage,
} from "@/components/ui/form";
import { loginSchema, type LoginValues } from "@/lib/zod/auth/login.schema";
import { SocialLogin } from "../social.login";
import { useState } from "react";
import { toast } from "sonner";
import { useAppDispatch } from "@/stores/hook";
import { loginAction } from "@/stores/auth/auth.slice";
import type { ErrorApiResponse } from "@/types/error.response";
import { authService } from "@/services/auth/auth.service";

export default function LoginPageComponent() {
  const [showPassword, setShowPassword] = useState(false);

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

  // Get the path the user was trying to access
  // Default to "/" (root) like Facebook - root route will redirect authenticated users to feed
  const from = location.state?.from || "/";

  const onSubmit = async (values: LoginValues) => {
    const resultAction = await dispatch(loginAction(values));

    if (loginAction.fulfilled.match(resultAction)) {
      toast.success("Login successful!");
      // Navigate to the page the user was trying to access, or default to feed
      navigate(from, { replace: true });
    }

    if (loginAction.rejected.match(resultAction)) {
      const errorData = resultAction.payload as ErrorApiResponse;
      const errorCode = errorData?.code;
      const remaining = errorData?.remainingAttempts;

      if (errorCode === "Auth.EmailNotConfirmed") {
        toast.error(errorData?.detail ?? "Please confirm your email before logging in.", {
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
        });
      } else if (remaining !== undefined) {
        toast.warning(`Login failed. ${remaining} attempts remaining.`);
      } else {
        toast.error(errorData?.detail ?? "Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border my-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tighter text-primary">
          SocialFlow
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back! Please login to your account.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormControl>
                  <Input
                    placeholder="Email address"
                    {...field}
                    className="bg-gray-50 h-11"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          {/* Password Field - CẬP NHẬT TẠI ĐÂY */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1">
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      {...field}
                      className="bg-gray-50 h-11 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-[11px]" />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Link
              to="/auth/forgot-password"
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11 shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Log In"}
          </Button>
          <SocialLogin />

          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/auth/register"
                className="text-blue-600 font-bold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}
