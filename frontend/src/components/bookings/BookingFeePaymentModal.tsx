import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Wallet, DollarSign, Shield, CheckCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

interface BookingFeePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency?: string;
  bookingId: string;
  onPaymentSuccess: (transactionId: string) => void;
}

type PaymentMethod = 'mpesa' | 'card' | 'wallet';

const BookingFeePaymentModal: React.FC<BookingFeePaymentModalProps> = ({
  isOpen,
  onClose,
  amount,
  currency = 'KES',
  bookingId,
  onPaymentSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mpesaPhone, setMpesaPhone] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');

  // Debug: Log the amount received
  React.useEffect(() => {
    if (isOpen) {
      console.log('=== PAYMENT MODAL DEBUG ===');
      console.log('Amount received:', amount);
      console.log('Currency:', currency);
      console.log('Booking ID:', bookingId);

      if (amount === 0 || !amount) {
        console.error('⚠️ PAYMENT MODAL: Amount is 0 or undefined!');
      } else {
        console.log('✅ PAYMENT MODAL: Amount is valid:', amount);
      }
      console.log('=========================');
    }
  }, [isOpen, amount, currency, bookingId]);

  if (!isOpen) return null;

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // Validate input based on payment method
      if (paymentMethod === 'mpesa' && !mpesaPhone) {
        toast.error('Please enter your M-Pesa phone number');
        setIsProcessing(false);
        return;
      }

      if (paymentMethod === 'card') {
        if (!cardNumber || !cardExpiry || !cardCVC) {
          toast.error('Please fill in all card details');
          setIsProcessing(false);
          return;
        }
      }

      let transactionId: string;

      if (paymentMethod === 'mpesa') {
        // M-Pesa STK Push
        transactionId = await handleMpesaPayment();
      } else if (paymentMethod === 'card') {
        // Card payment (Stripe/Flutterwave)
        transactionId = await handleCardPayment();
      } else {
        // Wallet payment
        transactionId = await handleWalletPayment();
      }

      toast.success('Payment successful!');
      onPaymentSuccess(transactionId);
      onClose();
    } catch (error: any) {
      console.error('Payment error:', error);

      // Extract detailed error message from axios error
      let errorMessage = 'Payment failed. Please try again.';

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error('Detailed error message:', errorMessage);
      console.error('Full error response:', error.response?.data);

      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMpesaPayment = async (): Promise<string> => {
    const axiosInstance = (await import('@/lib/axios')).default;

    // Debug: Log payment details
    console.log('=== M-PESA PAYMENT DEBUG ===');
    console.log('Phone Number:', mpesaPhone);
    console.log('Booking ID:', bookingId);
    console.log('Amount:', amount);
    console.log('Type:', 'booking_fee');
    console.log('===========================');

    // Initiate STK Push
    const stkResponse = await axiosInstance.post('/payments/mpesa/stkpush', {
      phoneNumber: mpesaPhone,
      bookingId,
      amount,
      type: 'booking_fee',
    });

    console.log('STK Response:', stkResponse.data);

    if (!stkResponse.data.success) {
      throw new Error(stkResponse.data.message || 'STK Push failed');
    }

    const { transactionId, checkoutRequestId } = stkResponse.data.data;

    toast.success('STK Push sent! Please check your phone and enter your M-Pesa PIN');

    // Poll for payment status (for up to 60 seconds)
    const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds

      try {
        const statusResponse = await axiosInstance.get(
          `/payments/mpesa/status/${transactionId}`
        );

        if (statusResponse.data.transaction.status === 'completed') {
          return transactionId;
        } else if (statusResponse.data.transaction.status === 'failed') {
          throw new Error(
            statusResponse.data.transaction.failureReason || 'Payment failed'
          );
        }
      } catch (error) {
        console.error('Status check error:', error);
      }

      attempts++;
    }

    throw new Error('Payment timeout. Please check your phone or try again.');
  };

  const handleCardPayment = async (): Promise<string> => {
    // TODO: Integrate with Stripe or Flutterwave
    // This is a placeholder
    throw new Error('Card payment not yet implemented');
  };

  const handleWalletPayment = async (): Promise<string> => {
    // TODO: Integrate with wallet system
    // This is a placeholder
    throw new Error('Wallet payment not yet implemented');
  };

  const paymentMethods = [
    {
      id: 'mpesa' as PaymentMethod,
      name: 'M-Pesa',
      icon: Smartphone,
      description: 'Pay via M-Pesa',
    },
    {
      id: 'card' as PaymentMethod,
      name: 'Card',
      icon: CreditCard,
      description: 'Credit/Debit Card',
    },
    {
      id: 'wallet' as PaymentMethod,
      name: 'Wallet',
      icon: Wallet,
      description: 'Pay from wallet',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold dark:text-gray-100">Pay Booking Fee</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Secure payment protected by escrow
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Amount */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6 border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-700 dark:text-green-400 mb-1">Amount to Pay</div>
            <div className="text-3xl font-bold text-green-900 dark:text-green-300">
              {amount.toLocaleString()} {currency}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              20% refundable booking deposit
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-200 mb-3">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === method.id
                        ? 'border-green-500 bg-green-50 dark:border-green-600 dark:bg-green-900/20'
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 mx-auto mb-2 ${
                        paymentMethod === method.id ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'
                      }`}
                    />
                    <div
                      className={`text-xs font-medium ${
                        paymentMethod === method.id ? 'text-green-900 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {method.name}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-6">
            {paymentMethod === 'mpesa' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-200 mb-2">
                  M-Pesa Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="254712345678"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  You will receive an STK push notification on your phone
                </p>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-200 mb-2">
                    Card Number
                  </label>
                  <Input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-200 mb-2">
                      Expiry Date
                    </label>
                    <Input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-200 mb-2">
                      CVC
                    </label>
                    <Input
                      type="text"
                      placeholder="123"
                      value={cardCVC}
                      onChange={(e) => setCardCVC(e.target.value)}
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'wallet' && (
              <div className="bg-gray-50 dark:bg-gray-900 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-700 dark:border-gray-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-300">Wallet Balance:</span>
                  <span className="font-semibold dark:text-gray-100">5,000 {currency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-300">After Payment:</span>
                  <span className="font-semibold dark:text-gray-100">
                    {(5000 - amount).toLocaleString()} {currency}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Security Features */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-900 dark:text-blue-300">
                Payment Protection
              </span>
            </div>
            <ul className="space-y-1 text-sm text-blue-700 dark:text-blue-300">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Funds held securely in escrow
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                100% refundable if you cancel
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Released after job completion
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pay Now
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingFeePaymentModal;
