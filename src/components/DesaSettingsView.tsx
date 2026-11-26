import React, { useState } from 'react';
import {
  Check,
  Copy,
  FolderOpen,
  HardDrive,
  Image as ImageIcon,
  RefreshCw,
  RotateCcw,
  Save,
} from 'lucide-react';
import { DEFAULT_LOGO_MALAKA_PATH } from '../data/jenisSurat';
import {
  DriveFolderContext,
  extractDriveFolderId,
} from '../services/driveDb';
import { ProfilDesa } from '../types/surat';
import { GoogleSignInButton } from './GoogleSignInButton';

interface DesaSettingsViewProps {
  profilDesa: ProfilDesa;
  driveContext: DriveFolderContext | null;
  customFolderId: string;
  isSignedIn: boolean;
  isBusy: boolean;
  onSignIn: () => void;
  onLogout: () => void;
  onSaveProfil: (updated: ProfilDesa) => void;
  onConnectCustomFolder: (folderId: string) => Promise<void>;
  onResetDefaultFolder: () => Promise<void>;
}

export const DesaSettingsView: React.FC<DesaSettingsViewProps> = ({
  profilDesa,
  driveContext,
  customFolderId,
  isSignedIn,
  isBusy,
  onSignIn,
  onLogout,
  onSaveProfil,
  onConnectCustomFolder,
  onResetDefaultFolder,
}) => {
  const [form, setForm] = useState<ProfilDesa>(profilDesa);
  const [folderInput, setFolderInput] = useState(customFolderId);
  const [copiedId, setCopiedId] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLogoError(false);
      setForm((prev) => ({ ...prev, logoDataUrl: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  };

  const handleCopyFolderId = async () => {
    if (!driveContext?.rootFolderId) return;
    try {
      await navigator.clipboard.writeText(driveContext.rootFolderId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // Fallback ignored if clipboard blocked
    }
  };

  return (
    <div className="pb-24 lg:pb-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Database Google Drive Card */}
      <div className="lg:col-span-5 space-y-5">
        <section className="overflow-hidden bg-white border border-[#E6E2D8] rounded-2xl">
          <div className="tais-weave-bar w-full" aria-hidden="true" />
          <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E9F4F6] text-[#0F5C6E] flex items-center justify-center shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#0B2D39]">
                Database Google Drive
              </h2>
              <p className="text-xs text-slate-500">
                Semua data surat masuk, keluar, Word, dan PDF tersimpan di Drive.
              </p>
            </div>
          </div>

          {!isSignedIn ? (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-3">
              <p className="text-xs leading-relaxed text-slate-600">
                Masuk dengan akun Google Anda untuk menyinkronkan database surat
                desa secara langsung dengan Google Drive.
              </p>
              <GoogleSignInButton onClick={onSignIn} />
            </div>
          ) : (
            <div className="space-y-4">
              {driveContext && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                      <FolderOpen className="w-4 h-4 text-emerald-700" />
                      {driveContext.rootFolderName}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyFolderId}
                      className="min-h-[36px] px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
                    >
                      {copiedId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          Tersalin
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Salin ID Folder
                        </>
                      )}
                    </button>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 break-all tabular-nums">
                    ID Folder: {driveContext.rootFolderId}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Bagikan folder ini di Google Drive dengan izin akses kepada
                    warga atau perangkat desa lain agar mereka dapat mengakses
                    database surat yang sama melalui ponsel.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700">
                  Hubungkan ke Folder Google Drive Desa Bersama (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Tempel Link Folder atau ID Folder Google Drive"
                  value={folderInput}
                  onChange={(e) => setFolderInput(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isBusy || !folderInput.trim()}
                    onClick={() =>
                      onConnectCustomFolder(extractDriveFolderId(folderInput))
                    }
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Hubungkan Folder
                  </button>
                  {customFolderId && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => {
                        setFolderInput('');
                        onResetDefaultFolder();
                      }}
                      className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 whitespace-nowrap"
                    >
                      Gunakan Drive Pribadi
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onLogout}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Keluar dari Akun Google
                </button>
              </div>
            </div>
          )}
          </div>
        </section>
      </div>

      {/* Profil & Kop Surat Desa */}
      <div className="lg:col-span-7">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSaveProfil(form);
          }}
          className="bg-white border border-[#E6E2D8] rounded-2xl p-5 sm:p-6 space-y-4"
        >
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Profil Pemerintah Desa &amp; Kop Surat
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Data dan logo ini otomatis muncul pada Kop Surat serta file Word &amp; PDF.
            </p>
          </div>

          {/* Logo Kabupaten Malaka */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {!logoError ? (
                <img
                  src={form.logoDataUrl || DEFAULT_LOGO_MALAKA_PATH}
                  alt="Logo Kabupaten Malaka"
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                  className="w-14 h-14 rounded-lg bg-white border border-slate-200 object-contain p-1 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  Logo Kabupaten Malaka (Kop Surat)
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Otomatis tercetak pada header surat Word, PDF, dan halaman cetak.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <label className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-medium text-slate-700 cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
                <ImageIcon className="w-3.5 h-3.5" />
                Ganti Logo
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={handleLogoFileChange}
                />
              </label>
              {form.logoDataUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setLogoError(false);
                    setForm((prev) => ({ ...prev, logoDataUrl: undefined }));
                  }}
                  className="min-h-[40px] px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-medium text-slate-600 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Default
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Nama Kabupaten / Kota
              </label>
              <input
                type="text"
                value={form.kabupaten}
                onChange={(e) =>
                  setForm({ ...form, kabupaten: e.target.value })
                }
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Nama Kecamatan
              </label>
              <input
                type="text"
                value={form.kecamatan}
                onChange={(e) =>
                  setForm({ ...form, kecamatan: e.target.value })
                }
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Nama Desa / Kelurahan
              </label>
              <input
                type="text"
                value={form.namaDesa}
                onChange={(e) => setForm({ ...form, namaDesa: e.target.value })}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Kode Singkat Desa (Nomor Surat)
              </label>
              <input
                type="text"
                value={form.kodeDesaSingkat}
                onChange={(e) =>
                  setForm({ ...form, kodeDesaSingkat: e.target.value })
                }
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono uppercase"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Alamat Kantor Desa
              </label>
              <input
                type="text"
                value={form.alamatKantor}
                onChange={(e) =>
                  setForm({ ...form, alamatKantor: e.target.value })
                }
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Telepon Kantor Desa
              </label>
              <input
                type="text"
                value={form.telepon}
                onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm tabular-nums"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Email Resmi Desa
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Jabatan Penanda Tangan
              </label>
              <input
                type="text"
                value={form.jabatanKepalaDesa}
                onChange={(e) =>
                  setForm({ ...form, jabatanKepalaDesa: e.target.value })
                }
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Nama Lengkap Kepala Desa
              </label>
              <input
                type="text"
                value={form.namaKepalaDesa}
                onChange={(e) =>
                  setForm({ ...form, namaKepalaDesa: e.target.value })
                }
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                NIP / NIAP Kepala Desa (Opsional)
              </label>
              <input
                type="text"
                value={form.nipKepalaDesa}
                onChange={(e) =>
                  setForm({ ...form, nipKepalaDesa: e.target.value })
                }
                className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isBusy}
              className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#0E6044] hover:bg-[#0A4A34] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              <Save className="w-4 h-4 text-amber-300" />
              {isSignedIn
                ? 'Simpan Profil Desa ke Google Drive'
                : 'Terapkan Profil Desa Sementara'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
