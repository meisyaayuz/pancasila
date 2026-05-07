import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { FileText, Clock, AlertCircle, CheckCircle2, Eye, TrendingUp, Phone, X, MessageCircle } from 'lucide-react';
import { getReportsByStudentId, updateContactRequestStatus, getPendingContactRequestsCount, getUnreadMessagesCountForReport, type Report } from '../services/reportService';
import { RiskBadge } from '../components/RiskBadge';
import { ChatBox } from '../components/ChatBox';
import { useAuth } from '../contexts/AuthContext';

export function MyReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<'all' | 'new' | 'in-progress' | 'resolved'>('all');
  const [selectedRequest, setSelectedRequest] = useState<Report | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedChatReport, setSelectedChatReport] = useState<Report | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    loadReports();
    // Auto refresh setiap 5 detik
    const interval = setInterval(loadReports, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadReports = async () => {
    if (user) {
      try {
        const userReports = await getReportsByStudentId(user.id);
        setReports(userReports || []);
      } catch (error) {
        console.error('Failed to load reports', error);
      }
    }
  };

  const filteredReports = filter === 'all' 
    ? reports 
    : reports.filter(r => r.status === filter);

  const stats = {
    total: reports.length,
    new: reports.filter(r => r.status === 'new').length,
    inProgress: reports.filter(r => r.status === 'in-progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  const handleContactRequest = (report: Report) => {
    setSelectedRequest(report);
    setShowRequestModal(true);
  };

  const handleAcceptRequest = async () => {
    if (selectedRequest) {
      try {
        await updateContactRequestStatus(selectedRequest.id, 'accepted');
        await loadReports();
        setShowRequestModal(false);
      } catch (error) {
        console.error('Failed to accept request', error);
      }
    }
  };

  const handleRejectRequest = async () => {
    if (selectedRequest) {
      try {
        await updateContactRequestStatus(selectedRequest.id, 'declined');
        await loadReports();
        setShowRequestModal(false);
      } catch (error) {
        console.error('Failed to reject request', error);
      }
    }
  };

  const handleOpenChat = (report: Report) => {
    setSelectedChatReport(report);
    setShowChatModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-20 md:pt-8 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Laporan Saya</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Pantau status dan perkembangan laporan yang Anda kirimkan
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Laporan</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Baru</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.new}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Ditinjau</p>
                <p className="text-3xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Selesai</p>
                <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semua ({stats.total})
            </button>
            <button
              onClick={() => setFilter('new')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'new'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Baru ({stats.new})
            </button>
            <button
              onClick={() => setFilter('in-progress')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'in-progress'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Ditinjau ({stats.inProgress})
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'resolved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Selesai ({stats.resolved})
            </button>
          </div>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Belum Ada Laporan
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? 'Anda belum pernah mengirim laporan'
                : `Tidak ada laporan dengan status "${
                    filter === 'new' ? 'Baru' :
                    filter === 'in-progress' ? 'Ditinjau' : 'Selesai'
                  }"`
              }
            </p>
            <Link
              to="/student-report"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Buat Laporan Baru
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3 md:gap-6">
                  {/* Icon Based on Risk - hidden on small mobile */}
                  <div className={`hidden sm:flex w-12 h-12 md:w-16 md:h-16 rounded-2xl items-center justify-center flex-shrink-0 ${
                    report.riskLevel === 'critical' ? 'bg-red-100' :
                    report.riskLevel === 'high' ? 'bg-orange-100' :
                    report.riskLevel === 'medium' ? 'bg-yellow-100' :
                    'bg-green-100'
                  }`}>
                    <AlertCircle className={`w-6 h-6 md:w-8 md:h-8 ${
                      report.riskLevel === 'critical' ? 'text-red-600' :
                      report.riskLevel === 'high' ? 'text-orange-600' :
                      report.riskLevel === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                          Laporan #{report.id.split('-')[1]}
                        </h3>
                        <RiskBadge level={report.riskLevel} />
                      </div>
                      <span className={`ml-auto flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
                        report.status === 'new' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                        report.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-green-50 text-green-700 border border-green-200'
                      }`}>
                        {report.status === 'new' ? '⏳ Menunggu' :
                         report.status === 'in-progress' ? '👁️ Ditinjau' : '✅ Selesai'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{report.date} • {report.time}</span>
                      </div>
                      {report.categories.slice(0, 2).map((cat, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">
                      {report.content}
                    </p>

                    {/* Contact Request Alert */}
                    {report.contactRequest && report.contactRequest.status === 'pending' && (
                      <div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Phone className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-purple-900 mb-1">📞 Permintaan Pertemuan dari Guru BK</p>
                            <p className="text-sm text-purple-700 mb-2">
                              {report.contactRequest.counselorName} ingin bertemu dengan Anda untuk membahas laporan ini.
                            </p>
                            <div className="grid grid-cols-2 gap-2 text-xs text-purple-700 mb-3">
                              <div className="flex items-center gap-1">
                                <span className="font-medium">📅 Tanggal:</span> {report.contactRequest.scheduledDate}
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="font-medium">⏰ Waktu:</span> {report.contactRequest.scheduledTime}
                              </div>
                              <div className="flex items-center gap-1 col-span-2">
                                <span className="font-medium">📍 Tempat:</span> {report.contactRequest.location}
                              </div>
                            </div>
                            {report.contactRequest.message && (
                              <p className="text-sm text-purple-700 mb-3 italic">
                                "{report.contactRequest.message}"
                              </p>
                            )}
                            <button
                              onClick={() => handleContactRequest(report)}
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                            >
                              Lihat & Respon
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Contact Request Accepted */}
                    {report.contactRequest && report.contactRequest.status === 'accepted' && (
                      <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-200">
                        <p className="text-sm text-green-700 font-medium">
                          ✅ Anda telah menerima undangan pertemuan - {report.contactRequest.scheduledDate} pukul {report.contactRequest.scheduledTime} di {report.contactRequest.location}
                        </p>
                      </div>
                    )}

                    {/* Contact Request Declined */}
                    {report.contactRequest && report.contactRequest.status === 'declined' && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                        <p className="text-sm text-gray-700">
                          Anda menolak permintaan pertemuan dari Guru BK
                        </p>
                      </div>
                    )}

                    {/* Stats Bar */}
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                          <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">AI Score</p>
                          <p className="font-semibold text-gray-900 text-sm">{report.aiScore}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-3.5 h-3.5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Kata Kunci</p>
                          <p className="font-semibold text-gray-900 text-sm">{report.keywords.length} terdeteksi</p>
                        </div>
                      </div>

                      {/* Chat Button */}
                      <button
                        onClick={() => handleOpenChat(report)}
                        className="relative ml-auto px-3 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-sm flex items-center gap-1.5 text-xs whitespace-nowrap"
                      >
                        <MessageCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Chat Guru BK</span>
                        {user && getUnreadMessagesCountForReport(report.id, user.id) > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                            {getUnreadMessagesCountForReport(report.id, user.id)}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {filteredReports.length > 0 && (
          <div className="mt-8 text-center">
            <Link
              to="/student-report"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Buat Laporan Baru
            </Link>
          </div>
        )}
      </div>

      {/* Contact Request Modal */}
      {showRequestModal && selectedRequest && selectedRequest.contactRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Permintaan Pertemuan</h2>
              </div>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="bg-purple-50 rounded-xl p-6 mb-6 border border-purple-200">
              <p className="text-gray-900 mb-4 leading-relaxed">
                <span className="font-semibold">{selectedRequest.contactRequest.counselorName}</span> (Guru BK) ingin bertemu dengan Anda untuk membahas laporan #{selectedRequest.id.split('-')[1]} secara lebih mendalam.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-800">
                  <span className="text-2xl">📅</span>
                  <div>
                    <p className="text-sm text-gray-600">Tanggal</p>
                    <p className="font-semibold">{selectedRequest.contactRequest.scheduledDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-800">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <p className="text-sm text-gray-600">Waktu</p>
                    <p className="font-semibold">{selectedRequest.contactRequest.scheduledTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-800">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="text-sm text-gray-600">Lokasi</p>
                    <p className="font-semibold">{selectedRequest.contactRequest.location}</p>
                  </div>
                </div>
              </div>

              {selectedRequest.contactRequest.message && (
                <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Pesan dari Guru BK:</p>
                  <p className="text-gray-800 italic">"{selectedRequest.contactRequest.message}"</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">💡 Catatan:</span> Pertemuan ini bersifat rahasia dan aman. Tujuannya adalah untuk membantu menyelesaikan masalah yang Anda hadapi dengan cara yang terbaik.
              </p>
            </div>
            
            <div className="flex items-center justify-end gap-4">
              <button
                onClick={handleRejectRequest}
                className="px-6 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Tolak Pertemuan
              </button>
              <button
                onClick={handleAcceptRequest}
                className="px-6 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg shadow-purple-600/30"
              >
                Terima Pertemuan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && selectedChatReport && user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Chat dengan Guru BK</h2>
                  <p className="text-sm text-gray-600">Laporan #{selectedChatReport.id.split('-')[1]}</p>
                </div>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Chat Box */}
            <div className="p-6">
              <ChatBox 
                report={selectedChatReport}
                userId={user.id}
                userName={user.name}
                userRole="student"
                onMessagesUpdate={() => {
                  loadReports();
                  // Update selected chat report
                  const updatedReport = reports.find(r => r.id === selectedChatReport.id);
                  if (updatedReport) {
                    setSelectedChatReport(updatedReport);
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}