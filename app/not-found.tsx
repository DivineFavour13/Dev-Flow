import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-background">
      <p className="text-7xl font-bold text-foreground/10 mb-4">404</p>
      <h1 className="text-xl font-semibold text-foreground mb-2">
        Page not found
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        The page you&apos;re looking for doesn&apos;t exist or was moved.
      </p>
      <Button size="sm">
        <Link href="/dashboard">Go to dashboard</Link>
      </Button>
    </div>
  );
}