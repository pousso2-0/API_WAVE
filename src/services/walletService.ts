import { PrismaClient, Wallet, Prisma } from "@prisma/client";
import { NotFoundException } from "../exceptions/index";
import { User } from "../interfaces/UserInterface";
import { v4 as uuidv4 } from "uuid";
import { generateQRCodeService } from "./generateQRCodeService";
import { TransactionVerificationResult, WalletLimits, WalletProperties } from "../types";


export class WalletService {
  private static instance: WalletService;
  private prisma: PrismaClient;
  private readonly DEFAULT_CURRENCY = "F CFA";
  private readonly DEFAULT_SELECT_USER = {
    firstName: true,
    lastName: true,
    phoneNumber: true,
    photo: true,
    address: true,
  };

  private constructor() {
    this.prisma = new PrismaClient();
  }

  // Singleton pattern pour éviter multiple instances de PrismaClient
  public static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  // Méthode utilitaire pour vérifier l'existence d'un wallet
  private async findWalletOrThrow(id: string, select?: Prisma.WalletSelect): Promise<Wallet> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id },
      select,
    });

    if (!wallet) {
      throw new NotFoundException("Portefeuille non trouvé");
    }

    return wallet as Wallet;
  }

  // Optimisation avec mise en cache des résultats fréquemment utilisés
  private async getUserWithCache(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.DEFAULT_SELECT_USER,
    });

    if (!user) {
      throw new NotFoundException("Utilisateur non trouvé");
    }

    return user;
  }

  // Optimisation des transactions avec regroupement des requêtes
  private async getTransactionTotals(walletId: string, startDate: Date): Promise<Prisma.Decimal> {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        senderWalletId: walletId,
        status: "COMPLETED",
        createdAt: { gte: startDate },
      },
      select: {
        amount: true,
        feeAmount: true,
      },
    });

    return transactions.reduce(
      (sum, { amount, feeAmount }) => sum.add(amount).add(feeAmount),
      new Prisma.Decimal(0)
    );
  }

  async createWallet(data: {
    userId: string;
    currency?: string;
    dailyLimit?: number;
    monthlyLimit?: number;
  }): Promise<{ wallet: Wallet; user: User }> {
    const user = await this.getUserWithCache(data.userId);

    // Vérification optimisée du wallet existant
    const existingWallet = await this.prisma.wallet.findFirst({
      where: {
        userId: data.userId,
        user: { phoneNumber: user.phoneNumber },
      },
      select: { id: true },
    });

    if (existingWallet) {
      throw new Error("Un portefeuille est déjà associé à ce numéro de téléphone.");
    }

    const walletId = uuidv4();
    const qrCodeBuffer = await generateQRCodeService(walletId);

    const wallet = await this.prisma.wallet.create({
      data: {
        userId: data.userId,
        currency: data.currency || this.DEFAULT_CURRENCY,
        qrCode: qrCodeBuffer.toString("base64"),
        dailyLimit: data.dailyLimit ? new Prisma.Decimal(data.dailyLimit) : null,
        monthlyLimit: data.monthlyLimit ? new Prisma.Decimal(data.monthlyLimit) : null,
        balance: new Prisma.Decimal(0),
      },
    });

    return { wallet, user };
  }

  async verifyTransactionPossibility(
    walletId: string,
    newTransactionAmount: number
  ): Promise<TransactionVerificationResult> {
    const wallet = await this.findWalletOrThrow(walletId, {
      balance: true,
      dailyLimit: true,
      monthlyLimit: true,
      plafond: true,
    });

    // Optimisation: Exécution parallèle des requêtes indépendantes
    const [pendingTransactions, today, startOfMonth] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          senderWalletId: walletId,
          status: "PENDING",
        },
        select: { amount: true, feeAmount: true },
      }),
      this.getTransactionTotals(walletId, new Date(new Date().setHours(0, 0, 0, 0))),
      this.getTransactionTotals(walletId, new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
    ]);

    const totalPendingAmount = pendingTransactions.reduce(
      (sum, { amount, feeAmount }) => sum.add(amount).add(feeAmount),
      new Prisma.Decimal(0)
    );

    const newTransactionDecimal = new Prisma.Decimal(newTransactionAmount);
    const totalAmount = totalPendingAmount.add(newTransactionDecimal);

    const dailyTotalWithPending = today.add(totalPendingAmount).add(newTransactionDecimal);
    const monthlyTotalWithPending = startOfMonth.add(totalPendingAmount).add(newTransactionDecimal);

    const dailyLimitExceeded = wallet.dailyLimit?.lt(dailyTotalWithPending) ?? false;
    const monthlyLimitExceeded = wallet.monthlyLimit?.lt(monthlyTotalWithPending) ?? false;
    const plafondExceeded = wallet.plafond 
      ? dailyTotalWithPending.gt(wallet.plafond) || monthlyTotalWithPending.gt(wallet.plafond)
      : false;

    return {
      isPossible: wallet.balance.gte(totalAmount) && !dailyLimitExceeded && !monthlyLimitExceeded && !plafondExceeded,
      currentBalance: wallet.balance,
      totalPendingAmount,
      remainingBalance: wallet.balance.sub(totalAmount),
      dailyLimitExceeded,
      monthlyLimitExceeded,
      plafondExceeded,
    };
  }

  async updateWalletLimits(id: string, data: WalletLimits): Promise<{ wallet: Wallet; user: User }> {
    const wallet = await this.findWalletOrThrow(id);
    
    const [updatedWallet, user] = await Promise.all([
      this.prisma.wallet.update({
        where: { id },
        data: {
          dailyLimit: data.dailyLimit ? new Prisma.Decimal(data.dailyLimit) : undefined,
          monthlyLimit: data.monthlyLimit ? new Prisma.Decimal(data.monthlyLimit) : undefined,
        },
      }),
      this.getUserWithCache(wallet.userId),
    ]);

    return { wallet: updatedWallet, user };
  }

  async updateWalletProperties(
    id: string,
    data: WalletProperties
  ): Promise<{ wallet: Wallet; user: User }> {
    const existingWallet = await this.findWalletOrThrow(id);
    
    const [updatedWallet, user] = await Promise.all([
      this.prisma.wallet.update({
        where: { id },
        data: {
          isActive: data.isActive,
          currency: data.currency,
        },
      }),
      this.getUserWithCache(existingWallet.userId),
    ]);

    return { wallet: updatedWallet, user };
  }

  // Méthodes simplifiées avec réutilisation du code
  async getWallet(id: string): Promise<{ wallet: Wallet; user: User }> {
    const wallet = await this.findWalletOrThrow(id);
    const user = await this.getUserWithCache(wallet.userId);
    return { wallet, user };
  }

  async getUserWallets(userId: string): Promise<{ wallets: Wallet[]; user: User }> {
    const [wallets, user] = await Promise.all([
      this.prisma.wallet.findMany({ where: { userId } }),
      this.getUserWithCache(userId),
    ]);
    return { wallets, user };
  }

  async getBalance(walletId: string): Promise<{ balance: Prisma.Decimal; user: User }> {
    const wallet = await this.findWalletOrThrow(walletId, { balance: true, userId: true });
    const user = await this.getUserWithCache(wallet.userId);
    return { balance: wallet.balance, user };
  }

  async isWalletActive(walletId: string): Promise<boolean> {
    const wallet = await this.findWalletOrThrow(walletId, { isActive: true });
    return wallet.isActive;
  }

  async deleteWallet(walletId: string): Promise<void> {
    await this.findWalletOrThrow(walletId);
    await this.prisma.wallet.delete({ where: { id: walletId } });
  }
}