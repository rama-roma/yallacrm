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

export interface CalculatorState {
  partner: Partner;
  ingredients: Ingredient[];
  dishes: Dish[];
  combos: Combo[];
  costs: Cost[];
  scenarios: Scenarios;
  
  updatePartner: (partner: Partial<Partner>) => void;
  
  addIngredient: (ingredient: Ingredient) => void;
  updateIngredient: (id: string, ingredient: Partial<Ingredient>) => void;
  removeIngredient: (id: string) => void;
  
  addDish: (dish: Dish) => void;
  updateDish: (id: string, dish: Partial<Dish>) => void;
  removeDish: (id: string) => void;
  
  addCombo: (combo: Combo) => void;
  updateCombo: (id: string, combo: Partial<Combo>) => void;
  removeCombo: (id: string) => void;
  
  addCost: (cost: Cost) => void;
  updateCost: (id: string, cost: Partial<Cost>) => void;
  removeCost: (id: string) => void;
  
  updateScenarios: (scenarios: Partial<Scenarios>) => void;
  
  importState: (state: Partial<CalculatorState>) => void;
}

const defaultState = {
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
    exchangeRate: 9.40 // e.g. TJS to USD or whatever based on user needs, user requested base in TJS
  }
};

export const useCalculatorStore = create<CalculatorState>((set) => ({
  ...defaultState,
  
  updatePartner: (partner) => set((state) => ({ partner: { ...state.partner, ...partner } })),
  
  addIngredient: (ingredient) => set((state) => ({ ingredients: [...state.ingredients, ingredient] })),
  updateIngredient: (id, ingredient) => set((state) => ({
    ingredients: state.ingredients.map(i => i.id === id ? { ...i, ...ingredient } : i)
  })),
  removeIngredient: (id) => set((state) => ({
    ingredients: state.ingredients.filter(i => i.id !== id),
    // Also remove from dishes
    dishes: state.dishes.map(d => ({
      ...d,
      ingredients: d.ingredients.filter(di => di.ingredientId !== id)
    }))
  })),
  
  addDish: (dish) => set((state) => ({ dishes: [...state.dishes, dish] })),
  updateDish: (id, dish) => set((state) => ({
    dishes: state.dishes.map(d => d.id === id ? { ...d, ...dish } : d)
  })),
  removeDish: (id) => set((state) => ({
    dishes: state.dishes.filter(d => d.id !== id),
    // Remove from combos
    combos: state.combos.map(c => ({
      ...c,
      dishIds: c.dishIds.filter(dId => dId !== id)
    }))
  })),
  
  addCombo: (combo) => set((state) => ({ combos: [...state.combos, combo] })),
  updateCombo: (id, combo) => set((state) => ({
    combos: state.combos.map(c => c.id === id ? { ...c, ...combo } : c)
  })),
  removeCombo: (id) => set((state) => ({
    combos: state.combos.filter(c => c.id !== id)
  })),
  
  addCost: (cost) => set((state) => ({ costs: [...state.costs, cost] })),
  updateCost: (id, cost) => set((state) => ({
    costs: state.costs.map(c => c.id === id ? { ...c, ...cost } : c)
  })),
  removeCost: (id) => set((state) => ({
    costs: state.costs.filter(c => c.id !== id)
  })),
  
  updateScenarios: (scenarios) => set((state) => ({ scenarios: { ...state.scenarios, ...scenarios } })),
  
  importState: (newState) => set((state) => ({
    ...state,
    partner: newState.partner || defaultState.partner,
    ingredients: newState.ingredients || [],
    dishes: newState.dishes || [],
    combos: newState.combos || [],
    costs: newState.costs || [],
    scenarios: newState.scenarios || defaultState.scenarios
  }))
}));
