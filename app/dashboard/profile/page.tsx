// app/dashboard/profile/page.tsx
import React from "react";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";

/**
 * IMPORTANT:
 * - Adjust these import paths if your helpers live elsewhere.
 * - I used "@/app/api/lib/auth" and "@/app/api/lib/dbv0" because you showed both earlier.
 */
import { getAuthUser } from "@/app/api/lib/auth"; // server helper that reads httpOnly cookie (server side)
import { getUsersCollection } from "@/lib/db";

import ProfileCard from "./ProfileCard"; // client component (below) - same folder

// Server component for the page — Next.js expects a default export component here.
export default async function ProfilePage() {
  // 1) Get authenticated payload from server helper (reads httpOnly cookie)
  const auth = await getAuthUser();

  // 2) Not authenticated? redirect to login page
  if (!auth || !auth.userId) {
    // you can also return a friendly server-side message instead of redirect
    redirect("/login");
  }

  // 3) Fetch user document from DB (server-side)
  let userDoc = null
  try {
    const users = await getUsersCollection();
    const oid = ObjectId.isValid(auth.userId) ? new ObjectId(auth.userId) : null;
    userDoc = oid ? await users.findOne({ _id: oid }) : null;
  } catch (err: any) {
    console.error("Profile page server error:", err);
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold">Profile</h1>
        <p className="text-sm text-red-600 mt-4">Failed to load profile. Try again later.</p>
      </div>
    );
  }

  if (!userDoc) {
    // user not found — show a simple message (or redirect)
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold">Profile</h1>
        <p className="text-sm text-red-600 mt-4">User not found. Please contact support.</p>
      </div>
    );
  }

  // 4) Normalize the user data we pass to the client component (stringify _id)
  const user = {
    id: userDoc._id.toString(),
    firstName: userDoc.firstName ?? "",
    lastName: userDoc.lastName ?? "",
    email: userDoc.email ?? "",
    phone: userDoc.phone ?? "",
    location: userDoc.location ?? "",
    bio: userDoc.bio ?? "",
    company: userDoc.company ?? "",
    specialization: userDoc.specialization ?? "",
    avatar: userDoc.avatar ?? null, // could be a data URL or image path
    role: userDoc.role ?? "user",
  };

  // 5) Render client profile card and pass the user as props
  // ProfileCard is a client component that accepts `user` prop
  return <ProfileCard user={user} />;
}
