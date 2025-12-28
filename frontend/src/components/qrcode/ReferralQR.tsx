import { QRCodeDisplay } from './QRCodeDisplay';
import { Gift } from 'lucide-react';
import { Card } from '@/components/ui';

interface ReferralQRProps {
  userId: string;
  referralCode: string;
}

export const ReferralQR = ({ userId, referralCode }: ReferralQRProps) => {
  const referralUrl = `${window.location.origin}/register?ref=${referralCode}`;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-6 rounded-2xl">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-4 rounded-2xl">
            <Gift className="h-8 w-8 text-white" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
          Share & Earn
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Earn KES 500 for every friend who books their first service
        </p>
      </div>

      <Card className="p-6 bg-white dark:bg-neutral-900">
        <QRCodeDisplay
          data={referralUrl}
          title="Your Referral Code"
          description={`Code: ${referralCode}`}
          showLogo={true}
          showActions={true}
        />
      </Card>

      <div className="mt-6 p-4 bg-white dark:bg-neutral-900 rounded-xl">
        <h4 className="font-semibold text-sm text-neutral-900 dark:text-white mb-2">
          How it works:
        </h4>
        <ol className="text-xs text-neutral-600 dark:text-neutral-400 space-y-2">
          <li>1. Share this QR code with friends and family</li>
          <li>2. They scan and sign up for Dumu Waks</li>
          <li>3. When they book their first service, you earn KES 500!</li>
        </ol>
      </div>

      <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl border border-green-200 dark:border-green-800">
        <p className="text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
          <Gift className="h-4 w-4" />
          <span>No limit on referrals - earn unlimited rewards!</span>
        </p>
      </div>
    </div>
  );
};
