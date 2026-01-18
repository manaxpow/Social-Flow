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
import { SocialLogin } from "../social.login";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { days, months, years } from "@/components/common/helpers/day.helper";
import type { RegisterRequest } from "@/services/auth/dtos/register/register.request";
import { authService } from "@/services/auth/auth.service";
import { toast } from "sonner";

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
      return Array.from({ length: 31 }, (_, i) => (i + 1).toString());
    }
    const daysInMonth = new Date(
      parseInt(selectedYear),
      parseInt(selectedMonth),
      0
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
        parseInt(values.dobDay)
      ),
      gender: values.gender,
    };

    const response = await authService.register(userCreate);

    if (response.status >= 200 && response.status < 300) {
      toast.success("Registration successful! Welcome to SocialFlow.");
      navigate("/auth/login");
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
    <div className="flex flex-col w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border mt-10">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Join SocialFlow</h1>
        <p className="text-gray-500 text-sm">It's quick and easy.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="First Name"
                      {...field}
                      className="bg-gray-50 h-10"
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
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Last Name"
                      {...field}
                      className="bg-gray-50 h-10"
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
          </div>

          {/* DATE OF BIRTH SECTION */}
          <div className="space-y-2">
            <FormLabel className="text-xs font-semibold text-gray-600">
              Date of Birth
            </FormLabel>
            <div className="grid grid-cols-3 gap-2 w-full">
              <FormField
                control={form.control}
                name="dobDay"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {days.map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* Hiển thị lỗi riêng cho Day (bao gồm lỗi Feb 31st từ refine) */}
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dobMonth"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {months.map((m, i) => (
                          <SelectItem key={m} value={(i + 1).toString()}>
                            {m}
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
                  <FormItem className="w-full">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-10 w-full">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {years.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* Hiển thị lỗi riêng cho Year (bao gồm lỗi tuổi < 13 từ refine) */}
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <FormLabel className="text-xs font-semibold text-gray-600">
              Gender
            </FormLabel>
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-2"
                    >
                      <div className="flex items-center justify-between border rounded-md px-3 h-10 bg-white hover:bg-gray-50 has-[:checked]:border-blue-500 transition-all">
                        <label
                          htmlFor="Female"
                          className="text-sm flex-1 cursor-pointer"
                        >
                          Female
                        </label>
                        <RadioGroupItem value="Female" id="Female" />
                      </div>
                      <div className="flex items-center justify-between border rounded-md px-3 h-10 bg-white hover:bg-gray-50 has-[:checked]:border-blue-500 transition-all">
                        <label
                          htmlFor="Male"
                          className="text-sm flex-1 cursor-pointer"
                        >
                          Male
                        </label>
                        <RadioGroupItem value="Male" id="Male" />
                      </div>
                      <div className="flex items-center justify-between border rounded-md px-3 h-10 bg-white hover:bg-gray-50 has-[:checked]:border-blue-500 transition-all">
                        <label
                          htmlFor="Other"
                          className="text-sm flex-1 cursor-pointer"
                        >
                          Other
                        </label>
                        <RadioGroupItem value="Other" id="Other" />
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Email"
                    {...field}
                    className="bg-gray-50 h-10"
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
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        {...field}
                        className="bg-gray-50 h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm"
                        {...field}
                        className="bg-gray-50 h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#00a400] hover:bg-[#008a00] text-white font-bold h-11"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Sign Up"}
          </Button>

          <SocialLogin />
          <div className="mt-4 pt-4 border-t text-center text-sm font-medium">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/auth/login")}
              className="text-blue-600 hover:underline transition-all"
            >
              Log In
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
