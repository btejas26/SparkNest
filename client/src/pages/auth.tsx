import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import OTPForm from "@/components/auth/OTPForm";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Feather } from "lucide-react";

type AuthView = "login" | "signup" | "otp";

export default function AuthPage() {
  const [view, setView] = useState<AuthView>("login");
  const [signupData, setSignupData] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSignupSuccess = (userData: any) => {
    setSignupData(userData);
    setView("otp");
    setError("");
  };

  const handleOTPSuccess = () => {
    setLocation("/dashboard");
  };

  const clearError = () => setError("");

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-accent/10"
      data-testid="auth-page"
    >
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Feather className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to SparkNest</h1>
          <p className="text-muted-foreground">Your intelligent note-taking companion</p>
        </div>

        {/* Auth Form Container */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            {view === "login" && (
              <LoginForm 
                onSwitchToSignup={() => {
                  setView("signup");
                  clearError();
                }}
                onError={setError}
              />
            )}
            
            {view === "signup" && (
              <SignupForm 
                onSwitchToLogin={() => {
                  setView("login");
                  clearError();
                }}
                onSuccess={handleSignupSuccess}
                onError={setError}
              />
            )}
            
            {view === "otp" && signupData && (
              <OTPForm 
                email={signupData.email}
                userData={signupData}
                onSuccess={handleOTPSuccess}
                onError={setError}
                onBack={() => {
                  setView("signup");
                  clearError();
                }}
              />
            )}

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
