import express from 'express';
import { SecurityDashboard } from '../components/SecurityDashboard';

const router = express.Router();

// Security Dashboard route
router.get('/security', (req, res) => {
  res.json({ message: 'Security Dashboard is accessible' });
});

export default router;
</create_file>
