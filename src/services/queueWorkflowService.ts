import { supabase } from '../lib/supabase';

export interface AuthenticatedClientJoinResult {
  user_id: string;
  user_name: string;
  position: number;
  queue_name: string;
  company_name: string;
  status: 'waiting';
  entry_method: 'client_scan';
}

export interface BusinessScanResult {
  client_id: string;
  client_name: string;
  client_type: string;
  position: number;
  queue_name: string;
  company_name: string;
  status: 'waiting';
  entry_method: 'business_scan';
}

export interface VisitorJoinResult {
  profile: {
    id: string;
    email?: string;
    phone?: string;
    full_name: string;
    ticket_number?: string;
    qr_code: string;
    contact_method: 'email' | 'phone';
  };
  position: number;
  queue_name: string;
  company_name: string;
  status: 'waiting';
  entry_method: 'visitor_form';
}

export async function authenticatedClientJoinQueue(
  companyCode: string,
  queueId: string
): Promise<AuthenticatedClientJoinResult> {
  try {
    console.log('Client authentifié rejoint file:', { companyCode, queueId });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Vous devez être connecté pour rejoindre une file');
    }

    const { data, error } = await supabase
      .rpc('authenticated_client_join_queue', {
        p_company_code: companyCode,
        p_queue_id: queueId,
        p_user_id: user.id
      });

    if (error) {
      console.error('Erreur client authentifié:', error);
      throw new Error(error.message || 'Erreur lors de inscription à la file');
    }

    console.log('Client authentifié inscrit:', data);
    return data;
  } catch (error) {
    console.error('Erreur authenticatedClientJoinQueue:', error);
    throw error;
  }
}

export async function businessScanClient(
  clientQrCode: string,
  queueId: string
): Promise<BusinessScanResult> {
  try {
    console.log('Entreprise scanne client:', { clientQrCode, queueId });
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('Vous devez être connecté en tant entreprise');
    }

    const { data, error } = await supabase
      .rpc('business_scan_client', {
        p_client_qr_code: clientQrCode,
        p_queue_id: queueId,
        p_business_user_id: user.id
      });

    if (error) {
      console.error('Erreur scan entreprise:', error);
      throw new Error(error.message || 'Erreur lors du scan du client');
    }

    console.log('Client scanné et ajouté:', data);
    return data;
  } catch (error) {
    console.error('Erreur businessScanClient:', error);
    throw error;
  }
}

export async function visitorJoinQueue(
  companyCode: string,
  queueId: string,
  contactValue: string,
  contactMethod: 'email' | 'phone',
  fullName: string,
  ticketNumber?: string
): Promise<VisitorJoinResult> {
  try {
    console.log('Visiteur rejoint file:', { 
      companyCode, queueId, contactValue, contactMethod, fullName, ticketNumber 
    });

    const { data, error } = await supabase
      .rpc('visitor_join_queue', {
        p_company_code: companyCode,
        p_queue_id: queueId,
        p_contact_value: contactValue.trim(),
        p_contact_method: contactMethod,
        p_full_name: fullName.trim(),
        p_ticket_number: ticketNumber?.trim() || null
      });

    if (error) {
      console.error('Erreur visiteur:', error);
      throw new Error(error.message || 'Erreur lors de inscription visiteur');
    }

    console.log('Visiteur inscrit:', data);
    return data;
  } catch (error) {
    console.error('Erreur visitorJoinQueue:', error);
    throw error;
  }
}

export async function getCompanyQueues(companyCode: string) {
  try {
    console.log('Récupération files entreprise:', companyCode);

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select(`
        id,
        name,
        description,
        queues (
          id,
          name,
          description,
          max_capacity,
          estimated_time_per_person
        )
      `)
      .like('company_qr_code', `COMPANY_${companyCode}_%`)
      .single();

    if (companyError) {
      console.error('Entreprise non trouvée:', companyError);
      throw new Error('Entreprise non trouvée');
    }

    console.log('Files récupérées:', company);
    return company;
  } catch (error) {
    console.error('Erreur getCompanyQueues:', error);
    throw error;
  }
}

export function detectQRCodeType(qrCode: string): {
  type: 'company' | 'client' | 'visitor' | 'unknown';
  data: any;
} {
  if (qrCode.includes('/join/') || qrCode.startsWith('COMPANY_')) {
    const companyCode = qrCode.includes('/join/') 
      ? qrCode.split('/join/')[1]
      : qrCode.split('_')[1];
    
    return {
      type: 'company',
      data: { companyCode }
    };
  }
  
  if (qrCode.startsWith('SKIPLINE_USER_') || qrCode.includes('/client/')) {
    const userId = qrCode.startsWith('SKIPLINE_USER_')
      ? qrCode.replace('SKIPLINE_USER_', '')
      : qrCode.split('/client/')[1];
    
    return {
      type: 'client',
      data: { userId, qrCode }
    };
  }
  
  if (qrCode.startsWith('SKIPLINE_VISITOR_')) {
    return {
      type: 'visitor',
      data: { qrCode }
    };
  }
  
  return {
    type: 'unknown',
    data: { qrCode }
  };
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+33|0)[1-9](\d{8})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\s/g, '');
  if (cleaned.startsWith('0')) {
    return '+33' + cleaned.substring(1);
  }
  return cleaned;
}
