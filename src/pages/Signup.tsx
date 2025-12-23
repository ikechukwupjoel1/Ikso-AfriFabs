import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { signUp } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const passwordRequirements = [
        { test: password.length >= 8, text: 'At least 8 characters' },
        { test: /[A-Z]/.test(password), text: 'One uppercase letter' },
        { test: /[0-9]/.test(password), text: 'One number' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast({
                title: 'Passwords do not match',
                description: 'Please make sure your passwords match.',
                variant: 'destructive',
            });
            return;
        }

        if (!agreeTerms) {
            toast({
                title: 'Terms Required',
                description: 'Please agree to the terms and conditions.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);

        const { error } = await signUp(email, password, name);

        if (error) {
            toast({
                title: 'Signup Failed',
                description: error.message,
                variant: 'destructive',
            });
            setIsLoading(false);
            return;
        }

        toast({
            title: 'Account Created!',
            description: 'Please check your email to confirm your account.',
        });
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-background flex">
            {/* Left Side - Image */}
            <div className="hidden lg:block lg:w-1/2 relative">
                <div className="absolute inset-0 bg-gradient-hero opacity-90" />
                <img
                    src="/Cloth Gallery/Kente Gold (1).webp"
                    alt="African Fabric"
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                />
                <div className="absolute inset-0 flex items-center justify-center p-12">
                    <div className="text-center text-white">
                        <h2 className="font-display text-4xl mb-4">Join Our Community</h2>
                        <p className="text-xl opacity-80">Discover authentic African textiles</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
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
                        <h1 className="font-display text-3xl mb-2">Create Account</h1>
                        <p className="text-muted-foreground">Start your journey with premium African fabrics</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

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
                            <Label htmlFor="password">Password</Label>
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
                            {/* Password Requirements */}
                            <div className="space-y-1 mt-2">
                                {passwordRequirements.map((req, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs">
                                        <Check className={`w-3 h-3 ${req.test ? 'text-green-500' : 'text-muted-foreground'}`} />
                                        <span className={req.test ? 'text-green-500' : 'text-muted-foreground'}>{req.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <Checkbox
                                id="terms"
                                checked={agreeTerms}
                                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                            />
                            <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                                I agree to the{' '}
                                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                                {' '}and{' '}
                                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                            </label>
                        </div>

                        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-muted-foreground mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:underline font-medium">
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Signup;
