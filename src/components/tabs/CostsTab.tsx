import React from 'react';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2 } from 'lucide-react';

export default function CostsTab() {
  const { costs, addCost, updateCost, removeCost, scenarios, updateScenarios } = useCalculatorStore();

  const handleAddCost = () => {
    addCost({
      id: uuidv4(),
      name: '',
      amount: 0
    });
  };

  const totalCosts = costs.reduce((sum, cost) => sum + cost.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Costs List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Постоянные расходы</h2>
            <p className="text-sm text-gray-500">Аренда, ЗП, коммуналка и т.д. (в месяц)</p>
          </div>
        </div>

        <div className="flex-1">
          {costs.length === 0 ? (
            <div className="text-center py-8 text-gray-400 border border-dashed rounded-lg border-gray-300 mb-4">
              Нет добавленных расходов
            </div>
          ) : (
            <div className="space-y-3 mb-4">
              {costs.map((cost) => (
                <div key={cost.id} className="flex gap-3 items-center">
                  <input 
                    type="text" 
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500"
                    value={cost.name}
                    onChange={e => updateCost(cost.id, { name: e.target.value })}
                    placeholder="Статья расхода (напр. Аренда)"
                  />
                  <input 
                    type="number" 
                    min="0"
                    step="100"
                    className="w-32 px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-yellow-500 text-right"
                    value={cost.amount || ''}
                    onChange={e => updateCost(cost.id, { amount: parseFloat(e.target.value) || 0 })}
                    placeholder="Сумма"
                  />
                  <span className="text-gray-500 text-sm">TJS</span>
                  <button 
                    onClick={() => removeCost(cost.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <button 
            onClick={handleAddCost}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Добавить статью расхода
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
          <span className="font-semibold text-gray-700">ИТОГО постоянных расходов:</span>
          <span className="text-xl font-bold text-gray-900">{totalCosts.toLocaleString('ru-RU')} TJS</span>
        </div>
      </div>

      {/* Scenarios Configuration */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Объемы и Сценарии</h2>
          <p className="text-sm text-gray-500">Настройте количество комбо для расчета модели</p>
        </div>

        <div className="space-y-6 flex-1">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Комбо в день СЕЙЧАС</label>
              <input 
                type="number" 
                min="0"
                className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={scenarios.currentVolume || ''}
                onChange={e => updateScenarios({ currentVolume: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Рабочих дней в месяце</label>
              <input 
                type="number" 
                min="1"
                max="31"
                className="w-full px-3 py-2 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                value={scenarios.workingDays || ''}
                onChange={e => updateScenarios({ workingDays: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-3 border-b border-gray-100 pb-2">Дополнительные объемы от Yalla (в день)</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Сценарий 1</label>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-green-600 font-bold">+</span>
                  <input 
                    type="number" 
                    min="0"
                    className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 font-semibold"
                    value={scenarios.s1 === 0 ? '' : scenarios.s1}
                    onChange={e => updateScenarios({ s1: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-center">
                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Сценарий 2</label>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-green-600 font-bold">+</span>
                  <input 
                    type="number" 
                    min="0"
                    className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 font-semibold"
                    value={scenarios.s2 === 0 ? '' : scenarios.s2}
                    onChange={e => updateScenarios({ s2: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-center">
                <label className="block text-xs font-medium text-yellow-700 mb-2 uppercase tracking-wide">Сценарий 3</label>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-yellow-600 font-bold">+</span>
                  <input 
                    type="number" 
                    min="0"
                    className="w-16 px-2 py-1 text-center border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 font-semibold bg-white"
                    value={scenarios.s3 === 0 ? '' : scenarios.s3}
                    onChange={e => updateScenarios({ s3: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Эти значения будут прибавлены к вашему текущему объему продаж для расчетов.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
