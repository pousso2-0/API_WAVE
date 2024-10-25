// src/controllers/NotificationController.ts

import { Request, Response } from "express";
import NotificationService from "../services/notificationService";

class NotificationController {
  async notifySignUpWithConfirmationCode(req: Request, res: Response) {
    try {
      const { userId, code } = req.body;
      await NotificationService.notifySignUpWithConfirmationCode(userId, code);
      res.status(200).json({ message: "Notification de confirmation envoyée" });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async notifySendMoneyToContact(req: Request, res: Response) {
    try {
      const { idSender, idReceiver, amount, balanceSender, balanceReceiver } = req.body;
      await NotificationService.notifySendMoneyToContact(
        idSender,
        idReceiver,
        amount,
        balanceSender,
        balanceReceiver
      );
      res.status(200).json({ message: "Notification de transaction envoyée" });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async notifyDepositAtAgency(req: Request, res: Response) {
    try {
      const { userId, amount, currentBalance, agencyName } = req.body;
      await NotificationService.notifyDepositAtAgency(userId, amount, currentBalance, agencyName);
      res.status(200).json({ message: "Notification de dépôt envoyée" });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async notifyWithdrawFromAgency(req: Request, res: Response) {
    try {
      const { userId, amount, currentBalance, agencyName } = req.body;
      await NotificationService.notifyWithdrawFromAgency(userId, amount, currentBalance, agencyName);
      res.status(200).json({ message: "Notification de retrait envoyée" });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}

export default new NotificationController();
