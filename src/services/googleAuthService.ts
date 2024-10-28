import { google } from 'googleapis';
import { PrismaClient, User } from '@prisma/client';
import { googleConfig } from '../config/googleConfig';

class GoogleAuthService {
  private prisma: PrismaClient;
  private oAuth2Client: any;

  constructor() {
    this.prisma = new PrismaClient();
    this.oAuth2Client = new google.auth.OAuth2(
      googleConfig.clientId,
      googleConfig.clientSecret,
      googleConfig.redirectUri
    );
  }

  generateAuthUrl(): string {
    return this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: googleConfig.scopes,
      prompt: 'consent'
    });
  }

  async handleCallback(code: string): Promise<User> {
    const { tokens } = await this.oAuth2Client.getToken(code);
    this.oAuth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: 'v2', auth: this.oAuth2Client });
    const { data } = await oauth2.userinfo.get();

    if (!data.email) {
      throw new Error('Email non fourni par Google');
    }

    // Vérifier si l'utilisateur existe déjà
    let user = await this.prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Mettre à jour les tokens
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
      }
    });

    return user;
  }

//   async importGoogleContacts(userId: string): Promise<void> {
//     const user = await this.prisma.user.findUnique({
//       where: { id: userId }
//     });

//     if (!user?.googleAccessToken) {
//       throw new Error('Token Google non trouvé');
//     }

//     this.oAuth2Client.setCredentials({
//       access_token: user.googleAccessToken,
//       refresh_token: user.googleRefreshToken
//     });

//     const service = google.people({ version: 'v1', auth: this.oAuth2Client });
    
//     const response = await service.people.connections.list({
//       resourceName: 'people/me',
//       pageSize: 1000,
//       personFields: 'names,emailAddresses,phoneNumbers'
//     });

//     const connections = response.data.connections || [];

//     for (const person of connections) {
//       const email = person.emailAddresses?.[0]?.value;
//       if (email) {  // Ne traite que les contacts avec un email
//         const contactUser = await this.prisma.user.findFirst({
//           where: { 
//             email: email,
//             AND: {
//               NOT: {
//                 id: userId  // Évite d'ajouter l'utilisateur lui-même comme contact
//               }
//             }
//           }
//         });

//         if (contactUser) {
//           // Vérifie si le contact existe déjà
//           const existingContact = await this.prisma.contact.findFirst({
//             where: {
//               userId: user.id,
//               contactId: contactUser.id
//             }
//           });

//           if (!existingContact) {
//             await this.prisma.contact.create({
//               data: {
//                 userId: user.id,
//                 contactId: contactUser.id,
//                 nickname: person.names?.[0]?.displayName || undefined
//               }
//             });
//           }
//         }
//       }
//     }
//   }
async importGoogleContacts(userId: string): Promise<{
    totalContacts: number;
    contactsWithEmail: number;
    matchedUsers: number;
    importedContacts: number;
    existingContacts: number;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user?.googleAccessToken) {
      throw new Error('Token Google non trouvé');
    }

    this.oAuth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken
    });

    const service = google.people({ version: 'v1', auth: this.oAuth2Client });
    
    const response = await service.people.connections.list({
      resourceName: 'people/me',
      pageSize: 1000,
      personFields: 'names,emailAddresses,phoneNumbers'
    });

    const connections = response.data.connections || [];
    let stats = {
      totalContacts: connections.length,
      contactsWithEmail: 0,
      matchedUsers: 0,
      importedContacts: 0,
      existingContacts: 0
    };

    for (const person of connections) {
      const email = person.emailAddresses?.[0]?.value;
      if (email) {
        stats.contactsWithEmail++;
        
        const contactUser = await this.prisma.user.findFirst({
          where: { 
            email: email,
            AND: {
              NOT: {
                id: userId
              }
            }
          }
        });

        if (contactUser) {
          stats.matchedUsers++;
          
          // Vérifie si le contact existe déjà
          const existingContact = await this.prisma.contact.findFirst({
            where: {
              userId: user.id,
              contactId: contactUser.id
            }
          });

          if (!existingContact) {
            await this.prisma.contact.create({
              data: {
                userId: user.id,
                contactId: contactUser.id,
                nickname: person.names?.[0]?.displayName || undefined
              }
            });
            stats.importedContacts++;
          } else {
            stats.existingContacts++;
          }
        }
      }
    }

    return stats;
  }
}

export default GoogleAuthService;