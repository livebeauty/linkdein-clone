import {
  StorageSharedKeyCredential,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

export const containerName = "posts";

const accountName = process.env.AZURE_STORAGE_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;

if (!accountName || !accountKey) {
  throw new Error("Azure storage account name and key are required");
}

const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

async function generateSASToken() {
  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 1); // Expire in 1 hour

  const permissions = BlobSASPermissions.parse("racw"); // Read, Add, Create, Write

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      permissions,
      expiresOn: expiryDate,
    },
    sharedKeyCredential
  ).toString();

  return sasToken;
}

export default generateSASToken;
