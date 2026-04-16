import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { demoUsers, getDemoOrganizationById } from "@/lib/demo-tenant-data";
import { createServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { AppUser, Organization } from "@/types";

const DEMO_COOKIE = "driveschool_demo_session";

export async function setDemoSession(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_COOKIE, userId, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24
  });
}

export async function clearDemoSession() {
  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE);
}

async function getSupabaseUser(): Promise<AppUser | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, phone, avatar_url, organization_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return null;
  }

  const { data: organization } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("id", profile.organization_id)
    .maybeSingle();

  if (!organization) {
    return null;
  }

  const { data: instructor } = await supabase
    .from("instructors")
    .select("id")
    .eq("profile_id", user.id)
    .eq("organization_id", profile.organization_id)
    .maybeSingle();

  const demoUser = demoUsers.find((entry) => entry.email === profile.email);

  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    role: profile.role,
    organizationId: demoUser?.organizationId ?? organization.id,
    organizationName: demoUser?.organizationName ?? organization.name,
    organizationSlug: demoUser?.organizationSlug ?? organization.slug,
    phone: profile.phone ?? undefined,
    avatarUrl: profile.avatar_url,
    instructorId: demoUser?.instructorId ?? instructor?.id ?? null
  };
}

async function getDemoUser(): Promise<AppUser | null> {
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(DEMO_COOKIE)?.value;
  return demoUsers.find((user) => user.id === sessionValue) ?? null;
}

export async function getCurrentUser() {
  return (await getSupabaseUser()) ?? (await getDemoUser());
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireCurrentOrganization(): Promise<Organization> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.organization_id) {
        const { data: organization } = await supabase
          .from("organizations")
          .select("id, name, slug, created_at, updated_at")
          .eq("id", profile.organization_id)
          .maybeSingle();

        if (organization) {
          return {
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            createdAt: organization.created_at,
            updatedAt: organization.updated_at
          };
        }
      }
    }
  }

  const user = await requireCurrentUser();
  const organization = getDemoOrganizationById(user.organizationId);

  if (!organization) {
    redirect("/login");
  }

  return organization;
}

export async function requireCurrentOrganizationId() {
  const user = await requireCurrentUser();
  return user.organizationId;
}

export async function redirectIfAuthenticated() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }
}
