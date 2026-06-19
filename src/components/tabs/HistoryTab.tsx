import React from 'react';
import { Clock3, RotateCcw, Trash2 } from 'lucide-react';
import { useCalculatorStore } from '../../store/useCalculatorStore';

export default function HistoryTab() {
  const {
    history,
    restoreHistoryEntry,
    removeHistoryEntry,
    clearHistory,
    isSaving
  } = useCalculatorStore();

  const handleRestore = async (id: string) => {
    if (!window.confirm('Восстановить данные из этого сохранения? Текущие несохраненные изменения будут заменены.')) {
      return;
    }

    await restoreHistoryEntry(id);
  };

  const handleClear = async () => {
    if (!window.confirm('Очистить всю историю сохранений?')) {
      return;
    }

    await clearHistory();
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">05 История сохранений</h2>
          <p className="text-sm text-gray-500">Снимки создаются при ручном сохранении JSON-файла</p>
        </div>
        <button
          onClick={handleClear}
          disabled={history.length === 0 || isSaving}
          className="inline-flex items-center gap-2 self-start rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          Очистить историю
        </button>
      </div>

      {history.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-10 text-center text-gray-400">
          История пока пустая. Нажмите «Сохранить (.json)», чтобы создать первый снимок.
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => {
            const totalItems =
              entry.data.ingredients.length +
              entry.data.dishes.length +
              entry.data.combos.length +
              entry.data.costs.length;

            return (
              <div
                key={entry.id}
                className="flex flex-col gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <Clock3 className="h-4 w-4 shrink-0 text-yellow-600" />
                    <span className="truncate">{entry.label}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(entry.savedAt).toLocaleString('ru-RU')} · {entry.data.partner.name || 'Партнер без названия'}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Ингредиенты: {entry.data.ingredients.length}, блюда: {entry.data.dishes.length}, комбо: {entry.data.combos.length}, расходы: {entry.data.costs.length}, всего записей: {totalItems}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => handleRestore(entry.id)}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Восстановить
                  </button>
                  <button
                    onClick={() => removeHistoryEntry(entry.id)}
                    disabled={isSaving}
                    className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
