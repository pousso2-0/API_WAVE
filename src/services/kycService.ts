import prisma from "../config/prisma";
import { KycStatus } from "../enums/KycStatus";
import cloudinary from "cloudinary";
import KycValidator from "../validations/KycValidator";
import { DocumentType } from "../enums/DocumentType";
import { Readable } from 'stream';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default new class KYCService {
  async saveKYC(
    userId: string,
    documentType: DocumentType,
    documentNumber: string,
    idCardFrontPhoto: Express.Multer.File,
    idCardBackPhoto: Express.Multer.File,
    verificationStatus: KycStatus = KycStatus.PENDING
  ) {
    try {

      const idCardFrontPhotoUrl = await this.uploadPhotoToCloudinary(idCardFrontPhoto);
      const idCardBackPhotoUrl = await this.uploadPhotoToCloudinary(idCardBackPhoto);

      await prisma.kyc.create({
        data: {
          userId,
          documentType,
          documentNumber,
          idCardFrontPhoto: idCardFrontPhotoUrl,
          idCardBackPhoto: idCardBackPhotoUrl,
          verificationStatus,
        },
      });

      console.log("KYC enregistré avec succès avec les photos uploadées sur Cloudinary.");
    } catch (error) {
      console.error(error);
      throw new Error("Problème d'enregistrement du KYC");
    }
  }

  async verifyDocument(documentType: DocumentType, documentNumber: string, userId: string): Promise<void> {
    return KycValidator.verifyDocument(documentType, documentNumber, userId);
  }

  async uploadPhotoToCloudinary(file: Express.Multer.File): Promise<string> {
    try {
      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          { folder: "kyc_documents" },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        stream.pipe(uploadStream);
      });

      return (result as any).secure_url;
    } catch (error) {
      console.error(error);
      throw new Error("Erreur lors de l'upload de la photo sur Cloudinary");
    }
  }
}