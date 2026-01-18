import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth/auth.service";

export default function ConfirmEmailPageComponent() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const navigate = useNavigate();

  useEffect(() => {
    const confirmEmail = async () => {
      const userId = searchParams.get("userId");
      const token = searchParams.get("token");
      console.log(userId, token);

      if (!userId || !token) {
        setStatus("error");
        return;
      }

      const res = await authService.confirmEmail({ userId, token });
      if (res.isSuccess) setStatus("success");
      else setStatus("error");
    };

    confirmEmail();
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border text-center space-y-6">
        <div className="flex justify-center">
          {status === "loading" && (
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
          )}
          {status === "success" && (
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          )}
          {status === "error" && <XCircle className="h-16 w-16 text-red-500" />}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">
            {status === "loading" && "Đang xác thực email..."}
            {status === "success" && "Xác thực thành công!"}
            {status === "error" && "Xác thực thất bại"}
          </h1>
          <p className="text-gray-500">
            {status === "loading" &&
              "Vui lòng đợi trong giây lát, chúng tôi đang kiểm tra mã xác nhận của bạn."}
            {status === "success" &&
              "Chúc mừng! Email của bạn đã được xác minh. Bây giờ bạn có thể trải nghiệm SocialFlow."}
            {status === "error" &&
              "Mã xác nhận đã hết hạn hoặc không hợp lệ. Vui lòng kiểm tra lại link hoặc yêu cầu gửi lại email mới."}
          </p>
        </div>

        <div className="pt-4">
          {status === "success" ? (
            <Button
              onClick={() => navigate("/auth/login")}
              className="w-full bg-[#00a400] hover:bg-[#008a00]"
            >
              Đăng nhập ngay
            </Button>
          ) : (
            <Button
              onClick={() => navigate("/auth/register")}
              variant="outline"
              className="w-full"
            >
              Quay lại trang đăng ký
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
