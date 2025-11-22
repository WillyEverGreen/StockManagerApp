// AI Prediction Engine for Stock-Out Prediction

/**
 * Calculate predicted days until stock runs out
 * @param {number} currentStock - Current stock quantity
 * @param {Array<number>} usageHistory - Array of recent stock-out quantities
 * @returns {Object} - { predictedDays, averageDailyUsage, hasData }
 */
export const calculateStockPrediction = (currentStock, usageHistory) => {
  // No history available
  if (!usageHistory || usageHistory.length === 0) {
    return {
      predictedDays: null,
      averageDailyUsage: 0,
      hasData: false,
      message: "No prediction available",
    };
  }

  // Calculate average daily usage from history
  const totalUsage = usageHistory.reduce((sum, qty) => sum + qty, 0);
  const averageDailyUsage = totalUsage / usageHistory.length;

  // Avoid division by zero
  if (averageDailyUsage === 0) {
    return {
      predictedDays: null,
      averageDailyUsage: 0,
      hasData: true,
      message: "No recent usage",
    };
  }

  // Calculate predicted days
  const predictedDays = Math.floor(currentStock / averageDailyUsage);

  return {
    predictedDays,
    averageDailyUsage: averageDailyUsage.toFixed(2),
    hasData: true,
    message:
      predictedDays > 0
        ? `Runs out in ~${predictedDays} days`
        : "Stock critically low",
  };
};

/**
 * Get prediction status for UI display
 * @param {number} predictedDays
 * @returns {Object} - { status, color, icon }
 */
export const getPredictionStatus = (predictedDays) => {
  if (predictedDays === null) {
    return { status: "unknown", color: "#94a3b8", label: "No Data" };
  }

  if (predictedDays <= 3) {
    return { status: "critical", color: "#ef4444", label: "Critical" };
  }

  if (predictedDays <= 7) {
    return { status: "warning", color: "#f59e0b", label: "Warning" };
  }

  if (predictedDays <= 14) {
    return { status: "caution", color: "#eab308", label: "Caution" };
  }

  return { status: "good", color: "#10b981", label: "Good" };
};

/**
 * Check if product is low stock
 * @param {number} stock
 * @param {number} minStock
 * @returns {boolean}
 */
export const isLowStock = (stock, minStock) => {
  return stock <= minStock;
};
