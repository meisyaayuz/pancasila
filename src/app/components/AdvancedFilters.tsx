import { useState } from 'react';
import { Filter, X, Calendar, Award, AlertTriangle, School } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface FilterOptions {
  riskLevel: string[];
  status: string[];
  category: string[];
  dateRange: 'all' | 'today' | 'week' | 'month';
  priority: string[];
  grade: string[];  // e.g. ['10 IPA-1', '11 IPS-3']
}

interface AdvancedFiltersProps {
  onFilterChange: (filters: FilterOptions) => void;
}

export function AdvancedFilters({ onFilterChange }: AdvancedFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    riskLevel: [],
    status: [],
    category: [],
    dateRange: 'all',
    priority: [],
    grade: []
  });

  // Class options: 10, 11, 12 × 1..12
  const gradeNumbers = ['10', '11', '12'];
  const majorClasses = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  const [selectedGradeNum, setSelectedGradeNum] = useState<string>('10');

  const riskLevels = ['low', 'medium', 'high', 'critical'];
  // Use actual status values from the Report data model
  const statuses = ['new', 'in-progress', 'resolved'];
  const categories = ['Verbal', 'Cyberbullying', 'Dikucilkan', 'Fisik'];

  const toggleFilter = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => {
      const currentValues = prev[key] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      const newFilters = { ...prev, [key]: newValues };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const setDateRange = (range: FilterOptions['dateRange']) => {
    const newFilters = { ...filters, dateRange: range };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    const empty: FilterOptions = {
      riskLevel: [], status: [], category: [],
      dateRange: 'all', priority: [], grade: []
    };
    setFilters(empty);
    onFilterChange(empty);
  };

  const activeFilterCount =
    filters.riskLevel.length +
    filters.status.length +
    filters.category.length +
    filters.grade.length +
    (filters.dateRange !== 'all' ? 1 : 0);

  const riskLabel = (level: string) => ({
    low: 'Rendah', medium: 'Sedang', high: 'Tinggi', critical: 'Kritis'
  }[level] || level);

  const riskColor = (level: string, active: boolean) => {
    if (!active) return 'bg-white border-gray-300 text-gray-700 hover:border-gray-400';
    return {
      low: 'bg-green-50 border-green-500 text-green-700',
      medium: 'bg-yellow-50 border-yellow-500 text-yellow-700',
      high: 'bg-orange-50 border-orange-500 text-orange-700',
      critical: 'bg-red-50 border-red-500 text-red-700',
    }[level] || 'bg-blue-50 border-blue-500 text-blue-700';
  };

  const statusLabel = (s: string) => ({ new: 'Baru', 'in-progress': 'Ditinjau', resolved: 'Selesai' }[s] || s);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-300 hover:border-gray-400 rounded-xl transition-all font-medium text-gray-700"
      >
        <Filter className="w-4 h-4" />
        <span className="hidden sm:inline">Filter</span>
        {activeFilterCount > 0 && (
          <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/20"
              onClick={() => setIsOpen(false)}
            />

            {/* Panel — full screen on mobile, dropdown on desktop */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed sm:absolute inset-x-0 sm:inset-auto bottom-0 sm:bottom-auto sm:right-0 sm:top-12
                         w-full sm:w-[520px] bg-white rounded-t-2xl sm:rounded-2xl
                         shadow-2xl border border-gray-200 z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filter Laporan
                </h3>
                <div className="flex items-center gap-3">
                  {activeFilterCount > 0 && (
                    <button onClick={clearAllFilters} className="text-sm text-red-600 hover:text-red-700 font-medium">
                      Reset Semua
                    </button>
                  )}
                  <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="p-4 max-h-[70vh] overflow-y-auto space-y-5">

                {/* Date Range */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <Calendar className="w-4 h-4" />
                    Rentang Waktu
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {([
                      { value: 'today', label: 'Hari Ini' },
                      { value: 'week', label: 'Minggu Ini' },
                      { value: 'month', label: 'Bulan Ini' },
                      { value: 'all', label: 'Semua' }
                    ] as const).map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setDateRange(opt.value)}
                        className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                          filters.dateRange === opt.value
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Risk Level */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <AlertTriangle className="w-4 h-4" />
                    Tingkat Risiko
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {riskLevels.map(level => (
                      <button
                        key={level}
                        onClick={() => toggleFilter('riskLevel', level)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${riskColor(level, filters.riskLevel.includes(level))}`}
                      >
                        {riskLabel(level)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Status Laporan
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map(status => (
                      <button
                        key={status}
                        onClick={() => toggleFilter('status', status)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                          filters.status.includes(status)
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {statusLabel(status)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <Award className="w-4 h-4" />
                    Kategori Bullying
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => toggleFilter('category', cat)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                          filters.category.includes(cat)
                            ? 'bg-purple-50 border-purple-500 text-purple-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grade – two-level: pick grade number, then class */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                    <School className="w-4 h-4" />
                    Kelas
                    {filters.grade.length > 0 && (
                      <span className="ml-auto px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                        {filters.grade.length} dipilih
                      </span>
                    )}
                  </label>

                  {/* Grade picker */}
                  <div className="flex gap-2 mb-3">
                    {gradeNumbers.map(g => (
                      <button
                        key={g}
                        onClick={() => setSelectedGradeNum(g)}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                          selectedGradeNum === g
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Kelas {g}
                      </button>
                    ))}
                  </div>

                  {/* Class chips */}
                  <div className="grid grid-cols-4 gap-1.5">
                    {majorClasses.map(cls => {
                      const fullClass = `${selectedGradeNum}-${cls}`;
                      const isActive = filters.grade.includes(fullClass);
                      return (
                        <button
                          key={cls}
                          onClick={() => toggleFilter('grade', fullClass)}
                          className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all border ${
                            isActive
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm'
                              : 'bg-white border-gray-300 text-gray-600 hover:border-indigo-300 hover:text-indigo-600'
                          }`}
                        >
                          {cls}
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected chips preview */}
                  {filters.grade.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {filters.grade.map(g => (
                        <span
                          key={g}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                        >
                          {g}
                          <button
                            onClick={() => toggleFilter('grade', g)}
                            className="hover:text-red-600 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {activeFilterCount > 0 ? `${activeFilterCount} filter aktif` : 'Tidak ada filter aktif'}
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2 bg-[#00158b] text-white rounded-xl font-medium hover:bg-[#00158b]/90 transition-colors"
                >
                  Terapkan
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
