/**
 * ImageProcessor Utility
 * Provides image processing operations
 */
export class ImageProcessor {
  constructor(sourceCanvas) {
    this.sourceCanvas = sourceCanvas;
    this.sourceCtx = sourceCanvas.getContext("2d", {
      willReadFrequently: true,
    });
  }

  /**
   * Get image data from source canvas
   * @returns {ImageData} Image data object
   */
  getImageData() {
    return this.sourceCtx.getImageData(
      0,
      0,
      this.sourceCanvas.width,
      this.sourceCanvas.height
    );
  }

  /**
   * Draw image data to target canvas
   * @param {ImageData} imageData - Image data to draw
   * @param {HTMLCanvasElement} targetCanvas - Target canvas element
   */
  drawToCanvas(imageData, targetCanvas) {
    targetCanvas.width = imageData.width;
    targetCanvas.height = imageData.height;
    const ctx = targetCanvas.getContext("2d");
    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Convert image to grayscale using luminance formula
   * @returns {ImageData} Grayscale image data
   */
  toGrayscale() {
    const imageData = this.getImageData();
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(
        0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      );
      data[i] = gray; // R
      data[i + 1] = gray; // G
      data[i + 2] = gray; // B
      // Alpha (i+3) tetap sama
    }

    return imageData;
  }

  /**
   * Convert image to binary with threshold
   * @param {number} threshold - Threshold value (0-255)
   * @returns {ImageData} Binary image data
   */
  toBinary(threshold = 128) {
    const imageData = this.getImageData();
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(
        0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
      );
      const binary = gray >= threshold ? 255 : 0;
      data[i] = binary; // R
      data[i + 1] = binary; // G
      data[i + 2] = binary; // B
    }

    return imageData;
  }

  /**
   * Adjust brightness of image
   * @param {number} value - Brightness adjustment value (-255 to 255)
   * @returns {ImageData} Brightness-adjusted image data
   */
  adjustBrightness(value) {
    const imageData = this.getImageData();
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] = this.clamp(data[i] + value); // R
      data[i + 1] = this.clamp(data[i + 1] + value); // G
      data[i + 2] = this.clamp(data[i + 2] + value); // B
    }

    return imageData;
  }

  /**
   * Arithmetic operation with constant
   * @param {string} operation - Operation type ('add', 'subtract', 'multiply')
   * @param {number} constant - Constant value
   * @returns {ImageData} Processed image data
   */
  arithmeticConstant(operation, constant) {
    const imageData = this.getImageData();
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      switch (operation) {
        case "add":
          data[i] = this.clamp(data[i] + constant);
          data[i + 1] = this.clamp(data[i + 1] + constant);
          data[i + 2] = this.clamp(data[i + 2] + constant);
          break;
        case "subtract":
          data[i] = this.clamp(data[i] - constant);
          data[i + 1] = this.clamp(data[i + 1] - constant);
          data[i + 2] = this.clamp(data[i + 2] - constant);
          break;
        case "multiply":
          data[i] = this.clamp(data[i] * constant);
          data[i + 1] = this.clamp(data[i + 1] * constant);
          data[i + 2] = this.clamp(data[i + 2] * constant);
          break;
      }
    }

    return imageData;
  }

  /**
   * Arithmetic operation with another image
   * @param {string} operation - Operation type ('add', 'subtract', 'multiply')
   * @param {ImageData} otherImageData - Other image data
   * @returns {ImageData} Processed image data
   */
  arithmeticImage(operation, otherImageData) {
    const imageData = this.getImageData();
    const data1 = imageData.data;
    const data2 = otherImageData.data;

    // Pastikan ukuran sama
    if (data1.length !== data2.length) {
      alert("Ukuran gambar harus sama!");
      return imageData;
    }

    for (let i = 0; i < data1.length; i += 4) {
      switch (operation) {
        case "add":
          data1[i] = this.clamp(data1[i] + data2[i]);
          data1[i + 1] = this.clamp(data1[i + 1] + data2[i + 1]);
          data1[i + 2] = this.clamp(data1[i + 2] + data2[i + 2]);
          break;
        case "subtract":
          data1[i] = this.clamp(data1[i] - data2[i]);
          data1[i + 1] = this.clamp(data1[i + 1] - data2[i + 1]);
          data1[i + 2] = this.clamp(data1[i + 2] - data2[i + 2]);
          break;
        case "multiply":
          data1[i] = this.clamp((data1[i] * data2[i]) / 255);
          data1[i + 1] = this.clamp((data1[i + 1] * data2[i + 1]) / 255);
          data1[i + 2] = this.clamp((data1[i + 2] * data2[i + 2]) / 255);
          break;
      }
    }

    return imageData;
  }

  /**
   * Boolean operation with another image
   * @param {string} operation - Operation type ('and', 'or', 'xor')
   * @param {ImageData} otherImageData - Other image data
   * @returns {ImageData} Processed image data
   */
  booleanOperation(operation, otherImageData) {
    const imageData = this.getImageData();
    const data1 = imageData.data;
    const data2 = otherImageData.data;

    // Pastikan ukuran sama
    if (data1.length !== data2.length) {
      alert("Ukuran gambar harus sama!");
      return imageData;
    }

    for (let i = 0; i < data1.length; i += 4) {
      switch (operation) {
        case "and":
          data1[i] = data1[i] & data2[i];
          data1[i + 1] = data1[i + 1] & data2[i + 1];
          data1[i + 2] = data1[i + 2] & data2[i + 2];
          break;
        case "or":
          data1[i] = data1[i] | data2[i];
          data1[i + 1] = data1[i + 1] | data2[i + 1];
          data1[i + 2] = data1[i + 2] | data2[i + 2];
          break;
        case "xor":
          data1[i] = data1[i] ^ data2[i];
          data1[i + 1] = data1[i + 1] ^ data2[i + 1];
          data1[i + 2] = data1[i + 2] ^ data2[i + 2];
          break;
      }
    }

    return imageData;
  }

  /**
   * Rotate image 90 degrees clockwise
   * @returns {ImageData} Rotated image data
   */
  rotate90() {
    const srcData = this.getImageData();
    const width = srcData.width;
    const height = srcData.height;

    const destData = new ImageData(height, width);
    const src = srcData.data;
    const dest = destData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const destX = height - 1 - y;
        const destY = x;
        const destIdx = (destY * height + destX) * 4;

        dest[destIdx] = src[srcIdx];
        dest[destIdx + 1] = src[srcIdx + 1];
        dest[destIdx + 2] = src[srcIdx + 2];
        dest[destIdx + 3] = src[srcIdx + 3];
      }
    }

    return destData;
  }

  /**
   * Rotate image 180 degrees
   * @returns {ImageData} Rotated image data
   */
  rotate180() {
    const srcData = this.getImageData();
    const width = srcData.width;
    const height = srcData.height;

    const destData = new ImageData(width, height);
    const src = srcData.data;
    const dest = destData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const destX = width - 1 - x;
        const destY = height - 1 - y;
        const destIdx = (destY * width + destX) * 4;

        dest[destIdx] = src[srcIdx];
        dest[destIdx + 1] = src[srcIdx + 1];
        dest[destIdx + 2] = src[srcIdx + 2];
        dest[destIdx + 3] = src[srcIdx + 3];
      }
    }

    return destData;
  }

  /**
   * Rotate image 270 degrees clockwise (or 90 counter-clockwise)
   * @returns {ImageData} Rotated image data
   */
  rotate270() {
    const srcData = this.getImageData();
    const width = srcData.width;
    const height = srcData.height;

    const destData = new ImageData(height, width);
    const src = srcData.data;
    const dest = destData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const destX = y;
        const destY = width - 1 - x;
        const destIdx = (destY * height + destX) * 4;

        dest[destIdx] = src[srcIdx];
        dest[destIdx + 1] = src[srcIdx + 1];
        dest[destIdx + 2] = src[srcIdx + 2];
        dest[destIdx + 3] = src[srcIdx + 3];
      }
    }

    return destData;
  }

  /**
   * Flip image horizontally
   * @returns {ImageData} Flipped image data
   */
  flipHorizontal() {
    const srcData = this.getImageData();
    const width = srcData.width;
    const height = srcData.height;

    const destData = new ImageData(width, height);
    const src = srcData.data;
    const dest = destData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const destX = width - 1 - x;
        const destIdx = (y * width + destX) * 4;

        dest[destIdx] = src[srcIdx];
        dest[destIdx + 1] = src[srcIdx + 1];
        dest[destIdx + 2] = src[srcIdx + 2];
        dest[destIdx + 3] = src[srcIdx + 3];
      }
    }

    return destData;
  }

  /**
   * Flip image vertically
   * @returns {ImageData} Flipped image data
   */
  flipVertical() {
    const srcData = this.getImageData();
    const width = srcData.width;
    const height = srcData.height;

    const destData = new ImageData(width, height);
    const src = srcData.data;
    const dest = destData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const destY = height - 1 - y;
        const destIdx = (destY * width + x) * 4;

        dest[destIdx] = src[srcIdx];
        dest[destIdx + 1] = src[srcIdx + 1];
        dest[destIdx + 2] = src[srcIdx + 2];
        dest[destIdx + 3] = src[srcIdx + 3];
      }
    }

    return destData;
  }

  /**
   * Clamp value to RGB range (0-255)
   * @param {number} value - Value to clamp
   * @returns {number} Clamped value
   */
  clamp(value) {
    return Math.max(0, Math.min(255, Math.round(value)));
  }
}
