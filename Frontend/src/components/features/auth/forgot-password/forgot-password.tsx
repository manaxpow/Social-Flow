import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

export default function ForgotPasswordPageComponent() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: ForgotPasswordValues) => {
    const response = await authService.forgotPassword(values.email);
    if (response.isSuccess) {
      toast.success("We've sent a password reset link to your email.");
    } else {
      toast.error(response.error?.detail ?? "Something went wrong.");
    }
    setIsSubmitted(true);
    return;
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col w-full max-w-md mx-auto p-8 bg-white rounded-lg shadow-md border mt-20 text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Check your email</h2>
        <p className="text-gray-500 mb-6">
          We've sent a password reset link to <br />
          <span className="font-medium text-gray-900">
            {form.getValues("email")}
          </span>
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate("/auth/login")}
        >
          Back to Log In
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border mt-20">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6 w-fit"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold">Forgot Password?</h1>
        <p className="text-gray-500 text-sm">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Email Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    {...field}
                    className="bg-gray-50 h-11"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-8 pt-6 border-t text-center">
        <p className="text-sm text-gray-600">
          Remember your password?{" "}
          <button
            type="button"
            onClick={() => navigate("/auth/login")}
            className="text-blue-600 font-bold hover:underline"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  );
}
