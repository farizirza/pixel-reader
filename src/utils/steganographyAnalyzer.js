/**
 * Steganography Analyzer Utility
 * Provides LSB (Least Significant Bit) steganography operations for hiding and extracting text from images
 */
export class SteganographyAnalyzer {
  // Delimiter to mark end of hidden message
  static END_DELIMITER = "<<END>>";

  /**
   * Encode text into image using LSB steganography
   * @param {ImageData} imageData - Original image data
   * @param {string} text - Text to hide
   * @returns {object} Result with encoded imageData and info
   */
  static encode(imageData, text) {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;

    // Add delimiter to mark end of message
    const messageWithDelimiter = text + this.END_DELIMITER;

    // Convert text to binary string
    const binaryMessage = this.textToBinary(messageWithDelimiter);
    const messageLength = binaryMessage.length;

    // Check if image can hold the message (3 bits per pixel - RGB channels)
    const maxBits = width * height * 3;
    if (messageLength > maxBits) {
      return {
        success: false,
        error: `Pesan terlalu panjang! Maksimal ${Math.floor(
          maxBits / 8
        )} karakter untuk gambar ini.`,
        maxCharacters: Math.floor(maxBits / 8),
        messageLength: text.length,
      };
    }

    let bitIndex = 0;

    // Embed message bits into LSB of RGB channels
    for (let i = 0; i < data.length && bitIndex < messageLength; i++) {
      // Skip alpha channel (every 4th byte)
      if ((i + 1) % 4 === 0) continue;

      // Get the current bit of message
      const bit = parseInt(binaryMessage[bitIndex], 10);

      // Clear LSB and set new bit
      data[i] = (data[i] & 0xfe) | bit;

      bitIndex++;
    }

    const encodedImageData = new ImageData(data, width, height);

    return {
      success: true,
      imageData: encodedImageData,
      originalSize: { width, height },
      messageLength: text.length,
      bitsUsed: messageLength,
      bitsAvailable: maxBits,
      capacityUsed: ((messageLength / maxBits) * 100).toFixed(2),
    };
  }

  /**
   * Decode hidden text from image using LSB steganography
   * @param {ImageData} imageData - Image data containing hidden message
   * @returns {object} Result with extracted text and info
   */
  static decode(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    let binaryMessage = "";
    let extractedText = "";

    // Extract LSB from RGB channels
    for (let i = 0; i < data.length; i++) {
      // Skip alpha channel
      if ((i + 1) % 4 === 0) continue;

      // Get LSB
      const bit = data[i] & 1;
      binaryMessage += bit;

      // Check every 8 bits (1 character)
      if (binaryMessage.length % 8 === 0) {
        const charCode = parseInt(binaryMessage.slice(-8), 2);

        // Valid ASCII range
        if (charCode >= 0 && charCode <= 127) {
          extractedText += String.fromCharCode(charCode);

          // Check for end delimiter
          if (extractedText.endsWith(this.END_DELIMITER)) {
            extractedText = extractedText.slice(0, -this.END_DELIMITER.length);
            return {
              success: true,
              text: extractedText,
              messageLength: extractedText.length,
              bitsRead: binaryMessage.length,
              imageSize: { width, height },
            };
          }
        }
      }

      // Safety limit - stop after reading too many bits without finding delimiter
      if (binaryMessage.length > 1000000) {
        break;
      }
    }

    // Check if any valid text was found
    if (extractedText.length > 0) {
      return {
        success: true,
        text: extractedText,
        messageLength: extractedText.length,
        bitsRead: binaryMessage.length,
        imageSize: { width, height },
        warning:
          "Tidak ditemukan delimiter akhir. Pesan mungkin tidak lengkap.",
      };
    }

    return {
      success: false,
      error: "Tidak ditemukan pesan tersembunyi dalam gambar ini.",
      imageSize: { width, height },
    };
  }

  /**
   * Convert text to binary string
   * @param {string} text - Text to convert
   * @returns {string} Binary string
   */
  static textToBinary(text) {
    let binary = "";
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      const binaryChar = charCode.toString(2).padStart(8, "0");
      binary += binaryChar;
    }
    return binary;
  }

  /**
   * Convert binary string to text
   * @param {string} binary - Binary string
   * @returns {string} Text
   */
  static binaryToText(binary) {
    let text = "";
    for (let i = 0; i < binary.length; i += 8) {
      const byte = binary.slice(i, i + 8);
      if (byte.length === 8) {
        const charCode = parseInt(byte, 2);
        text += String.fromCharCode(charCode);
      }
    }
    return text;
  }

  /**
   * Calculate maximum characters that can be hidden in an image
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {number} Maximum characters
   */
  static calculateCapacity(width, height) {
    const totalPixels = width * height;
    const totalBits = totalPixels * 3; // RGB channels only
    const maxChars = Math.floor(totalBits / 8) - this.END_DELIMITER.length;
    return maxChars;
  }

  /**
   * Analyze image for potential hidden message
   * @param {ImageData} imageData - Image data to analyze
   * @returns {object} Analysis result
   */
  static analyzeImage(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    let lsbPattern = [];
    let zeroCount = 0;
    let oneCount = 0;

    // Analyze first 1000 LSBs
    const sampleSize = Math.min(1000, data.length);
    for (let i = 0; i < sampleSize; i++) {
      if ((i + 1) % 4 === 0) continue; // Skip alpha

      const lsb = data[i] & 1;
      lsbPattern.push(lsb);
      if (lsb === 0) zeroCount++;
      else oneCount++;
    }

    const ratio = oneCount / (zeroCount + oneCount);
    const isBalanced = ratio > 0.4 && ratio < 0.6;

    return {
      width,
      height,
      capacity: this.calculateCapacity(width, height),
      lsbRatio: {
        zeros: zeroCount,
        ones: oneCount,
        ratio: ratio.toFixed(3),
      },
      possibleHiddenData: isBalanced,
      analysis: isBalanced
        ? "Distribusi LSB seimbang - kemungkinan ada data tersembunyi"
        : "Distribusi LSB tidak seimbang - kemungkinan tidak ada data tersembunyi",
    };
  }

  /**
   * Get visual comparison between original and encoded image
   * @param {ImageData} original - Original image data
   * @param {ImageData} encoded - Encoded image data
   * @returns {ImageData} Difference image (amplified)
   */
  static getDifferenceImage(original, encoded) {
    const width = original.width;
    const height = original.height;
    const diffData = new Uint8ClampedArray(original.data.length);

    for (let i = 0; i < original.data.length; i += 4) {
      // Calculate difference for each channel and amplify
      const diffR = Math.abs(original.data[i] - encoded.data[i]) * 255;
      const diffG = Math.abs(original.data[i + 1] - encoded.data[i + 1]) * 255;
      const diffB = Math.abs(original.data[i + 2] - encoded.data[i + 2]) * 255;

      diffData[i] = Math.min(255, diffR);
      diffData[i + 1] = Math.min(255, diffG);
      diffData[i + 2] = Math.min(255, diffB);
      diffData[i + 3] = 255;
    }

    return new ImageData(diffData, width, height);
  }
}
