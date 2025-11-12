/**
 * HSV Analyzer Utility
 * Provides HSV color space operations and green detection
 */
export class HSVAnalyzer {
  /**
   * Convert RGB to HSV
   * @param {number} r - Red component (0-255)
   * @param {number} g - Green component (0-255)
   * @param {number} b - Blue component (0-255)
   * @returns {object} HSV object {h: 0-360, s: 0-100, v: 0-100}
   */
  static rgbToHsv(r, g, b) {
    r = r / 255;
    g = g / 255;
    b = b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    let s = 0;
    let v = max * 100;

    if (max !== 0) {
      s = (delta / max) * 100;
    }

    if (delta !== 0) {
      if (max === r) {
        h = 60 * (((g - b) / delta) % 6);
      } else if (max === g) {
        h = 60 * ((b - r) / delta + 2);
      } else {
        h = 60 * ((r - g) / delta + 4);
      }
    }

    if (h < 0) {
      h += 360;
    }

    return { h, s, v };
  }

  /**
   * Convert HSV to RGB
   * @param {number} h - Hue (0-360)
   * @param {number} s - Saturation (0-100)
   * @param {number} v - Value/Brightness (0-100)
   * @returns {object} RGB object {r: 0-255, g: 0-255, b: 0-255}
   */
  static hsvToRgb(h, s, v) {
    s = s / 100;
    v = v / 100;

    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    let r = 0,
      g = 0,
      b = 0;

    if (h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (h < 300) {
      r = x;
      g = 0;
      b = c;
    } else {
      r = c;
      g = 0;
      b = x;
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return { r, g, b };
  }

  /**
   * Detect green pixels based on HSV
   * Green hue range: 90-180 degrees
   * Saturation: > 20%
   * Value: > 10%
   * @param {ImageData} imageData - Image data to analyze
   * @param {object} options - Detection options
   * @returns {ImageData} Binary image data where white = green, black = not green
   */
  static detectGreen(imageData, options = {}) {
    const {
      hueMin = 90,
      hueMax = 180,
      saturationMin = 20,
      valueMin = 10,
      colorOutput = false, // if true, output colored green; if false, output binary
    } = options;

    const data = imageData.data;
    const resultData = new ImageData(imageData.width, imageData.height);
    const result = resultData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      const hsv = this.rgbToHsv(r, g, b);

      const isGreen =
        hsv.h >= hueMin &&
        hsv.h <= hueMax &&
        hsv.s >= saturationMin &&
        hsv.v >= valueMin;

      if (isGreen) {
        if (colorOutput) {
          // Keep original green color
          result[i] = r;
          result[i + 1] = g;
          result[i + 2] = b;
          result[i + 3] = a;
        } else {
          // White for detected green
          result[i] = 255;
          result[i + 1] = 255;
          result[i + 2] = 255;
          result[i + 3] = 255;
        }
      } else {
        if (colorOutput) {
          // Black for non-green
          result[i] = 0;
          result[i + 1] = 0;
          result[i + 2] = 0;
          result[i + 3] = 255;
        } else {
          // Black for non-green
          result[i] = 0;
          result[i + 1] = 0;
          result[i + 2] = 0;
          result[i + 3] = 255;
        }
      }
    }

    return resultData;
  }

  /**
   * Create HSV hue wheel visualization
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   * @returns {ImageData} Image data of HSV color wheel
   */
  static createHsvWheel(width, height) {
    const imageData = new ImageData(width, height);
    const data = imageData.data;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const idx = (y * width + x) * 4;

        if (distance <= radius) {
          const angle = Math.atan2(dy, dx);
          let hue = ((angle * 180) / Math.PI + 180) % 360;

          const saturation = (distance / radius) * 100;
          const value = 100;

          const rgb = this.hsvToRgb(hue, saturation, value);

          data[idx] = rgb.r;
          data[idx + 1] = rgb.g;
          data[idx + 2] = rgb.b;
          data[idx + 3] = 255;
        } else {
          // Outside circle - white
          data[idx] = 255;
          data[idx + 1] = 255;
          data[idx + 2] = 255;
          data[idx + 3] = 255;
        }
      }
    }

    return imageData;
  }

  /**
   * Analyze green color statistics
   * @param {ImageData} imageData - Original image data
   * @param {object} options - Detection options
   * @returns {object} Statistics object with green pixels info
   */
  static analyzeGreenStatistics(imageData, options = {}) {
    const {
      hueMin = 90,
      hueMax = 180,
      saturationMin = 20,
      valueMin = 10,
    } = options;

    const data = imageData.data;
    const stats = {
      totalPixels: imageData.width * imageData.height,
      greenPixels: 0,
      greenPercentage: 0,
      greenPixelsList: [],
      hueValues: [],
      saturationValues: [],
      valueValues: [],
      avgHue: 0,
      avgSaturation: 0,
      avgValue: 0,
    };

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const hsv = this.rgbToHsv(r, g, b);

      const isGreen =
        hsv.h >= hueMin &&
        hsv.h <= hueMax &&
        hsv.s >= saturationMin &&
        hsv.v >= valueMin;

      if (isGreen) {
        stats.greenPixels++;
        stats.greenPixelsList.push({
          r,
          g,
          b,
          h: hsv.h,
          s: hsv.s,
          v: hsv.v,
        });
        stats.hueValues.push(hsv.h);
        stats.saturationValues.push(hsv.s);
        stats.valueValues.push(hsv.v);
      }
    }

    stats.greenPercentage = (
      (stats.greenPixels / stats.totalPixels) *
      100
    ).toFixed(2);

    if (stats.greenPixels > 0) {
      stats.avgHue = (
        stats.hueValues.reduce((a, b) => a + b, 0) / stats.greenPixels
      ).toFixed(2);
      stats.avgSaturation = (
        stats.saturationValues.reduce((a, b) => a + b, 0) / stats.greenPixels
      ).toFixed(2);
      stats.avgValue = (
        stats.valueValues.reduce((a, b) => a + b, 0) / stats.greenPixels
      ).toFixed(2);
    }

    return stats;
  }

  /**
   * Create a donut chart data for NDVI-like visualization
   * Shows distribution of green vs non-green pixels
   * @param {object} statistics - Statistics object from analyzeGreenStatistics
   * @returns {object} Chart data object
   */
  static createGreenDistributionData(statistics) {
    const greenPercentage = parseFloat(statistics.greenPercentage);
    const nonGreenPercentage = 100 - greenPercentage;

    return {
      labels: ["🌿 Green Pixels", "🏜️ Non-Green Pixels"],
      datasets: [
        {
          label: "Pixel Distribution",
          data: [greenPercentage, nonGreenPercentage],
          backgroundColor: [
            "rgba(34, 139, 34, 0.8)", // Forest Green
            "rgba(169, 169, 169, 0.8)", // Gray
          ],
          borderColor: ["rgba(34, 139, 34, 1)", "rgba(169, 169, 169, 1)"],
          borderWidth: 2,
        },
      ],
    };
  }
}
