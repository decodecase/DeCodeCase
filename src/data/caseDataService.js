import { deadAirCaseData } from './deadAirData.js';

// In the future, you can import other case data files here, e.g.:
// import { theFinalNoteData } from './theFinalNoteData.js';
// import { fadingMindsData } from './fadingMindsData.js';

const allCaseData = {
  deadAir: deadAirCaseData,
  // theFinalNote: theFinalNoteData, // Add other cases here
  // fadingMinds: fadingMindsData,
};

export const getCaseDataById = (caseId) => {
  if (allCaseData[caseId]) {
    return allCaseData[caseId];
  }
  console.warn(`Case data not found in caseDataService for caseId: ${caseId}`);
  return null; // Or throw an error, or return a default placeholder case structure
}; 