import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const AuthCallback = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your account...');

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Get the hash from URL (contains access_token, refresh_token, etc.)
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                const accessToken = hashParams.get('access_token');
                const refreshToken = hashParams.get('refresh_token');
                const type = hashParams.get('type');

                if (accessToken && refreshToken) {
                    // Set the session using the tokens from the URL
                    const { error } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });

                    if (error) {
                        throw error;
                    }

                    setStatus('success');
                    setMessage(type === 'signup'
                        ? 'Account verified! Redirecting...'
                        : 'Logged in! Redirecting...'
                    );

                    // Redirect to home after a short delay
                    setTimeout(() => {
                        navigate('/', { replace: true });
                    }, 1500);
                } else {
                    // No tokens in URL, check if there's an existing session
                    const { data: { session } } = await supabase.auth.getSession();

                    if (session) {
                        setStatus('success');
                        setMessage('Already logged in! Redirecting...');
                        setTimeout(() => {
                            navigate('/', { replace: true });
                        }, 1000);
                    } else {
                        throw new Error('No authentication tokens found');
                    }
                }
            } catch (error: any) {
                console.error('Auth callback error:', error);
                setStatus('error');
                setMessage(error.message || 'Authentication failed. Please try again.');

                // Redirect to login after showing error
                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 3000);
            }
        };

        handleAuthCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center max-w-md"
            >
                {status === 'loading' && (
                    <>
                        <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-4" />
                        <h1 className="font-display text-2xl mb-2">Please Wait</h1>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h1 className="font-display text-2xl mb-2 text-green-600">Success!</h1>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h1 className="font-display text-2xl mb-2 text-red-600">Error</h1>
                    </>
                )}

                <p className="text-muted-foreground">{message}</p>
            </motion.div>
        </div>
    );
};

export default AuthCallback;
