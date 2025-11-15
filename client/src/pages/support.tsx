import { ArrowLeft, Mail, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Support() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </Button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-2">Bookd Support</h1>
          <p className="text-gray-600 mb-8">
            We're here to help with any questions or issues you may have.
          </p>

          <div className="space-y-8">
            {/* Contact Information */}
            <div className="border-l-4 border-blue-500 pl-6 py-4">
              <div className="flex items-start gap-3">
                <Mail className="w-6 h-6 text-blue-500 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold mb-2">Contact Us</h2>
                  <p className="text-gray-700 mb-2">
                    For support inquiries, feature requests, or any questions about Bookd, please email us at:
                  </p>
                  <a 
                    href="mailto:haley.bookd@gmail.com" 
                    className="text-blue-600 hover:text-blue-700 font-medium text-lg"
                  >
                    haley.bookd@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="border-l-4 border-green-500 pl-6 py-4">
              <div className="flex items-start gap-3">
                <Clock className="w-6 h-6 text-green-500 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold mb-2">Response Time</h2>
                  <p className="text-gray-700">
                    We typically respond to all support requests within <strong>24 hours</strong>. 
                    For urgent issues, please include "URGENT" in your email subject line.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Help */}
            <div className="border-l-4 border-purple-500 pl-6 py-4">
              <div className="flex items-start gap-3">
                <MessageCircle className="w-6 h-6 text-purple-500 mt-1" />
                <div>
                  <h2 className="text-xl font-semibold mb-2">Common Questions</h2>
                  <div className="space-y-4 text-gray-700">
                    <div>
                      <h3 className="font-medium mb-1">How do I track mileage for my gigs?</h3>
                      <p className="text-sm">
                        When you create a gig, enter the gig address. When you mark it as paid, we'll automatically 
                        calculate the business mileage from your home address to the gig location.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-1">How do I generate a tax report?</h3>
                      <p className="text-sm">
                        Go to the Dashboard and click the "Generate Reports" button. You can download an income 
                        report showing all your earnings and business deductions.
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-1">Can I edit or delete expenses?</h3>
                      <p className="text-sm">
                        Yes! Go to the Dashboard, click on any expense card, and you'll see options to edit or 
                        delete the expense.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium mb-1">How do I update my home address?</h3>
                      <p className="text-sm">
                        Go to your Profile page and update your home address. This will be used for all future 
                        mileage calculations.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Help */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-2">Need More Help?</h2>
              <p className="text-gray-700">
                If your question isn't answered here, please don't hesitate to reach out to us at{" "}
                <a 
                  href="mailto:haley.bookd@gmail.com" 
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  haley.bookd@gmail.com
                </a>
                . We're always happy to help!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
