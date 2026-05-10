import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { Zap, User, Mail, Lock, UserPlus, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.signup(formData.name, formData.email, formData.password);
      setIsSuccess(true);
      
      // Auto-login after successful registration
      setTimeout(() => {
        login(response.data.user, response.data.accessToken);
        navigate('/dashboard');
      }, 1500);
      
    } catch (err) {
      console.error('Signup Error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] translate-y-1/2 translate-x-1/2"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] relative z-10"
      >
        <div className="bg-[#1E293B]/50 backdrop-blur-xl border border-white/5 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl">
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/20 mb-6 transition-transform hover:scale-110">
              <Zap className="text-white w-8 h-8 fill-current" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Create Account</h1>
            <p className="text-slate-400 mt-2">Join Mentixo AI and start your learning journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 text-red-400 text-sm"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            {isSuccess && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-400 text-sm"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <p>Registration successful! Redirecting...</p>
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 ml-1">Your Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full bg-[#0F172A]/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="email" 
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full bg-[#0F172A]/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="password" 
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-[#0F172A]/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center px-4 leading-relaxed">
              By creating an account, you agree to our <span className="text-slate-400 font-medium">Terms of Service</span> and <span className="text-slate-400 font-medium">Privacy Policy</span>.
            </p>

            <button 
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
              {isLoading ? 'Creating Account...' : 'Get Started'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:underline underline-offset-4 font-bold">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
