import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx';
import { jsPDF } from 'jspdf';
import { DEFAULT_LOGO_MALAKA_PATH } from '../data/jenisSurat';
import {
  ArsipSuratKeluar,
  ArsipSuratMasuk,
  DataPemohonUmum,
  JenisSuratConfig,
  ProfilDesa,
} from '../types/surat';

const BULAN_INDO = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const BULAN_ROMAWI = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
];

export function formatTanggalIndonesia(isoDate: string): string {
  if (!isoDate) return '-';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const monthName = BULAN_INDO[monthIdx] || parts[1];
  return `${day} ${monthName} ${year}`;
}

export function generateNomorSurat(
  kodeKlasifikasi: string,
  urutan: number,
  kodeDesaSingkat: string,
  tanggalIso: string
): string {
  const dateObj = tanggalIso ? new Date(tanggalIso) : new Date();
  const bulan = BULAN_ROMAWI[dateObj.getMonth()] || 'XI';
  const tahun = dateObj.getFullYear();
  const padded = String(urutan).padStart(3, '0');
  const kodeDesa = (kodeDesaSingkat || 'DS-LF').toUpperCase();
  return `${kodeKlasifikasi} / ${padded} / ${kodeDesa} / ${bulan} / ${tahun}`;
}

export function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

interface LoadedLogoAsset {
  bytes: Uint8Array;
  dataUrl: string;
  pdfFormat: 'PNG' | 'JPEG';
  docxType: 'png' | 'jpg';
  aspectRatio: number;
}

async function loadLogoAsset(
  logoSrc?: string
): Promise<LoadedLogoAsset | null> {
  const src = logoSrc || DEFAULT_LOGO_MALAKA_PATH;
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const blob = await res.blob();
    const arrayBuf = await blob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuf);
    const isPng = blob.type.includes('png') || src.toLowerCase().endsWith('.png');

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('Failed to read logo'));
      reader.readAsDataURL(blob);
    });

    const aspectRatio = await new Promise<number>((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
          resolve(img.naturalWidth / img.naturalHeight);
        } else {
          resolve(1);
        }
      };
      img.onerror = () => resolve(1);
      img.src = dataUrl;
    });

    return {
      bytes,
      dataUrl,
      pdfFormat: isPng ? 'PNG' : 'JPEG',
      docxType: isPng ? 'png' : 'jpg',
      aspectRatio,
    };
  } catch {
    return null;
  }
}

function interpolateTemplate(
  template: string,
  profil: ProfilDesa,
  dataTambahan: Record<string, string>,
  keperluan: string
): string {
  let result = template
    .replace(/\{NAMA_DESA\}/g, profil.namaDesa.replace(/^DESA\s+/i, 'Desa '))
    .replace(/\{KECAMATAN\}/g, profil.kecamatan.replace(/^KECAMATAN\s+/i, ''))
    .replace(/\{KABUPATEN\}/g, profil.kabupaten)
    .replace(/\{KEPERLUAN\}/g, keperluan || 'Administrasi Umum');

  Object.entries(dataTambahan).forEach(([key, val]) => {
    const safeVal = val && val.trim() ? val.trim() : '-';
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), safeVal);
  });

  result = result.replace(/\{[a-zA-Z0-9_]+\}/g, '-');
  return result;
}

export function buildSuratContent(
  config: JenisSuratConfig,
  profil: ProfilDesa,
  pemohon: DataPemohonUmum,
  dataTambahan: Record<string, string>,
  keperluan: string
) {
  const pembuka = interpolateTemplate(
    config.paragrafPembuka,
    profil,
    dataTambahan,
    keperluan
  );
  const isi = interpolateTemplate(
    config.paragrafIsiTemplate,
    profil,
    dataTambahan,
    keperluan
  );
  const penutup = interpolateTemplate(
    config.paragrafPenutup,
    profil,
    dataTambahan,
    keperluan
  );

  const ttl = `${pemohon.tempatLahir || '-'}, ${
    pemohon.tanggalLahir ? formatTanggalIndonesia(pemohon.tanggalLahir) : '-'
  }`;
  const alamatFull = `${pemohon.alamatLengkap || '-'}${
    pemohon.rtRw ? ` (${pemohon.rtRw})` : ''
  }`;

  const identitasRows: [string, string][] = [
    ['Nama Lengkap', pemohon.namaLengkap || '-'],
    ['NIK', pemohon.nik || '-'],
    ['Nomor KK', pemohon.noKk || '-'],
    ['Tempat, Tanggal Lahir', ttl],
    ['Jenis Kelamin', pemohon.jenisKelamin || '-'],
    ['Agama', pemohon.agama || '-'],
    ['Status Perkawinan', pemohon.statusPerkawinan || '-'],
    ['Pekerjaan', pemohon.pekerjaan || '-'],
    ['Kewarganegaraan', pemohon.kewarganegaraan || 'Indonesia'],
    ['Alamat', alamatFull],
  ];

  const rincianKhususRows: [string, string][] = config.fieldTambahan
    .filter((f) => dataTambahan[f.key] && dataTambahan[f.key].trim() !== '')
    .map((f) => [f.label, dataTambahan[f.key].trim()]);

  return {
    pembuka,
    isi,
    penutup,
    identitasRows,
    rincianKhususRows,
  };
}

const NO_BORDER = {
  top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
};

function buildWordKopHeader(
  profil: ProfilDesa,
  logo: LoadedLogoAsset | null
): (Paragraph | Table)[] {
  const contactParts = [
    profil.alamatKantor,
    profil.telepon && profil.telepon !== '-' ? `Telp. ${profil.telepon}` : '',
    profil.email ? `Email: ${profil.email}` : '',
  ].filter(Boolean);

  const textParagraphs = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 20 },
      children: [
        new TextRun({
          text: `PEMERINTAH ${profil.kabupaten.toUpperCase()}`,
          font: 'Times New Roman',
          size: 24,
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 20 },
      children: [
        new TextRun({
          text: profil.kecamatan.toUpperCase(),
          font: 'Times New Roman',
          size: 24,
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: `KEPALA ${profil.namaDesa.toUpperCase()}`,
          font: 'Times New Roman',
          size: 28,
          bold: true,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: contactParts.join(' · '),
          font: 'Times New Roman',
          size: 18,
          italics: true,
        }),
      ],
    }),
  ];

  const dividerParagraph = new Paragraph({
    spacing: { before: 40, after: 140 },
    border: {
      bottom: {
        style: BorderStyle.DOUBLE,
        size: 18,
        color: '000000',
        space: 4,
      },
    },
    children: [],
  });

  if (!logo) {
    return [...textParagraphs, dividerParagraph];
  }

  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: NO_BORDER.top,
      bottom: NO_BORDER.bottom,
      left: NO_BORDER.left,
      right: NO_BORDER.right,
      insideHorizontal: NO_BORDER.top,
      insideVertical: NO_BORDER.left,
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 16, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            borders: NO_BORDER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new ImageRun({
                    data: logo.bytes,
                    type: logo.docxType,
                    transformation: {
                      width: Math.round(72 * Math.min(logo.aspectRatio, 1.15)),
                      height: 72,
                    },
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 84, type: WidthType.PERCENTAGE },
            verticalAlign: VerticalAlign.CENTER,
            borders: NO_BORDER,
            children: textParagraphs,
          }),
        ],
      }),
    ],
  });

  return [headerTable, dividerParagraph];
}

function makeIdentityTable(rows: [string, string][]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: NO_BORDER.top,
      bottom: NO_BORDER.bottom,
      left: NO_BORDER.left,
      right: NO_BORDER.right,
      insideHorizontal: NO_BORDER.top,
      insideVertical: NO_BORDER.left,
    },
    rows: rows.map(
      ([label, value]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 34, type: WidthType.PERCENTAGE },
              borders: NO_BORDER,
              children: [
                new Paragraph({
                  spacing: { before: 20, after: 20 },
                  children: [
                    new TextRun({
                      text: label,
                      font: 'Times New Roman',
                      size: 22,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 4, type: WidthType.PERCENTAGE },
              borders: NO_BORDER,
              children: [
                new Paragraph({
                  spacing: { before: 20, after: 20 },
                  children: [
                    new TextRun({
                      text: ':',
                      font: 'Times New Roman',
                      size: 22,
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              width: { size: 62, type: WidthType.PERCENTAGE },
              borders: NO_BORDER,
              children: [
                new Paragraph({
                  spacing: { before: 20, after: 20 },
                  children: [
                    new TextRun({
                      text: value,
                      font: 'Times New Roman',
                      size: 22,
                      bold: label === 'Nama Lengkap' || label === 'NIK',
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
    ),
  });
}

export async function generateSuratWordBlob(
  surat: ArsipSuratKeluar,
  config: JenisSuratConfig,
  profil: ProfilDesa
): Promise<Blob> {
  const [logo, content] = await Promise.all([
    loadLogoAsset(profil.logoDataUrl),
    Promise.resolve(
      buildSuratContent(
        config,
        profil,
        surat.pemohon,
        surat.dataTambahan,
        surat.keperluan
      )
    ),
  ]);

  const { pembuka, isi, penutup, identitasRows, rincianKhususRows } = content;
  const desaTitle = profil.namaDesa.replace(/^DESA\s+/i, 'Desa ');

  const children: (Paragraph | Table)[] = [
    ...buildWordKopHeader(profil, logo),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 40 },
      children: [
        new TextRun({
          text: config.namaJudulDokumen,
          font: 'Times New Roman',
          size: 26,
          bold: true,
          underline: {},
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 220 },
      children: [
        new TextRun({
          text: `Nomor: ${surat.nomorSurat}`,
          font: 'Times New Roman',
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 140, line: 300 },
      children: [
        new TextRun({
          text: pembuka,
          font: 'Times New Roman',
          size: 22,
        }),
      ],
    }),
    makeIdentityTable(identitasRows),
    new Paragraph({ spacing: { after: 120 }, children: [] }),
  ];

  if (rincianKhususRows.length > 0) {
    children.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({
            text: 'Keterangan Tambahan:',
            font: 'Times New Roman',
            size: 22,
            bold: true,
          }),
        ],
      }),
      makeIdentityTable(rincianKhususRows),
      new Paragraph({ spacing: { after: 120 }, children: [] })
    );
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 140, line: 300 },
      children: [
        new TextRun({
          text: isi,
          font: 'Times New Roman',
          size: 22,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { after: 320, line: 300 },
      children: [
        new TextRun({
          text: penutup,
          font: 'Times New Roman',
          size: 22,
        }),
      ],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: NO_BORDER.top,
        bottom: NO_BORDER.bottom,
        left: NO_BORDER.left,
        right: NO_BORDER.right,
        insideHorizontal: NO_BORDER.top,
        insideVertical: NO_BORDER.left,
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 52, type: WidthType.PERCENTAGE },
              borders: NO_BORDER,
              children: [new Paragraph({ children: [] })],
            }),
            new TableCell({
              width: { size: 48, type: WidthType.PERCENTAGE },
              borders: NO_BORDER,
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 40 },
                  children: [
                    new TextRun({
                      text: `${desaTitle}, ${formatTanggalIndonesia(
                        surat.tanggalSurat
                      )}`,
                      font: 'Times New Roman',
                      size: 22,
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 900 },
                  children: [
                    new TextRun({
                      text: profil.jabatanKepalaDesa,
                      font: 'Times New Roman',
                      size: 22,
                      bold: true,
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 20 },
                  children: [
                    new TextRun({
                      text: profil.namaKepalaDesa,
                      font: 'Times New Roman',
                      size: 22,
                      bold: true,
                      underline: {},
                    }),
                  ],
                }),
                ...(profil.nipKepalaDesa
                  ? [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: `NIP. ${profil.nipKepalaDesa}`,
                            font: 'Times New Roman',
                            size: 20,
                          }),
                        ],
                      }),
                    ]
                  : []),
              ],
            }),
          ],
        }),
      ],
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1000, right: 1100, bottom: 1000, left: 1100 },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

export async function generateSuratPdfBlob(
  surat: ArsipSuratKeluar,
  config: JenisSuratConfig,
  profil: ProfilDesa
): Promise<Blob> {
  const [logo, content] = await Promise.all([
    loadLogoAsset(profil.logoDataUrl),
    Promise.resolve(
      buildSuratContent(
        config,
        profil,
        surat.pemohon,
        surat.dataTambahan,
        surat.keperluan
      )
    ),
  ]);

  const { pembuka, isi, penutup, identitasRows, rincianKhususRows } = content;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 20;
  const contentWidth = pageWidth - marginX * 2;
  let y = 17;

  const ensurePageSpace = (needed: number) => {
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
  };

  // Kop Surat dengan Logo Kabupaten Malaka
  const textCenterX = logo ? pageWidth / 2 + 10 : pageWidth / 2;
  const textMaxW = logo ? contentWidth - 26 : contentWidth;

  if (logo) {
    const pdfH = 22;
    const pdfW = Math.min(24, pdfH * logo.aspectRatio);
    doc.addImage(logo.dataUrl, logo.pdfFormat, marginX, 13, pdfW, pdfH);
  }

  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.text(`PEMERINTAH ${profil.kabupaten.toUpperCase()}`, textCenterX, y, {
    align: 'center',
    maxWidth: textMaxW,
  });
  y += 5.5;
  doc.text(profil.kecamatan.toUpperCase(), textCenterX, y, {
    align: 'center',
    maxWidth: textMaxW,
  });
  y += 6;
  doc.setFontSize(14);
  doc.text(`KEPALA ${profil.namaDesa.toUpperCase()}`, textCenterX, y, {
    align: 'center',
    maxWidth: textMaxW,
  });
  y += 5;
  doc.setFont('times', 'italic');
  doc.setFontSize(9.5);
  const contactParts = [
    profil.alamatKantor,
    profil.telepon && profil.telepon !== '-' ? `Telp. ${profil.telepon}` : '',
    profil.email || '',
  ].filter(Boolean);
  doc.text(contactParts.join(' · '), textCenterX, y, {
    align: 'center',
    maxWidth: textMaxW,
  });
  y = Math.max(y + 4, 38);

  // Double horizontal border
  doc.setLineWidth(0.9);
  doc.line(marginX, y, pageWidth - marginX, y);
  doc.setLineWidth(0.3);
  doc.line(marginX, y + 1.2, pageWidth - marginX, y + 1.2);
  y += 10;

  // Judul Surat
  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  const titleLines = doc.splitTextToSize(config.namaJudulDokumen, contentWidth);
  doc.text(titleLines, pageWidth / 2, y, { align: 'center' });
  const lastTitleLine = titleLines[titleLines.length - 1] || config.namaJudulDokumen;
  const titleWidth = doc.getTextWidth(lastTitleLine);
  const lastLineY = y + (titleLines.length - 1) * 5.5;
  doc.setLineWidth(0.4);
  doc.line(
    pageWidth / 2 - titleWidth / 2,
    lastLineY + 1,
    pageWidth / 2 + titleWidth / 2,
    lastLineY + 1
  );
  y = lastLineY + 6;

  // Nomor Surat
  doc.setFont('times', 'normal');
  doc.setFontSize(11);
  doc.text(`Nomor: ${surat.nomorSurat}`, pageWidth / 2, y, {
    align: 'center',
  });
  y += 10;

  // Pembuka
  const pembukaLines = doc.splitTextToSize(pembuka, contentWidth);
  doc.text(pembukaLines, marginX, y);
  y += pembukaLines.length * 5.3 + 4;

  const drawRows = (rows: [string, string][]) => {
    const labelX = marginX + 4;
    const colonX = marginX + 54;
    const valX = marginX + 58;
    const valWidth = contentWidth - 58;

    rows.forEach(([label, value]) => {
      const valLines = doc.splitTextToSize(value, valWidth);
      ensurePageSpace(valLines.length * 5.2 + 2);
      doc.setFont('times', 'normal');
      doc.text(label, labelX, y);
      doc.text(':', colonX, y);
      doc.setFont(
        'times',
        label === 'Nama Lengkap' || label === 'NIK' ? 'bold' : 'normal'
      );
      doc.text(valLines, valX, y);
      y += Math.max(1, valLines.length) * 5.2 + 1;
    });
  };

  drawRows(identitasRows);
  y += 4;

  if (rincianKhususRows.length > 0) {
    ensurePageSpace(14);
    doc.setFont('times', 'bold');
    doc.text('Keterangan Tambahan:', marginX, y);
    y += 5.5;
    drawRows(rincianKhususRows);
    y += 4;
  }

  // Isi & Penutup
  const isiLines = doc.splitTextToSize(isi, contentWidth);
  ensurePageSpace(isiLines.length * 5.3 + 6);
  doc.setFont('times', 'normal');
  doc.text(isiLines, marginX, y);
  y += isiLines.length * 5.3 + 5;

  const penutupLines = doc.splitTextToSize(penutup, contentWidth);
  ensurePageSpace(penutupLines.length * 5.3 + 42);
  doc.text(penutupLines, marginX, y);
  y += penutupLines.length * 5.3 + 10;

  // Tanda tangan Kepala Desa
  ensurePageSpace(40);
  const sigCenterX = pageWidth - marginX - 38;
  const desaTitle = profil.namaDesa.replace(/^DESA\s+/i, 'Desa ');
  doc.setFont('times', 'normal');
  doc.text(
    `${desaTitle}, ${formatTanggalIndonesia(surat.tanggalSurat)}`,
    sigCenterX,
    y,
    { align: 'center' }
  );
  y += 5.5;
  doc.setFont('times', 'bold');
  doc.text(profil.jabatanKepalaDesa, sigCenterX, y, { align: 'center' });
  y += 24;
  doc.text(profil.namaKepalaDesa, sigCenterX, y, { align: 'center' });
  const nameW = doc.getTextWidth(profil.namaKepalaDesa);
  doc.setLineWidth(0.35);
  doc.line(sigCenterX - nameW / 2, y + 1, sigCenterX + nameW / 2, y + 1);
  if (profil.nipKepalaDesa) {
    y += 5;
    doc.setFont('times', 'normal');
    doc.setFontSize(10);
    doc.text(`NIP. ${profil.nipKepalaDesa}`, sigCenterX, y, {
      align: 'center',
    });
  }

  return doc.output('blob');
}

export async function generateSuratMasukDisposisiWordBlob(
  surat: ArsipSuratMasuk,
  profil: ProfilDesa
): Promise<Blob> {
  const logo = await loadLogoAsset(profil.logoDataUrl);

  const rows: [string, string][] = [
    ['Nomor Agenda', surat.nomorAgenda],
    ['Nomor Surat Asal', surat.nomorSuratAsal],
    ['Asal / Pengirim', surat.asalInstansi],
    ['Tanggal Surat', formatTanggalIndonesia(surat.tanggalSurat)],
    ['Tanggal Diterima', formatTanggalIndonesia(surat.tanggalDiterima)],
    ['Sifat Surat', surat.sifatSurat],
    ['Perihal', surat.perihal],
    ['Ringkasan Isi', surat.ringkasanIsi || '-'],
    ['Status Disposisi', surat.statusDisposisi],
    ['Arahan / Disposisi Kades', surat.disposisiKades || '(Menunggu arahan Kepala Desa)'],
  ];

  const doc = new Document({
    sections: [
      {
        properties: {
          page: { margin: { top: 1000, right: 1100, bottom: 1000, left: 1100 } },
        },
        children: [
          ...buildWordKopHeader(profil, logo),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 180 },
            children: [
              new TextRun({
                text: 'LEMBAR DISPOSISI & ARSIP SURAT MASUK',
                font: 'Times New Roman',
                size: 26,
                bold: true,
                underline: {},
              }),
            ],
          }),
          makeIdentityTable(rows),
          new Paragraph({ spacing: { after: 360 }, children: [] }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 900 },
            children: [
              new TextRun({
                text: `${profil.jabatanKepalaDesa},`,
                font: 'Times New Roman',
                size: 22,
                bold: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: profil.namaKepalaDesa,
                font: 'Times New Roman',
                size: 22,
                bold: true,
                underline: {},
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}

export async function generateSuratMasukDisposisiPdfBlob(
  surat: ArsipSuratMasuk,
  profil: ProfilDesa
): Promise<Blob> {
  const logo = await loadLogoAsset(profil.logoDataUrl);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 20;
  const contentWidth = pageWidth - marginX * 2;
  let y = 18;

  const textCenterX = logo ? pageWidth / 2 + 10 : pageWidth / 2;
  if (logo) {
    const pdfH = 21;
    const pdfW = Math.min(23, pdfH * logo.aspectRatio);
    doc.addImage(logo.dataUrl, logo.pdfFormat, marginX, 13, pdfW, pdfH);
  }

  doc.setFont('times', 'bold');
  doc.setFontSize(12);
  doc.text(`PEMERINTAH ${profil.kabupaten.toUpperCase()}`, textCenterX, y, { align: 'center' });
  y += 5.5;
  doc.text(`${profil.kecamatan.toUpperCase()} · ${profil.namaDesa.toUpperCase()}`, textCenterX, y, { align: 'center' });
  y += 5;
  doc.setFont('times', 'italic');
  doc.setFontSize(9.5);
  doc.text(profil.alamatKantor, textCenterX, y, { align: 'center' });
  y = Math.max(y + 4, 37);
  doc.setLineWidth(0.8);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 12;

  doc.setFont('times', 'bold');
  doc.setFontSize(13);
  doc.text('LEMBAR DISPOSISI & ARSIP SURAT MASUK', pageWidth / 2, y, { align: 'center' });
  y += 12;

  const rows: [string, string][] = [
    ['Nomor Agenda', surat.nomorAgenda],
    ['Nomor Surat Asal', surat.nomorSuratAsal],
    ['Asal / Pengirim', surat.asalInstansi],
    ['Tanggal Surat', formatTanggalIndonesia(surat.tanggalSurat)],
    ['Tanggal Diterima', formatTanggalIndonesia(surat.tanggalDiterima)],
    ['Sifat Surat', surat.sifatSurat],
    ['Perihal', surat.perihal],
    ['Ringkasan Isi', surat.ringkasanIsi || '-'],
    ['Status Disposisi', surat.statusDisposisi],
    ['Arahan Kades', surat.disposisiKades || '(Menunggu arahan Kepala Desa)'],
  ];

  doc.setFontSize(11);
  rows.forEach(([label, val]) => {
    const valLines = doc.splitTextToSize(val, contentWidth - 56);
    doc.setFont('times', 'normal');
    doc.text(label, marginX, y);
    doc.text(':', marginX + 50, y);
    doc.setFont('times', label === 'Perihal' ? 'bold' : 'normal');
    doc.text(valLines, marginX + 54, y);
    y += Math.max(1, valLines.length) * 5.5 + 2;
  });

  y += 16;
  const sigX = pageWidth - marginX - 38;
  doc.setFont('times', 'bold');
  doc.text(profil.jabatanKepalaDesa, sigX, y, { align: 'center' });
  y += 24;
  doc.text(profil.namaKepalaDesa, sigX, y, { align: 'center' });

  return doc.output('blob');
}
