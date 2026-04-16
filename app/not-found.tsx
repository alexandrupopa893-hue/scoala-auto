import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="max-w-xl">
        <CardContent className="space-y-4 p-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">404</p>
          <h1 className="text-3xl font-semibold text-slate-950">Page not found</h1>
          <p className="text-sm leading-7 text-slate-500">
            The page you tried to open doesn&apos;t exist in this CRM workspace.
          </p>
          <Button asChild>
            <Link href="/dashboard">Return to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
