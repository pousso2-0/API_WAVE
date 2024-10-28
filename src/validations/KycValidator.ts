import { KycStatus } from "../enums/KycStatus";
import { DocumentType } from "../enums/DocumentType";
import prisma from "../config/prisma";

 export default new class KycValidator {

  async verifyDocument(documentType: DocumentType, documentNumber: string, userId: string): Promise<void> {
    this.validateDocumentType(documentType);
    this.validateDocumentNumber(documentType,documentNumber);

    // this.validateDocumentNumber(documentType, documentNumber);
  }

  private validateDocumentType(documentType: DocumentType) {
    const acceptedDocumentTypes = [DocumentType.CARTE_IDENTITE, DocumentType.PASSEPORT];
    if (!acceptedDocumentTypes.includes(documentType)) {
      throw new Error("Le type de document n'est pas accepté. Seuls les documents Carte d'identité ou Passeport sont valides.");
    }
  }

  private validateDocumentNumber(documentType: DocumentType, documentNumber: string) {
    if (documentType === DocumentType.CARTE_IDENTITE && !/^\d{17}$/.test(documentNumber)) {
      throw new Error("Numéro de carte d'identité non valide. Il doit comporter 17 chiffres.");
    }

    if (documentType === DocumentType.PASSEPORT && !/^[A-Z0-9]{8,9}$/.test(documentNumber)) {
      throw new Error("Numéro de passeport non valide.");
    }
  }
}
