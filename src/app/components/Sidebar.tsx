import { Link, useLocation, useNavigate } from 'react-router';
import { LayoutDashboard, MessageSquare, BarChart3, Shield, Settings, HelpCircle, LogOut, FileText, X, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { getUnreadMessagesCount, getPendingContactRequestsCount, getReportsByStudentId, getReports } from '../services/reportService';
import logoImage from '../../assets/Logo SpeakUp.png';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [todayStats, setTodayStats] = useState({ newReports: 0, highRisk: 0 });
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    const updateCounts = async () => {
      if (user) {
        try {
          const unread = await getUnreadMessagesCount(user.id, user.role);
          setUnreadCount(unread || 0);
          if (user.role === 'student') {
            const pending = await getPendingContactRequestsCount(user.id);
            setPendingRequestsCount(pending || 0);
          } else if (user.role === 'teacher') {
            const reports = await getReports();
            const validReports = Array.isArray(reports) ? reports : [];
            setTodayStats({
              newReports: validReports.filter(r => r.status === 'new').length,
              highRisk: validReports.filter(r => r.riskLevel === 'high' || r.riskLevel === 'critical').length
            });
          }
        } catch (error) {
          console.error('Error updating sidebar counts:', error);
        }
      }
    };
    updateCounts();
    const interval = setInterval(updateCounts, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const navItems = user?.role === 'teacher'
    ? [{ path: '/', icon: LayoutDashboard, label: 'Dashboard', badge: null }]
    : [
        { path: '/student-report', icon: MessageSquare, label: 'Buat Laporan', badge: null },
        { path: '/my-reports', icon: FileText, label: 'Laporan Saya', badge: (unreadCount + pendingRequestsCount) > 0 ? unreadCount + pendingRequestsCount : null },
      ];

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const handleLogout = () => { logout(); navigate('/login'); };

  // ── Shared sidebar content ──────────────────────────────────────────────
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="pt-8 pb-4 px-6 flex items-center justify-between">
        <img src={logoImage} alt="SpeakUp Logo" className="h-10 object-contain" />
        {/* Close button - mobile only */}
        <button
          className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User Profile */}
      <div className="px-6 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-blue-200 shadow-lg">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold shadow-md ${
            user?.role === 'teacher'
              ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
              : 'bg-gradient-to-br from-blue-500 to-cyan-500'
          }`}>
            {user?.avatar || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{user?.name}</p>
            <p className="text-xs text-gray-600 font-medium">
              {user?.role === 'teacher' ? user?.subject : `Kelas ${user?.class}`}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
            Menu Utama
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path} className="relative group block">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
                    active ? 'bg-[#00158b] text-white shadow-lg shadow-[#00158b]/30' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-gray-600'}`} />
                  <span className="font-medium flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </motion.div>
                {active && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#00158b] rounded-r-full"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Quick Stats - Teacher only */}
        {user?.role === 'teacher' && (
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
            <div className="flex items-start gap-2 mb-3">
              <BarChart3 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Statistik Hari Ini</p>
                <p className="text-xs text-gray-600 mt-0.5">Update terakhir: 10 menit lalu</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Laporan Baru</span>
                <span className="text-sm font-bold text-purple-600">{todayStats.newReports}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Risiko Tinggi</span>
                <span className="text-sm font-bold text-red-600">{todayStats.highRisk}</span>
              </div>
            </div>
          </div>
        )}

        {/* Privacy info */}
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-green-50 border border-blue-200">
          <div className="flex items-start gap-2">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">Data Aman & Terenkripsi</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                Semua laporan bersifat anonim dan dilindungi dengan enkripsi end-to-end
              </p>
            </div>
          </div>
        </div>

        {/* Bottom links */}
        <div className="mt-6 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">Lainnya</p>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-sm">Pengaturan</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-all">
            <HelpCircle className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-sm">Bantuan</span>
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Keluar</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">SpeakUp v2.0</p>
        <p className="text-xs text-gray-400 text-center mt-1">© 2026 • Semua Hak Dilindungi</p>
      </div>
    </>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR (md+) ─────────────────────────────────────── */}
      <div className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white/95 backdrop-blur-lg border-r border-gray-200/80 flex-col shadow-2xl z-40">
        <SidebarContent />
      </div>

      {/* ── MOBILE TOP BAR ────────────────────────────────────────────── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 flex items-center justify-between px-4 py-3 shadow-sm">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-700 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <img src={logoImage} alt="SpeakUp Logo" className="h-8 object-contain" />
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm ${
          user?.role === 'teacher' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-cyan-500'
        }`}>
          {user?.avatar || 'U'}
        </div>
      </div>

      {/* ── MOBILE DRAWER ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 z-50 bg-black/40"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="md:hidden fixed left-0 top-0 h-screen w-72 bg-white flex flex-col shadow-2xl z-50 overflow-y-auto"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── MOBILE BOTTOM NAV ─────────────────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex items-center justify-around px-2 py-2 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`relative flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all ${
                active ? 'text-[#00158b]' : 'text-gray-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.badge && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl text-red-500 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-medium">Keluar</span>
        </button>
      </div>
    </>
  );
}