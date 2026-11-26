import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  Archive,
  Briefcase,
  ChevronRight,
  FileCheck2,
  FilePlus2,
  FolderSync,
  HeartHandshake,
  Home,
  Inbox,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { ArsipSuratView } from './components/ArsipSuratView';
import { ConfirmModal } from './components/ConfirmModal';
import { DesaSettingsView } from './components/DesaSettingsView';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import { SuratFormSheet } from './components/SuratFormSheet';
import { SuratMasukModal } from './components/SuratMasukModal';
import {
  DEFAULT_LOGO_MALAKA_PATH,
  DEFAULT_PROFIL_DESA,
  JENIS_SURAT_CATALOG,
  KATEGORI_LIST,
  KATEGORI_THEME,
  PERSYARATAN_UMUM,
} from './data/jenisSurat';
import { sanitizeFilename, triggerDownload } from './services/documentGenerator';
import {
  createEmptyDatabase,
  deleteDriveFile,
  downloadDriveFileBlob,
  DriveAuthExpiredError,
  DriveFileItem,
  DriveFolderContext,
  initializeDriveDatabase,
  listDriveFilesInFolder,
  saveDatabaseJson,
  uploadSuratFileToDrive,
} from './services/driveDb';
import {
  clearAccessToken,
  getAccessToken,
  googleSignIn,
  initAuth,
  logout,
} from './services/firebaseAuth';
import {
  ArsipSuratKeluar,
  ArsipSuratMasuk,
  DataPemohonUmum,
  DriveDatabasePayload,
  JenisSuratConfig,
  KategoriSuratId,
  ProfilDesa,
} from './types/surat';

type MainTab = 'beranda' | 'katalog' | 'arsip' | 'pengaturan';

interface ConfirmState {
  open: boolean;
  title: string;
  description: string;
  details?: string[];
  confirmLabel: string;
  variant: 'primary' | 'danger';
  action: (() => Promise<void>) | null;
}

const EMPTY_PEMOHON: DataPemohonUmum = {
  namaLengkap: '',
  nik: '',
  noKk: '',
  tempatLahir: '',
  tanggalLahir: '',
  jenisKelamin: 'Laki-laki',
  agama: 'Islam',
  statusPerkawinan: 'Belum Kawin',
  pekerjaan: '',
  kewarganegaraan: 'Indonesia',
  alamatLengkap: '',
  rtRw: '',
  noHp: '',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>('beranda');
  const [selectedKategori, setSelectedKategori] = useState<
    KategoriSuratId | 'semua'
  >('semua');
  const [searchSurat, setSearchSurat] = useState('');

  // Auth & Google Drive State
  const [user, setUser] = useState<User | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [isLoadingDrive, setIsLoadingDrive] = useState<boolean>(false);
  const [isSavingDrive, setIsSavingDrive] = useState<boolean>(false);
  const [driveContext, setDriveContext] = useState<DriveFolderContext | null>(
    null
  );
  const [customFolderId, setCustomFolderId] = useState<string>('');
  const [driveFilesKeluar, setDriveFilesKeluar] = useState<DriveFileItem[]>([]);
  const [driveFilesMasuk, setDriveFilesMasuk] = useState<DriveFileItem[]>([]);

  // Application Database State (synced with Google Drive when signed in)
  const [db, setDb] = useState<DriveDatabasePayload>(() =>
    createEmptyDatabase()
  );

  // Active Letter Builder State
  const [activeSuratConfig, setActiveSuratConfig] =
    useState<JenisSuratConfig | null>(null);
  const [editingSurat, setEditingSurat] = useState<ArsipSuratKeluar | null>(
    null
  );
  const [sessionPemohon, setSessionPemohon] =
    useState<DataPemohonUmum>(EMPTY_PEMOHON);

  // Modals & Notifications
  const [showSuratMasukModal, setShowSuratMasukModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'error';
  } | null>(null);
  const [confirmModal, setConfirmModal] = useState<ConfirmState>({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Ya, Lanjutkan',
    variant: 'primary',
    action: null,
  });

  const showToast = useCallback(
    (text: string, type: 'success' | 'error' = 'success') => {
      setToastMessage({ text, type });
      setTimeout(() => setToastMessage(null), 4500);
    },
    []
  );

  const loadDriveWorkspace = useCallback(
    async (token: string, folderOverride?: string) => {
      setIsLoadingDrive(true);
      try {
        const { context, database } = await initializeDriveDatabase(
          token,
          folderOverride
        );
        setDriveContext(context);
        setDb(database);

        const [filesKeluar, filesMasuk] = await Promise.all([
          listDriveFilesInFolder(token, context.keluarFolderId),
          listDriveFilesInFolder(token, context.masukFolderId),
        ]);
        setDriveFilesKeluar(filesKeluar);
        setDriveFilesMasuk(filesMasuk);
      } catch (err: unknown) {
        if (err instanceof DriveAuthExpiredError) {
          clearAccessToken();
          setNeedsAuth(true);
          showToast(err.message, 'error');
        } else {
          showToast(
            err instanceof Error
              ? err.message
              : 'Gagal memuat database Google Drive.',
            'error'
          );
        }
      } finally {
        setIsLoadingDrive(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    const unsubscribe = initAuth(
      (authedUser, token) => {
        setUser(authedUser);
        setNeedsAuth(false);
        loadDriveWorkspace(token, customFolderId);
      },
      (firebaseUser) => {
        setUser(firebaseUser);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, [customFolderId, loadDriveWorkspace]);

  const handleLogin = async () => {
    setIsSigningIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
        await loadDriveWorkspace(result.accessToken, customFolderId);
        showToast('Berhasil terhubung dengan Google Drive.');
      }
    } catch (err: unknown) {
      showToast(
        err instanceof Error
          ? err.message
          : 'Gagal masuk dengan akun Google.',
        'error'
      );
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setNeedsAuth(true);
    setDriveContext(null);
    setDriveFilesKeluar([]);
    setDriveFilesMasuk([]);
    setDb(createEmptyDatabase());
    showToast('Anda telah keluar dari akun Google.');
  };

  const handleRefreshDrive = async () => {
    const token = getAccessToken();
    if (!token) {
      setNeedsAuth(true);
      showToast('Silakan masuk kembali dengan Google.', 'error');
      return;
    }
    await loadDriveWorkspace(token, customFolderId);
    showToast('Data Google Drive berhasil disinkronkan.');
  };

  const openConfirm = (
    title: string,
    description: string,
    details: string[],
    confirmLabel: string,
    variant: 'primary' | 'danger',
    action: () => Promise<void>
  ) => {
    setConfirmModal({
      open: true,
      title,
      description,
      details,
      confirmLabel,
      variant,
      action,
    });
  };

  const executeConfirmedAction = async () => {
    if (!confirmModal.action) return;
    setIsSavingDrive(true);
    try {
      await confirmModal.action();
      setConfirmModal((prev) => ({ ...prev, open: false, action: null }));
    } catch (err: unknown) {
      if (err instanceof DriveAuthExpiredError) {
        clearAccessToken();
        setNeedsAuth(true);
      }
      showToast(
        err instanceof Error ? err.message : 'Operasi Google Drive gagal.',
        'error'
      );
    } finally {
      setIsSavingDrive(false);
    }
  };

  // Save Outgoing Letter (Surat Keluar) to Google Drive
  const handleSaveSuratKeluarToDrive = async (
    surat: ArsipSuratKeluar,
    wordBlob: Blob,
    pdfBlob: Blob,
    isEdit: boolean
  ) => {
    const token = getAccessToken();
    if (!token || !driveContext) {
      setNeedsAuth(true);
      showToast('Silakan masuk dengan Google terlebih dahulu.', 'error');
      return;
    }

    const performSave = async () => {
      setIsSavingDrive(true);
      try {
        const baseName = `${sanitizeFilename(
          surat.namaJenisSurat
        )}_${sanitizeFilename(surat.pemohon.namaLengkap)}_${sanitizeFilename(
          surat.nomorSurat
        )}`;

        const [uploadedDocx, uploadedPdf] = await Promise.all([
          uploadSuratFileToDrive(
            token,
            driveContext.keluarFolderId,
            `${baseName}.docx`,
            wordBlob,
            isEdit ? surat.driveDocxFileId : undefined
          ),
          uploadSuratFileToDrive(
            token,
            driveContext.keluarFolderId,
            `${baseName}.pdf`,
            pdfBlob,
            isEdit ? surat.drivePdfFileId : undefined
          ),
        ]);

        const updatedRecord: ArsipSuratKeluar = {
          ...surat,
          driveDocxFileId: uploadedDocx.id,
          driveDocxName: uploadedDocx.name,
          drivePdfFileId: uploadedPdf.id,
          drivePdfName: uploadedPdf.name,
          dibuatOlehEmail: user?.email || undefined,
        };

        const nextList = isEdit
          ? db.suratKeluar.map((s) =>
              s.id === updatedRecord.id ? updatedRecord : s
            )
          : [updatedRecord, ...db.suratKeluar];

        const nextDb: DriveDatabasePayload = {
          ...db,
          counterSuratKeluar: isEdit
            ? db.counterSuratKeluar
            : db.counterSuratKeluar + 1,
          suratKeluar: nextList,
        };

        const savedDb = await saveDatabaseJson(token, driveContext, nextDb);
        setDb(savedDb);
        setEditingSurat(updatedRecord);

        const filesKeluar = await listDriveFilesInFolder(
          token,
          driveContext.keluarFolderId
        );
        setDriveFilesKeluar(filesKeluar);

        showToast(
          isEdit
            ? 'Surat dan berkas Word/PDF berhasil diperbarui di Google Drive.'
            : 'Surat berhasil disimpan ke Google Drive (Word & PDF).'
        );
      } catch (err: unknown) {
        if (err instanceof DriveAuthExpiredError) {
          clearAccessToken();
          setNeedsAuth(true);
        }
        showToast(
          err instanceof Error
            ? err.message
            : 'Gagal menyimpan surat ke Google Drive.',
          'error'
        );
      } finally {
        setIsSavingDrive(false);
      }
    };

    if (isEdit) {
      openConfirm(
        'Perbarui Arsip di Google Drive?',
        'Perubahan ini akan menimpa data arsip dan file Word/PDF sebelumnya di folder Google Drive.',
        [
          `Jenis Surat: ${surat.namaJenisSurat}`,
          `Nomor: ${surat.nomorSurat}`,
          `Pemohon: ${surat.pemohon.namaLengkap}`,
        ],
        'Ya, Perbarui di Drive',
        'primary',
        performSave
      );
    } else {
      await performSave();
    }
  };

  // Save Incoming Letter (Surat Masuk) to Google Drive
  const handleSaveSuratMasuk = async (
    surat: ArsipSuratMasuk,
    attachmentFile: File | null
  ) => {
    const token = getAccessToken();
    if (!token || !driveContext) {
      setNeedsAuth(true);
      showToast('Silakan masuk dengan Google terlebih dahulu.', 'error');
      return;
    }

    setIsSavingDrive(true);
    try {
      let attachmentId: string | undefined;
      let attachmentName: string | undefined;
      let attachmentMime: string | undefined;

      if (attachmentFile) {
        const uploaded = await uploadSuratFileToDrive(
          token,
          driveContext.masukFolderId,
          `${sanitizeFilename(surat.nomorAgenda)}_${attachmentFile.name}`,
          attachmentFile
        );
        attachmentId = uploaded.id;
        attachmentName = uploaded.name;
        attachmentMime = uploaded.mimeType;
      }

      const record: ArsipSuratMasuk = {
        ...surat,
        driveAttachmentFileId: attachmentId,
        driveAttachmentName: attachmentName,
        driveAttachmentMimeType: attachmentMime,
        dibuatOlehEmail: user?.email || undefined,
      };

      const nextDb: DriveDatabasePayload = {
        ...db,
        counterSuratMasuk: db.counterSuratMasuk + 1,
        suratMasuk: [record, ...db.suratMasuk],
      };

      const savedDb = await saveDatabaseJson(token, driveContext, nextDb);
      setDb(savedDb);

      const filesMasuk = await listDriveFilesInFolder(
        token,
        driveContext.masukFolderId
      );
      setDriveFilesMasuk(filesMasuk);

      setShowSuratMasukModal(false);
      showToast('Surat masuk berhasil disimpan ke Google Drive.');
    } catch (err: unknown) {
      if (err instanceof DriveAuthExpiredError) {
        clearAccessToken();
        setNeedsAuth(true);
      }
      showToast(
        err instanceof Error
          ? err.message
          : 'Gagal menyimpan surat masuk ke Google Drive.',
        'error'
      );
    } finally {
      setIsSavingDrive(false);
    }
  };

  const handleToggleTtdKeluar = (item: ArsipSuratKeluar) => {
    const token = getAccessToken();
    if (!token || !driveContext) {
      setNeedsAuth(true);
      return;
    }
    const nextStatus =
      item.statusTtd === 'Sudah Ditandatangani'
        ? 'Siap Cetak & TTD Kades'
        : 'Sudah Ditandatangani';

    openConfirm(
      'Ubah Status Tanda Tangan Surat?',
      `Status surat di database Google Drive akan diubah menjadi "${nextStatus}".`,
      [`${item.namaJenisSurat} (${item.nomorSurat})`, `Pemohon: ${item.pemohon.namaLengkap}`],
      'Ya, Ubah Status',
      'primary',
      async () => {
        const nextDb: DriveDatabasePayload = {
          ...db,
          suratKeluar: db.suratKeluar.map((s) =>
            s.id === item.id ? { ...s, statusTtd: nextStatus } : s
          ),
        };
        const saved = await saveDatabaseJson(token, driveContext, nextDb);
        setDb(saved);
        showToast('Status tanda tangan surat diperbarui.');
      }
    );
  };

  const handleDeleteSuratKeluar = (item: ArsipSuratKeluar) => {
    const token = getAccessToken();
    if (!token || !driveContext) {
      setNeedsAuth(true);
      return;
    }

    openConfirm(
      'Hapus Arsip Surat Keluar?',
      'Arsip surat ini beserta file Word dan PDF terkait akan dihapus permanen dari Google Drive.',
      [
        `Surat: ${item.namaJenisSurat}`,
        `Nomor: ${item.nomorSurat}`,
        `Pemohon: ${item.pemohon.namaLengkap}`,
      ],
      'Hapus dari Drive',
      'danger',
      async () => {
        if (item.driveDocxFileId) {
          await deleteDriveFile(token, item.driveDocxFileId);
        }
        if (item.drivePdfFileId) {
          await deleteDriveFile(token, item.drivePdfFileId);
        }
        const nextDb: DriveDatabasePayload = {
          ...db,
          suratKeluar: db.suratKeluar.filter((s) => s.id !== item.id),
        };
        const saved = await saveDatabaseJson(token, driveContext, nextDb);
        setDb(saved);
        const filesKeluar = await listDriveFilesInFolder(
          token,
          driveContext.keluarFolderId
        );
        setDriveFilesKeluar(filesKeluar);
        showToast('Arsip surat keluar dan file di Google Drive dihapus.');
      }
    );
  };

  const handleDeleteSuratMasuk = (item: ArsipSuratMasuk) => {
    const token = getAccessToken();
    if (!token || !driveContext) {
      setNeedsAuth(true);
      return;
    }

    openConfirm(
      'Hapus Arsip Surat Masuk?',
      'Data agenda surat masuk beserta lampiran berkasnya akan dihapus dari Google Drive.',
      [
        `Perihal: ${item.perihal}`,
        `Agenda: ${item.nomorAgenda}`,
        `Pengirim: ${item.asalInstansi}`,
      ],
      'Hapus dari Drive',
      'danger',
      async () => {
        if (item.driveAttachmentFileId) {
          await deleteDriveFile(token, item.driveAttachmentFileId);
        }
        const nextDb: DriveDatabasePayload = {
          ...db,
          suratMasuk: db.suratMasuk.filter((s) => s.id !== item.id),
        };
        const saved = await saveDatabaseJson(token, driveContext, nextDb);
        setDb(saved);
        const filesMasuk = await listDriveFilesInFolder(
          token,
          driveContext.masukFolderId
        );
        setDriveFilesMasuk(filesMasuk);
        showToast('Arsip surat masuk berhasil dihapus.');
      }
    );
  };

  const handleDownloadRawDriveFile = async (file: DriveFileItem) => {
    const token = getAccessToken();
    if (!token) {
      setNeedsAuth(true);
      showToast('Silakan masuk dengan Google untuk mengunduh berkas.', 'error');
      return;
    }
    try {
      const blob = await downloadDriveFileBlob(token, file.id);
      triggerDownload(blob, file.name);
      showToast(`Berkas "${file.name}" berhasil diunduh.`);
    } catch (err: unknown) {
      if (err instanceof DriveAuthExpiredError) {
        clearAccessToken();
        setNeedsAuth(true);
      }
      showToast(
        err instanceof Error ? err.message : 'Gagal mengunduh file dari Drive.',
        'error'
      );
    }
  };

  const handleDeleteRawDriveFile = (file: DriveFileItem) => {
    const token = getAccessToken();
    if (!token || !driveContext) {
      setNeedsAuth(true);
      return;
    }

    openConfirm(
      'Hapus Berkas di Google Drive?',
      'Berkas ini akan dihapus permanen dari folder Google Drive desa.',
      [`Nama Berkas: ${file.name}`],
      'Hapus Berkas',
      'danger',
      async () => {
        await deleteDriveFile(token, file.id);
        const [filesKeluar, filesMasuk] = await Promise.all([
          listDriveFilesInFolder(token, driveContext.keluarFolderId),
          listDriveFilesInFolder(token, driveContext.masukFolderId),
        ]);
        setDriveFilesKeluar(filesKeluar);
        setDriveFilesMasuk(filesMasuk);
        showToast(`Berkas "${file.name}" dihapus dari Google Drive.`);
      }
    );
  };

  const handleSaveProfilDesa = (updated: ProfilDesa) => {
    const token = getAccessToken();
    if (!token || !driveContext || needsAuth) {
      setDb((prev) => ({ ...prev, profilDesa: updated }));
      showToast('Profil Kop Desa diterapkan untuk sesi ini.');
      return;
    }

    openConfirm(
      'Simpan Perubahan Kop Surat Desa ke Google Drive?',
      'Profil desa dan nama Kepala Desa pada file database Google Drive akan diperbarui untuk semua surat baru.',
      [
        `Desa: ${updated.namaDesa}`,
        `Kepala Desa: ${updated.namaKepalaDesa}`,
      ],
      'Simpan Perubahan',
      'primary',
      async () => {
        const nextDb: DriveDatabasePayload = {
          ...db,
          profilDesa: updated,
        };
        const saved = await saveDatabaseJson(token, driveContext, nextDb);
        setDb(saved);
        showToast('Profil Kop Surat Desa tersimpan di Google Drive.');
      }
    );
  };

  const handleConnectCustomFolder = async (folderId: string) => {
    const token = getAccessToken();
    if (!token) {
      setNeedsAuth(true);
      return;
    }
    setCustomFolderId(folderId);
    await loadDriveWorkspace(token, folderId);
    showToast('Terhubung ke folder Google Drive desa.');
  };

  const handleResetDefaultFolder = async () => {
    const token = getAccessToken();
    if (!token) return;
    setCustomFolderId('');
    await loadDriveWorkspace(token, '');
    showToast('Kembali ke folder Google Drive pribadi.');
  };

  const filteredCatalog = useMemo(() => {
    const q = searchSurat.trim().toLowerCase();
    return JENIS_SURAT_CATALOG.filter((item) => {
      const matchCat =
        selectedKategori === 'semua' || item.kategori === selectedKategori;
      const matchQuery =
        !q ||
        item.nama.toLowerCase().includes(q) ||
        item.ringkasan.toLowerCase().includes(q) ||
        item.kodeKlasifikasi.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [selectedKategori, searchSurat]);

  const handleOpenLetterForm = (config: JenisSuratConfig) => {
    setEditingSurat(null);
    setActiveSuratConfig(config);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditExistingSurat = (item: ArsipSuratKeluar) => {
    const config =
      JENIS_SURAT_CATALOG.find((c) => c.id === item.jenisSuratId) ||
      JENIS_SURAT_CATALOG[0];
    setEditingSurat(item);
    setActiveSuratConfig(config);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCategoryIcon = (kategori: KategoriSuratId) => {
    switch (kategori) {
      case 'kependudukan':
        return <Users className="w-4 h-4" />;
      case 'pernikahan':
        return <HeartHandshake className="w-4 h-4" />;
      case 'ekonomi':
        return <Briefcase className="w-4 h-4" />;
      case 'keamanan_pertanahan':
        return <ShieldCheck className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-[#142026]">
      {/* Desktop Top Bar (3-Zone Contract) */}
      <header className="no-print sticky top-0 z-30 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-[#E6E2D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 md:h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <button
            type="button"
            onClick={() => {
              setActiveSuratConfig(null);
              setActiveTab('beranda');
            }}
            className="text-lg font-bold tracking-tight text-[#0B2D39] whitespace-nowrap shrink-0 text-left"
          >
            Balai Surat Desa Loofoun
          </button>

          {/* Zone 2: 4 Single-line Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => {
                setActiveSuratConfig(null);
                setActiveTab('beranda');
              }}
              className={`py-1 whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'beranda' && !activeSuratConfig
                  ? 'text-[#0E6044] border-b-2 border-[#D99B26] font-semibold'
                  : 'hover:text-[#0B2D39]'
              }`}
            >
              Beranda
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSuratConfig(null);
                setActiveTab('katalog');
              }}
              className={`py-1 whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'katalog' || activeSuratConfig
                  ? 'text-[#0E6044] border-b-2 border-[#D99B26] font-semibold'
                  : 'hover:text-[#0B2D39]'
              }`}
            >
              Layanan Surat
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSuratConfig(null);
                setActiveTab('arsip');
              }}
              className={`py-1 whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'arsip' && !activeSuratConfig
                  ? 'text-[#0E6044] border-b-2 border-[#D99B26] font-semibold'
                  : 'hover:text-[#0B2D39]'
              }`}
            >
              Arsip Masuk &amp; Keluar
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSuratConfig(null);
                setActiveTab('pengaturan');
              }}
              className={`py-1 whitespace-nowrap shrink-0 transition-colors ${
                activeTab === 'pengaturan' && !activeSuratConfig
                  ? 'text-[#0E6044] border-b-2 border-[#D99B26] font-semibold'
                  : 'hover:text-[#0B2D39]'
              }`}
            >
              Pengaturan Desa
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center shrink-0">
            {needsAuth ? (
              <GoogleSignInButton
                onClick={handleLogin}
                disabled={isSigningIn}
                label={isSigningIn ? 'Menghubungkan...' : 'Masuk Google'}
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  setActiveSuratConfig(null);
                  setActiveTab('arsip');
                }}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-[#0B2D39] hover:bg-[#103D4D] text-white text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                <FolderSync className="w-4 h-4 text-amber-300" />
                <span>{user?.displayName?.split(' ')[0] || 'Drive Aktif'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="no-print fixed top-16 right-4 left-4 sm:left-auto sm:max-w-sm z-50">
          <div
            className={`rounded-xl px-4 py-3 text-sm font-medium shadow-lg border ${
              toastMessage.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-900'
                : 'bg-emerald-900 border-emerald-800 text-white'
            }`}
          >
            {toastMessage.text}
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8">
        {activeSuratConfig ? (
          <SuratFormSheet
            config={activeSuratConfig}
            profilDesa={db.profilDesa || DEFAULT_PROFIL_DESA}
            nextUrutan={db.counterSuratKeluar + 1}
            initialPemohon={sessionPemohon}
            editingSurat={editingSurat}
            isSignedIn={!needsAuth}
            isSavingDrive={isSavingDrive}
            onBack={() => {
              setActiveSuratConfig(null);
              setEditingSurat(null);
            }}
            onSignIn={handleLogin}
            onPemohonChange={setSessionPemohon}
            onSaveToDrive={handleSaveSuratKeluarToDrive}
          />
        ) : activeTab === 'arsip' ? (
          <ArsipSuratView
            suratKeluar={db.suratKeluar}
            suratMasuk={db.suratMasuk}
            driveFilesKeluar={driveFilesKeluar}
            driveFilesMasuk={driveFilesMasuk}
            profilDesa={db.profilDesa}
            isSignedIn={!needsAuth}
            isLoadingDrive={isLoadingDrive}
            onSignIn={handleLogin}
            onRefreshDrive={handleRefreshDrive}
            onOpenNewSuratMasuk={() => setShowSuratMasukModal(true)}
            onEditSuratKeluar={handleEditExistingSurat}
            onToggleTtdKeluar={handleToggleTtdKeluar}
            onDeleteSuratKeluar={handleDeleteSuratKeluar}
            onDeleteSuratMasuk={handleDeleteSuratMasuk}
            onDownloadRawDriveFile={handleDownloadRawDriveFile}
            onDeleteRawDriveFile={handleDeleteRawDriveFile}
          />
        ) : activeTab === 'pengaturan' ? (
          <DesaSettingsView
            profilDesa={db.profilDesa}
            driveContext={driveContext}
            customFolderId={customFolderId}
            isSignedIn={!needsAuth}
            isBusy={isLoadingDrive || isSavingDrive}
            onSignIn={handleLogin}
            onLogout={handleLogout}
            onSaveProfil={handleSaveProfilDesa}
            onConnectCustomFolder={handleConnectCustomFolder}
            onResetDefaultFolder={handleResetDefaultFolder}
          />
        ) : (
          /* BERANDA & KATALOG SURAT */
          <div className="pb-24 lg:pb-12 space-y-8">
            {activeTab === 'beranda' && (
              <>
                {/* Hero Section — Malaka Forest & Timor Sea Palette */}
                <section className="overflow-hidden rounded-3xl border border-[#0E4A3E] bg-gradient-to-br from-[#0B2D39] via-[#0F453E] to-[#135B46] text-white shadow-sm">
                  <div className="tais-weave-bar w-full" aria-hidden="true" />
                  <div className="p-5 sm:p-8 lg:p-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
                      <div className="lg:col-span-7 space-y-4">
                        <div className="flex items-center gap-3.5">
                          <img
                            src={
                              db.profilDesa.logoDataUrl ||
                              DEFAULT_LOGO_MALAKA_PATH
                            }
                            alt="Logo Kabupaten Malaka"
                            referrerPolicy="no-referrer"
                            className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl border border-white/25 bg-white object-contain p-1.5 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-semibold text-amber-300 tracking-wide">
                              {db.profilDesa.namaDesa} · {db.profilDesa.kecamatan}
                            </div>
                            <div className="text-xs text-emerald-100/85">
                              {db.profilDesa.kabupaten} · Provinsi Nusa Tenggara Timur
                            </div>
                          </div>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight leading-tight text-balance">
                          Buat &amp; Cetak Surat Desa Mandiri dari Ponsel Anda
                        </h1>
                        <p className="text-sm sm:text-base text-emerald-50/90 leading-relaxed max-w-2xl">
                          Pilih salah satu dari 27 jenis surat resmi desa, isi data
                          sesuai KTP/KK, lalu unduh format Word atau PDF untuk
                          dicetak mandiri dan ditandatangani oleh Kepala Desa.
                          Seluruh arsip surat masuk dan keluar tersimpan aman di
                          Google Drive.
                        </p>

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={() => setActiveTab('katalog')}
                            className="min-h-[46px] px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#0B2D39] text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
                          >
                            <FilePlus2 className="w-4 h-4" />
                            Buat Surat Sekarang
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTab('arsip')}
                            className="min-h-[46px] px-4 py-2.5 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 text-white text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
                          >
                            <Archive className="w-4 h-4 text-amber-300" />
                            Buka Arsip Drive
                          </button>
                          {!needsAuth && (
                            <button
                              type="button"
                              onClick={() => setShowSuratMasukModal(true)}
                              className="min-h-[46px] px-4 py-2.5 rounded-xl border border-white/25 bg-white/10 hover:bg-white/20 text-white text-sm font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
                            >
                              <Inbox className="w-4 h-4 text-amber-300" />
                              Catat Surat Masuk
                            </button>
                          )}
                        </div>
                      </div>

                      {/* 3 Langkah Alur Mudah Warga */}
                      <div className="lg:col-span-5 bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-5 space-y-4">
                        <h2 className="text-sm font-semibold text-amber-300">
                          Cara Pakai yang Mudah
                        </h2>
                        <ol className="space-y-3 text-sm">
                          <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-amber-400 text-[#0B2D39] text-xs font-bold flex items-center justify-center shrink-0 tabular-nums mt-0.5">
                              1
                            </span>
                            <div>
                              <p className="font-semibold text-white">
                                Pilih Jenis Surat
                              </p>
                              <p className="text-xs text-emerald-50/80">
                                Tersedia 27 layanan kependudukan, nikah, usaha,
                                SKTM, SKCK, hingga pertanahan.
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-amber-400 text-[#0B2D39] text-xs font-bold flex items-center justify-center shrink-0 tabular-nums mt-0.5">
                              2
                            </span>
                            <div>
                              <p className="font-semibold text-white">
                                Isi Data &amp; Unduh Word / PDF
                              </p>
                              <p className="text-xs text-emerald-50/80">
                                Pratinjau surat otomatis tersusun rapi lengkap
                                dengan Kop Surat Desa Loofoun dan tersimpan ke Google Drive.
                              </p>
                            </div>
                          </li>
                          <li className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-amber-400 text-[#0B2D39] text-xs font-bold flex items-center justify-center shrink-0 tabular-nums mt-0.5">
                              3
                            </span>
                            <div>
                              <p className="font-semibold text-white">
                                Cetak Mandiri &amp; Tanda Tangan Kades
                              </p>
                              <p className="text-xs text-emerald-50/80">
                                Print surat dari rumah atau tempat cetak, lalu
                                bawa ke kantor desa untuk tanda tangan Kepala Desa.
                              </p>
                            </div>
                          </li>
                        </ol>
                      </div>
                    </div>

                    {/* Ringkasan Angka Arsip */}
                    <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-emerald-100/75">
                          Layanan Surat
                        </div>
                        <div className="text-xl font-bold text-white tabular-nums mt-0.5">
                          {JENIS_SURAT_CATALOG.length} Jenis
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-emerald-100/75">
                          Arsip Surat Keluar
                        </div>
                        <div className="text-xl font-bold text-white tabular-nums mt-0.5">
                          {db.suratKeluar.length} Surat
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-emerald-100/75">
                          Arsip Surat Masuk
                        </div>
                        <div className="text-xl font-bold text-white tabular-nums mt-0.5">
                          {db.suratMasuk.length} Surat
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-emerald-100/75">
                          Penyimpanan Drive
                        </div>
                        <div className="text-sm font-semibold text-amber-300 mt-1.5 truncate">
                          {needsAuth
                            ? 'Belum Terhubung'
                            : driveContext?.rootFolderName || 'Database_Surat_Desa'}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Persyaratan Umum Surat */}
                <section className="bg-[#FFFDF7] border border-[#E7DEC8] rounded-2xl p-5 sm:p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="max-w-xl">
                      <h2 className="text-base font-semibold text-[#0B2D39]">
                        Persyaratan Umum Pengurusan Surat
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        Pastikan dokumen berikut disiapkan saat membawa hasil
                        cetakan surat untuk ditandatangani Kepala Desa.
                      </p>
                    </div>
                    <ul className="flex-1 space-y-2 text-sm text-slate-700">
                      {PERSYARATAN_UMUM.map((syarat, index) => (
                        <li key={index} className="flex items-start gap-2.5">
                          <FileCheck2 className="w-4 h-4 text-[#9A5B13] shrink-0 mt-1" />
                          <span>{syarat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              </>
            )}

            {/* Katalog Semua 27 Jenis Surat */}
            <section className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#0B2D39] tracking-tight">
                    Pilih Jenis Surat yang Dibutuhkan
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    Klik salah satu layanan untuk mengisi formulir dan mengunduh
                    Word / PDF.
                  </p>
                </div>

                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    placeholder="Cari surat (mis. Domisili, SKTM, Nikah)..."
                    value={searchSurat}
                    onChange={(e) => setSearchSurat(e.target.value)}
                    className="w-full min-h-[44px] pl-10 pr-3.5 py-2 rounded-xl border border-[#DFDBD0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#0E6044]"
                  />
                </div>
              </div>

              {/* Filter Kategori Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setSelectedKategori('semua')}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium border transition-colors whitespace-nowrap shrink-0 ${
                    selectedKategori === 'semua'
                      ? 'bg-[#0B2D39] border-[#0B2D39] text-white'
                      : 'bg-white border-[#DFDBD0] text-slate-700 hover:bg-[#FAF9F5]'
                  }`}
                >
                  Semua ({JENIS_SURAT_CATALOG.length})
                </button>
                {KATEGORI_LIST.map((kat) => {
                  const count = JENIS_SURAT_CATALOG.filter(
                    (s) => s.kategori === kat.id
                  ).length;
                  const theme = KATEGORI_THEME[kat.id];
                  return (
                    <button
                      key={kat.id}
                      type="button"
                      onClick={() => setSelectedKategori(kat.id)}
                      className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium border transition-colors whitespace-nowrap shrink-0 ${
                        selectedKategori === kat.id
                          ? theme.activeBtn
                          : 'bg-white border-[#DFDBD0] text-slate-700 hover:bg-[#FAF9F5]'
                      }`}
                    >
                      {kat.nama} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Grid Kartu Surat */}
              {filteredCatalog.length === 0 ? (
                <div className="bg-white border border-[#E6E2D8] rounded-2xl p-8 text-center">
                  <p className="text-sm font-semibold text-slate-800">
                    Jenis surat tidak ditemukan
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Coba kata kunci lain seperti "Domisili", "KTP", "Nikah",
                    "Usaha", atau "Tanah".
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredCatalog.map((surat) => {
                    const katName = KATEGORI_LIST.find(
                      (k) => k.id === surat.kategori
                    )?.nama;
                    const theme = KATEGORI_THEME[surat.kategori];
                    return (
                      <button
                        key={surat.id}
                        type="button"
                        onClick={() => handleOpenLetterForm(surat)}
                        className={`text-left bg-white border border-[#E6E2D8] ${theme.hoverBorder} rounded-2xl p-4 sm:p-5 flex flex-col justify-between gap-3 transition-all hover:shadow-xs group`}
                      >
                        <div>
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl ${theme.tileBg} ${theme.tileText} flex items-center justify-center shrink-0 mt-0.5`}
                            >
                              {renderCategoryIcon(surat.kategori)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                                <span className={`font-medium ${theme.labelText}`}>
                                  {katName}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono tabular-nums">
                                  Kode {surat.kodeKlasifikasi}
                                </span>
                                {surat.perpres96BebasRtRw && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="text-[#0E6044] font-medium">
                                      Perpres 96/2019
                                    </span>
                                  </>
                                )}
                              </div>
                              <h3 className="mt-1 text-base font-semibold text-[#142026] group-hover:text-[#0B2D39] transition-colors">
                                {surat.nama}
                              </h3>
                            </div>
                          </div>
                          <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                            {surat.ringkasan}
                          </p>
                        </div>

                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0E6044]">
                          <span>Buat &amp; Unduh Word/PDF</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Mobile Fixed Bottom Tab Bar (Thumb Zone) */}
      <nav
        aria-label="Navigasi utama ponsel"
        className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-md border-t border-[#E6E2D8] pb-safe"
      >
        <div className="grid grid-cols-4 h-16 items-center">
          <button
            type="button"
            onClick={() => {
              setActiveSuratConfig(null);
              setActiveTab('beranda');
            }}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 ${
              activeTab === 'beranda' && !activeSuratConfig
                ? 'text-[#0E6044] font-semibold'
                : 'text-slate-500'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[11px] tracking-tight whitespace-nowrap">
              Beranda
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSuratConfig(null);
              setActiveTab('katalog');
            }}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 ${
              activeTab === 'katalog' || activeSuratConfig
                ? 'text-[#0E6044] font-semibold'
                : 'text-slate-500'
            }`}
          >
            <FilePlus2 className="w-5 h-5" />
            <span className="text-[11px] tracking-tight whitespace-nowrap">
              Buat Surat
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSuratConfig(null);
              setActiveTab('arsip');
            }}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 ${
              activeTab === 'arsip' && !activeSuratConfig
                ? 'text-[#0E6044] font-semibold'
                : 'text-slate-500'
            }`}
          >
            <Archive className="w-5 h-5" />
            <span className="text-[11px] tracking-tight whitespace-nowrap">
              Arsip
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveSuratConfig(null);
              setActiveTab('pengaturan');
            }}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 ${
              activeTab === 'pengaturan' && !activeSuratConfig
                ? 'text-[#0E6044] font-semibold'
                : 'text-slate-500'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[11px] tracking-tight whitespace-nowrap">
              Desa
            </span>
          </button>
        </div>
      </nav>

      {/* Surat Masuk Modal */}
      <SuratMasukModal
        open={showSuratMasukModal}
        nextAgendaNumber={db.counterSuratMasuk + 1}
        isSignedIn={!needsAuth}
        isSaving={isSavingDrive}
        onClose={() => setShowSuratMasukModal(false)}
        onSignIn={handleLogin}
        onSave={handleSaveSuratMasuk}
      />

      {/* Mandatory Confirmation Dialog for Google Drive Mutations/Deletions */}
      <ConfirmModal
        open={confirmModal.open}
        title={confirmModal.title}
        description={confirmModal.description}
        details={confirmModal.details}
        confirmLabel={confirmModal.confirmLabel}
        variant={confirmModal.variant}
        isProcessing={isSavingDrive}
        onConfirm={executeConfirmedAction}
        onCancel={() =>
          setConfirmModal((prev) => ({ ...prev, open: false, action: null }))
        }
      />
    </div>
  );
}
