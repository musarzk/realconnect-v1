// anywhere in client code (Navigation component)
import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();

  async function logout() {
    try {
      // call API to clear cookie
      const res = await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
      // always clear localStorage token as well (if you store it there)
      try {
        localStorage.removeItem("token");
      } catch (e) {
        // ignore (not available in some contexts)
      }
      // redirect to homepage/login
      if (res.ok) {
        router.push("/");
      } else {
        // still push home so cookie cleared client-side best-effort
        router.push("/");
      }
    } catch (err) {
      console.error("Logout failed", err);
      try {
        localStorage.removeItem("token");
      } catch {}
      router.push("/");
    }
  }

  return { logout };
}
