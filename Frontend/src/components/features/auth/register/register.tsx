import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Eye, EyeOff } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  registerSchema,
  type RegisterValues,
} from "@/lib/zod/auth/register.schema";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { days, months, years } from "@/components/common/helpers/day.helper";
import type { RegisterRequest } from "@/services/auth/dtos/register/register.request";
import { authService } from "@/services/auth/auth.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AuthBrandPanel } from "@/components/features/auth/auth-brand-panel";

const fieldClassName =
  "h-10 rounded-md border-brand-input-border bg-white px-3.5 text-sm text-brand-ink shadow-none placeholder:text-brand-placeholder focus-visible:border-brand focus-visible:ring-brand/20";

const labelClassName =
  "text-xs font-medium tracking-[0.24px] text-brand-muted";

const selectClassName =
  "h-10 w-full rounded-md border-brand-input-border bg-white px-3 text-sm text-brand-ink shadow-none data-[placeholder]:text-brand-ink focus-visible:border-brand focus-visible:ring-brand/20 [&_svg]:size-5 [&_svg]:opacity-100 [&_svg]:text-brand-muted";

const genderOptions = [
  { label: "Female", value: "Female" },
  { label: "Male", value: "Male" },
  { label: "Other", value: "Other" },
] as const;

export default function RegisterPageComponent() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      dobDay: "",
      dobMonth: "",
      dobYear: "",
      gender: "Female",
    },
  });

  const navigate = useNavigate();
  const isLoading = form.formState.isSubmitting;

  const selectedMonth = form.watch("dobMonth");
  const selectedYear = form.watch("dobYear");
  const selectedDay = form.watch("dobDay");

  const availableDays = useMemo(() => {
    if (!selectedMonth || !selectedYear) {
      return days;
    }
    const daysInMonth = new Date(
      parseInt(selectedYear),
      parseInt(selectedMonth),
      0,
    ).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (selectedDay && !availableDays.includes(selectedDay)) {
      form.setValue("dobDay", "");
      form.setError("dobDay", { message: "Invalid day" });
    }
  }, [availableDays, selectedDay, form]);

  const onSubmit = async (values: RegisterValues) => {
    const userCreate: RegisterRequest = {
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      dateOfBirth: new Date(
        parseInt(values.dobYear),
        parseInt(values.dobMonth) - 1,
        parseInt(values.dobDay),
      ),
      gender: values.gender,
    };

    const response = await authService.register(userCreate);

    if (response.status >= 200 && response.status < 300) {
      toast.success(
        "Registration successful! Please check your email to confirm your account.",
      );
      setTimeout(() => {
        navigate("/auth/login");
      }, 2000);
    } else {
      const serverError = response.error;
      if (serverError?.errors) {
        Object.keys(serverError.errors).forEach((key) => {
          form.setError(key as keyof RegisterValues, {
            type: "server",
            message: serverError.errors![key][0],
          });
        });
        toast.error(serverError.detail);
      } else {
        toast.error(serverError?.detail || "Registration failed.");
      }
    }
  };

  return (
    <div className="flex h-dvh w-full overflow-hidden font-manrope">
      <AuthBrandPanel />

      <section className="flex h-dvh w-full flex-col items-center justify-safe-center overflow-y-auto bg-white px-4 py-5 sm:px-8 lg:w-1/2 lg:px-12 lg:py-6">
        <div className="mb-4 shrink-0 text-center lg:hidden">
          <p className="text-xl font-extrabold tracking-[-0.4px] text-brand-deep">
            SocialFlow
          </p>
        </div>

        <div className="flex w-full max-w-[400px] shrink-0 flex-col gap-5">
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-[28px] leading-8 font-bold tracking-[-0.28px] text-brand-ink">
              Join SocialFlow
            </h1>
            <p className="text-sm text-brand-muted">It's quick and easy.</p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-3.5"
            >
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="gap-1">
                      <FormLabel className={labelClassName}>First Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Jane"
                          autoComplete="given-name"
                          disabled={isLoading}
                          {...field}
                          className={fieldClassName}
                        />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="gap-1">
                      <FormLabel className={labelClassName}>Last Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Doe"
                          autoComplete="family-name"
                          disabled={isLoading}
                          {...field}
                          className={fieldClassName}
                        />
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-1">
                <FormLabel className={labelClassName}>Date of Birth</FormLabel>
                <div className="grid grid-cols-3 gap-2">
                  <FormField
                    control={form.control}
                    name="dobMonth"
                    render={({ field }) => (
                      <FormItem className="w-full gap-1">
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger
                              aria-label="Month"
                              className={selectClassName}
                            >
                              <SelectValue placeholder="Month" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {months.map((month, index) => (
                              <SelectItem
                                key={month}
                                value={(index + 1).toString()}
                              >
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dobDay"
                    render={({ field }) => (
                      <FormItem className="w-full gap-1">
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger
                              aria-label="Day"
                              className={selectClassName}
                            >
                              <SelectValue placeholder="Day" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableDays.map((day) => (
                              <SelectItem key={day} value={day}>
                                {day}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dobYear"
                    render={({ field }) => (
                      <FormItem className="w-full gap-1">
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger
                              aria-label="Year"
                              className={selectClassName}
                            >
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {years.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="gap-2">
                    <FormLabel className={labelClassName}>Gender</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="grid grid-cols-3 gap-3"
                        disabled={isLoading}
                      >
                        {genderOptions.map((option) => (
                          <label
                            key={option.value}
                            htmlFor={`gender-${option.value}`}
                            className={cn(
                              "flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-brand-line px-px py-2 text-sm font-semibold tracking-[0.14px] text-brand-muted transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/30",
                              field.value === option.value &&
                                "border-brand bg-brand-soft text-brand",
                            )}
                          >
                            {option.label}
                            <RadioGroupItem
                              id={`gender-${option.value}`}
                              value={option.value}
                              className="sr-only"
                            />
                          </label>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="gap-1">
                    <FormLabel className={labelClassName}>
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="jane@example.com"
                        autoComplete="email"
                        disabled={isLoading}
                        {...field}
                        className={fieldClassName}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="gap-1">
                      <FormLabel className={labelClassName}>Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            disabled={isLoading}
                            {...field}
                            className={cn(fieldClassName, "pr-11")}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() => setShowPassword((open) => !open)}
                          className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center text-brand-muted transition-colors hover:text-brand-ink"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <Eye className="size-[18px]" />
                          ) : (
                            <EyeOff className="size-[18px]" />
                          )}
                        </button>
                      </div>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="gap-1">
                      <FormLabel className={labelClassName}>Confirm</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            disabled={isLoading}
                            {...field}
                            className={cn(fieldClassName, "pr-11")}
                          />
                        </FormControl>
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((open) => !open)
                          }
                          className="absolute top-1/2 right-3 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center text-brand-muted transition-colors hover:text-brand-ink"
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                          disabled={isLoading}
                        >
                          {showConfirmPassword ? (
                            <Eye className="size-[18px]" />
                          ) : (
                            <EyeOff className="size-[18px]" />
                          )}
                        </button>
                      </div>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </div>

              <p className="text-xs font-medium tracking-[0.24px] text-brand-subtle">
                By clicking Create Account, you agree to our Terms and Data
                Policy.
              </p>

              <Button
                type="submit"
                className="h-11 w-full rounded-full bg-brand text-sm font-semibold tracking-[0.14px] text-white shadow-[0px_4px_6px_-1px_rgba(0,67,139,0.2),0px_2px_4px_-2px_rgba(0,67,139,0.2)] hover:bg-brand/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </Form>

          <div className="flex items-center justify-center border-t border-brand-line pt-4 text-center">
            <p className="text-sm text-brand-muted">
              Already have an account?{" "}
            </p>
            <Link
              to="/auth/login"
              className="text-sm font-semibold tracking-[0.14px] text-brand hover:underline"
            >
              Log In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
