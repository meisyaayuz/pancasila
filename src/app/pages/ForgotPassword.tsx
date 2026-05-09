import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import api from '../services/api';
import logoImage from '../../assets/Logo SpeakUp.png';
import splashImage from '../../assets/splash.png';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email harus diisi');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/forgot-password', { email });
      setIsSent(true);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.';
      setError(message);
    } finally {
      setIsLoading(false);
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

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex flex-col justify-center px-8 py-6 sm:px-12 sm:py-8 md:px-16 md:py-10 lg:px-20 lg:py-12 bg-white relative z-10 min-h-screen lg:min-h-0 overflow-y-auto">
        <div className="w-full max-w-md mx-auto py-4">
          {/* Logo */}
          <div className="-mb-2 lg:-mb-4 relative z-0 flex justify-center">
            <img src={logoImage} alt="SpeakUp Logo" className="h-20 md:h-28 object-contain object-center" />
          </div>

          {/* Back Link */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-6 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Login
          </Link>

          {!isSent ? (
            <>
              {/* Heading */}
              <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
                Lupa Password?
              </h1>
              <p className="text-sm text-gray-500 mb-8 font-medium leading-relaxed">
                Jangan khawatir! Masukkan email yang terdaftar dan kami akan mengirimkan link untuk mereset password Anda.
              </p>

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="masukkan@email.com"
                      className="w-full pl-12 pr-5 py-4 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-sm text-gray-700 placeholder:text-gray-400"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 mt-2 rounded-xl bg-[#00158b] hover:bg-[#00158b]/90 text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Kirim Link Reset
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* Success State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Email Terkirim! 📧
              </h2>
              <p className="text-sm text-gray-600 mb-2 leading-relaxed max-w-sm mx-auto">
                Link reset password telah dikirim ke email <span className="font-semibold text-purple-600">{email}</span>.
              </p>
              <p className="text-sm text-gray-500 mb-8 leading-relaxed max-w-sm mx-auto">
                Silakan periksa inbox atau folder spam Anda. Link reset berlaku selama 60 menit.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => { setIsSent(false); setEmail(''); }}
                  className="w-full py-3 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Kirim Ulang ke Email Lain
                </button>
                <Link
                  to="/login"
                  className="block w-full py-3 rounded-xl bg-[#00158b] text-white text-sm font-bold hover:bg-[#00158b]/90 transition-all text-center"
                >
                  Kembali ke Login
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
