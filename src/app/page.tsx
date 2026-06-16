"use client";

import React, { useState } from 'react';
import Header from '../components/Header';
import IngredientsTab from '../components/tabs/IngredientsTab';
import DishesTab from '../components/tabs/DishesTab';
import CombosTab from '../components/tabs/CombosTab';
import CostsTab from '../components/tabs/CostsTab';
import Dashboard from '../components/Dashboard';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'dishes' | 'combos' | 'costs'>('ingredients');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header />

        <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('ingredients')}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'ingredients' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            01 Ингредиенты
          </button>
          <button 
            onClick={() => setActiveTab('dishes')}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'dishes' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            02 Блюда
          </button>
          <button 
            onClick={() => setActiveTab('combos')}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'combos' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            03 Комбо
          </button>
          <button 
            onClick={() => setActiveTab('costs')}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'costs' ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            04 Расходы и Объемы
          </button>
        </div>

        <div className="min-h-[400px]">
          {activeTab === 'ingredients' && <IngredientsTab />}
          {activeTab === 'dishes' && <DishesTab />}
          {activeTab === 'combos' && <CombosTab />}
          {activeTab === 'costs' && <CostsTab />}
        </div>

        <div className="pt-8 mt-12 border-t border-gray-200">
          <Dashboard />
        </div>
      </div>
    </div>
  );
}