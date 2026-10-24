// src/agent/assistant.js
// Tool 7: AI Assistant — orchestrates answers using real tool data
import { GoogleGenAI } from '@google/genai';
import { config, isDemoMode } from '../config/env.js';
import { getComplaintStatus, getComplaintDetails } from '../tools/getComplaintStatus.js';

const DEMO_RESPONSES = {
  status: (ticketId) =>
    `Your complaint ${ticketId} has been successfully filed in our demo system. The current status is "Submitted (Demo)". This is a simulated record and has not been sent to a real municipal authority.`,
  notFound: (ticketId) =>
    `I couldn't find a complaint with tracking ID "${ticketId}". Please double-check the ID — it should start with CS-DEMO-.`,
  howToUse: `Welcome to CivicSaathi AI! Here's how it works:\n1. Upload a photo of a civic issue (pothole, garbage, waterlogging, or broken streetlight)\n2. Enter your area/locality\n3. The AI will analyze the image and classify the issue\n4. Review and confirm the analysis\n5. A complaint is filed and you get a tracking ID\n6. Use the tracking ID to check your complaint status anytime\n\nNote: This is a demo system — complaints are not sent to a real municipality.`,
  general: `I'm CivicSaathi AI, your civic complaint assistant. I can help you:\n- File complaints about civic issues (potholes, garbage, streetlights, waterlogging)\n- Track existing complaints using your tracking ID\n- Explain how the system works\n\nWhat would you like to do?`,
};

function extractTicketId(text) {
  const match = text.match(/CS-DEMO-[A-Z0-9]{10,20}|CS-DEMO-SAMPLE\d+/i);
  return match ? match[0].toUpperCase() : null;
}

function detectIntent(question) {
  const q = question.toLowerCase();
  if (q.includes('status') || q.includes('track') || q.includes('where is') || q.includes('update')) return 'status';
  if (q.includes('how') && (q.includes('use') || q.includes('work') || q.includes('file'))) return 'howToUse';
  if (q.includes('cs-demo') || q.includes('ticket') || q.includes('complaint')) return 'complaint';
  return 'general';
}

export async function answerQuestion(question, context = {}) {
  if (!question || typeof question !== 'string') {
    return { success: false, code: 'INVALID_QUESTION', message: 'A question is required.' };
  }

  const toolEvents = [];
  const ticketId = extractTicketId(question) || context.ticketId || null;
  const intent = detectIntent(question);

  // If tracking ID present, fetch real data first
  if (ticketId) {
    toolEvents.push({ tool: 'getComplaintStatus', input: ticketId, startedAt: new Date().toISOString() });
    const statusResult = await getComplaintStatus(ticketId);
    toolEvents[toolEvents.length - 1].result = statusResult;
    toolEvents[toolEvents.length - 1].completedAt = new Date().toISOString();

    if (!statusResult.success) {
      return {
        success: true,
        answer: DEMO_RESPONSES.notFound(ticketId),
        toolEvents,
        ticketData: null,
      };
    }

    // Fetch full details
    toolEvents.push({ tool: 'getComplaintDetails', input: ticketId, startedAt: new Date().toISOString() });
    const detailsResult = await getComplaintDetails(ticketId);
    toolEvents[toolEvents.length - 1].result = detailsResult;
    toolEvents[toolEvents.length - 1].completedAt = new Date().toISOString();

    const complaint = detailsResult.success ? detailsResult.complaint : null;

    if (isDemoMode()) {
      const answer = complaint
        ? buildStatusAnswer(complaint)
        : DEMO_RESPONSES.notFound(ticketId);
      return { success: true, answer, toolEvents, ticketData: complaint };
    }

    // Live Gemini response
    try {
      const answer = await generateAIAnswer(question, complaint, toolEvents);
      return { success: true, answer, toolEvents, ticketData: complaint };
    } catch {
      const answer = buildStatusAnswer(complaint);
      return { success: true, answer, toolEvents, ticketData: complaint };
    }
  }

  // No ticket ID — general question
  if (isDemoMode()) {
    let answer;
    if (intent === 'howToUse') answer = DEMO_RESPONSES.howToUse;
    else answer = DEMO_RESPONSES.general;
    return { success: true, answer, toolEvents, ticketData: null };
  }

  // Live AI general answer
  try {
    const answer = await generateAIAnswer(question, null, toolEvents);
    return { success: true, answer, toolEvents, ticketData: null };
  } catch (err) {
    return {
      success: true,
      answer: DEMO_RESPONSES.general,
      toolEvents,
      ticketData: null,
      warning: 'AI service unavailable. Showing default response.',
    };
  }
}

function buildStatusAnswer(complaint) {
  if (!complaint) return 'Could not retrieve complaint details.';
  return `Your complaint **${complaint.ticketId}** has been recorded.\n\n` +
    `- **Issue:** ${complaint.issueType.replace(/_/g, ' ')}\n` +
    `- **Area:** ${complaint.area}\n` +
    `- **Ward:** ${complaint.wardName}\n` +
    `- **Department:** ${complaint.departmentName}\n` +
    `- **Status:** ${complaint.status}\n` +
    `- **Filed:** ${new Date(complaint.createdAt).toLocaleString()}\n\n` +
    `⚠️ This is a demo complaint. It has not been submitted to a real municipality.`;
}

async function generateAIAnswer(question, complaintContext, toolEvents) {
  const client = new GoogleGenAI({ apiKey: config.geminiApiKey });

  const systemContext = `You are CivicSaathi AI, a civic complaint assistant for an Indian municipal system.
You help citizens report and track civic issues like potholes, garbage, broken streetlights, and waterlogging.
This is a DEMO system — complaints are NOT sent to a real municipality.

Rules:
- Only use data provided to you. Never invent ticket IDs, status changes, or municipal policies.
- Always clarify this is a demo system when discussing complaint status.
- Be helpful, clear, and concise.
- Respond in plain text or simple markdown.`;

  const contextStr = complaintContext
    ? `\n\nComplaint Data:\n${JSON.stringify(complaintContext, null, 2)}`
    : '';

  toolEvents.push({ tool: 'generateAIAnswer', input: question, startedAt: new Date().toISOString() });

  const response = await client.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: [{ parts: [{ text: `${systemContext}${contextStr}\n\nUser question: ${question}` }] }],
    config: { temperature: 0.3, maxOutputTokens: 500 },
  });

  toolEvents[toolEvents.length - 1].completedAt = new Date().toISOString();
  return response.text();
}
