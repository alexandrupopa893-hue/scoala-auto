"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";

import { signInAction } from "@/actions/auth";
import { demoUsers } from "@/lib/demo-tenant-data";
import { loginSchema } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: demoUsers[0].email,
      password: demoUsers[0].password
    }
  });

  const demoShortcuts = [
    { label: "Admin", email: demoUsers[0].email, password: demoUsers[0].password },
    { label: "Office", email: demoUsers[1].email, password: demoUsers[1].password },
    { label: "Instructor", email: demoUsers[2].email, password: demoUsers[2].password }
  ];

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <p className="text-sm text-slate-500">
          Use seeded demo accounts or connect Supabase Auth to sign in with real users.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {demoShortcuts.map((shortcut) => (
            <button
              key={shortcut.label}
              type="button"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:border-teal-200 hover:bg-white"
              onClick={() => {
                setValue("email", shortcut.email);
                setValue("password", shortcut.password);
              }}
            >
              <p className="font-medium text-slate-950">{shortcut.label}</p>
              <p className="mt-1 text-xs text-slate-500">{shortcut.email}</p>
            </button>
          ))}
        </div>

        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) =>
            startTransition(async () => {
              const result = await signInAction(values);
              if (result.success) {
                toast.success(result.message);
                router.push("/dashboard");
                router.refresh();
              } else {
                toast.error(result.message);
              }
            })
          )}
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email ? <p className="text-sm text-rose-600">{errors.email.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password ? <p className="text-sm text-rose-600">{errors.password.message}</p> : null}
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Signing in..." : "Continue to dashboard"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
