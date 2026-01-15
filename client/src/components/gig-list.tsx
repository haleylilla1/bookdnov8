import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Clock, Edit2, Trash2 } from "lucide-react";
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

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending_payment":
    case "pending payment":
      return "bg-orange-100 text-orange-800";
    case "upcoming":
      return "bg-gray-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "completed":
      return "Completed";
    case "pending_payment":
    case "pending payment":
      return "Pending Payment";
    case "upcoming":
      return "Upcoming";
    default:
      return status;
  }
};

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
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500 mb-2">No gigs found</p>
        <p className="text-sm text-gray-400">
          {searchQuery || filterStatus !== "all" 
            ? "Try adjusting your search or filter criteria"
            : "Add your first gig to get started"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {gigs.map((gig) => (
        <Card key={gig.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  {gig.eventName}
                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {gig.isMultiDay 
                      ? `${formatDate(gig.startDate!)} - ${formatDate(gig.endDate!)}`
                      : formatDate(gig.date)
                    }
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {gig.clientName} • {gig.gigType}
                  </div>
                </div>

                {gig.duties && (
                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded mt-3">
                    {gig.duties}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-2 items-center">
                {gig.status !== 'completed' && (
                  <div className="flex justify-center">
                    <Button
                      variant="default"
                      onClick={() => onGotPaid(gig)}
                      className="bg-green-600 hover:bg-green-700 text-white !px-[12px] !py-[7px] !h-auto !text-[12px] !min-h-0"
                    >
                      <DollarSign className="w-3.5 h-3.5 mr-0.5" />
                      Got Paid
                    </Button>
                  </div>
                )}
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(gig)}
                    className="flex items-center justify-center"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(gig)}
                    disabled={isDeleting}
                    className="flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-3 pt-3 border-t">
              <div className="flex items-center gap-1 text-sm">
                <DollarSign className="w-4 h-4 text-green-600" />
                {gig.expectedPay 
                  ? formatCurrency(parseFloat(gig.expectedPay))
                  : "No pay set"
                }
              </div>
              <Badge className={getStatusColor(gig.status)}>
                {getStatusLabel(gig.status)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}

      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="w-full max-w-xs"
          >
            {isLoadingMore ? "Loading..." : `Load More Gigs (${remainingCount} remaining)`}
          </Button>
        </div>
      )}
    </div>
  );
}
