import { useState, useRef, useEffect } from "react";
import { Calendar, MoreVertical } from "lucide-react";
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

const NAVY = "#03045e";
const AMBER = "#d97706";

function statusBadgeStyle(status: string): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "100px",
    padding: "3px 9px",
    fontSize: "10px",
    fontWeight: 500,
    border: "1.5px solid",
    background: "transparent",
    whiteSpace: "nowrap",
  };
  switch (status) {
    case "completed":
      return { ...base, borderColor: "#10b981", color: "#10b981" };
    case "pending_payment":
    case "pending payment":
      return { ...base, borderColor: AMBER, color: AMBER };
    default:
      return { ...base, borderColor: "#6b7280", color: "#374151" };
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "completed": return "Completed";
    case "pending_payment":
    case "pending payment": return "Pending Payment";
    case "upcoming": return "Upcoming";
    default: return status;
  }
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

  const isPending =
    gig.status === "pending payment" || gig.status === "pending_payment";
  const isCompleted = gig.status === "completed";

  const dateStr = gig.isMultiDay
    ? `${formatDate(gig.startDate!)} – ${formatDate(gig.endDate!)}`
    : formatDate(gig.date);

  return (
    <div style={{ background: "#fff", borderRadius: "14px", padding: "16px 18px", marginBottom: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)" }}>

      {/* Row 1: gig name (left) + status badge + three-dot menu (right) */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: "12px" }}>
        <p style={{ fontWeight: 600, fontSize: "15px", color: "#111827", margin: 0, lineHeight: 1.25, flex: 1, minWidth: 0 }}>
          {gig.eventName}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={statusBadgeStyle(gig.status)}>{statusLabel(gig.status)}</span>
          <div ref={menuRef} style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#9ca3af", display: "flex", alignItems: "center" }}
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

      {/* Row 2: date (left) + client/agency (right) — same row, 12px gray */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <span style={{ fontSize: "12px", color: "#9ca3af" }}>{dateStr}</span>
        {gig.clientName && (
          <span style={{ fontSize: "12px", color: "#9ca3af" }}>{gig.clientName}</span>
        )}
      </div>

      {/* Row 3: amount + action — separated by top border with 14px padding above */}
      <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <p style={{ fontWeight: 600, fontSize: "17px", color: "#111827", margin: 0 }}>
          {gig.expectedPay ? formatCurrency(parseFloat(gig.expectedPay)) : "—"}
        </p>

        {isPending ? (
          <button
            onClick={() => onGotPaid(gig)}
            style={{ background: NAVY, color: "#fff", border: "none", borderRadius: "100px", padding: "6px 12px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
          >
            Got Paid
          </button>
        ) : !isCompleted ? (
          <button
            onClick={() => onGotPaid(gig)}
            style={{ background: NAVY, color: "#fff", border: "none", borderRadius: "100px", padding: "6px 12px", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}
          >
            Got Paid
          </button>
        ) : (
          <button
            onClick={() => onEdit(gig)}
            style={{ background: "none", border: "none", color: "#6b7280", fontSize: "13px", fontWeight: 500, cursor: "pointer", padding: "4px 0" }}
          >
            Edit
          </button>
        )}
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
