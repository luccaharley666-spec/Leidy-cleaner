/**
 * Blog Routes
 * GET /api/blog - Listar posts
 * GET /api/blog/:slug - Obter post específico
 * POST /api/blog - Criar post (admin)
 * PUT /api/blog/:id - Editar post (admin)
 * DELETE /api/blog/:id - Deletar post (admin)
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const db = require('../db');
const logger = require('../utils/logger');

/**
 * GET /api/blog
 * Listar posts com paginação
 * Query: ?page=1&limit=10&category=cleaning
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM blog_posts WHERE published = 1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const posts = await db.all(query, ...params);

    // Contar total
    let countQuery = 'SELECT COUNT(*) as total FROM blog_posts WHERE published = 1';
    if (category) {
      countQuery += ' AND category = ?';
    }
    const [{ total }] = await db.all(
      countQuery,
      ...(category ? [category] : [])
    );

    res.json({
      success: true,
      posts: posts.map(p => ({
        ...p,
        excerpt: p.excerpt || p.content?.substring(0, 200)
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    logger.error('List blog posts failed', err);
    res.status(500).json({ success: false, error: 'Erro ao listar posts' });
  }
});

/**
 * GET /api/blog/:slug
 * Obter post específico por slug
 */
router.get('/:slug', async (req, res) => {
  try {
    const post = await db.get(
      'SELECT * FROM blog_posts WHERE slug = ? AND published = 1',
      req.params.slug
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post não encontrado'
      });
    }

    // Incrementar views (TODO: implementar com Redis)
    await db.run(
      'UPDATE blog_posts SET views = views + 1 WHERE id = ?',
      post.id
    );

    // Buscar posts relacionados
    const related = await db.all(
      `SELECT id, title, slug, excerpt, featured_image, published_at 
       FROM blog_posts 
       WHERE category = ? AND id != ? AND published = 1
       LIMIT 3`,
      post.category,
      post.id
    );

    res.json({
      success: true,
      post: {
        ...post,
        views: post.views + 1
      },
      related
    });
  } catch (err) {
    logger.error('Get blog post failed', err);
    res.status(500).json({ success: false, error: 'Erro ao obter post' });
  }
});

/**
 * POST /api/blog
 * Criar novo post (admin)
 * Body: { title, content, category, keywords, featured_image }
 */
router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { title, content, category = 'tips', keywords, featured_image } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Título e conteúdo são obrigatórios'
      });
    }

    // Gerar slug (converter título para slug URL-friendly)
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Verificar se slug já existe
    const existing = await db.get('SELECT id FROM blog_posts WHERE slug = ?', slug);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Este título já existe como outro post'
      });
    }

    await db.run(
      `INSERT INTO blog_posts (title, slug, excerpt, content, category, keywords, featured_image, author_id, published, published_at, views, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), 0, datetime('now'))`,
      title,
      slug,
      content.substring(0, 200), // Excerpt
      content,
      category,
      keywords || '',
      featured_image || null,
      req.user.id
    );

    logger.info('Blog post created', { title, slug, authorId: req.user.id });

    res.json({
      success: true,
      message: 'Post publicado com sucesso!',
      slug
    });
  } catch (err) {
    logger.error('Blog post creation failed', err);
    res.status(500).json({ success: false, error: 'Erro ao criar post' });
  }
});

/**
 * PUT /api/blog/:id
 * Editar post (admin)
 */
router.put('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const { title, content, category, keywords, featured_image, published } = req.body;

    const post = await db.get('SELECT * FROM blog_posts WHERE id = ?', req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post não encontrado'
      });
    }

    // Se título mudou, atualizar slug
    let newSlug = post.slug;
    if (title && title !== post.title) {
      newSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Verificar conflito
      const conflict = await db.get(
        'SELECT id FROM blog_posts WHERE slug = ? AND id != ?',
        newSlug,
        req.params.id
      );
      if (conflict) {
        return res.status(400).json({
          success: false,
          error: 'Outro post já usa este slug'
        });
      }
    }

    await db.run(
      `UPDATE blog_posts 
       SET title = ?, slug = ?, content = ?, category = ?, keywords = ?, featured_image = ?, published = ?
       WHERE id = ?`,
      title || post.title,
      newSlug,
      content || post.content,
      category || post.category,
      keywords || post.keywords,
      featured_image === undefined ? post.featured_image : featured_image,
      published !== undefined ? (published ? 1 : 0) : post.published,
      req.params.id
    );

    logger.info('Blog post updated', { postId: req.params.id });

    res.json({
      success: true,
      message: 'Post atualizado'
    });
  } catch (err) {
    logger.error('Blog post update failed', err);
    res.status(500).json({ success: false, error: 'Erro ao atualizar' });
  }
});

/**
 * DELETE /api/blog/:id
 * Deletar post (admin)
 */
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    await db.run('DELETE FROM blog_posts WHERE id = ?', req.params.id);

    logger.info('Blog post deleted', { postId: req.params.id });

    res.json({
      success: true,
      message: 'Post removido'
    });
  } catch (err) {
    logger.error('Blog post delete failed', err);
    res.status(500).json({ success: false, error: 'Erro ao remover' });
  }
});

/**
 * GET /api/blog/categories
 * Listar categorias de blog
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await db.all(
      'SELECT DISTINCT category FROM blog_posts WHERE published = 1 ORDER BY category'
    );

    res.json({
      success: true,
      categories: categories.map(c => c.category)
    });
  } catch (err) {
    logger.error('Get categories failed', err);
    res.status(500).json({ success: false, error: 'Erro ao listar categorias' });
  }
});

module.exports = router;
