import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../../constant';
import { emailCampaignController } from './emailCampaign.controller';

const router = Router();

// All routes are admin-only
const adminOnly = auth(USER_ROLE.ADMIN);

/* ──────────────────────────────────────────────────────────────────
   Static routes  (must come BEFORE /:id to avoid param conflicts)
────────────────────────────────────────────────────────────────── */

// GET   /admin/email-campaigns/templates  — list all available template keys
router.get('/templates', adminOnly, emailCampaignController.getTemplateKeys);

// GET   /admin/email-campaigns/segments   — list built-in segment presets
router.get('/segments', adminOnly, emailCampaignController.getSegmentPresets);

// POST  /admin/email-campaigns/preview    — send test email to admin inbox
router.post('/preview', adminOnly, emailCampaignController.sendPreview);

/* ──────────────────────────────────────────────────────────────────
   Collection routes
────────────────────────────────────────────────────────────────── */

// POST  /admin/email-campaigns  — create campaign
router.post('/', adminOnly, emailCampaignController.createCampaign);

// GET   /admin/email-campaigns  — list campaigns (paginated + filterable)
router.get('/', adminOnly, emailCampaignController.getAllCampaigns);

/* ──────────────────────────────────────────────────────────────────
   Document routes  /:id
────────────────────────────────────────────────────────────────── */

// GET   /admin/email-campaigns/:id        — get single campaign with delivery stats
router.get('/:id', adminOnly, emailCampaignController.getCampaignById);

// PATCH /admin/email-campaigns/:id        — update draft/queued campaign
router.patch('/:id', adminOnly, emailCampaignController.updateCampaign);

// DELETE /admin/email-campaigns/:id       — cancel / hard-delete campaign
router.delete('/:id', adminOnly, emailCampaignController.deleteCampaign);

// POST  /admin/email-campaigns/:id/send-now  — force send immediately
router.post('/:id/send-now', adminOnly, emailCampaignController.sendCampaignNow);

// GET   /admin/email-campaigns/:id/log    — paginated delivery log
router.get('/:id/log', adminOnly, emailCampaignController.getCampaignLog);

// GET   /admin/email-campaigns/:id/stats  — daily sending stats
router.get('/:id/stats', adminOnly, emailCampaignController.getCampaignStats);

export const emailCampaignRouter = router;
