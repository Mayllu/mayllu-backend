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
  private downloadUrl: string;

  constructor(private configService: ConfigService) {
    this.b2 = new B2({
      applicationKeyId: this.configService.get<string>('B2_APPLICATION_KEY_ID'),
      applicationKey: this.configService.get<string>('B2_APPLICATION_KEY'),
    });
    this.bucketId = this.configService.get<string>('B2_BUCKET_ID');
    this.bucketName = this.configService.get<string>('B2_BUCKET_NAME');
    // Usar el endpoint correcto para descargas públicas
    this.downloadUrl = `https://f005.backblazeb2.com/file/${this.bucketName}`;
  }

  async init() {
    try {
      const auth = await this.b2.authorize();
      // Guardar la URL de descarga del autorización si está disponible
      if (auth?.data?.downloadUrl) {
        this.downloadUrl = auth.data.downloadUrl + '/file/' + this.bucketName;
      }
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

      console.log('Upload URL data:', uploadUrl);

      const fileName = `complaints/${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
      const uploadResult = await this.b2.uploadFile({
        uploadUrl: uploadUrl.uploadUrl,
        uploadAuthToken: uploadUrl.authorizationToken,
        fileName: fileName,
        data: file.buffer,
        contentLength: file.size,
        contentType: file.mimetype,
      });

      console.log('Upload result:', uploadResult);

      const fileUrl = `${this.downloadUrl}/${fileName}`;
      console.log('Generated public URL:', fileUrl);

      return fileUrl;
    } catch (error) {
      console.error('Detailed error:', error);
      throw new Error(`Error uploading file to Backblaze: ${error.message}`);
    }
  }
}
