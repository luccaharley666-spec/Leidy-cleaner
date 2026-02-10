const util = require('util');

function formatArgs(args) {
  return args.map(a => (typeof a === 'string' ? a : util.inspect(a))).join(' ');
}

function maskSensitive(msg) {
  // Quick masking: redact common token patterns
  return msg.replace(/(sk_live_[A-Za-z0-9_\-]+)/g, '[REDACTED_STRIPE_SK]')
    .replace(/(pk_live_[A-Za-z0-9_\-]+)/g, '[REDACTED_STRIPE_PK]')
    .replace(/(https?:\/\/[^\s@]+@sentry\.io\/[0-9]+)/g, '[REDACTED_SENTRY_DSN]')
    .replace(/([A-Fa-f0-9]{32,})/g, '[REDACTED_TOKEN]');
}

module.exports = {
  info: (...args) => console.info('[info]', maskSensitive(formatArgs(args))),
  warn: (...args) => console.warn('[warn]', maskSensitive(formatArgs(args))),
  error: (...args) => console.error('[error]', maskSensitive(formatArgs(args))),
  debug: (...args) => console.debug('[debug]', maskSensitive(formatArgs(args))),
};
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;
const path = require('path');
const fs = require('fs');

// Criar diretório de logs se não existir
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ✅ NOVO: Formato customizado com cores
const myFormat = printf(({ level, message, timestamp, stack, requestId, userId, context }) => {
  let output = `${timestamp} [${level}]`;
  if (requestId) output += ` [REQ:${requestId}]`;
  if (userId) output += ` [USER:${userId}]`;
  if (context) output += ` [${context}]`;
  output += ` ${stack || message}`;
  return output;
});

// ✅ NOVO: Formato JSON para estruturado (usar simples format de linha em vez de JSON para evitar issues com Winston)
const jsonFormat = combine(
  timestamp(),
  myFormat
);

// ✅ NOVO: Tentar usar daily-rotate-file se disponível
let rotateFile;
try {
  rotateFile = require('[REDACTED_TOKEN]');
} catch (e) {
  rotateFile = null;
  console.warn('⚠️ [REDACTED_TOKEN] não instalado, usando arquivo simples');
}

// ✅ NOVO: Configurar transports
const logTransports = [
  // Console com cores para desenvolvimento
  new transports.Console({
    format: combine(
      timestamp(),
      colorize({ all: true }),
      myFormat
    ),
    handleExceptions: true,
    level: process.env.LOG_LEVEL || 'info'
  })
];

// ✅ NOVO: Adicionar arquivo combinado (JSON estruturado)
if (rotateFile) {
  logTransports.push(
    new rotateFile({
      filename: path.join(logsDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxDays: '30d',
      format: jsonFormat,
      level: 'info'
    })
  );
} else {
  // Fallback: arquivo simples
  logTransports.push(
    new transports.File({
      filename: path.join(logsDir, 'application.log'),
      format: jsonFormat,
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 30
    })
  );
}

// ✅ NOVO: Arquivo separado apenas para erros
if (rotateFile) {
  logTransports.push(
    new rotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxDays: '30d',
      format: jsonFormat,
      level: 'error'
    })
  );
} else {
  // Fallback: arquivo simples
  logTransports.push(
    new transports.File({
      filename: path.join(logsDir, 'error.log'),
      format: jsonFormat,
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 30
    })
  );
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  defaultMeta: { service: 'avante-api' },
  transports: logTransports,
  exitOnError: false
});

// ✅ NOVO: Método para log com contexto
logger.logWithContext = (level, message, context = {}) => {
  logger.log({
    level,
    message,
    ...context,
    timestamp: new Date().toISOString()
  });
};

// ✅ NOVO: Método para log de performance
logger.logPerformance = (operation, duration, details = {}) => {
  const level = duration > 1000 ? 'warn' : duration > 100 ? 'info' : 'debug';
  logger.log({
    level,
    message: `Performance: ${operation} took ${duration}ms`,
    operation,
    duration_ms: duration,
    ...details,
    timestamp: new Date().toISOString()
  });
};

// ✅ NOVO: Método para log de request
logger.logRequest = (method, path, statusCode, duration, userId = null) => {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  logger.log({
    level,
    message: `${method} ${path} ${statusCode}`,
    http: {
      method,
      path,
      statusCode,
      duration_ms: duration
    },
    userId,
    timestamp: new Date().toISOString()
  });
};

// ✅ MANTIDO: Helper para mascarar PII em logs
logger.maskPII = (value) => {
  if (!value) return value;
  const v = String(value);
  // CPF (11 dígitos)
  if (/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(v) || /^\d{11}$/.test(v)) {
    const digits = v.replace(/\D/g, '');
    return digits.replace(/(\d{3})(\d{6})(\d{2})/, '$1***$3');
  }
  // Email
  if (v.includes('@')) {
    const [user, domain] = v.split('@');
    return `${user[0]}***@${domain}`;
  }
  // Phone
  if (/^\(\d{2}\) \d{4,5}-\d{4}$/.test(v) || /^\d{10,11}$/.test(v)) {
    return v.replace(/(\d{2})(\d{3,4})(\d{4})/, '($1) ***-****');
  }
  // Default: mask middle
  return v.length > 6 ? v.slice(0, 3) + '***' + v.slice(-3) : v;
};

// ✅ NOVO: Stats de logs
logger.getStats = () => {
  return {
    logsDir,
    files: fs.existsSync(logsDir) ? fs.readdirSync(logsDir).length : 0,
    timestamp: new Date().toISOString()
  };
};

module.exports = logger;
