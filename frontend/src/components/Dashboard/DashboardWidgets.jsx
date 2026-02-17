/* React default import removed (automatic JSX runtime) */

/**
 * Dashboard Stats Card
 * Exibe métrica com ícone, valor, mudança e trend
 */
export const StatsCard = ({
  icon,
  label,
  value,
  change,
  trend = 'up',
  change_label,
  color = 'purple'
}) => {
  const colorClasses = {
    purple: 'from-purple-500 to-violet-600',
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-cyan-600',
    orange: 'from-orange-500 to-red-600' };

  return (
    <div className="card bg-gradient-to-br " style={{ backgroundImage: `linear-gradient(135deg, var(--surface), var(--surface-secondary))` }}>
      <div className="flex items-center justify-between mb-3">
        <div className={`text-3xl bg-gradient-to-br ${colorClasses[color]} bg-clip-text text-transparent`}>
          {icon}
        </div>
        {change && (
          <div className={`text-sm font-bold ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? '↑' : '↓'} {change}%
          </div>
        )}
      </div>
      <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {change_label && <p className="text-xs text-gray-500 mt-1">{change_label}</p>}
    </div>
  );
};

/**
 * Activity Timeline
 * Lista atividades com timestamps
 */
export const ActivityTimeline = ({ activities = [] }) => {
  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Nenhuma atividade recente</p>
      ) : (
        activities.map((activity, idx) => (
          <div key={idx} className="flex gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white text-lg">
              {activity.icon}
            </div>
            <div className="flex-grow">
              <p className="font-semibold text-gray-900 dark:text-white">{activity.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

/**
 * Quick Action Button Grid
 */
export const QuickActions = ({ actions = [] }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {actions.map((action, idx) => (
        <button
          key={idx}
          onClick={action.onClick}
          className="p-4 rounded-lg text-center transition hover:scale-105 hover:shadow-lg border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-purple-900/20 dark:to-cyan-900/20"
        >
          <div className="text-2xl mb-2">{action.icon}</div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{action.label}</p>
        </button>
      ))}
    </div>
  );
};

/**
 * Upcoming Item Card
 * Exibe próximos agendamentos/eventos
 */
export const UpcomingCard = ({
  icon,
  title,
  date,
  time,
  location,
  status = 'confirmed',
  actions = []
}) => {
  const statusColors = {
    confirmed: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
    pending: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
    cancelled: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700' };

  return (
    <div className="card border-l-4 border-purple-500">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{icon}</span>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              📅 {date} • ⏰ {time}
            </p>
          </div>
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${statusColors[status]}`}>
          {status === 'confirmed' ? '✓ Confirmado' : status === 'pending' ? '⏳ Pendente' : '✗ Cancelado'}
        </span>
      </div>
      {location && <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">📍 {location}</p>}
      {actions.length > 0 && (
        <div className="flex gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium transition ${
                action.variant === 'primary'
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Info Box - Caixa de informação destacada
 */
export const InfoBox = ({ icon, title, value, subtitle, color = 'purple' }) => {
  const colors = {
    purple: 'from-purple-500 to-violet-600',
    green: 'from-green-500 to-emerald-600',
    blue: 'from-blue-500 to-cyan-600' };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} p-6 rounded-xl text-white shadow-lg`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{icon}</span>
        <h3 className="font-semibold text-white/90">{title}</h3>
      </div>
      <p className="text-3xl font-bold mb-1">{value}</p>
      {subtitle && <p className="text-sm text-white/80">{subtitle}</p>}
    </div>
  );
};

/**
 * Empty State
 * Exibe quando não há dados
 */
export const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4 mx-auto w-16 h-16 flex items-center justify-center">{icon}</div>
      <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
