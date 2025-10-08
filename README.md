# 🎨 Pixel Reader

Aplikasi web berbasis Vite untuk membaca dan menganalisis nilai RGB dari setiap pixel pada gambar yang diunggah.

## ✨ Fitur

- 📤 **Upload Gambar**: Unggah gambar dalam format apapun (JPG, PNG, GIF, dll)
- 🔍 **Analisis Pixel**: Membaca setiap pixel dari gambar dan menampilkan koordinat (x, y) beserta nilai RGB-nya
- 🖱️ **Hover Info**: Arahkan kursor ke gambar untuk melihat nilai RGB pixel secara real-time
- 📊 **Tampilan Data**: 
  - Mode sample (100 pixel pertama)
  - Mode lengkap (semua pixel)
- 📥 **Export CSV**: Ekspor seluruh data pixel ke format CSV
- 🎨 **Preview Warna**: Lihat visualisasi warna dari setiap pixel

## 🚀 Cara Menggunakan

### Instalasi

```bash
# Jika belum install dependencies (sudah dilakukan otomatis)
npm install
```

### Menjalankan Aplikasi

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173/`

### Build untuk Production

```bash
npm run build
```

## 📖 Cara Kerja

1. **Upload Gambar**: Klik tombol "Pilih Gambar" dan pilih gambar dari komputer Anda
2. **Lihat Preview**: Gambar akan ditampilkan di canvas
3. **Analisis Otomatis**: Aplikasi secara otomatis membaca setiap pixel
4. **Lihat Data**: 
   - Secara default, 100 pixel pertama ditampilkan
   - Centang checkbox "Tampilkan semua pixel" untuk melihat semua data
5. **Hover untuk Detail**: Arahkan kursor ke gambar untuk melihat info pixel secara real-time
6. **Export Data**: Klik tombol "Export ke CSV" untuk mengunduh data dalam format CSV

## 📊 Format Output

Setiap pixel ditampilkan dengan format:
```
x(koordinat_x), y(koordinat_y) → RGB(nilai_r, nilai_g, nilai_b)
```

Contoh:
```
x(0), y(0) → RGB(0, 255, 1)
x(1), y(0) → RGB(255, 128, 64)
```

## 🗂️ Struktur Project

```
pixel-reader/
├── index.html          # HTML utama
├── src/
│   ├── main.js        # Logika aplikasi (PixelReader class)
│   └── style.css      # Styling
├── package.json
└── README.md
```

## 🔧 Teknologi yang Digunakan

- **Vite**: Build tool dan development server
- **Vanilla JavaScript**: Tanpa framework
- **HTML5 Canvas**: Untuk membaca pixel dari gambar
- **CSS3**: Untuk styling modern

## 💡 Tips

- Untuk gambar berukuran besar, gunakan mode sample terlebih dahulu
- Gunakan fitur hover untuk eksplorasi cepat nilai RGB
- Data CSV dapat dibuka di Excel atau Google Sheets untuk analisis lebih lanjut

## 🎯 Use Cases

- Analisis warna pada gambar
- Pembelajaran pengolahan citra
- Ekstraksi palet warna
- Penelitian dan eksperimen dengan pixel data
- Proyek komputer vision dan machine learning

## 📝 Catatan

- Aplikasi membaca pixel dari koordinat (0,0) di pojok kiri atas
- Format RGB: Red (0-255), Green (0-255), Blue (0-255)
- Aplikasi juga membaca nilai Alpha (transparansi) tetapi tidak ditampilkan secara default

## 🤝 Kontribusi

Feel free to fork dan customize sesuai kebutuhan Anda!

---

Dibuat dengan ❤️ menggunakan Vite
