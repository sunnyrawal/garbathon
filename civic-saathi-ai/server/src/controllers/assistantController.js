// src/controllers/assistantController.js
import { answerQuestion } from '../agent/assistant.js';
import { sendError, sendSuccess } from '../utils/errorResponse.js';

export async function assistantHandler(req, res) {
  const { question, ticketId, context } = req.body;

  if (!question || typeof question !== 'string' || question.trim().length === 0) {
    return sendError(res, 'INVALID_QUESTION', 'A question is required.', 400);
  }

  if (question.trim().length > 500) {
    return sendError(res, 'QUESTION_TOO_LONG', 'Question must be under 500 characters.', 400);
  }

  const result = await answerQuestion(question.trim(), { ticketId, ...context });

  if (!result.success) {
    return sendError(res, result.code, result.message, 400);
  }

  return sendSuccess(res, {
    answer: result.answer,
    toolEvents: result.toolEvents,
    ticketData: result.ticketData || null,
    warning: result.warning || null,
  });
}
