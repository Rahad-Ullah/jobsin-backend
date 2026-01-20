import speakeasy, { GeneratedSecret } from 'speakeasy';
import QRCode from 'qrcode';
import { User } from '../user/user.model';

interface TOTPService {
  verifyToken(userId: string, userOtp: string): Promise<boolean>;
  generateQRCode(userId: string): Promise<{
    qrcode: string;
    data: GeneratedSecret;
  }>;
}

// Generate & store secret in Redis
async function generateSecret(): Promise<GeneratedSecret> {
  const secretObj = speakeasy.generateSecret({
    name: 'Jobsin App',
    issuer: 'Jobsin',
  });
  return secretObj;
}

// Verify OTP entered by the user
async function verifyToken(userId: string, userOtp: string): Promise<boolean> {
  const user = await User.findById(userId).select('+totpSecret').lean();
  const secret = user?.totpSecret as GeneratedSecret;
  if (!secret?.base32) {
    throw new Error('Secret not found');
  }

  const verified = speakeasy.totp.verify({
    secret: secret.base32,
    encoding: 'base32',
    token: userOtp,
    step: 30,
    window: 1,
  });
  return verified;
}

// Generate QR Code for Google Authenticator
async function generateQRCode(userId: string): Promise<{
  qrcode: string;
  data: GeneratedSecret;
}> {
  // check if user has already the secret
  const user = await User.findById(userId).select('+totpSecret').lean();
  let secretObj;
  if (user?.totpSecret) {
    secretObj = user?.totpSecret as GeneratedSecret;
  } else {
    // if not generate new secret
    secretObj = await generateSecret();
    // save to db
    await User.findByIdAndUpdate(userId, {
      totpSecret: secretObj,
    });
  }
  
  if (!secretObj?.otpauth_url) {
    throw new Error('OTP Auth URL not found');
  }

  const qrCodeData = await QRCode.toDataURL(secretObj.otpauth_url);

  return { qrcode: qrCodeData, data: secretObj };
}

export const TOTPService: TOTPService = {
  verifyToken,
  generateQRCode,
};
