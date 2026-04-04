import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Building2, User, Mail, Phone, MapPin, Globe, ChevronRight, ChevronLeft, Check, Webhook, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const STEPS = ["Business Info", "Dealer Details", "Delivery Preferences"];

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [form, setForm] = useState({
    dealershipName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    password: "",
    businessType: "independent",
    province: "",
    heardAbout: "",
    webhookUrl: "",
    webhookSecret: "",
    notificationEmail: "",
  });

  const updateField = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const canNext = () => {
    if (step === 0) return form.dealershipName && form.contactPerson && form.email && form.phone && form.address && form.password;
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create account");

      const { error: dealerError } = await supabase.from("dealers").insert({
        user_id: authData.user.id,
        dealership_name: form.dealershipName,
        contact_person: form.contactPerson,
        email: form.email,
        phone: form.phone,
        address: form.address,
        website: form.website || null,
        business_type: form.businessType,
        province: form.province || null,
        webhook_url: form.webhookUrl || null,
        webhook_secret: form.webhookSecret || null,
        notification_email: form.notificationEmail || form.email,
      });
      if (dealerError) throw dealerError;

      setShowConfirmation(true);
    } catch (error: any) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#0F1729" }}>
        <div className="glass-card p-10 max-w-md text-center glow-blue">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">Application Submitted!</h2>
          <p className="text-muted-foreground mb-6">
            Your application is under review. We'll notify you by email once approved.
          </p>
          <Button onClick={() => navigate("/login")} className="w-full" style={{ background: "linear-gradient(135deg, hsl(217,91%,60%), hsl(192,91%,42%))" }}>
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: "#0F1729" }}>
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:inline ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < step ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <div className="glass-card p-8 glow-blue border border-primary/20">
          <h2 className="text-2xl font-bold text-foreground mb-6">{STEPS[step]}</h2>

          {step === 0 && (
            <div className="space-y-4">
              <IconInput icon={Building2} placeholder="Dealership Name *" value={form.dealershipName} onChange={(v) => updateField("dealershipName", v)} />
              <IconInput icon={User} placeholder="Contact Person *" value={form.contactPerson} onChange={(v) => updateField("contactPerson", v)} />
              <IconInput icon={Mail} type="email" placeholder="Email *" value={form.email} onChange={(v) => updateField("email", v)} />
              <IconInput icon={Phone} placeholder="Phone *" value={form.phone} onChange={(v) => updateField("phone", v)} />
              <IconInput icon={MapPin} placeholder="Business Address *" value={form.address} onChange={(v) => updateField("address", v)} />
              <IconInput icon={Globe} placeholder="Website (optional)" value={form.website} onChange={(v) => updateField("website", v)} />
              <div className="relative">
                <Input type="password" placeholder="Create Password *" value={form.password} onChange={(e) => updateField("password", e.target.value)} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground" required />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Dealer Type</label>
                <Select value={form.businessType} onValueChange={(v) => updateField("businessType", v)}>
                  <SelectTrigger className="bg-muted/50 border-border text-foreground"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="independent">Independent</SelectItem>
                    <SelectItem value="franchise">Franchise</SelectItem>
                    <SelectItem value="subprime">Subprime</SelectItem>
                    <SelectItem value="finance">Finance-Focused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Province / State</label>
                <Input placeholder="e.g., Ontario, California" value={form.province} onChange={(e) => updateField("province", e.target.value)} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">How did you hear about us?</label>
                <Input placeholder="Optional" value={form.heardAbout} onChange={(e) => updateField("heardAbout", e.target.value)} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <IconInput icon={Webhook} placeholder="CRM Webhook URL (optional)" value={form.webhookUrl} onChange={(v) => updateField("webhookUrl", v)} />
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Webhook Secret (optional)</label>
                <Input type="password" placeholder="Webhook Secret" value={form.webhookSecret} onChange={(e) => updateField("webhookSecret", e.target.value)} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground" />
              </div>
              <IconInput icon={Bell} placeholder={`Notification Email (default: ${form.email})`} value={form.notificationEmail} onChange={(v) => updateField("notificationEmail", v)} />
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} className="border-border text-foreground">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
            )}
            <div className="flex-1" />
            {step < 2 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canNext()} style={{ background: "linear-gradient(135deg, hsl(217,91%,60%), hsl(192,91%,42%))" }}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading} style={{ background: "linear-gradient(135deg, hsl(217,91%,60%), hsl(192,91%,42%))" }}>
                {loading ? "Submitting..." : "Submit Application"}
              </Button>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const IconInput = ({ icon: Icon, placeholder, value, onChange, type = "text" }: { icon: any; placeholder: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <div className="relative">
    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
    <Input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="pl-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground" />
  </div>
);

export default Register;
