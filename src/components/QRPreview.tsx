import React, { useEffect, useRef, useState } from 'react';
import { QrCode, Check, Copy, CheckCircle2, AlertTriangle, Sparkles, ScanLine, X, Info, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';
import type { QRSize, QRDesignOptions } from './QRCustomization';
import type { QRType } from '../utils/qrFormatters';
import { drawCustomQRToCanvas } from '../utils/qrCustomRenderer';
import { analyzeQRParameters } from '../utils/contrastValidator';
import { DownloadMenu } from './DownloadMenu';
import { useTranslation } from '../i18n/useTranslation';

interface QRPreviewProps {
  qrText: string;
  fgColor: string;
  bgColor: string;
  size: QRSize;
  selectedType?: QRType;
  designOptions?: Partial<QRDesignOptions>;
}

const SIZE_MAP: Record<QRSize, number> = {
  Small: 200,
  Medium: 280,
  Large: 360,
};

export const QRPreview: React.FC<QRPreviewProps> = ({
  qrText,
  fgColor,
  bgColor,
  size,
  selectedType,
  designOptions,
}) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Test QR Modal State
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; decodedText: string } | null>(null);

  const numericSize = SIZE_MAP[size];

  useEffect(() => {
    if (!qrText || qrText.trim() === '') {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    drawCustomQRToCanvas(canvas, qrText, {
      fgColor,
      bgColor,
      transparentBg: designOptions?.transparentBg || false,
      eyeColor: designOptions?.eyeColor || fgColor,
      useCustomEyeColor: designOptions?.useCustomEyeColor || false,
      moduleStyle: designOptions?.moduleStyle || 'square',
      eyeStyle: designOptions?.eyeStyle || 'square',
      errorCorrectionLevel: designOptions?.errorCorrectionLevel || 'M',
      margin: designOptions?.margin ?? 2,
      gradientType: designOptions?.gradientType || 'none',
      gradientColor: designOptions?.gradientColor || '#2563EB',
      logoUrl: designOptions?.logoUrl,
      logoSize: designOptions?.logoSize,
      logoPadding: designOptions?.logoPadding,
      logoHasBg: designOptions?.logoHasBg,
      logoBgColor: designOptions?.logoBgColor,
      width: numericSize,
    })
      .then(() => setGenError(null))
      .catch((err) => {
        console.error('QR code custom render error:', err);
        setGenError('Failed to generate QR code for this input.');
      });
  }, [qrText, fgColor, bgColor, numericSize, designOptions]);

  const handleCopyText = async () => {
    if (!qrText) return;
    try {
      await navigator.clipboard.writeText(qrText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const handleTestQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code && code.data) {
        setTestResult({
          success: true,
          decodedText: code.data,
        });
      } else {
        setTestResult({
          success: false,
          decodedText: '',
        });
      }
      setIsTestModalOpen(true);
    } catch (err) {
      console.error('Failed to test QR decoding:', err);
      setTestResult({
        success: false,
        decodedText: '',
      });
      setIsTestModalOpen(true);
    }
  };

  const hasQR = Boolean(qrText && qrText.trim().length > 0 && !genError);
  const diagnostics = analyzeQRParameters(fgColor, bgColor, qrText || '');

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/60 shadow-xs transition-all relative">
      {/* Real-Time Live Preview Header Badge */}
      <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{t('livePreviewBadge')}</span>
        </div>
        {hasQR && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
            {t('stepVerification')}
          </span>
        )}
      </div>

      {hasQR ? (
        <div className="flex flex-col items-center w-full animate-fadeIn">
          {/* QR Code Container with quiet zone padding */}
          <div
            className="p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center max-w-full overflow-hidden"
            style={{ backgroundColor: bgColor }}
          >
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto object-contain transition-all"
            />
          </div>

          {/* Visual Validation / Contrast Diagnostics Banner */}
          <div className="mt-4 w-full max-w-sm space-y-2">
            {diagnostics.isContrastOptimal ? (
              <div className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span>{t('contrastOptimal')}</span>
              </div>
            ) : (
              <div className="flex items-start gap-1.5 px-3 py-2 rounded-xl bg-amber-50/90 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/70 text-amber-800 dark:text-amber-200 text-xs font-medium leading-tight">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <span>{t('contrastWeakWarning')}</span>
              </div>
            )}

            {diagnostics.isPayloadTooLong && (
              <div className="flex items-start gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium leading-tight">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500 mt-0.5" />
                <span>{t('payloadLengthWarning')}</span>
              </div>
            )}
          </div>

          {/* Text/URL Preview & Action Buttons */}
          <div className="mt-3 w-full max-w-sm space-y-2">
            <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60">
              <span className="text-xs font-mono text-slate-600 dark:text-slate-300 truncate mr-2">
                {qrText}
              </span>
              <button
                onClick={handleCopyText}
                title={copied ? t('copiedPayload') : t('copyPayload')}
                className="p-1 rounded text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Test QR Action Button */}
            <button
              type="button"
              onClick={handleTestQR}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            >
              <ScanLine className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t('testQrBtn')}</span>
            </button>
          </div>

          {/* Multi-Format Download Menu */}
          <DownloadMenu
            qrText={qrText}
            fgColor={fgColor}
            bgColor={bgColor}
            selectedType={selectedType}
            designOptions={designOptions}
          />

          {/* Test QR Result Modal */}
          {isTestModalOpen && testResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 font-semibold text-sm text-slate-900 dark:text-white">
                    <ScanLine className="w-4 h-4 text-indigo-500" />
                    <span>{t('testQrTitle')}</span>
                  </div>
                  <button
                    onClick={() => setIsTestModalOpen(false)}
                    aria-label={t('closeBtn')}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {testResult.success ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/70 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <span>{t('testQrSuccess')}</span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {t('testQrMatchText')}
                      </span>
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 font-mono text-xs text-slate-800 dark:text-slate-200 break-all max-h-32 overflow-y-auto">
                        {testResult.decodedText}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/70 text-amber-800 dark:text-amber-200 text-xs font-semibold">
                      <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span>{t('testQrFailed')}</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {t('testQrFailedReason')}
                    </p>
                  </div>
                )}

                {/* Non-Guarantee Disclaimer */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  <Info className="w-4 h-4 shrink-0 text-slate-400 dark:text-slate-500 mt-0.5" />
                  <span>{t('testQrDisclaimer')}</span>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsTestModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium cursor-pointer transition-colors hover:bg-slate-800 dark:hover:bg-slate-100"
                  >
                    {t('closeBtn')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center text-center py-12 px-4 max-w-sm">
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mb-4 border border-slate-200/60 dark:border-slate-700/50">
            <QrCode className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-base mb-1">
            {t('emptyStateTitle')}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {genError || t('emptyStateSubtitle')}
          </p>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
};
