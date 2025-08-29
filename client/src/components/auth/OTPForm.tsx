import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

const otpSchema = z.object({
  code: z.string().length(6, "OTP must be 6 digits"),
});

type OTPFormData = z.infer<typeof otpSchema>;

interface OTPFormProps {
  email: string;
  userData: any;
  onSuccess: () => void;
  onError: (error: string) => void;
  onBack: () => void;
}

export default function OTPForm({ email, userData, onSuccess, onError, onBack }: OTPFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { verifyOTP, resendOTP } = useAuth();
  
  const form = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: OTPFormData) => {
    setIsLoading(true);
    try {
      await verifyOTP(email, data.code, userData);
      onSuccess();
    } catch (error: any) {
      onError(error.message || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      await resendOTP(userData);
      onError(""); // Clear any existing errors
      // You might want to show a success message here
    } catch (error: any) {
      onError(error.message || "Failed to resend OTP");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack}
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-semibold">Verify Your Email</h2>
      </div>
      
      <p className="text-center text-muted-foreground mb-6">
        We've sent a verification code to{" "}
        <span className="font-medium" data-testid="text-email">{email}</span>
      </p>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="code">Enter 6-digit code</Label>
          <Input
            id="code"
            maxLength={6}
            placeholder="000000"
            {...form.register("code")}
            data-testid="input-otp"
            className="mt-2 text-center text-2xl tracking-widest"
          />
          {form.formState.errors.code && (
            <p className="text-destructive text-sm mt-1">
              {form.formState.errors.code.message}
            </p>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
          data-testid="button-verify"
        >
          {isLoading ? "Verifying..." : "Verify Code"}
        </Button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-muted-foreground">
          Didn't receive the code?{" "}
          <Button 
            variant="link" 
            className="p-0 h-auto text-primary hover:underline"
            onClick={handleResendOTP}
            disabled={isResending}
            data-testid="button-resend"
          >
            {isResending ? "Resending..." : "Resend"}
          </Button>
        </p>
      </div>
    </div>
  );
}
