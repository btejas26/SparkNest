import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FaGoogle } from "react-icons/fa";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onError: (error: string) => void;
}

export default function LoginForm({ onSwitchToSignup, onError }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await login(data.email, data.password);
    } catch (error: any) {
      onError(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    // TODO: Implement Google OAuth
    onError("Google authentication not yet implemented");
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-center">Sign In</h2>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...form.register("email")}
            data-testid="input-email"
            className="mt-2"
          />
          {form.formState.errors.email && (
            <p className="text-destructive text-sm mt-1">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
        
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            {...form.register("password")}
            data-testid="input-password"
            className="mt-2"
          />
          {form.formState.errors.password && (
            <p className="text-destructive text-sm mt-1">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
          data-testid="button-signin"
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
      </form>

      <div className="flex items-center my-6">
        <Separator className="flex-1" />
        <span className="px-4 text-muted-foreground text-sm">or</span>
        <Separator className="flex-1" />
      </div>

      <Button 
        variant="outline" 
        className="w-full"
        onClick={handleGoogleAuth}
        data-testid="button-google-signin"
      >
        <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
        Continue with Google
      </Button>

      <p className="text-center mt-6 text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Button 
          variant="link" 
          className="p-0 h-auto text-primary hover:underline"
          onClick={onSwitchToSignup}
          data-testid="link-signup"
        >
          Sign up
        </Button>
      </p>
    </div>
  );
}
