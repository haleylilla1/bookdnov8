import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, DollarSign, Edit2, Trash2 } from "lucide-react";
import type { Gig } from "@shared/schema";

const CYAN = "#00b4d8";
const GREEN = "#10b981";
const NAVY = "#03045e";

function statusPill(status: string) {
  const s = status?.toLowerCase() ?? "";
  if (s === "completed") return { bg: "#d1fae5", color: "#065f46", label: "Completed" };
  if (s === "upcoming") return { bg: "#e0f2fe", color: "#0369a1", label: "Upcoming" };
  return { bg: "#fff7ed", color: "#c2410c", label: "Pending Payment" };
}

interface DayGigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date | null;
  gigs: Gig[];
  groupedGigs: (Gig & { isMultiDay?: boolean; gigIds?: number[] })[];
  onGotPaid: (gig: Gig) => void;
  onEdit: (gig: Gig) => void;
  onDelete: (gigId: number, gigIds?: number[]) => void;
  isDeleting: boolean;
}

export default function DayGigDialog({
  open,
  onOpenChange,
  selectedDate,
  gigs,
  groupedGigs,
  onGotPaid,
  onEdit,
  onDelete,
  isDeleting,
}: DayGigDialogProps) {
  const dateLabel = selectedDate?.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ maxWidth: "480px", borderRadius: "24px", padding: "24px", border: "none" }}>
        <DialogHeader>
          <DialogTitle style={{ fontSize: "20px", fontWeight: 700, color: "#111111" }}>
            {dateLabel}
          </DialogTitle>
          <DialogDescription style={{ fontSize: "13px", color: "#9B9B9B", marginTop: "2px" }}>
            {gigs.length === 0
              ? "No gigs scheduled for this date."
              : `${gigs.length} gig${gigs.length > 1 ? "s" : ""} scheduled`}
          </DialogDescription>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "4px", maxHeight: "60vh", overflowY: "auto" }}>
          {gigs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "#9B9B9B" }}>
              <Calendar style={{ width: "40px", height: "40px", margin: "0 auto 12px", opacity: 0.3 }} />
              <p style={{ fontSize: "14px", margin: 0 }}>No gigs found for this date</p>
            </div>
          ) : (
            gigs.map((gig: Gig, index: number) => {
              const pill = statusPill(gig.status ?? "");
              const pay = gig.status === "completed" && gig.actualPay
                ? parseFloat(gig.actualPay)
                : parseFloat(gig.expectedPay || "0");
              const mileageDeduction = (gig.mileage || 0) * 0.70;
              const isCompleted = gig.status === "completed";

              return (
                <div
                  key={index}
                  style={{ backgroundColor: "#F9F9F9", borderRadius: "14px", padding: "16px" }}
                >
                  {/* Row 1: name + pay */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2px" }}>
                    <p style={{ fontSize: "16px", fontWeight: 600, color: "#111111", margin: 0, flex: 1, paddingRight: "8px" }}>
                      {gig.eventName || "Unnamed Gig"}
                    </p>
                    <p style={{ fontSize: "16px", fontWeight: 600, color: "#111111", margin: 0, whiteSpace: "nowrap" }}>
                      ${pay.toFixed(2)}
                    </p>
                  </div>

                  {/* Row 2: client + status badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <p style={{ fontSize: "13px", color: "#9B9B9B", margin: 0 }}>{gig.clientName}</p>
                    <span style={{ fontSize: "11px", fontWeight: 600, borderRadius: "9999px", padding: "3px 10px", backgroundColor: pill.bg, color: pill.color, whiteSpace: "nowrap" }}>
                      {pill.label}
                    </span>
                  </div>

                  {/* Row 3: gig type pill */}
                  <span style={{ display: "inline-block", backgroundColor: CYAN, color: "#ffffff", fontSize: "11px", fontWeight: 600, borderRadius: "9999px", padding: "4px 12px" }}>
                    {gig.gigType || "Gig"}
                  </span>

                  {/* Mileage deduction */}
                  {mileageDeduction > 0 && (
                    <div style={{ marginTop: "10px", borderTop: "1px solid #F0F0F0", paddingTop: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "13px", color: "#111111" }}>Mileage ({gig.mileage} mi)</span>
                        <span style={{ fontSize: "13px", color: GREEN, fontWeight: 600 }}>-${mileageDeduction.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* Tips */}
                  {gig.tips && parseFloat(gig.tips) > 0 && (
                    <div style={{ marginTop: "6px", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: "13px", color: "#111111" }}>Tips</span>
                      <span style={{ fontSize: "13px", color: GREEN, fontWeight: 600 }}>+${parseFloat(gig.tips).toFixed(2)}</span>
                    </div>
                  )}

                  {/* Action row */}
                  <div style={{ marginTop: "14px", borderTop: "1px solid #F0F0F0", paddingTop: "12px", display: "flex", gap: "8px", alignItems: "center" }}>
                    {!isCompleted && (
                      <button
                        onClick={() => {
                          onGotPaid(gig);
                          onOpenChange(false);
                        }}
                        style={{ flex: 1, backgroundColor: GREEN, color: "#ffffff", border: "none", borderRadius: "10px", padding: "10px 0", fontSize: "14px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                      >
                        <DollarSign size={15} strokeWidth={2.5} />
                        Got Paid
                      </button>
                    )}
                    <button
                      onClick={() => {
                        onEdit(gig);
                        onOpenChange(false);
                      }}
                      style={{ width: "42px", height: "42px", backgroundColor: "#ffffff", border: "1px solid #E8E8E8", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                    >
                      <Edit2 size={16} color={NAVY} />
                    </button>
                    <button
                      onClick={() => {
                        const groupedGig = groupedGigs.find(g =>
                          g.id === gig.id || (g.gigIds && g.gigIds.includes(gig.id))
                        );
                        if (groupedGig?.isMultiDay && groupedGig.gigIds) {
                          onDelete(gig.id, groupedGig.gigIds);
                        } else {
                          onDelete(gig.id);
                        }
                        onOpenChange(false);
                      }}
                      disabled={isDeleting}
                      style={{ width: "42px", height: "42px", backgroundColor: "#fff0f0", border: "1px solid #fecaca", borderRadius: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                    >
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
