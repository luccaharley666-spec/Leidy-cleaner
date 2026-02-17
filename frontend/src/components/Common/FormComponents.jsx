/* React default import removed (automatic JSX runtime) */
import { useState, useMemo } from 'react';

/**
 * Data Table Component
 * Tabela responsiva com sorting, filtering e pagination
 */
export const DataTable = ({
  columns,
  data,
  onRowClick,
  selectable = false,
  onSelectionChange,
  actions = [],
  loading = false,
  emptyMessage = 'Nenhum dado encontrado'
}) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const handleSort = (columnKey) => {
    if (sortColumn === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortOrder('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortOrder]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedRows(data.map((_, idx) => idx));
      onSelectionChange?.(data);
    } else {
      setSelectedRows([]);
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (rowIndex) => {
    if (selectedRows.includes(rowIndex)) {
      setSelectedRows(selectedRows.filter((i) => i !== rowIndex));
    } else {
      setSelectedRows([...selectedRows, rowIndex]);
    }
    const selected = sortedData.filter((_, idx) => selectedRows.includes(idx) || idx === rowIndex);
    onSelectionChange?.(selected);
  };

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="animate-spin text-4xl">⌛</div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Carregando dados...</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            {selectable && (
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.length === data.length}
                  onChange={handleSelectAll}
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={`px-4 py-3 text-left font-semibold text-gray-900 dark:text-white ${
                  col.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  {col.label}
                  {col.sortable && sortColumn === col.key && (
                    <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>
                  )}
                </div>
              </th>
            ))}
            {actions.length > 0 && (
              <th className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                Ações
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick?.(row)}
              className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition cursor-pointer"
            >
              {selectable && (
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(rowIndex)}
                    onChange={() => handleSelectRow(rowIndex)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
              )}
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-gray-900 dark:text-white">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              {actions.length > 0 && (
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex gap-2 justify-end">
                    {actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => action.onClick(row)}
                        className={`px-3 py-1 rounded text-sm font-medium transition ${
                          action.variant === 'danger'
                            ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                            : action.variant === 'secondary'
                            ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            : 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Card Grid
 * Grade responsiva de cards
 */
export const CardGrid = ({ cols = 'auto', gap = 'lg', children }) => {
  const colsClasses = {
    1: 'grid-cols-1',
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
    auto: 'grid-cols-auto' };

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8' };

  return (
    <div className={`grid ${colsClasses[cols] || colsClasses.auto} ${gapClasses[gap] || gapClasses.lg}`}>
      {children}
    </div>
  );
};

/**
 * Form Section
 * Agrupa campos de formulário relacionados
 */
export const FormSection = ({ title, description, children }) => {
  return (
    <div className="mb-8">
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
          {description && <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
};

/**
 * Form Group
 * Agrupa label e input
 */
export const FormGroup = ({
  label,
  required = false,
  error,
  hint,
  children
}) => {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">✕ {error}</p>}
      {hint && !error && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{hint}</p>}
    </div>
  );
};

/**
 * Stat Row
 * Exibe uma linha de estatísticas
 */
export const StatRow = ({ label, value, unit, trend, trendLabel }) => {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <div className="text-right">
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          {value}
          {unit && <span className="text-sm text-gray-600 dark:text-gray-400"> {unit}</span>}
        </div>
        {trend && (
          <div className={`text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? '↑' : '↓'} {trendLabel}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Tag Input
 */
export const TagInput = ({ tags = [], onChange }) => {
  const [input, setInput] = useState('');

  const handleAddTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      const newTag = input.trim().replace(',', '');
      if (!tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInput('');
    }
  };

  const handleRemoveTag = (tag) => {
    onChange(tags.filter((t) => t !== tag));
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg">
      {tags.map((tag) => (
        <span
          key={tag}
          className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm flex items-center gap-2"
        >
          {tag}
          <button
            onClick={() => handleRemoveTag(tag)}
            className="text-lg hover:opacity-70"
          >
            ✕
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleAddTag}
        placeholder="Adicione uma tag..."
        className="flex-grow outline-none bg-transparent text-gray-900 dark:text-white placeholder:text-gray-500"
      />
    </div>
  );
};
