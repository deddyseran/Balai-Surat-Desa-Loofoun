import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  CloudUpload,
  Download,
  Eye,
  FileText,
  Info,
  Printer,
} from 'lucide-react';
import { KATEGORI_LIST } from '../data/jenisSurat';
import {
  generateNomorSurat,
  generateSuratPdfBlob,
  generateSuratWordBlob,
  sanitizeFilename,
  triggerDownload,
} from '../services/documentGenerator';
import {
  ArsipSuratKeluar,
  DataPemohonUmum,
  JenisSuratConfig,
  ProfilDesa,
} from '../types/surat';
import { GoogleSignInButton } from './GoogleSignInButton';
import { KopSuratPreview } from './KopSuratPreview';

interface SuratFormSheetProps {
  config: JenisSuratConfig;
  profilDesa: ProfilDesa;
  nextUrutan: number;
  initialPemohon: DataPemohonUmum;
  editingSurat?: ArsipSuratKeluar | null;
  isSignedIn: boolean;
  isSavingDrive: boolean;
  onBack: () => void;
  onSignIn: () => void;
  onPemohonChange: (pemohon: DataPemohonUmum) => void;
  onSaveToDrive: (
    surat: ArsipSuratKeluar,
    wordBlob: Blob,
    pdfBlob: Blob,
    isEdit: boolean
  ) => Promise<void>;
}

export const SuratFormSheet: React.FC<SuratFormSheetProps> = ({
  config,
  profilDesa,
  nextUrutan,
  initialPemohon,
  editingSurat,
  isSignedIn,
  isSavingDrive,
  onBack,
  onSignIn,
  onPemohonChange,
  onSaveToDrive,
}) => {
  const todayIso = new Date().toISOString().slice(0, 10);

  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');
  const [tanggalSurat, setTanggalSurat] = useState<string>(
    editingSurat?.tanggalSurat || todayIso
  );
  const [nomorSurat, setNomorSurat] = useState<string>(
    editingSurat?.nomorSurat ||
      generateNomorSurat(
        config.kodeKlasifikasi,
        nextUrutan,
        profilDesa.kodeDesaSingkat,
        todayIso
      )
  );
  const [pemohon, setPemohon] = useState<DataPemohonUmum>(
    editingSurat?.pemohon || initialPemohon
  );
  const [dataTambahan, setDataTambahan] = useState<Record<string, string>>(
    editingSurat?.dataTambahan || {}
  );
  const [keperluan, setKeperluan] = useState<string>(
    editingSurat?.keperluan || ''
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<'word' | 'pdf' | null>(null);

  const kategoriInfo = useMemo(
    () => KATEGORI_LIST.find((k) => k.id === config.kategori),
    [config.kategori]
  );

  const updatePemohonField = <K extends keyof DataPemohonUmum>(
    key: K,
    value: DataPemohonUmum[K]
  ) => {
    const updated = { ...pemohon, [key]: value };
    setPemohon(updated);
    onPemohonChange(updated);
  };

  const buildDraftSurat = (): ArsipSuratKeluar => {
    const nowIso = new Date().toISOString();
    return {
      id: editingSurat?.id || `sk-${Date.now()}`,
      nomorSurat: nomorSurat.trim(),
      jenisSuratId: config.id,
      namaJenisSurat: config.nama,
      kategori: config.kategori,
      tanggalSurat,
      pemohon,
      dataTambahan,
      keperluan: keperluan.trim() || 'Keperluan Administrasi',
      statusTtd: editingSurat?.statusTtd || 'Siap Cetak & TTD Kades',
      driveDocxFileId: editingSurat?.driveDocxFileId,
      drivePdfFileId: editingSurat?.drivePdfFileId,
      driveDocxName: editingSurat?.driveDocxName,
      drivePdfName: editingSurat?.drivePdfName,
      dibuatPada: editingSurat?.dibuatPada || nowIso,
      diperbaruiPada: nowIso,
    };
  };

  const validateRequired = (): boolean => {
    if (!pemohon.namaLengkap.trim()) {
      setFormError('Nama lengkap pemohon wajib diisi.');
      setMobileTab('form');
      return false;
    }
    if (!pemohon.nik.trim()) {
      setFormError('Nomor Induk Kependudukan (NIK) wajib diisi.');
      setMobileTab('form');
      return false;
    }
    if (!pemohon.alamatLengkap.trim()) {
      setFormError('Alamat lengkap wajib diisi.');
      setMobileTab('form');
      return false;
    }
    for (const field of config.fieldTambahan) {
      if (field.required && !(dataTambahan[field.key] || '').trim()) {
        setFormError(`Kolom "${field.label}" wajib diisi.`);
        setMobileTab('form');
        return false;
      }
    }
    setFormError(null);
    return true;
  };

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3500);
  };

  const handleDownloadWord = async () => {
    if (!validateRequired()) return;
    setIsExporting('word');
    try {
      const draft = buildDraftSurat();
      const blob = await generateSuratWordBlob(draft, config, profilDesa);
      const fname = `${sanitizeFilename(config.nama)}_${sanitizeFilename(
        pemohon.namaLengkap
      )}.docx`;
      triggerDownload(blob, fname);
      showToast('File Word (.docx) berhasil diunduh.');
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadPdf = async () => {
    if (!validateRequired()) return;
    setIsExporting('pdf');
    try {
      const draft = buildDraftSurat();
      const blob = await generateSuratPdfBlob(draft, config, profilDesa);
      const fname = `${sanitizeFilename(config.nama)}_${sanitizeFilename(
        pemohon.namaLengkap
      )}.pdf`;
      triggerDownload(blob, fname);
      showToast('File PDF berhasil diunduh.');
    } finally {
      setIsExporting(null);
    }
  };

  const handlePrint = () => {
    if (!validateRequired()) return;
    window.print();
  };

  const handleSaveDrive = async () => {
    if (!validateRequired()) return;
    const draft = buildDraftSurat();
    const [wordBlob, pdfBlob] = await Promise.all([
      generateSuratWordBlob(draft, config, profilDesa),
      generateSuratPdfBlob(draft, config, profilDesa),
    ]);
    await onSaveToDrive(draft, wordBlob, pdfBlob, Boolean(editingSurat));
  };

  return (
    <div className="pb-24 lg:pb-12">
      {/* Header Bar */}
      <div className="no-print mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={onBack}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
            aria-label="Kembali ke daftar surat"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xs text-slate-500">
              {kategoriInfo?.nama} · Kode {config.kodeKlasifikasi}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {config.nama}
            </h1>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="flex lg:hidden p-1 bg-slate-100 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setMobileTab('form')}
            className={`flex-1 min-h-[40px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
              mobileTab === 'form'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <FileText className="w-4 h-4" />
            Isi Formulir
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('preview')}
            className={`flex-1 min-h-[40px] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
              mobileTab === 'preview'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            <Eye className="w-4 h-4" />
            Lihat &amp; Cetak
          </button>
        </div>
      </div>

      {actionToast && (
        <div className="no-print mb-4 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-900 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{actionToast}</span>
        </div>
      )}

      {formError && (
        <div className="no-print mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Persyaratan + Form */}
        <div
          className={`no-print lg:col-span-6 space-y-5 ${
            mobileTab === 'form' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Persyaratan Card */}
          <section className="bg-[#FFFDF7] border border-[#E7DEC8] rounded-2xl p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-[#0B2D39] mb-2.5">
              Persyaratan yang Perlu Disiapkan
            </h2>
            <ul className="space-y-1.5 text-sm text-slate-700 list-disc pl-5">
              {config.persyaratanKhusus.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-[#ECE4D2] flex items-start gap-2 text-xs text-slate-600">
              <Info className="w-4 h-4 text-[#9A5B13] shrink-0 mt-0.5" />
              <p>
                {config.perpres96BebasRtRw
                  ? 'Sesuai Perpres No. 96 Tahun 2019, untuk layanan administrasi kependudukan di daerah tertentu, surat pengantar RT/RW/Desa tidak lagi diwajibkan. Anda tetap dapat mencetak surat ini bila diperlukan.'
                  : 'Bawa dokumen persyaratan di atas beserta surat yang sudah dicetak mandiri saat meminta tanda tangan & stempel Kepala Desa.'}
              </p>
            </div>
          </section>

          {/* Form Data Surat & Pemohon */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (validateRequired()) setMobileTab('preview');
            }}
            className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-5"
          >
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                1. Identitas Warga / Pemohon
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Isi data sesuai KTP dan Kartu Keluarga (KK).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Nomor Surat
                </label>
                <input
                  type="text"
                  value={nomorSurat}
                  onChange={(e) => setNomorSurat(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Tanggal Surat
                </label>
                <input
                  type="date"
                  value={tanggalSurat}
                  onChange={(e) => setTanggalSurat(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Nama Lengkap <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Siti Rahmawati"
                  value={pemohon.namaLengkap}
                  onChange={(e) =>
                    updatePemohonField('namaLengkap', e.target.value)
                  }
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  NIK (16 Digit) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="3201xxxxxxxxxxxx"
                  value={pemohon.nik}
                  onChange={(e) => updatePemohonField('nik', e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Nomor Kartu Keluarga (KK)
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="3201xxxxxxxxxxxx"
                  value={pemohon.noKk}
                  onChange={(e) => updatePemohonField('noKk', e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Bandung"
                  value={pemohon.tempatLahir}
                  onChange={(e) =>
                    updatePemohonField('tempatLahir', e.target.value)
                  }
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  value={pemohon.tanggalLahir}
                  onChange={(e) =>
                    updatePemohonField('tanggalLahir', e.target.value)
                  }
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Jenis Kelamin
                </label>
                <select
                  value={pemohon.jenisKelamin}
                  onChange={(e) =>
                    updatePemohonField(
                      'jenisKelamin',
                      e.target.value as 'Laki-laki' | 'Perempuan'
                    )
                  }
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Agama
                </label>
                <select
                  value={pemohon.agama}
                  onChange={(e) => updatePemohonField('agama', e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Islam">Islam</option>
                  <option value="Kristen">Kristen</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Konghucu">Konghucu</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Status Perkawinan
                </label>
                <select
                  value={pemohon.statusPerkawinan}
                  onChange={(e) =>
                    updatePemohonField('statusPerkawinan', e.target.value)
                  }
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Belum Kawin">Belum Kawin</option>
                  <option value="Kawin">Kawin</option>
                  <option value="Cerai Hidup">Cerai Hidup</option>
                  <option value="Cerai Mati">Cerai Mati</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Pekerjaan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Wiraswasta / Petani / Pelajar"
                  value={pemohon.pekerjaan}
                  onChange={(e) =>
                    updatePemohonField('pekerjaan', e.target.value)
                  }
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  RT / RW
                </label>
                <input
                  type="text"
                  placeholder="Contoh: RT 002 / RW 001"
                  value={pemohon.rtRw}
                  onChange={(e) => updatePemohonField('rtRw', e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Nomor HP / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={pemohon.noHp}
                  onChange={(e) => updatePemohonField('noHp', e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm tabular-nums text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Alamat Lengkap <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Contoh: Dusun Loofoun, Desa Loofoun, Kec. Malaka Barat"
                  value={pemohon.alamatLengkap}
                  onChange={(e) =>
                    updatePemohonField('alamatLengkap', e.target.value)
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DFDBD0] text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0E6044]"
                />
              </div>
            </div>

            {/* Rincian Khusus Jenis Surat */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  2. Rincian {config.nama}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lengkapi keterangan khusus sesuai keperluan surat.
                </p>
              </div>

              {config.fieldTambahan.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">
                    {field.label}{' '}
                    {field.required && <span className="text-red-600">*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      value={dataTambahan[field.key] || ''}
                      onChange={(e) =>
                        setDataTambahan((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="">{field.placeholder}</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      rows={2}
                      placeholder={field.placeholder}
                      value={dataTambahan[field.key] || ''}
                      onChange={(e) =>
                        setDataTambahan((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  ) : (
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={dataTambahan[field.key] || ''}
                      onChange={(e) =>
                        setDataTambahan((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  )}
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Keperluan Pembuatan Surat
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Persyaratan pendaftaran kerja / bank / sekolah"
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="pt-2 lg:hidden">
              <button
                type="submit"
                className="w-full min-h-[48px] rounded-xl bg-[#0E6044] hover:bg-[#0A4A34] text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Lanjut ke Pratinjau &amp; Unduh Surat
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Action Toolbar + A4 Preview */}
        <div
          className={`lg:col-span-6 space-y-4 lg:sticky lg:top-20 ${
            mobileTab === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          {/* Download, Print & Google Drive Save Controls */}
          <div className="no-print overflow-hidden bg-white border border-[#E6E2D8] rounded-2xl">
            <div className="tais-weave-bar w-full" aria-hidden="true" />
            <div className="p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-[#0B2D39]">
                  Siap Cetak Mandiri &amp; Tanda Tangan Kepala Desa
                </h2>
                <p className="text-xs text-slate-500">
                  Unduh Word/PDF ke HP atau simpan arsip ke database Google Drive.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={handleDownloadWord}
                disabled={isExporting !== null}
                className="min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#DFDBD0] bg-white hover:bg-[#E9F4F6] text-[#0F5C6E] text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                {isExporting === 'word' ? 'Membuat...' : 'Unduh Word'}
              </button>

              <button
                type="button"
                onClick={handleDownloadPdf}
                disabled={isExporting !== null}
                className="min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#DFDBD0] bg-white hover:bg-[#FCEEEF] text-[#9F2B3B] text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                {isExporting === 'pdf' ? 'Membuat...' : 'Unduh PDF'}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#0B2D39] hover:bg-[#103D4D] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <Printer className="w-4 h-4 text-amber-300" />
                Cetak Mandiri
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100">
              {isSignedIn ? (
                <button
                  type="button"
                  onClick={handleSaveDrive}
                  disabled={isSavingDrive}
                  className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#0E6044] hover:bg-[#0A4A34] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  <CloudUpload className="w-4 h-4 text-amber-300" />
                  {isSavingDrive
                    ? 'Menyimpan Word & PDF ke Google Drive...'
                    : editingSurat
                    ? 'Perbarui Arsip & File di Google Drive'
                    : 'Simpan Arsip + File Word & PDF ke Google Drive'}
                </button>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF9F5] rounded-xl p-3 border border-[#E6E2D8]">
                  <p className="text-xs text-slate-600">
                    Masuk dengan akun Google agar surat tersimpan otomatis di database Google Drive desa.
                  </p>
                  <GoogleSignInButton onClick={onSignIn} />
                </div>
              )}
            </div>
            </div>
          </div>

          {/* Printable A4 Sheet */}
          <KopSuratPreview
            config={config}
            profil={profilDesa}
            nomorSurat={nomorSurat}
            tanggalSurat={tanggalSurat}
            pemohon={pemohon}
            dataTambahan={dataTambahan}
            keperluan={keperluan || 'Administrasi Umum'}
            isPrintTarget={true}
          />
        </div>
      </div>
    </div>
  );
};
