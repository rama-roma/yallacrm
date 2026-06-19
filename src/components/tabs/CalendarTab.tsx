import React from 'react';
import { CalendarDays } from 'lucide-react';
import { useCalculatorStore } from '../../store/useCalculatorStore';

const formatDate = (date: Date) => date.toISOString().slice(0, 10);

const getMonthDays = (month: string) => {
  const [year, monthIndex] = month.split('-').map(Number);
  const firstDay = new Date(year, monthIndex - 1, 1);
  const days: Date[] = [];

  for (let day = new Date(firstDay); day.getMonth() === firstDay.getMonth(); day.setDate(day.getDate() + 1)) {
    days.push(new Date(day));
  }

  return days;
};

export default function CalendarTab() {
  const { combos, calendar, scenarios, updateCalendarDay, updateScenarios } = useCalculatorStore();
  const activeCombos = combos.filter((combo) => combo.active);
  const days = getMonthDays(scenarios.planningMonth);
  const weeks = Array.from({ length: 4 }, (_, weekIndex) => days.slice(weekIndex * 7, weekIndex * 7 + 7));

  const getSelectedCombos = (date: string) => calendar.find((day) => day.date === date)?.comboIds || [];

  const toggleCombo = (date: string, comboId: string, checked: boolean) => {
    const current = getSelectedCombos(date);
    const next = checked ? [...new Set([...current, comboId])] : current.filter((id) => id !== comboId);
    void updateCalendarDay(date, next);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">04 Календарное планирование</h2>
            <p className="text-sm text-gray-500">Месяц, 4 недели и привязка активных комбо к датам продаж</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-gray-700">
              Дата старта работы
              <input
                type="date"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={scenarios.startDate}
                onChange={(e) => updateScenarios({ startDate: e.target.value })}
              />
            </label>
            <label className="text-xs font-medium text-gray-700">
              Месяц планирования
              <input
                type="month"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={scenarios.planningMonth}
                onChange={(e) => updateScenarios({ planningMonth: e.target.value })}
              />
            </label>
          </div>
        </div>

        {activeCombos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 py-10 text-center text-sm text-gray-400">
            Нет активных комбо для планирования
          </div>
        ) : (
          <div className="space-y-5">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800">
                  <CalendarDays className="h-4 w-4 text-yellow-600" />
                  Неделя {weekIndex + 1}
                </div>
                <div className="grid grid-cols-1 divide-y divide-gray-100 md:grid-cols-7 md:divide-x md:divide-y-0">
                  {week.map((day) => {
                    const date = formatDate(day);
                    const selected = getSelectedCombos(date);
                    const disabled = date < scenarios.startDate;

                    return (
                      <div key={date} className={`min-h-44 p-3 ${disabled ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-gray-900">{day.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })}</p>
                          <p className="text-xs text-gray-500">{day.toLocaleDateString('ru-RU', { weekday: 'long' })}</p>
                        </div>
                        <div className="space-y-2">
                          {activeCombos.map((combo) => (
                            <label key={combo.id} className="flex items-start gap-2 text-xs text-gray-700">
                              <input
                                type="checkbox"
                                disabled={disabled}
                                checked={selected.includes(combo.id)}
                                onChange={(e) => toggleCombo(date, combo.id, e.target.checked)}
                                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-500"
                              />
                              <span className="leading-4">{combo.name || 'Без названия'}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
