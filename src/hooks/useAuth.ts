import { useAction, useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Doc } from "../../convex/_generated/dataModel";

export const useAuth = () => {
  const signup = useAction(api.users.signup);
  const login = useAction(api.users.login);
  const convex = useConvex();

  const handleAuth = async (values: any, type: "login" | "signup") => {
    const user: Doc<"users"> | null =
      type === "login" ? await login(values) : await signup(values);

                if (!user) {
      throw new Error(`Failed to ${type}. Please try again.`);
    }

    localStorage.setItem("convex_auth_token", user.tokenIdentifier);
    await convex.setAuth(async () => user.tokenIdentifier);






  };

  return { handleAuth };
};
