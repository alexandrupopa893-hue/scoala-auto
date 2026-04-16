"use server";

import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { clearDemoSession, setDemoSession } from "@/lib/auth/session";
import { demoUsers } from "@/lib/demo-tenant-data";
import { loginSchema } from "@/lib/validators";
import type { ActionResult } from "@/types";

export async function signInAction(input: { email: string; password: string }): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please enter a valid email and password."
    };
  }

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (!error) {
      return {
        success: true,
        message: "Welcome back."
      };
    }
  }

  const demoUser = demoUsers.find(
    (user) => user.email === parsed.data.email && user.password === parsed.data.password
  );

  if (!demoUser) {
    return {
      success: false,
      message: "Invalid credentials. Use one of the seeded demo accounts."
    };
  }

  await setDemoSession(demoUser.id);

  return {
    success: true,
    message: "Signed in with demo access."
  };
}

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  await clearDemoSession();
}
