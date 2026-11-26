export type KategoriSuratId =
  | 'kependudukan'
  | 'pernikahan'
  | 'ekonomi'
  | 'keamanan_pertanahan';

export interface FieldTambahan {
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'date' | 'select' | 'number';
  options?: string[];
  required?: boolean;
  helperText?: string;
}

export interface JenisSuratConfig {
  id: string;
  kodeKlasifikasi: string;
  kategori: KategoriSuratId;
  nama: string;
  namaJudulDokumen: string;
  ringkasan: string;
  perpres96BebasRtRw: boolean;
  persyaratanKhusus: string[];
  fieldTambahan: FieldTambahan[];
  paragrafPembuka: string;
  paragrafIsiTemplate: string;
  paragrafPenutup: string;
}

export interface ProfilDesa {
  kabupaten: string;
  kecamatan: string;
  namaDesa: string;
  alamatKantor: string;
  kodePos: string;
  telepon: string;
  email: string;
  namaKepalaDesa: string;
  jabatanKepalaDesa: string;
  nipKepalaDesa: string;
  kodeDesaSingkat: string;
  logoDataUrl?: string;
}

export interface DataPemohonUmum {
  namaLengkap: string;
  nik: string;
  noKk: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  agama: string;
  statusPerkawinan: string;
  pekerjaan: string;
  kewarganegaraan: string;
  alamatLengkap: string;
  rtRw: string;
  noHp: string;
}

export interface ArsipSuratKeluar {
  id: string;
  nomorSurat: string;
  jenisSuratId: string;
  namaJenisSurat: string;
  kategori: KategoriSuratId;
  tanggalSurat: string;
  pemohon: DataPemohonUmum;
  dataTambahan: Record<string, string>;
  keperluan: string;
  statusTtd: 'Siap Cetak & TTD Kades' | 'Sudah Ditandatangani';
  driveDocxFileId?: string;
  drivePdfFileId?: string;
  driveDocxName?: string;
  drivePdfName?: string;
  dibuatOlehEmail?: string;
  dibuatPada: string;
  diperbaruiPada: string;
}

export interface ArsipSuratMasuk {
  id: string;
  nomorSuratAsal: string;
  nomorAgenda: string;
  tanggalSurat: string;
  tanggalDiterima: string;
  asalInstansi: string;
  perihal: string;
  sifatSurat: 'Biasa' | 'Penting' | 'Segera' | 'Rahasia';
  ringkasanIsi: string;
  disposisiKades: string;
  statusDisposisi: 'Menunggu Arahan' | 'Diteruskan' | 'Selesai';
  driveAttachmentFileId?: string;
  driveAttachmentName?: string;
  driveAttachmentMimeType?: string;
  dibuatOlehEmail?: string;
  dibuatPada: string;
}

export interface DriveDatabasePayload {
  version: number;
  updatedAt: string;
  profilDesa: ProfilDesa;
  counterSuratKeluar: number;
  counterSuratMasuk: number;
  suratKeluar: ArsipSuratKeluar[];
  suratMasuk: ArsipSuratMasuk[];
}
