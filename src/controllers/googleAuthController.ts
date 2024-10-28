import { Request, Response } from "express";
import Controller from "./controller";
import GoogleAuthService from "../services/googleAuthService";

class GoogleAuthController extends Controller {
  private googleAuthService: GoogleAuthService;

  constructor() {
    super();
    this.googleAuthService = new GoogleAuthService();
  }

  async getAuthUrl(req: Request, res: Response): Promise<void> {
    await this.trycatch(async () => {
      const url = this.googleAuthService.generateAuthUrl();
      res.status(200).json({
        message: "URL d'authentification Google générée",
        error: null,
        data: { url }
      });
    }, res);
  }

  async handleCallback(req: Request, res: Response): Promise<void> {
    await this.trycatch(async () => {
      const { code } = req.query;
      
      if (!code || typeof code !== 'string') {
        return res.status(400).json({
          message: "Code d'autorisation manquant",
          error: null,
          data: null
        });
      }

      const user = await this.googleAuthService.handleCallback(code);
      res.status(200).json({
        message: "Authentification Google réussie",
        error: null,
        data: user
      });
    }, res);
  }

//   async importContacts(req: Request, res: Response): Promise<void> {
//     const request = req as any;
//     await this.trycatch(async () => {
//       const userId = request.user?.userId;
      
//       if (!userId) {
//         return res.status(401).json({
//           message: "Non autorisé",
//           error: null,
//           data: null
//         });
//       }

//       await this.googleAuthService.importGoogleContacts(userId);
//       res.status(200).json({
//         message: "Contacts importés avec succès",
//         error: null,
//         data: null
//       });
//     }, res);
//   }
async importContacts(req: Request, res: Response): Promise<void> {
    const request = req as any;
    await this.trycatch(async () => {
      const userId = request.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          message: "Non autorisé",
          error: null,
          data: null
        });
      }
  
      const stats = await this.googleAuthService.importGoogleContacts(userId);
      res.status(200).json({
        message: "Import des contacts terminé",
        error: null,
        data: {
          stats,
          summary: `Sur ${stats.totalContacts} contacts, ${stats.contactsWithEmail} avaient un email, ${stats.matchedUsers} correspondent à des utilisateurs de l'application, ${stats.importedContacts} ont été importés et ${stats.existingContacts} existaient déjà.`
        }
      });
    }, res);
  }

}

export default new GoogleAuthController();