import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Profound Platform
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            AI Visibility Analytics
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track your brand visibility across AI search engines like ChatGPT, Perplexity, Google AI, and Microsoft Copilot
          </p>
        </div>

        <div className="flex gap-4 justify-center flex-col sm:flex-row">
          <Button asChild size="lg">
            <Link href="/auth/login">
              Sign In
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/signup">
              Get Started
            </Link>
          </Button>
        </div>

        <div className="pt-12 space-y-4">
          <h2 className="text-2xl font-semibold">Phase 2 Complete</h2>
          <div className="grid gap-4 md:grid-cols-3 text-left">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Supabase Auth integration with sign up/sign in pages
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">User Management</h3>
              <p className="text-sm text-muted-foreground">
                Protected routes and user profile management
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Role-Based Access</h3>
              <p className="text-sm text-muted-foreground">
                Organization management with role-based permissions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
