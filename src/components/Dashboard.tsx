import React from 'react';
import { useCalculatorStore } from '../store/useCalculatorStore';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell,
  PieChart, Pie, LineChart, Line
} from 'recharts';
import {
  formatMoney,
  getActiveCombos,
  getPulseData,
  getSalesMixTotal,
  getScenarioSummaries,
  getWaterfallData
} from '../utils/calculations';

const COLORS = ['#2563eb', '#16a34a', '#eab308', '#dc2626', '#7c3aed', '#0f766e'];

export default function Dashboard() {
  const state = useCalculatorStore();
  const summaries = getScenarioSummaries(state);
  const activeCombos = getActiveCombos(state);
  const salesMixTotal = getSalesMixTotal(state);
  const pulseData = getPulseData(state, 's3');
  const waterfallData = getWaterfallData(state, 's3');
  const profitData = summaries.map((item) => ({ name: item.label, value: item.profit }));
  const pieData = activeCombos.map((combo) => ({ name: combo.name || 'Без названия', value: combo.salesMix }));
  const maxProfitIndex = profitData.reduce((iMax, x, i, arr) => x.value > arr[iMax].value ? i : iMax, 0);

  const toUSD = (val: number) => state.scenarios.exchangeRate > 0 ? val / state.scenarios.exchangeRate : 0;

  const renderCell = (valTJS: number) => (
    <div className="flex flex-col">
      <span className="font-semibold text-gray-900">{formatMoney(valTJS)}</span>
      {state.scenarios.exchangeRate > 0 && (
        <span className="text-xs text-gray-500">${formatMoney(toUSD(valTJS))}</span>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Аналитика, расходы и объемы</h2>
            <p className="text-sm text-gray-500">Финальные расчеты появляются только на этой вкладке</p>
          </div>
          <div className={`rounded-full px-3 py-1 text-xs font-semibold ${Math.abs(salesMixTotal - 100) < 0.01 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            Sales Mix: {salesMixTotal.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50/50 p-6">
          <h3 className="text-lg font-bold text-gray-900">Сравнение сценариев</h3>
          <p className="text-sm text-gray-500">Расчет учитывает календарь, Sales Mix и ступенчатые цены ингредиентов</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-gray-600">
                <th className="px-6 py-4 font-medium">Метрика</th>
                {summaries.map((summary) => (
                  <th key={summary.key} className="px-6 py-4 font-medium">
                    {summary.label}<br />
                    <span className="text-xs font-normal text-gray-400">{summary.volume} порц. за {summary.plannedDays} дн.</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ['Средняя цена комбо', 'weightedPrice'],
                ['Средневзвешенный фудкост', 'weightedFoodCost'],
                ['Выручка', 'revenue'],
                ['Общий фудкост', 'foodCost'],
                ['Постоянные расходы', 'fixedCosts'],
                ['Операционная прибыль', 'profit']
              ].map(([label, key]) => (
                <tr key={key} className={key === 'profit' ? 'bg-gray-50 font-semibold' : 'hover:bg-gray-50/50'}>
                  <td className="px-6 py-3 text-gray-600">{label}</td>
                  {summaries.map((summary) => (
                    <td key={summary.key} className="px-6 py-3">
                      {renderCell(summary[key as keyof typeof summary] as number)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-gray-900">Динамика чистой прибыли</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} tickFormatter={(value) => `${Number(value) / 1000}k`} />
                <RechartsTooltip formatter={(value: number) => [`${formatMoney(value)} TJS`, 'Прибыль']} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {profitData.map((entry, index) => (
                    <Cell key={entry.name} fill={index === maxProfitIndex ? '#eab308' : '#93c5fd'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-gray-900">Sales Mix</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} label>
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend iconType="circle" />
                <RechartsTooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Доля']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-gray-900">Пульс накопленной операционной прибыли</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pulseData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} tickFormatter={(value) => `${Number(value) / 1000}k`} />
                <RechartsTooltip formatter={(value: number) => [`${formatMoney(value)} TJS`, 'Накопленная прибыль']} />
                <Line type="monotone" dataKey="profit" stroke="#2563eb" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-gray-900">Waterfall одного средневзвешенного комбо</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                <RechartsTooltip formatter={(value: number) => [`${value.toFixed(2)} TJS`]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {waterfallData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
