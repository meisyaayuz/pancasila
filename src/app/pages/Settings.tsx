import { useState } from 'react';
import { User, Lock, Bell, Shield, Eye, EyeOff, CheckCircle2, AlertCircle, Save, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router';
import api from '../services/api';

type SettingsTab = 'profile' | 'security' | 'notifications';

export function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Notification state
  const [emailNotif, setEmailNotif] = useState(true);
  const [chatNotif, setChatNotif] = useState(true);
  const [reportNotif, setReportNotif] = useState(true);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    setProfileSaving(true);

    try {
      const response = await api.put('/user/profile', { name, avatar });
      const updatedUser = response.data.user;
      // Update localStorage
      localStorage.setItem('safeschool_user', JSON.stringify(updatedUser));
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Gagal memperbarui profil.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError('Password baru minimal 8 karakter');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok');
      return;
    }

    setPasswordSaving(true);
    try {
      await api.put('/user/password', {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      const message = err.response?.data?.errors?.current_password?.[0]
        || err.response?.data?.message
        || 'Gagal memperbarui password.';
      setPasswordError(message);
    } finally {
      setPasswordSaving(false);
    }
  };

  const tabs = [
    { id: 'profile' as SettingsTab, label: 'Profil', icon: User },
    { id: 'security' as SettingsTab, label: 'Keamanan', icon: Lock },
    { id: 'notifications' as SettingsTab, label: 'Notifikasi', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-20 md:pt-8 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Pengaturan</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Kelola profil, keamanan, dan preferensi notifikasi Anda
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-1.5 mb-6 flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#00158b] text-white shadow-lg shadow-[#00158b]/20'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Informasi Profil</h2>
                    <p className="text-sm text-gray-500">Perbarui nama dan avatar Anda</p>
                  </div>
                </div>

                {profileSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-700 font-medium">Profil berhasil diperbarui!</p>
                  </motion.div>
                )}

                {profileError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">{profileError}</p>
                  </motion.div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-5">
                  {/* Avatar Preview */}
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md ${
                      user?.role === 'teacher'
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                        : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                    }`}>
                      {avatar || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{name || 'User'}</p>
                      <p className="text-sm text-gray-500">
                        {user?.role === 'teacher' ? 'Guru BK' : `Siswa - Kelas ${user?.class}`}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Inisial Avatar</label>
                    <input
                      type="text"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value.toUpperCase().slice(0, 3))}
                      maxLength={3}
                      placeholder="EN"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-sm"
                    />
                    <p className="text-xs text-gray-400 mt-1">Maksimal 3 karakter, contoh: EN</p>
                  </div>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00158b] text-white text-sm font-medium hover:bg-[#00158b]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {profileSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Lock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Ubah Password</h2>
                    <p className="text-sm text-gray-500">Pastikan Anda menggunakan password yang kuat</p>
                  </div>
                </div>

                {passwordSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-700 font-medium">Password berhasil diperbarui!</p>
                  </motion.div>
                )}

                {passwordError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">{passwordError}</p>
                  </motion.div>
                )}

                <form onSubmit={handlePasswordSave} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Saat Ini</label>
                    <div className="relative">
                      <input
                        type={showCurrentPw ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Masukkan password lama"
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru</label>
                    <div className="relative">
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimal 8 karakter"
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password Baru</label>
                    <div className="relative">
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password baru"
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-sm"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Password strength indicator */}
                  {newPassword && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-600">Kekuatan Password:</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              newPassword.length >= level * 3
                                ? level <= 1 ? 'bg-red-500'
                                  : level <= 2 ? 'bg-yellow-500'
                                  : level <= 3 ? 'bg-blue-500'
                                  : 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        {newPassword.length < 4 ? 'Sangat lemah' :
                         newPassword.length < 7 ? 'Lemah' :
                         newPassword.length < 10 ? 'Cukup kuat' : 'Kuat'}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#00158b] text-white text-sm font-medium hover:bg-[#00158b]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passwordSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Ubah Password
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Security Tips */}
              <div className="mt-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">Tips Keamanan Akun</p>
                    <ul className="text-sm text-gray-700 space-y-1.5">
                      <li>• Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol</li>
                      <li>• Jangan gunakan password yang sama dengan akun lain</li>
                      <li>• Jangan bagikan password Anda kepada siapapun</li>
                      <li>• Ubah password secara berkala setiap 3 bulan</li>
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">Preferensi Notifikasi</h2>
                    <p className="text-sm text-gray-500">Atur notifikasi yang ingin Anda terima</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm">📧</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Notifikasi Email</p>
                        <p className="text-xs text-gray-500">Terima pembaruan melalui email</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEmailNotif(!emailNotif)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        emailNotif ? 'bg-[#00158b]' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        emailNotif ? 'translate-x-5.5 left-auto right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>

                  {/* Chat Notifications */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm">💬</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Notifikasi Chat</p>
                        <p className="text-xs text-gray-500">Terima pemberitahuan pesan baru</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setChatNotif(!chatNotif)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        chatNotif ? 'bg-[#00158b]' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        chatNotif ? 'translate-x-5.5 left-auto right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>

                  {/* Report Notifications */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm">📋</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">Pembaruan Laporan</p>
                        <p className="text-xs text-gray-500">
                          {user?.role === 'teacher'
                            ? 'Terima notifikasi saat ada laporan baru'
                            : 'Terima notifikasi saat status laporan berubah'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setReportNotif(!reportNotif)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        reportNotif ? 'bg-[#00158b]' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        reportNotif ? 'translate-x-5.5 left-auto right-0.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-4">
                  💡 Pengaturan notifikasi disimpan secara lokal di perangkat Anda.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
