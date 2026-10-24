// src/tools/analyzeIssue.js
// Tool 1: analyzeIssueImage — uses Gemini or demo mode
import { GoogleGenAI } from '@google/genai';
import { config, isDemoMode } from '../config/env.js';

const SUPPORTED_TYPES = ['pothole', 'garbage', 'broken_streetlight', 'waterlogging', 'other'];

const DEMO_ANALYSES = [
  {
    issueType: 'pothole',
    description: 'A large pothole approximately 30cm in diameter is visible on the road surface. The road shows significant cracking around the edges.',
    severity: 'high',
    confidence: 0.91,
    recommendedAction: 'Immediate road repair and resurfacing required. Area should be cordoned off.',
    visualEvidence: ['Road surface damage', 'Exposed sub-base material', 'Crack patterns around the depression'],
    warnings: null,
    isDemo: true,
  },
  {
    issueType: 'garbage',
    description: 'Overflowing garbage bins and scattered waste visible near a residential area. Multiple waste bags piled on the sidewalk.',
    severity: 'medium',
    confidence: 0.89,
    recommendedAction: 'Immediate garbage collection required. Consider increased pickup frequency for this area.',
    visualEvidence: ['Overflowing bins', 'Scattered waste bags', 'Litter on footpath'],
    warnings: null,
    isDemo: true,
  },
  {
    issueType: 'waterlogging',
    description: 'Standing water covering a significant portion of the road surface following recent rainfall. Depth appears to be 10–15cm based on visible markers.',
    severity: 'high',
    confidence: 0.87,
    recommendedAction: 'Drainage inspection and clearance required. Traffic diversion advised.',
    visualEvidence: ['Standing water on road', 'Submerged road markings', 'Vehicles navigating through water'],
    warnings: 'Severity assessment is approximate. Please exercise caution.',
    isDemo: true,
  },
  {
    issueType: 'broken_streetlight',
    description: 'Streetlight pole visible with damaged fixture. The light appears non-functional based on visible damage to the housing.',
    severity: 'medium',
    confidence: 0.84,
    recommendedAction: 'Electrical inspection and fixture replacement needed.',
    visualEvidence: ['Damaged light fixture', 'Broken housing', 'Non-functional lamp'],
    warnings: 'Functional status cannot be confirmed from a still image.',
    isDemo: true,
  },
];

let demoIndex = 0;

export async function analyzeIssueImage(imageBuffer, mimeType) {
  if (isDemoMode()) {
    // Rotate through demo analyses
    const result = DEMO_ANALYSES[demoIndex % DEMO_ANALYSES.length];
    demoIndex++;
    return { ...result };
  }

  // Live Gemini analysis
  const client = new GoogleGenAI({ apiKey: config.geminiApiKey });

  const prompt = `You are an AI assistant for a civic complaint system. Analyze this image and identify any civic infrastructure issues.

Respond ONLY with a valid JSON object matching this exact schema:
{
  "issueType": "one of: pothole, garbage, broken_streetlight, waterlogging, other",
  "description": "brief factual description of visible problem (max 200 chars)",
  "severity": "one of: low, medium, high",
  "confidence": "number between 0.0 and 1.0",
  "recommendedAction": "brief recommended action (max 150 chars)",
  "visualEvidence": ["array", "of", "specific", "visible", "elements"],
  "warnings": "any uncertainty or limitations, or null"
}

Rules:
- issueType must be exactly one of: pothole, garbage, broken_streetlight, waterlogging, other
- severity must be exactly: low, medium, or high
- confidence must be a decimal number 0.0 to 1.0
- If this image is NOT related to a civic infrastructure problem, use issueType "other" and explain in description
- Only describe what is visibly present in the image. Do not invent details.
- Keep description factual and objective`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: imageBuffer.toString('base64'),
              },
            },
          ],
        },
      ],
      config: {
        temperature: 0.1,
      },
    });

    const text = response.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Try to extract JSON from response text
      const match = text.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
      else throw new Error('No JSON found in AI response');
    }

    // Validate and sanitize
    return validateAndSanitizeAnalysis(parsed);
  } catch (err) {
    console.error('[analyzeIssueImage] Gemini error:', err.message);
    if (err.message.includes('API_KEY') || err.message.includes('401')) {
      throw { code: 'INVALID_API_KEY', message: 'Invalid or missing Gemini API key.', status: 503 };
    }
    if (err.message.includes('timeout') || err.message.includes('DEADLINE')) {
      throw { code: 'AI_TIMEOUT', message: 'AI service timed out. Please try again.', status: 503 };
    }
    throw { code: 'AI_ERROR', message: `AI analysis failed: ${err.message}`, status: 503 };
  }
}

function validateAndSanitizeAnalysis(raw) {
  if (!raw || typeof raw !== 'object') {
    throw { code: 'AI_INVALID_RESPONSE', message: 'AI returned an unexpected response format.', status: 503 };
  }

  const issueType = SUPPORTED_TYPES.includes(raw.issueType) ? raw.issueType : 'other';
  const severity = ['low', 'medium', 'high'].includes(raw.severity) ? raw.severity : 'medium';
  const confidence = typeof raw.confidence === 'number'
    ? Math.max(0, Math.min(1, raw.confidence))
    : 0.5;

  return {
    issueType,
    description: typeof raw.description === 'string' ? raw.description.slice(0, 250) : 'Civic issue detected.',
    severity,
    confidence,
    recommendedAction: typeof raw.recommendedAction === 'string'
      ? raw.recommendedAction.slice(0, 200)
      : 'Report to appropriate municipal department.',
    visualEvidence: Array.isArray(raw.visualEvidence) ? raw.visualEvidence.slice(0, 6) : [],
    warnings: raw.warnings || null,
    isDemo: false,
  };
}
