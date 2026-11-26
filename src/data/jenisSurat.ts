import { JenisSuratConfig, KategoriSuratId, ProfilDesa } from '../types/surat';

export const KATEGORI_LIST: {
  id: KategoriSuratId;
  nama: string;
  deskripsi: string;
}[] = [
  {
    id: 'kependudukan',
    nama: 'Kependudukan & Catatan Sipil',
    deskripsi: 'Domisili, kelahiran, kematian, pindah, KTP-el, KK, KIA, IKD, akta, dan beda identitas.',
  },
  {
    id: 'pernikahan',
    nama: 'Status Pernikahan & Keluarga',
    deskripsi: 'Pengantar nikah (NTCR), dispensasi, duplikat, belum menikah, cerai, janda/duda, ahli waris.',
  },
  {
    id: 'ekonomi',
    nama: 'Ekonomi, Sosial & Pendidikan',
    deskripsi: 'SKTM, Surat Keterangan Usaha (SKU), penghasilan orang tua, rekomendasi kerja.',
  },
  {
    id: 'keamanan_pertanahan',
    nama: 'Keamanan, Pertanahan & Lainnya',
    deskripsi: 'Pengantar SKCK, izin keramaian, riwayat/jual-beli/hibah tanah, surat kuasa & umum.',
  },
];

export const KATEGORI_THEME: Record<
  KategoriSuratId,
  {
    tileBg: string;
    tileText: string;
    hoverBorder: string;
    activeBtn: string;
    labelText: string;
  }
> = {
  kependudukan: {
    tileBg: 'bg-[#E9F4F6]',
    tileText: 'text-[#0F5C6E]',
    hoverBorder: 'hover:border-[#0F5C6E]',
    activeBtn: 'bg-[#0F5C6E] border-[#0F5C6E] text-white',
    labelText: 'text-[#0F5C6E]',
  },
  pernikahan: {
    tileBg: 'bg-[#FCEEEF]',
    tileText: 'text-[#9F2B3B]',
    hoverBorder: 'hover:border-[#9F2B3B]',
    activeBtn: 'bg-[#9F2B3B] border-[#9F2B3B] text-white',
    labelText: 'text-[#9F2B3B]',
  },
  ekonomi: {
    tileBg: 'bg-[#FEF6E2]',
    tileText: 'text-[#9A5B13]',
    hoverBorder: 'hover:border-[#C27803]',
    activeBtn: 'bg-[#A16207] border-[#A16207] text-white',
    labelText: 'text-[#9A5B13]',
  },
  keamanan_pertanahan: {
    tileBg: 'bg-[#EBF6F1]',
    tileText: 'text-[#0E6044]',
    hoverBorder: 'hover:border-[#0E6044]',
    activeBtn: 'bg-[#0E6044] border-[#0E6044] text-white',
    labelText: 'text-[#0E6044]',
  },
};

export const PERSYARATAN_UMUM = [
  'Fotokopi KTP dan Kartu Keluarga (KK) yang masih berlaku.',
  'Surat pengantar dari RT/RW setempat (untuk beberapa layanan administrasi kependudukan di daerah tertentu, pengantar RT/RW/desa/kelurahan tidak lagi diwajibkan sesuai Perpres No. 96 Tahun 2019).',
  'Dokumen pendukung sesuai jenis surat (seperti surat pernyataan bermeterai, bukti lunas PBB, atau foto usaha).',
];

export const DEFAULT_LOGO_MALAKA_PATH =
  '/assets/aistudio/Lambang_Kabupaten_Malaka_836844c6.png';

export const DEFAULT_PROFIL_DESA: ProfilDesa = {
  kabupaten: 'KABUPATEN MALAKA',
  kecamatan: 'KECAMATAN MALAKA BARAT',
  namaDesa: 'DESA LOOFOUN',
  alamatKantor: 'Desa Loofoun, Kec. Malaka Barat, Kab. Malaka, NTT',
  kodePos: '85763',
  telepon: '-',
  email: 'pemdes.loofoun@malakakab.go.id',
  namaKepalaDesa: '.................................',
  jabatanKepalaDesa: 'Kepala Desa Loofoun',
  nipKepalaDesa: '',
  kodeDesaSingkat: 'DS-LF',
};

export const JENIS_SURAT_CATALOG: JenisSuratConfig[] = [
  // 1. KEPENDUDUKAN & CATATAN SIPIL
  {
    id: 'domisili',
    kodeKlasifikasi: '470',
    kategori: 'kependudukan',
    nama: 'Surat Keterangan Domisili',
    namaJudulDokumen: 'SURAT KETERANGAN DOMISILI',
    ringkasan: 'Keterangan tempat tinggal tetap atau domisili sementara warga di wilayah desa.',
    perpres96BebasRtRw: false,
    persyaratanKhusus: [
      'Fotokopi KTP dan Kartu Keluarga (KK)',
      'Surat pengantar RT/RW setempat',
      'Surat keterangan kontrak/kos (jika domisili sementara)',
    ],
    fieldTambahan: [
      {
        key: 'jenisDomisili',
        label: 'Jenis Domisili',
        placeholder: 'Pilih jenis domisili',
        type: 'select',
        options: ['Tempat Tinggal Tetap', 'Domisili Sementara / Pendatang'],
        required: true,
      },
      {
        key: 'alamatDomisili',
        label: 'Alamat Domisili Saat Ini',
        placeholder: 'Contoh: Dusun Krajan RT 002 / RW 001',
        type: 'textarea',
        required: true,
      },
      {
        key: 'lamaTinggal',
        label: 'Lama Tinggal / Sejak Tahun',
        placeholder: 'Contoh: Sejak tahun 2021 / 3 tahun',
        type: 'text',
        required: true,
      },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, menerangkan dengan sebenarnya bahwa:',
    paragrafIsiTemplate:
      'Berdasarkan data kependudukan dan pengamatan di lapangan, nama tersebut di atas benar berstatus {jenisDomisili} dan bertempat tinggal di {alamatDomisili} ({lamaTinggal}). Surat keterangan ini diberikan untuk keperluan: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Keterangan Domisili ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.',
  },
  {
    id: 'kelahiran',
    kodeKlasifikasi: '472.11',
    kategori: 'kependudukan',
    nama: 'Surat Keterangan Kelahiran',
    namaJudulDokumen: 'SURAT KETERANGAN KELAHIRAN',
    ringkasan: 'Keterangan kelahiran bayi untuk pengurusan akta kelahiran dan penambahan anggota KK.',
    perpres96BebasRtRw: true,
    persyaratanKhusus: [
      'Fotokopi KTP Orang Tua (Ayah & Ibu) serta Kartu Keluarga (KK)',
      'Surat keterangan lahir dari Bidan / Puskesmas / Rumah Sakit',
      'Fotokopi Buku Nikah / Akta Perkawinan orang tua',
    ],
    fieldTambahan: [
      { key: 'namaBayi', label: 'Nama Lengkap Bayi/Anak', placeholder: 'Masukkan nama anak', type: 'text', required: true },
      {
        key: 'jenisKelaminBayi',
        label: 'Jenis Kelamin Bayi',
        placeholder: 'Pilih',
        type: 'select',
        options: ['Laki-laki', 'Perempuan'],
        required: true,
      },
      { key: 'tempatLahirBayi', label: 'Tempat Lahir Bayi', placeholder: 'Contoh: RSUD / Bidan Desa', type: 'text', required: true },
      { key: 'tanggalLahirBayi', label: 'Tanggal & Jam Lahir', placeholder: 'Contoh: 12 November 2026, Pukul 08.15 WIB', type: 'text', required: true },
      { key: 'anakKe', label: 'Anak Ke-', placeholder: 'Contoh: 2 (Kedua)', type: 'text', required: true },
      { key: 'namaAyah', label: 'Nama Lengkap Ayah', placeholder: 'Nama ayah kandung', type: 'text', required: true },
      { key: 'namaIbu', label: 'Nama Lengkap Ibu', placeholder: 'Nama ibu kandung', type: 'text', required: true },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, berdasarkan keterangan pemohon dan bukti kelahiran menerangkan bahwa:',
    paragrafIsiTemplate:
      'Telah lahir seorang anak bernama {namaBayi} ({jenisKelaminBayi}), anak ke-{anakKe}, bertempat di {tempatLahirBayi} pada {tanggalLahirBayi}. Anak tersebut merupakan buah hati dari pasangan Bapak {namaAyah} dan Ibu {namaIbu}. Surat ini diterbitkan untuk keperluan: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Keterangan Kelahiran ini dibuat dengan sebenarnya agar dapat digunakan untuk pengurusan Akta Kelahiran di Dinas Kependudukan dan Pencatatan Sipil.',
  },
  {
    id: 'kematian',
    kodeKlasifikasi: '472.12',
    kategori: 'kependudukan',
    nama: 'Surat Keterangan Kematian',
    namaJudulDokumen: 'SURAT KETERANGAN KEMATIAN',
    ringkasan: 'Keterangan meninggal dunia untuk pengurusan akta kematian, asuransi, atau waris.',
    perpres96BebasRtRw: true,
    persyaratanKhusus: [
      'Fotokopi KTP dan KK Almarhum/Almarhumah',
      'Fotokopi KTP Pelapor / Keluarga',
      'Surat keterangan kematian dari Dokter/RS/Bidan (jika meninggal di fasilitas kesehatan)',
    ],
    fieldTambahan: [
      { key: 'namaAlmarhum', label: 'Nama Almarhum / Almarhumah', placeholder: 'Nama lengkap yang meninggal', type: 'text', required: true },
      { key: 'nikAlmarhum', label: 'NIK Almarhum / Almarhumah', placeholder: '16 digit NIK', type: 'text', required: true },
      { key: 'umurAlmarhum', label: 'Usia Saat Meninggal', placeholder: 'Contoh: 68 Tahun', type: 'text', required: true },
      { key: 'tanggalMeninggal', label: 'Hari & Tanggal Meninggal', placeholder: 'Contoh: Senin, 10 November 2026', type: 'text', required: true },
      { key: 'tempatMeninggal', label: 'Tempat Meninggal', placeholder: 'Contoh: Rumah Tinggal / RSUD', type: 'text', required: true },
      { key: 'sebabMeninggal', label: 'Sebab Kematian', placeholder: 'Contoh: Sakit tua / Sakit', type: 'text', required: true },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, menerangkan dengan sebenarnya bahwa warga kami tersebut di bawah ini:',
    paragrafIsiTemplate:
      'Almarhum/Almarhumah {namaAlmarhum} (NIK: {nikAlmarhum}, usia {umurAlmarhum}) telah meninggal dunia pada {tanggalMeninggal} di {tempatMeninggal} dikarenakan {sebabMeninggal}. Surat ini dimohonkan oleh pelapor untuk keperluan: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Keterangan Kematian ini dibuat dengan sebenarnya untuk dipergunakan dalam pengurusan Akta Kematian dan keperluan administrasi lainnya.',
  },
  {
    id: 'pengantar_akta',
    kodeKlasifikasi: '472.1',
    kategori: 'kependudukan',
    nama: 'Surat Pengantar Pembuatan Akta',
    namaJudulDokumen: 'SURAT PENGANTAR PEMBUATAN AKTA',
    ringkasan: 'Pengantar resmi desa untuk pembuatan Akta Kelahiran, Akta Kematian, atau Akta Catatan Sipil.',
    perpres96BebasRtRw: true,
    persyaratanKhusus: [
      'Fotokopi KTP dan KK pemohon',
      'Dokumen dasar peristiwa (surat lahir bidan/RS, buku nikah, atau surat kematian)',
      'Dua orang saksi beserta fotokopi KTP saksi',
    ],
    fieldTambahan: [
      {
        key: 'jenisAkta',
        label: 'Jenis Akta yang Diajukan',
        placeholder: 'Pilih jenis akta',
        type: 'select',
        options: ['Akta Kelahiran', 'Akta Kematian', 'Akta Perkawinan', 'Akta Perceraian', 'Perubahan / Kutipan II Akta'],
        required: true,
      },
      { key: 'namaSubjekAkta', label: 'Nama Pemilik Akta', placeholder: 'Nama orang yang dicatatkan dalam akta', type: 'text', required: true },
      { key: 'keteranganTambahan', label: 'Keterangan Pendukung', placeholder: 'Contoh: Keterlambatan pencatatan / data dasar sesuai KK', type: 'textarea', required: false },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, memberikan pengantar kepada warga:',
    paragrafIsiTemplate:
      'Untuk mengajukan permohonan pembuatan {jenisAkta} atas nama {namaSubjekAkta} di Dinas Kependudukan dan Pencatatan Sipil. Catatan: {keteranganTambahan}. Keperluan: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Pengantar Pembuatan Akta ini dibuat agar dapat diproses sesuai ketentuan peraturan perundang-undangan yang berlaku.',
  },
  {
    id: 'pindah_datang',
    kodeKlasifikasi: '471.21',
    kategori: 'kependudukan',
    nama: 'Surat Pengantar Pindah Datang Penduduk',
    namaJudulDokumen: 'SURAT PENGANTAR PINDAH DATANG PENDUDUK',
    ringkasan: 'Pengantar pendaftaran penduduk yang baru pindah masuk ke wilayah desa.',
    perpres96BebasRtRw: true,
    persyaratanKhusus: [
      'Surat Keterangan Pindah WNI (SKPWNI) dari daerah asal',
      'Fotokopi KTP dan KK asli/terakhir',
      'Bukti tempat tinggal baru atau surat izin menumpang KK jika bergabung ke KK lain',
    ],
    fieldTambahan: [
      { key: 'alamatAsal', label: 'Alamat Daerah Asal', placeholder: 'Desa/Kelurahan, Kecamatan, Kab/Kota asal', type: 'textarea', required: true },
      { key: 'nomorSkpwni', label: 'Nomor SKPWNI (Jika Ada)', placeholder: 'Contoh: SKPWNI/3201/2026/...', type: 'text', required: false },
      { key: 'alamatTujuanDesa', label: 'Alamat Tujuan di Desa Ini', placeholder: 'Dusun, RT/RW tujuan', type: 'text', required: true },
      { key: 'jumlahPengikut', label: 'Jumlah Anggota Keluarga Ikut Pindah', placeholder: 'Contoh: 3 Orang (Suami, Istri, 1 Anak)', type: 'text', required: true },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, menerangkan bahwa penduduk tersebut di bawah ini:',
    paragrafIsiTemplate:
      'Adalah benar penduduk pindah datang dari {alamatAsal} (Nomor SKPWNI: {nomorSkpwni}) menuju alamat baru di {alamatTujuanDesa} dengan jumlah pengikut {jumlahPengikut}. Surat pengantar ini diterbitkan untuk keperluan: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Pengantar Pindah Datang Penduduk ini dibuat untuk diteruskan ke instansi Dukcapil guna penerbitan KK dan KTP-el alamat baru.',
  },
  {
    id: 'pindah_keluar',
    kodeKlasifikasi: '471.22',
    kategori: 'kependudukan',
    nama: 'Surat Pindah Keluar Penduduk',
    namaJudulDokumen: 'SURAT KETERANGAN PINDAH KELUAR PENDUDUK',
    ringkasan: 'Pengantar bagi warga desa yang akan berpindah domisili ke luar desa/kecamatan/kabupaten.',
    perpres96BebasRtRw: true,
    persyaratanKhusus: [
      'Kartu Keluarga (KK) Asli dan KTP-el pemohon',
      'Alamat lengkap tujuan pindah (Desa/Kelurahan, Kecamatan, Kab/Kota, Provinsi)',
      'Data anggota keluarga yang ikut pindah',
    ],
    fieldTambahan: [
      { key: 'alamatTujuan', label: 'Alamat Lengkap Tujuan Pindah', placeholder: 'Jalan/Dusun, RT/RW, Desa/Kel, Kec, Kab/Kota, Provinsi', type: 'textarea', required: true },
      { key: 'alasanPindah', label: 'Alasan Pindah', placeholder: 'Contoh: Pekerjaan / Mengikuti Suami/Istri / Pendidikan', type: 'text', required: true },
      { key: 'anggotaIkut', label: 'Jumlah / Nama Pengikut Pindah', placeholder: 'Contoh: 1 Orang (Kepala Keluarga saja) atau sebutkan nama', type: 'text', required: true },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, menerangkan bahwa:',
    paragrafIsiTemplate:
      'Bermaksud mengajukan pindah keluar penduduk menuju alamat {alamatTujuan} dengan alasan {alasanPindah}. Anggota keluarga yang ikut pindah: {anggotaIkut}. Surat ini dibuat untuk keperluan: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Pindah Keluar Penduduk ini dibuat agar dapat digunakan sebagai pengantar penerbitan SKPWNI di Kecamatan/Dinas Dukcapil.',
  },
  {
    id: 'pengantar_ktp',
    kodeKlasifikasi: '471.13',
    kategori: 'kependudukan',
    nama: 'Surat Pengantar Pembuatan/Perubahan Data KTP-el',
    namaJudulDokumen: 'SURAT PENGANTAR PEMBUATAN / PERUBAHAN KTP-EL',
    ringkasan: 'Pengantar perekaman KTP-el baru (usia 17 tahun), rusak, hilang, atau pembaruan elemen data.',
    perpres96BebasRtRw: true,
    persyaratanKhusus: [
      'Fotokopi Kartu Keluarga (KK) terbaru',
      'Surat Keterangan Kehilangan dari Kepolisian (jika KTP hilang)',
      'Dokumen bukti perubahan data (ijazah/buku nikah/akta) jika ada perubahan data',
    ],
    fieldTambahan: [
      {
        key: 'jenisPermohonanKtp',
        label: 'Jenis Permohonan KTP-el',
        placeholder: 'Pilih jenis permohonan',
        type: 'select',
        options: ['Perekaman Baru (Pemula 17 Tahun)', 'Perubahan Elemen Data', 'KTP Rusak / Cacat', 'Penggantian KTP Hilang'],
        required: true,
      },
      { key: 'alasanDetail', label: 'Rincian Perubahan / Keterangan', placeholder: 'Contoh: Perubahan status kawin / alamat / perekaman baru', type: 'textarea', required: false },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, memberikan pengantar kepada penduduk kami:',
    paragrafIsiTemplate:
      'Untuk mengurus {jenisPermohonanKtp} pada instansi pelayanan administrasi kependudukan. Keterangan tambahan: {alasanDetail}. Keperluan: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Pengantar ini dibuat dengan sebenarnya untuk mendapatkan pelayanan perekaman atau pencetakan KTP-el sebagaimana mestinya.',
  },
  {
    id: 'pengantar_kk',
    kodeKlasifikasi: '471.11',
    kategori: 'kependudukan',
    nama: 'Surat Pengantar Pembuatan/Perubahan Kartu Keluarga (KK)',
    namaJudulDokumen: 'SURAT PENGANTAR PEMBUATAN / PERUBAHAN KK',
    ringkasan: 'Pengantar pembuatan KK baru, pisah KK, penambahan anggota, atau pembaruan data KK.',
    perpres96BebasRtRw: true,
    persyaratanKhusus: [
      'Kartu Keluarga (KK) Asli sebelumnya (jika perubahan/pisah KK)',
      'Fotokopi Buku Nikah / Akta Kelahiran / Surat Keterangan Lahir / Ijazah sesuai perubahan',
      'Formulir F-1.01 / F-1.02 (diisi di kantor desa/Dukcapil)',
    ],
    fieldTambahan: [
      {
        key: 'jenisPermohonanKk',
        label: 'Jenis Permohonan KK',
        placeholder: 'Pilih jenis permohonan',
        type: 'select',
        options: ['Pembuatan KK Baru / Keluarga Baru', 'Penambahan Anggota Keluarga (Kelahiran/Pindah)', 'Pengurangan Anggota Keluarga', 'Perubahan Data Elemen KK', 'KK Hilang / Rusak'],
        required: true,
      },
      { key: 'rincianPerubahanKk', label: 'Rincian Perubahan Data', placeholder: 'Jelaskan data atau anggota keluarga yang diubah/ditambahkan', type: 'textarea', required: true },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, menerangkan bahwa warga kami:',
    paragrafIsiTemplate:
      'Mengajukan permohonan {jenisPermohonanKk} dengan rincian: {rincianPerubahanKk}. Surat pengantar ini diterbitkan untuk keperluan: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Pengantar Pembuatan/Perubahan Kartu Keluarga ini dibuat untuk dapat diproses oleh Kecamatan dan Dinas Dukcapil.',
  },
  {
    id: 'pengantar_kia',
    kodeKlasifikasi: '471.14',
    kategori: 'kependudukan',
    nama: 'Surat Pengantar Pembuatan Kartu Identitas Anak (KIA)',
    namaJudulDokumen: 'SURAT PENGANTAR PEMBUATAN KARTU IDENTITAS ANAK (KIA)',
    ringkasan: 'Pengantar pembuatan KIA bagi anak usia 0–17 tahun kurang 1 hari.',
    perpres96BebasRtRw: true,
    persyaratanKhusus: [
      'Fotokopi Akta Kelahiran Anak',
      'Fotokopi Kartu Keluarga (KK) & KTP kedua orang tua',
      'Pas foto anak berwarna ukuran 2x3 sebanyak 2 lembar (untuk anak usia 5 tahun ke atas)',
    ],
    fieldTambahan: [
      { key: 'namaAnak', label: 'Nama Lengkap Anak', placeholder: 'Sesuai Akta Kelahiran', type: 'text', required: true },
      { key: 'nikAnak', label: 'NIK Anak', placeholder: '16 digit NIK anak di KK', type: 'text', required: true },
      { key: 'ttlAnak', label: 'Tempat, Tanggal Lahir Anak', placeholder: 'Contoh: Betun, 14 Mei 2019', type: 'text', required: true },
      { key: 'namaOrtu', label: 'Nama Orang Tua / Wali', placeholder: 'Nama ayah/ibu di KK', type: 'text', required: true },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, memberikan pengantar kepada:',
    paragrafIsiTemplate:
      'Selaku orang tua/wali dari anak bernama {namaAnak} (NIK: {nikAnak}, lahir di {ttlAnak}) guna mengajukan penerbitan Kartu Identitas Anak (KIA). Keperluan: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Pengantar Pembuatan KIA ini dibuat dengan sebenarnya agar dapat dilayani di Dinas Kependudukan dan Pencatatan Sipil.',
  },
  {
    id: 'aktivasi_ikd',
    kodeKlasifikasi: '471.15',
    kategori: 'kependudukan',
    nama: 'Surat Pengantar Aktivasi Identitas Kependudukan Digital (IKD)',
    namaJudulDokumen: 'SURAT PENGANTAR AKTIVASI IDENTITAS KEPENDUDUKAN DIGITAL (IKD)',
    ringkasan: 'Pengantar verifikasi dan aktivasi KTP Digital (IKD) di ponsel Android/iOS melalui petugas Dukcapil.',
    perpres96BebasRtRw: true,
    persyaratanKhusus: [
      'KTP-el asli atau NIK yang sudah terekam biometriknya',
      'Smartphone Android/iOS yang telah menginstal aplikasi Identitas Kependudukan Digital (IKD)',
      'Alamat email aktif dan nomor handphone pribadi yang aktif',
    ],
    fieldTambahan: [
      { key: 'emailAktif', label: 'Alamat Email Aktif untuk IKD', placeholder: 'contoh@gmail.com', type: 'text', required: true },
      { key: 'merkPerangkat', label: 'Jenis Ponsel (Android / iOS)', placeholder: 'Contoh: Android', type: 'text', required: false },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, memberikan pengantar aktivasi IKD kepada warga:',
    paragrafIsiTemplate:
      'Bahwa yang bersangkutan adalah benar penduduk desa kami yang bermaksud melakukan pendaftaran dan aktivasi Identitas Kependudukan Digital (IKD) menggunakan email aktif {emailAktif} (perangkat {merkPerangkat}). Keperluan: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Pengantar ini dibuat agar petugas operator Dukcapil dapat memfasilitasi pemindaian QR Code aktivasi IKD.',
  },
  {
    id: 'beda_nama',
    kodeKlasifikasi: '470.1',
    kategori: 'kependudukan',
    nama: 'Surat Keterangan Beda Nama / Identitas',
    namaJudulDokumen: 'SURAT KETERANGAN BEDA NAMA / IDENTITAS',
    ringkasan: 'Keterangan bahwa perbedaan penulisan nama/tanggal lahir di dua dokumen merujuk pada orang yang sama.',
    perpres96BebasRtRw: false,
    persyaratanKhusus: [
      'Fotokopi KTP dan KK',
      'Fotokopi kedua dokumen yang datanya berbeda (misal Ijazah, Buku Nikah, Sertifikat, atau Rekening Bank)',
      'Surat pernyataan bermeterai bahwa kedua identitas tersebut adalah orang yang sama',
    ],
    fieldTambahan: [
      { key: 'dokumenSatu', label: 'Dokumen Pertama & Data Tertulis', placeholder: 'Contoh: KTP/KK tertulis "MUHAMMAD ALI" (Lahir 05-04-1990)', type: 'textarea', required: true },
      { key: 'dokumenDua', label: 'Dokumen Kedua & Data Tertulis', placeholder: 'Contoh: Ijazah SD tertulis "MOH. ALI" (Lahir 05-04-1991)', type: 'textarea', required: true },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, menerangkan dengan sebenarnya bahwa:',
    paragrafIsiTemplate:
      'Terdapat perbedaan penulisan identitas antara {dokumenSatu} dengan {dokumenDua}. Berdasarkan pemeriksaan berkas dan keterangan saksi, kedua data tersebut merujuk pada satu orang yang sama, yakni pemohon di atas. Keperluan: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Keterangan Beda Identitas ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.',
  },

  // 2. STATUS PERNIKAHAN & KELUARGA
  {
    id: 'pengantar_nikah',
    kodeKlasifikasi: '474.2',
    kategori: 'pernikahan',
    nama: 'Surat Pengantar Nikah (NTCR / N1-N4)',
    namaJudulDokumen: 'SURAT PENGANTAR NIKAH (NTCR)',
    ringkasan: 'Pengantar resmi ke KUA / Catatan Sipil (model N1–N4) untuk melangsungkan pernikahan.',
    perpres96BebasRtRw: false,
    persyaratanKhusus: [
      'Fotokopi KTP dan KK kedua calon mempelai',
      'Fotokopi Akta Kelahiran dan Ijazah terakhir',
      'Surat Pengantar RT/RW serta Pas Foto latar biru 2x3 & 4x6',
      'Akta Cerai asli (jika berstatus Cerai Hidup) atau Akta Kematian pasangan (jika Cerai Mati)',
    ],
    fieldTambahan: [
      { key: 'namaCalonPasangan', label: 'Nama Lengkap Calon Pasangan', placeholder: 'Nama calon suami/istri', type: 'text', required: true },
      { key: 'nikCalonPasangan', label: 'NIK Calon Pasangan', placeholder: '16 digit NIK calon pasangan', type: 'text', required: true },
      { key: 'alamatCalonPasangan', label: 'Alamat Calon Pasangan', placeholder: 'Alamat lengkap sesuai KTP', type: 'textarea', required: true },
      { key: 'namaOrangTua', label: 'Nama Ayah & Ibu Kandung Pemohon', placeholder: 'Contoh: Bapak Sutrisno & Ibu Siti Aminah', type: 'text', required: true },
      { key: 'rencanaTanggalNikah', label: 'Rencana Tanggal & Lokasi Nikah', placeholder: 'Contoh: 20 Desember 2026 di KUA Kecamatan', type: 'text', required: true },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, menerangkan dengan sebenarnya bahwa:',
    paragrafIsiTemplate:
      'Putra/Putri dari {namaOrangTua} tersebut di atas bermaksud melangsungkan pernikahan dengan {namaCalonPasangan} (NIK: {nikCalonPasangan}, alamat: {alamatCalonPasangan}) yang direncanakan pada {rencanaTanggalNikah}. Keperluan: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Pengantar Nikah ini dibuat untuk dipergunakan sebagai kelengkapan administrasi pendaftaran pernikahan di KUA / Kantor Catatan Sipil.',
  },
  {
    id: 'dispensasi_nikah',
    kodeKlasifikasi: '474.21',
    kategori: 'pernikahan',
    nama: 'Surat Pengantar Dispensasi Nikah',
    namaJudulDokumen: 'SURAT PENGANTAR DISPENSASI NIKAH',
    ringkasan: 'Pengantar ke KUA/Kecamatan/Pengadilan Agama untuk permohonan dispensasi usia atau waktu nikah.',
    perpres96BebasRtRw: false,
    persyaratanKhusus: [
      'Fotokopi KTP & KK pemohon serta orang tua/wali',
      'Surat penolakan/pemberitahuan kekurangan syarat dari KUA (jika ada)',
      'Fotokopi Akta Kelahiran calon mempelai',
    ],
    fieldTambahan: [
      { key: 'namaCalonPasangan', label: 'Nama Calon Pasangan', placeholder: 'Nama lengkap calon pasangan', type: 'text', required: true },
      { key: 'alasanDispensasi', label: 'Alasan Pengajuan Dispensasi', placeholder: 'Contoh: Jadwal akad mendesak < 10 hari kerja / usia di bawah batas UU', type: 'textarea', required: true },
      { key: 'tujuanInstansi', label: 'Ditujukan Kepada Instansi', placeholder: 'Contoh: Camat / KUA / Pengadilan Agama', type: 'text', required: true },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, memberikan pengantar dispensasi nikah kepada:',
    paragrafIsiTemplate:
      'Yang akan melangsungkan pernikahan dengan {namaCalonPasangan}, mengajukan permohonan dispensasi nikah kepada {tujuanInstansi} dikarenakan {alasanDispensasi}. Keperluan: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Pengantar Dispensasi Nikah ini dibuat agar menjadi bahan pertimbangan dan diproses sebagaimana mestinya.',
  },
  {
    id: 'duplikat_nikah',
    kodeKlasifikasi: '474.22',
    kategori: 'pernikahan',
    nama: 'Surat Pengantar Duplikat Surat Nikah',
    namaJudulDokumen: 'SURAT PENGANTAR DUPLIKAT BUKU / SURAT NIKAH',
    ringkasan: 'Pengantar ke KUA untuk penerbitan duplikat buku nikah yang hilang atau rusak.',
    perpres96BebasRtRw: false,
    persyaratanKhusus: [
      'Fotokopi KTP dan Kartu Keluarga (KK)',
      'Surat Keterangan Kehilangan dari Kepolisian (jika buku nikah hilang)',
      'Buku nikah asli yang rusak (jika rusak) dan pas foto suami-istri',
    ],
    fieldTambahan: [
      { key: 'namaPasangan', label: 'Nama Suami / Istri', placeholder: 'Nama pasangan dalam buku nikah', type: 'text', required: true },
      { key: 'tanggalMenikah', label: 'Tanggal & Tahun Pernikahan', placeholder: 'Contoh: 17 Agustus 2015', type: 'text', required: true },
      { key: 'kuaPencatat', label: 'KUA / Catatan Sipil Tempat Menikah Dahulu', placeholder: 'Contoh: KUA / Dukcapil Kab. Malaka', type: 'text', required: true },
      {
        key: 'alasanDuplikat',
        label: 'Alasan Penerbitan Duplikat',
        placeholder: 'Pilih alasan',
        type: 'select',
        options: ['Buku Nikah Hilang', 'Buku Nikah Rusak / Terbakar / Kebanjiran'],
        required: true,
      },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, menerangkan bahwa warga tersebut:',
    paragrafIsiTemplate:
      'Adalah benar pasangan suami-istri dari {namaPasangan} yang telah melangsungkan pernikahan pada {tanggalMenikah} dan tercatat di {kuaPencatat}. Saat ini mengajukan penerbitan duplikat buku nikah dikarenakan {alasanDuplikat}. Keperluan: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Pengantar Duplikat Surat Nikah ini dibuat untuk dipergunakan dalam pengurusan duplikat di KUA setempat.',
  },
  {
    id: 'belum_menikah',
    kodeKlasifikasi: '474.23',
    kategori: 'pernikahan',
    nama: 'Surat Keterangan Belum Menikah',
    namaJudulDokumen: 'SURAT KETERANGAN BELUM MENIKAH',
    ringkasan: 'Keterangan status lajang/belum pernah menikah untuk syarat kerja, CPNS/TNI/Polri, atau KPR.',
    perpres96BebasRtRw: false,
    persyaratanKhusus: [
      'Fotokopi KTP dan Kartu Keluarga (KK)',
      'Surat pengantar dari RT/RW setempat',
      'Surat pernyataan belum pernah menikah bermeterai (bila diminta instansi tujuan)',
    ],
    fieldTambahan: [
      { key: 'instansiTujuan', label: 'Ditujukan Untuk Keperluan / Instansi', placeholder: 'Contoh: Persyaratan Melamar Pekerjaan / Pendaftaran KPR', type: 'text', required: true },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, menerangkan dengan sebenarnya bahwa:',
    paragrafIsiTemplate:
      'Berdasarkan catatan administrasi kependudukan desa dan keterangan ketua RT/RW setempat, nama tersebut di atas sampai saat dikeluarkannya surat ini berstatus BELUM PERNAH MENIKAH (Lajang). Surat ini digunakan untuk: {instansiTujuan} ({KEPERLUAN}).',
    paragrafPenutup:
      'Demikian Surat Keterangan Belum Menikah ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.',
  },
  {
    id: 'keterangan_menikah',
    kodeKlasifikasi: '474.24',
    kategori: 'pernikahan',
    nama: 'Surat Keterangan Menikah',
    namaJudulDokumen: 'SURAT KETERANGAN MENIKAH',
    ringkasan: 'Keterangan bahwa kedua pihak benar pasangan suami-istri yang berdomisili di desa.',
    perpres96BebasRtRw: false,
    persyaratanKhusus: [
      'Fotokopi KTP Suami dan Istri serta Kartu Keluarga (KK)',
      'Fotokopi Buku Nikah / Akta Perkawinan (jika ada)',
      'Surat pengantar RT/RW setempat',
    ],
    fieldTambahan: [
      { key: 'namaPasangan', label: 'Nama Lengkap Pasangan (Suami/Istri)', placeholder: 'Nama pasangan sah', type: 'text', required: true },
      { key: 'nikPasangan', label: 'NIK Pasangan', placeholder: '16 digit NIK pasangan', type: 'text', required: true },
      { key: 'tahunMenikah', label: 'Tanggal / Tahun Menikah', placeholder: 'Contoh: 10 Mei 2018', type: 'text', required: true },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, menerangkan dengan sebenarnya bahwa:',
    paragrafIsiTemplate:
      'Adalah benar berstatus KAWIN / MENIKAH secara sah dengan {namaPasangan} (NIK: {nikPasangan}) sejak {tahunMenikah} dan hingga kini masih terikat dalam ikatan perkawinan yang sah. Surat ini dipergunakan untuk: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Keterangan Menikah ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.',
  },
  {
    id: 'keterangan_cerai',
    kodeKlasifikasi: '474.25',
    kategori: 'pernikahan',
    nama: 'Surat Keterangan Cerai',
    namaJudulDokumen: 'SURAT KETERANGAN CERAI',
    ringkasan: 'Keterangan status cerai hidup warga berdasarkan dokumen perceraian atau catatan kependudukan.',
    perpres96BebasRtRw: false,
    persyaratanKhusus: [
      'Fotokopi KTP dan Kartu Keluarga (KK)',
      'Fotokopi Akta Cerai / Putusan Pengadilan Agama atau Pengadilan Negeri',
      'Surat pengantar RT/RW setempat',
    ],
    fieldTambahan: [
      { key: 'namaMantanPasangan', label: 'Nama Mantan Pasangan', placeholder: 'Nama mantan suami/istri', type: 'text', required: true },
      { key: 'nomorAktaCerai', label: 'Nomor Akta Cerai / Putusan', placeholder: 'Contoh: 0123/AC/2024/PA...', type: 'text', required: false },
      { key: 'tanggalCerai', label: 'Tanggal Bercerai', placeholder: 'Contoh: 14 Juni 2024', type: 'text', required: true },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, menerangkan dengan sebenarnya bahwa:',
    paragrafIsiTemplate:
      'Adalah benar warga desa kami yang berstatus CERAI HIDUP dari mantan pasangan {namaMantanPasangan} terhitung sejak {tanggalCerai} (Akta/Putusan: {nomorAktaCerai}). Surat ini diterbitkan untuk keperluan: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Keterangan Cerai ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.',
  },
  {
    id: 'janda_duda',
    kodeKlasifikasi: '474.26',
    kategori: 'pernikahan',
    nama: 'Surat Keterangan Janda / Duda',
    namaJudulDokumen: 'SURAT KETERANGAN JANDA / DUDA',
    ringkasan: 'Keterangan status janda atau duda (cerai mati/cerai hidup) untuk pensiun, bantuan sosial, atau nikah lagi.',
    perpres96BebasRtRw: false,
    persyaratanKhusus: [
      'Fotokopi KTP dan Kartu Keluarga (KK)',
      'Fotokopi Akta Kematian pasangan (jika cerai mati) atau Akta Cerai (jika cerai hidup)',
      'Surat pengantar RT/RW setempat',
    ],
    fieldTambahan: [
      {
        key: 'statusJandaDuda',
        label: 'Status yang Diterangkan',
        placeholder: 'Pilih status',
        type: 'select',
        options: ['Janda (Cerai Mati)', 'Janda (Cerai Hidup)', 'Duda (Cerai Mati)', 'Duda (Cerai Hidup)'],
        required: true,
      },
      { key: 'namaPasanganTerdahulu', label: 'Nama Pasangan Terdahulu / Almarhum', placeholder: 'Nama suami/istri terdahulu', type: 'text', required: true },
      { key: 'sejakTanggal', label: 'Terhitung Sejak Tanggal', placeholder: 'Contoh: 02 Maret 2023', type: 'text', required: true },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, menerangkan dengan sebenarnya bahwa:',
    paragrafIsiTemplate:
      'Adalah benar penduduk desa kami yang hingga saat ini berstatus sebagai {statusJandaDuda} dari {namaPasanganTerdahulu} sejak {sejakTanggal} dan belum menikah lagi. Surat ini dibuat untuk keperluan: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Keterangan Janda/Duda ini dibuat dengan sebenarnya agar dapat dipergunakan sebagaimana mestinya.',
  },
  {
    id: 'ahli_waris',
    kodeKlasifikasi: '474.3',
    kategori: 'pernikahan',
    nama: 'Surat Keterangan Ahli Waris',
    namaJudulDokumen: 'SURAT KETERANGAN AHLI WARIS',
    ringkasan: 'Penetapan silsilah ahli waris yang sah dari almarhum untuk perbankan, pertanahan, atau asuransi.',
    perpres96BebasRtRw: false,
    persyaratanKhusus: [
      'Fotokopi Akta Kematian / Surat Keterangan Kematian Pewaris',
      'Fotokopi KTP dan KK seluruh ahli waris yang masih hidup',
      'Fotokopi Buku Nikah pewaris dan Akta Kelahiran para ahli waris',
      'Surat Pernyataan Ahli Waris bermeterai yang ditandatangani para ahli waris dan 2 saksi',
    ],
    fieldTambahan: [
      { key: 'namaPewaris', label: 'Nama Pewaris (Almarhum/Almarhumah)', placeholder: 'Nama lengkap pewaris', type: 'text', required: true },
      { key: 'tanggalWafatPewaris', label: 'Tanggal Meninggal Pewaris', placeholder: 'Contoh: 08 Januari 2025', type: 'text', required: true },
      { key: 'daftarAhliWaris', label: 'Daftar Nama & Hubungan Ahli Waris', placeholder: 'Contoh: 1. Siti (Istri), 2. Budi (Anak Kandung), 3. Ani (Anak Kandung)', type: 'textarea', required: true },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, berdasarkan pernyataan para ahli waris dan saksi menerangkan bahwa:',
    paragrafIsiTemplate:
      'Almarhum/Almarhumah {namaPewaris} yang telah meninggal dunia pada {tanggalWafatPewaris} meninggalkan ahli waris yang sah yaitu: {daftarAhliWaris}. Surat keterangan ini diajukan oleh pemohon di atas untuk keperluan: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Keterangan Ahli Waris ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.',
  },

  // 3. EKONOMI, SOSIAL & PENDIDIKAN
  {
    id: 'sktm',
    kodeKlasifikasi: '401',
    kategori: 'ekonomi',
    nama: 'Surat Keterangan Tidak Mampu (SKTM)',
    namaJudulDokumen: 'SURAT KETERANGAN TIDAK MAMPU (SKTM)',
    ringkasan: 'Untuk keringanan biaya sekolah/kuliah (KIP), layanan kesehatan RS/BPJS, atau bantuan sosial.',
    perpres96BebasRtRw: false,
    persyaratanKhusus: [
      'Fotokopi KTP dan Kartu Keluarga (KK)',
      'Surat pengantar dari RT/RW setempat',
      'Surat pernyataan tidak mampu atau bukti pendukung (kartu KIS/PKH/DTKS bila ada)',
    ],
    fieldTambahan: [
      {
        key: 'tujuanSktm',
        label: 'Peruntukan SKTM',
        placeholder: 'Pilih peruntukan',
        type: 'select',
        options: ['Beasiswa / Keringanan Biaya Sekolah & Kuliah', 'Layanan Kesehatan / Rumah Sakit / BPJS', 'Bantuan Hukum / Pengadilan', 'Program Bantuan Sosial Lainnya'],
        required: true,
      },
      { key: 'namaPenerimaManfaat', label: 'Nama Penerima Manfaat (Jika untuk Anak/Keluarga)', placeholder: 'Isi nama anak/pasien atau sama dengan pemohon', type: 'text', required: true },
      { key: 'penghasilanPerBulan', label: 'Perkiraan Penghasilan Keluarga / Bulan', placeholder: 'Contoh: Rp 950.000 / bulan', type: 'text', required: true },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, menerangkan dengan sebenarnya bahwa:',
    paragrafIsiTemplate:
      'Berdasarkan pendataan kondisi ekonomi masyarakat setempat, keluarga pemohon (untuk manfaat atas nama {namaPenerimaManfaat}) tergolong keluarga kurang mampu / berpenghasilan rendah ({penghasilanPerBulan}). Surat ini diterbitkan untuk keperluan {tujuanSktm}: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Keterangan Tidak Mampu (SKTM) ini dibuat dengan sebenarnya agar pihak yang berkepentingan dapat memberikan bantuan atau keringanan sebagaimana mestinya.',
  },
  {
    id: 'sku',
    kodeKlasifikasi: '503',
    kategori: 'ekonomi',
    nama: 'Surat Keterangan Usaha (SKU) & Domisili Usaha',
    namaJudulDokumen: 'SURAT KETERANGAN USAHA (SKU)',
    ringkasan: 'Legalitas keterangan usaha mikro/kecil/toko warga untuk pengajuan KUR bank, NIB, atau izin usaha.',
    perpres96BebasRtRw: false,
    persyaratanKhusus: [
      'Fotokopi KTP dan Kartu Keluarga (KK)',
      'Surat pengantar RT/RW setempat',
      'Foto tempat usaha atau produk usaha yang dijalankan',
    ],
    fieldTambahan: [
      { key: 'namaUsaha', label: 'Nama Usaha / Toko', placeholder: 'Contoh: Warung Sembako Berkah', type: 'text', required: true },
      { key: 'bidangUsaha', label: 'Jenis / Bidang Usaha', placeholder: 'Contoh: Perdagangan Sembako / Kuliner / Pertanian / Bengkel', type: 'text', required: true },
      { key: 'alamatUsaha', label: 'Alamat / Lokasi Usaha', placeholder: 'Alamat lengkap tempat usaha beroperasi', type: 'textarea', required: true },
      { key: 'lamaUsaha', label: 'Berdiri Sejak Tahun', placeholder: 'Contoh: Sejak Tahun 2020', type: 'text', required: true },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, menerangkan dengan sebenarnya bahwa:',
    paragrafIsiTemplate:
      'Benar memiliki dan menjalankan usaha bernama "{namaUsaha}" yang bergerak di bidang {bidangUsaha}, berlokasi/berdomisili usaha di {alamatUsaha}, dan telah beroperasi aktif {lamaUsaha}. Surat Keterangan Usaha ini diberikan untuk keperluan: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Keterangan Usaha / Domisili Usaha ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.',
  },
  {
    id: 'penghasilan',
    kodeKlasifikasi: '402',
    kategori: 'ekonomi',
    nama: 'Surat Keterangan Penghasilan / Penghasilan Orang Tua',
    namaJudulDokumen: 'SURAT KETERANGAN PENGHASILAN',
    ringkasan: 'Keterangan rata-rata penghasilan bulanan pekerja informal atau orang tua mahasiswa.',
    perpres96BebasRtRw: false,
    persyaratanKhusus: [
      'Fotokopi KTP dan Kartu Keluarga (KK)',
      'Surat pengantar RT/RW setempat',
      'Surat pernyataan rincian penghasilan bermeterai (untuk pekerja non-slip gaji)',
    ],
    fieldTambahan: [
      { key: 'namaAnakMahasiswa', label: 'Nama Anak / Siswa / Mahasiswa (Jika Untuk Orang Tua)', placeholder: 'Kosongkan atau isi "-" jika untuk diri sendiri', type: 'text', required: false },
      { key: 'sumberPenghasilan', label: 'Sumber Mata Pencaharian', placeholder: 'Contoh: Petani / Pedagang / Buruh Harian', type: 'text', required: true },
      { key: 'nominalPenghasilan', label: 'Rata-rata Penghasilan Per Bulan', placeholder: 'Contoh: Rp 2.500.000,- (Dua Juta Lima Ratus Ribu Rupiah)', type: 'text', required: true },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, menerangkan dengan sebenarnya bahwa:',
    paragrafIsiTemplate:
      'Bermata pencaharian sebagai {sumberPenghasilan} dengan rata-rata penghasilan bersih per bulan sebesar {nominalPenghasilan}. Surat ini digunakan untuk keperluan administrasi atas nama {namaAnakMahasiswa} dalam rangka: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Keterangan Penghasilan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.',
  },
  {
    id: 'lamaran_kerja',
    kodeKlasifikasi: '560',
    kategori: 'ekonomi',
    nama: 'Surat Rekomendasi Lamaran Kerja',
    namaJudulDokumen: 'SURAT REKOMENDASI LAMARAN KERJA',
    ringkasan: 'Rekomendasi kelakuan baik dan domisili dari desa untuk melamar pekerjaan di perusahaan/instansi.',
    perpres96BebasRtRw: false,
    persyaratanKhusus: [
      'Fotokopi KTP dan Kartu Keluarga (KK)',
      'Fotokopi Ijazah terakhir',
      'Surat pengantar RT/RW setempat',
    ],
    fieldTambahan: [
      { key: 'pendidikanTerakhir', label: 'Pendidikan Terakhir', placeholder: 'Contoh: SMK Teknik Otomotif / S1 Ekonomi', type: 'text', required: true },
      { key: 'perusahaanTujuan', label: 'Nama Perusahaan / Instansi Tujuan', placeholder: 'Contoh: PT Maju Karya Indonesia', type: 'text', required: true },
      { key: 'posisiDilamar', label: 'Posisi yang Dilamar', placeholder: 'Contoh: Staf Administrasi / Operator Produksi', type: 'text', required: true },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, memberikan rekomendasi kepada:',
    paragrafIsiTemplate:
      'Warga desa kami dengan pendidikan terakhir {pendidikanTerakhir}, dikenal berkelakuan baik di lingkungan masyarakat dan direkomendasikan untuk melamar pekerjaan pada posisi {posisiDilamar} di {perusahaanTujuan}. Keperluan: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Rekomendasi Lamaran Kerja ini dibuat dengan sebenarnya sebagai bahan pertimbangan pimpinan instansi/perusahaan terkait.',
  },

  // 4. KEAMANAN, PERTANAHAN & LAINNYA
  {
    id: 'pengantar_skck',
    kodeKlasifikasi: '331',
    kategori: 'keamanan_pertanahan',
    nama: 'Surat Pengantar SKCK',
    namaJudulDokumen: 'SURAT PENGANTAR PEMBUATAN SKCK',
    ringkasan: 'Pengantar ke Polsek/Polres untuk menerbitkan Surat Keterangan Catatan Kepolisian.',
    perpres96BebasRtRw: false,
    persyaratanKhusus: [
      'Fotokopi KTP, Kartu Keluarga (KK), dan Akta Kelahiran / Ijazah',
      'Surat pengantar dari RT/RW setempat',
      'Pas foto latar merah ukuran 4x6 (dibawa saat ke Polsek/Polres)',
    ],
    fieldTambahan: [
      { key: 'tujuanSkck', label: 'Tujuan Pembuatan SKCK', placeholder: 'Contoh: Melamar Pekerjaan / Pendaftaran PPPK / CPNS', type: 'text', required: true },
      { key: 'polsekTujuan', label: 'Kepolisian Tujuan (Polsek / Polres)', placeholder: 'Contoh: Polsek Malaka Barat / Polres Malaka', type: 'text', required: true },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, menerangkan bahwa:',
    paragrafIsiTemplate:
      'Sepanjang pengetahuan kami warga tersebut berkelakuan baik, tidak pernah tersangkut perkara tindak pidana/kriminal, dan tidak sedang dalam pencabutan hak hukum. Surat pengantar ini ditujukan kepada {polsekTujuan} untuk pembuatan SKCK guna keperluan: {tujuanSkck} ({KEPERLUAN}).',
    paragrafPenutup:
      'Demikian Surat Pengantar SKCK ini dibuat dengan sebenarnya agar dapat diproses sebagaimana mestinya.',
  },
  {
    id: 'izin_keramaian',
    kodeKlasifikasi: '300',
    kategori: 'keamanan_pertanahan',
    nama: 'Surat Pengantar Izin Keramaian',
    namaJudulDokumen: 'SURAT PENGANTAR IZIN KERAMAIAN',
    ringkasan: 'Pengantar izin penyelenggaraan hajatan, pentas seni, atau kegiatan masyarakat ke Polsek/Kecamatan.',
    perpres96BebasRtRw: false,
    persyaratanKhusus: [
      'Fotokopi KTP penanggung jawab acara dan KK',
      'Surat pengantar dari RT/RW setempat dan persetujuan tetangga sekitar',
      'Jadwal susunan acara / jenis hiburan',
    ],
    fieldTambahan: [
      { key: 'namaAcara', label: 'Nama / Jenis Kegiatan Keramaian', placeholder: 'Contoh: Resepsi Pernikahan & Hiburan Organ Tunggal / Turnamen Desa', type: 'text', required: true },
      { key: 'tanggalAcara', label: 'Hari, Tanggal & Jam Pelaksanaan', placeholder: 'Contoh: Minggu, 29 November 2026 (09.00 - 21.00 WIB)', type: 'text', required: true },
      { key: 'lokasiAcara', label: 'Lokasi Penyelenggaraan', placeholder: 'Alamat lengkap tempat acara', type: 'textarea', required: true },
      { key: 'perkiraanTamu', label: 'Perkiraan Jumlah Peserta/Tamu', placeholder: 'Contoh: ± 200 Orang', type: 'text', required: true },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, memberikan pengantar izin keramaian kepada penanggung jawab acara:',
    paragrafIsiTemplate:
      'Untuk menyelenggarakan kegiatan "{namaAcara}" pada {tanggalAcara} bertempat di {lokasiAcara} dengan perkiraan tamu/peserta sebanyak {perkiraanTamu}. Penyelenggara wajib menjaga ketertiban, keamanan, dan ketentraman lingkungan. Keperluan: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Pengantar Izin Keramaian ini dibuat untuk diteruskan kepada pihak Kepolisian Sektor (Polsek) setempat guna penerbitan izin resmi.',
  },
  {
    id: 'pertanahan',
    kodeKlasifikasi: '590',
    kategori: 'keamanan_pertanahan',
    nama: 'Surat Keterangan / Pernyataan Terkait Tanah',
    namaJudulDokumen: 'SURAT KETERANGAN PERTANAHAN DESA',
    ringkasan: 'Keterangan riwayat tanah, jual beli, hibah, atau pengukuran batas tanah sesuai kewenangan desa.',
    perpres96BebasRtRw: false,
    persyaratanKhusus: [
      'Fotokopi KTP dan KK pemilik / para pihak',
      'Bukti lunas PBB-P2 tahun terakhir & bukti alas hak (Letter C / Girik / SPPT)',
      'Surat pernyataan penguasaan fisik bidang tanah bermeterai & persetujuan saksi batas',
    ],
    fieldTambahan: [
      {
        key: 'jenisLayananTanah',
        label: 'Jenis Keterangan Tanah',
        placeholder: 'Pilih jenis',
        type: 'select',
        options: ['Riwayat Tanah', 'Keterangan Jual Beli Tanah', 'Keterangan Hibah Tanah', 'Berita Acara / Pengukuran Batas Tanah', 'Keterangan Tidak Sengketa'],
        required: true,
      },
      { key: 'lokasiTanah', label: 'Letak Bidang Tanah (Blok/Dusun)', placeholder: 'Contoh: Blok 04 Dusun Krajan RT 003/RW 002', type: 'text', required: true },
      { key: 'luasDanNop', label: 'Luas Tanah & Nomor SPPT PBB (NOP)', placeholder: 'Contoh: Luas ± 450 m², NOP 32.01.xxx.xxx', type: 'text', required: true },
      { key: 'batasTanah', label: 'Batas-batas Tanah (Utara, Timur, Selatan, Barat)', placeholder: 'Utara: Jalan Desa; Timur: Tanah Bpk Rudi; Selatan: Selokan; Barat: Tanah Ibu Sari', type: 'textarea', required: true },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, berdasarkan catatan buku administrasi pertanahan desa menerangkan bahwa:',
    paragrafIsiTemplate:
      'Mengajukan {jenisLayananTanah} atas sebidang tanah yang terletak di {lokasiTanah} dengan {luasDanNop}. Adapun batas-batas tanah tersebut adalah: {batasTanah}. Keterangan ini diterbitkan sesuai kewenangan pemerintah desa untuk keperluan: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian Surat Keterangan Pertanahan ini dibuat dengan sebenarnya berdasarkan data registrasi desa untuk dapat dipergunakan sebagaimana mestinya.',
  },
  {
    id: 'kuasa_umum',
    kodeKlasifikasi: '470.9',
    kategori: 'keamanan_pertanahan',
    nama: 'Surat Kuasa atau Surat Keterangan Umum / Serbaguna',
    namaJudulDokumen: 'SURAT KETERANGAN UMUM / KUASA WARGA',
    ringkasan: 'Surat kuasa bermeterai yang diketahui desa atau surat keterangan umum untuk berbagai keperluan.',
    perpres96BebasRtRw: false,
    persyaratanKhusus: [
      'Fotokopi KTP Pemberi dan Penerima Kuasa (jika berbentuk Surat Kuasa)',
      'Fotokopi Kartu Keluarga (KK)',
      'Dokumen pendukung sesuai keperluan dan meterai Rp 10.000 (untuk surat kuasa)',
    ],
    fieldTambahan: [
      {
        key: 'bentukSurat',
        label: 'Bentuk Dokumen',
        placeholder: 'Pilih bentuk surat',
        type: 'select',
        options: ['Surat Keterangan Umum / Serbaguna', 'Surat Kuasa Diketahui Kepala Desa'],
        required: true,
      },
      { key: 'pihakPenerimaKuasa', label: 'Nama & NIK Penerima Kuasa (Kosongkan "-" jika Surat Keterangan Umum)', placeholder: 'Contoh: Budi Santoso (NIK: 3201xxxxxxxxxxxx)', type: 'text', required: false },
      { key: 'uraianIsiSurat', label: 'Uraian Keterangan atau Tugas yang Dikuasakan', placeholder: 'Tuliskan rincian keterangan atau wewenang yang diberikan secara jelas', type: 'textarea', required: true },
    ],
    paragrafPembuka:
      'Yang bertanda tangan di bawah ini Kepala {NAMA_DESA}, Kecamatan {KECAMATAN}, {KABUPATEN}, menerangkan/mengetahui hal sebagai berikut:',
    paragrafIsiTemplate:
      'Sehubungan dengan permohonan {bentukSurat} dari warga tersebut di atas (pihak terkait/penerima kuasa: {pihakPenerimaKuasa}), dengan ini menerangkan bahwa: {uraianIsiSurat}. Surat ini dipergunakan untuk keperluan: {KEPERLUAN}.',
    paragrafPenutup:
      'Demikian surat ini dibuat dengan sebenarnya agar dapat dipergunakan oleh yang bersangkutan sebagaimana mestinya.',
  },
];
