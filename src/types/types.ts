export interface Ingredient {
  name: string;
  unit: string;
  currentPrice: number;
  wholesalePrice: number;
}

export interface DishIngredient {
  ingredientName: string;
  amount: number;
}

export interface Dish {
  name: string;
  ingredients: DishIngredient[];
}

export interface ComboDish {
  dishName: string;
  quantity: number;
}

export interface Combo {
  name: string;
  dishes: ComboDish[];
  packagingCost: number;
  sellingPrice: number;
}

export interface Expense {
  name: string;
  amount: number;
}

export interface AppState {
  kitchenName: string;
  managerName: string;
  kitchenAddress: string;
  kitchenPhone: string;
  exchangeRate: number;
  ingredients: Ingredient[];
  dishes: Dish[];
  combos: Combo[];
  expenses: Expense[];
  scenarios: {
    workingDays: number;
    variants: [number, number, number];
  };
}