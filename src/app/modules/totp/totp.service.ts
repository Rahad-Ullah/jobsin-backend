import speakeasy, { GeneratedSecret } from 'speakeasy';
import QRCode from 'qrcode';


interface TokenService {
      generateSecret(userId: string): Promise<GeneratedSecret>;
      verifyToken(userId: string, userOtp: string): Promise<boolean>;
      generateQRCode(userId: string): Promise<{
            qrcode: string;
            data: GeneratedSecret;

      }>;
}

const token: TokenService = {
      // Generate & store secret in Redis
      async generateSecret(userId: string): Promise<GeneratedSecret> {
            const secretObj = speakeasy.generateSecret({
                  name: 'CodeNest App',
                  issuer: 'CodeNest',
            });
            return secretObj;
      },



      // Verify OTP entered by the user
      async verifyToken(secret: string, userOtp: string): Promise<boolean> {
            // const secretObj = await this.generateSecret(userId);

            const verified = speakeasy.totp.verify({
                  secret: secret,
                  encoding: 'base32',
                  token: userOtp,
                  step: 30,
                  window: 1,
            });

            console.log('Is Valid:', verified);
            return verified;
      },

      // Generate QR Code for Google Authenticator
      async generateQRCode(userId: string): Promise<{
            qrcode: string;
            data: GeneratedSecret;

      }> {
            const secretObj = await this.generateSecret(userId);

            if (!secretObj.otpauth_url) {
                  throw new Error('OTP Auth URL not found');
            }

            const qrCodeData = await QRCode.toDataURL(secretObj.otpauth_url);

            console.log('QR Code URL:', qrCodeData);
            console.log('Secret Base32:', secretObj.base32);

            return { qrcode: qrCodeData, data: secretObj };
      },
};

export default token;
