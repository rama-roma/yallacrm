import { CalculatorData } from '../store/useCalculatorStore';
import { getComboFoodCost, getSalesMixTotal } from './calculations';

export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationIssue {
  id: string;
  severity: ValidationSeverity;
  section: string;
  title: string;
  description: string;
}

const isBlank = (value: string) => value.trim().length === 0;

export const getComboCosts = (data: CalculatorData, comboId: string) => {
  const combo = data.combos.find((item) => item.id === comboId);
  if (!combo) return { now: 0, bulk: 0 };

  return {
    now: getComboFoodCost(data, comboId, 'current'),
    bulk: getComboFoodCost(data, comboId, 's3')
  };
};

export const validateCalculatorData = (data: CalculatorData): ValidationIssue[] => {
  const issues: ValidationIssue[] = [];

  const pushIssue = (issue: ValidationIssue) => {
    issues.push(issue);
  };

  if (isBlank(data.partner.name)) {
    pushIssue({
      id: 'partner-name-empty',
      severity: 'warning',
      section: 'Партнер',
      title: 'Не указано название кухни',
      description: 'Название нужно для понятного экспорта, истории и идентификации расчета.'
    });
  }

  if (data.ingredients.length === 0) {
    pushIssue({
      id: 'ingredients-empty',
      severity: 'error',
      section: 'Ингредиенты',
      title: 'Нет ингредиентов',
      description: 'Без ингредиентов себестоимость блюд и комбо будет считаться некорректно.'
    });
  }

  data.ingredients.forEach((ingredient) => {
    const label = ingredient.name || ingredient.id || 'ингредиент без названия';

    if (isBlank(ingredient.name)) {
      pushIssue({
        id: `ingredient-${ingredient.id}-name-empty`,
        severity: 'warning',
        section: 'Ингредиенты',
        title: 'Ингредиент без названия',
        description: `Заполните название для позиции с ID ${ingredient.id}.`
      });
    }

    if (ingredient.priceNow <= 0) {
      pushIssue({
        id: `ingredient-${ingredient.id}-price-now`,
        severity: 'error',
        section: 'Ингредиенты',
        title: `Нет текущей цены: ${label}`,
        description: 'Цена СЕЙЧАС должна быть больше нуля, иначе текущий фудкост будет занижен.'
      });
    }

    if (ingredient.volumePrices.s1 <= 0 || ingredient.volumePrices.s2 <= 0 || ingredient.volumePrices.s3 <= 0) {
      pushIssue({
        id: `ingredient-${ingredient.id}-volume-prices`,
        severity: 'error',
        section: 'Ступенчатые цены',
        title: `Не заполнены цены по объемам: ${label}`,
        description: 'Заполните цены для сценариев +30, +70 и +150, иначе сценарии будут считаться некорректно.'
      });
    }

    if (ingredient.volumePrices.s3 > ingredient.priceNow) {
      pushIssue({
        id: `ingredient-${ingredient.id}-s3-higher`,
        severity: 'warning',
        section: 'Ступенчатые цены',
        title: `Цена +150 выше текущей: ${label}`,
        description: 'Проверьте цену, потому что закупка при большом объеме обычно не должна быть дороже текущей.'
      });
    }
  });

  if (data.dishes.length === 0) {
    pushIssue({
      id: 'dishes-empty',
      severity: 'error',
      section: 'Блюда',
      title: 'Нет блюд',
      description: 'Создайте хотя бы одно блюдо, чтобы собрать комбо и рассчитать фудкост.'
    });
  }

  data.dishes.forEach((dish) => {
    const label = dish.name || dish.id || 'блюдо без названия';

    if (isBlank(dish.name)) {
      pushIssue({
        id: `dish-${dish.id}-name-empty`,
        severity: 'warning',
        section: 'Блюда',
        title: 'Блюдо без названия',
        description: `Заполните название для блюда с ID ${dish.id}.`
      });
    }

    if (dish.ingredients.length === 0) {
      pushIssue({
        id: `dish-${dish.id}-ingredients-empty`,
        severity: 'error',
        section: 'Блюда',
        title: `Пустой состав: ${label}`,
        description: 'Добавьте ингредиенты в состав, иначе себестоимость блюда будет нулевой.'
      });
    }

    if (dish.productionType === 'batch' && dish.batchYield <= 0) {
      pushIssue({
        id: `dish-${dish.id}-batch-yield`,
        severity: 'error',
        section: 'Блюда',
        title: `Не указан выход партии: ${label}`,
        description: 'Для массового производства нужно указать количество порций на выходе.'
      });
    }

    dish.ingredients.forEach((dishIngredient, index) => {
      const ingredient = data.ingredients.find((item) => item.id === dishIngredient.ingredientId);

      if (!dishIngredient.ingredientId || !ingredient) {
        pushIssue({
          id: `dish-${dish.id}-ingredient-${index}-missing`,
          severity: 'error',
          section: 'Блюда',
          title: `Не выбран ингредиент в блюде: ${label}`,
          description: 'Выберите существующий ингредиент или удалите пустую строку состава.'
        });
      }

      if (dishIngredient.amount <= 0) {
        pushIssue({
          id: `dish-${dish.id}-ingredient-${index}-amount`,
          severity: 'error',
          section: 'Блюда',
          title: `Нулевой расход в блюде: ${label}`,
          description: 'Расход ингредиента должен быть больше нуля.'
        });
      }
    });
  });

  if (data.combos.length === 0) {
    pushIssue({
      id: 'combos-empty',
      severity: 'error',
      section: 'Комбо',
      title: 'Нет комбо',
      description: 'Добавьте продаваемое комбо, иначе выручка и прибыль будут равны нулю.'
    });
  }

  data.combos.forEach((combo) => {
    const label = combo.name || combo.id || 'комбо без названия';
    const comboCosts = getComboCosts(data, combo.id);

    if (isBlank(combo.name)) {
      pushIssue({
        id: `combo-${combo.id}-name-empty`,
        severity: 'warning',
        section: 'Комбо',
        title: 'Комбо без названия',
        description: `Заполните название для комбо с ID ${combo.id}.`
      });
    }

    if (combo.dishIds.length === 0) {
      pushIssue({
        id: `combo-${combo.id}-dishes-empty`,
        severity: 'error',
        section: 'Комбо',
        title: `Пустой состав комбо: ${label}`,
        description: 'Добавьте блюда в комбо, иначе фудкост будет считаться только по упаковке.'
      });
    }

    combo.dishIds.forEach((dishId, index) => {
      const dish = data.dishes.find((item) => item.id === dishId);
      if (!dishId || !dish) {
        pushIssue({
          id: `combo-${combo.id}-dish-${index}-missing`,
          severity: 'error',
          section: 'Комбо',
          title: `Не выбрано блюдо в комбо: ${label}`,
          description: 'Выберите существующее блюдо или удалите пустую строку состава.'
        });
      }
    });

    if (combo.packagingCost < 0) {
      pushIssue({
        id: `combo-${combo.id}-packaging-negative`,
        severity: 'error',
        section: 'Комбо',
        title: `Отрицательная стоимость упаковки: ${label}`,
        description: 'Стоимость упаковки не может быть меньше нуля.'
      });
    }

    if (combo.price <= 0) {
      pushIssue({
        id: `combo-${combo.id}-price-empty`,
        severity: 'error',
        section: 'Комбо',
        title: `Не указана цена продажи: ${label}`,
        description: 'Цена продажи должна быть больше нуля, иначе выручка и маржа будут некорректными.'
      });
    } else {
      if (combo.price <= comboCosts.now) {
        pushIssue({
          id: `combo-${combo.id}-margin-now-negative`,
          severity: 'error',
          section: 'Маржа',
          title: `Маржа сейчас отрицательная: ${label}`,
          description: 'Цена продажи ниже или равна текущей расчетной себестоимости. Подробные суммы доступны только в аналитике.'
        });
      }

      if (combo.price <= comboCosts.bulk) {
        pushIssue({
          id: `combo-${combo.id}-margin-bulk-negative`,
          severity: 'warning',
          section: 'Маржа',
          title: `Маржа в сценарии +150 не положительная: ${label}`,
          description: 'Цена продажи ниже или равна расчетной себестоимости в большом объеме. Подробные суммы доступны только в аналитике.'
        });
      }
    }

    if (combo.active && combo.salesMix <= 0) {
      pushIssue({
        id: `combo-${combo.id}-sales-mix-empty`,
        severity: 'error',
        section: 'Sales Mix',
        title: `Не указана доля продаж: ${label}`,
        description: 'Для активного комбо укажите Sales Mix в процентах.'
      });
    }
  });

  const salesMixTotal = getSalesMixTotal(data);
  if (data.combos.some((combo) => combo.active) && Math.abs(salesMixTotal - 100) > 0.01) {
    pushIssue({
      id: 'sales-mix-total-invalid',
      severity: 'error',
      section: 'Sales Mix',
      title: 'Сумма Sales Mix не равна 100%',
      description: `Сейчас сумма активных комбо равна ${salesMixTotal.toFixed(1)}%. Исправьте доли перед аналитикой.`
    });
  }

  data.costs.forEach((cost) => {
    const label = cost.name || cost.id || 'расход без названия';

    if (isBlank(cost.name)) {
      pushIssue({
        id: `cost-${cost.id}-name-empty`,
        severity: 'warning',
        section: 'Расходы',
        title: 'Расход без названия',
        description: `Заполните название для расхода с ID ${cost.id}.`
      });
    }

    if (cost.amount < 0) {
      pushIssue({
        id: `cost-${cost.id}-amount-negative`,
        severity: 'error',
        section: 'Расходы',
        title: `Отрицательная сумма расхода: ${label}`,
        description: 'Расход не может быть меньше нуля.'
      });
    }
  });

  if (data.scenarios.currentVolume < 0) {
    pushIssue({
      id: 'scenario-current-volume-negative',
      severity: 'error',
      section: 'Сценарии',
      title: 'Текущий объем меньше нуля',
      description: 'Количество комбо в день должно быть нулем или положительным числом.'
    });
  }

  if (data.scenarios.workingDays <= 0 || data.scenarios.workingDays > 31) {
    pushIssue({
      id: 'scenario-working-days-invalid',
      severity: 'error',
      section: 'Сценарии',
      title: 'Некорректное количество рабочих дней',
      description: 'Укажите значение от 1 до 31.'
    });
  }

  if (data.scenarios.exchangeRate <= 0) {
    pushIssue({
      id: 'scenario-exchange-rate-invalid',
      severity: 'warning',
      section: 'Сценарии',
      title: 'Не указан курс USD к TJS',
      description: 'Расчеты в TJS продолжат работать, но долларовый эквивалент не будет полезным.'
    });
  }

  if (!data.scenarios.startDate) {
    pushIssue({
      id: 'scenario-start-date-empty',
      severity: 'error',
      section: 'Календарь',
      title: 'Не указана дата старта',
      description: 'Финансовая модель должна считать продажи строго с даты старта.'
    });
  }

  if (data.calendar.filter((day) => day.date >= data.scenarios.startDate && day.comboIds.length > 0).length === 0) {
    pushIssue({
      id: 'calendar-empty-after-start',
      severity: 'warning',
      section: 'Календарь',
      title: 'Нет комбо в календаре после даты старта',
      description: 'Если календарь пуст, аналитика использует количество рабочих дней из сценариев как резервное значение.'
    });
  }

  return issues.sort((a, b) => {
    const order: Record<ValidationSeverity, number> = { error: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });
};

export const countIssuesBySeverity = (issues: ValidationIssue[]) => ({
  errors: issues.filter((issue) => issue.severity === 'error').length,
  warnings: issues.filter((issue) => issue.severity === 'warning').length,
  info: issues.filter((issue) => issue.severity === 'info').length
});
