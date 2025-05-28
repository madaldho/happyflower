
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Home, Package } from 'lucide-react';

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    const countdownInterval = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-peach-50 to-coral-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg p-8 text-center">
        <div className="flex flex-col items-center">
          <div className="bg-green-100 rounded-full p-4 mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your order has been placed and is being processed.
            You'll receive a confirmation email shortly.
          </p>

          {sessionId && (
            <p className="text-xs text-gray-500 mb-6">
              Order reference: {sessionId.substring(0, 12)}...
            </p>
          )}

          <div className="space-y-3 w-full">
            <Button 
              className="w-full bg-coral-400 hover:bg-coral-500"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/profile')}
            >
              <Package className="h-4 w-4 mr-2" />
              View Orders
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Automatically returning to homepage in {countdown} seconds...
          </p>
        </div>
      </Card>
    </div>
  );
}
