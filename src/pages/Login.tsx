import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Crosshair, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Check dealer status
      const { data: dealer } = await supabase
        .from("dealers")
        .select("approval_status")
        .eq("user_id", data.user.id)
        .single();

      // Check if admin
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);

      const isAdmin = roles?.some((r: any) => r.role === "admin");

      if (isAdmin) {
        navigate("/admin");
      } else if (!dealer) {
        navigate("/pending");
      } else {
        switch (dealer.approval_status) {
          case "approved": navigate("/dashboard"); break;
          case "pending": navigate("/pending"); break;
          case "rejected": navigate("/rejected"); break;
          case "suspended": navigate("/suspended"); break;
          default: navigate("/pending");
        }
      }
    } catch (error: any) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const trustBadges = [
    { icon: Crosshair, label: "PREMIUM", sub: "Verified Leads" },
    { icon: Zap, label: "FAST", sub: "Instant Access" },
    { icon: ShieldCheck, label: "TRUSTED", sub: "Quality Buyers" },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ backgroundColor: "#0F1729" }}>
      {/* Left Brand Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-16 relative overflow-hidden">
        {/* Starfield dots */}
        <div className="absolute inset-0 overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-foreground/20"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.1,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center max-w-lg">
          <div className="mb-8">
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight">
              <span className="gradient-blue-cyan bg-clip-text text-transparent" style={{ WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", background: "linear-gradient(135deg, hsl(263,70%,66%), hsl(192,91%,42%))" }}>
                MayaX
              </span>
            </h1>
            <p className="text-xl font-semibold tracking-[0.3em] text-muted-foreground mt-1">LEAD HUB</p>
          </div>

          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
            Buy Verified Auto Leads Instantly
          </h2>
          <p className="text-muted-foreground mb-12 leading-relaxed">
            AI-verified buyers. Real income. Real intent. Delivered directly to your CRM.
          </p>

          <div className="flex flex-wrap justify-center gap-6">
            {trustBadges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-3 glass-card px-4 py-3">
                <badge.icon className="w-5 h-5 text-primary" />
                <div className="text-left">
                  <p className="text-xs font-bold text-primary">{badge.label}</p>
                  <p className="text-xs text-muted-foreground">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Login Section */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-16">
        <div className="w-full max-w-md glass-card p-8 glow-blue border border-primary/20">
          <h3 className="text-2xl font-bold text-foreground text-center mb-2">Sign In or Create Account</h3>
          <p className="text-muted-foreground text-center text-sm mb-8">Access your dealer dashboard</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-base font-semibold rounded-lg"
              style={{ background: "linear-gradient(135deg, hsl(217,91%,60%), hsl(192,91%,42%))" }}
            >
              {loading ? "Signing in..." : "Login to Dashboard"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-border" />
            <span className="px-4 text-sm text-muted-foreground">OR</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <Button
            variant="outline"
            className="w-full h-12 text-base border-border text-foreground hover:bg-muted"
            onClick={() => navigate("/register")}
          >
            Create Dealer Account
          </Button>

          <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span className="text-xs">TRUSTED Quality Buyers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
