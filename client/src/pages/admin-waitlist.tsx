import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { WaitlistSignup } from "@shared/schema";
import { format } from "date-fns";

export default function AdminWaitlist() {
  const { data: signups, isLoading } = useQuery<WaitlistSignup[]>({
    queryKey: ['/api/waitlist'],
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a1d56] to-[#1a2f66] p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-3xl font-bold text-white mb-6">Waitlist Signups</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {isLoading ? "Loading..." : `${signups?.length || 0} Total Signups`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : signups && signups.length > 0 ? (
              <div className="space-y-2">
                {signups.map((signup) => (
                  <div
                    key={signup.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{signup.email}</span>
                      <span className="text-sm text-gray-500">
                        {signup.source || 'waitlist_page'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {signup.createdAt
                        ? format(new Date(signup.createdAt), 'MMM d, yyyy h:mm a')
                        : 'Unknown date'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">No signups yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
