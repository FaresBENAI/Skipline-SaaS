// ===========================================
// COMPOSANT FORMULAIRE TRIPLE WORKFLOW
// À coller dans src/components/QueueJoinForm.tsx
// ===========================================

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
  
  // États pour visiteurs non-identifiés
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
      
      // Sélectionner la première file par défaut
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

    // Si utilisateur non connecté, valider les champs visiteur
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
          newErrors.contactValue = 'Téléphone invalide (format français)';
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
        // WORKFLOW 1: Client authentifié
        const result = await authenticatedClientJoinQueue(companyCode, selectedQueue);
        
        alert(`✅ Inscrit dans la file "${result.queue_name}" - Position: ${result.position}`);
        navigate('/dashboard');
      } else {
        // WORKFLOW 3: Visiteur non-identifié
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
        alert(`✅ Inscrit dans la file "${result.queue_name}" - Position: ${result.position}\\n\\nVous recevrez une notification ${notificationMethod} quand ce sera votre tour !`);
        
        // Rediriger vers une page de confirmation
        navigate('/queue-confirmation', { 
          state: { 
            result,
            contactMethod,
            contactValue: formattedContact
          } 
        });
      }
    } catch (error: any) {
      console.error('Erreur inscription file:', error);
      setErrors({ general: error.message || 'Erreur lors de l\\'inscription' });
    } finally {
      setJoining(false);
    }
  };

  const getEstimatedWaitTime = (queue: Queue): string => {
    // Calcul approximatif du temps d'attente basé sur la file sélectionnée
    const currentPosition = 5; // À remplacer par vraie data
    const totalMinutes = currentPosition * queue.estimated_time_per_person;
    
    if (totalMinutes < 60) {
      return `${totalMinutes} min`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des informations...</p>
        </div>
      </div>
    );
  }

  if (errors.general) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-4">{errors.general}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
            <h1 className="text-2xl font-bold">{company?.name}</h1>
            <p className="text-blue-100 mt-1">{company?.description}</p>
          </div>

          <div className="p-6">
            {/* Status utilisateur */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              {user ? (
                <div className="flex items-center text-green-600">
                  <span className="text-2xl mr-3">🔐</span>
                  <div>
                    <p className="font-semibold">Utilisateur connecté</p>
                    <p className="text-sm text-gray-600">Inscription rapide avec votre profil</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center text-blue-600">
                  <span className="text-2xl mr-3">👤</span>
                  <div>
                    <p className="font-semibold">Visiteur</p>
                    <p className="text-sm text-gray-600">Inscription avec vos informations</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sélection de file */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choisissez votre file d'attente
              </label>
              <select
                value={selectedQueue}
                onChange={(e) => setSelectedQueue(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sélectionnez une file</option>
                {company?.queues.map((queue) => (
                  <option key={queue.id} value={queue.id}>
                    {queue.name} - {getEstimatedWaitTime(queue)} d'attente
                  </option>
                ))}
              </select>
              {errors.queue && <p className="text-red-500 text-sm mt-1">{errors.queue}</p>}
            </div>

            {/* Informations de la file sélectionnée */}
            {selectedQueue && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                {(() => {
                  const queue = company?.queues.find(q => q.id === selectedQueue);
                  return queue ? (
                    <div>
                      <h3 className="font-semibold text-blue-800">{queue.name}</h3>
                      <p className="text-blue-600 text-sm mt-1">{queue.description}</p>
                      <div className="mt-2 flex items-center text-sm text-blue-700">
                        <span className="mr-4">⏱️ ~{queue.estimated_time_per_person} min/personne</span>
                        <span>👥 Max: {queue.max_capacity} personnes</span>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            {/* Formulaire visiteur si non connecté */}
            {!user && (
              <div className="mb-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Vos informations</h3>
                
                {/* Nom complet */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom et prénom *
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jean Dupont"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                </div>

                {/* Méthode de contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment souhaitez-vous être contacté ? *
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
                      📧 Email
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="phone"
                        checked={contactMethod === 'phone'}
                        onChange={(e) => setContactMethod(e.target.value as 'phone')}
                        className="mr-2"
                      />
                      📱 SMS
                    </label>
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {contactMethod === 'email' ? 'Adresse email *' : 'Numéro de téléphone *'}
                  </label>
                  <input
                    type={contactMethod === 'email' ? 'email' : 'tel'}
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    placeholder={contactMethod === 'email' ? 'jean@exemple.com' : '06 12 34 56 78'}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.contactValue && <p className="text-red-500 text-sm mt-1">{errors.contactValue}</p>}
                </div>

                {/* Numéro de ticket (optionnel) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de ticket (optionnel)
                  </label>
                  <input
                    type="text"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                    placeholder="T123456"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Si vous avez un ticket physique, indiquez son numéro
                  </p>
                </div>
              </div>
            )}

            {/* Erreur générale */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/')}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleJoinQueue}
                disabled={joining || !selectedQueue}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {joining ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Inscription...
                  </span>
                ) : (
                  'Rejoindre la file'
                )}
              </button>
            </div>

            {/* Info complémentaire */}
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-start">
                <span className="text-yellow-600 text-xl mr-3">💡</span>
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Comment ça marche ?</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Vous serez ajouté à la file sélectionnée</li>
                    <li>Vous recevrez votre position et le temps d'attente estimé</li>
                    <li>Une notification vous préviendra quand ce sera votre tour</li>
                    {!user && <li>Créez un compte pour un suivi plus facile de vos files</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
