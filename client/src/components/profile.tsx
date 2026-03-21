import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronRight, Plus, X, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/replit-auth";
import type { User as UserType } from "@shared/schema";

const NAVY = "#03045e";
const CYAN = "#00b4d8";

function SectionLabel({ label, action }: { label: string; action?: { text: string; onClick: () => void } }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px", marginBottom: "8px", marginTop: "4px" }}>
      <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{label}</span>
      {action && (
        <button
          onClick={action.onClick}
          style={{ background: "none", border: "none", cursor: "pointer", color: CYAN, fontSize: "14px", fontWeight: 600, padding: "2px 0", display: "flex", alignItems: "center", gap: "3px" }}
        >
          <Plus size={14} color={CYAN} />
          {action.text}
        </button>
      )}
    </div>
  );
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "#ffffff", borderRadius: "14px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", marginBottom: "20px" }}>
      {children}
    </div>
  );
}

function SettingsRow({
  label,
  value,
  subtitle,
  chevron,
  onClick,
  last,
}: {
  label: string;
  value?: string;
  subtitle?: string;
  chevron?: boolean;
  onClick?: () => void;
  last?: boolean;
}) {
  return (
    <>
      <button
        onClick={onClick}
        disabled={!onClick}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "15px 16px",
          background: "none",
          border: "none",
          cursor: onClick ? "pointer" : "default",
          textAlign: "left",
          minHeight: "unset",
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: 500, color: "#111827" }}>{label}</div>
          {subtitle && <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "2px" }}>{subtitle}</div>}
        </div>
        {value && <span style={{ fontSize: "14px", color: "#9ca3af", marginLeft: "12px", flexShrink: 0 }}>{value}</span>}
        {chevron && <ChevronRight size={16} color="#d1d5db" style={{ marginLeft: "8px", flexShrink: 0 }} />}
      </button>
      {!last && <div style={{ height: "1px", backgroundColor: "#f3f4f6", marginLeft: "16px" }} />}
    </>
  );
}

function EditSheet({
  open,
  onClose,
  title,
  children,
  onSave,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  saving?: boolean;
}) {
  if (!open) return null;
  return (
    <div>
      <div
        style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 60 }}
        onClick={onClose}
      />
      <div style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "480px",
        backgroundColor: "#ffffff",
        borderRadius: "20px 20px 0 0",
        zIndex: 61,
        paddingBottom: "env(safe-area-inset-bottom, 24px)",
      }}>
        <div style={{ display: "flex", justifyContent: "center", paddingTop: "12px" }}>
          <div style={{ width: "36px", height: "4px", borderRadius: "2px", backgroundColor: "#e5e7eb" }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px" }}>
          <span style={{ fontSize: "17px", fontWeight: 700, color: "#111827" }}>{title}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "4px" }}>
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: "0 20px 20px" }}>
          {children}
          <button
            onClick={onSave}
            disabled={saving}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: saving ? "#9ca3af" : NAVY,
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer",
              marginTop: "16px",
            }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SheetInput({ label, value, onChange, placeholder, type = "text" }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={{ fontSize: "12px", fontWeight: 500, color: "#6b7280", display: "block", marginBottom: "6px" }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          height: "48px",
          fontSize: "16px",
          padding: "12px 14px",
          border: "1.5px solid #e5e7eb",
          borderRadius: "10px",
          backgroundColor: "#fafafa",
          color: "#111827",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

type EditModal = "name" | "password" | "taxRate" | "homeAddress" | "businessInfo" | "addGigType" | "addClient" | null;

export default function Profile({ onDemoComplete, isActive, onStartDemo }: { onDemoComplete?: () => void; isActive?: boolean; onStartDemo?: () => void }) {
  const { toast } = useToast();
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  const [editModal, setEditModal] = useState<EditModal>(null);

  // Field state for each edit modal
  const [editName, setEditName] = useState("");
  const [editOldPassword, setEditOldPassword] = useState("");
  const [editNewPassword, setEditNewPassword] = useState("");
  const [editConfirmPassword, setEditConfirmPassword] = useState("");
  const [editTaxRate, setEditTaxRate] = useState("");
  const [editHomeAddress, setEditHomeAddress] = useState("");
  const [editBusinessName, setEditBusinessName] = useState("");
  const [editBusinessAddress, setEditBusinessAddress] = useState("");
  const [editBusinessPhone, setEditBusinessPhone] = useState("");
  const [editBusinessEmail, setEditBusinessEmail] = useState("");
  const [newGigType, setNewGigType] = useState("");
  const [newClientName, setNewClientName] = useState("");

  const { data: user, refetch: refetchUser } = useQuery<UserType>({
    queryKey: ["/api/user"],
  });

  // Smart refetch when profile tab becomes active — invalidate only if cache is actually stale
  useEffect(() => {
    if (!isActive) return;
    const STALE_TIME = 5 * 60 * 1000; // matches global default staleTime
    const state = queryClient.getQueryState(["/api/user"]);
    if (!state?.dataUpdatedAt || Date.now() - state.dataUpdatedAt > STALE_TIME) {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    }
  }, [isActive]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<UserType>) => {
      const response = await apiRequest("PUT", "/api/user", userData);
      return response.json();
    },
    onSuccess: async (data) => {
      queryClient.removeQueries({ queryKey: ["/api/user"] });
      queryClient.setQueryData(["/api/user"], data);
      await refetchUser();
      toast({ title: "Saved", description: "Your profile has been updated." });
      setEditModal(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    },
  });

  const openEdit = (modal: EditModal) => {
    if (modal === "name") setEditName(user?.name || "");
    if (modal === "taxRate") setEditTaxRate(String(user?.defaultTaxPercentage ?? 23));
    if (modal === "homeAddress") setEditHomeAddress(user?.homeAddress || "");
    if (modal === "businessInfo") {
      setEditBusinessName(user?.businessName || "");
      setEditBusinessAddress(user?.businessAddress || "");
      setEditBusinessPhone(user?.businessPhone || "");
      setEditBusinessEmail(user?.businessEmail || "");
    }
    if (modal === "password") {
      setEditOldPassword("");
      setEditNewPassword("");
      setEditConfirmPassword("");
    }
    if (modal === "addGigType") setNewGigType("");
    if (modal === "addClient") setNewClientName("");
    setEditModal(modal);
  };

  const saveName = () => {
    if (!editName.trim()) return;
    updateUserMutation.mutate({ name: editName.trim() });
  };

  const savePassword = async () => {
    if (!editNewPassword || editNewPassword !== editConfirmPassword) {
      toast({ title: "Error", description: "Passwords don't match.", variant: "destructive" });
      return;
    }
    try {
      await apiRequest("POST", "/api/auth/change-password", {
        oldPassword: editOldPassword,
        newPassword: editNewPassword,
      });
      toast({ title: "Password updated", description: "Your password has been changed." });
      setEditModal(null);
    } catch {
      toast({ title: "Error", description: "Failed to change password.", variant: "destructive" });
    }
  };

  const saveTaxRate = () => {
    const val = parseInt(editTaxRate);
    if (isNaN(val) || val < 0 || val > 100) {
      toast({ title: "Invalid", description: "Tax rate must be 0–100.", variant: "destructive" });
      return;
    }
    updateUserMutation.mutate({ defaultTaxPercentage: val });
  };

  const saveHomeAddress = () => {
    updateUserMutation.mutate({ homeAddress: editHomeAddress });
  };

  const saveBusinessInfo = () => {
    updateUserMutation.mutate({
      businessName: editBusinessName,
      businessAddress: editBusinessAddress,
      businessPhone: editBusinessPhone,
      businessEmail: editBusinessEmail,
    });
  };

  const handleAddGigType = () => {
    if (!newGigType.trim()) return;
    const currentTypes = user?.customGigTypes || [];
    if (currentTypes.includes(newGigType.trim())) {
      toast({ title: "Duplicate", description: "This gig type already exists.", variant: "destructive" });
      return;
    }
    updateUserMutation.mutate({ customGigTypes: [...currentTypes, newGigType.trim()] });
  };

  const handleRemoveGigType = (gigType: string) => {
    const currentTypes = user?.customGigTypes || [];
    updateUserMutation.mutate({ customGigTypes: currentTypes.filter(t => t !== gigType) });
  };

  const preferredClients: string[] = (user?.workPreferences as any)?.preferredClients || [];

  const handleAddClient = () => {
    if (!newClientName.trim()) return;
    if (preferredClients.includes(newClientName.trim())) {
      toast({ title: "Duplicate", description: "This client already exists.", variant: "destructive" });
      return;
    }
    updateUserMutation.mutate({
      workPreferences: { ...(user?.workPreferences as any || {}), preferredClients: [...preferredClients, newClientName.trim()] },
    });
  };

  const handleRemoveClient = (client: string) => {
    updateUserMutation.mutate({
      workPreferences: { ...(user?.workPreferences as any || {}), preferredClients: preferredClients.filter(c => c !== client) },
    });
  };

  if (!user) {
    return (
      <div style={{ padding: "16px", backgroundColor: "#f5f7f5", minHeight: "100vh" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: "80px", borderRadius: "14px", backgroundColor: "#e5e7eb", animation: "pulse 1.5s infinite" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px", paddingBottom: "120px", backgroundColor: "#f5f7f5", minHeight: "100vh" }}>
      {/* Page Title */}
      <div style={{ marginBottom: "24px", paddingTop: "4px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 700, color: "#111827", margin: 0, lineHeight: 1.2 }}>Settings</h1>
        <p style={{ fontSize: "14px", color: "#9ca3af", margin: "4px 0 0" }}>Manage your account and preferences</p>
      </div>

      {/* Account Settings */}
      <SectionLabel label="Account Settings" />
      <SettingsCard>
        <SettingsRow
          label="Name"
          value={user.name || "Not set"}
          onClick={() => openEdit("name")}
        />
        <SettingsRow
          label="Email"
          value={user.email}
        />
        <SettingsRow
          label="Change Password"
          chevron
          onClick={() => openEdit("password")}
          last
        />
      </SettingsCard>

      {/* Tax & Business */}
      <SectionLabel label="Tax & Business" />
      <SettingsCard>
        <SettingsRow
          label="Default Tax Rate"
          value={`${user.defaultTaxPercentage ?? 23}%`}
          onClick={() => openEdit("taxRate")}
        />
        <SettingsRow
          label="Home Address"
          subtitle="Used for mileage calculations"
          chevron
          onClick={() => openEdit("homeAddress")}
        />
        <SettingsRow
          label="Business Information"
          subtitle="Name, address, phone"
          chevron
          onClick={() => openEdit("businessInfo")}
          last
        />
      </SettingsCard>

      {/* Gig Types */}
      <SectionLabel label="Your Gig Types" action={{ text: "Add", onClick: () => openEdit("addGigType") }} />
      <SettingsCard>
        {user.customGigTypes && user.customGigTypes.length > 0 ? (
          user.customGigTypes.map((gigType, index) => (
            <div key={index}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" }}>
                <span style={{ fontSize: "15px", fontWeight: 500, color: "#111827" }}>{gigType}</span>
                <button
                  onClick={() => handleRemoveGigType(gigType)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "4px", display: "flex", alignItems: "center" }}
                >
                  <X size={16} />
                </button>
              </div>
              {index < user.customGigTypes!.length - 1 && (
                <div style={{ height: "1px", backgroundColor: "#f3f4f6", marginLeft: "16px" }} />
              )}
            </div>
          ))
        ) : (
          <div style={{ padding: "24px 16px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>No gig types added yet</p>
            <button
              onClick={() => openEdit("addGigType")}
              style={{ marginTop: "12px", color: CYAN, background: "none", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
            >
              + Add your first gig type
            </button>
          </div>
        )}
      </SettingsCard>

      {/* Preferred Clients */}
      <SectionLabel label="Preferred Clients" action={{ text: "Add", onClick: () => openEdit("addClient") }} />
      <SettingsCard>
        {preferredClients.length > 0 ? (
          preferredClients.map((client, index) => (
            <div key={index}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px" }}>
                <span style={{ fontSize: "15px", fontWeight: 500, color: "#111827" }}>{client}</span>
                <button
                  onClick={() => handleRemoveClient(client)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", padding: "4px", display: "flex", alignItems: "center" }}
                >
                  <X size={16} />
                </button>
              </div>
              {index < preferredClients.length - 1 && (
                <div style={{ height: "1px", backgroundColor: "#f3f4f6", marginLeft: "16px" }} />
              )}
            </div>
          ))
        ) : (
          <div style={{ padding: "24px 16px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "#9ca3af", margin: 0 }}>No clients added yet</p>
            <button
              onClick={() => openEdit("addClient")}
              style={{ marginTop: "12px", color: CYAN, background: "none", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600 }}
            >
              + Add your first client
            </button>
          </div>
        )}
      </SettingsCard>

      {/* Sign Out */}
      <SettingsCard>
        <SettingsRow
          label="Sign Out"
          onClick={() => logout()}
          last
        />
      </SettingsCard>

      {user?.email === 'haleylilla@gmail.com' && (
        <div style={{ marginBottom: "16px" }}>
          <button
            onClick={() => onStartDemo?.()}
            style={{ width: "100%", padding: "14px", backgroundColor: "#ffffff", color: "#6b7280", border: "1px solid #e5e7eb", borderRadius: "14px", fontSize: "14px", cursor: "pointer" }}
          >
            Demo Onboarding
          </button>
        </div>
      )}

      {/* Edit Name Sheet */}
      <EditSheet open={editModal === "name"} onClose={() => setEditModal(null)} title="Edit Name" onSave={saveName} saving={updateUserMutation.isPending}>
        <SheetInput label="Full Name" value={editName} onChange={setEditName} placeholder="Your full name" />
      </EditSheet>

      {/* Change Password Sheet */}
      <EditSheet open={editModal === "password"} onClose={() => setEditModal(null)} title="Change Password" onSave={savePassword}>
        <SheetInput label="Current Password" type="password" value={editOldPassword} onChange={setEditOldPassword} placeholder="Enter current password" />
        <SheetInput label="New Password" type="password" value={editNewPassword} onChange={setEditNewPassword} placeholder="Enter new password" />
        <SheetInput label="Confirm New Password" type="password" value={editConfirmPassword} onChange={setEditConfirmPassword} placeholder="Confirm new password" />
      </EditSheet>

      {/* Tax Rate Sheet */}
      <EditSheet open={editModal === "taxRate"} onClose={() => setEditModal(null)} title="Default Tax Rate" onSave={saveTaxRate} saving={updateUserMutation.isPending}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ fontSize: "48px", fontWeight: 700, color: NAVY }}>{editTaxRate || 0}%</div>
        </div>
        <input
          type="range"
          min={0}
          max={50}
          step={1}
          value={editTaxRate}
          onChange={(e) => setEditTaxRate(e.target.value)}
          style={{ width: "100%", accentColor: CYAN }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
          <span>0%</span>
          <span>50%</span>
        </div>
        <div style={{ marginTop: "14px", padding: "12px", backgroundColor: "#fffbeb", borderRadius: "10px", border: "1px solid #fde68a" }}>
          <p style={{ fontSize: "12px", color: "#92400e", margin: 0 }}>
            ⚠️ This is your personal estimate. Bookd does not provide tax advice. Consult a tax professional for your accurate rate.
          </p>
        </div>
      </EditSheet>

      {/* Home Address Sheet */}
      <EditSheet open={editModal === "homeAddress"} onClose={() => setEditModal(null)} title="Home Address" onSave={saveHomeAddress} saving={updateUserMutation.isPending}>
        <SheetInput label="Home Address" value={editHomeAddress} onChange={setEditHomeAddress} placeholder="123 Main St, City, State 12345" />
        <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "-6px" }}>Used as starting point for mileage calculations</p>
      </EditSheet>

      {/* Business Info Sheet */}
      <EditSheet open={editModal === "businessInfo"} onClose={() => setEditModal(null)} title="Business Information" onSave={saveBusinessInfo} saving={updateUserMutation.isPending}>
        <SheetInput label="Business Name" value={editBusinessName} onChange={setEditBusinessName} placeholder="Your business or freelance name" />
        <SheetInput label="Business Address" value={editBusinessAddress} onChange={setEditBusinessAddress} placeholder="Business address" />
        <SheetInput label="Business Phone" value={editBusinessPhone} onChange={setEditBusinessPhone} placeholder="(555) 123-4567" />
        <SheetInput label="Business Email" type="email" value={editBusinessEmail} onChange={setEditBusinessEmail} placeholder="business@example.com" />
        <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "-6px" }}>Used in your income reports and tax documents</p>
      </EditSheet>

      {/* Add Gig Type Sheet */}
      <EditSheet open={editModal === "addGigType"} onClose={() => setEditModal(null)} title="Add Gig Type" onSave={handleAddGigType} saving={updateUserMutation.isPending}>
        <SheetInput label="Gig Type Name" value={newGigType} onChange={setNewGigType} placeholder="e.g., Brand Ambassador, Photographer…" />
      </EditSheet>

      {/* Add Client Sheet */}
      <EditSheet open={editModal === "addClient"} onClose={() => setEditModal(null)} title="Add Client" onSave={handleAddClient} saving={updateUserMutation.isPending}>
        <SheetInput label="Client Name" value={newClientName} onChange={setNewClientName} placeholder="e.g., ABC Agency, John Smith…" />
      </EditSheet>
    </div>
  );
}
