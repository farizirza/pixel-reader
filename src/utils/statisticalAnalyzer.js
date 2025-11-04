/**
 * Statistical Analyzer Utility
 * Provides statistical analysis functions:
 * - Pearson Correlation
 * - Skewness
 * - Kurtosis
 * - Entropy
 * - Chi-Square
 */
export class StatisticalAnalyzer {
  constructor(imageData) {
    this.imageData = imageData;
    this.data = imageData.data;
    this.width = imageData.width;
    this.height = imageData.height;
  }

  /**
   * Extract pixel values from image (RGB channels separately)
   * @returns {Object} Object containing r, g, b pixel arrays
   */
  extractPixelValues() {
    const r = [];
    const g = [];
    const b = [];

    for (let i = 0; i < this.data.length; i += 4) {
      r.push(this.data[i]);
      g.push(this.data[i + 1]);
      b.push(this.data[i + 2]);
    }

    return { r, g, b };
  }

  /**
   * Calculate mean of array
   * @param {Array} arr - Input array
   * @returns {number} Mean value
   */
  calculateMean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  /**
   * Calculate standard deviation of array
   * @param {Array} arr - Input array
   * @param {number} mean - Mean value (optional)
   * @returns {number} Standard deviation
   */
  calculateStdDev(arr, mean = null) {
    if (!mean) mean = this.calculateMean(arr);
    const squaredDifferences = arr.map((x) => Math.pow(x - mean, 2));
    const variance = squaredDifferences.reduce((a, b) => a + b, 0) / arr.length;
    return Math.sqrt(variance);
  }

  /**
   * Calculate Pearson Correlation between two image channels
   * Compares channel1 with channel2 (e.g., R vs G, R vs B, G vs B)
   * @param {Array} channel1 - First channel values
   * @param {Array} channel2 - Second channel values
   * @returns {number} Pearson correlation coefficient (-1 to 1)
   */
  calculatePearsonCorrelation(channel1, channel2) {
    if (channel1.length !== channel2.length || channel1.length === 0) {
      return 0;
    }

    const mean1 = this.calculateMean(channel1);
    const mean2 = this.calculateMean(channel2);

    let numerator = 0;
    let sum1Sq = 0;
    let sum2Sq = 0;

    for (let i = 0; i < channel1.length; i++) {
      const diff1 = channel1[i] - mean1;
      const diff2 = channel2[i] - mean2;
      numerator += diff1 * diff2;
      sum1Sq += diff1 * diff1;
      sum2Sq += diff2 * diff2;
    }

    const denominator = Math.sqrt(sum1Sq * sum2Sq);

    if (denominator === 0) return 0;

    return numerator / denominator;
  }

  /**
   * Calculate Pearson Correlations for all channel pairs
   * @returns {Object} Object with RG, RB, GB correlations
   */
  calculateAllPearsonCorrelations() {
    const { r, g, b } = this.extractPixelValues();

    return {
      RG: this.calculatePearsonCorrelation(r, g),
      RB: this.calculatePearsonCorrelation(r, b),
      GB: this.calculatePearsonCorrelation(g, b),
    };
  }

  /**
   * Calculate Skewness of array (asymmetry of distribution)
   * Positive skew = right tail, Negative skew = left tail
   * @param {Array} arr - Input array
   * @returns {number} Skewness value
   */
  calculateSkewness(arr) {
    if (arr.length < 3) return 0;

    const mean = this.calculateMean(arr);
    const stdDev = this.calculateStdDev(arr, mean);

    if (stdDev === 0) return 0;

    const n = arr.length;
    let sum = 0;

    for (let i = 0; i < n; i++) {
      sum += Math.pow((arr[i] - mean) / stdDev, 3);
    }

    return sum / n;
  }

  /**
   * Calculate Skewness for all channels
   * @returns {Object} Object with R, G, B skewness values
   */
  calculateAllSkewness() {
    const { r, g, b } = this.extractPixelValues();

    return {
      R: this.calculateSkewness(r),
      G: this.calculateSkewness(g),
      B: this.calculateSkewness(b),
    };
  }

  /**
   * Calculate Kurtosis of array (peakedness of distribution)
   * High kurtosis = sharp peak with fat tails
   * Low kurtosis = flat distribution
   * @param {Array} arr - Input array
   * @returns {number} Excess kurtosis value (0 = normal distribution)
   */
  calculateKurtosis(arr) {
    if (arr.length < 4) return 0;

    const mean = this.calculateMean(arr);
    const stdDev = this.calculateStdDev(arr, mean);

    if (stdDev === 0) return 0;

    const n = arr.length;
    let sum = 0;

    for (let i = 0; i < n; i++) {
      sum += Math.pow((arr[i] - mean) / stdDev, 4);
    }

    // Return excess kurtosis (subtract 3 for Fisher definition)
    return sum / n - 3;
  }

  /**
   * Calculate Kurtosis for all channels
   * @returns {Object} Object with R, G, B kurtosis values
   */
  calculateAllKurtosis() {
    const { r, g, b } = this.extractPixelValues();

    return {
      R: this.calculateKurtosis(r),
      G: this.calculateKurtosis(g),
      B: this.calculateKurtosis(b),
    };
  }

  /**
   * Calculate Entropy (measure of randomness/disorder)
   * Higher entropy = more randomness, Lower entropy = more ordered
   * Using Shannon entropy formula
   * @param {Array} arr - Input array
   * @returns {number} Entropy value in bits (0 to 8 for 8-bit values)
   */
  calculateEntropy(arr) {
    // Create histogram (256 bins for 8-bit values)
    const histogram = new Array(256).fill(0);

    for (let i = 0; i < arr.length; i++) {
      histogram[arr[i]]++;
    }

    // Calculate probability distribution
    let entropy = 0;
    const n = arr.length;

    for (let i = 0; i < histogram.length; i++) {
      if (histogram[i] > 0) {
        const p = histogram[i] / n;
        entropy -= p * Math.log2(p);
      }
    }

    return entropy;
  }

  /**
   * Calculate Entropy for all channels
   * @returns {Object} Object with R, G, B entropy values
   */
  calculateAllEntropy() {
    const { r, g, b } = this.extractPixelValues();

    return {
      R: this.calculateEntropy(r),
      G: this.calculateEntropy(g),
      B: this.calculateEntropy(b),
    };
  }

  /**
   * Calculate Chi-Square test statistic
   * Measures how well observed distribution matches expected (uniform) distribution
   * @param {Array} arr - Input array
   * @returns {number} Chi-square statistic value
   */
  calculateChiSquare(arr) {
    // Create histogram
    const histogram = new Array(256).fill(0);

    for (let i = 0; i < arr.length; i++) {
      histogram[arr[i]]++;
    }

    // Expected frequency (uniform distribution)
    const expectedFrequency = arr.length / 256;

    // Calculate chi-square
    let chiSquare = 0;

    for (let i = 0; i < histogram.length; i++) {
      if (expectedFrequency > 0) {
        const observed = histogram[i];
        const expected = expectedFrequency;
        const diff = observed - expected;
        chiSquare += (diff * diff) / expected;
      }
    }

    return chiSquare;
  }

  /**
   * Calculate Chi-Square for all channels
   * @returns {Object} Object with R, G, B chi-square values
   */
  calculateAllChiSquare() {
    const { r, g, b } = this.extractPixelValues();

    return {
      R: this.calculateChiSquare(r),
      G: this.calculateChiSquare(g),
      B: this.calculateChiSquare(b),
    };
  }

  /**
   * Calculate all statistical measures
   * @returns {Object} Object containing all statistics
   */
  calculateAllStatistics() {
    return {
      pearsonCorrelation: this.calculateAllPearsonCorrelations(),
      skewness: this.calculateAllSkewness(),
      kurtosis: this.calculateAllKurtosis(),
      entropy: this.calculateAllEntropy(),
      chiSquare: this.calculateAllChiSquare(),
    };
  }

  /**
   * Compare two images and calculate matching metrics
   * @param {ImageData} otherImageData - Other image to compare
   * @returns {Object} Matching metrics between images
   */
  compareWithImage(otherImageData) {
    if (
      otherImageData.width !== this.width ||
      otherImageData.height !== this.height
    ) {
      return {
        error: "Ukuran gambar harus sama untuk perbandingan!",
      };
    }

    const otherAnalyzer = new StatisticalAnalyzer(otherImageData);
    const stats1 = this.calculateAllStatistics();
    const stats2 = otherAnalyzer.calculateAllStatistics();

    // Calculate differences
    return {
      pearsonCorrelationDiff: {
        RG: Math.abs(
          stats1.pearsonCorrelation.RG - stats2.pearsonCorrelation.RG
        ),
        RB: Math.abs(
          stats1.pearsonCorrelation.RB - stats2.pearsonCorrelation.RB
        ),
        GB: Math.abs(
          stats1.pearsonCorrelation.GB - stats2.pearsonCorrelation.GB
        ),
      },
      skewnessDiff: {
        R: Math.abs(stats1.skewness.R - stats2.skewness.R),
        G: Math.abs(stats1.skewness.G - stats2.skewness.G),
        B: Math.abs(stats1.skewness.B - stats2.skewness.B),
      },
      kurtosisDiff: {
        R: Math.abs(stats1.kurtosis.R - stats2.kurtosis.R),
        G: Math.abs(stats1.kurtosis.G - stats2.kurtosis.G),
        B: Math.abs(stats1.kurtosis.B - stats2.kurtosis.B),
      },
      entropyDiff: {
        R: Math.abs(stats1.entropy.R - stats2.entropy.R),
        G: Math.abs(stats1.entropy.G - stats2.entropy.G),
        B: Math.abs(stats1.entropy.B - stats2.entropy.B),
      },
      chiSquareDiff: {
        R: Math.abs(stats1.chiSquare.R - stats2.chiSquare.R),
        G: Math.abs(stats1.chiSquare.G - stats2.chiSquare.G),
        B: Math.abs(stats1.chiSquare.B - stats2.chiSquare.B),
      },
      image1Stats: stats1,
      image2Stats: stats2,
    };
  }
}
