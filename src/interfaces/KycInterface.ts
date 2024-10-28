import { DocumentType } from "../enums/DocumentType";
import { KycStatus } from "../enums/KycStatus";
import { UserInterface } from "./UserInterface";

export interface KycInterface {
    id: string;
    userId: string;
    documentType: DocumentType;
    documentNumber?: string;
    verificationStatus: KycStatus;
    verifiedAt?: Date;
    verificationMethod?: string;
    rejectionReason?: string;
    user?: UserInterface;
}
