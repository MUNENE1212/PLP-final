import React, { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { resendVerificationEmail } from '@/store/slices/authSlice';

const EmailVerificationBanner: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.isEmailVerified || dismissed) return null;

  const handleResend = async () => {
    setLoading(true);
    try {
      await dispatch(resendVerificationEmail(user.email)).unwrap();
    } catch {
      // Error toast handled by thunk
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-sm text-amber-300">
        <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <span>Please verify your email address. Check your inbox for a verification link.</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleResend}
          disabled={loading}
          className="text-xs px-3 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 transition-colors"
        >
          {loading ? 'Sending...' : 'Resend'}
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-500/50 hover:text-amber-300 transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
