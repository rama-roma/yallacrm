import React, { useState } from 'react';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, Pencil, Check } from 'lucide-react';

export default function IngredientsTab() {
  const { ingredients, addIngredient, updateIngredient, removeIngredient } = useCalculatorStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    const newId = uuidv4();
    addIngredient({
      id: newId,
      name: '',
      unit: 'кг',
      priceNow: 0,
      volumePrices: { s1: 0, s2: 0, s3: 0 }
    });
    setEditingId(newId);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">01 Ингредиенты</h2>
          <p className="text-sm text-gray-500">Справочник продуктов и ступенчатых закупочных цен</p>
        </div>
        <button 
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Добавить ингредиент
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="py-3 px-4 rounded-tl-lg">Название</th>
              <th className="py-3 px-4">Ед. изм.</th>
              <th className="py-3 px-4">Цена СЕЙЧАС (TJS)</th>
              <th className="py-3 px-4">Цена при объеме +30</th>
              <th className="py-3 px-4">Цена при объеме +70</th>
              <th className="py-3 px-4">Цена при объеме +150</th>
              <th className="py-3 px-4 rounded-tr-lg w-24 text-right">Действия</th>
            </tr>
          </thead>
          <tbody>
            {ingredients.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">Нет добавленных ингредиентов</td>
              </tr>
            ) : ingredients.map((item) => {
              const isEditing = editingId === item.id;

              return (
                <tr key={item.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="py-2 px-4">
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        value={item.name}
                        onChange={e => updateIngredient(item.id, { name: e.target.value })}
                        placeholder="Напр. Говядина"
                      />
                    ) : (
                      <span className="font-medium text-gray-900">{item.name || '—'}</span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {isEditing ? (
                      <select 
                        className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        value={item.unit}
                        onChange={e => updateIngredient(item.id, { unit: e.target.value })}
                      >
                        <option value="кг">кг</option>
                        <option value="л">л</option>
                        <option value="шт">шт</option>
                        <option value="г">г</option>
                      </select>
                    ) : (
                      <span>{item.unit}</span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {isEditing ? (
                      <input 
                        type="number" 
                        min="0"
                        className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        value={item.priceNow || ''}
                        onChange={e => updateIngredient(item.id, { priceNow: parseFloat(e.target.value) || 0 })}
                      />
                    ) : (
                      <span>{item.priceNow.toLocaleString('ru-RU')}</span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {isEditing ? (
                      <input 
                        type="number" 
                        min="0"
                        className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        value={item.volumePrices.s1 || ''}
                        onChange={e => updateIngredient(item.id, { volumePrices: { ...item.volumePrices, s1: parseFloat(e.target.value) || 0 } })}
                      />
                    ) : (
                      <span>{item.volumePrices.s1.toLocaleString('ru-RU')}</span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {isEditing ? (
                      <input 
                        type="number" 
                        min="0"
                        className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        value={item.volumePrices.s2 || ''}
                        onChange={e => updateIngredient(item.id, { volumePrices: { ...item.volumePrices, s2: parseFloat(e.target.value) || 0 } })}
                      />
                    ) : (
                      <span>{item.volumePrices.s2.toLocaleString('ru-RU')}</span>
                    )}
                  </td>
                  <td className="py-2 px-4">
                    {isEditing ? (
                      <input 
                        type="number" 
                        min="0"
                        className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                        value={item.volumePrices.s3 || ''}
                        onChange={e => updateIngredient(item.id, { volumePrices: { ...item.volumePrices, s3: parseFloat(e.target.value) || 0 } })}
                      />
                    ) : (
                      <span>{item.volumePrices.s3.toLocaleString('ru-RU')}</span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-right whitespace-nowrap">
                    {isEditing ? (
                      <button 
                        onClick={() => setEditingId(null)}
                        className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors mr-1"
                        title="Сохранить"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    ) : (
                      <button 
                        onClick={() => setEditingId(item.id)}
                        className="p-1.5 text-blue-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors mr-1"
                        title="Редактировать"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      onClick={() => removeIngredient(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
