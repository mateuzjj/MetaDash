import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  className?: string;
  rowsPerPage?: number;
  showPagination?: boolean;
}

export function DataTable<T extends object>({
  columns,
  data,
  className,
  rowsPerPage = 8,
  showPagination = true,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  
  // For simplicity, showing all data without pagination in this demo
  // In production, implement proper pagination
  
  return (
    <div className={cn("w-full", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    "py-2 px-3 text-xs font-medium text-slate-400 uppercase tracking-wider",
                    column.align === 'right' && "text-right",
                    column.align === 'center' && "text-center"
                  )}
                >
                  {t(column.header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice(0, rowsPerPage).map((item, index) => (
              <tr
                key={index}
                className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "py-2 px-3 text-sm",
                      column.align === 'right' && "text-right",
                      column.align === 'center' && "text-center",
                      column.align !== 'right' && column.align !== 'center' && "text-left"
                    )}
                  >
                    {column.render ? (
                      column.render(item)
                    ) : (
                      <span className="text-slate-300">
                        {String((item as Record<string, unknown>)[column.key] ?? '-')}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {showPagination && (
        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {t('common.showing')} 1-{Math.min(rowsPerPage, data.length)} {t('common.of')} {data.length} {t('common.results')}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 border-slate-700 bg-slate-800/50 hover:bg-slate-700"
              disabled
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 w-7 p-0 border-slate-700 bg-slate-800/50 hover:bg-slate-700"
              disabled
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
