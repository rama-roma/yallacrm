import React, { useState } from 'react';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { v4 as uuidv4 } from 'uuid';
import { Calculator, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { formatMoney, getDishCost, ScenarioKey } from '../../utils/calculations';

const scenarios: { key: ScenarioKey; label: string; className: string }[] = [
  { key: 'current', label: 'Сейчас', className: 'border-sky-200 bg-sky-50 text-sky-900' },
  { key: 's1', label: '+30', className: 'border-emerald-200 bg-emerald-50 text-emerald-900' },
  { key: 's2', label: '+70', className: 'border-amber-200 bg-amber-50 text-amber-900' },
  { key: 's3', label: '+150', className: 'border-violet-200 bg-violet-50 text-violet-900' }
];

export default function DishesTab() {
  const state = useCalculatorStore();
  const { ingredients, dishes, addDish, updateDish, removeDish } = state;
  const [openCosts, setOpenCosts] = useState<Record<string, boolean>>({});

  const handleAddDish = () => {
    addDish({
      id: uuidv4(),
      name: 'Новое блюдо',
      productionType: 'single',
      batchYield: 1,
      ingredients: []
    });
  };

  const toggleCosts = (dishId: string) => {
    setOpenCosts((current) => ({ ...current, [dishId]: !current[dishId] }));
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">02 Блюда</h2>
          <p className="text-sm text-gray-500">Техкарты с расчетом на порцию или на производственную партию</p>
        </div>
        <button
          onClick={handleAddDish}
          className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-600"
        >
          <Plus className="h-4 w-4" />
          Создать блюдо
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {dishes.length === 0 ? (
          <div className="col-span-full rounded-lg border border-dashed border-gray-300 py-8 text-center text-gray-400">
            Нет добавленных блюд
          </div>
        ) : dishes.map((dish) => {
          const isCostOpen = Boolean(openCosts[dish.id]);

          return (
            <div key={dish.id} className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
                <input
                  type="text"
                  value={dish.name}
                  onChange={(e) => updateDish(dish.id, { name: e.target.value })}
                  className="w-2/3 rounded border border-transparent px-2 py-1 text-lg font-semibold transition-colors hover:border-gray-300 focus:border-yellow-500 focus:bg-white focus:outline-none"
                  placeholder="Название блюда"
                />
                <button
                  onClick={() => removeDish(dish.id)}
                  className="rounded p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 p-4">
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

                <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-500">Состав</h4>
                {dish.ingredients.length === 0 ? (
                  <p className="mb-4 text-sm text-gray-400">Состав пуст. Добавьте ингредиенты.</p>
                ) : (
                  <div className="mb-4 space-y-2">
                    {dish.ingredients.map((di, index) => {
                      const ing = ingredients.find((i) => i.id === di.ingredientId);
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <select
                            className="flex-1 rounded border border-gray-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                            value={di.ingredientId}
                            onChange={(e) => {
                              const newIngs = [...dish.ingredients];
                              newIngs[index].ingredientId = e.target.value;
                              updateDish(dish.id, { ingredients: newIngs });
                            }}
                          >
                            <option value="">Выберите...</option>
                            {ingredients.map((i) => (
                              <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-24 rounded border border-gray-200 bg-white px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                            value={di.amount || ''}
                            placeholder="Расход"
                            onChange={(e) => {
                              const newIngs = [...dish.ingredients];
                              newIngs[index].amount = parseFloat(e.target.value) || 0;
                              updateDish(dish.id, { ingredients: newIngs });
                            }}
                          />
                          <span className="w-8 text-sm text-gray-500">{ing?.unit || ''}</span>
                          <button
                            onClick={() => {
                              const newIngs = dish.ingredients.filter((_, i) => i !== index);
                              updateDish(dish.id, { ingredients: newIngs });
                            }}
                            className="p-1 text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <button
                  onClick={() => {
                    updateDish(dish.id, {
                      ingredients: [...dish.ingredients, { ingredientId: '', amount: 0 }]
                    });
                  }}
                  className="mb-4 flex items-center gap-1 text-sm font-medium text-yellow-600 hover:text-yellow-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Добавить в состав
                </button>

                <button
                  type="button"
                  onClick={() => toggleCosts(dish.id)}
                  className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <span className="inline-flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-yellow-600" />
                    {isCostOpen ? 'Скрыть суммы' : 'Показать суммы'}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isCostOpen ? 'rotate-180' : ''}`} />
                </button>

                {isCostOpen && (
                  <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {scenarios.map((scenario) => {
                      const costPerPortion = getDishCost(state, dish.id, scenario.key);
                      const batchTotal = costPerPortion * Math.max(1, dish.batchYield || 1);

                      return (
                        <div key={scenario.key} className={`rounded-lg border p-3 ${scenario.className}`}>
                          <div className="mb-1 text-xs font-semibold">{scenario.label}</div>
                          <div className="text-sm">
                            <span className="text-gray-600">Порция: </span>
                            <span className="font-semibold text-gray-900">{formatMoney(costPerPortion)} TJS</span>
                          </div>
                          {dish.productionType === 'batch' && (
                            <div className="text-sm">
                              <span className="text-gray-600">Партия: </span>
                              <span className="font-semibold text-gray-900">{formatMoney(batchTotal)} TJS</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 bg-white p-4 text-xs text-gray-500">
                {dish.productionType === 'batch'
                  ? 'Ингредиенты вводятся на всю партию. Стоимость порции можно раскрыть кнопкой выше.'
                  : 'Ингредиенты вводятся на одну порцию. Итоговые суммы можно раскрыть кнопкой выше.'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
