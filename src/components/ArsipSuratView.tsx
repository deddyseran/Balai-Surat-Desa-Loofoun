import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  FileText,
  FolderOpen,
  Inbox,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Send,
  Trash2,
} from 'lucide-react';
import { JENIS_SURAT_CATALOG } from '../data/jenisSurat';
import {
  formatTanggalIndonesia,
  generateSuratMasukDisposisiPdfBlob,
  generateSuratMasukDisposisiWordBlob,
  generateSuratPdfBlob,
  generateSuratWordBlob,
  sanitizeFilename,
  triggerDownload,
} from '../services/documentGenerator';
import { DriveFileItem } from '../services/driveDb';
import {
  ArsipSuratKeluar,
  ArsipSuratMasuk,
  ProfilDesa,
} from '../types/surat';
import { GoogleSignInButton } from './GoogleSignInButton';

interface ArsipSuratViewProps {
  suratKeluar: ArsipSuratKeluar[];
  suratMasuk: ArsipSuratMasuk[];
  driveFilesKeluar: DriveFileItem[];
  driveFilesMasuk: DriveFileItem[];
  profilDesa: ProfilDesa;
  isSignedIn: boolean;
  isLoadingDrive: boolean;
  onSignIn: () => void;
  onRefreshDrive: () => void;
  onOpenNewSuratMasuk: () => void;
  onEditSuratKeluar: (surat: ArsipSuratKeluar) => void;
  onToggleTtdKeluar: (surat: ArsipSuratKeluar) => void;
  onDeleteSuratKeluar: (surat: ArsipSuratKeluar) => void;
  onDeleteSuratMasuk: (surat: ArsipSuratMasuk) => void;
  onDownloadRawDriveFile: (file: DriveFileItem) => void;
  onDeleteRawDriveFile: (file: DriveFileItem) => void;
}

export const ArsipSuratView: React.FC<ArsipSuratViewProps> = ({
  suratKeluar,
  suratMasuk,
  driveFilesKeluar,
  driveFilesMasuk,
  profilDesa,
  isSignedIn,
  isLoadingDrive,
  onSignIn,
  onRefreshDrive,
  onOpenNewSuratMasuk,
  onEditSuratKeluar,
  onToggleTtdKeluar,
  onDeleteSuratKeluar,
  onDeleteSuratMasuk,
  onDownloadRawDriveFile,
  onDeleteRawDriveFile,
}) => {
  const [activeTab, setActiveTab] = useState<'keluar' | 'masuk' | 'berkas'>(
    'keluar'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const q = searchQuery.trim().toLowerCase();

  const filteredKeluar = useMemo(() => {
    if (!q) return suratKeluar;
    return suratKeluar.filter(
      (s) =>
        s.pemohon.namaLengkap.toLowerCase().includes(q) ||
        s.pemohon.nik.toLowerCase().includes(q) ||
        s.namaJenisSurat.toLowerCase().includes(q) ||
        s.nomorSurat.toLowerCase().includes(q)
    );
  }, [suratKeluar, q]);

  const filteredMasuk = useMemo(() => {
    if (!q) return suratMasuk;
    return suratMasuk.filter(
      (s) =>
        s.perihal.toLowerCase().includes(q) ||
        s.asalInstansi.toLowerCase().includes(q) ||
        s.nomorSuratAsal.toLowerCase().includes(q) ||
        s.nomorAgenda.toLowerCase().includes(q)
    );
  }, [suratMasuk, q]);

  const allDriveFiles = useMemo(() => {
    const tagged = [
      ...driveFilesKeluar.map((f) => ({ ...f, folderLabel: 'Surat Keluar' })),
      ...driveFilesMasuk.map((f) => ({ ...f, folderLabel: 'Surat Masuk' })),
    ];
    if (!q) return tagged;
    return tagged.filter((f) => f.name.toLowerCase().includes(q));
  }, [driveFilesKeluar, driveFilesMasuk, q]);

  const handleDownloadKeluarWord = async (item: ArsipSuratKeluar) => {
    const config =
      JENIS_SURAT_CATALOG.find((c) => c.id === item.jenisSuratId) ||
      JENIS_SURAT_CATALOG[0];
    const blob = await generateSuratWordBlob(item, config, profilDesa);
    triggerDownload(
      blob,
      `${sanitizeFilename(item.namaJenisSurat)}_${sanitizeFilename(
        item.pemohon.namaLengkap
      )}.docx`
    );
  };

  const handleDownloadKeluarPdf = async (item: ArsipSuratKeluar) => {
    const config =
      JENIS_SURAT_CATALOG.find((c) => c.id === item.jenisSuratId) ||
      JENIS_SURAT_CATALOG[0];
    const blob = await generateSuratPdfBlob(item, config, profilDesa);
    triggerDownload(
      blob,
      `${sanitizeFilename(item.namaJenisSurat)}_${sanitizeFilename(
        item.pemohon.namaLengkap
      )}.pdf`
    );
  };

  const handleDownloadMasukWord = async (item: ArsipSuratMasuk) => {
    const blob = await generateSuratMasukDisposisiWordBlob(item, profilDesa);
    triggerDownload(
      blob,
      `Disposisi_Surat_Masuk_${sanitizeFilename(item.nomorAgenda)}.docx`
    );
  };

  const handleDownloadMasukPdf = async (item: ArsipSuratMasuk) => {
    const blob = await generateSuratMasukDisposisiPdfBlob(item, profilDesa);
    triggerDownload(
      blob,
      `Disposisi_Surat_Masuk_${sanitizeFilename(item.nomorAgenda)}.pdf`
    );
  };

  return (
    <div className="pb-24 lg:pb-12 space-y-5">
      {/* Top Toolbar */}
      <div className="overflow-hidden bg-white border border-[#E6E2D8] rounded-2xl">
        <div className="tais-weave-bar w-full" aria-hidden="true" />
        <div className="p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#0B2D39] tracking-tight">
              Arsip Surat Masuk &amp; Keluar
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Akses surat dari database Google Drive untuk diunduh Word/PDF dan
              dicetak mandiri.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isSignedIn ? (
              <>
                <button
                  type="button"
                  onClick={onRefreshDrive}
                  disabled={isLoadingDrive}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#DFDBD0] bg-white hover:bg-[#FAF9F5] text-xs font-medium text-slate-700 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <RefreshCw
                    className={`w-4 h-4 text-[#0F5C6E] ${isLoadingDrive ? 'animate-spin' : ''}`}
                  />
                  Sinkronkan Drive
                </button>
                <button
                  type="button"
                  onClick={onOpenNewSuratMasuk}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-[#0E6044] hover:bg-[#0A4A34] text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  Catat Surat Masuk
                </button>
              </>
            ) : (
              <GoogleSignInButton onClick={onSignIn} />
            )}
          </div>
        </div>

        {/* Segmented Controls + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="grid grid-cols-3 sm:inline-flex p-1 bg-[#F3F1EA] rounded-xl border border-[#E6E2D8]">
            <button
              type="button"
              onClick={() => setActiveTab('keluar')}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'keluar'
                  ? 'bg-[#0B2D39] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0B2D39]'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              Keluar ({suratKeluar.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('masuk')}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'masuk'
                  ? 'bg-[#0B2D39] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0B2D39]'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              Masuk ({suratMasuk.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('berkas')}
              className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === 'berkas'
                  ? 'bg-[#0B2D39] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0B2D39]'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              File Drive ({allDriveFiles.length})
            </button>
          </div>

          <div className="relative flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              placeholder="Cari nama, NIK, nomor, perihal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[44px] pl-10 pr-3.5 py-2 rounded-xl border border-[#DFDBD0] text-sm focus:outline-none focus:ring-2 focus:ring-[#0E6044]"
            />
          </div>
        </div>
        </div>
      </div>

      {/* Tab 1: Surat Keluar */}
      {activeTab === 'keluar' && (
        <div className="space-y-3">
          {filteredKeluar.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-800">
                Belum ada arsip surat keluar
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                {isSignedIn
                  ? 'Buat surat baru dari halaman Beranda lalu simpan ke Google Drive agar dapat diakses dan dicetak ulang kapan saja.'
                  : 'Masuk dengan Google untuk memuat arsip surat keluar dari Google Drive desa.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredKeluar.map((item) => (
                <article
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="text-xs text-slate-500 font-mono tabular-nums flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>{item.nomorSurat}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formatTanggalIndonesia(item.tanggalSurat)}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={
                          item.statusTtd === 'Sudah Ditandatangani'
                            ? 'text-emerald-700 font-sans font-medium'
                            : 'text-amber-700 font-sans font-medium'
                        }
                      >
                        {item.statusTtd}
                      </span>
                    </div>

                    <h3 className="mt-1.5 text-base font-semibold text-slate-900">
                      {item.namaJenisSurat}
                    </h3>
                    <p className="mt-1 text-sm text-slate-700">
                      Pemohon:{' '}
                      <span className="font-medium">
                        {item.pemohon.namaLengkap}
                      </span>{' '}
                      <span className="text-xs text-slate-500 font-mono tabular-nums">
                        ({item.pemohon.nik})
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                      Keperluan: {item.keperluan}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadKeluarWord(item)}
                      className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-700" />
                      Word
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadKeluarPdf(item)}
                      className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-red-700" />
                      PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditSuratKeluar(item)}
                      className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 flex items-center gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-600" />
                      Cetak / Ubah
                    </button>
                    {isSignedIn && (
                      <>
                        <button
                          type="button"
                          onClick={() => onToggleTtdKeluar(item)}
                          className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 text-xs font-medium text-emerald-800 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {item.statusTtd === 'Sudah Ditandatangani'
                            ? 'Batal TTD'
                            : 'Tandai TTD Kades'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSuratKeluar(item)}
                          aria-label="Hapus surat keluar"
                          className="min-h-[40px] min-w-[40px] ml-auto px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-red-50 text-xs font-medium text-red-700 flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Surat Masuk */}
      {activeTab === 'masuk' && (
        <div className="space-y-3">
          {filteredMasuk.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-800">
                Belum ada arsip surat masuk
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Klik tombol "Catat Surat Masuk" untuk menyimpan surat undangan,
                edaran instansi, atau lampiran PDF/foto ke Google Drive.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMasuk.map((item) => (
                <article
                  key={item.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="text-xs text-slate-500 font-mono tabular-nums flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>Agenda {item.nomorAgenda}</span>
                      <span aria-hidden="true">·</span>
                      <span>Diterima {formatTanggalIndonesia(item.tanggalDiterima)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-sans font-medium text-emerald-700">
                        {item.statusDisposisi}
                      </span>
                    </div>
                    <h3 className="mt-1.5 text-base font-semibold text-slate-900">
                      {item.perihal}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">
                      Dari: <span className="font-medium">{item.asalInstansi}</span>{' '}
                      · No. {item.nomorSuratAsal}
                    </p>
                    {item.disposisiKades && (
                      <p className="mt-2 text-xs text-slate-600 bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                        Disposisi Kades: {item.disposisiKades}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadMasukWord(item)}
                      className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-700" />
                      Disposisi Word
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadMasukPdf(item)}
                      className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-red-700" />
                      Disposisi PDF
                    </button>
                    {item.driveAttachmentFileId && isSignedIn && (
                      <button
                        type="button"
                        onClick={() =>
                          onDownloadRawDriveFile({
                            id: item.driveAttachmentFileId!,
                            name: item.driveAttachmentName || 'Lampiran_Surat',
                            mimeType:
                              item.driveAttachmentMimeType ||
                              'application/octet-stream',
                          })
                        }
                        className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 bg-emerald-50 hover:bg-emerald-100 text-xs font-medium text-emerald-800 flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Lampiran Asli
                      </button>
                    )}
                    {isSignedIn && (
                      <button
                        type="button"
                        onClick={() => onDeleteSuratMasuk(item)}
                        aria-label="Hapus surat masuk"
                        className="min-h-[40px] min-w-[40px] ml-auto px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-red-50 text-xs font-medium text-red-700 flex items-center justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Raw Files directly inside Google Drive folders */}
      {activeTab === 'berkas' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {!isSignedIn ? (
            <div className="p-8 text-center space-y-3">
              <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">
                Masuk dengan Google untuk mengakses berkas folder Drive
              </p>
              <div className="flex justify-center">
                <GoogleSignInButton onClick={onSignIn} />
              </div>
            </div>
          ) : allDriveFiles.length === 0 ? (
            <div className="p-8 text-center">
              <FolderOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">
                Folder Google Drive masih kosong
              </p>
              <p className="text-xs text-slate-500 mt-1">
                File Word (.docx) dan PDF (.pdf) yang Anda simpan akan muncul di
                sini.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {allDriveFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs text-slate-500 flex items-center gap-2">
                      <span className="font-medium text-emerald-700">
                        {file.folderLabel}
                      </span>
                      {file.modifiedTime && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">
                            {new Date(file.modifiedTime).toLocaleDateString(
                              'id-ID'
                            )}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-900 truncate mt-0.5">
                      {file.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onDownloadRawDriveFile(file)}
                      className="min-h-[40px] px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-800 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                      Unduh File
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRawDriveFile(file)}
                      aria-label="Hapus file di Google Drive"
                      className="min-h-[40px] min-w-[40px] px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-red-50 text-xs font-medium text-red-700 flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
