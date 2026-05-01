import { Injectable, Logger } from '@nestjs/common';
import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';
import { extname } from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private containerClient: ContainerClient;

  constructor(private configService: ConfigService) {
    const connectionString = this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING');
    const containerName = this.configService.get<string>('AZURE_STORAGE_CONTAINER_NAME', 'posts-images');

    if (connectionString) {
      const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
      this.containerClient = blobServiceClient.getContainerClient(containerName);
    } else {
      this.logger.warn('Azure Storage connection string is not configured. Uploads will fail.');
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    if (!this.containerClient) {
      throw new Error('Azure Storage is not configured.');
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    const blobName = `post-${uniqueSuffix}${ext}`;
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype },
    });

    return blockBlobClient.url;
  }

  async deleteFile(fileUrl: string): Promise<void> {
    if (!this.containerClient || !fileUrl) return;

    try {
      if (fileUrl.includes('blob.core.windows.net')) {
        const urlParts = new URL(fileUrl);
        const pathSegments = urlParts.pathname.split('/');
        const blobName = decodeURIComponent(pathSegments[pathSegments.length - 1]);
        
        const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.deleteIfExists();
      }
    } catch (err) {
      this.logger.error(`Error deleting file from Azure: ${err.message}`);
    }
  }
}
