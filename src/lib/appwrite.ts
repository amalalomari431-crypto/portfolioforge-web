import { Client, Storage, ID } from "node-appwrite";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Add it to .env.local — see README for setup steps.`
    );
  }
  return value;
}

export function getAppwriteStorage() {
  const client = new Client()
    .setEndpoint(getEnv("APPWRITE_ENDPOINT"))
    .setProject(getEnv("APPWRITE_PROJECT_ID"))
    .setKey(getEnv("APPWRITE_API_KEY"));

  return new Storage(client);
}

export const APPWRITE_BUCKET_ID = () => getEnv("APPWRITE_BUCKET_ID");

export { ID };

export function appwriteFileViewUrl(fileId: string) {
  const endpoint = getEnv("APPWRITE_ENDPOINT");
  const project = getEnv("APPWRITE_PROJECT_ID");
  const bucket = getEnv("APPWRITE_BUCKET_ID");
  return `${endpoint}/storage/buckets/${bucket}/files/${fileId}/view?project=${project}`;
}
