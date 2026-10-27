import React, { useState } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ArrowRight,
  Download,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const SAMPLE_CSV = `full_name,enrollment_number,program,branch,admission_year,cgpa,email,phone
Tanmay Bakshi,2022/DTU/CO/490,B.Tech Computer Engineering,CSE,2022,9.15,tanmay.b.demo@dtu.ac.in,+91 98101 22334
Isha Sharma,2022/DTU/IT/491,B.Tech Information Technology,IT,2022,8.72,isha.s.demo@dtu.ac.in,+91 98102 33445
Kunal Deshmukh,2022/DTU/ME/492,B.Tech Mechanical Engineering,ME,2022,8.40,kunal.d.demo@dtu.ac.in,+91 98103 44556
Aditi Rao,2022/DTU/EE/493,B.Tech Electrical Engineering,EE,2022,7.95,aditi.r.demo@dtu.ac.in,+91 98104 55667
Manish Chawla,2022/DTU/CE/494,B.Tech Civil Engineering,CE,2022,8.10,manish.c.demo@dtu.ac.in,+91 98105 66778`;

export default function BulkUploadPage({ onNavigate }) {
  const { institution, showToast } = useAuth();
  const [csvContent, setCsvContent] = useState(SAMPLE_CSV);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const instId = institution?.id || 'inst-dtu';

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!csvContent.trim()) {
      showToast('CSV content cannot be empty', 'error');
      return;
    }

    setUploading(true);
    try {
      const res = await api.bulkUploadCsv(instId, csvContent);
      if (res?.status === 'success') {
        setUploadResult(res);
        showToast(`Successfully processed batch: ${res.records_imported} student records imported!`, 'success');
      }
    } catch (err) {
      showToast('Failed to parse or upload CSV', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleLoadSample = () => {
    setCsvContent(SAMPLE_CSV);
    setUploadResult(null);
    showToast('Loaded AICTE standard sample CSV dataset', 'info');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Bulk Student Record Ingestion</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
              CSV Automated Batch Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Import enrolled cohorts in bulk. The pipeline validates format standards and generates mock APAAR IDs.
          </p>
        </div>

        <button
          onClick={handleLoadSample}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset to Sample Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: CSV Editor / Drop Area */}
        <div className="lg:col-span-2 space-y-4">
          <form onSubmit={handleUpload} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                CSV Data Input (Header Required)
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {csvContent.trim().split('\n').length - 1} data rows detected
              </span>
            </div>

            <textarea
              rows={12}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              className="w-full p-4 text-xs font-mono bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed text-slate-800"
              placeholder="Paste raw CSV contents here..."
              required
            />

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="text-xs text-slate-500">
                Mandatory headers: <code className="text-blue-700 font-semibold">full_name, enrollment_number, program, branch, admission_year, cgpa</code>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Validating Batch...' : 'Parse & Ingest CSV Batch'}
              </button>
            </div>
          </form>

          {/* Results Table */}
          {uploadResult && (
            <div className="bg-white rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Batch Successfully Imported ({uploadResult.records_imported} Records)
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('institution-students')}
                  className="text-xs text-blue-700 font-semibold hover:underline flex items-center gap-1"
                >
                  View in Directory <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Generated APAAR ID</th>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Enrollment</th>
                      <th className="py-2.5 px-3">Program</th>
                      <th className="py-2.5 px-3">CGPA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800 font-medium font-mono text-[11px]">
                    {uploadResult.imported_students?.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-blue-700 font-bold">{s.apaar_id}</td>
                        <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">{s.full_name}</td>
                        <td className="py-2.5 px-3">{s.enrollment_number}</td>
                        <td className="py-2.5 px-3 font-sans">{s.program}</td>
                        <td className="py-2.5 px-3 text-emerald-700 font-bold">{s.cgpa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Specifications & Validation Guidelines */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-700" />
              Batch Formatting Rules
            </h2>
            <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-blue-700 font-bold">•</span>
                <span><strong>APAAR ID Generation:</strong> Mock APAAR IDs are mathematically synthesized using institution code and row indices.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-700 font-bold">•</span>
                <span><strong>CGPA Validation:</strong> Numeric bounds between 0.00 and 10.00 are enforced.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-700 font-bold">•</span>
                <span><strong>Data Integrity:</strong> All imported batches are hashed into the audit ledger for institutional non-repudiation.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
