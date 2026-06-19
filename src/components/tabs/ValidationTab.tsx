import React from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { ValidationIssue, countIssuesBySeverity } from '../../utils/validation';

interface ValidationTabProps {
  issues: ValidationIssue[];
}

const severityConfig = {
  error: {
    label: 'Ошибка',
    icon: XCircle,
    className: 'border-red-200 bg-red-50 text-red-800',
    iconClassName: 'text-red-600'
  },
  warning: {
    label: 'Предупреждение',
    icon: AlertTriangle,
    className: 'border-yellow-200 bg-yellow-50 text-yellow-900',
    iconClassName: 'text-yellow-600'
  },
  info: {
    label: 'Инфо',
    icon: Info,
    className: 'border-blue-200 bg-blue-50 text-blue-800',
    iconClassName: 'text-blue-600'
  }
} as const;

export default function ValidationTab({ issues }: ValidationTabProps) {
  const counts = countIssuesBySeverity(issues);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">05 Проверка данных</h2>
          <p className="text-sm text-gray-500">Предупреждения по заполнению, связям и маржинальности</p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="rounded-full bg-red-50 px-3 py-1 font-medium text-red-700">Ошибки: {counts.errors}</span>
          <span className="rounded-full bg-yellow-50 px-3 py-1 font-medium text-yellow-700">Предупреждения: {counts.warnings}</span>
        </div>
      </div>

      {issues.length === 0 ? (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-5 text-green-800">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Все выглядит корректно</p>
            <p className="text-sm text-green-700">Критичных проблем в текущей модели нет.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => {
            const config = severityConfig[issue.severity];
            const Icon = config.icon;

            return (
              <div key={issue.id} className={`rounded-lg border p-4 ${config.className}`}>
                <div className="flex items-start gap-3">
                  <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.iconClassName}`} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium">{config.label}</span>
                      <span className="text-xs font-medium opacity-80">{issue.section}</span>
                    </div>
                    <p className="mt-2 font-semibold">{issue.title}</p>
                    <p className="mt-1 text-sm opacity-90">{issue.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
