// src/utils/errorResponse.js
export function errorResponse(code, message, statusCode = 400) {
  return {
    success: false,
    error: { code, message },
    statusCode,
  };
}

export function successResponse(data, message = 'OK') {
  return { success: true, message, data };
}

export function sendError(res, code, message, statusCode = 400) {
  return res.status(statusCode).json({ success: false, error: { code, message } });
}

export function sendSuccess(res, data, message = 'OK', statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}
