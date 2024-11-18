// storage.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { businessLogger as logger, createLogContext } from '../logging';
const B2 = require('backblaze-b2');

interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Injectable()
export class StorageService {
  private b2: any;
  private bucketId: string;
  private bucketName: string;
  private downloadUrl: string;
  private logContext = createLogContext('StorageService');

  constructor(private configService: ConfigService) {
    this.b2 = new B2({
      applicationKeyId: this.configService.get<string>('B2_APPLICATION_KEY_ID'),
      applicationKey: this.configService.get<string>('B2_APPLICATION_KEY'),
    });
    this.bucketId = this.configService.get<string>('B2_BUCKET_ID');
    this.bucketName = this.configService.get<string>('B2_BUCKET_NAME');
    this.downloadUrl = `https://f005.backblazeb2.com/file/${this.bucketName}`;
  }

  async init() {
    try {
      logger.info(this.logContext('Initializing B2 connection'));
      const auth = await this.b2.authorize();
      if (auth?.data?.downloadUrl) {
        this.downloadUrl = auth.data.downloadUrl + '/file/' + this.bucketName;
        logger.info(this.logContext('B2 connection initialized', { downloadUrl: this.downloadUrl }));
      }
    } catch (error) {
      logger.error(this.logContext('Error authorizing B2', { error: error.message }));
      throw new Error('Failed to authorize with B2');
    }
  }

  async uploadFile(file: FileUpload): Promise<string> {
    try {
      logger.info(this.logContext('Starting file upload', {
        filename: file.originalname,
        size: file.size,
        mimetype: file.mimetype
      }));

      await this.init();
      const { data: uploadUrl } = await this.b2.getUploadUrl({
        bucketId: this.bucketId,
      });

      const fileName = `complaints/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
      const uploadResult = await this.b2.uploadFile({
        uploadUrl: uploadUrl.uploadUrl,
        uploadAuthToken: uploadUrl.authorizationToken,
        fileName: fileName,
        data: file.buffer,
        contentLength: file.size,
        contentType: file.mimetype,
      });

      const fileUrl = `${this.downloadUrl}/${fileName}`;
      
      logger.info(this.logContext('File uploaded successfully', {
        fileUrl,
        fileName,
        size: file.size
      }));

      return fileUrl;
    } catch (error) {
      logger.error(this.logContext('Error uploading file', {
        error: error.message,
        filename: file.originalname,
        stack: error.stack
      }));
      throw new Error(`Error uploading file to Backblaze: ${error.message}`);
    }
  }

  async deleteFile(fileUrl: string): Promise<void> {
    try {
      logger.info(this.logContext('Attempting to delete file', { fileUrl }));
      
      await this.init();
      const fileName = fileUrl.split('/').pop();
      
      // Conseguir el fileId primero
      const { data: { files } } = await this.b2.listFileNames({
        bucketId: this.bucketId,
        startFileName: fileName,
        maxFileCount: 1,
      });

      if (files.length > 0) {
        await this.b2.deleteFileVersion({
          fileId: files[0].fileId,
          fileName: files[0].fileName,
        });
        logger.info(this.logContext('File deleted successfully', { fileUrl }));
      } else {
        logger.warn(this.logContext('File not found for deletion', { fileUrl }));
      }
    } catch (error) {
      logger.error(this.logContext('Error deleting file', {
        error: error.message,
        fileUrl,
        stack: error.stack
      }));
      throw new Error(`Error deleting file from Backblaze: ${error.message}`);
    }
  }
}
