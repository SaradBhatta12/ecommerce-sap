import { hash, compare } from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// Multi-tenant functionality removed

// Hash password for secure storage
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12);
}

// Compare password with stored hash
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await compare(password, hashedPassword);
}



// Get current session with error handling
export async function getCurrentSession() {
  try {
    const session = await getServerSession(authOptions);
    return session;
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated() {
  const session = await getCurrentSession();
  return !!session;
}

// Check if user is admin
export async function isAdmin() {
  const session = await getCurrentSession();
  return session?.user?.role === "admin";
}



// Get current user ID
export async function getCurrentUserId() {
  const session = await getCurrentSession();
  return session?.user?.id;
}

// Create or update tenant user association
// Multi-tenant functionality removed - createOrUpdateTenantUser function disabled

// Multi-tenant functionality removed - all tenant user functions disabled
