import "./style.css";

class PixelReader {
  constructor() {
    this.canvas = document.getElementById("imageCanvas");
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    this.imageInput = document.getElementById("imageInput");
    this.imagePreview = document.getElementById("imagePreview");
    this.pixelData = document.getElementById("pixelData");
    this.pixelList = document.getElementById("pixelList");
    this.showAllPixels = document.getElementById("showAllPixels");
    // ...existing code...
    this.hoverInfo = document.getElementById("hoverInfo");
    this.imageSize = document.getElementById("imageSize");
    this.searchX = document.getElementById("searchX");
    this.searchY = document.getElementById("searchY");
    this.searchButton = document.getElementById("searchButton");
    this.searchResult = document.getElementById("searchResult");

    this.currentImage = null;
    this.pixelDataArray = [];

    this.init();
  }

  init() {
    this.imageInput.addEventListener("change", (e) =>
      this.handleImageUpload(e)
    );
    this.showAllPixels.addEventListener("change", () =>
      this.updatePixelDisplay()
    );
    // ...existing code...
    this.canvas.addEventListener("mousemove", (e) => this.handleCanvasHover(e));
    this.canvas.addEventListener("mouseleave", () => this.hideHoverInfo());
    this.searchButton.addEventListener("click", () => this.searchPixelByCoord());
    this.searchX.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.searchPixelByCoord();
    });
    this.searchY.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.searchPixelByCoord();
    });
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
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  drawImage(img) {
    // Set canvas size to match image
    this.canvas.width = img.width;
    this.canvas.height = img.height;

    // Draw image on canvas
    this.ctx.drawImage(img, 0, 0);

    // Show preview
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

    // Read all pixels
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const a = data[index + 3];

        this.pixelDataArray.push({
          x,
          y,
          r,
          g,
          b,
          a,
        });
      }
    }

    console.log(`Total pixel yang dibaca: ${this.pixelDataArray.length}`);
    this.updatePixelDisplay();
    this.pixelData.classList.remove("hidden");
  }

  updatePixelDisplay() {
    // Tampilkan tabel 100x100 pixel
    this.displayPixelTable(500, 500);
  }

  // Hilangkan displaySamplePixels dan displayAllPixels
  // Tambahkan fungsi untuk menampilkan tabel pixel
  displayPixelTable(tableWidth, tableHeight) {
    // Ambil pixel 100x100 dari kiri atas
    const width = Math.min(tableWidth, this.canvas.width);
    const height = Math.min(tableHeight, this.canvas.height);
    if (width === 0 || height === 0) {
      this.pixelList.innerHTML =
        '<div class="loading">Gambar belum diunggah atau terlalu kecil.</div>';
      return;
    }
    let html = '<div class="table-wrapper"><table class="pixel-table">';
    html += "<thead><tr><th></th>";
    for (let x = 0; x < width; x++) {
      html += `<th>${x}</th>`;
    }
    html += "</tr></thead>";
    html += "<tbody>";
    for (let y = 0; y < height; y++) {
      html += `<tr><th>${y}</th>`;
      for (let x = 0; x < width; x++) {
        const idx = y * this.canvas.width + x;
        const pixel = this.pixelDataArray[idx];
        if (pixel) {
          // Hitung brightness menggunakan formula luminance
          const brightness =
            0.299 * pixel.r + 0.587 * pixel.g + 0.114 * pixel.b;
          const isLight = brightness > 180; // Threshold untuk warna terang
          const lightClass = isLight ? " light-bg" : "";
          html += `<td class="${lightClass}" style="background:rgb(${pixel.r},${pixel.g},${pixel.b});font-size:7px;" title="x(${x}),y(${y}) RGB(${pixel.r},${pixel.g},${pixel.b})">${pixel.r},${pixel.g},${pixel.b}</td>`;
        } else {
          html += "<td></td>";
        }
      }
      html += "</tr>";
    }
    html += "</tbody></table></div>";
    this.pixelList.innerHTML = html;
  }

  searchPixelByCoord() {
    const x = parseInt(this.searchX.value);
    const y = parseInt(this.searchY.value);

    // Validasi input
    if (isNaN(x) || isNaN(y)) {
      this.showSearchResult(null, "Masukkan koordinat X dan Y yang valid");
      return;
    }

    if (!this.pixelDataArray.length) {
      this.showSearchResult(null, "Upload gambar terlebih dahulu");
      return;
    }

    // Validasi range koordinat
    if (x < 0 || x >= this.canvas.width || y < 0 || y >= this.canvas.height) {
      this.showSearchResult(
        null,
        `Koordinat di luar jangkauan. X: 0-${this.canvas.width - 1}, Y: 0-${
          this.canvas.height - 1
        }`
      );
      return;
    }

    // Cari pixel dengan koordinat yang sesuai
    const pixel = this.pixelDataArray.find((p) => p.x === x && p.y === y);

    if (pixel) {
      this.showSearchResult(pixel);
    } else {
      this.showSearchResult(null, "Pixel tidak ditemukan");
    }
  }

  showSearchResult(pixel, errorMessage = null) {
    this.searchResult.classList.remove("hidden");

    if (errorMessage) {
      this.searchResult.className = "search-result error";
      this.searchResult.innerHTML = `<p>${errorMessage}</p>`;
      return;
    }

    this.searchResult.className = "search-result success";
    this.searchResult.innerHTML = `
      <div class="search-result-content">
        <div class="search-result-info">
          <div class="search-result-coord">Koordinat: x(${pixel.x}), y(${pixel.y})</div>
          <div class="search-result-rgb">RGB: R:${pixel.r}, G:${pixel.g}, B:${pixel.b}</div>
        </div>
        <div class="search-result-color" style="background-color: rgb(${pixel.r}, ${pixel.g}, ${pixel.b});"></div>
      </div>
    `;
  }

  // ...existing code...

  handleCanvasHover(event) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;

    const x = Math.floor((event.clientX - rect.left) * scaleX);
    const y = Math.floor((event.clientY - rect.top) * scaleY);

    // Get pixel at this position
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

    this.hoverInfo.style.left = event.pageX + 20 + "px";
    this.hoverInfo.style.top = event.pageY - 50 + "px";
    this.hoverInfo.classList.remove("hidden");
  }

  hideHoverInfo() {
    this.hoverInfo.classList.add("hidden");
  }
}

// Initialize the app
new PixelReader();

// Log example
console.log("Pixel Reader initialized!");
console.log("Contoh output: x(0), y(0) → RGB(0, 255, 1)");
