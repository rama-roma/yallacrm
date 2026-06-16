import * as XLSX from 'xlsx';
import { CalculatorState } from '../store/useCalculatorStore';

export const exportJSON = (state: CalculatorState, filename: string) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", filename + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

export const exportXLSX = (state: CalculatorState, filename: string) => {
  const wb = XLSX.utils.book_new();

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
    'ID': i.id,
    'Название': i.name,
    'Единица': i.unit,
    'Цена СЕЙЧАС': i.priceNow,
    'Цена ОПТОМ': i.priceBulk
  }));
  const wsIngredients = XLSX.utils.json_to_sheet(ingredientsData);
  XLSX.utils.book_append_sheet(wb, wsIngredients, "Ингредиенты");

  // 3. Dishes
  const dishesData = state.dishes.map(d => ({
    'ID': d.id,
    'Название': d.name,
    'Ингредиенты (ID:Кол-во)': d.ingredients.map(di => `${di.ingredientId}:${di.amount}`).join('; ')
  }));
  const wsDishes = XLSX.utils.json_to_sheet(dishesData);
  XLSX.utils.book_append_sheet(wb, wsDishes, "Блюда");

  // 4. Combos
  const combosData = state.combos.map(c => ({
    'ID': c.id,
    'Название': c.name,
    'Блюда (ID)': c.dishIds.join('; '),
    'Стоимость упаковки': c.packagingCost,
    'Цена продажи': c.price
  }));
  const wsCombos = XLSX.utils.json_to_sheet(combosData);
  XLSX.utils.book_append_sheet(wb, wsCombos, "Комбо");

  // 5. Costs
  const costsData = state.costs.map(c => ({
    'ID': c.id,
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
