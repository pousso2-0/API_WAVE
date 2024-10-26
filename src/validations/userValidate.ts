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

// Type inféré du schéma pour l'utilisation dans le code
export type CreateUserWithKyc = z.infer<typeof createUserWithKycSchema>;

// Schéma de validation pour la vérification de l'OTP
export const verifyOtpSchema = z.object({
    userId: z.string().uuid({ message: "ID utilisateur invalide" }),
    otp: z.number().min(100000, { message: "Code OTP incorrect" }).max(999999, { message: "Code OTP incorrect" }),
});

// Schéma de validation pour la connexion
export const loginSchema = z.object({
    phoneNumber: z.string().regex(/^(221)(77|78|76|75)[ ]?\d{7}$/, { message: "Numéro de téléphone invalide" }),
    password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

// Schéma de validation pour la réinitialisation du mot de passe via OTP
export const resetPasswordSchema = z.object({
    phoneNumber: z.string().regex(/^(221)(77|78|76|75)[ ]?\d{7}$/, { message: "Numéro de téléphone invalide" }),
    otp: z.number().min(100000, { message: "Code OTP incorrect" }).max(999999, { message: "Code OTP incorrect" }),
    newPassword:  z.string().length(4, "Le mot de passe doit contenir exactement 4 caractères"),
});

// Schéma de validation pour la génération d'un OTP pour réinitialiser le mot de passe
export const generateResetOtpSchema = z.object({
    phoneNumber: z.string().regex(/^(221)(77|78|76|75)[ ]?\d{7}$/, { message: "Numéro de téléphone invalide" }),
});
