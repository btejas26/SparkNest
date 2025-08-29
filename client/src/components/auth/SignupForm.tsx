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

const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onSuccess: (userData: SignupFormData) => void;
  onError: (error: string) => void;
}

export default function SignupForm({ onSwitchToLogin, onSuccess, onError }: SignupFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      await signup(data);
      onSuccess(data);
    } catch (error: any) {
      onError(error.message || "Signup failed");
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
      <h2 className="text-2xl font-semibold mb-6 text-center">Create Account</h2>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              placeholder="John"
              {...form.register("firstName")}
              data-testid="input-firstname"
              className="mt-2"
            />
            {form.formState.errors.firstName && (
              <p className="text-destructive text-sm mt-1">
                {form.formState.errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              {...form.register("lastName")}
              data-testid="input-lastname"
              className="mt-2"
            />
            {form.formState.errors.lastName && (
              <p className="text-destructive text-sm mt-1">
                {form.formState.errors.lastName.message}
              </p>
            )}
          </div>
        </div>
        
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            {...form.register("email")}
            data-testid="input-signup-email"
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
            placeholder="Create a strong password"
            {...form.register("password")}
            data-testid="input-signup-password"
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
          data-testid="button-send-otp"
        >
          {isLoading ? "Sending OTP..." : "Send OTP"}
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
        data-testid="button-google-signup"
      >
        <FaGoogle className="mr-2 h-4 w-4 text-red-500" />
        Sign up with Google
      </Button>

      <p className="text-center mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Button 
          variant="link" 
          className="p-0 h-auto text-primary hover:underline"
          onClick={onSwitchToLogin}
          data-testid="link-signin"
        >
          Sign in
        </Button>
      </p>
    </div>
  );
}
