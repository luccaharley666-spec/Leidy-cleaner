/**
 * Database Migration: Add Chat Messages Table
 * Para criptografia end-to-end de mensagens privadas
 */

// Migration [REDACTED_TOKEN].js

const [REDACTED_TOKEN] = `
  CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    encrypted_message TEXT NOT NULL,
    iv TEXT NOT NULL,
    auth_tag TEXT NOT NULL,
    algorithm TEXT DEFAULT 'aes-256-gcm',
    is_read BOOLEAN DEFAULT 0,
    is_deleted BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON chat_messages(conversation_id);
  CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON chat_messages(sender_id);
  CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON chat_messages(receiver_id);
  CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON chat_messages(created_at DESC);
  CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON chat_messages(receiver_id, is_read);
`;

const [REDACTED_TOKEN] = `
  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    user1_id TEXT NOT NULL,
    user2_id TEXT NOT NULL,
    last_message_at TIMESTAMP,
    is_archived BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user1_id, user2_id),
    FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON conversations(user1_id, user2_id);
  CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON conversations(last_message_at DESC);
`;

const [REDACTED_TOKEN] = `
  CREATE TABLE IF NOT EXISTS encrypted_files (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    uploader_id TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INT NOT NULL,
    encrypted_size INT NOT NULL,
    iv TEXT NOT NULL,
    auth_tag TEXT NOT NULL,
    encrypted_data BLOB NOT NULL,
    algorithm TEXT DEFAULT 'aes-256-gcm',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON encrypted_files(conversation_id);
  CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON encrypted_files(uploader_id);
`;

const [REDACTED_TOKEN] = `
  CREATE TABLE IF NOT EXISTS crypto_audit_log (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    operation TEXT NOT NULL,
    operation_type TEXT,
    resource_id TEXT,
    success BOOLEAN DEFAULT 1,
    error_message TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON crypto_audit_log(user_id);
  CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON crypto_audit_log(operation);
  CREATE INDEX IF NOT EXISTS [REDACTED_TOKEN] ON crypto_audit_log(created_at DESC);
`;

module.exports = {
  [REDACTED_TOKEN],
  [REDACTED_TOKEN],
  [REDACTED_TOKEN],
  [REDACTED_TOKEN],
  runMigrations: async (db) => {
    try {
      await db.exec([REDACTED_TOKEN]);
      await db.exec([REDACTED_TOKEN]);
      await db.exec([REDACTED_TOKEN]);
      await db.exec([REDACTED_TOKEN]);
    } catch (error) {
      console.error('❌ Chat migration failed:', error);
      throw error;
    }
  }
};
