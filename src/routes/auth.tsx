import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Flame, LogIn } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Admin Login — Kitchen 86" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("kitchen86@gmail.com");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/auth" } });
        if (error) throw error;
        toast.success("Account created. Logging in...");
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("Welcome back 🔥");
      navigate({ to: "/admin" });
    } catch (e: any) {
      toast.error(e.message ?? "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-background p-4">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8">
        <Link to="/" className="flex items-center gap-2 justify-center mb-6">
          <span className="grid h-10 w-10 place-items-center rounded-lg fire-gradient"><Flame className="h-5 w-5 text-white" /></span>
          <span className="text-xl font-black">KITCHEN <span className="fire-text">86</span></span>
        </Link>
        <h1 className="text-2xl font-black text-center">{mode === "login" ? "Admin Login" : "Create Admin"}</h1>
        <p className="text-center text-sm text-muted-foreground mt-1">{mode === "login" ? "Sign in to manage the kitchen" : "Use kitchen86@gmail.com to register as admin"}</p>

        <form onSubmit={submit} className="mt-6 space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Email</label>
            <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full rounded-lg border border-border bg-[var(--secondary-bg)] px-3.5 py-2.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Password</label>
            <input type="password" required minLength={6} value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full rounded-lg border border-border bg-[var(--secondary-bg)] px-3.5 py-2.5 text-sm" />
          </div>
          <button disabled={loading} type="submit" className="w-full inline-flex justify-center items-center gap-2 rounded-xl fire-gradient px-5 py-3 text-sm font-black uppercase text-white disabled:opacity-50">
            <LogIn className="h-4 w-4" /> {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create & Sign In"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm">
          <button onClick={()=>setMode(mode==="login"?"signup":"login")} className="text-muted-foreground hover:text-foreground">
            {mode === "login" ? "First-time admin? Create account" : "Already have an account? Sign in"}
          </button>
        </div>
        <div className="mt-4 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Back to site</Link>
        </div>
      </div>
    </div>
  );
}
