import { z } from 'zod';
import { RoleEnum } from "../enums/RoleEnum";
import { KycStatus } from "../enums/KycStatus";

// Schéma de base pour la création d'utilisateur
export const createUserSchema = z.object({
    email: z.string().email({ message: "Email invalide" }),
    phoneNumber: z.string().regex(/^\+221(77|78|76|75)\d{7}$/, { message: "Numéro de téléphone invalide" }),
    password:  z.string().length(4, "Le mot de passe doit contenir exactement 4 caractères"),
    firstName: z.string().min(1, { message: "Le prénom est obligatoire" }),
    lastName: z.string().min(1, { message: "Le nom est obligatoire" }),
    dateOfBirth: z.preprocess((arg) => {
        if (typeof arg === "string" || arg instanceof Date) return new Date(arg);
    }, z.date({ message: "Date de naissance invalide" })),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    role: z.nativeEnum(RoleEnum, { message: "Rôle invalide" }),
});

// Schéma pour les données KYC
export const kycSchema = z.object({
    documentType: z.string().min(1, { message: "Le type de document est obligatoire" }),
    documentNumber: z.string().min(1, { message: "Le numéro de document est obligatoire" }),
    idCardFrontPhoto: z.string().url({ message: "L'URL de la photo recto de la pièce d'identité est invalide" }),
    idCardBackPhoto: z.string().url({ message: "L'URL de la photo verso de la pièce d'identité est invalide" }),
    verificationStatus: z.nativeEnum(KycStatus, { message: "Statut de vérification invalide" }),
    verificationMethod: z.string().optional(),
    rejectionReason: z.string().optional(),
});

// Schéma combiné pour la création d'utilisateur avec KYC par un agent
export const createUserWithKycSchema = createUserSchema.extend({
    kyc: kycSchema.optional()
});
export const updateUserSchema = z.object({
    email: z.string().email().optional(),
    phoneNumber: z.string().optional(),
    password: z.string().min(6).optional(),
    photo: z.string().optional(), // Ajout du champ photo manquant
    currentPassword: z.string().optional(),
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    dateOfBirth: z.date().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    role: z.nativeEnum(RoleEnum).optional(),
    kycStatus: z.nativeEnum(KycStatus).optional(),
    isVerified: z.boolean().optional(),
    isActive: z.boolean().optional(),
}).refine((data) => {
    if (data.password && !data.currentPassword) {
        return false;
    }
    return true;
}, {
    message: "Le mot de passe actuel est requis pour changer le mot de passe",
    path: ["currentPassword"]
});
