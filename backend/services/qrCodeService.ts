import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

export class QRCodeService {
  private static readonly QR_CODE_DIR = path.join(process.cwd(), 'public', 'qr-codes');
  private static readonly BASE_URL = process.env.API_BASE_URL || 'http://10.0.0.82:4000';

  static async ensureDirectoryExists(): Promise<void> {
    if (!fs.existsSync(this.QR_CODE_DIR)) {
      fs.mkdirSync(this.QR_CODE_DIR, { recursive: true });
    }
  }

  static async generateQRCode(address: string, blockchain: string): Promise<string> {
    try {
      await this.ensureDirectoryExists();
      
      // Create a unique filename for the QR code
      const filename = `qr-${blockchain}-${address.slice(-8)}.png`;
      const filePath = path.join(this.QR_CODE_DIR, filename);
      
      // Generate QR code as PNG
      await QRCode.toFile(filePath, address, {
        type: 'png',
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Return the public URL
      return `${this.BASE_URL}/qr-codes/${filename}`;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  static async generateQRCodeDataURL(address: string): Promise<string> {
    try {
      // Generate QR code as data URL
      const dataURL = await QRCode.toDataURL(address, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return dataURL;
    } catch (error) {
      console.error('Error generating QR code data URL:', error);
      throw new Error('Failed to generate QR code data URL');
    }
  }
}
