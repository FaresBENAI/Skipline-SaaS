import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  getCompanyQueues, 
  authenticatedClientJoinQueue,
  visitorJoinQueue,
  isValidEmail,
  isValidPhone,
  formatPhone
} from '../services/queueWorkflowService';

interface Queue {
  id: string;
  name: string;
  description: string;
  max_capacity: number;
  estimated_time_per_person: number;
}

interface Company {
  id: string;
  name: string;
  description: string;
  queues: Queue[];
}

export default function QueueJoinForm() {
  const { companyCode } = useParams<{ companyCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [company, setCompany] = useState<Company | null>(null);
  const [selectedQueue, setSelectedQueue] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  
  const [contactValue, setContactValue] = useState('');
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [fullName, setFullName] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCompanyData();
  }, [companyCode]);

  const loadCompanyData = async () => {
    if (!companyCode) return;
    
    try {
      setLoading(true);
      const companyData = await getCompanyQueues(companyCode);
      setCompany(companyData);
      
      if (companyData.queues.length > 0) {
        setSelectedQueue(companyData.queues[0].id);
      }
    } catch (error) {
      console.error('Erreur chargement entreprise:', error);
      setErrors({ general: 'Entreprise non trouvée' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedQueue) {
      newErrors.queue = 'Veuillez sélectionner une file';
    }

    if (!user) {
      if (!fullName.trim()) {
        newErrors.fullName = 'Nom complet requis';
      }

      if (!contactValue.trim()) {
        newErrors.contactValue = 'Email ou téléphone requis';
      } else {
        if (contactMethod === 'email' && !isValidEmail(contactValue)) {
          newErrors.contactValue = 'Email invalide';
        }
        if (contactMethod === 'phone' && !isValidPhone(contactValue)) {
          newErrors.contactValue = 'Téléphone invalide';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJoinQueue = async () => {
    if (!validateForm() || !companyCode || !selectedQueue) return;

    try {
      setJoining(true);
      setErrors({});

      if (user) {
        const result = await authenticatedClientJoinQueue(companyCode, selectedQueue);
        alert(`Inscrit dans la file "${result.queue_name}" - Position: ${result.position}`);
        navigate('/dashboard');
      } else {
        const formattedContact = contactMethod === 'phone' 
          ? formatPhone(contactValue) 
          : contactValue;

        const result = await visitorJoinQueue(
          companyCode,
          selectedQueue,
          formattedContact,
          contactMethod,
          fullName,
          ticketNumber || undefined
        );
        
        const notificationMethod = contactMethod === 'email' ? 'par email' : 'par SMS';
        alert(`Inscrit dans la file "${result.queue_name}" - Position: ${result.position}\n\nVous recevrez une notification ${notificationMethod} quand ce sera votre tour !`);
        
        navigate('/');
      }
    } catch (error: any) {
      console.error('Erreur inscription file:', error);
      setErrors({ general: error.message || 'Erreur lors de inscription' });
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (errors.general) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{errors.general}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h1 className="text-2xl font-bold">{company?.name}</h1>
            <p className="text-blue-100 mt-1">{company?.description}</p>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choisissez votre file
              </label>
              <select
                value={selectedQueue}
                onChange={(e) => setSelectedQueue(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="">Sélectionnez une file</option>
                {company?.queues.map((queue) => (
                  <option key={queue.id} value={queue.id}>
                    {queue.name}
                  </option>
                ))}
              </select>
              {errors.queue && <p className="text-red-500 text-sm mt-1">{errors.queue}</p>}
            </div>

            {!user && (
              <div className="mb-6 space-y-4">
                <h3 className="text-lg font-semibold">Vos informations</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom et prénom *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact *
                  </label>
                  <div className="flex space-x-4 mb-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="email"
                        checked={contactMethod === 'email'}
                        onChange={(e) => setContactMethod(e.target.value as 'email')}
                        className="mr-2"
                      />
                      Email
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="phone"
                        checked={contactMethod === 'phone'}
                        onChange={(e) => setContactMethod(e.target.value as 'phone')}
                        className="mr-2"
                      />
                      SMS
                    </label>
                  </div>
                  <input
                    type={contactMethod === 'email' ? 'email' : 'tel'}
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    placeholder={contactMethod === 'email' ? 'votre@email.com' : '06 12 34 56 78'}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                  {errors.contactValue && <p className="text-red-500 text-sm">{errors.contactValue}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ticket (optionnel)
                  </label>
                  <input
                    type="text"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg"
              >
                Annuler
              </button>
              <button
                onClick={handleJoinQueue}
                disabled={joining || !selectedQueue}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {joining ? 'Inscription...' : 'Rejoindre'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
