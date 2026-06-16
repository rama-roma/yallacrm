import React from 'react';
import { useCalculatorStore } from '../store/useCalculatorStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Cell,
  AreaChart, Area
} from 'recharts';

export default function Dashboard() {
  const { ingredients, dishes, combos, costs, scenarios } = useCalculatorStore();

  const getDishCosts = (dishId: string) => {
    const dish = dishes.find(d => d.id === dishId);
    if (!dish) return { now: 0, bulk: 0 };
    let now = 0, bulk = 0;
    dish.ingredients.forEach(di => {
      const ing = ingredients.find(i => i.id === di.ingredientId);
      if (ing) {
        now += ing.priceNow * di.amount;
        bulk += ing.priceBulk * di.amount;
      }
    });
    return { now, bulk };
  };

  // Average combo calculation
  let avgPrice = 0;
  let avgFcNow = 0;
  let avgFcBulk = 0;

  if (combos.length > 0) {
    let totalPrice = 0;
    let totalFcNow = 0;
    let totalFcBulk = 0;

    combos.forEach(combo => {
      totalPrice += combo.price;
      let fcNow = combo.packagingCost;
      let fcBulk = combo.packagingCost;
      combo.dishIds.forEach(dishId => {
        const dCosts = getDishCosts(dishId);
        fcNow += dCosts.now;
        fcBulk += dCosts.bulk;
      });
      totalFcNow += fcNow;
      totalFcBulk += fcBulk;
    });

    avgPrice = totalPrice / combos.length;
    avgFcNow = totalFcNow / combos.length;
    avgFcBulk = totalFcBulk / combos.length;
  }

  const fixedCostsMonth = costs.reduce((sum, cost) => sum + cost.amount, 0);

  // Volumes per month
  const vCurrent = scenarios.currentVolume * scenarios.workingDays;
  const vS1 = (scenarios.currentVolume + scenarios.s1) * scenarios.workingDays;
  const vS2 = (scenarios.currentVolume + scenarios.s2) * scenarios.workingDays;
  const vS3 = (scenarios.currentVolume + scenarios.s3) * scenarios.workingDays;

  const calculateMetrics = (volume: number, fcType: 'now' | 'bulk') => {
    const revenue = volume * avgPrice;
    const foodCost = volume * (fcType === 'now' ? avgFcNow : avgFcBulk);
    const contribution = revenue - foodCost;
    const profit = contribution - fixedCostsMonth;
    
    return { revenue, foodCost, contribution, profit };
  };

  const mCurrent = calculateMetrics(vCurrent, 'now');
  const mS1 = calculateMetrics(vS1, 'bulk');
  const mS2 = calculateMetrics(vS2, 'bulk');
  const mS3 = calculateMetrics(vS3, 'bulk');

  const formatMoney = (val: number) => val.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
  
  const toUSD = (val: number) => {
    if (!scenarios.exchangeRate) return 0;
    return val / scenarios.exchangeRate;
  };

  const renderCell = (valTJS: number) => (
    <div className="flex flex-col">
      <span className="font-semibold text-gray-900">{formatMoney(valTJS)}</span>
      {scenarios.exchangeRate > 0 && (
        <span className="text-xs text-gray-500">${formatMoney(toUSD(valTJS))}</span>
      )}
    </div>
  );

  const profitData = [
    { name: 'Сейчас', value: mCurrent.profit },
    { name: `+${scenarios.s1}`, value: mS1.profit },
    { name: `+${scenarios.s2}`, value: mS2.profit },
    { name: `+${scenarios.s3}`, value: mS3.profit },
  ];

  const maxProfitIndex = profitData.reduce((iMax, x, i, arr) => x.value > arr[iMax].value ? i : iMax, 0);

  // For expense structure (per portion calculation to show dilution of fixed costs)
  // We want to show: Average Revenue per Combo = FoodCost per Combo + FixedCost per Combo + Profit per Combo
  const getPerPortionStructure = (metrics: ReturnType<typeof calculateMetrics>, volume: number, name: string) => {
    if (volume === 0) return { name, foodCost: 0, fixedCost: 0, profit: 0 };
    return {
      name,
      foodCost: metrics.foodCost / volume,
      fixedCost: fixedCostsMonth / volume,
      profit: metrics.profit / volume,
      price: avgPrice
    };
  };

  const structureData = [
    getPerPortionStructure(mCurrent, vCurrent, 'Сейчас'),
    getPerPortionStructure(mS1, vS1, `+${scenarios.s1}`),
    getPerPortionStructure(mS2, vS2, `+${scenarios.s2}`),
    getPerPortionStructure(mS3, vS3, `+${scenarios.s3}`),
  ];

  return (
    <div className="space-y-6">
      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">Аналитика и Сравнение (в месяц)</h2>
          <p className="text-sm text-gray-500">Показатели бизнеса до и после сотрудничества</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-600">
                <th className="py-4 px-6 font-medium">Метрика</th>
                <th className="py-4 px-6 font-medium">СЕЙЧАС<br/><span className="text-xs font-normal text-gray-400">({vCurrent} порц/мес)</span></th>
                <th className="py-4 px-6 font-medium">СЦЕНАРИЙ +{scenarios.s1}<br/><span className="text-xs font-normal text-gray-400">({vS1} порц/мес)</span></th>
                <th className="py-4 px-6 font-medium">СЦЕНАРИЙ +{scenarios.s2}<br/><span className="text-xs font-normal text-gray-400">({vS2} порц/мес)</span></th>
                <th className="py-4 px-6 font-medium bg-yellow-50/50 text-yellow-800">СЦЕНАРИЙ +{scenarios.s3}<br/><span className="text-xs font-normal text-yellow-600/70">({vS3} порц/мес)</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-6 text-gray-600">Выручка</td>
                <td className="py-3 px-6">{renderCell(mCurrent.revenue)}</td>
                <td className="py-3 px-6">{renderCell(mS1.revenue)}</td>
                <td className="py-3 px-6">{renderCell(mS2.revenue)}</td>
                <td className="py-3 px-6 bg-yellow-50/30">{renderCell(mS3.revenue)}</td>
              </tr>
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-6 text-gray-600">Общий фудкост</td>
                <td className="py-3 px-6">{renderCell(mCurrent.foodCost)}</td>
                <td className="py-3 px-6">{renderCell(mS1.foodCost)}</td>
                <td className="py-3 px-6">{renderCell(mS2.foodCost)}</td>
                <td className="py-3 px-6 bg-yellow-50/30">{renderCell(mS3.foodCost)}</td>
              </tr>
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-6 text-gray-600">Контрибуция</td>
                <td className="py-3 px-6">{renderCell(mCurrent.contribution)}</td>
                <td className="py-3 px-6">{renderCell(mS1.contribution)}</td>
                <td className="py-3 px-6">{renderCell(mS2.contribution)}</td>
                <td className="py-3 px-6 bg-yellow-50/30">{renderCell(mS3.contribution)}</td>
              </tr>
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-6 text-gray-600">Постоянные расходы</td>
                <td className="py-3 px-6">{renderCell(fixedCostsMonth)}</td>
                <td className="py-3 px-6">{renderCell(fixedCostsMonth)}</td>
                <td className="py-3 px-6">{renderCell(fixedCostsMonth)}</td>
                <td className="py-3 px-6 bg-yellow-50/30">{renderCell(fixedCostsMonth)}</td>
              </tr>
              <tr className="bg-gray-50 font-medium">
                <td className="py-4 px-6 text-gray-900">Операционная прибыль</td>
                <td className="py-4 px-6 text-lg">{renderCell(mCurrent.profit)}</td>
                <td className="py-4 px-6 text-lg">{renderCell(mS1.profit)}</td>
                <td className="py-4 px-6 text-lg">{renderCell(mS2.profit)}</td>
                <td className="py-4 px-6 text-lg bg-yellow-100/50">{renderCell(mS3.profit)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Динамика чистой прибыли</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} tickFormatter={(value) => `${value / 1000}k`} />
                <RechartsTooltip 
                  cursor={{fill: 'transparent'}}
                  formatter={(value: number) => [`${formatMoney(value)} TJS`, 'Прибыль']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {profitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === maxProfitIndex ? '#eab308' : '#93c5fd'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Structure Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Структура себестоимости (на 1 порцию)</h3>
          <p className="text-sm text-gray-500 mb-6">Падение доли фудкоста и размазывание пост. расходов</p>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={structureData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                <RechartsTooltip 
                  formatter={(value: number) => [`${value.toFixed(1)} TJS`]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Area type="monotone" dataKey="profit" stackId="1" stroke="#eab308" fill="#fef08a" name="Прибыль" />
                <Area type="monotone" dataKey="fixedCost" stackId="1" stroke="#ef4444" fill="#fecaca" name="Пост. Расходы" />
                <Area type="monotone" dataKey="foodCost" stackId="1" stroke="#3b82f6" fill="#bfdbfe" name="Фудкост" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
