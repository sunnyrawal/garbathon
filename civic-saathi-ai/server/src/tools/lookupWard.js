// src/tools/lookupWard.js
// Tool 2: lookupWard — deterministic ward lookup from mock directory
import { readJsonFile, directoryFilePath } from '../utils/storage.js';

function normalize(str) {
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

export async function lookupWard(areaName) {
  if (!areaName || typeof areaName !== 'string' || areaName.trim() === '') {
    return {
      success: false,
      code: 'INVALID_AREA',
      message: 'Area name is required.',
    };
  }

  const directory = await readJsonFile(directoryFilePath());
  if (!directory || !Array.isArray(directory.wards)) {
    return {
      success: false,
      code: 'DIRECTORY_UNAVAILABLE',
      message: 'Municipal directory is currently unavailable.',
    };
  }

  const normalizedInput = normalize(areaName);

  for (const ward of directory.wards) {
    for (const area of ward.areas) {
      if (normalize(area) === normalizedInput) {
        return {
          success: true,
          wardId: ward.id,
          wardName: ward.name,
          zone: ward.zone,
          matchedLocality: area,
          matchMethod: 'exact',
          isExactMatch: true,
        };
      }
    }
  }

  // Partial match as fallback (prefix match only)
  for (const ward of directory.wards) {
    for (const area of ward.areas) {
      if (normalize(area).startsWith(normalizedInput) || normalizedInput.startsWith(normalize(area))) {
        return {
          success: true,
          wardId: ward.id,
          wardName: ward.name,
          zone: ward.zone,
          matchedLocality: area,
          matchMethod: 'partial',
          isExactMatch: false,
        };
      }
    }
  }

  // Return list of supported areas
  const supported = directory.wards.map((w) => w.areas[0]);
  return {
    success: false,
    code: 'AREA_NOT_FOUND',
    message: `"${areaName}" is not in our demo directory. Please select from a supported area.`,
    supportedAreas: supported,
  };
}

export async function getSupportedAreas() {
  const directory = await readJsonFile(directoryFilePath());
  if (!directory || !Array.isArray(directory.wards)) return [];
  return directory.wards.flatMap((w) => w.areas.slice(0, 2));
}
