import React from 'react';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2 } from 'lucide-react';

export default function DishesTab() {
  const { ingredients, dishes, addDish, updateDish, removeDish } = useCalculatorStore();

  const handleAddDish = () => {
    addDish({
      id: uuidv4(),
      name: 'Новое блюдо',
      productionType: 'single',
      batchYield: 1,
      ingredients: []
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">02 Блюда</h2>
          <p className="text-sm text-gray-500">Техкарты с расчетом на порцию или на производственную партию</p>
        </div>
        <button 
          onClick={handleAddDish}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Создать блюдо
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {dishes.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-400 border border-dashed rounded-lg border-gray-300">
            Нет добавленных блюд
          </div>
        ) : dishes.map(dish => {
          return (
            <div key={dish.id} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col bg-gray-50">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center">
                <input 
                  type="text" 
                  value={dish.name}
                  onChange={e => updateDish(dish.id, { name: e.target.value })}
                  className="font-semibold text-lg px-2 py-1 border border-transparent hover:border-gray-300 focus:border-yellow-500 focus:bg-white rounded transition-colors focus:outline-none w-2/3"
                  placeholder="Название блюда"
                />
                <button 
                  onClick={() => removeDish(dish.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Ingredients List */}
              <div className="p-4 flex-1">
                <div className="mb-4 grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-700">Тип расчета</label>
                    <div className="grid grid-cols-2 gap-1 rounded-md bg-gray-100 p-1 text-sm">
                      <button
                        type="button"
                        onClick={() => updateDish(dish.id, { productionType: 'single', batchYield: 1 })}
                        className={`rounded px-2 py-1.5 font-medium transition-colors ${dish.productionType === 'single' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        1 порция
                      </button>
                      <button
                        type="button"
                        onClick={() => updateDish(dish.id, { productionType: 'batch', batchYield: Math.max(1, dish.batchYield || 1) })}
                        className={`rounded px-2 py-1.5 font-medium transition-colors ${dish.productionType === 'batch' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Batch
                      </button>
                    </div>
                  </div>
                  {dish.productionType === 'batch' && (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-700">Порций на выходе</label>
                      <input
                        type="number"
                        min="1"
                        className="w-full rounded border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        value={dish.batchYield || ''}
                        onChange={(e) => updateDish(dish.id, { batchYield: parseInt(e.target.value) || 1 })}
                        required
                      />
                    </div>
                  )}
                </div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Состав</h4>
                {dish.ingredients.length === 0 ? (
                  <p className="text-sm text-gray-400 mb-4">Состав пуст. Добавьте ингредиенты.</p>
                ) : (
                  <div className="space-y-2 mb-4">
                    {dish.ingredients.map((di, index) => {
                      const ing = ingredients.find(i => i.id === di.ingredientId);
                      return (
                        <div key={index} className="flex gap-2 items-center">
                          <select 
                            className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 bg-white"
                            value={di.ingredientId}
                            onChange={(e) => {
                              const newIngs = [...dish.ingredients];
                              newIngs[index].ingredientId = e.target.value;
                              updateDish(dish.id, { ingredients: newIngs });
                            }}
                          >
                            <option value="">Выберите...</option>
                            {ingredients.map(i => (
                              <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                            ))}
                          </select>
                          <input 
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-24 px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 bg-white"
                            value={di.amount || ''}
                            placeholder="Расход"
                            onChange={(e) => {
                              const newIngs = [...dish.ingredients];
                              newIngs[index].amount = parseFloat(e.target.value) || 0;
                              updateDish(dish.id, { ingredients: newIngs });
                            }}
                          />
                          <span className="text-sm text-gray-500 w-8">{ing?.unit || ''}</span>
                          <button 
                            onClick={() => {
                              const newIngs = dish.ingredients.filter((_, i) => i !== index);
                              updateDish(dish.id, { ingredients: newIngs });
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
                    updateDish(dish.id, { 
                      ingredients: [...dish.ingredients, { ingredientId: '', amount: 0 }] 
                    })
                  }}
                  className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Добавить в состав
                </button>
              </div>

              <div className="border-t border-gray-200 bg-white p-4 text-xs text-gray-500">
                {dish.productionType === 'batch'
                  ? 'Ингредиенты вводятся на всю партию. Стоимость порции считается только во вкладке аналитики.'
                  : 'Ингредиенты вводятся на одну порцию. Итоговые суммы скрыты до аналитики.'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
