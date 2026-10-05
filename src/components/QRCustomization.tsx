import React, { useState, useRef } from 'react';
import {
  Palette,
  RefreshCw,
  LayoutTemplate,
  Eye,
  Shapes,
  ShieldAlert,
  Image as ImageIcon,
  Upload,
  Trash2,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import type { TranslationKeys } from '../i18n/translations';

export type QRSize = 'Small' | 'Medium' | 'Large';
export type ModuleStyle = 'square' | 'rounded' | 'dots';
export type EyeStyle = 'square' | 'rounded' | 'circle';
export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type GradientType = 'none' | 'linear' | 'radial';
export type LogoBorderRadius = 'square' | 'rounded' | 'circle';

export interface QRDesignOptions {
  fgColor: string;
  bgColor: string;
  transparentBg: boolean;
  eyeColor: string;
  useCustomEyeColor: boolean;
  moduleStyle: ModuleStyle;
  eyeStyle: EyeStyle;
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin: number;
  gradientType: GradientType;
  gradientColor: string;
  logoUrl?: string;
  logoSize?: number;
  logoPadding?: number;
  logoHasBg?: boolean;
  logoBgColor?: string;
  logoBorderRadius?: LogoBorderRadius;
}

interface QRCustomizationProps {
  fgColor: string;
  setFgColor: (color: string) => void;
  bgColor: string;
  setBgColor: (color: string) => void;
  size: QRSize;
  setSize: (size: QRSize) => void;
  designOptions: QRDesignOptions;
  setDesignOptions: React.Dispatch<React.SetStateAction<QRDesignOptions>>;
  onReset: () => void;
}

const PRESET_COLORS = [
  '#111827', // Slate Dark
  '#2563EB', // Blue
  '#059669', // Emerald
  '#7C3AED', // Violet
  '#DC2626', // Red
];

function processAndResizeLogo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Empty result from FileReader'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image'));
      img.onload = () => {
        const MAX_DIM = 512;
        let w = img.width;
        let h = img.height;

        if (w <= MAX_DIM && h <= MAX_DIM) {
          resolve(dataUrl);
          return;
        }

        if (w > h) {
          h = Math.round((h * MAX_DIM) / w);
          w = MAX_DIM;
        } else {
          w = Math.round((w * MAX_DIM) / h);
          h = MAX_DIM;
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export const QRCustomization: React.FC<QRCustomizationProps> = ({
  fgColor,
  setFgColor,
  bgColor,
  setBgColor,
  size,
  setSize,
  designOptions,
  setDesignOptions,
  onReset,
}) => {
  const { t } = useTranslation();

  const presets = [
    {
      id: 'minimal',
      labelKey: 'presetMinimal' as TranslationKeys,
      apply: () => {
        setFgColor('#0F172A');
        setBgColor('#FFFFFF');
        setDesignOptions((prev) => ({
          ...prev,
          fgColor: '#0F172A',
          bgColor: '#FFFFFF',
          transparentBg: false,
          eyeColor: '#0F172A',
          useCustomEyeColor: false,
          moduleStyle: 'square',
          eyeStyle: 'square',
          errorCorrectionLevel: 'M',
          margin: 2,
          gradientType: 'none',
          gradientColor: '#2563EB',
        }));
      },
    },
    {
      id: 'business',
      labelKey: 'presetBusiness' as TranslationKeys,
      apply: () => {
        setFgColor('#1E3A8A');
        setBgColor('#F8FAFC');
        setDesignOptions((prev) => ({
          ...prev,
          fgColor: '#1E3A8A',
          bgColor: '#F8FAFC',
          transparentBg: false,
          eyeColor: '#0284C7',
          useCustomEyeColor: true,
          moduleStyle: 'rounded',
          eyeStyle: 'rounded',
          errorCorrectionLevel: 'Q',
          margin: 2,
          gradientType: 'linear',
          gradientColor: '#0284C7',
        }));
      },
    },
    {
      id: 'restaurant',
      labelKey: 'presetRestaurant' as TranslationKeys,
      apply: () => {
        setFgColor('#78350F');
        setBgColor('#FEF3C7');
        setDesignOptions((prev) => ({
          ...prev,
          fgColor: '#78350F',
          bgColor: '#FEF3C7',
          transparentBg: false,
          eyeColor: '#B45309',
          useCustomEyeColor: true,
          moduleStyle: 'rounded',
          eyeStyle: 'rounded',
          errorCorrectionLevel: 'H',
          margin: 2,
          gradientType: 'none',
          gradientColor: '#B45309',
        }));
      },
    },
    {
      id: 'wifi',
      labelKey: 'presetWifi' as TranslationKeys,
      apply: () => {
        setFgColor('#065F46');
        setBgColor('#ECFDF5');
        setDesignOptions((prev) => ({
          ...prev,
          fgColor: '#065F46',
          bgColor: '#ECFDF5',
          transparentBg: false,
          eyeColor: '#059669',
          useCustomEyeColor: true,
          moduleStyle: 'dots',
          eyeStyle: 'circle',
          errorCorrectionLevel: 'M',
          margin: 2,
          gradientType: 'linear',
          gradientColor: '#10B981',
        }));
      },
    },
    {
      id: 'social',
      labelKey: 'presetSocial' as TranslationKeys,
      apply: () => {
        setFgColor('#5B21B6');
        setBgColor('#FAF5FF');
        setDesignOptions((prev) => ({
          ...prev,
          fgColor: '#5B21B6',
          bgColor: '#FAF5FF',
          transparentBg: false,
          eyeColor: '#DB2777',
          useCustomEyeColor: true,
          moduleStyle: 'dots',
          eyeStyle: 'rounded',
          errorCorrectionLevel: 'Q',
          margin: 2,
          gradientType: 'linear',
          gradientColor: '#E11D48',
        }));
      },
    },
  ];

  return (
    <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 space-y-6">
      {/* Presets Bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          <LayoutTemplate className="w-3.5 h-3.5 text-slate-500" />
          <span>{t('templatesTitle')}</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={p.apply}
              className="px-3 py-1.5 rounded-xl border text-xs font-medium bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 shrink-0 transition-colors cursor-pointer"
            >
              {t(p.labelKey)}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          <Palette className="w-3.5 h-3.5 text-slate-500" />
          <span>{t('customizeTitle')}</span>
        </div>

        <button
          type="button"
          onClick={onReset}
          aria-label={t('resetBtn')}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>{t('resetBtn')}</span>
        </button>
      </div>

      {/* Colors & Gradient Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* QR Primary Color */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
            {t('qrColorLabel')}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={fgColor}
              onChange={(e) => {
                setFgColor(e.target.value);
                setDesignOptions((prev) => ({ ...prev, fgColor: e.target.value }));
              }}
              aria-label={t('qrColorLabel')}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer bg-transparent"
            />
            <div className="flex items-center gap-1">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setFgColor(color);
                    setDesignOptions((prev) => ({ ...prev, fgColor: color }));
                  }}
                  aria-label={`Select color ${color}`}
                  style={{ backgroundColor: color }}
                  className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                    fgColor === color
                      ? 'scale-110 border-slate-900 dark:border-white ring-2 ring-slate-900/20 dark:ring-white/20'
                      : 'border-transparent hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Background Color & Transparent Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              {t('bgColorLabel')}
            </label>
            <label className="inline-flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
              <input
                type="checkbox"
                checked={designOptions.transparentBg}
                onChange={(e) =>
                  setDesignOptions((prev) => ({ ...prev, transparentBg: e.target.checked }))
                }
                className="rounded text-slate-900 dark:text-white"
              />
              <span>{t('transparentBgLabel')}</span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              disabled={designOptions.transparentBg}
              value={bgColor}
              onChange={(e) => {
                setBgColor(e.target.value);
                setDesignOptions((prev) => ({ ...prev, bgColor: e.target.value }));
              }}
              aria-label={t('bgColorLabel')}
              className={`w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent ${
                designOptions.transparentBg ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
              }`}
            />
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">
              {designOptions.transparentBg ? 'Transparent' : bgColor}
            </span>
          </div>
        </div>

        {/* Size Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
            {t('sizeLabel')}
          </label>
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 p-1 border border-slate-200/80 dark:border-slate-700/80">
            {(['Small', 'Medium', 'Large'] as QRSize[]).map((s) => {
              const labelKey: TranslationKeys =
                s === 'Small' ? 'sizeSmall' : s === 'Medium' ? 'sizeMedium' : 'sizeLarge';
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  aria-pressed={size === s}
                  className={`flex-1 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    size === s
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gradient Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
            {t('gradientLabel')}
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            {(['none', 'linear', 'radial'] as GradientType[]).map((gt) => {
              const labelKey: TranslationKeys =
                gt === 'none'
                  ? 'gradientTypeNone'
                  : gt === 'linear'
                  ? 'gradientTypeLinear'
                  : 'gradientTypeRadial';
              const isSelected = designOptions.gradientType === gt;
              return (
                <button
                  key={gt}
                  type="button"
                  onClick={() => setDesignOptions((prev) => ({ ...prev, gradientType: gt }))}
                  aria-pressed={isSelected}
                  className={`py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        {designOptions.gradientType !== 'none' && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              {t('gradientColorLabel')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={designOptions.gradientColor}
                onChange={(e) =>
                  setDesignOptions((prev) => ({ ...prev, gradientColor: e.target.value }))
                }
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">
                {designOptions.gradientColor}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Shapes & Modules & Eye Markers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        {/* Module Style */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
            <Shapes className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('moduleStyleLabel')}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            {(['square', 'rounded', 'dots'] as ModuleStyle[]).map((ms) => {
              const labelKey: TranslationKeys =
                ms === 'square' ? 'styleSquare' : ms === 'rounded' ? 'styleRounded' : 'styleDots';
              const isSelected = designOptions.moduleStyle === ms;
              return (
                <button
                  key={ms}
                  type="button"
                  onClick={() => setDesignOptions((prev) => ({ ...prev, moduleStyle: ms }))}
                  aria-pressed={isSelected}
                  className={`py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Eye Style */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
            <Eye className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('eyeStyleLabel')}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            {(['square', 'rounded', 'circle'] as EyeStyle[]).map((es) => {
              const labelKey: TranslationKeys =
                es === 'square' ? 'styleSquare' : es === 'rounded' ? 'styleRounded' : 'styleDots';
              const isSelected = designOptions.eyeStyle === es;
              return (
                <button
                  key={es}
                  type="button"
                  onClick={() => setDesignOptions((prev) => ({ ...prev, eyeStyle: es }))}
                  aria-pressed={isSelected}
                  className={`py-1 text-[11px] font-medium rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t(labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Custom Eye Color & EC Level & Quiet Zone Margin */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/60">
        {/* Custom Eye Color Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              {t('eyeColorLabel')}
            </label>
            <label className="inline-flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer">
              <input
                type="checkbox"
                checked={designOptions.useCustomEyeColor}
                onChange={(e) =>
                  setDesignOptions((prev) => ({ ...prev, useCustomEyeColor: e.target.checked }))
                }
                className="rounded text-slate-900 dark:text-white"
              />
              <span>{t('customEyeColorLabel')}</span>
            </label>
          </div>
          {designOptions.useCustomEyeColor && (
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={designOptions.eyeColor}
                onChange={(e) =>
                  setDesignOptions((prev) => ({ ...prev, eyeColor: e.target.value }))
                }
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">
                {designOptions.eyeColor}
              </span>
            </div>
          )}
        </div>

        {/* Error Correction Level */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('ecLevelLabel')}</span>
          </div>
          <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            {(['L', 'M', 'Q', 'H'] as ErrorCorrectionLevel[]).map((ec) => {
              const isSelected = designOptions.errorCorrectionLevel === ec;
              return (
                <button
                  key={ec}
                  type="button"
                  onClick={() => setDesignOptions((prev) => ({ ...prev, errorCorrectionLevel: ec }))}
                  aria-pressed={isSelected}
                  className={`py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {ec}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quiet Zone Margin Slider */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-400">
            <label htmlFor="margin-slider">{t('marginLabel')}</label>
            <span className="font-mono font-semibold text-slate-900 dark:text-white">
              {designOptions.margin}
            </span>
          </div>
          <input
            id="margin-slider"
            type="range"
            min="0"
            max="6"
            step="1"
            value={designOptions.margin}
            onChange={(e) =>
              setDesignOptions((prev) => ({
                ...prev,
                margin: parseInt(e.target.value, 10),
              }))
            }
            className="w-full accent-slate-900 dark:accent-white cursor-pointer mt-1"
          />
        </div>
      </div>

      {/* Logo Section */}
      <LogoSection designOptions={designOptions} setDesignOptions={setDesignOptions} />
    </div>
  );
};

interface LogoSectionProps {
  designOptions: QRDesignOptions;
  setDesignOptions: React.Dispatch<React.SetStateAction<QRDesignOptions>>;
}

const LogoSection: React.FC<LogoSectionProps> = ({ designOptions, setDesignOptions }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  const MAX_LOGO_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
  const VALID_MIME_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/svg+xml',
  ];

  const handleFileChange = async (file: File) => {
    if (!file) return;

    if (!VALID_MIME_TYPES.includes(file.type)) {
      setLogoError(t('logoInvalidType'));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      setLogoError(t('logoFileTooLarge'));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setLogoError(null);

    try {
      const resizedDataUrl = await processAndResizeLogo(file);
      setDesignOptions((prev) => ({
        ...prev,
        logoUrl: resizedDataUrl,
        logoSize: prev.logoSize || 20,
        logoPadding: prev.logoPadding ?? 2,
        logoHasBg: prev.logoHasBg ?? true,
        logoBgColor: prev.logoBgColor || '#FFFFFF',
        logoBorderRadius: prev.logoBorderRadius || 'rounded',
        // Automatically switch to 'H' when uploading logo
        errorCorrectionLevel:
          prev.errorCorrectionLevel === 'L' || prev.errorCorrectionLevel === 'M'
            ? 'H'
            : prev.errorCorrectionLevel,
      }));
    } catch (err) {
      console.error('Failed to process uploaded logo:', err);
      setLogoError(t('logoInvalidType'));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveLogo = () => {
    setDesignOptions((prev) => ({ ...prev, logoUrl: undefined }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentLogoSize = designOptions.logoSize ?? 20;
  const currentLogoPadding = designOptions.logoPadding ?? 2;
  const logoHasBg = designOptions.logoHasBg !== false;
  const logoBgColor = designOptions.logoBgColor || '#FFFFFF';

  const isEcLow =
    designOptions.errorCorrectionLevel === 'L' || designOptions.errorCorrectionLevel === 'M';
  const isLogoLarge = currentLogoSize >= 25;

  return (
    <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
        <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
        <span>{t('logoTitle')}</span>
      </div>

      {logoError && (
        <div className="flex items-center gap-1.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{logoError}</span>
        </div>
      )}

      {!designOptions.logoUrl ? (
        /* Drag & Drop Upload Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? 'border-slate-900 bg-slate-100 dark:border-white dark:bg-slate-800'
              : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/80'
          }`}
        >
          <div className="p-2.5 rounded-full bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300">
            <Upload className="w-4 h-4" />
          </div>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {t('logoUploadDrag')}
          </p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            PNG, JPG, SVG, WebP
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
            className="hidden"
          />
        </div>
      ) : (
        /* Uploaded Logo Control Panel */
        <div className="space-y-4 bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          {/* Logo Thumbnail Preview & Remove Action */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs"
                style={{ backgroundColor: logoHasBg ? logoBgColor : 'transparent' }}
              >
                <img
                  src={designOptions.logoUrl}
                  alt="Logo Preview"
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {t('logoActive')}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {currentLogoSize}% {t('logoPercentOfQr')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveLogo}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('removeLogo')}</span>
            </button>
          </div>

          {/* Controls: Size & Relative Padding */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
            {/* Logo Size Slider (Capped max 30% for safety) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-400">
                <label htmlFor="logo-size-slider">{t('logoSizeLabel')}</label>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {currentLogoSize}%
                </span>
              </div>
              <input
                id="logo-size-slider"
                type="range"
                min="10"
                max="30"
                step="1"
                value={currentLogoSize}
                onChange={(e) =>
                  setDesignOptions((prev) => ({
                    ...prev,
                    logoSize: parseInt(e.target.value, 10),
                  }))
                }
                className="w-full accent-slate-900 dark:accent-white cursor-pointer"
              />
            </div>

            {/* Logo Relative Padding Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-400">
                <label htmlFor="logo-padding-slider">{t('logoPaddingLabel')}</label>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {currentLogoPadding}%
                </span>
              </div>
              <input
                id="logo-padding-slider"
                type="range"
                min="0"
                max="6"
                step="0.5"
                value={currentLogoPadding}
                onChange={(e) =>
                  setDesignOptions((prev) => ({
                    ...prev,
                    logoPadding: parseFloat(e.target.value),
                  }))
                }
                className="w-full accent-slate-900 dark:accent-white cursor-pointer"
              />
            </div>
          </div>

          {/* Logo Background Settings & Border Shape */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 items-center">
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={logoHasBg}
                  onChange={(e) =>
                    setDesignOptions((prev) => ({ ...prev, logoHasBg: e.target.checked }))
                  }
                  className="rounded text-slate-900 dark:text-white"
                />
                <span>{t('logoBgLabel')}</span>
              </label>

              {logoHasBg && (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={logoBgColor}
                    onChange={(e) =>
                      setDesignOptions((prev) => ({ ...prev, logoBgColor: e.target.value }))
                    }
                    aria-label={t('logoBgColorLabel')}
                    className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer bg-transparent"
                  />
                  <span className="text-[11px] font-mono text-slate-500 uppercase">
                    {logoBgColor}
                  </span>
                </div>
              )}
            </div>

            {logoHasBg && (
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  {t('logoBorderShapeLabel')}
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                  {(['square', 'rounded', 'circle'] as LogoBorderRadius[]).map((shape) => {
                    const labelKey: TranslationKeys =
                      shape === 'square'
                        ? 'shapeSquare'
                        : shape === 'rounded'
                        ? 'shapeRounded'
                        : 'shapeCircle';
                    const currentShape = designOptions.logoBorderRadius || 'rounded';
                    const isSelected = currentShape === shape;
                    return (
                      <button
                        key={shape}
                        type="button"
                        onClick={() =>
                          setDesignOptions((prev) => ({ ...prev, logoBorderRadius: shape }))
                        }
                        aria-pressed={isSelected}
                        className={`py-1 text-[10px] font-medium rounded-lg transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {t(labelKey)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Safety Warnings & EC Recommendation Banners */}
          {isEcLow && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
              <div className="flex items-start gap-1.5 leading-tight">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <span>{t('logoEcLowWarning')}</span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setDesignOptions((prev) => ({ ...prev, errorCorrectionLevel: 'H' }))
                }
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold shrink-0 transition-colors cursor-pointer"
              >
                <Check className="w-3 h-3" />
                <span>{t('logoSwitchToHBtn')}</span>
              </button>
            </div>
          )}

          {isLogoLarge && (
            <div className="flex items-start gap-1.5 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
              <span>{t('logoSizeWarning')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
