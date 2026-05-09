import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { 
  AlertTriangle, 
  TrendingUp, 
  FileText, 
  Download,
  PieChart as PieChartIcon,
  Users,
  MapPin,
  Activity,
  Search,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { motion } from 'motion/react';
import { RiskBadge } from '../components/RiskBadge';
import { NotificationPanel } from '../components/NotificationPanel';
import { AdvancedFilters, type FilterOptions } from '../components/AdvancedFilters';
import { ExportModal } from '../components/ExportModal';
import { getReports, type Report } from '../services/reportService';
import { 
  getReportStats, 
  getCategoryDistribution, 
  getTrendData,
  getLocationDistribution,
  getClassDistribution,
} from '../utils/reportUtils';

export function DashboardSimple() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    riskLevel: [],
    status: [],
    category: [],
    dateRange: 'all',
    priority: [],
    grade: []
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load reports from API on mount
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const loadedReports = await getReports();
        setReports(loadedReports || []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat data laporan dari server.');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchReports();
    
    // Refresh reports every 10 seconds
    const interval = setInterval(fetchReports, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#00158b] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#00158b] font-medium">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = getReportStats(reports);
  const categoryData = getCategoryDistribution(reports);
  const trendData = getTrendData(reports);
  const locationData = getLocationDistribution(reports);
  const classData = getClassDistribution(reports);

  // Add unique IDs to chart data to prevent duplicate key warnings
  const categoryDataWithIds = categoryData.map((item, idx) => ({ 
    ...item, 
    id: `cat-${item.name}-${idx}-${item.value}`,
    uniqueKey: `cat-${idx}`
  }));
  const trendDataWithIds = trendData.map((item, idx) => ({ 
    ...item, 
    id: `trend-${item.date}-${idx}-${item.count}`,
    uniqueKey: `trend-${idx}`
  }));
  const locationDataWithIds = locationData.map((item, idx) => ({ 
    ...item, 
    id: `loc-${item.name}-${idx}-${item.value}`,
    uniqueKey: `loc-${idx}`
  }));
  const classDataWithIds = classData.map((item, idx) => ({ 
    ...item, 
    id: `class-${item.name}-${idx}-${item.value}`,
    uniqueKey: `class-${idx}`
  }));

  // Filter reports based on search and all active filters
  const filteredReports = reports.filter(report => {
    // Search
    const matchesSearch = searchQuery === '' ||
      report.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.keywords.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase()));

    // Risk Level
    const matchesRisk = activeFilters.riskLevel.length === 0 ||
      activeFilters.riskLevel.includes(report.riskLevel);

    // Status — data uses 'new', 'in-progress', 'resolved'
    const matchesStatus = activeFilters.status.length === 0 ||
      activeFilters.status.includes(report.status);

    // Category
    const matchesCategory = activeFilters.category.length === 0 ||
      report.categories.some(c => activeFilters.category.includes(c));

    // Grade — report.studentClass is e.g. "10-1", filter value is e.g. "10-1"
    const matchesGrade = activeFilters.grade.length === 0 || activeFilters.grade.some(g => {
      const studentClass = (report.studentClass || '').toUpperCase();
      const filterGrade = g.toUpperCase();
      return studentClass === filterGrade || studentClass.includes(filterGrade);
    });

    // Date Range
    let matchesDate = true;
    if (activeFilters.dateRange !== 'all') {
      const reportDate = new Date(report.timestamp);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24));
      if (activeFilters.dateRange === 'today') matchesDate = daysDiff === 0;
      else if (activeFilters.dateRange === 'week') matchesDate = daysDiff <= 7;
      else if (activeFilters.dateRange === 'month') matchesDate = daysDiff <= 30;
    }

    return matchesSearch && matchesRisk && matchesStatus && matchesCategory && matchesGrade && matchesDate;
  });
  
  const highRiskReports = filteredReports
    .filter(r => (r.riskLevel === 'high' || r.riskLevel === 'critical') && r.status === 'new')
    .slice(0, 3);
  
  const recentReports = filteredReports
    .slice(0, 8);

  const COLORS = ['#00158b', '#10b981', '#f59e0b', '#ef4444'];

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Baru saja';
    if (hours < 24) return `${hours} jam lalu`;
    if (days === 1) return 'Kemarin';
    return `${days} hari lalu`;
  };

  const resolvedRate = stats.totalReports > 0 
    ? ((stats.resolvedCount / stats.totalReports) * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Enhanced Header with Glassmorphism */}
      <div className="sticky top-0 md:top-0 z-30 bg-white/30 backdrop-blur-2xl border-b border-white/40 mt-14 md:mt-0">
        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-[#00158b] mb-1">
                Dashboard Monitoring
              </h1>
              <p className="text-gray-600 flex items-center gap-2 text-xs md:text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="hidden sm:inline">Real-time Analytics •</span>
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <NotificationPanel />
              <button
                onClick={() => setShowExportModal(true)}
                className="group flex items-center gap-2 px-3 md:px-6 py-2.5 md:py-3 bg-[#00158b] text-white rounded-xl font-medium hover:bg-[#00158b]/90 transition-all shadow-sm hover:shadow-md hover:scale-105 text-sm"
              >
                <Download className="w-4 h-4 md:w-5 md:h-5 group-hover:animate-bounce" />
                <span className="hidden sm:inline">Export Data</span>
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex-1 relative group">
              <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 group-focus-within:text-[#00158b] transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari laporan..."
                className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#00158b] focus:ring-4 focus:ring-[#00158b]/20 transition-all bg-white/80 backdrop-blur-sm text-sm"
              />
            </div>
            <AdvancedFilters
              onFilterChange={(filters) => setActiveFilters(filters)}
            />
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8">
        {/* Enhanced Stats Cards with Gradient Borders */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => {
              setFilterRisk('all');
              setFilterStatus('all');
            }}
            className="group relative bg-white rounded-2xl shadow-md border-2 border-transparent p-3 md:p-6 hover:shadow-2xl hover:shadow-blue-500/20 transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-2 md:mb-4">
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1 truncate">Total Laporan</p>
                  <p className="text-2xl md:text-4xl font-bold text-gray-900">{stats.totalReports}</p>
                </div>
                <div className="w-10 h-10 md:w-14 md:h-14 flex-shrink-0 rounded-2xl bg-[#00158b] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform ml-2">
                  <FileText className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
              </div>
              <p className="text-xs text-[#00158b] font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5" />
                <span className="hidden sm:inline">Klik untuk lihat semua</span>
                <span className="sm:hidden">Lihat semua</span>
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => {
              setFilterRisk('high');
              setFilterStatus('all');
            }}
            className="group relative bg-white rounded-2xl shadow-md border-2 border-transparent p-3 md:p-6 hover:shadow-2xl hover:shadow-red-500/20 transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-2 md:mb-4">
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1 truncate">Risiko Tinggi</p>
                  <p className="text-2xl md:text-4xl font-bold text-red-600">{stats.highRiskCount}</p>
                </div>
                <div className="w-10 h-10 md:w-14 md:h-14 flex-shrink-0 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform ml-2">
                  <AlertTriangle className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
              </div>
              <p className="text-xs text-red-600 font-medium">Klik untuk filter</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => {
              setFilterRisk('all');
              setFilterStatus('new');
            }}
            className="group relative bg-white rounded-2xl shadow-md border-2 border-transparent p-3 md:p-6 hover:shadow-2xl hover:shadow-orange-500/20 transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-2 md:mb-4">
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1 truncate">Laporan Baru</p>
                  <p className="text-2xl md:text-4xl font-bold text-orange-600">{stats.newReports}</p>
                </div>
                <div className="w-10 h-10 md:w-14 md:h-14 flex-shrink-0 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform ml-2">
                  <FileText className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
              </div>
              <p className="text-xs text-orange-600 font-medium">Klik untuk filter</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onClick={() => {
              setFilterRisk('all');
              setFilterStatus('resolved');
            }}
            className="group relative bg-white rounded-2xl shadow-md border-2 border-transparent p-3 md:p-6 hover:shadow-2xl hover:shadow-green-500/20 transition-all cursor-pointer overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-2 md:mb-4">
                <div className="min-w-0">
                  <p className="text-xs md:text-sm font-medium text-gray-600 mb-1 truncate">Resolusi</p>
                  <p className="text-2xl md:text-4xl font-bold text-green-600">{resolvedRate}%</p>
                </div>
                <div className="w-10 h-10 md:w-14 md:h-14 flex-shrink-0 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform ml-2">
                  <Activity className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </div>
              </div>
              <p className="text-xs text-green-600 font-medium">Klik untuk filter</p>
            </div>
          </motion.div>
        </div>

        {/* Urgent Alerts */}
        {highRiskReports.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-600 animate-pulse" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-red-900 mb-1 text-lg">
                  ⚠️ Alert Mendesak - {highRiskReports.length} Kasus Risiko Tinggi
                </h2>
                <p className="text-sm text-red-700">
                  Kasus berikut memerlukan tindakan segera dari tim BK. Prioritas tertinggi untuk penanganan.
                </p>
              </div>
            </div>
            <div className="grid gap-3">
              {highRiskReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <Link
                    to={`/report/${report.id}`}
                    className="block bg-white rounded-xl p-4 border-2 border-red-200 hover:border-red-400 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <RiskBadge level={report.riskLevel} size="sm" />
                          <span className="text-xs text-gray-500">{formatDate(report.timestamp)}</span>
                          <span className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                            Siswa {report.studentInitial} - {report.studentClass}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                          {report.content}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded">
                            {report.keywords.length} kata kunci terdeteksi
                          </span>
                          <span className="text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded">
                            AI Score: {report.aiScore}/100
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Trend Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#00158b]" />
              Tren Laporan (7 Hari Terakhir)
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trendDataWithIds}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00158b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00158b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#999"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#999"
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #e5e7eb',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#00158b" 
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-[#00158b]" />
              Distribusi Jenis Bullying
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryDataWithIds}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryDataWithIds.map((entry) => (
                    <Cell key={entry.uniqueKey} fill={COLORS[categoryDataWithIds.indexOf(entry) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Location Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Distribusi Lokasi
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={locationDataWithIds.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#999" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} stroke="#999" />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #e5e7eb',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Grade Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              Distribusi per Kelas
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={classDataWithIds}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12 }}
                  stroke="#999"
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#999"
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #e5e7eb',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Recent Reports Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 text-lg">Laporan Terbaru</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{recentReports.length} laporan</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto -mx-0">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Risiko
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Isi Laporan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Pelapor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Kategori
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Waktu
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="font-medium">Belum ada laporan</p>
                      <p className="text-sm">Laporan akan muncul di sini setelah siswa mengirim laporan</p>
                    </td>
                  </tr>
                ) : (
                  recentReports.map((report) => (
                    <tr 
                      key={report.id}
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RiskBadge level={report.riskLevel} size="sm" />
                      </td>
                      <td className="px-6 py-4 max-w-md">
                        <Link 
                          to={`/report/${report.id}`}
                          className="text-sm text-gray-900 hover:text-blue-600 line-clamp-2 group-hover:underline"
                        >
                          {report.content}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">
                          AI Score: {report.aiScore}/100 • {report.keywords.length} kata kunci
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#00158b] flex items-center justify-center text-white text-xs font-bold">
                            {report.studentInitial}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Siswa {report.studentInitial}</p>
                            <p className="text-xs text-gray-500">{report.studentClass}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {report.categories.slice(0, 2).map((cat, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(report.timestamp)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`
                          px-3 py-1 rounded-full text-xs font-medium
                          ${report.status === 'new' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                            report.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            'bg-green-50 text-green-700 border border-green-200'}
                        `}>
                          {report.status === 'new' ? 'Baru' :
                           report.status === 'in-progress' ? 'Ditinjau' : 'Selesai'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Menampilkan {recentReports.length} dari {reports.length} laporan
            </p>
            <Link
              to="#"
              className="text-sm text-[#00158b] hover:text-[#00158b]/80 font-medium flex items-center gap-1"
            >
              Lihat Semua Laporan 
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>

      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
    </div>
  );
}