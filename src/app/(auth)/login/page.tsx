import { LoginButton } from "@/components/auth/login-button";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex flex-col gap-8">
        <h1 className="text-4xl font-bold text-center">Welcome to TicketVerse</h1>
        <p className="text-center text-gray-600">
          Sign in to access your secure wallet and tickets.
        </p>
        <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-100">
          <LoginButton />
        </div>
      </div>
    </div>
  );
}
