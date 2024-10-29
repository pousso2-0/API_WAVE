import { z } from "zod";

// Définition du schéma Zod pour la création de transaction
const transactionSchema = z.object({
    senderWalletId: z.string(),
    amount: z.number().positive("Le montant doit être supérieur à zéro"),
    currency: z.string().min(3, "La devise doit être un code de 3 caractères minimum").optional().default("FCFA"),
    description: z.string().optional(),
    receiverWalletId: z.string()
});

export { transactionSchema };
