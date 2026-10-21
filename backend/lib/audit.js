const AuditEvent = require('../models/AuditEvent');
module.exports = async function audit(req, action, target = '', outcome = 'success') {
  await AuditEvent.create({ actor: req.user?._id || null, action, target: String(target).slice(0, 100), outcome });
};
