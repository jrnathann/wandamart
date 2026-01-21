import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { headers, cookies } from "next/headers";

/**
 * Throws a NextResponse with 403 if the user is not an admin.
 * Returns the session if admin.
 */
export async function requireAdmin() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    return session;
}