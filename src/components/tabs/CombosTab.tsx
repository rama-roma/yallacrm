import React from 'react';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2 } from 'lucide-react';

export default function CombosTab() {
  const { dishes, combos, addCombo, updateCombo, removeCombo } = useCalculatorStore();
  const activeSalesMix = combos.filter((combo) => combo.active).reduce((sum, combo) => sum + combo.salesMix, 0);

  const handleAddCombo = () => {
    addCombo({
      id: uuidv4(),
      name: 'Новое комбо',
      dishIds: [],
      packagingCost: 0,
      price: 0,
      salesMix: 0,
      active: true
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">03 Комбо</h2>
          <p className="text-sm text-gray-500">Сборка сетов и доля продаж для прогнозирования</p>
        </div>
        <button 
          onClick={handleAddCombo}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Создать комбо
        </button>
      </div>
      <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${Math.abs(activeSalesMix - 100) < 0.01 ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
        Сумма Sales Mix активных комбо: <span className="font-semibold">{activeSalesMix.toFixed(1)}%</span>. Для корректной аналитики должно быть ровно 100%.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {combos.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-400 border border-dashed rounded-lg border-gray-300">
            Нет добавленных комбо
          </div>
        ) : combos.map(combo => {
          return (
            <div key={combo.id} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-gray-50">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
                <input 
                  type="text" 
                  value={combo.name}
                  onChange={e => updateCombo(combo.id, { name: e.target.value })}
                  className="font-semibold text-lg px-2 py-1 border border-transparent hover:border-gray-300 focus:border-yellow-500 focus:bg-white rounded transition-colors focus:outline-none w-2/3"
                  placeholder="Название комбо"
                />
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-600">
                    <input
                      type="checkbox"
                      checked={combo.active}
                      onChange={(e) => updateCombo(combo.id, { active: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                    />
                    Активно
                  </label>
                  <button 
                    onClick={() => removeCombo(combo.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dishes List */}
              <div className="p-4 flex-1">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Состав комбо</h4>
                {combo.dishIds.length === 0 ? (
                  <p className="text-sm text-gray-400 mb-4">Блюда не добавлены.</p>
                ) : (
                  <div className="space-y-2 mb-4">
                    {combo.dishIds.map((dishId, index) => {
                      return (
                        <div key={index} className="flex gap-2 items-center">
                          <select 
                            className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 bg-white"
                            value={dishId}
                            onChange={(e) => {
                              const newDishIds = [...combo.dishIds];
                              newDishIds[index] = e.target.value;
                              updateCombo(combo.id, { dishIds: newDishIds });
                            }}
                          >
                            <option value="">Выберите блюдо...</option>
                            {dishes.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => {
                              const newDishIds = combo.dishIds.filter((_, i) => i !== index);
                              updateCombo(combo.id, { dishIds: newDishIds });
                            }}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
                
                <button 
                  onClick={() => {
                    updateCombo(combo.id, { 
                      dishIds: [...combo.dishIds, ''] 
                    })
                  }}
                  className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1 mb-6"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Добавить блюдо
                </button>

                {/* Combo Settings */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Стоимость упаковки (TJS)</label>
                    <input 
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 bg-white"
                      value={combo.packagingCost || ''}
                      onChange={(e) => updateCombo(combo.id, { packagingCost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Цена продажи (TJS)</label>
                    <input 
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 bg-white"
                      value={combo.price || ''}
                      onChange={(e) => updateCombo(combo.id, { price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Sales Mix (%)</label>
                    <input 
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 bg-white"
                      value={combo.salesMix || ''}
                      onChange={(e) => updateCombo(combo.id, { salesMix: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white border-t border-gray-200 text-xs text-gray-500">
                Фудкост, маржа и прибыль рассчитываются только во вкладке аналитики.
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
