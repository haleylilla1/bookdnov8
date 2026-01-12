import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, Edit2, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Gig } from "@shared/schema";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Gigs for {selectedDate?.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </DialogTitle>
          <DialogDescription>
            View and manage all gigs scheduled for this date.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-96 overflow-y-auto">
          {gigs.length > 0 ? (
            <div className="space-y-3">
              {gigs.map((gig: Gig, index: number) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-lg text-gray-900">
                        {gig.eventName}
                      </div>
                      <div className="text-sm text-gray-600">
                        {gig.clientName} • {gig.gigType}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge 
                        variant={
                          gig.status === 'completed' ? 'default' : 
                          gig.status === 'upcoming' ? 'secondary' : 
                          'outline'
                        }
                        className="w-fit"
                      >
                        {gig.status}
                      </Badge>
                      
                      <div className="flex flex-col gap-2">
                        {gig.status !== 'completed' && (
                          <div className="flex justify-center">
                            <Button
                              variant="default"
                              onClick={() => {
                                onGotPaid(gig);
                                onOpenChange(false);
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white !px-[12px] !py-[7px] !h-auto !text-[12px] !min-h-0"
                            >
                              <DollarSign className="h-3.5 w-3.5 mr-0.5" />
                              Got Paid
                            </Button>
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              onEdit(gig);
                              onOpenChange(false);
                            }}
                            className="flex items-center justify-center"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
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
                            className="flex items-center justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Expected Pay:</span>
                      <div className="font-medium text-green-600">
                        {formatCurrency(parseFloat(gig.expectedPay || "0"))}
                      </div>
                    </div>
                    
                    {gig.status === 'completed' && gig.actualPay && (
                      <div>
                        <span className="text-gray-600">Actual Pay:</span>
                        <div className="font-medium text-green-600">
                          {formatCurrency(parseFloat(gig.actualPay))}
                        </div>
                      </div>
                    )}
                    
                    {gig.tips && parseFloat(gig.tips) > 0 && (
                      <div>
                        <span className="text-gray-600">Tips:</span>
                        <div className="font-medium text-green-600">
                          {formatCurrency(parseFloat(gig.tips))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {gig.duties && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <span className="text-gray-600 text-sm">Duties:</span>
                      <div className="text-sm text-gray-900 mt-1">
                        {gig.duties}
                      </div>
                    </div>
                  )}
                  
                  {gig.notes && (
                    <div className="mt-2">
                      <span className="text-gray-600 text-sm">Notes:</span>
                      <div className="text-sm text-gray-900 mt-1">
                        {gig.notes}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No gigs found for this date</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
