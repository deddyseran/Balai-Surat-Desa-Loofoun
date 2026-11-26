import { DEFAULT_PROFIL_DESA } from '../data/jenisSurat';
import { DriveDatabasePayload } from '../types/surat';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

export const ROOT_FOLDER_NAME = 'Database_Surat_Desa';
export const SUBFOLDER_KELUAR = 'Surat_Keluar';
export const SUBFOLDER_MASUK = 'Surat_Masuk';
export const DB_JSON_FILENAME = 'surat_desa_database.json';

export interface DriveFolderContext {
  rootFolderId: string;
  rootFolderName: string;
  keluarFolderId: string;
  masukFolderId: string;
  dbFileId: string;
}

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  webViewLink?: string;
}

export class DriveAuthExpiredError extends Error {
  constructor(message = 'Sesi akses Google Drive berakhir. Silakan masuk kembali.') {
    super(message);
    this.name = 'DriveAuthExpiredError';
  }
}

async function driveFetch(
  url: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    throw new DriveAuthExpiredError();
  }
  return res;
}

export function createEmptyDatabase(): DriveDatabasePayload {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    profilDesa: { ...DEFAULT_PROFIL_DESA },
    counterSuratKeluar: 0,
    counterSuratMasuk: 0,
    suratKeluar: [],
    suratMasuk: [],
  };
}

async function findFolderByName(
  token: string,
  name: string,
  parentId?: string
): Promise<{ id: string; name: string } | null> {
  const escapedName = name.replace(/'/g, "\\'");
  let q = `name = '${escapedName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  if (parentId) {
    q += ` and '${parentId}' in parents`;
  }
  const params = new URLSearchParams({
    q,
    fields: 'files(id, name)',
    pageSize: '10',
    supportsAllDrives: 'true',
    includeItemsFromAllDrives: 'true',
  });
  const res = await driveFetch(`${DRIVE_API_BASE}/files?${params.toString()}`, token);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal mencari folder Google Drive: ${errText}`);
  }
  const data = await res.json();
  return data.files?.[0] ?? null;
}

async function createFolder(
  token: string,
  name: string,
  parentId?: string
): Promise<{ id: string; name: string }> {
  const metadata: Record<string, unknown> = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) {
    metadata.parents = [parentId];
  }

  const res = await driveFetch(`${DRIVE_API_BASE}/files?supportsAllDrives=true`, token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal membuat folder "${name}" di Google Drive: ${errText}`);
  }
  return res.json();
}

async function getFolderById(
  token: string,
  folderId: string
): Promise<{ id: string; name: string }> {
  const params = new URLSearchParams({
    fields: 'id, name, mimeType, trashed',
    supportsAllDrives: 'true',
  });
  const res = await driveFetch(
    `${DRIVE_API_BASE}/files/${encodeURIComponent(folderId)}?${params.toString()}`,
    token
  );
  if (!res.ok) {
    throw new Error(
      'Folder Google Drive tidak ditemukan atau akun Anda belum memiliki izin akses ke Folder ID tersebut.'
    );
  }
  const data = await res.json();
  if (data.trashed) {
    throw new Error('Folder Google Drive tersebut berada di sampah (trashed).');
  }
  if (data.mimeType !== 'application/vnd.google-apps.folder') {
    throw new Error('ID yang dimasukkan bukan merupakan Folder Google Drive.');
  }
  return { id: data.id, name: data.name };
}

async function ensureSubfolder(
  token: string,
  name: string,
  parentId: string
): Promise<string> {
  const existing = await findFolderByName(token, name, parentId);
  if (existing) return existing.id;
  const created = await createFolder(token, name, parentId);
  return created.id;
}

async function findFileInFolder(
  token: string,
  filename: string,
  parentId: string
): Promise<DriveFileItem | null> {
  const escaped = filename.replace(/'/g, "\\'");
  const q = `name = '${escaped}' and '${parentId}' in parents and trashed = false`;
  const params = new URLSearchParams({
    q,
    fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink)',
    pageSize: '5',
    supportsAllDrives: 'true',
    includeItemsFromAllDrives: 'true',
  });
  const res = await driveFetch(`${DRIVE_API_BASE}/files?${params.toString()}`, token);
  if (!res.ok) return null;
  const data = await res.json();
  return data.files?.[0] ?? null;
}

async function uploadMultipartFile(
  token: string,
  metadata: Record<string, unknown>,
  blob: Blob,
  existingFileId?: string
): Promise<DriveFileItem> {
  const boundary = 'balai_surat_desa_boundary_' + Date.now();
  const metaPart = JSON.stringify(metadata);

  const body = new Blob(
    [
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metaPart}\r\n`,
      `--${boundary}\r\nContent-Type: ${blob.type || 'application/octet-stream'}\r\n\r\n`,
      blob,
      `\r\n--${boundary}--`,
    ],
    { type: `multipart/related; boundary=${boundary}` }
  );

  const url = existingFileId
    ? `${DRIVE_UPLOAD_BASE}/files/${encodeURIComponent(existingFileId)}?uploadType=multipart&supportsAllDrives=true&fields=id,name,mimeType,size,modifiedTime,webViewLink`
    : `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&supportsAllDrives=true&fields=id,name,mimeType,size,modifiedTime,webViewLink`;

  const res = await driveFetch(url, token, {
    method: existingFileId ? 'PATCH' : 'POST',
    headers: {
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal menyimpan file ke Google Drive: ${errText}`);
  }
  return res.json();
}

export async function initializeDriveDatabase(
  token: string,
  customFolderId?: string
): Promise<{ context: DriveFolderContext; database: DriveDatabasePayload }> {
  let rootFolder: { id: string; name: string };
  if (customFolderId && customFolderId.trim()) {
    rootFolder = await getFolderById(token, customFolderId.trim());
  } else {
    const existing = await findFolderByName(token, ROOT_FOLDER_NAME);
    rootFolder = existing ?? (await createFolder(token, ROOT_FOLDER_NAME));
  }

  const [keluarFolderId, masukFolderId] = await Promise.all([
    ensureSubfolder(token, SUBFOLDER_KELUAR, rootFolder.id),
    ensureSubfolder(token, SUBFOLDER_MASUK, rootFolder.id),
  ]);

  let dbFile = await findFileInFolder(token, DB_JSON_FILENAME, rootFolder.id);
  let database: DriveDatabasePayload;

  if (dbFile) {
    const dlRes = await driveFetch(
      `${DRIVE_API_BASE}/files/${encodeURIComponent(dbFile.id)}?alt=media&supportsAllDrives=true`,
      token
    );
    if (!dlRes.ok) {
      throw new Error('Gagal membaca file database dari Google Drive.');
    }
    try {
      const parsed = await dlRes.json();
      const loadedProfil = parsed.profilDesa || {};
      const shouldMigrateOldDefault =
        loadedProfil.namaDesa === 'DESA MAJU SEJAHTERA';
      database = {
        ...createEmptyDatabase(),
        ...parsed,
        profilDesa: shouldMigrateOldDefault
          ? { ...DEFAULT_PROFIL_DESA }
          : { ...DEFAULT_PROFIL_DESA, ...loadedProfil },
        suratKeluar: Array.isArray(parsed.suratKeluar) ? parsed.suratKeluar : [],
        suratMasuk: Array.isArray(parsed.suratMasuk) ? parsed.suratMasuk : [],
      };
    } catch {
      database = createEmptyDatabase();
    }
  } else {
    database = createEmptyDatabase();
    const jsonBlob = new Blob([JSON.stringify(database, null, 2)], {
      type: 'application/json',
    });
    dbFile = await uploadMultipartFile(
      token,
      {
        name: DB_JSON_FILENAME,
        mimeType: 'application/json',
        parents: [rootFolder.id],
      },
      jsonBlob
    );
  }

  return {
    context: {
      rootFolderId: rootFolder.id,
      rootFolderName: rootFolder.name,
      keluarFolderId,
      masukFolderId,
      dbFileId: dbFile.id,
    },
    database,
  };
}

export async function saveDatabaseJson(
  token: string,
  context: DriveFolderContext,
  database: DriveDatabasePayload
): Promise<DriveDatabasePayload> {
  const payload: DriveDatabasePayload = {
    ...database,
    updatedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  await uploadMultipartFile(
    token,
    {
      name: DB_JSON_FILENAME,
      mimeType: 'application/json',
    },
    blob,
    context.dbFileId
  );
  return payload;
}

export async function uploadSuratFileToDrive(
  token: string,
  folderId: string,
  filename: string,
  blob: Blob,
  existingFileId?: string
): Promise<DriveFileItem> {
  const metadata: Record<string, unknown> = existingFileId
    ? { name: filename }
    : { name: filename, parents: [folderId] };
  return uploadMultipartFile(token, metadata, blob, existingFileId);
}

export async function listDriveFilesInFolder(
  token: string,
  folderId: string
): Promise<DriveFileItem[]> {
  const q = `'${folderId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`;
  const params = new URLSearchParams({
    q,
    fields: 'files(id, name, mimeType, size, modifiedTime, webViewLink)',
    orderBy: 'modifiedTime desc',
    pageSize: '100',
    supportsAllDrives: 'true',
    includeItemsFromAllDrives: 'true',
  });
  const res = await driveFetch(`${DRIVE_API_BASE}/files?${params.toString()}`, token);
  if (!res.ok) {
    throw new Error('Gagal memuat daftar berkas di folder Google Drive.');
  }
  const data = await res.json();
  return data.files || [];
}

export async function downloadDriveFileBlob(
  token: string,
  fileId: string
): Promise<Blob> {
  const res = await driveFetch(
    `${DRIVE_API_BASE}/files/${encodeURIComponent(fileId)}?alt=media&supportsAllDrives=true`,
    token
  );
  if (!res.ok) {
    throw new Error('Gagal mengunduh file dari Google Drive.');
  }
  return res.blob();
}

export async function deleteDriveFile(
  token: string,
  fileId: string
): Promise<void> {
  const res = await driveFetch(
    `${DRIVE_API_BASE}/files/${encodeURIComponent(fileId)}?supportsAllDrives=true`,
    token,
    { method: 'DELETE' }
  );
  if (!res.ok && res.status !== 404) {
    const errText = await res.text();
    throw new Error(`Gagal menghapus berkas dari Google Drive: ${errText}`);
  }
}

export function extractDriveFolderId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) return match[1];
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) return idMatch[1];
  return trimmed;
}
