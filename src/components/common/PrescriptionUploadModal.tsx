import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, FileText, CheckCircle2, ShieldAlert, Camera, ArrowRight } from 'lucide-react';

interface PrescriptionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  onUploadSuccess?: (fileData: { fileName: string; patientName: string }) => void;
}

export const PrescriptionUploadModal: React.FC<PrescriptionUploadModalProps> = ({
  isOpen,
  onClose,
  productName,
  onUploadSuccess,
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) return;
    setIsSubmitted(true);
    setTimeout(() => {
      onUploadSuccess?.({
        fileName,
        patientName: patientName || 'Self',
      });
      setIsSubmitted(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-emerald-100 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/15 rounded-xl backdrop-blur-md">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Upload Prescription (Rx)</h3>
                <p className="text-xs text-emerald-100">
                  {productName ? `Required for ${productName}` : 'Required by Government Regulations'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-800">
            {/* Regulatory Notice */}
            <div className="flex items-start gap-3 p-3.5 bg-amber-50 rounded-2xl border border-amber-200/70 text-amber-900 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Our licensed pharmacist will review this valid prescription before dispatching your medicines.
              </span>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/60 scale-[0.99]'
                  : fileName
                  ? 'border-emerald-500 bg-emerald-50/30'
                  : 'border-slate-300 hover:border-emerald-400 bg-slate-50/60'
              }`}
            >
              <input
                type="file"
                id="prescription-file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <label htmlFor="prescription-file" className="cursor-pointer flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
                  {fileName ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <UploadCloud className="w-6 h-6" />}
                </div>
                {fileName ? (
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-emerald-800 break-all">{fileName}</p>
                    <p className="text-xs text-emerald-600 font-medium">Click or drag to replace file</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-slate-700">
                      Tap to upload or drag & drop prescription
                    </p>
                    <p className="text-xs text-slate-500">Supports JPG, PNG, PDF up to 10MB</p>
                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full mt-1">
                      <Camera className="w-3.5 h-3.5" /> Or take a clear photo
                    </div>
                  </>
                )}
              </label>
            </div>

            {/* Patient Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Patient Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Sharma"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Patient Age (Optional)</label>
                <input
                  type="number"
                  placeholder="e.g. 42"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Valid Prescription Tips */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100 text-xs text-slate-600 space-y-1.5">
              <p className="font-semibold text-slate-700">Prescription must contain:</p>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Doctor details</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Patient name</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Date of issue</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Medicine name & dosage</span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!fileName || isSubmitted}
                className={`w-full py-3.5 px-5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                  fileName && !isSubmitted
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40 cursor-pointer'
                    : isSubmitted
                    ? 'bg-emerald-700 text-white cursor-wait'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isSubmitted ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 animate-bounce text-white" />
                    Verified & Attached!
                  </>
                ) : (
                  <>
                    Attach Prescription & Proceed
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
