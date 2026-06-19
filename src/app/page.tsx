"use client";

import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import IngredientsTab from '../components/tabs/IngredientsTab';
import DishesTab from '../components/tabs/DishesTab';
import CombosTab from '../components/tabs/CombosTab';
import CostsTab from '../components/tabs/CostsTab';
import Dashboard from '../components/Dashboard';
import HistoryTab from '../components/tabs/HistoryTab';
import ValidationTab from '../components/tabs/ValidationTab';
import ValidationStatus from '../components/ValidationStatus';
import { getCalculatorData, useCalculatorStore } from '../store/useCalculatorStore';
import { validateCalculatorData } from '../utils/validation';

type ActiveTab = 'ingredients' | 'dishes' | 'combos' | 'costs' | 'validation' | 'history';

export default function Home() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('ingredients');
  const state = useCalculatorStore();
  const { isLoading, loadInitialData } = state;
  const validationIssues = validateCalculatorData(getCalculatorData(state));

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  const tabs: { id: ActiveTab; label: string }[] = [
    { id: 'ingredients', label: '01 Ингредиенты' },
    { id: 'dishes', label: '02 Блюда' },
    { id: 'combos', label: '03 Комбо' },
    { id: 'costs', label: '04 Расходы и Объемы' },
    { id: 'validation', label: `05 Проверка${validationIssues.length > 0 ? ` (${validationIssues.length})` : ''}` },
    { id: 'history', label: '06 История' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Header />

        {!isLoading && (
          <ValidationStatus
            issues={validationIssues}
            onOpenValidation={() => setActiveTab('validation')}
          />
        )}

        <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-yellow-500 text-yellow-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[400px]">
          {isLoading ? (
            <div className="rounded-xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500 shadow-sm">
              Загрузка данных...
            </div>
          ) : (
            <>
              {activeTab === 'ingredients' && <IngredientsTab />}
              {activeTab === 'dishes' && <DishesTab />}
              {activeTab === 'combos' && <CombosTab />}
              {activeTab === 'costs' && <CostsTab />}
              {activeTab === 'validation' && <ValidationTab issues={validationIssues} />}
              {activeTab === 'history' && <HistoryTab />}
            </>
          )}
        </div>

        <div className="pt-8 mt-12 border-t border-gray-200">
          <Dashboard />
        </div>
      </div>
    </div>
  );
}
