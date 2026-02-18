/**
 * Profile Service
 *
 * API methods for profile completeness management.
 * Provides endpoints for retrieving and recalculating profile scores.
 */

import axios from '@/lib/axios';
import type {
  ProfileCompleteness,
  PublicProfileCompleteness,
  Suggestion,
  MissingItem,
  ProfileSection
} from '@/types/profile';
import type { ApiResponse } from '@/types';

/**
 * Get user's profile completeness score
 *
 * @returns Promise with profile completeness data
 */
export const getProfileCompleteness = async (): Promise<ProfileCompleteness> => {
  const response = await axios.get<ApiResponse<ProfileCompleteness>>('/profile/completeness');
  return response.data.data as ProfileCompleteness;
};

/**
 * Recalculate profile completeness score
 *
 * @returns Promise with updated profile completeness data
 */
export const recalculateCompleteness = async (): Promise<ProfileCompleteness> => {
  const response = await axios.post<ApiResponse<ProfileCompleteness>>('/profile/completeness/recalculate');
  return response.data.data as ProfileCompleteness;
};

/**
 * Get suggestions for profile improvement
 *
 * @param limit - Maximum number of suggestions to return
 * @returns Promise with list of suggestions
 */
export const getSuggestions = async (limit: number = 10): Promise<Suggestion[]> => {
  const response = await axios.get<ApiResponse<Suggestion[]>>('/profile/completeness/suggestions', {
    params: { limit }
  });
  return response.data.data as Suggestion[];
};

/**
 * Get missing items checklist
 *
 * @returns Promise with list of missing items
 */
export const getMissingItems = async (): Promise<MissingItem[]> => {
  const response = await axios.get<ApiResponse<MissingItem[]>>('/profile/completeness/missing');
  return response.data.data as MissingItem[];
};

/**
 * Get completeness by section
 *
 * @param section - Section name
 * @returns Promise with section completeness data
 */
export const getSectionCompleteness = async (
  section: ProfileSection
): Promise<{ section: ProfileSection; completed: boolean; weight: number; score: number; items: any[] }> => {
  const response = await axios.get<ApiResponse<any>>(`/profile/completeness/sections/${section}`);
  return response.data.data;
};

/**
 * Get public profile completeness (limited data for badges)
 *
 * @param userId - User ID to get completeness for
 * @returns Promise with public completeness data
 */
export const getPublicCompleteness = async (userId: string): Promise<PublicProfileCompleteness> => {
  const response = await axios.get<ApiResponse<PublicProfileCompleteness>>(
    `/profile/completeness/public/${userId}`
  );
  return response.data.data as PublicProfileCompleteness;
};

/**
 * Profile completeness API object
 */
const profileService = {
  getProfileCompleteness,
  recalculateCompleteness,
  getSuggestions,
  getMissingItems,
  getSectionCompleteness,
  getPublicCompleteness
};

export default profileService;
