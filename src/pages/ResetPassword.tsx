import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const { resetPassword } = useAuth();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const { error } = await resetPassword(email);

        if (error) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
            setIsLoading(false);
            return;
        }

        setIsSuccess(true);
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <Link to="/login" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                </Link>

                <div className="mb-8">
                    <img src="/logo.png" alt="Ikso AfriFabs" className="h-12 mb-6" />
                    <h1 className="font-display text-3xl mb-2">Reset Password</h1>
                    <p className="text-muted-foreground">
                        Enter your email and we'll send you a link to reset your password
                    </p>
                </div>

                {isSuccess ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center"
                    >
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h2 className="font-semibold text-lg mb-2">Check your email</h2>
                        <p className="text-muted-foreground text-sm">
                            We've sent a password reset link to <strong>{email}</strong>
                        </p>
                        <Link to="/login">
                            <Button variant="outline" className="mt-4">
                                Return to Login
                            </Button>
                        </Link>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                'Send Reset Link'
                            )}
                        </Button>
                    </form>
                )}
            </motion.div>
        </div>
    );
};

export default ResetPassword;
