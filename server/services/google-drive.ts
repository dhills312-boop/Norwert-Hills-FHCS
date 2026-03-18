import { google, drive_v3 } from "googleapis";

const CASE_SUBFOLDERS = [
  "01 Intake",
  "02 Authorization",
  "03 Vital Stats",
  "04 SSN Restricted",
  "05 Shipping & Urn",
  "06 Compliance Packet",
] as const;

let driveClient: drive_v3.Drive | null = null;

function getDriveClient(): drive_v3.Drive {
  if (driveClient) return driveClient;

  const credentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credentials) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set");
  }

  const parsed = JSON.parse(credentials);
  const auth = new google.auth.GoogleAuth({
    credentials: parsed,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  driveClient = google.drive({ version: "v3", auth });
  return driveClient;
}

function getParentFolderId(): string {
  const parentId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;
  if (!parentId) {
    throw new Error("GOOGLE_DRIVE_PARENT_FOLDER_ID environment variable is not set");
  }
  return parentId;
}

export async function createFolder(
  name: string,
  parentId?: string
): Promise<{ id: string; url: string }> {
  const drive = getDriveClient();

  const fileMetadata: drive_v3.Schema$File = {
    name,
    mimeType: "application/vnd.google-apps.folder",
  };

  if (parentId) {
    fileMetadata.parents = [parentId];
  }

  const response = await drive.files.create({
    requestBody: fileMetadata,
    fields: "id, webViewLink",
  });

  const id = response.data.id!;
  const url = response.data.webViewLink || `https://drive.google.com/drive/folders/${id}`;

  return { id, url };
}

export async function createCaseStructure(
  orderToken: string
): Promise<{
  rootFolderId: string;
  rootFolderUrl: string;
  subfolders: Record<string, string>;
}> {
  const parentId = getParentFolderId();

  let ordersFolderId = parentId;
  const drive = getDriveClient();
  const ordersSearch = await drive.files.list({
    q: `name = 'Orders' and '${parentId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id)",
  });

  if (ordersSearch.data.files && ordersSearch.data.files.length > 0) {
    ordersFolderId = ordersSearch.data.files[0].id!;
  } else {
    const ordersFolder = await createFolder("Orders", parentId);
    ordersFolderId = ordersFolder.id;
  }

  const caseFolder = await createFolder(orderToken, ordersFolderId);

  const subfolders: Record<string, string> = {};
  for (const subfolderName of CASE_SUBFOLDERS) {
    const subfolder = await createFolder(subfolderName, caseFolder.id);
    subfolders[subfolderName] = subfolder.id;
  }

  return {
    rootFolderId: caseFolder.id,
    rootFolderUrl: caseFolder.url,
    subfolders,
  };
}

export async function uploadFile(
  folderId: string,
  fileName: string,
  mimeType: string,
  buffer: Buffer
): Promise<{ id: string; url: string }> {
  const drive = getDriveClient();
  const { Readable } = await import("stream");

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [folderId],
    },
    media: {
      mimeType,
      body: Readable.from(buffer),
    },
    fields: "id, webViewLink",
  });

  const id = response.data.id!;
  const url = response.data.webViewLink || `https://drive.google.com/file/d/${id}/view`;

  return { id, url };
}

export function getFileUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

export function getFolderUrl(folderId: string): string {
  return `https://drive.google.com/drive/folders/${folderId}`;
}

export async function listFiles(
  folderId: string
): Promise<Array<{ id: string; name: string; mimeType: string; url: string }>> {
  const drive = getDriveClient();

  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id, name, mimeType, webViewLink)",
    orderBy: "name",
  });

  return (response.data.files || []).map((file) => ({
    id: file.id!,
    name: file.name!,
    mimeType: file.mimeType!,
    url: file.webViewLink || getFileUrl(file.id!),
  }));
}

export function isConfigured(): boolean {
  return !!(process.env.GOOGLE_SERVICE_ACCOUNT_JSON && process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID);
}
