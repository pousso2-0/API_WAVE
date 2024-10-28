import prisma from "../config/prisma";
import { NotificationType } from "../enums/NotificationType";
import { io } from "../app";
import { createSMSProvider } from "../providers/SMSProviderFactory";

class NotificationService {
  private smsProvider = createSMSProvider();

  private async sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    content: string
  ) {
    const user = await this.userExist(userId);
    const phoneNumber = user.phoneNumber;

    try {
      await this.smsProvider.sendSMS(phoneNumber, content);

      await prisma.notification.create({
        data: {
          userId,
          type,
          title,
          content,
          isRead: false,
          priority: "NORMAL",
        },
      });
      console.log(
        `Notification envoyée et enregistrée pour l'utilisateur ${userId}: ${content}`
      );

      io.to(userId).emit("newNotification", { title, content });
    } catch (error) {
      console.error(
        `Échec de l'envoi de la notification: ${(error as Error).message}`
      );
      throw new Error("La notification n'a pas pu être envoyée");
    }
  }

  async notifySignUpWithConfirmationCode(userId: string, code: string) {
    await this.userExist(userId);
    const content = `Veuillez acceder a votre compte Wave avec le code ${code} ne le partager avec personne`;
    await this.sendNotification(
      userId,
      NotificationType.INFO,
      "Confirmation d'inscription avec WAVE",
      content
    );
  }

  async notifySendMoneyToContact(
    idSender: string,
    idReceiver: string,
    amount: number,
    balanceSender: number,
    balanceReceiver: number,
    idTransaction: number
  ) {
    const sender = await this.userExist(idSender);
    const receiver = await this.userExist(idReceiver);
    const totalBalanceSender = balanceSender - amount;
    const totalBalanceReceiver = balanceReceiver + amount;

    const contentSender = `Vous avez envoyé ${amount}F à ${receiver.firstName} ${receiver.lastName}. Nouveau solde: ${totalBalanceSender} +infos: 200600 Avec WDF ${idTransaction}`;
    await this.sendNotification(
      idSender,
      NotificationType.INFO,
      "Transaction envoyée",
      contentSender
    );

    const contentReceiver = ` Vous avez reÇu  ${amount}F De ${sender.firstName} ${sender.lastName} (${receiver.phoneNumber}) Nouveau solde: ${totalBalanceReceiver}F +infos: 200600 Avec WDF ${idTransaction}`;
    await this.sendNotification(
      idReceiver,
      NotificationType.INFO,
      "Transaction reçue",
      contentReceiver
    );

    console.log(
      `Transaction réussie : ${amount} transféré de ${sender.firstName} à ${receiver.firstName}`
    );
  }

  async notifyDepositAtAgency(
    userId: string,
    amount: number,
    currentBalance: number,
    agencyName: string,
    idTransaction: number
  ) {
    const user = await this.userExist(userId);
    const updatedBalance = currentBalance + amount;

    const content = `Vous avez déposé ${amount} à ${agencyName}. Nouveau solde : ${updatedBalance}F +infos: 200600 Avec WDF ${idTransaction}`;
    await this.sendNotification(
      userId,
      NotificationType.INFO,
      "Dépôt d'argent",
      content
    );

    console.log(
      `Notification de dépôt envoyée à ${user.firstName} ${user.lastName} pour un dépôt de ${amount}F à ${agencyName}`
    );
  }

  async notifyWithdrawFromAgency(
    userId: string,
    amount: number,
    currentBalance: number,
    agencyName: string,
    idTransaction: number
  ) {
    const user = await this.userExist(userId);
    const updatedBalance = currentBalance - amount;
    const content = `Vous avez retiré ${amount}F à ${agencyName}. Nouveau solde : ${updatedBalance}F +infos: 200600 Avec WDF ${idTransaction}`;
    await this.sendNotification(
      userId,
      NotificationType.INFO,
      "Retrait d'argent",
      content
    );

    console.log(
      `Notification de retrait envoyée à ${user.firstName} ${user.lastName} pour un retrait de ${amount} à ${agencyName}`
    );
  }

  private async userExist(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error(`Aucun utilisateur trouvé avec l'ID : ${userId}`);
    }
    return user;
  }
}

export default new NotificationService();
