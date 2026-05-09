import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import splashImage from '../../assets/splash.png';
import logoImage from '../../assets/Logo SpeakUp.png';

export function Register() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    class: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Semua field wajib diisi');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    if (!formData.class) {
      setError('Kelas harus dipilih');
      return;
    }

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'student',
        class: formData.class
      });
      navigate('/student-report');
    } catch (err: any) {
      setError(err.message || 'Registrasi gagal. Silakan coba lagi.');
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

        {/* Right Side - Register Form */}
        <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col justify-center px-8 py-6 sm:px-12 sm:py-8 md:px-16 md:py-10 lg:px-20 lg:py-12 bg-white relative z-10 min-h-screen lg:min-h-0 overflow-y-auto">
          <div className="w-full max-w-md mx-auto py-4">
            
            {/* Logo */}
            <div className="-mb-2 lg:-mb-4 relative z-0 flex justify-center">
              <img src={logoImage} alt="SpeakUp Logo" className="h-20 md:h-28 object-contain object-center" />
            </div>

            {/* Heading */}
            <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-3 leading-tight relative z-10">
              Buat Akun,<br />Siswa
            </h1>
            <p className="text-sm text-gray-500 mb-8 font-medium">
              Daftar untuk mulai melaporkan insiden
            </p>


            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Register Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nama Lengkap"
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-sm text-gray-700 placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Siswa"
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-sm text-gray-700 placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Class */}
              <div>
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-sm text-gray-700 bg-white appearance-none"
                  required
                >
                  <option value="" disabled>Pilih Kelas</option>
                  {[10, 11, 12].map((grade) => (
                    <optgroup key={grade} label={`Kelas ${grade}`}>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                        <option key={`${grade}-${num}`} value={`${grade}-${num}`}>
                          {grade}-{num}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              {/* Password */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password (Minimal 8 karakter)"
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

              {/* Confirm Password */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ulangi Password"
                  className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-sm text-gray-700 placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Terms */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      className="peer w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500 focus:ring-offset-0 appearance-none border-2 checked:bg-purple-600 checked:border-transparent transition-colors"
                      required
                    />
                    <svg className="absolute w-3.5 h-3.5 text-white left-0.5 top-1 opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-600 font-medium leading-relaxed">
                    Saya setuju dengan{' '}
                    <a href="#" className="text-purple-600 hover:text-purple-700 font-bold">
                      Syarat & Ketentuan
                    </a>{' '}
                    dan{' '}
                    <a href="#" className="text-purple-600 hover:text-purple-700 font-bold">
                      Kebijakan Privasi
                    </a>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-32 py-3.5 mt-4 rounded-xl bg-[#00158b] hover:bg-[#00158b]/90 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Wait...' : 'Sign Up'}
              </button>

            </form>

            {/* Login Link */}
            <div className="mt-6">
              <p className="text-sm text-gray-600 font-medium">
                Sudah punya akun?{' '}
                <Link
                  to="/login"
                  className="text-purple-600 hover:text-purple-700 font-bold"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>

    </div>
  );
}