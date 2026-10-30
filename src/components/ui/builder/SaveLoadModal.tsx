import React, { useState } from 'react';
import { X, Copy, Download, Upload, Trash2, Check, AlertTriangle } from 'lucide-react';
import { CitySaveManager } from '../../../engine/three/builder/CitySaveManager';
import { PlacedStructure } from '../../../types/cityBuilder';

interface SaveLoadModalProps {
  isOpen: boolean;
  structures: PlacedStructure[];
  onClose: () => void;
  onImport: (imported: PlacedStructure[]) => void;
  onClearAll: () => void;
  onNotice?: (msg: string) => void;
}

export const SaveLoadModal: React.FC<SaveLoadModalProps> = ({
  isOpen,
  structures,
  onClose,
  onImport,
  onClearAll,
  onNotice,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const handleCopyJson = () => {
    const jsonStr = CitySaveManager.exportToJsonString(structures);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onNotice?.('Đã sao chép mã bản đồ vào bộ nhớ đệm!');
  };

  const handleDownload = () => {
    CitySaveManager.downloadJsonFile(structures);
    onNotice?.('Đã tải tệp haven_village_layout.json về máy!');
  };

  const handleImportSubmit = () => {
    if (!jsonText.trim()) return;
    try {
      const parsed = CitySaveManager.importFromJsonString(jsonText);
      onImport(parsed);
      setJsonText('');
      onNotice?.(`Đã nhập thành công ${parsed.length} công trình vào làng!`);
      onClose();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleConfirmClear = () => {
    onClearAll();
    setShowClearConfirm(false);
    onNotice?.('Đã xóa toàn bộ công trình người chơi xây dựng.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-md bg-ink-900 border border-paper-800/80 rounded-2xl p-5 shadow-2xl text-paper-100 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-paper-800/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">💾</span>
            <h2 className="text-base font-serif font-bold text-fantasy-gold">
              Quản Lý Lưu Trữ Bản Đồ
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-paper-400 hover:text-paper-100 hover:bg-ink-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Map Stats */}
        <div className="flex items-center justify-between px-3 py-2 bg-ink-950/60 rounded-xl border border-paper-800/40 text-xs">
          <span className="text-paper-400">Số công trình đang có:</span>
          <span className="font-mono font-bold text-fantasy-gold">
            {structures.length} / 100
          </span>
        </div>

        {/* Actions: Export / Download */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCopyJson}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-paper-700/80 bg-ink-800 hover:bg-ink-750 text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-fantasy-gold" />}
            {copied ? 'Đã Sao Chép!' : 'Sao Chép JSON'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-paper-700/80 bg-ink-800 hover:bg-ink-750 text-xs font-medium transition-colors"
          >
            <Download className="w-4 h-4 text-sky-400" />
            Tải Tệp (.json)
          </button>
        </div>

        {/* Import JSON Area */}
        <div className="flex flex-col gap-2 pt-1 border-t border-paper-800/40">
          <label className="text-xs text-paper-300 font-medium flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-fantasy-gold" />
            Nhập Mã Bản Đồ JSON
          </label>
          <textarea
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='Dán nội dung JSON bản đồ vào đây...'
            rows={3}
            className="w-full bg-ink-950/80 border border-paper-800/60 rounded-xl p-2.5 text-xs font-mono text-paper-200 placeholder:text-paper-600 focus:outline-none focus:border-fantasy-gold resize-none"
          />
          <button
            onClick={handleImportSubmit}
            disabled={!jsonText.trim()}
            className="w-full py-2 bg-fantasy-gold hover:bg-fantasy-gold/90 disabled:opacity-40 text-ink-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-98"
          >
            Tải Bản Đồ Vào Thế Giới
          </button>
        </div>

        {/* Clear All Reset Option */}
        <div className="pt-2 border-t border-paper-800/40">
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors border border-rose-900/40"
            >
              <Trash2 className="w-4 h-4" />
              Khôi Phục Ban Đầu (Xóa Hết Đã Xây)
            </button>
          ) : (
            <div className="flex flex-col gap-2 p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs">
              <div className="flex items-center gap-2 text-rose-300 font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Xác nhận xóa sạch công trình bạn đã xây?
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={handleConfirmClear}
                  className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition-colors"
                >
                  Xóa Ngay
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-1.5 bg-ink-800 hover:bg-ink-700 text-paper-200 rounded-lg transition-colors"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
