/**
 * Feature Flags Configuration
 * 
 * Use this file to enable/disable features at the UI level.
 * Backend code remains intact - only UI visibility is controlled.
 * 
 * To re-enable a feature, simply set its flag to `true`.
 */

export const featureFlags = {
  /**
   * Offline Ticket Generator
   * Generates QR code tickets that work without internet connection
   * Backend: Fully implemented and ready
   */
  offlineTickets: true,

  /**
   * Indoor Station Navigation
   * Indoor GPS navigation for platforms, exits, and facilities
   * Backend: Fully implemented and ready
   */
  indoorNavigation: true,

  /**
   * Post-Station Transport
   * Find onward transport options from destination station
   * Backend: Fully implemented and ready
   */
  postStationTransport: true,

  /**
   * Lost and Found
   * Report and search for lost/found items
   * Backend: Fully implemented and ready
   */
  lostAndFound: true,

  /**
   * Food Stalls
   * Order food from verified stalls at metro stations
   * Backend: Fully implemented and ready
   */
  foodStalls: true,

  /**
   * Live Arrivals
   * Real-time metro arrival notifications
   * Backend: Fully implemented and ready
   */
  liveArrivals: true,
} as const;

export type FeatureFlag = keyof typeof featureFlags;

/**
 * Check if a feature is enabled
 */
export const isFeatureEnabled = (feature: FeatureFlag): boolean => {
  return featureFlags[feature];
};
