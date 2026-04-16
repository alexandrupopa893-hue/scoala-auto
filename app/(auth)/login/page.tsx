import { CheckCircle2, ShieldCheck, Sparkles, TimerReset } from "lucide-react";

import { LoginForm } from "@/components/forms/login-form";
import { redirectIfAuthenticated } from "@/lib/auth/session";

const highlights = [
  {
    icon: ShieldCheck,
    title: "Role-aware operations",
    description: "Admins, office staff, and instructors each get the right surface."
  },
  {
    icon: TimerReset,
    title: "Less admin drag",
    description: "Schedule, documents, balances, and follow-ups are visible in one place."
  },
  {
    icon: Sparkles,
    title: "Demo-ready polish",
    description: "Seeded with realistic Romanian school data so presentations feel credible."
  }
];

export default async function LoginPage() {
  await redirectIfAuthenticated();

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr,0.9fr]">
      <div className="relative hidden overflow-hidden bg-slate-950 px-10 py-12 text-white lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.3),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.28),transparent_30%)]" />
        <div className="relative flex h-full max-w-2xl flex-col justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-teal-300">DriveFlow CRM</p>
            <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-tight text-balance">
              A premium operations system built for real driving schools.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Manage students, leads, instructors, payments, documents, reminders, and progress from one
              calm dashboard.
            </p>
          </div>

          <div className="space-y-4">
            {highlights.map((highlight) => {
              const Icon = highlight.icon;
              return (
                <div key={highlight.title} className="flex items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="rounded-2xl bg-white/10 p-3">
                    <Icon className="h-5 w-5 text-teal-300" />
                  </div>
                  <div>
                    <p className="font-semibold">{highlight.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{highlight.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-xl space-y-8">
          <div className="space-y-4 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700">
              <CheckCircle2 className="h-4 w-4" />
              Seeded demo accounts included
            </div>
            <div>
              <h2 className="text-4xl font-semibold tracking-tight text-slate-950">Welcome back</h2>
              <p className="mt-3 text-base text-slate-600">
                Sign in to review the school pipeline, upcoming lessons, and operational workload.
              </p>
            </div>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
