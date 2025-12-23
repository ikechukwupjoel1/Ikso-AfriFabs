import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { signIn } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as any)?.from?.pathname || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const { error } = await signIn(email, password);

        if (error) {
            toast({
                title: 'Login Failed',
                description: error.message,
                variant: 'destructive',
            });
            setIsLoading(false);
            return;
        }

        toast({
            title: 'Welcome back!',
            description: 'You have successfully logged in.',
        });
        navigate(from, { replace: true });
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Shop
                    </Link>

                    <div className="mb-8">
                        <img src="/logo.png" alt="Ikso AfriFabs" className="h-12 mb-6" />
                        <h1 className="font-display text-3xl mb-2">Welcome Back</h1>
                        <p className="text-muted-foreground">Sign in to your account to continue shopping</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
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

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link to="/reset-password" className="text-sm text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-muted-foreground mt-6">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary hover:underline font-medium">
                            Create one
                        </Link>
                    </p>
                </motion.div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <div className="absolute inset-0 bg-gradient-hero opacity-90" />
                <img
                    src="/Cloth Gallery/Super Gandaho (1).webp"
                    alt="African Fabric"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                />
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="text-center text-white">
                        <h2 className="font-display text-4xl mb-4">The Fabric of Us</h2>
                        <p className="text-xl opacity-80">Premium African textiles delivered to your door</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
