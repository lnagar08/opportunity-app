const { body } = require('express-validator');
const prisma = require('../config/db');

// State is always a strict dropdown — must match an active State row.
const stateExistsValidator = (field = 'state', optional = false) => {
  const chain = body(field);
  (optional ? chain.optional({ checkFalsy: true }) : chain.notEmpty().withMessage('State is required'));
  return chain.custom(async (value) => {
    if (value === undefined) return true; // optional() already let it pass
    const state = await prisma.state.findFirst({ where: { name: value, isActive: true } });
    if (!state) throw new Error('Invalid State selected');
    return true;
  });
};

// City is a dropdown by default (must exist under the chosen State), but
// isManualCity=true switches it to free-text — the "Add Manually" button
// on the client flips this flag and shows a textbox instead of the select.
const cityValidator = (cityField = 'city', stateField = 'state', manualField = 'isManualCity', optional = false) => {
  const manualFlag = body(manualField).optional().isBoolean().withMessage('isManualCity must be boolean');

  const cityChain = body(cityField);
  (optional ? cityChain.optional({ checkFalsy: true }) : cityChain.notEmpty().withMessage('City is required'));
  cityChain
    .isLength({ max: 100 }).withMessage('City must be under 100 characters')
    .custom(async (value, { req }) => {
      if (value === undefined) return true;
      const isManual = req.body[manualField] === true || req.body[manualField] === 'true';
      if (isManual) return true; // free text — no dropdown match required

      const state = await prisma.state.findFirst({ where: { name: req.body[stateField], isActive: true } });
      if (!state) return true; // stateExistsValidator already reports this

      const city = await prisma.city.findFirst({ where: { stateId: state.id, name: value, isActive: true } });
      if (!city) {
        throw new Error('Invalid City selected for this State — set isManualCity=true to add it manually');
      }
      return true;
    });

  return [manualFlag, cityChain];
};

module.exports = { stateExistsValidator, cityValidator };