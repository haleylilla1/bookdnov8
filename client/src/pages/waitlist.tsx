import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";
import logoImage from "@assets/bookd-logo.png";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to join waitlist");
      }

      setIsSuccess(true);
      setEmail("");
      toast({
        title: "You're on the list!",
        description: "We'll notify you when we launch new features.",
      });
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1d56] to-[#051235] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <img src={logoImage} alt="bookd" className="h-10 mb-4 mx-auto object-contain" />
            <p className="text-gray-600 text-lg">
              The Financial Friend to Freelancers & Side Hustlers
            </p>
          </div>

          {isSuccess ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                You're in!
              </h2>
              <p className="text-gray-600">
                We'll keep you updated on new features and improvements.
              </p>
              <Button
                onClick={() => setIsSuccess(false)}
                variant="outline"
                className="mt-6"
                data-testid="button-join-another"
              >
                Add another email
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                  Join the waitlist
                </h2>
                <p className="text-gray-600">
                  Be the first to know about new features, updates, and exclusive early access to Bookd.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-lg"
                    disabled={isSubmitting}
                    data-testid="input-email"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-lg bg-[#0a1d56] hover:bg-[#051235]"
                  disabled={isSubmitting}
                  data-testid="button-submit"
                >
                  {isSubmitting ? "Joining..." : "Join Waitlist"}
                </Button>
              </form>
            </>
          )}
        </div>

        <p className="text-white text-center mt-6 text-sm">
          Track gigs, expenses, and taxes with ease
        </p>
      </div>
    </div>
  );
}
