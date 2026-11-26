import React, { useState } from 'react';
import { CloudUpload, Paperclip, X } from 'lucide-react';
import { ArsipSuratMasuk } from '../types/surat';
import { GoogleSignInButton } from './GoogleSignInButton';

interface SuratMasukModalProps {
  open: boolean;
  nextAgendaNumber: number;
  isSignedIn: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSignIn: () => void;
  onSave: (surat: ArsipSuratMasuk, attachmentFile: File | null) => Promise<void>;
}

export const SuratMasukModal: React.FC<SuratMasukModalProps> = ({
  open,
  nextAgendaNumber,
  isSignedIn,
  isSaving,
  onClose,
  onSignIn,
  onSave,
}) => {
  const today = new Date().toISOString().slice(0, 10);
  const [nomorSuratAsal, setNomorSuratAsal] = useState('');
  const [nomorAgenda, setNomorAgenda] = useState(
    `SM-${String(nextAgendaNumber).padStart(3, '0')}/${new Date().getFullYear()}`
  );
  const [tanggalSurat, setTanggalSurat] = useState(today);
  const [tanggalDiterima, setTanggalDiterima] = useState(today);
  const [asalInstansi, setAsalInstansi] = useState('');
  const [perihal, setPerihal] = useState('');
  const [sifatSurat, setSifatSurat] =
    useState<ArsipSuratMasuk['sifatSurat']>('Biasa');
  const [ringkasanIsi, setRingkasanIsi] = useState('');
  const [disposisiKades, setDisposisiKades] = useState('');
  const [statusDisposisi, setStatusDisposisi] =
    useState<ArsipSuratMasuk['statusDisposisi']>('Menunggu Arahan');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomorSuratAsal.trim() || !asalInstansi.trim() || !perihal.trim()) {
      setError('Nomor surat asal, instansi pengirim, dan perihal wajib diisi.');
      return;
    }
    setError(null);
    const item: ArsipSuratMasuk = {
      id: `sm-${Date.now()}`,
      nomorSuratAsal: nomorSuratAsal.trim(),
      nomorAgenda: nomorAgenda.trim(),
      tanggalSurat,
      tanggalDiterima,
      asalInstansi: asalInstansi.trim(),
      perihal: perihal.trim(),
      sifatSurat,
      ringkasanIsi: ringkasanIsi.trim(),
      disposisiKades: disposisiKades.trim(),
      statusDisposisi,
      dibuatPada: new Date().toISOString(),
    };
    await onSave(item, attachment);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-xs p-0 sm:p-4 no-print"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full sm:max-w-xl max-h-[90vh] flex flex-col bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Catat Surat Masuk Baru
            </h2>
            <p className="text-xs text-slate-500">
              Simpan agenda surat masuk dan lampiran PDF/Word/Foto ke Google Drive.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs text-red-800">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nomor Agenda
              </label>
              <input
                type="text"
                value={nomorAgenda}
                onChange={(e) => setNomorAgenda(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Nomor Surat Asal <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: 005/142/Kec/2026"
                value={nomorSuratAsal}
                onChange={(e) => setNomorSuratAsal(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tanggal Surat
              </label>
              <input
                type="date"
                value={tanggalSurat}
                onChange={(e) => setTanggalSurat(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 text-sm tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Tanggal Diterima
              </label>
              <input
                type="date"
                value={tanggalDiterima}
                onChange={(e) => setTanggalDiterima(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 text-sm tabular-nums"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Asal / Instansi Pengirim <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Kecamatan Harapan Jaya / Dinas PMD / Sekolah"
                value={asalInstansi}
                onChange={(e) => setAsalInstansi(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Perihal Surat <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Undangan Musyawarah Perencanaan Pembangunan Desa"
                value={perihal}
                onChange={(e) => setPerihal(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Sifat Surat
              </label>
              <select
                value={sifatSurat}
                onChange={(e) =>
                  setSifatSurat(e.target.value as ArsipSuratMasuk['sifatSurat'])
                }
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              >
                <option value="Biasa">Biasa</option>
                <option value="Penting">Penting</option>
                <option value="Segera">Segera</option>
                <option value="Rahasia">Rahasia</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Status Disposisi
              </label>
              <select
                value={statusDisposisi}
                onChange={(e) =>
                  setStatusDisposisi(
                    e.target.value as ArsipSuratMasuk['statusDisposisi']
                  )
                }
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm"
              >
                <option value="Menunggu Arahan">Menunggu Arahan</option>
                <option value="Diteruskan">Diteruskan</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Ringkasan Isi Surat
              </label>
              <textarea
                rows={2}
                placeholder="Ringkasan singkat isi surat masuk..."
                value={ringkasanIsi}
                onChange={(e) => setRingkasanIsi(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Disposisi / Arahan Kepala Desa
              </label>
              <input
                type="text"
                placeholder="Contoh: Sekretaris Desa agar menindaklanjuti dan mengundang RT/RW"
                value={disposisiKades}
                onChange={(e) => setDisposisiKades(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Unggah Scan / File Surat (PDF, Word, atau Foto dari HP)
              </label>
              <label className="flex items-center justify-between gap-3 min-h-[48px] px-3.5 py-2.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
                <div className="flex items-center gap-2 text-xs text-slate-600 truncate">
                  <Paperclip className="w-4 h-4 shrink-0 text-slate-500" />
                  <span className="truncate">
                    {attachment
                      ? attachment.name
                      : 'Pilih file PDF, .docx, atau gambar surat...'}
                  </span>
                </div>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  className="sr-only"
                  onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                />
                <span className="text-xs font-medium text-emerald-700 shrink-0">
                  Pilih File
                </span>
              </label>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            {isSignedIn ? (
              <button
                type="submit"
                disabled={isSaving}
                className="w-full min-h-[48px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                <CloudUpload className="w-4 h-4" />
                {isSaving
                  ? 'Mengunggah ke Google Drive...'
                  : 'Simpan Surat Masuk ke Google Drive'}
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-600">
                  Masuk dengan Google untuk menyimpan surat masuk ke Drive.
                </span>
                <GoogleSignInButton onClick={onSignIn} />
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
