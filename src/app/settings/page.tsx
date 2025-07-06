"use client";

import { useQuery, useMutation, useConvex } from "convex/react";
import PageTransition from "@/components/PageTransition";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Doc } from "../../../convex/_generated/dataModel";

function SettingsContent({ currentUser }: { currentUser: Doc<"users"> }) {
  const logout = useMutation(api.users.logout);
  const router = useRouter();
  const convex = useConvex();

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm("Are you sure you want to log out?");
      if (!confirmed) return;
    }
    await logout();
    localStorage.removeItem("convex_auth_token");
    if (convex && typeof convex.setAuth === "function") await convex.setAuth(async () => null);
    router.push("/");
  };

  return (
    <div className="container mx-auto max-w-md px-4 py-8 flex flex-col items-center text-white">
      {/* Avatar */}
      <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-5xl mb-4">
        👤
      </div>
      {/* Username */}
      <h1 className="text-2xl font-semibold mb-8">{currentUser.username}</h1>

      {/* Actions */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="w-full py-3 px-4 bg-red-600 rounded-lg text-white font-medium shadow hover:bg-red-700 transition-colors"
        onClick={handleLogout}
      >
        Log Out
      </motion.button>
    </div>
  );
}

export default function SettingsPage() {
  const token = typeof window !== "undefined" ? localStorage.getItem("convex_auth_token") ?? undefined : undefined;
  const currentUser = useQuery(api.users.currentUser, { tokenIdentifier: token });
  const router = useRouter();

  useEffect(() => {
    if (currentUser === null) {
      router.push("/");
    }
  }, [currentUser, router]);

  if (currentUser === undefined) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (currentUser === null) {
    return (
      <div className="h-screen w-full flex items-center justify-center text-white">
        Redirecting...
      </div>
    );
  }

  return (
    <PageTransition>
      <SettingsContent currentUser={currentUser} />
    </PageTransition>
  );
}
