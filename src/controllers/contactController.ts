import { Request, Response } from "express";
import Controller from "./controller";
import ContactService from "../services/contactService";
import { IRequestAuth } from "../interfaces/AuthInterface";

class ContactController extends Controller {
  private contactService: ContactService;

  constructor() {
    super();
    this.contactService = new ContactService();
  }

  async addContact(req: Request, res: Response): Promise<void> {
    const request = req as IRequestAuth;
    await this.trycatch(async () => {
      const { contactId, nickname } = request.body;
      const userId = request.user?.userId;

      if (!userId || !contactId) {
        return res.status(400).json({
          message: "Données manquantes",
          error: null,
          data: null
        });
      }

      const contact = await this.contactService.createContact({
        userId,
        contactId,
        nickname
      });

      res.status(201).json({
        message: "Contact ajouté avec succès",
        error: null,
        data: contact
      });
    }, res);
  }

  async getContacts(req: Request, res: Response): Promise<void> {
    const request = req as IRequestAuth;
    await this.trycatch(async () => {
      const userId = request.user?.userId;

      if (!userId) {
        return res.status(401).json({
          message: "Non autorisé",
          error: null,
          data: null
        });
      }

      const contacts = await this.contactService.getContactsByUserId(userId);
      res.status(200).json({
        message: "Contacts récupérés avec succès",
        error: null,
        data: contacts
      });
    }, res);
  }

  async getGoogleContacts(req: Request, res: Response): Promise<void> {
    const request = req as IRequestAuth;
    await this.trycatch(async () => {
      const userId = request.user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          message: "Non autorisé",
          error: null,
          data: null
        });
      }

      const result = await this.contactService.getImportedGoogleContacts(userId);
      
      res.status(200).json({
        message: "Contacts Google récupérés avec succès",
        error: null,
        data: {
          hasGoogleAuth: result.hasGoogleAuth,
          contacts: result.contacts,
          totalContacts: result.contacts.length
        }
      });
    }, res);
  }

  async updateContact(req: Request, res: Response): Promise<void> {
    const request = req as IRequestAuth;
    await this.trycatch(async () => {
      const { id } = request.params;
      const { nickname } = request.body;
      const userId = request.user?.userId;

      if (!userId) {
        return res.status(401).json({
          message: "Non autorisé",
          error: null,
          data: null
        });
      }

      const updatedContact = await this.contactService.updateContact(id, userId, { nickname });
      res.status(200).json({
        message: "Contact mis à jour avec succès",
        error: null,
        data: updatedContact
      });
    }, res);
  }

  async deleteContact(req: Request, res: Response): Promise<void> {
    const request = req as IRequestAuth;
    await this.trycatch(async () => {
      const { id } = request.params;
      const userId = request.user?.userId;

      if (!userId) {
        return res.status(401).json({
          message: "Non autorisé",
          error: null,
          data: null
        });
      }

      await this.contactService.deleteContact(id, userId);
      res.status(200).json({
        message: "Contact supprimé avec succès",
        error: null,
        data: null
      });
    }, res);
  }
}

export default new ContactController();
