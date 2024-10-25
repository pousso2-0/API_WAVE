import { PrismaClient, Wallet, Prisma } from "@prisma/client";
import { NotFoundException } from "../exceptions/index";
import { User } from "../interfaces/UserInterface";
import { v4 as uuidv4 } from "uuid";
import { generateQRCodeService } from "./generateQRCodeService";

export class WalletService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        phoneNumber: true,
        photo: true,
        address: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async createWallet(data: {
    userId: string;
    currency?: string; // Rendre currency optionnel
    dailyLimit?: number;
    monthlyLimit?: number;
  }): Promise<{ wallet: Wallet; user: User }> {
    const user = await this.getUserById(data.userId);

    // Vérifiez si l'utilisateur a déjà un portefeuille associé à son numéro de téléphone
    const existingWallet = await this.prisma.wallet.findFirst({
      where: {
        userId: data.userId,
        user: {
          phoneNumber: user.phoneNumber,
        },
      },
    });

    if (existingWallet) {
      throw new Error(
        "Un portefeuille est déjà associé à ce numéro de téléphone."
      );
    }

    const walletId = uuidv4();
    const qrCodeBuffer = await generateQRCodeService(walletId);
    const qrCode = qrCodeBuffer.toString("base64");

    const wallet = await this.prisma.wallet.create({
      data: {
        userId: data.userId,
        currency: data.currency || "F CFA",
        qrCode,
        dailyLimit: data.dailyLimit
          ? new Prisma.Decimal(data.dailyLimit)
          : null,
        monthlyLimit: data.monthlyLimit
          ? new Prisma.Decimal(data.monthlyLimit)
          : null,
        balance: new Prisma.Decimal(0),
      },
    });

    return { wallet, user };
  }

  async getWallet(id: string): Promise<{ wallet: Wallet; user: User }> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id },
    });

    if (!wallet) {
      throw new NotFoundException("Wallet not found");
    }

    const user = await this.getUserById(wallet.userId);

    return { wallet, user };
  }

  async getUserWallets(
    userId: string
  ): Promise<{ wallets: Wallet[]; user: User }> {
    const user = await this.getUserById(userId);
    const wallets = await this.prisma.wallet.findMany({
      where: { userId },
    });

    return { wallets, user };
  }

  async updateWalletLimits(
    id: string,
    data: {
      dailyLimit?: number;
      monthlyLimit?: number;
    }
  ): Promise<{ wallet: Wallet; user: User }> {
    const wallet = await this.getWallet(id);

    const updatedWallet = await this.prisma.wallet.update({
      where: { id },
      data: {
        dailyLimit: data.dailyLimit
          ? new Prisma.Decimal(data.dailyLimit)
          : undefined,
        monthlyLimit: data.monthlyLimit
          ? new Prisma.Decimal(data.monthlyLimit)
          : undefined,
      },
    });

    const user = await this.getUserById(wallet.wallet.userId);

    return { wallet: updatedWallet, user };
  }

  async getBalance(
    walletId: string
  ): Promise<{ balance: Prisma.Decimal; user: User }> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      select: { balance: true, userId: true },
    });

    if (!wallet) {
      throw new NotFoundException("Portefeuille non trouvé");
    }

    const user = await this.getUserById(wallet.userId);

    return { balance: wallet.balance, user };
  }

  async updateWalletProperties(
    id: string,
    data: {
      isActive?: boolean;
      currency?: string;
    }
  ): Promise<{ wallet: Wallet; user: User }> {
    const existingWallet = await this.getWallet(id);

    const updatedWallet = await this.prisma.wallet.update({
      where: { id },
      data: {
        isActive: data.isActive !== undefined ? data.isActive : undefined,
        currency: data.currency || undefined,
      },
    });

    const user = await this.getUserById(existingWallet.wallet.userId);

    return { wallet: updatedWallet, user };
  }

  async isWalletActive(walletId: string): Promise<boolean> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      select: { isActive: true },
    });

    if (!wallet) {
      throw new NotFoundException("Portefeuille non trouvé");
    }

    return wallet.isActive;
  }

  async deleteWallet(walletId: string): Promise<void> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new NotFoundException("Portefeuille non trouvé");
    }

    await this.prisma.wallet.delete({
      where: { id: walletId },
    });
  }
}
