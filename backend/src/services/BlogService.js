/**
 * BlogService.js
 * Blog + SEO para crescimento orgânico
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const slug = require('slug');

const DB_PATH = path.join(__dirname, '../../backend_data/database.db');

class BlogService {
  /**
   * Criar post de blog
   */
  static createPost(title, content, author, keywords = [], excerpt = '') {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      const postSlug = slug(title).toLowerCase();
      const keywordStr = keywords.join(',');

      db.run(
        `INSERT INTO blog_posts (title, slug, content, excerpt, author_id, keywords, published, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))`,
        [title, postSlug, content, excerpt, author, keywordStr],
        function (err) {
          db.close();
          if (err) return reject(err);
          resolve({ success: true, postId: this.lastID, slug: postSlug });
        }
      );
    });
  }

  /**
   * Obter post por slug
   */
  static getPostBySlug(slug) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.get(
        `SELECT p.*, u.name as author_name FROM blog_posts p
         LEFT JOIN users u ON p.author_id = u.id
         WHERE p.slug = ? AND p.published = 1`,
        [slug],
        (err, row) => {
          if (err) {
            db.close();
            return reject(err);
          }

          // Incrementar views
          if (row) {
            db.run(
              `UPDATE blog_posts SET views = views + 1 WHERE id = ?`,
              [row.id]
            );
          }

          db.close();
          resolve({ success: true, post: row });
        }
      );
    });
  }

  /**
   * Listar posts (com paginação)
   */
  static listPosts(page = 1, limit = 10) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);
      const offset = (page - 1) * limit;

      db.all(
        `SELECT p.*, u.name as author_name FROM blog_posts p
         LEFT JOIN users u ON p.author_id = u.id
         WHERE p.published = 1
         ORDER BY p.created_at DESC
         LIMIT ? OFFSET ?`,
        [limit, offset],
        (err, rows) => {
          db.close();
          if (err) return reject(err);
          resolve({ success: true, posts: rows, page, limit });
        }
      );
    });
  }

  /**
   * Buscar posts por keyword
   */
  static searchPosts(query) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.all(
        `SELECT p.*, u.name as author_name FROM blog_posts p
         LEFT JOIN users u ON p.author_id = u.id
         WHERE p.published = 1 AND (
           p.title LIKE ? OR 
           p.content LIKE ? OR 
           p.keywords LIKE ?
         )
         ORDER BY p.views DESC`,
        [`%${query}%`, `%${query}%`, `%${query}%`],
        (err, rows) => {
          db.close();
          if (err) return reject(err);
          resolve({ success: true, posts: rows, query });
        }
      );
    });
  }

  /**
   * Gerar sitemap XML para SEO
   */
  static generateSitemap(baseUrl) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.all(
        `SELECT slug, updated_at FROM blog_posts WHERE published = 1`,
        (err, rows) => {
          db.close();
          if (err) return reject(err);

          let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
          sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

          rows.forEach(post => {
            sitemap += '  <url>\n';
            sitemap += `    <loc>${baseUrl}/blog/${post.slug}</loc>\n`;
            sitemap += `    <lastmod>${post.updated_at}</lastmod>\n`;
            sitemap += '    <changefreq>weekly</changefreq>\n';
            sitemap += '  </url>\n';
          });

          sitemap += '</urlset>';
          resolve({ success: true, sitemap });
        }
      );
    });
  }

  /**
   * Obter dados meta para SEO
   */
  static getPostMeta(slug) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(DB_PATH);

      db.get(
        `SELECT title, excerpt, keywords FROM blog_posts WHERE slug = ?`,
        [slug],
        (err, row) => {
          db.close();
          if (err) return reject(err);

          if (row) {
            resolve({
              success: true,
              meta: {
                title: row.title,
                description: row.excerpt,
                keywords: row.keywords
              }
            });
          } else {
            resolve({ success: false });
          }
        }
      );
    });
  }

  static createTable() {
    const db = new sqlite3.Database(DB_PATH);

    db.run(`
      CREATE TABLE IF NOT EXISTS blog_posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        author_id INTEGER,
        keywords VARCHAR(255),
        views INTEGER DEFAULT 0,
        published INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) console.error('Erro ao criar tabela blog_posts:', err);
      else console.log('✅ Tabela blog_posts criada');
      db.close();
    });
  }
}

module.exports = BlogService;
