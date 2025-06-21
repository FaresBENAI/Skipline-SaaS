// ===========================================
// SCANNER ENTREPRISE POUR WORKFLOW 2
// À coller dans src/components/BusinessScanner.tsx
// ===========================================

import React, { useState, useEffect } from 'react';
import { businessScanClient, detectQRCodeType } from '../services/queueWorkflowService';
import QRScannerModal from './QRScannerModal';

interface BusinessScannerProps {
  queues: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  onClientAdded?: (result: any) => void;
}

export default function BusinessScanner({ queues, onClientAdded }: BusinessScannerProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<string>('');
  const [scanning, setScanning] = useState(false);
  const [lastScanResult, setLastScanResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Sélectionner la première file par défaut
    if (queues.length > 0 && !selectedQueue) {
      setSelectedQueue(queues[0].id);
    }
  }, [queues, selectedQueue]);

  const handleQRCodeDetected = async (qrCode: string) => {
    try {
      setScanning(true);
      setError('');
      
      console.log('🔍 QR Code détecté par entreprise:', qrCode);
      
      // Détecter le type de QR code
      const qrType = detectQRCodeType(qrCode);
      console.log('📋 Type QR détecté:', qrType);
      
      if (qrType.type !== 'client') {
        throw new Error('Ce QR code n\\'est pas un QR code client valide');
      }
      
      if (!selectedQueue) {
        throw new Error('Veuillez sélectionner une file d\\'attente');
      }
      
      // Scanner le client et l'ajouter à la file
      const result = await businessScanClient(qrCode, selectedQueue);
      
      console.log('✅ Client ajouté avec succès:', result);
      setLastScanResult(result);
      setShowScanner(false);
      
      // Callback pour notifier le parent
      onClientAdded?.(result);
      
      // Notification de succès
      alert(`✅ Client "${result.client_name}" ajouté à la file "${result.queue_name}"\\nPosition: ${result.position}`);
      
    } catch (error: any) {
      console.error('❌ Erreur scan client:', error);
      setError(error.message || 'Erreur lors du scan du client');
    } finally {
      setScanning(false);
    }
  };

  const openScanner = () => {
    if (!selectedQueue) {
      setError('Veuillez sélectionner une file d\\'attente avant de scanner');
      return;
    }
    setError('');
    setShowScanner(true);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">📱</span>
        <h2 className="text-xl font-bold text-gray-800">Scanner QR Client</h2>
      </div>
      
      <p className="text-gray-600 mb-4">
        Scannez le QR code d'un client pour l'ajouter directement à une file d'attente
      </p>
      
      {/* Sélection de file */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          File d'attente de destination
        </label>
        <select
          value={selectedQueue}
          onChange={(e) => setSelectedQueue(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Sélectionnez une file</option>
          {queues.map((queue) => (
            <option key={queue.id} value={queue.id}>
              {queue.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Erreur */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      {/* Dernier scan */}
      {lastScanResult && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center text-green-600 mb-2">
            <span className="text-lg mr-2">✅</span>
            <span className="font-semibold">Dernier client ajouté</span>
          </div>
          <div className="text-sm text-green-700">
            <p><strong>Client:</strong> {lastScanResult.client_name}</p>
            <p><strong>File:</strong> {lastScanResult.queue_name}</p>
            <p><strong>Position:</strong> {lastScanResult.position}</p>
            <p><strong>Type:</strong> {lastScanResult.client_type}</p>
          </div>
        </div>
      )}
      
      {/* Bouton scanner */}
      <button
        onClick={openScanner}
        disabled={!selectedQueue || scanning}
        className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {scanning ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Traitement...
          </>
        ) : (
          <>
            <span className="text-xl mr-2">📷</span>
            Scanner QR Code Client
          </>
        )}
      </button>
      
      {/* Instructions */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <span className="text-blue-600 text-xl mr-3">💡</span>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Instructions :</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Sélectionnez d'abord la file de destination</li>
              <li>Demandez au client de vous montrer son QR code SkipLine</li>
              <li>Scannez le code avec l'appareil photo</li>
              <li>Le client sera automatiquement ajouté à la file</li>
              <li>Il recevra une notification de confirmation</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Modal Scanner */}
      {showScanner && (
        <QRScannerModal
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onQRCodeDetected={handleQRCodeDetected}
          title={`Scanner pour "${queues.find(q => q.id === selectedQueue)?.name}"`}
          subtitle="Pointez vers le QR code du client"
        />
      )}
    </div>
  );
}
