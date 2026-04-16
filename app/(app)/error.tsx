"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
        <div className="rounded-3xl bg-rose-50 p-4 text-rose-600">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Something went wrong</h2>
          <p className="mt-2 max-w-lg text-sm text-slate-500">{error.message}</p>
        </div>
        <Button onClick={reset}>Try again</Button>
      </CardContent>
    </Card>
  );
}
