import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import splashImage from '../../assets/splash.png';
import logoImage from '../../assets/Logo SpeakUp.png';

export function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email dan password harus diisi');
      return;
    }

    try {
      await login(email, password, selectedRole);
      navigate(selectedRole === 'teacher' ? '/' : '/student-report');
    } catch (err: any) {
      setError(err.message || 'Login gagal. Periksa kembali email dan password Anda.');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white overflow-hidden">
        
        {/* Left Side - Image */}
        <div className="hidden lg:block lg:w-1/2 xl:w-[55%] bg-purple-50 relative">
          <motion.img 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            src={splashImage} 
            alt="Illustration" 
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col justify-center px-8 py-6 sm:px-12 sm:py-8 md:px-16 md:py-10 lg:px-20 lg:py-12 bg-white relative z-10 min-h-screen lg:min-h-0 overflow-y-auto">
          <div className="w-full max-w-md mx-auto py-4">
            
            {/* Logo */}
            <div className="-mb-2 lg:-mb-4 relative z-0 flex justify-center">
              <img src={logoImage} alt="SpeakUp Logo" className="h-20 md:h-28 object-contain object-center" />
            </div>

            {/* Heading */}
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3 leading-tight relative z-10">
              Selamat Datang,<br />Kembali
            </h1>
            <p className="text-sm text-gray-500 mb-10 font-medium">
              Masuk ke akun Anda untuk melanjutkan
            </p>

            {/* Role Selection Tabs */}
            <div className="flex gap-8 mb-10 border-b border-gray-100">
              <button
                 type="button"
                 onClick={() => { setSelectedRole('student'); setShowTeacherList(false); setError(''); }}
                 className={`pb-3 text-base font-medium transition-all relative ${
                   selectedRole === 'student' ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
                 }`}
              >
                Siswa
                {selectedRole === 'student' && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                )}
              </button>
              <button
                 type="button"
                 onClick={() => { setSelectedRole('teacher'); setShowTeacherList(true); setError(''); }}
                 className={`pb-3 text-base font-medium transition-all relative ${
                   selectedRole === 'teacher' ? 'text-purple-600' : 'text-gray-400 hover:text-gray-600'
                 }`}
              >
                Guru BK
                {selectedRole === 'teacher' && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
                )}
              </button>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}



            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="stanley@gmail.com"
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-sm text-gray-700 placeholder:text-gray-400"
                  required
                />
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-sm text-gray-700 placeholder:text-gray-400"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex items-center justify-between py-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      className="peer w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 appearance-none border-2 checked:bg-purple-600 checked:border-transparent transition-colors"
                    />
                    <svg className="absolute w-3.5 h-3.5 text-white left-0.5 top-1 opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-gray-600 font-medium hover:text-purple-600 transition-colors">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-32 py-3.5 mt-4 rounded-xl bg-[#00158b] hover:bg-[#00158b]/90 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Wait...' : 'Sign In'}
              </button>
            </form>

            {selectedRole === 'student' && (
              <div className="mt-6">
                <p className="text-sm text-gray-600 font-medium">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-purple-600 hover:text-purple-700 font-bold">
                    Sign Up
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>

    </div>
  );
}