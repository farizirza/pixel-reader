/**
 * PixelReader Main Class
 * Core application that coordinates all features
 */
import { ImageProcessor } from "../utils/imageProcessor.js";
import { HistogramFeature } from "./histogramFeature.js";
import { StatisticalFeature } from "./statisticalFeature.js";
import { GreenDetectionFeature } from "./greenDetectionFeature.js";

export class PixelReader {
  constructor() {
    // Canvas & Context
    this.canvas = document.getElementById("imageCanvas");
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });

    // Input Elements
    this.imageInput = document.getElementById("imageInput");
    this.imagePreview = document.getElementById("imagePreview");
    this.pixelList = document.getElementById("pixelList");
    this.showAllPixels = document.getElementById("showAllPixels");
    this.hoverInfo = document.getElementById("hoverInfo");
    this.imageSize = document.getElementById("imageSize");
    this.tabSection = document.getElementById("tabSection");

    // Data Storage
    this.currentImage = null;
    this.pixelDataArray = [];
    this.processor = null;
    this.secondImage = null;
    this.booleanSecondImage = null;

    // Features
    this.histogramFeature = null;
    this.statisticalFeature = null;
    this.greenDetectionFeature = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Image upload
    this.imageInput.addEventListener("change", (e) =>
      this.handleImageUpload(e)
    );
    this.showAllPixels.addEventListener("change", () =>
      this.updatePixelDisplay()
    );

    // Canvas hover
    this.canvas.addEventListener("mousemove", (e) => this.handleCanvasHover(e));
    this.canvas.addEventListener("mouseleave", () => this.hideHoverInfo());

    // Tab change
    document.querySelectorAll(".tab-button").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.handleTabChange(e.target.dataset.tab)
      );
    });

    // Grayscale
    document
      .getElementById("resetImageGrayscale")
      .addEventListener("click", () =>
        this.resetCanvas("processCanvasGrayscale")
      );

    // Binary
    const thresholdSlider = document.getElementById("thresholdSlider");
    thresholdSlider.addEventListener("input", (e) => {
      document.getElementById("thresholdValue").textContent = e.target.value;
      this.applyBinaryRealtime();
    });
    document
      .getElementById("resetImageBinary")
      .addEventListener("click", () => this.resetCanvas("processCanvasBinary"));

    // Brightness
    const brightnessSlider = document.getElementById("brightnessSlider");
    brightnessSlider.addEventListener("input", (e) => {
      document.getElementById("brightnessValue").textContent = e.target.value;
      this.applyBrightnessRealtime();
    });
    document
      .getElementById("resetImage2")
      .addEventListener("click", () => this.resetCanvas("processCanvas2"));

    // Arithmetic
    document
      .getElementById("arithmeticMode")
      .addEventListener("change", (e) => this.toggleArithmeticMode(e));
    document
      .getElementById("secondImageInput")
      .addEventListener("change", (e) => this.handleSecondImageUpload(e));
    document
      .getElementById("applyArithmetic")
      .addEventListener("click", () => this.applyArithmeticOperation());
    document
      .getElementById("resetImage3")
      .addEventListener("click", () => this.resetCanvas("processCanvas3"));

    // Boolean
    document
      .getElementById("booleanImageInput")
      .addEventListener("change", (e) => this.handleBooleanImageUpload(e));
    document
      .getElementById("applyBoolean")
      .addEventListener("click", () => this.applyBooleanOperation());
    document
      .getElementById("resetImage4")
      .addEventListener("click", () => this.resetCanvas("processCanvas4"));

    // Geometry
    document
      .getElementById("rotate90")
      .addEventListener("click", () => this.applyRotation(90));
    document
      .getElementById("rotate180")
      .addEventListener("click", () => this.applyRotation(180));
    document
      .getElementById("rotate270")
      .addEventListener("click", () => this.applyRotation(270));
    document
      .getElementById("flipHorizontal")
      .addEventListener("click", () => this.applyFlip("horizontal"));
    document
      .getElementById("flipVertical")
      .addEventListener("click", () => this.applyFlip("vertical"));
    document
      .getElementById("resetImage5")
      .addEventListener("click", () => this.resetCanvas("processCanvas5"));
  }

  handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.currentImage = img;
        this.drawImage(img);
        this.readPixels();
        this.processor = new ImageProcessor(this.canvas);

        // Initialize histogram feature
        this.histogramFeature = new HistogramFeature(this.processor);

        // Initialize statistical feature
        this.statisticalFeature = new StatisticalFeature(this.processor);

        // Initialize green detection feature
        this.greenDetectionFeature = new GreenDetectionFeature(this.processor);

        // Show tab section
        this.tabSection.classList.remove("hidden");

        // Reset all process canvases
        this.resetAllCanvases();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  drawImage(img) {
    this.canvas.width = img.width;
    this.canvas.height = img.height;
    this.ctx.drawImage(img, 0, 0);
    this.imagePreview.classList.remove("hidden");
    this.imageSize.textContent = `Ukuran: ${img.width} x ${
      img.height
    } pixel (Total: ${img.width * img.height} pixel)`;
  }

  readPixels() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const imageData = this.ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    this.pixelDataArray = [];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        this.pixelDataArray.push({
          x,
          y,
          r: data[index],
          g: data[index + 1],
          b: data[index + 2],
          a: data[index + 3],
        });
      }
    }

    console.log(`Total pixel yang dibaca: ${this.pixelDataArray.length}`);
    this.updatePixelDisplay();
  }

  updatePixelDisplay() {
    this.displayPixelTable(500, 500);
  }

  displayPixelTable(tableWidth, tableHeight) {
    const width = Math.min(tableWidth, this.canvas.width);
    const height = Math.min(tableHeight, this.canvas.height);
    if (width === 0 || height === 0) {
      this.pixelList.innerHTML =
        '<div class="loading">Gambar belum diunggah atau terlalu kecil.</div>';
      return;
    }

    let html = `
      <div class="matrix-search-container">
        <label for="search-pixelList">🔍 Cari Koordinat:</label>
        <input type="number" id="search-x-pixelList" placeholder="X" min="0" max="${
          this.canvas.width - 1
        }" class="coord-input" />
        <input type="number" id="search-y-pixelList" placeholder="Y" min="0" max="${
          this.canvas.height - 1
        }" class="coord-input" />
        <button class="search-button" onclick="app.searchCoordinate('pixelList', ${
          this.canvas.width
        }, ${this.canvas.height})">Cari</button>
        <span id="search-result-pixelList" class="search-result"></span>
      </div>
    `;

    html +=
      '<div class="table-wrapper"><table class="pixel-table" id="table-pixelList">';
    html += "<thead><tr><th></th>";
    for (let x = 0; x < width; x++) {
      html += `<th>${x}</th>`;
    }
    html += "</tr></thead><tbody>";
    for (let y = 0; y < height; y++) {
      html += `<tr><th>${y}</th>`;
      for (let x = 0; x < width; x++) {
        const idx = y * this.canvas.width + x;
        const pixel = this.pixelDataArray[idx];
        if (pixel) {
          const brightness =
            0.299 * pixel.r + 0.587 * pixel.g + 0.114 * pixel.b;
          const isLight = brightness > 180;
          const lightClass = isLight ? " light-bg" : "";
          html += `<td class="${lightClass}" data-x="${x}" data-y="${y}" style="background:rgb(${pixel.r},${pixel.g},${pixel.b});font-size:7px;" title="x(${x}),y(${y}) RGB(${pixel.r},${pixel.g},${pixel.b})">${pixel.r},${pixel.g},${pixel.b}</td>`;
        } else {
          html += "<td></td>";
        }
      }
      html += "</tr>";
    }
    html += "</tbody></table></div>";
    this.pixelList.innerHTML = html;
  }

  displayMatrix(canvas, targetElementId, maxSize = 100) {
    const targetElement = document.getElementById(targetElementId);
    if (!targetElement || !canvas || canvas.width === 0) {
      if (targetElement) {
        targetElement.innerHTML =
          '<div class="loading">Tidak ada data untuk ditampilkan</div>';
      }
      return;
    }

    const width = Math.min(maxSize, canvas.width);
    const height = Math.min(maxSize, canvas.height);
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let html = `
      <div class="matrix-search-container">
        <label for="search-${targetElementId}">🔍 Cari Koordinat:</label>
        <input type="number" id="search-x-${targetElementId}" placeholder="X" min="0" max="${
      canvas.width - 1
    }" class="coord-input" />
        <input type="number" id="search-y-${targetElementId}" placeholder="Y" min="0" max="${
      canvas.height - 1
    }" class="coord-input" />
        <button class="search-button" onclick="app.searchCoordinate('${targetElementId}', ${
      canvas.width
    }, ${canvas.height})">Cari</button>
        <span id="search-result-${targetElementId}" class="search-result"></span>
      </div>
    `;

    html +=
      '<div class="table-wrapper"><table class="pixel-table" id="table-' +
      targetElementId +
      '">';
    html += "<thead><tr><th></th>";
    for (let x = 0; x < width; x++) {
      html += `<th>${x}</th>`;
    }
    html += "</tr></thead><tbody>";

    for (let y = 0; y < height; y++) {
      html += `<tr><th>${y}</th>`;
      for (let x = 0; x < width; x++) {
        const idx = (y * canvas.width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
        const isLight = brightness > 180;
        const lightClass = isLight ? " light-bg" : "";

        html += `<td class="${lightClass}" data-x="${x}" data-y="${y}" style="background:rgb(${r},${g},${b});font-size:7px;" title="x(${x}),y(${y}) RGB(${r},${g},${b})">${r},${g},${b}</td>`;
      }
      html += "</tr>";
    }
    html += "</tbody></table></div>";
    targetElement.innerHTML = html;
  }

  handleCanvasHover(event) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const x = Math.floor((event.clientX - rect.left) * scaleX);
    const y = Math.floor((event.clientY - rect.top) * scaleY);

    const pixel = this.pixelDataArray.find((p) => p.x === x && p.y === y);

    if (pixel) {
      this.showHoverInfo(event, pixel);
    }
  }

  showHoverInfo(event, pixel) {
    const hoverCoord = document.getElementById("hoverCoord");
    const hoverRGB = document.getElementById("hoverRGB");
    const hoverColor = document.getElementById("hoverColor");

    hoverCoord.textContent = `x(${pixel.x}), y(${pixel.y})`;
    hoverRGB.textContent = `R:${pixel.r}, G:${pixel.g}, B:${pixel.b}`;
    hoverColor.style.backgroundColor = `rgb(${pixel.r}, ${pixel.g}, ${pixel.b})`;

    // Use clientX/clientY untuk posisi relatif viewport, bukan document
    // Ini memastikan hover info selalu sesuai dengan cursor saat scroll
    this.hoverInfo.style.position = "fixed";
    this.hoverInfo.style.left = event.clientX + 20 + "px";
    this.hoverInfo.style.top = event.clientY - 50 + "px";
    this.hoverInfo.classList.remove("hidden");
  }

  hideHoverInfo() {
    this.hoverInfo.classList.add("hidden");
  }

  searchCoordinate(targetElementId, canvasWidth, canvasHeight) {
    const xInput = document.getElementById(`search-x-${targetElementId}`);
    const yInput = document.getElementById(`search-y-${targetElementId}`);
    const resultSpan = document.getElementById(
      `search-result-${targetElementId}`
    );
    const table = document.getElementById(`table-${targetElementId}`);

    if (!xInput || !yInput || !resultSpan || !table) return;

    const x = parseInt(xInput.value);
    const y = parseInt(yInput.value);

    if (isNaN(x) || isNaN(y)) {
      resultSpan.textContent = "⚠️ Masukkan koordinat X dan Y";
      resultSpan.className = "search-result error";
      return;
    }

    if (x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) {
      resultSpan.textContent = `⚠️ Koordinat di luar range`;
      resultSpan.className = "search-result error";
      return;
    }

    const previousHighlight = table.querySelector(".highlight-cell");
    if (previousHighlight) {
      previousHighlight.classList.remove("highlight-cell");
    }

    const cell = table.querySelector(`td[data-x="${x}"][data-y="${y}"]`);

    if (cell) {
      cell.classList.add("highlight-cell");
      const title = cell.getAttribute("title");
      const rgbMatch = title.match(/RGB\((\d+),(\d+),(\d+)\)/);

      if (rgbMatch) {
        resultSpan.innerHTML = `✅ Ditemukan! RGB(${rgbMatch[1]}, ${rgbMatch[2]}, ${rgbMatch[3]})`;
        resultSpan.className = "search-result success";
      }

      cell.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    } else {
      resultSpan.textContent = `⚠️ Koordinat tidak terlihat di matrix`;
      resultSpan.className = "search-result warning";
    }
  }

  handleTabChange(tabId) {
    if (tabId === "histogram" && this.histogramFeature) {
      setTimeout(() => this.histogramFeature.generateHistograms(), 100);
    } else if (tabId === "grayscale" && this.processor) {
      setTimeout(() => this.applyGrayscale(), 100);
    } else if (tabId === "binary" && this.processor) {
      setTimeout(() => this.applyBinaryRealtime(), 100);
    } else if (tabId === "brightness" && this.processor) {
      const slider = document.getElementById("brightnessSlider");
      if (slider.value !== "0") {
        slider.value = 0;
        document.getElementById("brightnessValue").textContent = "0";
      }
      setTimeout(() => this.applyBrightnessRealtime(), 100);
    }
  }

  // Grayscale
  applyGrayscale() {
    if (!this.processor) return;
    const canvas = document.getElementById("processCanvasGrayscale");
    const imageData = this.processor.toGrayscale();
    this.processor.drawToCanvas(imageData, canvas);
    this.displayMatrix(canvas, "matrixListGrayscale");
  }

  // Binary
  applyBinaryRealtime() {
    if (!this.processor) return;
    const threshold = parseInt(
      document.getElementById("thresholdSlider").value
    );
    const canvas = document.getElementById("processCanvasBinary");
    const imageData = this.processor.toBinary(threshold);
    this.processor.drawToCanvas(imageData, canvas);
    this.displayMatrix(canvas, "matrixListBinary");
  }

  // Brightness
  applyBrightnessRealtime() {
    if (!this.processor) return;
    const value = parseInt(document.getElementById("brightnessSlider").value);
    const canvas = document.getElementById("processCanvas2");
    const imageData = this.processor.adjustBrightness(value);
    this.processor.drawToCanvas(imageData, canvas);
    this.displayMatrix(canvas, "matrixList2");
  }

  // Arithmetic
  toggleArithmeticMode(event) {
    const mode = event.target.value;
    const constantGroup = document.getElementById("constantGroup");
    const imageGroup = document.getElementById("imageGroup");

    if (mode === "constant") {
      constantGroup.style.display = "block";
      imageGroup.style.display = "none";
    } else {
      constantGroup.style.display = "none";
      imageGroup.style.display = "block";
    }
  }

  resizeImageData(imageData, targetWidth, targetHeight) {
    const srcCanvas = document.createElement("canvas");
    srcCanvas.width = imageData.width;
    srcCanvas.height = imageData.height;
    const srcCtx = srcCanvas.getContext("2d");
    srcCtx.putImageData(imageData, 0, 0);

    const dstCanvas = document.createElement("canvas");
    dstCanvas.width = targetWidth;
    dstCanvas.height = targetHeight;
    const dstCtx = dstCanvas.getContext("2d");
    dstCtx.drawImage(srcCanvas, 0, 0, targetWidth, targetHeight);

    return dstCtx.getImageData(0, 0, targetWidth, targetHeight);
  }

  handleSecondImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const statusText = document.getElementById("arithmeticImageStatus");
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        this.secondImage = ctx.getImageData(0, 0, img.width, img.height);

        if (statusText) {
          if (
            this.currentImage &&
            (img.width !== this.currentImage.width ||
              img.height !== this.currentImage.height)
          ) {
            statusText.textContent = `✅ ${img.width}x${img.height} (akan di-resize)`;
            statusText.className = "status-text warning";
          } else {
            statusText.textContent = `✅ ${img.width}x${img.height}`;
            statusText.className = "status-text success";
          }
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  applyArithmeticOperation() {
    if (!this.processor) {
      alert("Upload gambar terlebih dahulu!");
      return;
    }

    const operation = document.getElementById("arithmeticOp").value;
    const mode = document.getElementById("arithmeticMode").value;
    const canvas = document.getElementById("processCanvas3");

    let imageData;
    if (mode === "constant") {
      const constant = parseFloat(
        document.getElementById("constantValue").value
      );
      imageData = this.processor.arithmeticConstant(operation, constant);
    } else {
      if (!this.secondImage) {
        alert("Upload gambar kedua terlebih dahulu!");
        return;
      }

      let processedSecondImage = this.secondImage;
      if (
        this.currentImage &&
        (this.secondImage.width !== this.currentImage.width ||
          this.secondImage.height !== this.currentImage.height)
      ) {
        processedSecondImage = this.resizeImageData(
          this.secondImage,
          this.currentImage.width,
          this.currentImage.height
        );
      }

      imageData = this.processor.arithmeticImage(
        operation,
        processedSecondImage
      );
    }

    this.processor.drawToCanvas(imageData, canvas);
    this.displayMatrix(canvas, "matrixList3");
  }

  // Boolean
  handleBooleanImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const statusText = document.getElementById("image2Status");
    const statusPreview = document.getElementById("image2StatusPreview");

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas1 = document.getElementById("booleanCanvas1");
        const canvas2 = document.getElementById("booleanCanvas2");

        if (this.currentImage && canvas1.width === 0) {
          canvas1.width = this.currentImage.width;
          canvas1.height = this.currentImage.height;
          const ctx1 = canvas1.getContext("2d");
          ctx1.drawImage(this.currentImage, 0, 0);
        }

        canvas2.width = img.width;
        canvas2.height = img.height;
        const ctx2 = canvas2.getContext("2d");
        ctx2.drawImage(img, 0, 0);

        this.booleanSecondImage = ctx2.getImageData(
          0,
          0,
          img.width,
          img.height
        );

        const sizeText = `${img.width}x${img.height}`;
        const needsResize =
          this.currentImage &&
          (img.width !== this.currentImage.width ||
            img.height !== this.currentImage.height);

        if (statusText) {
          statusText.textContent = needsResize
            ? `✅ ${sizeText} (akan di-resize)`
            : `✅ ${sizeText}`;
          statusText.className = needsResize
            ? "status-text warning"
            : "status-text success";
        }

        if (statusPreview) {
          statusPreview.textContent = needsResize
            ? `⚠️ Akan di-resize`
            : `✅ Ukuran sama`;
          statusPreview.className = needsResize
            ? "status-text warning"
            : "status-text success";
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  applyBooleanOperation() {
    if (!this.processor) {
      alert("Upload gambar terlebih dahulu!");
      return;
    }
    if (!this.booleanSecondImage) {
      alert("Upload gambar kedua terlebih dahulu!");
      return;
    }

    let processedSecondImage = this.booleanSecondImage;
    if (
      this.currentImage &&
      (this.booleanSecondImage.width !== this.currentImage.width ||
        this.booleanSecondImage.height !== this.currentImage.height)
    ) {
      processedSecondImage = this.resizeImageData(
        this.booleanSecondImage,
        this.currentImage.width,
        this.currentImage.height
      );
    }

    const operation = document.getElementById("booleanOp").value;
    const canvas = document.getElementById("processCanvas4");
    const imageData = this.processor.booleanOperation(
      operation,
      processedSecondImage
    );
    this.processor.drawToCanvas(imageData, canvas);
    this.displayMatrix(canvas, "matrixList4");
  }

  // Geometry
  applyRotation(degrees) {
    if (!this.processor) {
      alert("Upload gambar terlebih dahulu!");
      return;
    }

    const canvas = document.getElementById("processCanvas5");
    let imageData;

    switch (degrees) {
      case 90:
        imageData = this.processor.rotate90();
        break;
      case 180:
        imageData = this.processor.rotate180();
        break;
      case 270:
        imageData = this.processor.rotate270();
        break;
    }

    this.processor.drawToCanvas(imageData, canvas);
    this.processor = new ImageProcessor(canvas);
    this.displayMatrix(canvas, "matrixList5");
  }

  applyFlip(direction) {
    if (!this.processor) {
      alert("Upload gambar terlebih dahulu!");
      return;
    }

    const canvas = document.getElementById("processCanvas5");
    let imageData;

    if (direction === "horizontal") {
      imageData = this.processor.flipHorizontal();
    } else {
      imageData = this.processor.flipVertical();
    }

    this.processor.drawToCanvas(imageData, canvas);
    this.processor = new ImageProcessor(canvas);
    this.displayMatrix(canvas, "matrixList5");
  }

  // Reset functions
  resetCanvas(canvasId) {
    if (!this.currentImage) return;

    const canvas = document.getElementById(canvasId);
    canvas.width = this.currentImage.width;
    canvas.height = this.currentImage.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(this.currentImage, 0, 0);

    this.processor = new ImageProcessor(this.canvas);

    const matrixMap = {
      processCanvasGrayscale: "matrixListGrayscale",
      processCanvasBinary: "matrixListBinary",
      processCanvas2: "matrixList2",
      processCanvas3: "matrixList3",
      processCanvas4: "matrixList4",
      processCanvas5: "matrixList5",
    };

    const matrixId = matrixMap[canvasId];
    if (matrixId) {
      this.displayMatrix(canvas, matrixId);
    }
  }

  resetAllCanvases() {
    if (!this.currentImage) return;

    const canvases = [
      "processCanvasGrayscale",
      "processCanvasBinary",
      "processCanvas2",
      "processCanvas3",
      "processCanvas4",
      "processCanvas5",
    ];
    const matrixIds = [
      "matrixListGrayscale",
      "matrixListBinary",
      "matrixList2",
      "matrixList3",
      "matrixList4",
      "matrixList5",
    ];

    canvases.forEach((id, index) => {
      const canvas = document.getElementById(id);
      canvas.width = this.currentImage.width;
      canvas.height = this.currentImage.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(this.currentImage, 0, 0);
      this.displayMatrix(canvas, matrixIds[index]);
    });

    const canvas1 = document.getElementById("booleanCanvas1");
    canvas1.width = this.currentImage.width;
    canvas1.height = this.currentImage.height;
    const ctx1 = canvas1.getContext("2d");
    ctx1.drawImage(this.currentImage, 0, 0);

    const canvas2 = document.getElementById("booleanCanvas2");
    canvas2.width = 0;
    canvas2.height = 0;

    this.booleanSecondImage = null;
    this.secondImage = null;
  }
}
