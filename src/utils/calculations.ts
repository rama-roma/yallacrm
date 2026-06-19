import { CalculatorData } from '../store/useCalculatorStore';

export type ScenarioKey = 'current' | 's1' | 's2' | 's3';

export interface ScenarioSummary {
  key: ScenarioKey;
  label: string;
  dailyVolume: number;
  plannedDays: number;
  volume: number;
  revenue: number;
  foodCost: number;
  fixedCosts: number;
  contribution: number;
  profit: number;
  weightedPrice: number;
  weightedFoodCost: number;
}

export interface PulsePoint {
  date: string;
  day: number;
  week: number;
  profit: number;
}

const scenarioLabels: Record<ScenarioKey, string> = {
  current: 'Сейчас',
  s1: 'Сценарий 1',
  s2: 'Сценарий 2',
  s3: 'Сценарий 3'
};

export const formatMoney = (val: number) => val.toLocaleString('ru-RU', { maximumFractionDigits: 0 });

export const getScenarioVolume = (data: CalculatorData, scenario: ScenarioKey) => {
  const { currentVolume, s1, s2, s3 } = data.scenarios;
  if (scenario === 's1') return currentVolume + s1;
  if (scenario === 's2') return currentVolume + s2;
  if (scenario === 's3') return currentVolume + s3;
  return currentVolume;
};

export const getIngredientScenarioPrice = (data: CalculatorData, ingredientId: string, scenario: ScenarioKey) => {
  const ingredient = data.ingredients.find((item) => item.id === ingredientId);
  if (!ingredient) return 0;
  if (scenario === 'current') {
    return ingredient.baseAmount > 0 ? ingredient.baseTotal / ingredient.baseAmount : ingredient.priceNow;
  }

  const amount = ingredient.volumeAmounts[scenario] ?? 0;
  const total = ingredient.volumeTotals[scenario] ?? 0;
  return amount > 0 ? total / amount : ingredient.volumePrices[scenario] || ingredient.priceNow;
};

export const getDishCost = (data: CalculatorData, dishId: string, scenario: ScenarioKey) => {
  const dish = data.dishes.find((item) => item.id === dishId);
  if (!dish) return 0;

  const total = dish.ingredients.reduce((sum, dishIngredient) => {
    return sum + getIngredientScenarioPrice(data, dishIngredient.ingredientId, scenario) * dishIngredient.amount;
  }, 0);

  return dish.productionType === 'batch' ? total / Math.max(1, dish.batchYield) : total;
};

export const getComboFoodCost = (data: CalculatorData, comboId: string, scenario: ScenarioKey) => {
  const combo = data.combos.find((item) => item.id === comboId);
  if (!combo) return 0;

  return combo.dishIds.reduce((sum, dishId) => sum + getDishCost(data, dishId, scenario), combo.packagingCost);
};

export const getActiveCombos = (data: CalculatorData) => data.combos.filter((combo) => combo.active);

export const getSalesMixTotal = (data: CalculatorData) => (
  getActiveCombos(data).reduce((sum, combo) => sum + combo.salesMix, 0)
);

export const getPlannedDates = (data: CalculatorData) => {
  const start = data.scenarios.startDate;
  return data.calendar
    .filter((day) => day.date >= start && day.comboIds.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const getPlannedDaysCount = (data: CalculatorData) => {
  const planned = getPlannedDates(data).length;
  return planned > 0 ? planned : data.scenarios.workingDays;
};

export const getWeightedComboMetrics = (data: CalculatorData, scenario: ScenarioKey, allowedComboIds?: string[]) => {
  const activeCombos = getActiveCombos(data).filter((combo) => !allowedComboIds || allowedComboIds.includes(combo.id));
  const salesMixTotal = activeCombos.reduce((sum, combo) => sum + combo.salesMix, 0);
  const denominator = salesMixTotal > 0 ? salesMixTotal : activeCombos.length || 1;

  return activeCombos.reduce(
    (total, combo) => {
      const weight = salesMixTotal > 0 ? combo.salesMix / denominator : 1 / denominator;
      return {
        price: total.price + combo.price * weight,
        foodCost: total.foodCost + getComboFoodCost(data, combo.id, scenario) * weight
      };
    },
    { price: 0, foodCost: 0 }
  );
};

export const getScenarioSummaries = (data: CalculatorData): ScenarioSummary[] => {
  const fixedCosts = data.costs.reduce((sum, cost) => sum + cost.amount, 0);
  const plannedDays = getPlannedDaysCount(data);

  return (['current', 's1', 's2', 's3'] as ScenarioKey[]).map((key) => {
    const dailyVolume = getScenarioVolume(data, key);
    const volume = dailyVolume * plannedDays;
    const weighted = getWeightedComboMetrics(data, key);
    const revenue = volume * weighted.price;
    const foodCost = volume * weighted.foodCost;
    const contribution = revenue - foodCost;

    return {
      key,
      label: key === 'current' ? scenarioLabels[key] : `${scenarioLabels[key]} +${data.scenarios[key]}`,
      dailyVolume,
      plannedDays,
      volume,
      revenue,
      foodCost,
      fixedCosts,
      contribution,
      profit: contribution - fixedCosts,
      weightedPrice: weighted.price,
      weightedFoodCost: weighted.foodCost
    };
  });
};

export const getPulseData = (data: CalculatorData, scenario: ScenarioKey = 's3'): PulsePoint[] => {
  const dates = getPlannedDates(data);
  const fixedCosts = data.costs.reduce((sum, cost) => sum + cost.amount, 0);
  const fixedPerDay = fixedCosts / Math.max(1, dates.length || data.scenarios.workingDays);
  const dailyVolume = getScenarioVolume(data, scenario);
  let cumulative = 0;

  return dates.map((day, index) => {
    const weighted = getWeightedComboMetrics(data, scenario, day.comboIds);
    cumulative += dailyVolume * (weighted.price - weighted.foodCost) - fixedPerDay;

    return {
      date: day.date,
      day: index + 1,
      week: Math.floor(index / 7) + 1,
      profit: cumulative
    };
  });
};

export const getWaterfallData = (data: CalculatorData, scenario: ScenarioKey = 's3') => {
  const summary = getScenarioSummaries(data).find((item) => item.key === scenario) || getScenarioSummaries(data)[0];
  const fixedPerCombo = summary.volume > 0 ? summary.fixedCosts / summary.volume : 0;

  return [
    { name: 'Выручка', value: summary.weightedPrice, fill: '#2563eb' },
    { name: 'Фудкост', value: -summary.weightedFoodCost, fill: '#dc2626' },
    { name: 'Постоянные', value: -fixedPerCombo, fill: '#f59e0b' },
    { name: 'Чистая прибыль', value: summary.weightedPrice - summary.weightedFoodCost - fixedPerCombo, fill: '#16a34a' }
  ];
};
