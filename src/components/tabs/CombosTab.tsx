import React from 'react';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2 } from 'lucide-react';

export default function CombosTab() {
  const { ingredients, dishes, combos, addCombo, updateCombo, removeCombo } = useCalculatorStore();

  const handleAddCombo = () => {
    addCombo({
      id: uuidv4(),
      name: 'Новое комбо',
      dishIds: [],
      packagingCost: 0,
      price: 0
    });
  };

  const getDishCosts = (dishId: string) => {
    const dish = dishes.find(d => d.id === dishId);
    if (!dish) return { now: 0, bulk: 0 };
    
    let now = 0;
    let bulk = 0;
    
    dish.ingredients.forEach(di => {
      const ing = ingredients.find(i => i.id === di.ingredientId);
      if (ing) {
        now += ing.priceNow * di.amount;
        bulk += ing.priceBulk * di.amount;
      }
    });
    
    return { now, bulk };
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">03 Комбо</h2>
          <p className="text-sm text-gray-500">Сборка продаваемых сетов из блюд</p>
        </div>
        <button 
          onClick={handleAddCombo}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Создать комбо
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {combos.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-400 border border-dashed rounded-lg border-gray-300">
            Нет добавленных комбо
          </div>
        ) : combos.map(combo => {
          
          let foodCostNow = combo.packagingCost || 0;
          let foodCostBulk = combo.packagingCost || 0;

          combo.dishIds.forEach(dishId => {
            const costs = getDishCosts(dishId);
            foodCostNow += costs.now;
            foodCostBulk += costs.bulk;
          });

          const marginNow = combo.price > 0 ? combo.price - foodCostNow : null;
          const marginBulk = combo.price > 0 ? combo.price - foodCostBulk : null;
          
          const marginPercentNow = combo.price > 0 && marginNow !== null ? (marginNow / combo.price) * 100 : null;
          const marginPercentBulk = combo.price > 0 && marginBulk !== null ? (marginBulk / combo.price) * 100 : null;

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
                <button 
                  onClick={() => removeCombo(combo.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
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
                <div className="grid grid-cols-2 gap-4">
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
                </div>
              </div>

              {/* Footer Calculations */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                  <div className="text-sm flex justify-between">
                    <span className="text-gray-500">Фудкост СЕЙЧАС:</span>
                    <span className="font-medium">{foodCostNow.toFixed(2)}</span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span className="text-gray-500">Фудкост ОПТОМ:</span>
                    <span className="font-medium text-green-600">{foodCostBulk.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Маржа СЕЙЧАС</p>
                    <p className={`font-semibold ${marginNow !== null && marginNow >= 0 ? 'text-gray-900' : marginNow !== null ? 'text-red-500' : 'text-gray-400'}`}>
                      {marginNow !== null ? `${marginNow.toFixed(2)} TJS (${marginPercentNow?.toFixed(1)}%)` : 'Укажите цену'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Маржа ОПТОМ</p>
                    <p className={`font-semibold ${marginBulk !== null && marginBulk >= 0 ? 'text-green-600' : marginBulk !== null ? 'text-red-500' : 'text-gray-400'}`}>
                      {marginBulk !== null ? `${marginBulk.toFixed(2)} TJS (${marginPercentBulk?.toFixed(1)}%)` : 'Укажите цену'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
