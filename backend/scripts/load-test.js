/**
 * Load Test Script
 * Testa performance das APIs sob carga
 * 
 * Uso:
 * - npm run test:load (faz isso automaticamente)
 * - node backend/scripts/load-test.js --concurrency=50 --requests=1000
 * 
 * Requisitos:
 * - Backend rodando em localhost:3001
 * - Base de testes criar (npm run test:setup)
 */

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

// ===== CONFIGURAÇÃO =====
const BASE_URL = process.env.API_URL || 'http://localhost:3001';
const CONCURRENCY = parseInt(process.env.CONCURRENCY) || 10;  // requisições simultâneas
const TOTAL_REQUESTS = parseInt(process.env.TOTAL_REQUESTS) || 100;
const TEST_DURATION = parseInt(process.env.TEST_DURATION) || 60000;  // 60 segundos

// Tokens de teste (criar em beforeAll do test setup)
const TEST_TOKEN = 'test-jwt-token-valid';
const TEST_USER_ID = 1;

// ===== MÉTRICAS =====
let metrics = {
  startTime: Date.now(),
  requests: {
    total: 0,
    completed: 0,
    failed: 0,
    pending: 0
  },
  responses: {
    byStatus: {},
    byEndpoint: {}
  },
  timing: {
    min: Infinity,
    max: 0,
    sum: 0,
    count: 0
  },
  errors: []
};

// ===== TESTES =====
const endpoints = [
  {
    name: 'GET /health',
    method: 'GET',
    path: '/api/health',
    headers: {},
    weight: 0.15  // 15% das requisições
  },
  {
    name: 'GET /bookings/:userId',
    method: 'GET',
    path: () => `/api/bookings/${TEST_USER_ID}`,
    headers: { 'Authorization': `Bearer ${TEST_TOKEN}` },
    weight: 0.40  // 40% das requisições
  },
  {
    name: 'GET /admin/bookings-list',
    method: 'GET',
    path: () => `/api/admin/bookings-list?limit=20&offset=0`,
    headers: { 'Authorization': `Bearer ${TEST_TOKEN}` },
    weight: 0.20
  },
  {
    name: 'POST /bookings',
    method: 'POST',
    path: '/api/bookings',
    headers: { 'Authorization': `Bearer ${TEST_TOKEN}` },
    body: JSON.stringify({
      userId: TEST_USER_ID,
      serviceId: 1,
      date: '2026-03-01',
      time: '14:00',
      address: 'Rua X, 123',
      phone: '+5511987654321',
      durationHours: 2
    }),
    weight: 0.25  // 25% das requisições
  }
];

// ===== FUNÇÕES =====

/**
 * Seleciona endpoint baseado em peso (distribuição)
 */
function selectEndpoint() {
  const rand = Math.random();
  let accumulated = 0;
  
  for (const endpoint of endpoints) {
    accumulated += endpoint.weight;
    if (rand <= accumulated) {
      return endpoint;
    }
  }
  
  return endpoints[0];
}

/**
 * Faz uma requisição HTTP
 */
function makeRequest(endpoint) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const parsedUrl = url.parse(BASE_URL);
    const path = typeof endpoint.path === 'function' ? endpoint.path() : endpoint.path;
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: path,
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json',
        ...endpoint.headers
      }
    };

    const protocol = BASE_URL.startsWith('https') ? https : http;
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', chunk => {
        data += chunk;
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        
        // Atualizar métricas
        updateMetrics(endpoint.name, res.statusCode, duration, !res.statusCode.toString().startsWith('2'));
        
        resolve({
          statusCode: res.statusCode,
          duration: duration,
          size: data.length,
          success: res.statusCode >= 200 && res.statusCode < 300
        });
      });
    });

    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      updateMetrics(endpoint.name, 0, duration, true, error.message);
      
      resolve({
        statusCode: 0,
        duration: duration,
        size: 0,
        success: false,
        error: error.message
      });
    });

    // Timeout de 10 segundos
    req.setTimeout(10000, () => {
      req.destroy();
      const duration = Date.now() - startTime;
      updateMetrics(endpoint.name, 'TIMEOUT', duration, true, 'Request timeout');
      
      resolve({
        statusCode: 'TIMEOUT',
        duration: duration,
        size: 0,
        success: false,
        error: 'Request timeout'
      });
    });

    if (endpoint.body) {
      req.write(endpoint.body);
    }
    
    req.end();
  });
}

/**
 * Atualiza métricas de requisição
 */
function updateMetrics(endpoint, statusCode, duration, isError, errorMsg = null) {
  metrics.requests.completed++;

  // Status code
  const statusKey = statusCode || 'UNKNOWN';
  metrics.responses.byStatus[statusKey] = (metrics.responses.byStatus[statusKey] || 0) + 1;

  // Endpoint
  if (!metrics.responses.byEndpoint[endpoint]) {
    metrics.responses.byEndpoint[endpoint] = { count: 0, avgTime: 0, errors: 0 };
  }
  metrics.responses.byEndpoint[endpoint].count++;

  // Timing
  metrics.timing.min = Math.min(metrics.timing.min, duration);
  metrics.timing.max = Math.max(metrics.timing.max, duration);
  metrics.timing.sum += duration;
  metrics.timing.count++;

  // Erros
  if (isError) {
    metrics.requests.failed++;
    metrics.responses.byEndpoint[endpoint].errors++;
    if (errorMsg) {
      metrics.errors.push({ endpoint, error: errorMsg, statusCode });
    }
  }
}

/**
 * Executa o teste de carga
 */
async function runLoadTest() {
  console.log('🚀 Iniciando Load Test');
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📊 Configuração:`);
  console.log(`   API URL: ${BASE_URL}`);
  console.log(`   Concurrency: ${CONCURRENCY} requisições simultâneas`);
  console.log(`   Total: ${TOTAL_REQUESTS} requisições`);
  console.log(`   Endpoints testados: ${endpoints.length}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log('');

  let pending = TOTAL_REQUESTS;
  const queue = [];

  // Função para processar fila
  function processQueue() {
    while (queue.length < CONCURRENCY && pending > 0) {
      pending--;
      metrics.requests.pending++;

      const endpoint = selectEndpoint();
      const promise = makeRequest(endpoint).then(() => {
        metrics.requests.pending--;
        processQueue();
      });

      queue.push(promise);
    }

    if (queue.length > 0) {
      return Promise.race(queue).then(() => {
        queue.splice(queue.indexOf(promise), 1);
        if (pending > 0 || queue.length > 0) {
          return processQueue();
        }
      });
    }
  }

  // Aguardar todas as requisições
  await processQueue();
  await Promise.all(queue);

  printResults();
}

/**
 * Imprime resultados do teste
 */
function printResults() {
  const duration = Date.now() - metrics.startTime;
  const throughput = metrics.requests.completed / (duration / 1000);
  const avgTime = metrics.timing.sum / metrics.timing.count;
  const errorRate = (metrics.requests.failed / metrics.requests.completed * 100).toFixed(2);

  console.log('');
  console.log('📈 RESULTADOS DO TESTE DE CARGA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');

  console.log('⏱️  TIMING:');
  console.log(`   Min: ${metrics.timing.min}ms`);
  console.log(`   Max: ${metrics.timing.max}ms`);
  console.log(`   Avg: ${avgTime.toFixed(2)}ms`);
  console.log(`   Total: ${(duration / 1000).toFixed(2)}s`);
  console.log('');

  console.log('📊 REQUISIÇÕES:');
  console.log(`   Total: ${metrics.requests.completed}`);
  console.log(`   Sucesso: ${metrics.requests.completed - metrics.requests.failed} ✅`);
  console.log(`   Falhas: ${metrics.requests.failed} ❌`);
  console.log(`   Taxa de erro: ${errorRate}%`);
  console.log(`   Throughput: ${throughput.toFixed(2)} req/s`);
  console.log('');

  console.log('📈 STATUS CODES:');
  Object.entries(metrics.responses.byStatus).sort().forEach(([status, count]) => {
    const percentage = (count / metrics.requests.completed * 100).toFixed(1);
    console.log(`   ${status}: ${count} (${percentage}%)`);
  });
  console.log('');

  console.log('🔍 POR ENDPOINT:');
  Object.entries(metrics.responses.byEndpoint).forEach(([endpoint, data]) => {
    const errorRate = data.errors > 0 ? ` | ${data.errors} erros` : '';
    console.log(`   ${endpoint}: ${data.count} requisições${errorRate}`);
  });
  console.log('');

  // Avisos de performance
  console.log('⚡ ANÁLISE DE PERFORMANCE:');
  
  if (avgTime > 500) {
    console.log(`   ⚠️  Tempo médio ${avgTime.toFixed(2)}ms está alto (target < 200ms)`);
  } else if (avgTime < 200) {
    console.log(`   ✅ Tempo médio ${avgTime.toFixed(2)}ms está ótimo!`);
  }

  if (errorRate > 5) {
    console.log(`   ⚠️  Taxa de erro ${errorRate}% está alta (target < 1%)`);
  } else if (errorRate == 0) {
    console.log(`   ✅ Sem erros detectados!`);
  }

  if (throughput < 10) {
    console.log(`   ⚠️  Throughput ${throughput.toFixed(2)} req/s está baixo`);
  } else if (throughput > 100) {
    console.log(`   ✅ Throughput ${throughput.toFixed(2)} req/s é excelente!`);
  }

  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Salvar resultados em arquivo
  const reportPath = path.join(__dirname, '..', '..', 'load-test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify(metrics, null, 2));
  console.log(`✅ Resultados salvos em: ${reportPath}`);
}

// ===== EXECUTAR =====
if (require.main === module) {
  runLoadTest().catch(err => {
    console.error('❌ Erro:', err);
    process.exit(1);
  });
}

module.exports = { runLoadTest, metrics };
