// storage.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

  constructor(private configService: ConfigService) {
    this.b2 = new B2({
      applicationKeyId: this.configService.get<string>('B2_APPLICATION_KEY_ID'),
      applicationKey: this.configService.get<string>('B2_APPLICATION_KEY'),
    });
    this.bucketId = this.configService.get<string>('B2_BUCKET_ID');
    this.bucketName = this.configService.get<string>('B2_BUCKET_NAME');
  }

  async init() {
    try {
      await this.b2.authorize();
    } catch (error) {
      console.error('Error authorizing B2:', error);
      throw new Error('Failed to authorize with B2');
    }
  }

  async uploadFile(file: FileUpload): Promise<string> {
    try {
      await this.init();

      const { data: uploadUrl } = await this.b2.getUploadUrl({
        bucketId: this.bucketId,
      });

      const fileName = `complaints/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;

      await this.b2.uploadFile({
        uploadUrl: uploadUrl.uploadUrl,
        uploadAuthToken: uploadUrl.authorizationToken,
        fileName: fileName,
        data: file.buffer,
        contentLength: file.size,
        contentType: file.mimetype,
      });

      return `https://f004.backblazeb2.com/file/${this.bucketName}/${fileName}`;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Error uploading file to Backblaze: ${error.message}`);
    }
  }
}
