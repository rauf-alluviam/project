import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, RefreshCw } from 'lucide-react';
import { useDocuments } from '../../context/DocumentContext';
import Alert from '../UI/Alert';
import { useToggle } from '../../hooks/useToggle';

interface QRCodeGeneratorProps {
  documentId: string;
  documentTitle: string;
  existingQrId?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ 
  documentId, 
  documentTitle,
  existingQrId 
}) => {
  const { generateQRCode } = useDocuments();
  const [qrLabel, setQrLabel] = useState(documentTitle);
  const [qrId, setQrId] = useState(existingQrId || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { value: copied, setTrue: setCopied, setFalse: clearCopied } = useToggle();
  
  // Log if we already have an existing QR ID
  React.useEffect(() => {
    if (existingQrId) {
      console.log("Document already has QR ID:", existingQrId);
    } else {
      console.log("Document has no existing QR ID, will need to generate one");
    }
  }, [existingQrId]);

  const baseUrl = window.location.origin;
  const qrValue = qrId ? `${baseUrl}/view/${qrId}` : '';

  const handleGenerateQR = async () => {
    if (!qrLabel.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      // Use existing QR ID if available, otherwise generate a new one
      if (existingQrId) {
        console.log("Using existing QR ID:", existingQrId);
        setQrId(existingQrId);
      } else {
        console.log("Generating new QR code for document:", documentId);
        const result = await generateQRCode(qrLabel, documentId);
        
        console.log("QR code generation result:", result);
        if (result && result.id) {
          setQrId(result.id);
        } else {
          throw new Error("QR code generation failed - no ID returned");
        }
      }
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    if (!qrValue) return;
    
    try {
      await navigator.clipboard.writeText(qrValue);
      setCopied();
      setTimeout(clearCopied, 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setError('Failed to copy link to clipboard');
    }
  };

  const handleDownloadQR = () => {
    try {
      const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
      if (!canvas) {
        setError('Unable to download QR code. Please try generating it again.');
        return;
      }
      
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${qrLabel.replace(/\s+/g, '-')}-qr.png`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error('Failed to download QR code:', error);
      setError('Failed to download QR code. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">QR Code Generator</h3>
      
      {error && (
        <div className="mb-4">
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="qr-label" className="block text-sm font-medium text-gray-700 mb-1">
          QR Code Label
        </label>
        <input
          type="text"
          id="qr-label"
          value={qrLabel}
          onChange={(e) => setQrLabel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter a label for this QR code"
          disabled={isGenerating}
        />
      </div>
      
      <div className="flex justify-center mb-6">
        <div className="border border-gray-200 rounded-lg p-4 bg-white flex flex-col items-center">
          {qrId ? (
            <>
              <QRCodeSVG 
                id="qr-canvas"
                value={qrValue}
                size={200}
                bgColor="#FFFFFF"
                fgColor="#000000"
                level="H"
                includeMargin={true}
              />
              <p className="text-xs mt-2 text-gray-500">Scan to view document</p>
            </>
          ) : (
            <div className="h-[200px] w-[200px] flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
              Generate QR code
            </div>
          )}
        </div>
      </div>
      
      {qrId && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Link
          </label>
          <div className="flex">
            <input
              type="text"
              value={qrValue}
              readOnly
              className="flex-1 px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 border border-gray-300 bg-gray-50 rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {copied ? (
                <span className="text-green-600 text-sm">Copied!</span>
              ) : (
                <Copy size={16} className="text-gray-600" />
              )}
            </button>
          </div>
        </div>
      )}
      
      <div className="flex space-x-3">
        <button
          onClick={handleGenerateQR}
          disabled={isGenerating || !qrLabel.trim()}
          className={`flex-1 flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
            isGenerating || !qrLabel.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-700 text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {isGenerating ? (
            <>
              <RefreshCw size={16} className="animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              {qrId ? 'Regenerate QR Code' : 'Generate QR Code'}
            </>
          )}
        </button>
        
        {qrId && (
          <button
            onClick={handleDownloadQR}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download size={16} className="mr-2" />
            Download
          </button>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;