/**
 * SubscriptionService.js
 * Planos de subscrição mensal
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const DB_PATH = path.join(__dirname, '../../backend_data/database.db');

class SubscriptionService {
  /**
   * Listar planos disponíveis
   */
  static getPlans() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.all(
        `SELECT * FROM subscription_plans WHERE active = 1 ORDER BY price ASC`,
        (err, rows) => {
          db.close();
          if (err) return reject(err);
          resolve({ success: true, plans: rows });
        }
      );
    });
  }

  /**
   * Criar subscrição com Stripe
   */
  static async createSubscription(userId, planId, stripePaymentMethod) {
    const db = new sqlite3.Database(DB_PATH);

    return new Promise(async (resolve, reject) => {
      db.get(
        `SELECT stripe_price_id FROM subscription_plans WHERE id = ?`,
        [planId],
        async (err, plan) => {
          if (err || !plan) {
            db.close();
            return reject(new Error('Plano não encontrado'));
          }

          try {
            // Obter/criar customer Stripe
            const user = await new Promise((res, rej) =>
              db.get(
                `SELECT stripe_customer_id FROM users WHERE id = ?`,
                [userId],
                (e, r) => e ? rej(e) : res(r)
              )
            );

            let customerId = user?.stripe_customer_id;

            if (!customerId) {
              const customer = await stripe.customers.create({
                email: `user_${userId}@platform.local`,
                payment_method: stripePaymentMethod,
                invoice_settings: { [REDACTED_TOKEN]: stripePaymentMethod }
              });
              customerId = customer.id;

              // Salvar no DB
              db.run(
                `UPDATE users SET stripe_customer_id = ? WHERE id = ?`,
                [customerId, userId]
              );
            }

            // Criar subscrição
            const subscription = await stripe.subscriptions.create({
              customer: customerId,
              items: [{ price: plan.stripe_price_id }]
            });

            // Salvar em DB
            db.run(
              `INSERT INTO user_subscriptions (user_id, plan_id, [REDACTED_TOKEN], status, started_at)
               VALUES (?, ?, ?, ?, datetime('now'))`,
              [userId, planId, subscription.id, 'active'],
              (err) => {
                db.close();
                if (err) return reject(err);
                resolve({ success: true, subscription });
              }
            );
          } catch (stripeErr) {
            db.close();
            reject(stripeErr);
          }
        }
      );
    });
  }

  /**
   * Cancelar subscrição
   */
  static async cancelSubscription(subscriptionId) {
    try {
      const db = new sqlite3.Database(DB_PATH);

      return new Promise(async (resolve, reject) => {
        db.get(
          `SELECT [REDACTED_TOKEN] FROM user_subscriptions WHERE id = ?`,
          [subscriptionId],
          async (err, sub) => {
            if (err || !sub) {
              db.close();
              return reject(new Error('Subscrição não encontrada'));
            }

            try {
              await stripe.subscriptions.del(sub.[REDACTED_TOKEN]);

              db.run(
                `UPDATE user_subscriptions SET status = 'cancelled', cancelled_at = datetime('now') WHERE id = ?`,
                [subscriptionId],
                (err) => {
                  db.close();
                  if (err) return reject(err);
                  resolve({ success: true });
                }
              );
            } catch (stripeErr) {
              db.close();
              reject(stripeErr);
            }
          }
        );
      });
    } catch (error) {
      throw error;
    }
  }

  static createTables() {
    const db = new sqlite3.Database(DB_PATH);

    db.run(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        hours_per_month INTEGER NOT NULL,
        stripe_price_id VARCHAR(255),
        active INTEGER DEFAULT 1
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        plan_id INTEGER NOT NULL,
        [REDACTED_TOKEN] VARCHAR(255),
        status VARCHAR(50),
        started_at DATETIME,
        cancelled_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (plan_id) REFERENCES subscription_plans(id)
      )
    `, (err) => {
      if (err) console.error('Erro ao criar tabelas subscriptions:', err);
      else console.log('✅ Tabelas subscriptions criadas');
      db.close();
    });
  }
}

module.exports = SubscriptionService;
