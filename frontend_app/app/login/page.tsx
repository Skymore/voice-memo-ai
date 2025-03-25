import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div
        className="w-full max-w-md space-y-6 bg-card p-8 rounded-xl shadow-lg"
        style={{ marginBottom: '150px' }}
      >
        <h2 className="text-3xl font-bold text-center text-foreground">
          Log in to your account
        </h2>
        <AuthForm />
      </div>
    </div>
  );
}