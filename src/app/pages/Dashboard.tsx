import { NotificationPanel } from '../components/NotificationPanel';
import { AdvancedFilters } from '../components/AdvancedFilters';
import { ExportModal } from '../components/ExportModal';
import { getReports, type Report } from '../services/reportService';
import { 
  getReportStats, 
  getCategoryDistribution, 
  getTrendData,
  getLocationDistribution,
  getClassDistribution,
  getSentimentData,
  getTimeDistribution,
  getKeywordFrequency
} from '../utils/reportUtils';
import { 
  mockReports, 
  weeklyComparison,
  sentimentTrend,
  priorityData
} from '../data/mockData';
import { motion } from 'motion/react';
import { RiskBadge } from '../components/RiskBadge';
import { PieChart as PieChartIcon } from 'lucide-react';
import { 
  LineChart, 
  Line, 
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
  Legend,
  Area,
  AreaChart,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

export function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('all');
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
  const sentimentData = getSentimentData(reports);
  const timeData = getTimeDistribution(reports);
  const keywordData = getKeywordFrequency(reports);

  // Filter reports based on search and filters
  const filteredReports = reports.filter(report => {
    const matchesSearch = searchQuery === '' || 
      report.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.keywords.some(kw => kw.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRisk = filterRisk === 'all' || report.riskLevel === filterRisk;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    
    let matchesDate = true;
    if (filterDate !== 'all') {
      const reportDate = new Date(report.timestamp);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (filterDate === 'today') matchesDate = daysDiff === 0;
      else if (filterDate === 'week') matchesDate = daysDiff <= 7;
      else if (filterDate === 'month') matchesDate = daysDiff <= 30;
    }
    
    return matchesSearch && matchesRisk && matchesStatus && matchesDate;
  });
  
  const highRiskReports = filteredReports
    .filter(r => (r.riskLevel === 'high' || r.riskLevel === 'critical') && r.status === 'new')
    .slice(0, 3);
  
  const recentReports = filteredReports
    .slice(0, 8);

  const COLORS = ['#00158b', '#10b981', '#f59e0b', '#ef4444'];
  const SENTIMENT_COLORS = ['#ef4444', '#f59e0b', '#10b981'];

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
  
  const negativeCount = sentimentData.find(s => s.name === 'Negative')?.value || 0;
  const avgSentimentScore = stats.totalReports > 0 
    ? ((negativeCount / stats.totalReports) * 100).toFixed(0)
    : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/30 backdrop-blur-2xl border-b border-white/40">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-semibold text-[#00158b] mb-1">
                Dashboard Monitoring
              </h1>
              <p className="text-gray-600">
                Analisis real-time laporan bullying • {new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <NotificationPanel />
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#00158b] text-white rounded-xl font-medium hover:bg-[#00158b]/90 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Export Data
              </button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari laporan, kata kunci, atau ID..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
            <AdvancedFilters 
              onFilterChange={(filters) => {
                setFilterRisk(filters.risk);
                setFilterStatus(filters.status);
                setFilterDate(filters.date);
              }}
            />
          </div>

          {/* View Toggle */}
          <div className="mt-4 flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-fit">
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                selectedView === 'overview'
                  ? 'bg-white text-[#00158b] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedView('analytics')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                selectedView === 'analytics'
                  ? 'bg-white text-[#00158b] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Advanced Analytics
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {selectedView === 'overview' ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Laporan</p>
                    <p className="text-3xl font-semibold text-gray-900">{stats.totalReports}</p>
                    <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +12% dari bulan lalu
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#00158b]/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#00158b]" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Risiko Tinggi</p>
                    <p className="text-3xl font-semibold text-red-600">{stats.highRiskCount}</p>
                    <p className="text-xs text-gray-600 mt-2">Perlu tindakan segera</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tingkat Resolusi</p>
                    <p className="text-3xl font-semibold text-green-600">{resolvedRate}%</p>
                    <p className="text-xs text-gray-600 mt-2">Kasus terselesaikan</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Rata-rata Sentimen</p>
                    <p className="text-3xl font-semibold text-orange-600">{avgSentimentScore}%</p>
                    <p className="text-xs text-gray-600 mt-2">Skala -1 hingga +1</p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                    <TrendingDown className="w-6 h-6 text-orange-600" />
                  </div>
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
                              {report.location && (
                                <span className="text-xs text-gray-600 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {report.location}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                              {report.content}
                            </p>
                            <p className="text-xs text-blue-700 bg-blue-50 inline-block px-2 py-1 rounded">
                              {report.aiSummary.substring(0, 60)}...
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 items-end">
                            <div className="flex flex-wrap gap-1 justify-end">
                              {report.categories.slice(0, 2).map((cat, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium"
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-2 gap-6 mb-8">
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
                  <AreaChart data={trendData}>
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
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                  <BarChart data={locationData.slice(0, 6)} layout="vertical">
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
                  Distribusi per Tingkat
                </h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={classData}>
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
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Risiko
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Isi Laporan
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Lokasi
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
                    {recentReports.map((report) => (
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
                            Confidence: {report.confidence}%
                          </p>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {report.location || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {formatDate(report.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`
                            px-3 py-1 rounded-full text-xs font-medium
                            ${report.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                              report.status === 'reviewed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              'bg-green-50 text-green-700 border border-green-200'}
                          `}>
                            {report.status === 'pending' ? 'Pending' :
                             report.status === 'reviewed' ? 'Ditinjau' : 'Selesai'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Menampilkan {recentReports.length} dari {mockReports.length} laporan
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
          </>
        ) : (
          <>
            {/* Advanced Analytics View */}
            <div className="grid gap-6">
              {/* Weekly Comparison */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#00158b]" />
                  Perbandingan Mingguan
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#999" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#999" />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: '1px solid #e5e7eb',
                        fontSize: '12px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="current" fill="#00158b" name="Minggu Ini" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="previous" fill="#93c5fd" name="Minggu Lalu" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Sentiment Trend & Emotion Radar */}
              <div className="grid grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
                >
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-orange-600" />
                    Tren Sentimen
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={sentimentTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#999" />
                      <YAxis domain={[-1, 1]} tick={{ fontSize: 12 }} stroke="#999" />
                      <Tooltip 
                        contentStyle={{ 
                          borderRadius: '12px', 
                          border: '1px solid #e5e7eb',
                          fontSize: '12px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="sentiment" 
                        stroke="#f59e0b" 
                        strokeWidth={3}
                        dot={{ fill: '#f59e0b', r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
                >
                  <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#00158b]" />
                    Profil Emosi Rata-rata
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={emotionData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="emotion" tick={{ fontSize: 12 }} />
                      <PolarRadiusAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                      <Radar 
                        name="Intensitas" 
                        dataKey="value" 
                        stroke="#00158b" 
                        fill="#00158b" 
                        fillOpacity={0.6} 
                      />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              {/* Priority Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <h2 className="font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Distribusi Prioritas Kasus
                </h2>
                <div className="grid grid-cols-4 gap-4">
                  {priorityData.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="p-6 rounded-xl border-2 hover:shadow-lg transition-all"
                      style={{ borderColor: item.color }}
                    >
                      <div className="text-center">
                        <div 
                          className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center"
                          style={{ backgroundColor: `${item.color}20` }}
                        >
                          <p className="text-2xl font-bold" style={{ color: item.color }}>
                            {item.value}
                          </p>
                        </div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {((item.value / mockReports.length) * 100).toFixed(0)}% dari total
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>

      <ExportModal isOpen={showExportModal} onClose={() => setShowExportModal(false)} />
    </div>
  );
}