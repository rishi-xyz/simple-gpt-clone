"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { auth, signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

// ---------- Auth ----------

export async function login(_prev: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    // Wrong email/password → show an error message.
    // Anything else (like the redirect after success) must be re-thrown.
    if (error instanceof AuthError) return "Invalid email or password";
    throw error;
  }
}

const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function register(_prev: string | undefined, formData: FormData) {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return parsed.error.issues[0].message;

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return "An account with this email already exists";

  await prisma.user.create({
    data: { name, email, password: await bcrypt.hash(password, 10) },
  });

  // Log the new user in right away
  await signIn("credentials", { email, password, redirectTo: "/" });
}

export async function loginWithGitHub() {
  await signIn("github", { redirectTo: "/" });
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

// ---------- Chats ----------

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user.id;
}

export async function deleteChat(chatId: string) {
  const userId = await getUserId();
  // deleteMany with userId makes sure you can only delete your own chats
  await prisma.chat.deleteMany({ where: { id: chatId, userId } });
  revalidatePath("/", "layout");
}
