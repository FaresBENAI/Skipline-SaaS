import React, { useState } from 'react';
import { QrCode, Copy, Download, ExternalLink } from 'lucide-react';

interface QRCodeGeneratorProps {
  companyCode: string;
  baseUrl?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  companyCode, 
  baseUrl = window.location.origin 
}) => {
  const [qrUrl, setQrUrl] = useState('');
  const joinUrl = `${baseUrl}/join/${companyCode}`;
  const skiplineFormat = `SKIPLINE_COMPANY_${companyCode}`;

  // Générer le QR code via une API gratuite
  const generateQR = (content: string) => {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(content)}`;
    setQrUrl(qrApiUrl);
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(joinUrl);
    alert('URL copiée !');
  };

  const downloadQR = () => {
    if (qrUrl) {
      const link = document.createElement('a');
      link.href = qrUrl;
      link.download = `skipline-${companyCode}.png`;
      link.click();
    }
  };

  const testUrl = () => {
    window.open(joinUrl, '_blank');
  };

  React.useEffect(() => {
    generateQR(joinUrl);
  }, [companyCode, baseUrl]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          🎯 QR Code SkipLine
        </h3>
        <p className="text-sm text-gray-600">
          Entreprise: <span className="font-mono bg-blue-100 px-2 py-1 rounded text-blue-800">{companyCode}</span>
        </p>
      </div>

      {/* QR Code Display */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-lg mb-6">
        {qrUrl ? (
          <div className="text-center">
            <img 
              src={qrUrl} 
              alt={`QR Code SkipLine ${companyCode}`}
              className="w-full h-auto max-w-[300px] mx-auto border-4 border-white rounded-lg shadow-md"
            />
            <p className="text-xs text-gray-500 mt-2">QR Code prêt à scanner</p>
          </div>
        ) : (
          <div className="w-64 h-64 bg-gray-200 flex items-center justify-center mx-auto rounded-lg">
            <QrCode className="h-16 w-16 text-gray-400" />
          </div>
        )}
      </div>

      {/* Format Selector */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Format QR Code :
          </label>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => generateQR(joinUrl)}
              className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-left"
            >
              <strong>URL Complète</strong>
              <br />
              <span className="text-xs">{joinUrl}</span>
            </button>
            <button
              onClick={() => generateQR(skiplineFormat)}
              className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-left"
            >
              <strong>Format SkipLine</strong>
              <br />
              <span className="text-xs">{skiplineFormat}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={downloadQR}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Télécharger</span>
        </button>
        
        <button
          onClick={testUrl}
          className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          <span>Tester</span>
        </button>
      </div>

      <button
        onClick={copyUrl}
        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <Copy className="h-4 w-4" />
        <span>Copier URL</span>
      </button>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <h4 className="font-semibold text-amber-800 mb-2">📋 Instructions d'utilisation :</h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• <strong>Téléchargez</strong> le QR code</li>
          <li>• <strong>Imprimez-le</strong> et affichez dans votre établissement</li>
          <li>• <strong>Clients scannent</strong> avec leur téléphone</li>
          <li>• <strong>Redirection automatique</strong> vers vos files d'attente</li>
        </ul>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
