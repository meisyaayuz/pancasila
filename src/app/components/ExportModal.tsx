import { useState } from 'react';
import { X, Download, FileText, Table, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getReports } from '../services/reportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [exportType, setExportType] = useState<'json' | 'csv'>('json');
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'custom'>('all');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    // Get reports from localStorage
    let reports = getReports();
    
    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      const filtered = reports.filter(report => {
        const reportDate = new Date(report.timestamp);
        const daysDiff = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dateRange === 'week') return daysDiff <= 7;
        if (dateRange === 'month') return daysDiff <= 30;
        return true;
      });
      reports = filtered;
    }
    
    // Prepare data
    const dataToExport = reports.map(report => ({
      ID: report.id,
      Tanggal: report.date,
      Waktu: report.time,
      Status: report.status,
      'Risk Level': report.riskLevel,
      'AI Score': report.aiScore,
      Sentiment: report.sentiment,
      Kategori: report.categories.join(', '),
      Keywords: report.keywords.join(', '),
      Kelas: report.studentClass,
      'Student Initial': report.studentInitial,
      ...(includeDetails && { 'Isi Laporan': report.content }),
      ...(includeDetails && report.notes && { 'Catatan BK': report.notes }),
      ...(report.location && { Lokasi: report.location }),
      'Ada Saksi': report.witness ? 'Ya' : 'Tidak',
    }));

    // Simulasi loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (exportType === 'json') {
      // Export as JSON
      const jsonData = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SpeakUp_Reports_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // Export as CSV
      if (dataToExport.length === 0) {
        alert('Tidak ada data untuk diekspor');
        setIsExporting(false);
        return;
      }
      
      const headers = Object.keys(dataToExport[0]);
      const csvRows = [
        headers.join(','),
        ...dataToExport.map(row => 
          headers.map(header => {
            const cell = row[header as keyof typeof row];
            // Escape quotes and wrap in quotes if contains comma
            const cellStr = String(cell || '').replace(/"/g, '""');
            return cellStr.includes(',') ? `"${cellStr}"` : cellStr;
          }).join(',')
        )
      ];
      
      const csvData = csvRows.join('\n');
      const blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' }); // BOM for Excel
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SpeakUp_Reports_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
    
    setIsExporting(false);
    onClose();
    
    // Show success notification
    const successMsg = document.createElement('div');
    successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-xl shadow-2xl z-[100] flex items-center gap-3';
    successMsg.innerHTML = `
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <div>
        <p class="font-semibold">Export Berhasil!</p>
        <p class="text-sm">File telah diunduh ke komputer Anda</p>
      </div>
    `;
    document.body.appendChild(successMsg);
    setTimeout(() => {
      successMsg.remove();
    }, 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-50"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Download className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Export Laporan</h2>
                  <p className="text-sm text-gray-600">Unduh data laporan bullying</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Export Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Format File
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setExportType('json')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      exportType === 'json'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <FileText className={`w-6 h-6 mx-auto mb-2 ${
                      exportType === 'json' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <p className="font-medium text-sm text-gray-900">JSON</p>
                    <p className="text-xs text-gray-600 mt-1">Format data terstruktur</p>
                  </button>
                  <button
                    onClick={() => setExportType('csv')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      exportType === 'csv'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <Table className={`w-6 h-6 mx-auto mb-2 ${
                      exportType === 'csv' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <p className="font-medium text-sm text-gray-900">CSV</p>
                    <p className="text-xs text-gray-600 mt-1">Excel compatible</p>
                  </button>
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Rentang Waktu
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'week', label: 'Minggu Ini' },
                    { value: 'month', label: 'Bulan Ini' },
                    { value: 'all', label: 'Semua Data' },
                    { value: 'custom', label: 'Custom' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setDateRange(option.value as any)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        dateRange === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Opsi Tambahan
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeCharts}
                      onChange={(e) => setIncludeCharts(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Sertakan Grafik & Visualisasi</p>
                      <p className="text-xs text-gray-600">Chart dan diagram analisis</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDetails}
                      onChange={(e) => setIncludeDetails(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Detail Lengkap Laporan</p>
                      <p className="text-xs text-gray-600">Isi laporan dan analisis AI</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-900">
                  <span className="font-medium">Catatan:</span> Data akan diekspor sesuai filter dan 
                  pengaturan yang dipilih. Pastikan semua informasi sudah sesuai sebelum mengunduh.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mengekspor...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export {exportType.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}