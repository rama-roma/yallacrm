import React, { useState } from 'react';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { v4 as uuidv4 } from 'uuid';
import { Calculator, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { formatMoney, getComboFoodCost, ScenarioKey } from '../../utils/calculations';

const scenarios: { key: ScenarioKey; label: string; className: string }[] = [
  { key: 'current', label: 'Сейчас', className: 'border-sky-200 bg-sky-50 text-sky-900' },
  { key: 's1', label: '+30', className: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
  { key: 's2', label: '+70', className: 'border-amber-200 bg-amber-50 text-amber-900' },
  { key: 's3', label: '+150', className: 'border-violet-200 bg-violet-50 text-violet-900' }
];

export default function CombosTab() {
  const state = useCalculatorStore();
  const { dishes, combos, addCombo, updateCombo, removeCombo } = state;
  const [openCosts, setOpenCosts] = useState<Record<string, boolean>>({});
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

  const toggleCosts = (comboId: string) => {
    setOpenCosts((current) => ({ ...current, [comboId]: !current[comboId] }));
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">03 Комбо</h2>
          <p className="text-sm text-gray-500">Сборка сетов и доля продаж для прогнозирования</p>
        </div>
        <button
          onClick={handleAddCombo}
          className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-600"
        >
          <Plus className="h-4 w-4" />
          Создать комбо
        </button>
      </div>

      <div className={`mb-6 rounded-lg border px-4 py-3 text-sm ${Math.abs(activeSalesMix - 100) < 0.01 ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
        Сумма долей продаж активных комбо: <span className="font-semibold">{activeSalesMix.toFixed(1)}%</span>. Для корректной аналитики должно быть ровно 100%.
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {combos.length === 0 ? (
          <div className="col-span-full rounded-lg border border-dashed border-gray-300 py-8 text-center text-gray-400">
            Нет добавленных комбо
          </div>
        ) : combos.map((combo) => {
          const isCostOpen = Boolean(openCosts[combo.id]);

          return (
            <div key={combo.id} className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
                <input
                  type="text"
                  value={combo.name}
                  onChange={(e) => updateCombo(combo.id, { name: e.target.value })}
                  className="w-2/3 rounded border border-transparent px-2 py-1 text-lg font-semibold transition-colors hover:border-gray-300 focus:border-yellow-500 focus:bg-white focus:outline-none"
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
                    className="rounded p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4">
                <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">Состав комбо</h4>
                {combo.dishIds.length === 0 ? (
                  <p className="mb-4 text-sm text-gray-400">Блюда не добавлены.</p>
                ) : (
                  <div className="mb-4 space-y-2">
                    {combo.dishIds.map((dishId, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <select
                          className="flex-1 rounded border border-gray-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                          value={dishId}
                          onChange={(e) => {
                            const newDishIds = [...combo.dishIds];
                            newDishIds[index] = e.target.value;
                            updateCombo(combo.id, { dishIds: newDishIds });
                          }}
                        >
                          <option value="">Выберите блюдо...</option>
                          {dishes.map((d) => (
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
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    updateCombo(combo.id, {
                      dishIds: [...combo.dishIds, '']
                    });
                  }}
                  className="mb-6 flex items-center gap-1 text-sm font-medium text-yellow-600 hover:text-yellow-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Добавить блюдо
                </button>

                <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Стоимость упаковки (TJS)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full rounded border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      value={combo.packagingCost || ''}
                      onChange={(e) => updateCombo(combo.id, { packagingCost: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Цена продажи (TJS)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full rounded border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      value={combo.price || ''}
                      onChange={(e) => updateCombo(combo.id, { price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Доля продаж (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full rounded border border-gray-200 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      value={combo.salesMix || ''}
                      onChange={(e) => updateCombo(combo.id, { salesMix: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleCosts(combo.id)}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <span className="inline-flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-yellow-600" />
                    {isCostOpen ? 'Скрыть расчет' : 'Показать расчет'}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isCostOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCostOpen && (
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {scenarios.map((scenario) => {
                      const foodCost = getComboFoodCost(state, combo.id, scenario.key);
                      const margin = combo.price - foodCost;
                      const marginPercent = combo.price > 0 ? (margin / combo.price) * 100 : 0;

                      return (
                        <div key={scenario.key} className={`rounded-lg border p-3 ${scenario.className}`}>
                          <div className="mb-1 text-xs font-semibold">{scenario.label}</div>
                          <div className="text-sm">
                            <span className="text-gray-600">Фудкост: </span>
                            <span className="font-semibold text-gray-900">{formatMoney(foodCost)} TJS</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Цена: </span>
                            <span className="font-semibold text-gray-900">{formatMoney(combo.price)} TJS</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Маржа: </span>
                            <span className={`font-semibold ${margin >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                              {formatMoney(margin)} TJS ({marginPercent.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 bg-white p-4 text-xs text-gray-500">
                Фудкост, маржу и прибыль можно раскрыть кнопкой выше.
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
