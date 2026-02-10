/**
 * Backup & Disaster Recovery Controller
 * Endpoints para backups, PITR, replicação
 */

const express = require('express');
const router = express.Router();
const BackupService = require('../services/BackupService');

// POST /api/backup/full
router.post('/full', async (req, res) => {
  try {
    const { backupName } = req.body;
    const backup = await BackupService.createFullBackup(backupName);
    res.status(201).json(backup);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/backup/incremental
router.post('/incremental', async (req, res) => {
  try {
    const backup = await BackupService.[REDACTED_TOKEN]();
    res.status(201).json(backup);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/backup/schedule
router.post('/schedule', async (req, res) => {
  try {
    const { schedule, time, retention } = req.body;
    const result = await BackupService.[REDACTED_TOKEN]({
      schedule,
      time,
      retention
    });
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/backup/restore-pitr
router.post('/restore-pitr', async (req, res) => {
  try {
    const { restoreDate } = req.body;
    const restore = await BackupService.[REDACTED_TOKEN](restoreDate);
    res.status(201).json(restore);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/backup/:backupId/restore
router.post('/:backupId/restore', async (req, res) => {
  try {
    const { targetEnvironment = 'staging' } = req.body;
    const restore = await BackupService.restoreFromBackup(req.params.backupId, targetEnvironment);
    res.json(restore);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/backup/geo-replication
router.post('/geo-replication', async (req, res) => {
  try {
    const { primaryRegion, replicaRegions } = req.body;
    const replication = await BackupService.[REDACTED_TOKEN]({
      primaryRegion,
      replicaRegions
    });
    res.json(replication);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/backup/:backupId/test
router.post('/:backupId/test', async (req, res) => {
  try {
    const result = await BackupService.testRestore(req.params.backupId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/backup/stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await BackupService.getBackupStats();
    res.json(stats);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/backup/validate
router.get('/validate', async (req, res) => {
  try {
    const result = await BackupService.[REDACTED_TOKEN]();
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
