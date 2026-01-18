import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CheckCircle2, XCircle, Eye, EyeOff } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

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
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/zod/auth/reset-password.schema";
import { authService } from "@/services/auth/auth.service";
import { toast } from "sonner";

export default function ResetPasswordPageComponent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Lấy userId và token từ URL
  const userId = searchParams.get("userId");
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"form" | "success" | "error">(() => {
    if (!userId || !token) return "error";
    return "form";
  });
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!userId || !token) {
      setStatus("error");
      return;
    }

    const res = await authService.resetPassword({
      userId,
      token,
      password: values.password,
    });

    if (res.isSuccess) {
      setStatus("success");
      toast.success("Mật khẩu đã được cập nhật!");
    } else {
      toast.error(res.error?.detail || "Không thể cập nhật mật khẩu.");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Cập nhật thành công!
            </h1>
            <p className="text-gray-500">
              Mật khẩu của bạn đã được thay đổi. Bây giờ bạn có thể đăng nhập
              vào SocialFlow bằng mật khẩu mới.
            </p>
          </div>
          <div className="pt-4">
            <Button
              onClick={() => navigate("/auth/login")}
              className="w-full bg-[#00a400] hover:bg-[#008a00]"
            >
              Đăng nhập ngay
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border text-center space-y-6">
          <div className="flex justify-center">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Link không hợp lệ
            </h1>
            <p className="text-gray-500">
              Mã xác thực đã hết hạn hoặc đường dẫn không đúng. Vui lòng yêu cầu
              một link lấy lại mật khẩu mới.
            </p>
          </div>
          <div className="pt-4">
            <Button
              onClick={() => navigate("/auth/forgot-password")}
              variant="outline"
              className="w-full"
            >
              Yêu cầu link mới
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            Thiết lập mật khẩu mới
          </h1>
          <p className="text-sm text-gray-500">
            Vui lòng nhập mật khẩu mới và xác nhận lại để hoàn tất.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Tối thiểu 8 ký tự"
                        {...field}
                        className="bg-gray-50 h-11 pr-10"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                  <FormLabel>Xác nhận mật khẩu</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Nhập lại mật khẩu mới"
                      {...field}
                      className="bg-gray-50 h-11"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className="text-[11px]" />
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
                  Đang cập nhật...
                </>
              ) : (
                "Xác nhận thay đổi"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
