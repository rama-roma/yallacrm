import * as XLSX from 'xlsx';
import { CalculatorData, CalculatorState, getCalculatorData } from '../store/useCalculatorStore';

export const exportJSON = (state: CalculatorState, filename: string) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getCalculatorData(state), null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", filename + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const exportXLSX = (state: CalculatorData, filename: string) => {
  const wb = XLSX.utils.book_new();

  // Calculate Dashboard Metrics
  const getDishCosts = (dishId: string) => {
    const dish = state.dishes.find(d => d.id === dishId);
    if (!dish) return { now: 0, bulk: 0 };
    let now = 0, bulk = 0;
    dish.ingredients.forEach(di => {
      const ing = state.ingredients.find(i => i.id === di.ingredientId);
      if (ing) {
        now += ing.priceNow * di.amount;
        bulk += ing.priceBulk * di.amount;
      }
    });
    return { now, bulk };
  };

  let avgPrice = 0, avgFcNow = 0, avgFcBulk = 0;
  if (state.combos.length > 0) {
    let totalPrice = 0, totalFcNow = 0, totalFcBulk = 0;
    state.combos.forEach(combo => {
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
    avgPrice = totalPrice / state.combos.length;
    avgFcNow = totalFcNow / state.combos.length;
    avgFcBulk = totalFcBulk / state.combos.length;
  }

  const fixedCostsMonth = state.costs.reduce((sum, cost) => sum + cost.amount, 0);
  const { currentVolume, workingDays, s1, s2, s3 } = state.scenarios;
  const vCurrent = currentVolume * workingDays;
  const vS1 = (currentVolume + s1) * workingDays;
  const vS2 = (currentVolume + s2) * workingDays;
  const vS3 = (currentVolume + s3) * workingDays;

  const calcMetrics = (volume: number, fcType: 'now' | 'bulk') => {
    const revenue = volume * avgPrice;
    const foodCost = volume * (fcType === 'now' ? avgFcNow : avgFcBulk);
    const contribution = revenue - foodCost;
    const profit = contribution - fixedCostsMonth;
    return { revenue, foodCost, contribution, profit };
  };

  const mCurrent = calcMetrics(vCurrent, 'now');
  const mS1 = calcMetrics(vS1, 'bulk');
  const mS2 = calcMetrics(vS2, 'bulk');
  const mS3 = calcMetrics(vS3, 'bulk');

  // 0. Dashboard / Analytics (FIRST SHEET)
  const dashboardData = [
    { 'Метрика': 'Выручка', 'СЕЙЧАС': mCurrent.revenue, [`Сценарий +${s1}`]: mS1.revenue, [`Сценарий +${s2}`]: mS2.revenue, [`Сценарий +${s3}`]: mS3.revenue },
    { 'Метрика': 'Общий фудкост', 'СЕЙЧАС': mCurrent.foodCost, [`Сценарий +${s1}`]: mS1.foodCost, [`Сценарий +${s2}`]: mS2.foodCost, [`Сценарий +${s3}`]: mS3.foodCost },
    { 'Метрика': 'Контрибуция', 'СЕЙЧАС': mCurrent.contribution, [`Сценарий +${s1}`]: mS1.contribution, [`Сценарий +${s2}`]: mS2.contribution, [`Сценарий +${s3}`]: mS3.contribution },
    { 'Метрика': 'Постоянные расходы', 'СЕЙЧАС': fixedCostsMonth, [`Сценарий +${s1}`]: fixedCostsMonth, [`Сценарий +${s2}`]: fixedCostsMonth, [`Сценарий +${s3}`]: fixedCostsMonth },
    { 'Метрика': 'Операционная прибыль', 'СЕЙЧАС': mCurrent.profit, [`Сценарий +${s1}`]: mS1.profit, [`Сценарий +${s2}`]: mS2.profit, [`Сценарий +${s3}`]: mS3.profit },
  ];
  const wsDashboard = XLSX.utils.json_to_sheet(dashboardData);
  XLSX.utils.book_append_sheet(wb, wsDashboard, "Аналитика (Сводка)");

  // 1. Partner
  const partnerData = [
    { Field: 'Название кухни', Value: state.partner.name },
    { Field: 'Менеджер', Value: state.partner.manager },
    { Field: 'Адрес', Value: state.partner.address },
    { Field: 'Телефон', Value: state.partner.phone },
  ];
  const wsPartner = XLSX.utils.json_to_sheet(partnerData);
  XLSX.utils.book_append_sheet(wb, wsPartner, "Партнер");

  // 2. Ingredients
  const ingredientsData = state.ingredients.map(i => ({
    'Название': i.name,
    'Единица': i.unit,
    'Цена СЕЙЧАС': i.priceNow,
    'Цена ОПТОМ': i.priceBulk
  }));
  const wsIngredients = XLSX.utils.json_to_sheet(ingredientsData);
  XLSX.utils.book_append_sheet(wb, wsIngredients, "Ингредиенты");

  // 3. Dishes
  const dishesData = state.dishes.map(d => ({
    'Название': d.name,
    'Ингредиенты (ID:Кол-во)': d.ingredients.map(di => {
      const ing = state.ingredients.find(i => i.id === di.ingredientId);
      return `${ing ? ing.name : 'Неизвестно'} - ${di.amount}`;
    }).join('; ')
  }));
  const wsDishes = XLSX.utils.json_to_sheet(dishesData);
  XLSX.utils.book_append_sheet(wb, wsDishes, "Блюда");

  // 4. Combos
  const combosData = state.combos.map(c => ({
    'Название': c.name,
    'Блюда': c.dishIds.map(id => {
      const d = state.dishes.find(x => x.id === id);
      return d ? d.name : 'Неизвестно';
    }).join('; '),
    'Стоимость упаковки': c.packagingCost,
    'Цена продажи': c.price
  }));
  const wsCombos = XLSX.utils.json_to_sheet(combosData);
  XLSX.utils.book_append_sheet(wb, wsCombos, "Комбо");

  // 5. Costs
  const costsData = state.costs.map(c => ({
    'Статья расхода': c.name,
    'Сумма': c.amount
  }));
  const wsCosts = XLSX.utils.json_to_sheet(costsData);
  XLSX.utils.book_append_sheet(wb, wsCosts, "Расходы");

  // 6. Scenarios
  const scenariosData = [
    { Field: 'Текущий объем', Value: state.scenarios.currentVolume },
    { Field: 'Рабочих дней', Value: state.scenarios.workingDays },
    { Field: 'Сценарий 1 (доп.)', Value: state.scenarios.s1 },
    { Field: 'Сценарий 2 (доп.)', Value: state.scenarios.s2 },
    { Field: 'Сценарий 3 (доп.)', Value: state.scenarios.s3 },
    { Field: 'Курс USD', Value: state.scenarios.exchangeRate },
  ];
  const wsScenarios = XLSX.utils.json_to_sheet(scenariosData);
  XLSX.utils.book_append_sheet(wb, wsScenarios, "Сценарии");

  XLSX.writeFile(wb, filename + ".xlsx");
};
