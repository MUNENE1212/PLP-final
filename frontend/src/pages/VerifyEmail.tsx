import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { verifyEmail, resendVerificationEmail } from '@/store/slices/authSlice';

const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token provided.');
      return;
    }

    dispatch(verifyEmail(token))
      .unwrap()
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setErrorMessage(typeof err === 'string' ? err : 'Verification failed.');
      });
  }, [token, dispatch]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResendLoading(true);
    try {
      await dispatch(resendVerificationEmail(resendEmail)).unwrap();
    } catch {
      // Error toast handled by thunk
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="glass-card max-w-md w-full p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-circuit-blue)] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[var(--color-soft-bone)]">
              Verifying your email...
            </h2>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[var(--color-soft-bone)] mb-2">
              Email Verified!
            </h2>
            <p className="text-[var(--color-steel-grey)] mb-6">
              Your email has been verified successfully. You can now log in.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary w-full"
            >
              Go to Login
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[var(--color-soft-bone)] mb-2">
              Verification Failed
            </h2>
            <p className="text-[var(--color-steel-grey)] mb-6">
              {errorMessage}
            </p>

            <form onSubmit={handleResend} className="space-y-3">
              <input
                type="email"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="Enter your email to resend"
                className="input w-full"
              />
              <button
                type="submit"
                disabled={resendLoading || !resendEmail}
                className="btn-secondary w-full"
              >
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </button>
            </form>

            <Link
              to="/login"
              className="block mt-4 text-sm text-[var(--color-circuit-blue)] hover:underline"
            >
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
