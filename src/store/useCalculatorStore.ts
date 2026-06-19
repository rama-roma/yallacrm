import { create } from 'zustand';

export interface Partner {
  name: string;
  manager: string;
  address: string;
  phone: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  priceNow: number;
  priceBulk: number;
}

export interface DishIngredient {
  ingredientId: string;
  amount: number;
}

export interface Dish {
  id: string;
  name: string;
  ingredients: DishIngredient[];
}

export interface Combo {
  id: string;
  name: string;
  dishIds: string[];
  packagingCost: number;
  price: number;
}

export interface Cost {
  id: string;
  name: string;
  amount: number;
}

export interface Scenarios {
  currentVolume: number;
  workingDays: number;
  s1: number;
  s2: number;
  s3: number;
  exchangeRate: number;
}

export interface CalculatorData {
  partner: Partner;
  ingredients: Ingredient[];
  dishes: Dish[];
  combos: Combo[];
  costs: Cost[];
  scenarios: Scenarios;
}

export interface SaveHistoryEntry {
  id: string;
  savedAt: string;
  label: string;
  data: CalculatorData;
}

export interface CalculatorState extends CalculatorData {
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSavedAt: string | null;
  history: SaveHistoryEntry[];

  loadInitialData: () => Promise<void>;
  saveSnapshot: (label?: string) => Promise<SaveHistoryEntry>;
  restoreHistoryEntry: (id: string) => Promise<void>;
  removeHistoryEntry: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;

  updatePartner: (partner: Partial<Partner>) => Promise<void>;

  addIngredient: (ingredient: Ingredient) => Promise<void>;
  updateIngredient: (id: string, ingredient: Partial<Ingredient>) => Promise<void>;
  removeIngredient: (id: string) => Promise<void>;

  addDish: (dish: Dish) => Promise<void>;
  updateDish: (id: string, dish: Partial<Dish>) => Promise<void>;
  removeDish: (id: string) => Promise<void>;

  addCombo: (combo: Combo) => Promise<void>;
  updateCombo: (id: string, combo: Partial<Combo>) => Promise<void>;
  removeCombo: (id: string) => Promise<void>;

  addCost: (cost: Cost) => Promise<void>;
  updateCost: (id: string, cost: Partial<Cost>) => Promise<void>;
  removeCost: (id: string) => Promise<void>;

  updateScenarios: (scenarios: Partial<Scenarios>) => Promise<void>;

  importState: (state: Partial<CalculatorData>) => Promise<void>;
}

const STORAGE_KEY = 'yalla-calculator-data';
const HISTORY_KEY = 'yalla-calculator-history';
const MAX_HISTORY_ITEMS = 20;

const defaultState: CalculatorData = {
  partner: {
    name: '',
    manager: '',
    address: '',
    phone: ''
  },
  ingredients: [],
  dishes: [],
  combos: [],
  costs: [],
  scenarios: {
    currentVolume: 10,
    workingDays: 22,
    s1: 30,
    s2: 70,
    s3: 150,
    exchangeRate: 9.4
  }
};

const isBrowser = () => typeof window !== 'undefined';

const readJsonFromStorage = async <T>(key: string): Promise<T | null> => {
  if (!isBrowser()) return null;

  const value = window.localStorage.getItem(key);
  if (!value) return null;

  return JSON.parse(value) as T;
};

const writeJsonToStorage = async (key: string, value: unknown) => {
  if (!isBrowser()) return;

  window.localStorage.setItem(key, JSON.stringify(value, null, 2));
};

const normalizeData = (data: Partial<CalculatorData> = {}): CalculatorData => ({
  partner: { ...defaultState.partner, ...data.partner },
  ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
  dishes: Array.isArray(data.dishes) ? data.dishes : [],
  combos: Array.isArray(data.combos) ? data.combos : [],
  costs: Array.isArray(data.costs) ? data.costs : [],
  scenarios: { ...defaultState.scenarios, ...data.scenarios }
});

export const getCalculatorData = (state: CalculatorState): CalculatorData => ({
  partner: state.partner,
  ingredients: state.ingredients,
  dishes: state.dishes,
  combos: state.combos,
  costs: state.costs,
  scenarios: state.scenarios
});

export const useCalculatorStore = create<CalculatorState>((set, get) => {
  const persistCurrentData = async () => {
    const savedAt = new Date().toISOString();
    const data = getCalculatorData(get());

    set({ isSaving: true, error: null });
    try {
      await writeJsonToStorage(STORAGE_KEY, { savedAt, data });
      set({ isSaving: false, lastSavedAt: savedAt });
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : 'Не удалось сохранить данные'
      });
    }
  };

  const updateAndPersist = async (updater: (state: CalculatorState) => Partial<CalculatorState>) => {
    set(updater);
    await persistCurrentData();
  };

  return {
  ...defaultState,
  isLoading: false,
  isSaving: false,
  error: null,
  lastSavedAt: null,
  history: [],

  loadInitialData: async () => {
    set({ isLoading: true, error: null });

    try {
      const [storedState, storedHistory] = await Promise.all([
        readJsonFromStorage<{ savedAt: string; data: Partial<CalculatorData> }>(STORAGE_KEY),
        readJsonFromStorage<SaveHistoryEntry[]>(HISTORY_KEY)
      ]);

      if (storedState?.data) {
        set({
          ...normalizeData(storedState.data),
          history: Array.isArray(storedHistory) ? storedHistory : [],
          lastSavedAt: storedState.savedAt,
          isLoading: false
        });
        return;
      }

      const response = await fetch('/data/calculator-data.json', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Не удалось загрузить стартовый JSON-файл');
      }

      const initialData = await response.json() as Partial<CalculatorData>;
      const normalizedData = normalizeData(initialData);

      set({
        ...normalizedData,
        history: Array.isArray(storedHistory) ? storedHistory : [],
        isLoading: false
      });
      await writeJsonToStorage(STORAGE_KEY, {
        savedAt: new Date().toISOString(),
        data: normalizedData
      });
    } catch (error) {
      set({
        ...defaultState,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Не удалось загрузить данные'
      });
    }
  },

  saveSnapshot: async (label) => {
    const savedAt = new Date().toISOString();
    const currentData = getCalculatorData(get());
    const entry: SaveHistoryEntry = {
      id: crypto.randomUUID(),
      savedAt,
      label: label || `Сохранение ${new Date(savedAt).toLocaleString('ru-RU')}`,
      data: currentData
    };
    const history = [entry, ...get().history].slice(0, MAX_HISTORY_ITEMS);

    set({ isSaving: true, error: null });
    try {
      await Promise.all([
        writeJsonToStorage(STORAGE_KEY, { savedAt, data: currentData }),
        writeJsonToStorage(HISTORY_KEY, history)
      ]);
      set({ history, lastSavedAt: savedAt, isSaving: false });
      return entry;
    } catch (error) {
      set({
        isSaving: false,
        error: error instanceof Error ? error.message : 'Не удалось сохранить историю'
      });
      throw error;
    }
  },

  restoreHistoryEntry: async (id) => {
    const entry = get().history.find((item) => item.id === id);
    if (!entry) return;

    set({ ...normalizeData(entry.data) });
    await persistCurrentData();
  },

  removeHistoryEntry: async (id) => {
    const history = get().history.filter((item) => item.id !== id);
    set({ history });
    await writeJsonToStorage(HISTORY_KEY, history);
  },

  clearHistory: async () => {
    set({ history: [] });
    await writeJsonToStorage(HISTORY_KEY, []);
  },

  updatePartner: (partner) => updateAndPersist((state) => ({ partner: { ...state.partner, ...partner } })),

  addIngredient: (ingredient) => updateAndPersist((state) => ({ ingredients: [...state.ingredients, ingredient] })),
  updateIngredient: (id, ingredient) => updateAndPersist((state) => ({
    ingredients: state.ingredients.map(i => i.id === id ? { ...i, ...ingredient } : i)
  })),
  removeIngredient: (id) => updateAndPersist((state) => ({
    ingredients: state.ingredients.filter(i => i.id !== id),
    dishes: state.dishes.map(d => ({
      ...d,
      ingredients: d.ingredients.filter(di => di.ingredientId !== id)
    }))
  })),

  addDish: (dish) => updateAndPersist((state) => ({ dishes: [...state.dishes, dish] })),
  updateDish: (id, dish) => updateAndPersist((state) => ({
    dishes: state.dishes.map(d => d.id === id ? { ...d, ...dish } : d)
  })),
  removeDish: (id) => updateAndPersist((state) => ({
    dishes: state.dishes.filter(d => d.id !== id),
    combos: state.combos.map(c => ({
      ...c,
      dishIds: c.dishIds.filter(dId => dId !== id)
    }))
  })),

  addCombo: (combo) => updateAndPersist((state) => ({ combos: [...state.combos, combo] })),
  updateCombo: (id, combo) => updateAndPersist((state) => ({
    combos: state.combos.map(c => c.id === id ? { ...c, ...combo } : c)
  })),
  removeCombo: (id) => updateAndPersist((state) => ({
    combos: state.combos.filter(c => c.id !== id)
  })),

  addCost: (cost) => updateAndPersist((state) => ({ costs: [...state.costs, cost] })),
  updateCost: (id, cost) => updateAndPersist((state) => ({
    costs: state.costs.map(c => c.id === id ? { ...c, ...cost } : c)
  })),
  removeCost: (id) => updateAndPersist((state) => ({
    costs: state.costs.filter(c => c.id !== id)
  })),

  updateScenarios: (scenarios) => updateAndPersist((state) => ({ scenarios: { ...state.scenarios, ...scenarios } })),

  importState: async (newState) => {
    set({ ...normalizeData(newState) });
    await persistCurrentData();
  }
}});
