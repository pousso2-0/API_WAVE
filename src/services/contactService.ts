import { PrismaClient, Contact } from "@prisma/client";


class ContactService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

   async createContactByPhone(data: {
    userId: string;
    phoneNumber: string;
    nickname?: string;
  }): Promise<Contact> {
    // First, find the user with the given phone number
    const contactUser = await this.prisma.user.findUnique({
      where: { phoneNumber: data.phoneNumber }
    });

    if (!contactUser) {
      throw new Error("Utilisateur avec ce numéro de téléphone non trouvé");
    }

    // Check if contact already exists
    const existingContact = await this.prisma.contact.findFirst({
      where: {
        userId: data.userId,
        contactId: contactUser.id
      }
    });

    if (existingContact) {
      throw new Error("Ce contact existe déjà");
    }

    // Create the contact
    return this.prisma.contact.create({
      data: {
        userId: data.userId,
        contactId: contactUser.id,
        nickname: data.nickname
      },
      select: {
        id: true,
        userId: true,
        contactId: true,
        nickname: true,
        createdAt: true,
        updatedAt: true,
        contact: {
          select: {
            phoneNumber: true,
            firstName: true,
            lastName: true,
            photo: true
          }
        }
      }
    });
  }

  async getContactsByUserId(userId: string): Promise<Contact[]> {
    return this.prisma.contact.findMany({
      where: { userId },
      select: {
        id: true,
        userId: true,
        contactId: true,
        nickname: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async getImportedGoogleContacts(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        googleAccessToken: true
      }
    });

    const contacts = await this.prisma.contact.findMany({
      where: { 
        userId,
        user: {
          googleAccessToken: {
            not: null
          }
        }
      },
      include: {
        contact: {
          select: {
            id: true,
            email: true,
            phoneNumber: true,
            firstName: true,
            lastName: true,
            photo: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      hasGoogleAuth: !!user?.googleAccessToken,
      contacts
    };
  }

  async updateContact(
    id: string,
    userId: string,
    data: { nickname?: string }
  ): Promise<Contact> {
    return this.prisma.contact.update({
      where: { id },
      data,
      select: {
        id: true,
        userId: true,
        contactId: true,
        nickname: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  async deleteContact(id: string, userId: string): Promise<void> {
    await this.prisma.contact.delete({
      where: { id }
    });
  }
}

export default ContactService;