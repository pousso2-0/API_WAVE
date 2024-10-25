import { z } from 'zod';

export const createWalletSchema = z.object({
  userId: z.string().uuid(),
//   dailyLimit: z.number().optional(),
//   monthlyLimit: z.number().optional()
});

export const updateWalletLimitsSchema = z.object({
  dailyLimit: z.number().optional(),
  monthlyLimit: z.number().optional()
});

export const updateWalletPropertiesSchema = z.object({
  isActive: z.boolean().optional(),
  currency: z.string().optional()
});
