import React, { useState } from 'react';
import { DEFAULT_LOGO_MALAKA_PATH } from '../data/jenisSurat';
import {
  buildSuratContent,
  formatTanggalIndonesia,
} from '../services/documentGenerator';
import {
  DataPemohonUmum,
  JenisSuratConfig,
  ProfilDesa,
} from '../types/surat';

interface KopSuratPreviewProps {
  config: JenisSuratConfig;
  profil: ProfilDesa;
  nomorSurat: string;
  tanggalSurat: string;
  pemohon: DataPemohonUmum;
  dataTambahan: Record<string, string>;
  keperluan: string;
  isPrintTarget?: boolean;
}

export const KopSuratPreview: React.FC<KopSuratPreviewProps> = ({
  config,
  profil,
  nomorSurat,
  tanggalSurat,
  pemohon,
  dataTambahan,
  keperluan,
  isPrintTarget = false,
}) => {
  const [logoError, setLogoError] = useState(false);

  const { pembuka, isi, penutup, identitasRows, rincianKhususRows } =
    buildSuratContent(config, profil, pemohon, dataTambahan, keperluan);

  const desaTitle = profil.namaDesa.replace(/^DESA\s+/i, 'Desa ');
  const logoSrc = profil.logoDataUrl || DEFAULT_LOGO_MALAKA_PATH;

  return (
    <div
      className={`bg-white text-slate-950 border border-slate-200 rounded-xl shadow-xs p-5 sm:p-10 font-serif text-[13px] sm:text-[14.5px] leading-relaxed ${
        isPrintTarget ? 'print-only-sheet' : ''
      }`}
    >
      {/* Kop Surat dengan Logo Kabupaten Malaka */}
      <div className="pb-3 border-b-[3px] border-double border-slate-900 flex items-center gap-3 sm:gap-5">
        {!logoError ? (
          <img
            src={logoSrc}
            alt="Logo Kabupaten Malaka"
            referrerPolicy="no-referrer"
            onError={() => setLogoError(true)}
            className="w-14 h-14 sm:w-20 sm:h-20 object-contain shrink-0"
          />
        ) : (
          <div className="w-14 h-14 sm:w-20 sm:h-20 shrink-0 rounded-lg border border-slate-300 flex items-center justify-center text-[10px] text-center text-slate-500 p-1">
            Logo Kab. Malaka
          </div>
        )}

        <div className="flex-1 text-center pr-2 sm:pr-8">
          <div className="text-xs sm:text-sm font-bold tracking-wide uppercase">
            PEMERINTAH {profil.kabupaten}
          </div>
          <div className="text-xs sm:text-sm font-bold tracking-wide uppercase">
            {profil.kecamatan}
          </div>
          <div className="text-sm sm:text-lg font-bold tracking-wide uppercase mt-0.5">
            KEPALA {profil.namaDesa}
          </div>
          <div className="text-[10.5px] sm:text-xs italic text-slate-700 mt-1">
            {profil.alamatKantor}
            {profil.telepon && profil.telepon !== '-'
              ? ` · Telp. ${profil.telepon}`
              : ''}
            {profil.email ? ` · ${profil.email}` : ''}
          </div>
        </div>
      </div>

      {/* Judul & Nomor Surat */}
      <div className="text-center mt-6 mb-5">
        <h2 className="text-sm sm:text-base font-bold uppercase underline underline-offset-4">
          {config.namaJudulDokumen}
        </h2>
        <p className="text-xs sm:text-sm mt-1 tabular-nums">
          Nomor: {nomorSurat}
        </p>
      </div>

      {/* Pembuka */}
      <p className="text-justify mb-4">{pembuka}</p>

      {/* Tabel Identitas Pemohon */}
      <div className="space-y-1.5 pl-1 sm:pl-4 mb-4">
        {identitasRows.map(([label, val]) => (
          <div
            key={label}
            className="grid grid-cols-[120px_12px_1fr] sm:grid-cols-[175px_14px_1fr] items-baseline"
          >
            <span>{label}</span>
            <span>:</span>
            <span
              className={
                label === 'Nama Lengkap' || label === 'NIK'
                  ? 'font-semibold'
                  : ''
              }
            >
              {val}
            </span>
          </div>
        ))}
      </div>

      {/* Rincian Khusus */}
      {rincianKhususRows.length > 0 && (
        <div className="mb-4">
          <p className="font-semibold mb-1.5">Keterangan Tambahan:</p>
          <div className="space-y-1.5 pl-1 sm:pl-4">
            {rincianKhususRows.map(([label, val]) => (
              <div
                key={label}
                className="grid grid-cols-[120px_12px_1fr] sm:grid-cols-[175px_14px_1fr] items-baseline"
              >
                <span>{label}</span>
                <span>:</span>
                <span>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Isi & Penutup */}
      <p className="text-justify mb-3">{isi}</p>
      <p className="text-justify mb-8">{penutup}</p>

      {/* Blok Tanda Tangan Kepala Desa */}
      <div className="flex justify-end">
        <div className="w-56 sm:w-64 text-center">
          <p>
            {desaTitle}, {formatTanggalIndonesia(tanggalSurat)}
          </p>
          <p className="font-bold mt-0.5">{profil.jabatanKepalaDesa}</p>
          <div className="h-20 sm:h-24 flex items-center justify-center">
            <span className="text-[11px] italic text-slate-400 no-print">
              (Ruang Tanda Tangan &amp; Stempel Basah)
            </span>
          </div>
          <p className="font-bold underline underline-offset-4">
            {profil.namaKepalaDesa}
          </p>
          {profil.nipKepalaDesa && (
            <p className="text-xs mt-0.5 tabular-nums">
              NIP. {profil.nipKepalaDesa}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
