// src/controllers/wardsController.js
import { lookupWard, getSupportedAreas } from '../tools/lookupWard.js';
import { sendError, sendSuccess } from '../utils/errorResponse.js';

export async function wardLookupHandler(req, res) {
  const area = req.query.area;
  if (!area) {
    const supported = await getSupportedAreas();
    return sendSuccess(res, { supportedAreas: supported, message: 'Provide ?area= to look up a ward.' });
  }

  const result = await lookupWard(area);
  if (!result.success) {
    return res.status(404).json({ success: false, error: { code: result.code, message: result.message },
      supportedAreas: result.supportedAreas });
  }

  return sendSuccess(res, result);
}
