/**
 * Hour Packaging Service - Sistema de Pacotes de Horas
 * Cliente compra pacotes de horas (40h, 60h, 80h, etc)
 * Depois usa conforme necessário com desconto nas taxas
 */

const { getDb } = require('../db/sqlite');

class [REDACTED_TOKEN] {
  /**
   * Gerar lista de pacotes disponíveis
   * 40h (primeira), depois +20h cada
   * Sem máximo fixo, mas calculamos até um razoável (420h = 10 pacotes)
   */
  [REDACTED_TOKEN]() {
    const packages = [];
    for (let i = 40; i <= 420; i += 20) {
      const pricePerHour = this.getPricePerHour(i);
      const totalPrice = i * pricePerHour;

      packages.push({
        hours: i,
        pricePerHour: pricePerHour,
        totalPrice: Math.round(totalPrice * 100) / 100,
        description: `${i} horas de serviço`,
      });
    }
    return packages;
  }

  /**
   * Determinar preço por hora baseado na quantidade
   * Primeira 40h = R$40/h, a partir de 60h = R$20/h
   */
  getPricePerHour(totalHours) {
    if (totalHours <= 40) {
      return 40;
    }
    // A partir de 60h, todas as horas custam R$20/h
    return 20;
  }

  /**
   * Calcular preço para determinada quantidade de horas
   * Inclui taxas: serviço (40%), pós-obra (20%), organização (10%), produto (R$30)
   */
  async calculateHourPrice(data) {
    const {
      hours = 0,
      characteristics = {}, // número de ambientes, pessoas, etc
      userId = null,
    } = data;

    if (hours <= 0) {
      return {
        error: 'Quantidade de horas deve ser maior que 0',
      };
    }

    // 1. Preço base por horas
    const basePrice = hours * this.getPricePerHour(hours);

    // 2. Taxa de serviço (40% do preço base)
    const serviceFee = basePrice * 0.4;

    // 3. Pós-obra (20% do total até agora)
    const subTotal = basePrice + serviceFee;
    const postWorkFee = subTotal * 0.2;

    // 4. Organização (10% do total até agora)
    const organizationFee = (subTotal + postWorkFee) * 0.1;

    // 5. Produto (R$30 fixo, sem taxa adicional)
    const productFee = 30;

    // Cálculo Final
    const finalPrice =
      basePrice +
      serviceFee +
      postWorkFee +
      organizationFee +
      productFee;

    // Verificar se usuário tem crédito de horas
    let creditInfo = { hasCredit: false, availableHours: 0, discountValue: 0 };
    if (userId) {
      creditInfo = await this.getUserHourCredit(userId);
    }

    // Se tem crédito suficiente, aplica desconto nas taxas
    let discountedPrice = finalPrice;
    if (creditInfo.hasCredit && creditInfo.availableHours >= hours) {
      // Desconto: não cobra taxa de serviço (40%) se usar crédito
      discountedPrice =
        basePrice + postWorkFee + organizationFee + productFee;
      creditInfo.discountValue = serviceFee;
    }

    return {
      success: true,
      hours: hours,
      breakdown: {
        basePrice: Math.round(basePrice * 100) / 100,
        serviceFee: Math.round(serviceFee * 100) / 100,
        postWorkFee: Math.round(postWorkFee * 100) / 100,
        organizationFee: Math.round(organizationFee * 100) / 100,
        productFee: Math.round(productFee * 100) / 100,
      },
      finalPrice: Math.round(finalPrice * 100) / 100,
      discountedPrice: Math.round(discountedPrice * 100) / 100,
      creditInfo: creditInfo,
      pricePerHour: this.getPricePerHour(hours),
      characteristics: characteristics,
    };
  }

  /**
   * Obter informações de crédito de horas do usuário
   */
  async getUserHourCredit(userId) {
    if (!userId) {
      return { hasCredit: false, availableHours: 0 };
    }

    const db = getDb();
    try {
      const credit = await new Promise((resolve, reject) => {
        db.get(
          'SELECT * FROM user_hour_credits WHERE user_id = ?',
          [userId],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });

      if (!credit) {
        return { hasCredit: false, availableHours: 0 };
      }

      return {
        hasCredit: credit.available_hours > 0,
        availableHours: credit.available_hours,
        totalHours: credit.total_hours,
        usedHours: credit.used_hours,
      };
    } catch (error) {
      console.error('[[REDACTED_TOKEN]] Erro ao buscar crédito:', error.message);
      return { hasCredit: false, availableHours: 0 };
    }
  }

  /**
   * Adicionar crédito de horas para usuário (após compra de pacote)
   */
  async addUserHourCredit(userId, hours, expiryDays = 365) {
    const db = getDb();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + expiryDays);

    return new Promise((resolve, reject) => {
      db.run(
        `
        INSERT INTO user_hour_credits (user_id, total_hours, available_hours, last_purchase_date, expiry_date)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          total_hours = total_hours + ?,
          available_hours = available_hours + ?,
          last_purchase_date = CURRENT_TIMESTAMP,
          expiry_date = ?
        `,
        [userId, hours, hours, expiryDate.toISOString(), hours, hours, expiryDate.toISOString()],
        function (err) {
          if (err) reject(err);
          else resolve({ userId: userId, addedHours: hours });
        }
      );
    });
  }

  /**
   * Consumir crédito de horas (ao finalizar booking)
   */
  async consumeHourCredit(userId, hoursUsed) {
    const db = getDb();

    return new Promise((resolve, reject) => {
      db.run(
        `
        UPDATE user_hour_credits
        SET used_hours = used_hours + ?,
            available_hours = total_hours - (used_hours + ?),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
        `,
        [hoursUsed, hoursUsed, userId],
        function (err) {
          if (err) reject(err);
          else resolve({ userId: userId, hoursConsumed: hoursUsed });
        }
      );
    });
  }

  /**
   * Sugerir pacote automático baseado em horas solicitadas
   * Ex: se pede 50h, sugere pacote de 60h
   */
  suggestPackage(requestedHours) {
    const packages = this.[REDACTED_TOKEN]();
    // Encontrar o primeiro pacote que atende às horas solicitadas
    const suggested = packages.find((pkg) => pkg.hours >= requestedHours);
    return suggested || packages[packages.length - 1]; // fallback para maior
  }
}

module.exports = new [REDACTED_TOKEN]();
