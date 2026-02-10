const { v4: uuidv4 } = require('uuid');
const db = require('../db');

/**
 * RetryQueue - Gerencia retentativas de operações com backoff exponencial
 * Armazena tentativas em DB para auditoria e recuperação
 */
class RetryQueue {
  constructor() {
    this.MAX_RETRIES = parseInt(process.env.WEBHOOK_MAX_RETRIES || '5');
    this.INITIAL_DELAY_MS = parseInt(process.env.[REDACTED_TOKEN] || '1000');
    this.MAX_DELAY_MS = parseInt(process.env.[REDACTED_TOKEN] || '60000');
    this.JITTER_FACTOR = 0.1; // 10% random jitter
  }

  /**
   * Calcular delay com backoff exponencial + jitter
   */
  calculateDelay(retryCount) {
    const exponentialDelay = this.INITIAL_DELAY_MS * Math.pow(2, retryCount);
    const cappedDelay = Math.min(exponentialDelay, this.MAX_DELAY_MS);
    const jitter = cappedDelay * this.JITTER_FACTOR * Math.random();
    return cappedDelay + jitter;
  }

  /**
   * Enqueue uma operação para retry
   */
  async enqueue(operationId, operationType, payload, metadata = {}) {
    try {
      const retryId = uuidv4();
      const nextRetryAt = new Date(Date.now() + this.calculateDelay(0));

      await db.run(
        `INSERT INTO webhook_retries (retry_id, operation_id, operation_type, payload, metadata, status, retry_count, next_retry_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        retryId,
        operationId,
        operationType,
        JSON.stringify(payload),
        JSON.stringify(metadata),
        'pending',
        0,
        nextRetryAt.toISOString(),
        new Date().toISOString()
      );

      console.log(`📝 Retry enqueued: ${retryId} (operation: ${operationId})`);
      return { success: true, retryId };
    } catch (error) {
      console.error('❌ Erro ao enqueue retry:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Processar fila de retentativas pendentes
   */
  async processQueue() {
    try {
      const pending = await db.all(
        `SELECT * FROM webhook_retries 
         WHERE status = 'pending' AND next_retry_at <= ? 
         ORDER BY next_retry_at ASC 
         LIMIT 10`,
        new Date().toISOString()
      );

      console.log(`⏳ Processando ${pending.length} retentativas...`);

      for (const retry of pending) {
        await this.processRetry(retry);
      }

      return { success: true, processed: pending.length };
    } catch (error) {
      console.error('❌ Erro ao processar fila de retries:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Processar uma tentativa individual
   */
  async processRetry(retry) {
    const { retry_id, operation_id, operation_type, payload, retry_count } = retry;

    try {
      const parsedPayload = JSON.parse(payload);
      let result = null;

      // Executar operação baseada no tipo
      switch (operation_type) {
        case 'process_webhook':
          result = await this.retryProcessWebhook(parsedPayload);
          break;
        case 'send_notification':
          result = await this.[REDACTED_TOKEN](parsedPayload);
          break;
        case 'reconcile_payment':
          result = await this.[REDACTED_TOKEN](parsedPayload);
          break;
        default:
          throw new Error(`Operação desconhecida: ${operation_type}`);
      }

      if (result && result.success) {
        // Operação bem-sucedida: marcar como concluída
        await db.run(
          `UPDATE webhook_retries SET status = ?, completed_at = ? WHERE retry_id = ?`,
          'completed',
          new Date().toISOString(),
          retry_id
        );
        console.log(`✅ Retry concluído: ${retry_id}`);
      } else {
        // Falha: reagendar ou desistir
        if (retry_count < this.MAX_RETRIES) {
          const nextRetryCount = retry_count + 1;
          const nextRetryAt = new Date(Date.now() + this.calculateDelay(nextRetryCount));

          await db.run(
            `UPDATE webhook_retries SET retry_count = ?, next_retry_at = ?, last_error = ? WHERE retry_id = ?`,
            nextRetryCount,
            nextRetryAt.toISOString(),
            (result && result.error) || 'Operação falhou',
            retry_id
          );
          console.log(`🔄 Retry reagendado: ${retry_id} (tentativa ${nextRetryCount}/${this.MAX_RETRIES})`);
        } else {
          // Exceder limite de retentativas: marcar como falho
          await db.run(
            `UPDATE webhook_retries SET status = ?, failed_at = ?, last_error = ? WHERE retry_id = ?`,
            'failed',
            new Date().toISOString(),
            (result && result.error) || 'Limite de retentativas excedido',
            retry_id
          );
          console.error(`❌ Retry descartado após ${this.MAX_RETRIES} tentativas: ${retry_id}`);
        }
      }
    } catch (error) {
      console.error(`❌ Erro ao processar retry ${retry.retry_id}:`, error.message);

      // Marcar como erro crítico
      await db.run(
        `UPDATE webhook_retries SET status = ?, failed_at = ?, last_error = ? WHERE retry_id = ?`,
        'error',
        new Date().toISOString(),
        error.message,
        retry.retry_id
      );
    }
  }

  /**
   * Placeholder: Reprocessar webhook
   */
  async retryProcessWebhook(payload) {
    // Implementação: chamar a mesma lógica de webhook
    console.log('⏳ Reprocessando webhook:', payload.transaction_id);
    return { success: true };
  }

  /**
   * Placeholder: Reenviar notificação
   */
  async [REDACTED_TOKEN](payload) {
    console.log('⏳ Reenviando notificação para:', payload.phoneNumber);
    return { success: true };
  }

  /**
   * Placeholder: Reconciliar pagamento
   */
  async [REDACTED_TOKEN](payload) {
    console.log('⏳ Reconciliando pagamento:', payload.transactionId);
    return { success: true };
  }

  /**
   * Obter status de uma tentativa
   */
  async getRetryStatus(retryId) {
    try {
      const retry = await db.get(
        `SELECT * FROM webhook_retries WHERE retry_id = ?`,
        retryId
      );
      return retry || { error: 'Retry não encontrado' };
    } catch (error) {
      console.error('❌ Erro ao obter status:', error.message);
      return { error: error.message };
    }
  }

  /**
   * Obter histórico de retentativas de uma operação
   */
  async getOperationHistory(operationId) {
    try {
      const history = await db.all(
        `SELECT * FROM webhook_retries WHERE operation_id = ? ORDER BY created_at DESC`,
        operationId
      );
      return history || [];
    } catch (error) {
      console.error('❌ Erro ao obter histórico:', error.message);
      return [];
    }
  }
}

module.exports = new RetryQueue();
