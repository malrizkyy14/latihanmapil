"use server";

import { redirect } from "next/navigation";
import {
  clearSession,
  isAuthSecretConfigured,
  requireSession,
  setSession,
  verifyUser,
} from "./lib/auth";

export async function loginAction(formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");

  if (
    typeof username !== "string" ||
    typeof password !== "string" ||
    !username.trim() ||
    !password
  ) {
    redirect("/login?error=invalid");
  }

  if (!isAuthSecretConfigured()) redirect("/login?error=setup");

  let user;
  try {
    user = await verifyUser(username.trim(), password);
  } catch (error) {
    console.error("Login gagal:", error);
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_NO_SUCH_TABLE"
    ) {
      redirect("/login?error=setup");
    }
    redirect("/login?error=unavailable");
  }

  if (!user) redirect("/login?error=invalid");

  await setSession(user);
  redirect("/");
}

export async function logoutAction() {
  await requireSession();
  await clearSession();
  redirect("/login");
}
