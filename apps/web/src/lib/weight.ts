/**
 * Utility functions for weight conversion and formatting
 * All weights are stored in pounds (lbs) in the database
 */

/**
 * Convert pounds to kilograms
 */
export function lbsToKg(lbs: number): number {
  return Math.round(lbs * 0.453592 * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert kilograms to pounds
 */
export function kgToLbs(kg: number): number {
  return Math.round((kg / 0.453592) * 10) / 10; // Round to 1 decimal place
}

/**
 * Format weight display as "lbs (kg)"
 * Since we store in lbs, this is the primary display format
 */
export function formatWeight(lbs: number): string {
  const kg = lbsToKg(lbs);
  return `${lbs}lbs (${kg}kg)`;
}

/**
 * Format weight for compact display (just lbs)
 */
export function formatWeightCompact(lbs: number): string {
  return `${lbs}lbs`;
}

/**
 * Parse weight input - accepts both lbs and kg formats
 */
export function parseWeightInput(input: string): number {
  const cleanInput = input.trim().toLowerCase();

  if (cleanInput.includes('kg')) {
    const kg = parseFloat(cleanInput.replace(/[^0-9.]/g, ''));
    return kgToLbs(kg); // Convert kg to lbs for storage
  } else {
    // Default to lbs or plain number
    return parseFloat(cleanInput.replace(/[^0-9.]/g, ''));
  }
}
