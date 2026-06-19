import * as XLSX from 'xlsx';
import { CalculatorData, CalculatorState, getCalculatorData, parseCalculatorData, toRussianCalculatorData } from '../store/useCalculatorStore';
import { getScenarioSummaries } from './calculations';

const STATE_SHEET = '_STATE_JSON';

export const exportJSON = (state: CalculatorState, filename: string) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(toRussianCalculatorData(getCalculatorData(state)), null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", filename + ".json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

const setSheetStyle = (ws: XLSX.WorkSheet) => {
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1');
  ws['!cols'] = Array.from({ length: range.e.c + 1 }, () => ({ wch: 22 }));

  for (let row = range.s.r; row <= range.e.r; row += 1) {
    for (let col = range.s.c; col <= range.e.c; col += 1) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = ws[cellRef];
      if (!cell) continue;
      cell.s = {
        font: { name: 'Inter', sz: row === 0 ? 12 : 11, bold: row === 0, color: { rgb: row === 0 ? 'FFFFFF' : '111827' } },
        fill: { fgColor: { rgb: row === 0 ? '111827' : 'FFFFFF' } },
        alignment: { vertical: 'center', wrapText: true },
        border: {
          top: { style: 'thin', color: { rgb: 'E5E7EB' } },
          bottom: { style: 'thin', color: { rgb: 'E5E7EB' } },
          left: { style: 'thin', color: { rgb: 'E5E7EB' } },
          right: { style: 'thin', color: { rgb: 'E5E7EB' } }
        }
      };
    }
  }
};

const appendJsonSheet = (wb: XLSX.WorkBook, rows: Record<string, unknown>[], sheetName: string) => {
  const ws = XLSX.utils.json_to_sheet(rows);
  setSheetStyle(ws);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
};

export const exportXLSX = (state: CalculatorData, filename: string) => {
  const wb = XLSX.utils.book_new();
  const summaries = getScenarioSummaries(state);

  appendJsonSheet(wb, summaries.map((summary) => ({
    Сценарий: summary.label,
    'Порций в день': summary.dailyVolume,
    'Плановых дней': summary.plannedDays,
    'Порций всего': summary.volume,
    'Средняя цена': summary.weightedPrice,
    'Средний фудкост': summary.weightedFoodCost,
    Выручка: summary.revenue,
    Фудкост: summary.foodCost,
    'Постоянные расходы': summary.fixedCosts,
    Прибыль: summary.profit
  })), 'Аналитика');

  appendJsonSheet(wb, [
    { Поле: 'Название кухни', Значение: state.partner.name },
    { Поле: 'Менеджер', Значение: state.partner.manager },
    { Поле: 'Адрес', Значение: state.partner.address },
    { Поле: 'Телефон', Значение: state.partner.phone }
  ], 'Партнер');

  appendJsonSheet(wb, state.ingredients.map((i) => ({
    ID: i.id,
    Название: i.name,
    Единица: i.unit,
    'Цена сейчас': i.priceNow,
    'Цена +30': i.volumePrices.s1,
    'Цена +70': i.volumePrices.s2,
    'Цена +150': i.volumePrices.s3
  })), 'Ингредиенты');

  appendJsonSheet(wb, state.dishes.map((d) => ({
    ID: d.id,
    Название: d.name,
    'Тип расчета': d.productionType,
    'Порций на выходе': d.batchYield,
    'Ингредиенты': d.ingredients.map((di) => `${di.ingredientId}:${di.amount}`).join('; ')
  })), 'Блюда');

  appendJsonSheet(wb, state.combos.map((c) => ({
    ID: c.id,
    Название: c.name,
    Активно: c.active ? 'Да' : 'Нет',
    Блюда: c.dishIds.join('; '),
    Упаковка: c.packagingCost,
    'Цена продажи': c.price,
    'Sales Mix %': c.salesMix
  })), 'Комбо');

  appendJsonSheet(wb, state.calendar.map((day) => ({
    Дата: day.date,
    Комбо: day.comboIds.join('; ')
  })), 'Календарь');

  appendJsonSheet(wb, state.costs.map((c) => ({
    ID: c.id,
    Статья: c.name,
    Сумма: c.amount
  })), 'Расходы');

  appendJsonSheet(wb, [
    { Поле: 'Текущий объем', Значение: state.scenarios.currentVolume },
    { Поле: 'Рабочих дней', Значение: state.scenarios.workingDays },
    { Поле: 'Сценарий +30', Значение: state.scenarios.s1 },
    { Поле: 'Сценарий +70', Значение: state.scenarios.s2 },
    { Поле: 'Сценарий +150', Значение: state.scenarios.s3 },
    { Поле: 'Курс USD', Значение: state.scenarios.exchangeRate },
    { Поле: 'Дата старта', Значение: state.scenarios.startDate },
    { Поле: 'Месяц планирования', Значение: state.scenarios.planningMonth }
  ], 'Сценарии');

  const stateWs = XLSX.utils.aoa_to_sheet([['json'], [JSON.stringify(state)]]);
  XLSX.utils.book_append_sheet(wb, stateWs, STATE_SHEET);
  const stateSheetIndex = wb.SheetNames.indexOf(STATE_SHEET);
  wb.Workbook = wb.Workbook || {};
  wb.Workbook.Sheets = wb.Workbook.Sheets || [];
  wb.Workbook.Sheets[stateSheetIndex] = { Hidden: 1, name: STATE_SHEET };

  XLSX.writeFile(wb, filename + ".xlsx", { cellStyles: true });
};

export const parseXLSXFile = async (file: File): Promise<CalculatorData> => {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const stateSheet = wb.Sheets[STATE_SHEET];

  if (stateSheet) {
    const rows = XLSX.utils.sheet_to_json<{ json: string }>(stateSheet);
    const rawJson = rows[0]?.json;
    if (rawJson) return parseCalculatorData(JSON.parse(rawJson));
  }

  throw new Error('В XLSX не найден служебный лист состояния. Импортируйте файл, экспортированный из калькулятора.');
};
