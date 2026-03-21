import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { X, Loader2, Send, ChevronDown } from "lucide-react";
import type { User } from "@shared/schema";

const NAVY = "#03045E";
const AQUA = "#00B4D8";

const supportFormSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  category: z.enum(["bug", "feature", "account", "billing", "general"]),
  message: z.string().min(10, "Please provide more details (at least 10 characters)"),
  urgency: z.enum(["low", "medium", "high"]).default("medium"),
});

type SupportFormData = z.infer<typeof supportFormSchema>;

interface ContactSupportProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { value: "general", label: "General Question" },
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "account", label: "Account Issue" },
  { value: "billing", label: "Billing Question" },
];

function fieldStyle(focused: boolean, err?: boolean) {
  return {
    width: "100%",
    border: `1.5px solid ${err ? "#ef4444" : focused ? AQUA : "#e5e7eb"}`,
    borderRadius: 12,
    padding: "13px 14px",
    fontSize: 14,
    fontFamily: "'Montserrat', sans-serif",
    color: NAVY,
    background: "#fff",
    outline: "none",
    boxSizing: "border-box" as const,
    transition: "border-color 0.15s",
  };
}

function labelStyle(focused: boolean, err?: boolean) {
  return {
    display: "block" as const,
    fontSize: 11,
    fontWeight: 700 as const,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    color: err ? "#ef4444" : focused ? AQUA : "#9ca3af",
    marginBottom: 6,
    fontFamily: "'Montserrat', sans-serif",
    transition: "color 0.15s",
  };
}

export default function ContactSupport({ open, onClose }: ContactSupportProps) {
  const { toast } = useToast();
  const [catFocused, setCatFocused] = useState(false);
  const [subFocused, setSubFocused] = useState(false);
  const [msgFocused, setMsgFocused] = useState(false);

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    staleTime: 5 * 60 * 1000,
  });

  const form = useForm<SupportFormData>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: { subject: "", category: "general", message: "", urgency: "medium" },
  });

  useEffect(() => {
    if (open) form.reset();
  }, [open]);

  const sendSupportMessage = useMutation({
    mutationFn: async (data: SupportFormData) => apiRequest("POST", "/api/support/contact", data),
    onSuccess: () => {
      toast({ title: "Message Sent", description: "We'll get back to you soon!" });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Failed to Send",
        description: "Please try again or email haleylilla@gmail.com directly.",
        variant: "destructive",
      });
    },
  });

  if (!open) return null;

  const errs = form.formState.errors;
  const isPending = sendSupportMessage.isPending;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", flexDirection: "column",
      background: "#f5f6fa",
      paddingTop: "env(safe-area-inset-top, 0px)",
      fontFamily: "'Montserrat', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        background: NAVY,
        padding: "20px 20px 24px",
        paddingTop: "max(20px, env(safe-area-inset-top, 20px))",
        flexShrink: 0,
        position: "relative",
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "max(16px, env(safe-area-inset-top, 16px))", right: 16,
            width: 34, height: 34, borderRadius: "50%",
            background: "rgba(255,255,255,0.12)", border: "none",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <X size={16} color="#fff" />
        </button>

        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: AQUA, margin: "0 0 6px", fontFamily: "'Montserrat', sans-serif" }}>
          We're here to help
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, fontFamily: "'Poppins', sans-serif", lineHeight: 1.2 }}>
          Contact Support
        </h1>
        {user && (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: "8px 0 0", fontFamily: "'Montserrat', sans-serif" }}>
            Sending as <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>{user.email}</span>
          </p>
        )}
      </div>

      {/* Form */}
      <div style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain", padding: "24px 20px 0" }}>
        <form onSubmit={form.handleSubmit((d) => sendSupportMessage.mutate(d))}>

          {/* Category */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle(catFocused, !!errs.category)}>Category</label>
            <div style={{ position: "relative" }}>
              <select
                {...form.register("category")}
                onFocus={() => setCatFocused(true)}
                onBlur={() => setCatFocused(false)}
                style={{ ...fieldStyle(catFocused, !!errs.category), appearance: "none", paddingRight: 36, cursor: "pointer" }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <ChevronDown size={15} color="#9ca3af" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
            </div>
            {errs.category && <p style={{ fontSize: 11, color: "#ef4444", margin: "4px 0 0 2px" }}>{errs.category.message}</p>}
          </div>

          {/* Subject */}
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle(subFocused, !!errs.subject)}>Subject</label>
            <input
              {...form.register("subject")}
              placeholder="Brief description of your issue"
              onFocus={() => setSubFocused(true)}
              onBlur={() => setSubFocused(false)}
              style={fieldStyle(subFocused, !!errs.subject)}
            />
            {errs.subject && <p style={{ fontSize: 11, color: "#ef4444", margin: "4px 0 0 2px" }}>{errs.subject.message}</p>}
          </div>

          {/* Message */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle(msgFocused, !!errs.message)}>Message</label>
            <textarea
              {...form.register("message")}
              placeholder="Please describe your issue in detail. Include any steps to reproduce or specific questions you have."
              onFocus={() => setMsgFocused(true)}
              onBlur={() => setMsgFocused(false)}
              rows={5}
              style={{ ...fieldStyle(msgFocused, !!errs.message), resize: "none", lineHeight: 1.6 }}
            />
            {errs.message && <p style={{ fontSize: 11, color: "#ef4444", margin: "4px 0 0 2px" }}>{errs.message.message}</p>}
          </div>

          {/* Direct email note */}
          <div style={{
            background: "#EAF9FF", borderRadius: 12, padding: "12px 14px",
            marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 8,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: AQUA, marginTop: 5, flexShrink: 0 }} />
            <p style={{ fontSize: 12, color: "#374151", margin: 0, lineHeight: 1.5 }}>
              Need immediate help? Email us directly at{" "}
              <a href="mailto:haleylilla@gmail.com" style={{ color: AQUA, fontWeight: 700, textDecoration: "none" }}>
                haleylilla@gmail.com
              </a>
            </p>
          </div>
        </form>
      </div>

      {/* Pinned CTA */}
      <div style={{
        padding: "12px 20px",
        paddingBottom: "max(24px, env(safe-area-inset-bottom, 24px))",
        background: "#f5f6fa",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}>
        <button
          onClick={form.handleSubmit((d) => sendSupportMessage.mutate(d))}
          disabled={isPending}
          style={{
            width: "100%", background: isPending ? "#e5e7eb" : NAVY,
            border: "none", borderRadius: 100, padding: "15px 20px",
            cursor: isPending ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            boxShadow: isPending ? "none" : "0 4px 16px rgba(3,4,94,0.22)",
            transition: "all 0.2s",
          }}
        >
          {isPending ? (
            <Loader2 size={16} color="#9ca3af" style={{ animation: "spin 1s linear infinite" }} />
          ) : (
            <Send size={15} color="#fff" />
          )}
          <span style={{ fontSize: 15, fontWeight: 700, color: isPending ? "#9ca3af" : "#fff", fontFamily: "'Poppins', sans-serif" }}>
            {isPending ? "Sending…" : "Send Message"}
          </span>
        </button>

        <button
          onClick={onClose}
          style={{
            width: "100%", background: "none", border: "none",
            color: "#9ca3af", fontSize: 13, cursor: "pointer",
            padding: "6px", textAlign: "center", fontFamily: "'Montserrat', sans-serif",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
