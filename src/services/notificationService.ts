import { supabase } from '../lib/supabase';

export interface NotificationData {
  userId: string;
  email?: string;
  phone?: string;
  name: string;
  companyName: string;
  queueName: string;
  position?: number;
  estimatedTime?: number;
  type: 'queue_joined' | 'queue_called' | 'position_updated';
}

export class NotificationService {
  // Templates d'email
  private static emailTemplates = {
    queue_joined: {
      subject: '🎯 Vous êtes dans la file d\'attente - {{companyName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">✅ Ajouté à la file d'attente</h2>
          <p>Bonjour <strong>{{name}}</strong>,</p>
          <p>Vous êtes maintenant en position <strong style="color: #dc2626;">{{position}}</strong> 
          dans la file "{{queueName}}" chez {{companyName}}.</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>⏱️ Temps d'attente estimé : {{estimatedTime}} minutes</strong></p>
          </div>
          <p>Nous vous notifierons dès que ce sera votre tour !</p>
          <p style="color: #6b7280; font-size: 14px;">
            Merci d'utiliser SkipLine - L'avenir des files d'attente
          </p>
        </div>
      `
    },
    queue_called: {
      subject: '🚀 C\'est votre tour ! - {{companyName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">🎯 Votre tour est arrivé !</h2>
          <p>Bonjour <strong>{{name}}</strong>,</p>
          <div style="background: #dcfce7; border-left: 4px solid #059669; padding: 15px; margin: 20px 0;">
            <p><strong>Vous êtes appelé(e) pour la file "{{queueName}}" chez {{companyName}} !</strong></p>
            <p style="font-size: 18px; color: #059669;"><strong>📍 Présentez-vous maintenant au comptoir !</strong></p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            SkipLine - Fini l'attente, place à l'efficacité !
          </p>
        </div>
      `
    },
    position_updated: {
      subject: '📊 Mise à jour de votre position - {{companyName}}',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">📊 Mise à jour de votre file</h2>
          <p>Bonjour <strong>{{name}}</strong>,</p>
          <p>Mise à jour pour la file "{{queueName}}" chez {{companyName}} :</p>
          <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📍 Nouvelle position : {{position}}</strong></p>
            <p><strong>⏱️ Temps d'attente estimé : {{estimatedTime}} minutes</strong></p>
          </div>
        </div>
      `
    }
  };

  // Templates SMS
  private static smsTemplates = {
    queue_joined: '🎯 SkipLine: Vous êtes en position {{position}} chez {{companyName}}. Temps estimé: {{estimatedTime}}min. Nous vous préviendrons !',
    queue_called: '🚀 SkipLine: C\'est votre tour chez {{companyName}} ! Présentez-vous au comptoir maintenant.',
    position_updated: '📊 SkipLine: Nouvelle position {{position}} chez {{companyName}}. Temps estimé: {{estimatedTime}}min.'
  };

  // Remplacer les variables dans le template
  private static replaceTemplate(template: string, data: NotificationData): string {
    return template
      .replace(/{{name}}/g, data.name)
      .replace(/{{companyName}}/g, data.companyName)
      .replace(/{{queueName}}/g, data.queueName)
      .replace(/{{position}}/g, data.position?.toString() || '')
      .replace(/{{estimatedTime}}/g, data.estimatedTime?.toString() || '');
  }

  // Envoyer notification email
  static async sendEmail(data: NotificationData): Promise<boolean> {
    if (!data.email) return false;

    try {
      const template = this.emailTemplates[data.type];
      if (!template) {
        console.error('Template email non trouvé:', data.type);
        return false;
      }

      const subject = this.replaceTemplate(template.subject, data);
      const html = this.replaceTemplate(template.html, data);

      // Utiliser Supabase Edge Function
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: data.email,
          subject,
          html,
          from: 'noreply@skipline.app'
        }
      });

      if (error) {
        console.error('Erreur envoi email:', error);
        return false;
      }

      console.log('✅ Email envoyé:', data.email, data.type);
      return true;
    } catch (error) {
      console.error('Erreur service email:', error);
      return false;
    }
  }

  // Envoyer notification SMS
  static async sendSMS(data: NotificationData): Promise<boolean> {
    if (!data.phone) return false;

    try {
      const template = this.smsTemplates[data.type];
      if (!template) {
        console.error('Template SMS non trouvé:', data.type);
        return false;
      }

      const message = this.replaceTemplate(template, data);

      // Utiliser Supabase Edge Function
      const { error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: data.phone,
          message,
          from: 'SkipLine'
        }
      });

      if (error) {
        console.error('Erreur envoi SMS:', error);
        return false;
      }

      console.log('✅ SMS envoyé:', data.phone, data.type);
      return true;
    } catch (error) {
      console.error('Erreur service SMS:', error);
      return false;
    }
  }

  // Envoyer notification complète (email + SMS)
  static async sendNotification(data: NotificationData): Promise<{email: boolean, sms: boolean}> {
    const results = {
      email: false,
      sms: false
    };

    // Récupérer les préférences utilisateur depuis la DB
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('email_notifications, sms_notifications, phone')
      .eq('id', data.userId)
      .single();

    if (error) {
      console.error('Erreur récupération profil:', error);
      return results;
    }

    // Envoyer email si activé
    if (profile?.email_notifications && data.email) {
      results.email = await this.sendEmail(data);
    }

    // Envoyer SMS si activé
    if (profile?.sms_notifications && (data.phone || profile?.phone)) {
      data.phone = data.phone || profile.phone;
      results.sms = await this.sendSMS(data);
    }

    return results;
  }

  // Notification lors de l'ajout à une file
  static async notifyQueueJoined(
    userId: string, 
    email: string, 
    name: string, 
    companyName: string, 
    queueName: string, 
    position: number, 
    estimatedTime: number,
    phone?: string
  ) {
    return this.sendNotification({
      userId,
      email,
      phone,
      name,
      companyName,
      queueName,
      position,
      estimatedTime,
      type: 'queue_joined'
    });
  }

  // Notification quand c'est le tour du client
  static async notifyQueueCalled(
    userId: string, 
    email: string, 
    name: string, 
    companyName: string, 
    queueName: string,
    phone?: string
  ) {
    return this.sendNotification({
      userId,
      email,
      phone,
      name,
      companyName,
      queueName,
      type: 'queue_called'
    });
  }

  // Notification mise à jour position
  static async notifyPositionUpdated(
    userId: string, 
    email: string, 
    name: string, 
    companyName: string, 
    queueName: string, 
    position: number, 
    estimatedTime: number,
    phone?: string
  ) {
    return this.sendNotification({
      userId,
      email,
      phone,
      name,
      companyName,
      queueName,
      position,
      estimatedTime,
      type: 'position_updated'
    });
  }
}
