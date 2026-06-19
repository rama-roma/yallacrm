import React from 'react';
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { ValidationIssue, countIssuesBySeverity } from '../utils/validation';

interface ValidationStatusProps {
  issues: ValidationIssue[];
  onOpenValidation: () => void;
}

export default function ValidationStatus({ issues, onOpenValidation }: ValidationStatusProps) {
  const counts = countIssuesBySeverity(issues);

  if (issues.length === 0) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Данные заполнены корректно. Критичных предупреждений нет.
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpenValidation}
      className="flex w-full flex-col gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-left text-sm text-yellow-900 transition-colors hover:bg-yellow-100 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-center gap-2">
        {counts.errors > 0 ? (
          <XCircle className="h-5 w-5 shrink-0 text-red-600" />
        ) : (
          <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-600" />
        )}
        <span className="font-medium">
          Найдены замечания к данным: ошибок {counts.errors}, предупреждений {counts.warnings}
        </span>
      </div>
      <span className="text-xs font-medium text-yellow-700">Открыть проверку</span>
    </button>
  );
}
