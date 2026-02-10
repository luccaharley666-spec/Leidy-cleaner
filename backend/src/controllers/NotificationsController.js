const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const subsFile = path.join(__dirname, '..', '..', 'backend_data', 'subscriptions.json');

function ensureFile() {
  const dir = path.dirname(subsFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(subsFile)) fs.writeFileSync(subsFile, '[]', 'utf8');
}

function loadSubs() {
  ensureFile();
  try {
    const raw = fs.readFileSync(subsFile, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}

function saveSubs(list) {
  ensureFile();
  fs.writeFileSync(subsFile, JSON.stringify(list, null, 2), 'utf8');
}

function ensureVapid() {
  const publicKey = process.env.[REDACTED_TOKEN] || process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    // generate temporally for demo if not present
    const keys = webpush.generateVAPIDKeys();
    webpush.setVapidDetails('mailto:dev@localhost', keys.publicKey, keys.privateKey);
    return { generated: true, publicKey: keys.publicKey };
  }
  webpush.setVapidDetails('mailto:admin@yourdomain.com', publicKey, privateKey);
  return { generated: false, publicKey };
}

const [REDACTED_TOKEN] = {
  subscribe: (req, res) => {
    try {
      const sub = req.body;
      if (!sub || !sub.endpoint) return res.status(400).json({ error: 'Subscription inválida' });
      const list = loadSubs();
      const exists = list.find(s => s.endpoint === sub.endpoint);
      if (!exists) {
        list.push(sub);
        saveSubs(list);
      }
      return res.json({ success: true });
    } catch (err) {
      console.error('subscribe err', err);
      return res.status(500).json({ error: 'Erro ao salvar subscription' });
    }
  },

  unsubscribe: (req, res) => {
    try {
      const { endpoint } = req.body;
      if (!endpoint) return res.status(400).json({ error: 'Endpoint necessário' });
      const list = loadSubs();
      const filtered = list.filter(s => s.endpoint !== endpoint);
      saveSubs(filtered);
      return res.json({ success: true });
    } catch (err) {
      console.error('unsubscribe err', err);
      return res.status(500).json({ error: 'Erro ao remover subscription' });
    }
  },

  sendTest: async (req, res) => {
    try {
      const vapid = ensureVapid();
      const list = loadSubs();
      if (!list.length) return res.status(400).json({ error: 'Nenhuma subscription registrada' });

      const payload = JSON.stringify({ title: 'Teste', body: 'Notificação de teste enviada pelo servidor', url: '/' });

      const results = await Promise.allSettled(list.map(sub => webpush.sendNotification(sub, payload).catch(e => e)));

      // limpar subscriptions expiradas
      const remaining = [];
      results.forEach((r, idx) => {
        if (r.status === 'fulfilled') remaining.push(list[idx]);
        else {
          const err = r.reason || r;
          // se for 410/404 remover
          if (err && err.statusCode && (err.statusCode === 410 || err.statusCode === 404)) {
            // skip
          } else {
            // manter se erro temporário
            remaining.push(list[idx]);
          }
        }
      });

      saveSubs(remaining);

      return res.json({ success: true, sent: results.filter(r => r.status === 'fulfilled').length, total: list.length, vapidPublicKey: vapid.publicKey });
    } catch (err) {
      console.error('sendTest err', err);
      return res.status(500).json({ error: 'Erro ao enviar notificações' });
    }
  }
};

module.exports = [REDACTED_TOKEN];
