/**
 * SEO & Marketing Controller
 * Endpoints para SEO, meta tags, campanhas, analytics
 */

const express = require('express');
const router = express.Router();
const SEOMarketingService = require('../services/SEOMarketingService');

// POST /api/seo/meta-tags
router.post('/meta-tags', (req, res) => {
  try {
    const { title, description, keywords, pageUrl, imageUrl, serviceType } = req.body;
    const metaTags = SEOMarketingService.generateMetaTags({
      title,
      description,
      keywords,
      pageUrl,
      imageUrl,
      serviceType
    });
    res.json(metaTags);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/seo/schema
router.post('/schema', (req, res) => {
  try {
    const { entityType, entityData } = req.body;
    const schema = SEOMarketingService.[REDACTED_TOKEN](entityType, entityData);
    res.json({ '@context': 'schema.org', schema });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/seo/sitemap
router.get('/sitemap', (req, res) => {
  try {
    const pages = [
      { url: '/services', changefreq: 'weekly', priority: 0.9 },
      { url: '/about', changefreq: 'monthly', priority: 0.7 },
      { url: '/blog', changefreq: 'daily', priority: 0.8 }
    ];
    const sitemap = SEOMarketingService.generateSitemap(pages);
    res.json(sitemap);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/marketing/campaigns
router.post('/campaigns', async (req, res) => {
  try {
    const { name, type, targetAudience, budget, startDate, endDate, content } = req.body;
    const campaign = await SEOMarketingService.[REDACTED_TOKEN]({
      name,
      type,
      targetAudience,
      budget,
      startDate,
      endDate,
      content
    });
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/marketing/campaigns/:campaignId/launch
router.post('/campaigns/:campaignId/launch', async (req, res) => {
  try {
    const campaign = await SEOMarketingService.launchCampaign(req.params.campaignId);
    res.json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/seo/metrics
router.get('/metrics', (req, res) => {
  try {
    const { url } = req.query;
    const metrics = SEOMarketingService.getSEOMetrics(url || '/');
    res.json(metrics);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/seo/competitors
router.get('/competitors', (req, res) => {
  try {
    const { keyword } = req.query;
    const analysis = SEOMarketingService.analyzeCompetitors(keyword || 'serviços');
    res.json(analysis);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/marketing/campaigns/:campaignId/metrics
router.get('/campaigns/:campaignId/metrics', async (req, res) => {
  try {
    const metrics = await SEOMarketingService.getCampaignMetrics(req.params.campaignId);
    res.json(metrics);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
