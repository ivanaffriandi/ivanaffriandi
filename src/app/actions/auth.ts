"use server";

import { cookies } from "next/headers";

// Sistem Autentikasi Backend Tertutup (Anti-Hack)
export async function loginWithPassword(password: string) {
  // Hanya password ini yang diizinkan
  if (password === "1Ndrowatu!") {
    const cookieStore = await cookies();
    cookieStore.set("admin_session", "authenticated_ivan_exclusive", {
      httpOnly: true, // Tidak bisa diakses oleh JavaScript klien (mencegah XSS)
      secure: process.env.NODE_ENV === "production", // Wajib HTTPS di produksi
      sameSite: "strict", // Mencegah serangan CSRF
      maxAge: 60 * 60 * 24 * 7, // Sesi aktif selama 7 hari
      path: "/",
    });
    return { success: true };
  }
  
  // Jika gagal, sistem tidak memberi tahu apa yang salah untuk membingungkan peretas
  return { success: false, error: "Akses Ditolak." };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  return { success: true };
}

export async function checkAuthStatus() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "authenticated_ivan_exclusive";
}
