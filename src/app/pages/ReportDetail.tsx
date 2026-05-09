import { useParams, Link, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Brain, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  MapPin,
  Shield,
  Calendar,
  Hash,
  Save
} from 'lucide-react';
import { RiskBadge } from '../components/RiskBadge';
import { ChatBox } from '../components/ChatBox';
import { getReportById, updateReportStatus, updateReportNotes, type Report } from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';

export function ReportDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);


  useEffect(() => {
    const fetchReport = async () => {
      if (id) {
        try {
          const foundReport = await getReportById(id);
          setReport(foundReport);
          setNotes(foundReport?.notes || '');
        } catch (error) {
          console.error('Failed to fetch report', error);
        }
      }
    };
    fetchReport();
  }, [id]);

  const handleStatusChange = async (newStatus: Report['status']) => {
    if (id) {
      try {
        await updateReportStatus(id, newStatus);
        const updatedReport = await getReportById(id);
        setReport(updatedReport);
      } catch (error) {
        console.error('Failed to update status', error);
      }
    }
  };

  const handleSaveNotes = async () => {
    if (id) {
      setIsSaving(true);
      try {
        await updateReportNotes(id, notes);
        const updatedReport = await getReportById(id);
        setReport(updatedReport);
        
        // Show success feedback
        setTimeout(() => {
          setIsSaving(false);
        }, 2000);
      } catch (error) {
        console.error('Failed to save notes', error);
        setIsSaving(false);
      }
    }
  };



  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Laporan Tidak Ditemukan
          </h2>
          <Link to="/" className="text-blue-600 hover:text-blue-700">
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: string) => {
    try {
      const d = new Date(timestamp);
      if (isNaN(d.getTime())) return 'Tanggal tidak tersedia';
      return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'full',
        timeStyle: 'short'
      }).format(d);
    } catch {
      return 'Tanggal tidak tersedia';
    }
  };

  const highlightText = (text: string) => {
    let highlightedText = text;
    report.keywords.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedText = highlightedText.replace(
        regex,
        '<mark class="bg-red-200 text-red-900 px-1 rounded">$1</mark>'
      );
    });
    return highlightedText;
  };
  
  // Calculate sentiment value from string (-1 to 1 scale)
  const sentimentValue = report.sentiment === 'negative' ? -0.7 : 
                         report.sentiment === 'neutral' ? 0 : 0.7;
  
  // Generate AI summary based on data
  const generateAISummary = () => {
    const riskText = report.riskLevel === 'critical' ? 'SANGAT SERIUS dan memerlukan tindakan SEGERA' :
                     report.riskLevel === 'high' ? 'serius dan perlu penanganan prioritas' :
                     report.riskLevel === 'medium' ? 'cukup serius dan perlu perhatian' :
                     'relatif ringan namun tetap perlu monitoring';
    
    return `Laporan ini mengindikasikan kasus bullying yang ${riskText}. Sistem mendeteksi ${report.keywords.length} kata kunci terkait perundungan dengan confidence score ${report.aiScore}%. Berdasarkan analisis sentimen, pelapor menunjukkan emosi ${report.sentiment === 'negative' ? 'negatif yang kuat' : report.sentiment === 'neutral' ? 'campuran' : 'cukup positif'}. Kategori utama: ${report.categories.join(', ')}.`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-20 md:pt-8 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Detail Laporan #{report.id}
                </h1>
                <RiskBadge level={report.riskLevel} />
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(report.timestamp)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    Siswa {report.studentInitial} - {report.studentClass}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <span className={`
                px-3 py-1.5 rounded-lg text-sm font-medium
                ${report.status === 'new' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                  report.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  'bg-green-50 text-green-700 border border-green-200'}
              `}>
                {report.status === 'new' ? '⏳ Baru' :
                 report.status === 'in-progress' ? '👁️ Ditinjau' : '✅ Selesai'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* Main Content - Left Column (full width on mobile, 2/3 on desktop) */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            {/* Report Content */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Isi Laporan</h2>
              <div className="bg-gray-50 rounded-xl p-5">
                <p
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: highlightText(report.content) }}
                />
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Kategori yang dilaporkan:</p>
                <div className="flex flex-wrap gap-2">
                  {report.categories.map((cat, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Analysis Panel */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                Panel Analisis AI
              </h2>

              {/* Risk Assessment */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Tingkat Risiko</h3>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    report.riskLevel === 'high' ? 'bg-red-100' :
                    report.riskLevel === 'medium' ? 'bg-yellow-100' : 'bg-green-100'
                  }`}>
                    <AlertCircle className={`w-8 h-8 ${
                      report.riskLevel === 'high' ? 'text-red-600' :
                      report.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <RiskBadge level={report.riskLevel} size="md" />
                    <div className="mt-2 w-full">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Confidence Score</span>
                        <span className="font-medium">{report.aiScore}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                          style={{ width: `${report.aiScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detected Words */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Kata Terdeteksi</h3>
                <div className="flex flex-wrap gap-2">
                  {report.keywords.map((word, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-200"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>

              {/* Sentiment */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Analisis Sentimen
                </h3>
                <div className="relative h-6 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full">
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-gray-900 rounded-full shadow-lg"
                    style={{ left: `${((sentimentValue + 1) / 2) * 100}%`, transform: 'translate(-50%, -50%)' }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                  <span>Negatif</span>
                  <span>Netral</span>
                  <span>Positif</span>
                </div>
              </div>

              {/* AI Summary */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Ringkasan AI</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {generateAISummary()}
                </p>
              </div>
            </div>

            {/* Recommended Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Rekomendasi Tindakan</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-white">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Follow-up Pribadi</p>
                    <p className="text-sm text-gray-700">
                      Lakukan konseling individual untuk memahami situasi lebih dalam
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="w-6 h-6 rounded-full bg-yellow-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-white">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Monitoring Berkelanjutan</p>
                    <p className="text-sm text-gray-700">
                      Pantau perkembangan kasus secara berkala selama 2-4 minggu
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-white">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Eskalasi ke Kepala Sekolah</p>
                    <p className="text-sm text-gray-700">
                      Untuk kasus berat, laporkan ke pihak berwenang yang lebih tinggi
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Box */}
            <ChatBox 
              report={report}
              userId={user?.id || ''}
              userName={user?.name || ''}
              userRole="counselor"
              onMessagesUpdate={async () => {
                if (id) {
                  try {
                    const updatedReport = await getReportById(id);
                    setReport(updatedReport);
                  } catch (error) {
                    console.error('Failed to refresh report after message', error);
                  }
                }
              }}
            />
          </div>

          {/* Right Sidebar - Action Panel */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
              <div className="space-y-3">

                <button
                  onClick={() => handleStatusChange('in-progress')}
                  className="w-full py-3 px-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Tandai Ditinjau
                </button>
                <button
                  onClick={() => handleStatusChange('resolved')}
                  className="w-full py-3 px-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Tandai Selesai
                </button>
              </div>
            </div>

            {/* Report Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Informasi</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">ID Laporan</p>
                  <p className="text-sm font-medium text-gray-900">#{report.id}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Waktu Dilaporkan</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(report.timestamp)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Sumber</p>
                  <p className="text-sm font-medium text-gray-900">Formulir Anonim</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Status</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {report.status === 'new' ? 'Menunggu Tindakan' :
                     report.status === 'in-progress' ? 'Sedang Ditinjau' : 'Terselesaikan'}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Catatan Internal</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tambahkan catatan untuk tim BK..."
                className="w-full h-32 px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none text-sm"
              />
              <button
                onClick={handleSaveNotes}
                disabled={isSaving}
                className={`w-full mt-3 py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                  isSaving 
                    ? 'bg-green-600 text-white shadow-sm' 
                    : 'bg-[#00158b] text-white hover:bg-[#00158b]/90 shadow-sm hover:shadow-md'
                }`}
              >
                {isSaving ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Tersimpan!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Simpan Catatan
                  </>
                )}
              </button>
            </div>
          </div>
        </div>


      </div>
    </div>
  );
}