import { useState, useRef, useEffect } from "react";
import { Calendar, MoreVertical, Check } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Gig } from "@shared/schema";

interface GigListProps {
  gigs: (Gig & { isMultiDay?: boolean; startDate?: string; endDate?: string; gigIds?: number[] })[];
  searchQuery: string;
  filterStatus: string;
  hasMore: boolean;
  isLoadingMore: boolean;
  remainingCount: number;
  onLoadMore: () => void;
  onGotPaid: (gig: Gig) => void;
  onEdit: (gig: Gig & { isMultiDay?: boolean; startDate?: string; endDate?: string; gigIds?: number[] }) => void;
  onDelete: (gig: Gig & { gigIds?: number[] }) => void;
  isDeleting: boolean;
}

function StatusPill({ status }: { status: string }) {
  if (status === "completed") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", fontWeight: 500, color: "#10b981" }}>
        <Check size={12} strokeWidth={2.5} />
        Paid
      </span>
    );
  }
  if (status === "pending_payment" || status === "pending payment") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", borderRadius: "999px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, border: "1px solid #F5A623", color: "#F5A623", background: "transparent", whiteSpace: "nowrap" }}>
        Pending Payment
      </span>
    );
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", borderRadius: "999px", padding: "3px 10px", fontSize: "11px", fontWeight: 500, border: "1px solid #9B9B9B", color: "#9B9B9B", background: "transparent", whiteSpace: "nowrap" }}>
      Upcoming
    </span>
  );
}

function GigCard({
  gig,
  onGotPaid,
  onEdit,
  onDelete,
  isDeleting,
}: {
  gig: Gig & { isMultiDay?: boolean; startDate?: string; endDate?: string; gigIds?: number[] };
  onGotPaid: (gig: Gig) => void;
  onEdit: (gig: Gig & { isMultiDay?: boolean; startDate?: string; endDate?: string; gigIds?: number[] }) => void;
  onDelete: (gig: Gig & { gigIds?: number[] }) => void;
  isDeleting: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const isPending = gig.status === "pending payment" || gig.status === "pending_payment";
  const isCompleted = gig.status === "completed";
  const isUpcoming = !isPending && !isCompleted;

  const dateStr = gig.isMultiDay
    ? `${formatDate(gig.startDate!)} – ${formatDate(gig.endDate!)}`
    : formatDate(gig.date);

  return (
    <div style={{
      background: "#FFFFFF",
      border: "1px solid #F0F0F0",
      borderRadius: "12px",
      padding: "14px 16px",
      marginBottom: "8px",
    }}>

      {/* Row 1: gig name + status pill + three-dot menu */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontWeight: 600, fontSize: "15px", color: "#111111", margin: 0, lineHeight: 1.3, flex: 1, minWidth: 0, paddingRight: "8px" }}>
          {gig.eventName}
        </p>
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <StatusPill status={gig.status} />
          <div ref={menuRef} style={{ position: "relative", marginLeft: "6px" }}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#C0C0C0", display: "flex", alignItems: "center" }}
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <div style={{
                position: "absolute", right: 0, top: "calc(100% + 4px)",
                background: "#fff", borderRadius: "10px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
                minWidth: "130px", zIndex: 80, overflow: "hidden",
              }}>
                <button
                  onClick={() => { setMenuOpen(false); onEdit(gig); }}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 16px", fontSize: "14px", color: "#111827", background: "none", border: "none", cursor: "pointer" }}
                >
                  Edit
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(gig); }}
                  disabled={isDeleting}
                  style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 16px", fontSize: "14px", color: "#ef4444", background: "none", border: "none", cursor: "pointer", borderTop: "1px solid #f3f4f6" }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: date (left) + client name (right) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
        <span style={{ fontSize: "12px", fontWeight: 400, color: "#9B9B9B" }}>{dateStr}</span>
        {gig.clientName && (
          <span style={{ fontSize: "12px", fontWeight: 400, color: "#9B9B9B", textAlign: "right" }}>{gig.clientName}</span>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #F5F5F5", marginTop: "10px", marginBottom: "10px" }} />

      {/* Row 3: amount + CTA */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontWeight: 600, fontSize: "17px", color: "#111111", margin: 0 }}>
          {gig.expectedPay ? formatCurrency(parseFloat(gig.expectedPay)) : "—"}
        </p>

        {isPending && (
          <button
            onClick={() => onGotPaid(gig)}
            style={{ background: "#111111", color: "#fff", border: "none", borderRadius: "999px", padding: "8px 18px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
          >
            Got Paid
          </button>
        )}
        {isUpcoming && (
          <button
            onClick={() => onEdit(gig)}
            style={{ background: "none", border: "none", color: "#9B9B9B", fontSize: "13px", fontWeight: 500, cursor: "pointer", padding: 0 }}
          >
            Edit
          </button>
        )}
        {/* Completed: no CTA */}
      </div>
    </div>
  );
}

export default function GigList({
  gigs,
  searchQuery,
  filterStatus,
  hasMore,
  isLoadingMore,
  remainingCount,
  onLoadMore,
  onGotPaid,
  onEdit,
  onDelete,
  isDeleting,
}: GigListProps) {
  if (gigs.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "48px 0" }}>
        <Calendar size={48} style={{ margin: "0 auto 12px", color: "#d1d5db" }} />
        <p style={{ color: "#6b7280", marginBottom: 4 }}>No gigs found</p>
        <p style={{ fontSize: "13px", color: "#9ca3af" }}>
          {searchQuery || filterStatus !== "all"
            ? "Try adjusting your search or filter"
            : "Add your first gig to get started"}
        </p>
      </div>
    );
  }

  return (
    <div>
      {gigs.map((gig) => (
        <GigCard
          key={gig.id}
          gig={gig}
          onGotPaid={onGotPaid}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ))}

      {hasMore && (
        <div style={{ display: "flex", justifyContent: "center", paddingTop: "16px" }}>
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            style={{
              background: "none", border: "1.5px solid #e5e7eb",
              borderRadius: "100px", padding: "10px 28px",
              fontSize: "14px", color: "#374151", cursor: "pointer",
            }}
          >
            {isLoadingMore ? "Loading..." : `Load More (${remainingCount} remaining)`}
          </button>
        </div>
      )}
    </div>
  );
}
