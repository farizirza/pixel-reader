# Dokumentasi Pixel Reader

## Deskripsi Project

Pixel Reader adalah aplikasi web untuk membaca dan menampilkan nilai RGB dari setiap pixel dalam sebuah gambar. Aplikasi ini memvisualisasikan data pixel dalam bentuk tabel matrix yang interaktif.

## Cara Kerja

### 1. Upload Gambar

Pengguna mengunggah gambar melalui input file. File gambar dibaca menggunakan `FileReader` API dan dimuat ke dalam objek `Image`.

### 2. Rendering ke Canvas

Setelah gambar dimuat, gambar digambar ke HTML5 Canvas dengan ukuran yang sama dengan dimensi asli gambar. Canvas digunakan sebagai media untuk mengekstrak data pixel.

### 3. Ekstraksi Data Pixel

Menggunakan method `getImageData()` dari Canvas Context 2D, aplikasi membaca semua pixel dari gambar:

- Data pixel disimpan dalam format RGBA (Red, Green, Blue, Alpha)
- Setiap pixel memiliki 4 nilai byte (0-255) untuk masing-masing channel
- Data disimpan dalam array dengan struktur: `{x, y, r, g, b, a}`

### 4. Perhitungan Brightness

Untuk menentukan warna teks yang kontras, aplikasi menghitung brightness menggunakan formula luminance standar:

```
brightness = (0.299 × R) + (0.587 × G) + (0.114 × B)
```

- Jika brightness > 180: teks hitam (untuk background terang)
- Jika brightness ≤ 180: teks putih (untuk background gelap)

### 5. Visualisasi Tabel Matrix

Data pixel ditampilkan dalam bentuk tabel HTML dengan fitur:

- Header kolom menunjukkan koordinat X (horizontal)
- Header baris menunjukkan koordinat Y (vertikal)
- Setiap sel berisi nilai RGB dan diwarnai sesuai warna pixel
- Header menggunakan `position: sticky` agar tetap terlihat saat scroll

### 6. Pencarian RGB Berdasarkan Koordinat

Aplikasi menyediakan fitur pencarian manual untuk mendapatkan nilai RGB dari koordinat tertentu:

- User memasukkan nilai koordinat X dan Y melalui input field
- Sistem memvalidasi input (harus berupa angka dan dalam range gambar)
- Mencari pixel dengan koordinat yang sesuai dari array pixelDataArray
- Menampilkan hasil pencarian dengan visualisasi warna

Validasi yang diterapkan:
- Input harus berupa angka valid
- Gambar harus sudah diupload
- Koordinat harus dalam range: X (0 hingga width-1), Y (0 hingga height-1)

### 7. Interaksi Hover

Saat kursor diarahkan ke canvas, aplikasi menampilkan informasi pixel secara real-time:

- Menghitung koordinat pixel berdasarkan posisi mouse
- Menampilkan tooltip dengan koordinat dan nilai RGB
- Tooltip mengikuti posisi cursor dengan offset tertentu

## Struktur Code

### Class PixelReader

```
constructor()
  - Inisialisasi elemen DOM
  - Setup canvas context
  - Bind event listeners

handleImageUpload(event)
  - Membaca file yang diupload
  - Memuat gambar ke canvas

readPixels()
  - Ekstraksi data pixel dari canvas
  - Menyimpan data ke array pixelDataArray

displayPixelTable(width, height)
  - Generate HTML table dari data pixel
  - Apply styling berdasarkan brightness
  - Render tabel ke DOM

searchPixelByCoord()
  - Membaca input koordinat X dan Y
  - Validasi input dan range koordinat
  - Mencari pixel dari array berdasarkan koordinat
  - Menampilkan hasil atau error message

showSearchResult(pixel, errorMessage)
  - Render hasil pencarian ke UI
  - Menampilkan success state atau error state

handleCanvasHover(event)
  - Deteksi koordinat pixel dari posisi mouse
  - Tampilkan informasi hover
```

## Teknologi yang Digunakan

- HTML5 Canvas API untuk rendering dan ekstraksi pixel
- JavaScript ES6 Class untuk struktur code
- CSS3 untuk styling dan positioning
- Vite sebagai build tool dan development server

## Fitur Utama

1. Upload gambar dalam format umum (JPG, PNG, GIF, dll)
2. Ekstraksi nilai RGB dari setiap pixel
3. Visualisasi matrix pixel hingga 500x500 pixel
4. Pencarian RGB berdasarkan koordinat X dan Y
5. Sticky header untuk navigasi mudah saat scroll
6. Hover tooltip untuk informasi detail pixel
7. Auto-adjustment warna teks untuk kontras optimal
8. Responsive design dengan scrollable container
9. Validasi input dengan error handling yang informatif

## Limitasi

- Tabel matrix dibatasi hingga 500x500 pixel untuk performa optimal
- Gambar yang sangat besar mungkin membutuhkan waktu loading lebih lama
- Browser harus mendukung HTML5 Canvas API
