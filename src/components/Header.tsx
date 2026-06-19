import React, { useRef } from 'react';
import { getCalculatorData, useCalculatorStore } from '../store/useCalculatorStore';
import { exportJSON, exportXLSX, parseXLSXFile } from '../utils/exportUtils';
import { CheckCircle2, Download, FileSpreadsheet, Loader2, Upload } from 'lucide-react';

export default function Header() {
  const state = useCalculatorStore();
  const {
    partner,
    scenarios,
    updatePartner,
    updateScenarios,
    importState,
    saveSnapshot,
    isSaving,
    lastSavedAt,
    error
  } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = async () => {
    const filename = `Yalla_Model_${partner.name || 'Партнер'}_${new Date().toISOString().split('T')[0]}`;
    await saveSnapshot(filename);
    exportJSON(state, filename);
  };

  const handleExportXLSX = () => {
    const filename = `Yalla_Model_${partner.name || 'Партнер'}_${new Date().toISOString().split('T')[0]}`;
    exportXLSX(getCalculatorData(state), filename);
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const importJson = () => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (parsed && typeof parsed === 'object') {
            await importState(parsed);
            alert('Данные успешно загружены.');
          }
        } catch (error) {
          alert('Ошибка при чтении файла. Убедитесь, что это корректный JSON.');
          console.error(error);
        }
      };
      reader.readAsText(file);
    };

    const importXlsx = async () => {
      try {
        const parsed = await parseXLSXFile(file);
        await importState(parsed);
        alert('Excel-файл успешно загружен.');
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Ошибка при чтении Excel-файла.');
        console.error(error);
      }
    };

    if (file.name.toLowerCase().endsWith('.xlsx')) {
      void importXlsx();
    } else {
      importJson();
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Калькулятор кухни Yalla</h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Сохранение...
            </>
          ) : lastSavedAt ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Последнее сохранение: {new Date(lastSavedAt).toLocaleString('ru-RU')}
            </>
          ) : (
            'Данные загрузятся из JSON-файла'
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
          >
            <Upload className="w-4 h-4" />
            Импорт (.xlsx/.json)
          </button>
          <input 
            type="file" 
            accept=".xlsx,.json" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImportFile} 
          />
          <button 
            onClick={handleExportJSON}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Сохранить (.json)
          </button>
          <button 
            onClick={handleExportXLSX}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Экспорт (.xlsx)
          </button>
        </div>
      </div>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Название кухни</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={partner.name}
            onChange={e => updatePartner({ name: e.target.value })}
            placeholder="ООО Ромашка"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">ФИО руководителя</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={partner.manager}
            onChange={e => updatePartner({ manager: e.target.value })}
            placeholder="Иван Иванов"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Адрес кухни</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={partner.address}
            onChange={e => updatePartner({ address: e.target.value })}
            placeholder="г. Душанбе, ул. Ленина 1"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Номер телефона</label>
          <input 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            value={partner.phone}
            onChange={e => updatePartner({ phone: e.target.value })}
            placeholder="+992 ..."
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Курс USD к TJS</label>
          <input 
            type="number" 
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-blue-50"
            value={scenarios.exchangeRate}
            onChange={e => updateScenarios({ exchangeRate: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>
    </div>
  );
}
