require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./modules/auth/auth.routes');
const giverRoutes = require('./modules/giver/giver.routes');
const seekerRoutes = require('./modules/seeker/seeker.routes');
const adminRoutes = require('./modules/admin/admin.routes');
const masterRoutes = require('./modules/master/master.routes');
const contentRoutes = require('./modules/content/content.routes');
const contentAdminRoutes = require('./modules/content/content.admin.routes');
const supportRoutes = require('./modules/support/support.routes');
const supportAdminRoutes = require('./modules/support/support.admin.routes');
const reportRoutes = require('./modules/report/report.routes');
const commonRoutes = require('./modules/common/common.routes');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (images, audio, video, pdf)
app.use('/uploads', express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads')));

app.get('/health', (req, res) => res.json({ success: true, message: 'API is healthy' }));

// Route groups
app.use('/api/v1/master', masterRoutes); // public dropdown/lookup data
app.use('/api/v1/content-pages', contentRoutes); // public: Terms & Conditions, Privacy Policy
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/giver', giverRoutes);
app.use('/api/v1/seeker', seekerRoutes);
app.use('/api/v1/admin/content-pages', contentAdminRoutes); // admin: manage Terms/Privacy content
app.use('/api/v1/admin/support', supportAdminRoutes); // admin: view/resolve Contact Support messages
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1', supportRoutes); // /support/contact (Seeker + Giver)
app.use('/api/v1/reports', reportRoutes); // Seeker/Giver -> file a report (feeds Admin's Reports & Moderation)
app.use('/api/v1', commonRoutes); // /messages, /notifications, /settings (shared)

app.use(notFound);
app.use(errorHandler);

module.exports = app;
