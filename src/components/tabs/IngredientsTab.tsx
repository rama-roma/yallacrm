import React, { useState } from 'react';
import { useCalculatorStore } from '../../store/useCalculatorStore';
import { v4 as uuidv4 } from 'uuid';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';

const scenarioStyles = {
  current: {
    label: 'Сейчас',
    tone: 'border-sky-200 bg-sky-50',
    heading: 'text-sky-900',
    ring: 'focus:ring-sky-500'
  },
  s1: {
    label: '+30',
    tone: 'border-emerald-200 bg-emerald-50',
    heading: 'text-emerald-900',
    ring: 'focus:ring-emerald-500'
  },
  s2: {
    label: '+70',
    tone: 'border-amber-200 bg-amber-50',
    heading: 'text-amber-900',
    ring: 'focus:ring-amber-500'
  },
  s3: {
    label: '+150',
    tone: 'border-violet-200 bg-violet-50',
    heading: 'text-violet-900',
    ring: 'focus:ring-violet-500'
  }
};

type ScenarioKey = keyof typeof scenarioStyles;

const scenarioOrder: ScenarioKey[] = ['current', 's1', 's2', 's3'];

const inputClass = (ring = 'focus:ring-yellow-500') => (
  `w-full rounded border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 ${ring}`
);

export default function IngredientsTab() {
  const { ingredients, addIngredient, updateIngredient, removeIngredient } = useCalculatorStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    const newId = uuidv4();
    addIngredient({
      id: newId,
      name: '',
      unit: 'кг',
      baseAmount: 1,
      volumeAmounts: { s1: 1, s2: 1, s3: 1 },
      baseTotal: 0,
      volumeTotals: { s1: 0, s2: 0, s3: 0 },
      priceNow: 0,
      volumePrices: { s1: 0, s2: 0, s3: 0 }
    });
    setEditingId(newId);
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">01 Ингредиенты</h2>
          <p className="text-sm text-gray-500">Закупка по сценариям: количество и итоговая сумма. Цена за 1 единицу считается автоматически.</p>
        </div>
        <button
          onClick={handleAdd}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-600"
        >
          <Plus className="h-4 w-4" />
          Добавить ингредиент
        </button>
      </div>

      {ingredients.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400">
          Нет добавленных ингредиентов
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {ingredients.map((item) => {
            const isEditing = editingId === item.id;
            const amounts = {
              current: item.baseAmount ?? 1,
              s1: item.volumeAmounts?.s1 ?? item.baseAmount ?? 1,
              s2: item.volumeAmounts?.s2 ?? item.baseAmount ?? 1,
              s3: item.volumeAmounts?.s3 ?? item.baseAmount ?? 1
            };
            const totals = {
              current: item.baseTotal ?? (item.baseAmount ?? 0) * item.priceNow,
              s1: item.volumeTotals?.s1 ?? (item.volumeAmounts?.s1 ?? 0) * item.volumePrices.s1,
              s2: item.volumeTotals?.s2 ?? (item.volumeAmounts?.s2 ?? 0) * item.volumePrices.s2,
              s3: item.volumeTotals?.s3 ?? (item.volumeAmounts?.s3 ?? 0) * item.volumePrices.s3
            };

            return (
              <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-[1fr_120px]">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Название</label>
                      {isEditing ? (
                        <input
                          type="text"
                          className={inputClass()}
                          value={item.name}
                          onChange={(e) => updateIngredient(item.id, { name: e.target.value })}
                          placeholder="Напр. Рис"
                        />
                      ) : (
                        <div className="min-h-10 rounded border border-transparent py-2 text-lg font-semibold text-gray-900">
                          {item.name || '-'}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">Ед. изм.</label>
                      {isEditing ? (
                        <select
                          className={inputClass()}
                          value={item.unit}
                          onChange={(e) => updateIngredient(item.id, { unit: e.target.value })}
                        >
                          <option value="кг">кг</option>
                          <option value="л">л</option>
                          <option value="шт">шт</option>
                          <option value="г">г</option>
                        </select>
                      ) : (
                        <div className="min-h-10 rounded border border-gray-100 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
                          {item.unit}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-1">
                    {isEditing ? (
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded p-2 text-green-600 transition-colors hover:bg-green-50 hover:text-green-700"
                        title="Сохранить"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingId(item.id)}
                        className="rounded p-2 text-blue-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        title="Редактировать"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => removeIngredient(item.id)}
                      className="rounded p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {scenarioOrder.map((scenario) => {
                    const style = scenarioStyles[scenario];
                    const amount = amounts[scenario];
                    const total = totals[scenario];
                    const unitPrice = amount > 0 ? total / amount : 0;

                    return (
                      <div key={scenario} className={`rounded-lg border p-3 ${style.tone}`}>
                        <div className={`mb-3 text-sm font-semibold ${style.heading}`}>{style.label}</div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="mb-1 block text-[11px] font-medium text-gray-500">Закупка</label>
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                className={inputClass(style.ring)}
                                value={amount || ''}
                                onChange={(e) => {
                                  const nextAmount = parseFloat(e.target.value) || 0;
                                  if (scenario === 'current') {
                                    updateIngredient(item.id, {
                                      baseAmount: nextAmount,
                                      priceNow: nextAmount > 0 ? total / nextAmount : 0
                                    });
                                    return;
                                  }
                                  updateIngredient(item.id, {
                                    volumeAmounts: { ...item.volumeAmounts, [scenario]: nextAmount },
                                    volumePrices: {
                                      ...item.volumePrices,
                                      [scenario]: nextAmount > 0 ? total / nextAmount : 0
                                    }
                                  });
                                }}
                              />
                            ) : (
                              <div className="rounded bg-white/70 px-2 py-2 text-sm text-gray-800">{amount.toLocaleString('ru-RU')}</div>
                            )}
                          </div>
                          <div>
                            <label className="mb-1 block text-[11px] font-medium text-gray-500">Сумма</label>
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                className={inputClass(style.ring)}
                                value={total || ''}
                                onChange={(e) => {
                                  const nextTotal = parseFloat(e.target.value) || 0;
                                  if (scenario === 'current') {
                                    updateIngredient(item.id, {
                                      baseTotal: nextTotal,
                                      priceNow: amount > 0 ? nextTotal / amount : 0
                                    });
                                    return;
                                  }
                                  updateIngredient(item.id, {
                                    volumeTotals: { ...item.volumeTotals, [scenario]: nextTotal },
                                    volumePrices: {
                                      ...item.volumePrices,
                                      [scenario]: amount > 0 ? nextTotal / amount : 0
                                    }
                                  });
                                }}
                              />
                            ) : (
                              <div className="rounded bg-white/70 px-2 py-2 text-sm text-gray-800">{total.toLocaleString('ru-RU')}</div>
                            )}
                          </div>
                          <div>
                            <label className="mb-1 block text-[11px] font-medium text-gray-500">Цена за 1</label>
                            <div className="rounded bg-white px-2 py-2 text-sm font-semibold text-gray-900">
                              {unitPrice.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
