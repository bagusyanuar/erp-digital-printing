# Planning: Fitur Share Nota ke WhatsApp (Metode Auto-Copy to Clipboard)

## 📌 Latar Belakang
Owner menginginkan fitur untuk membagikan nota (baik nota sementara/estimasi maupun nota lunas) secara langsung ke WhatsApp pelanggan untuk mempermudah operasional kasir (Back-Office). 

## 🛠️ Keputusan Pendekatan (Approach)
Diputuskan menggunakan **Metode Auto-Copy Image ke Clipboard**.
Mengingat aplikasi ERP berjalan di browser Desktop PC (di mana `navigator.share` dengan file tidak didukung secara native), metode ini adalah jalan tengah terbaik agar kasir tidak perlu mengunduh (download) file gambar secara manual yang pada akhirnya akan menumpuk di folder Downloads PC.

## 🔄 Alur Penggunaan (User Flow)
1. Di halaman `InvoicePage` (atau dialog Detail Rincian Belanja), terdapat tombol aksi baru: **"Bagikan ke WA"**.
2. Kasir menekan tombol tersebut.
3. Sistem secara otomatis bekerja di *background*:
   - Mengambil (capture) tampilan struk/nota HTML ke dalam bentuk canvas.
   - Mengubah canvas tersebut menjadi blob bertipe `image/png`.
   - Menggunakan `navigator.clipboard.write()` untuk menyalin gambar tersebut ke Clipboard sistem operasi.
4. Sistem memunculkan sebuah **Dialog "Menunggu Pengiriman WA"** yang *standby* di layar ERP. Dialog ini berisi instruksi paste dan tombol "Salin Ulang Gambar" sebagai *fallback* (jaga-jaga jika kasir melakukan *copy* teks lain sebelum sempat *paste* di WA).
5. Secara bersamaan, sistem otomatis membuka tab/jendela baru mengarah ke `https://wa.me/628XXXXXXXXX?text=[Pesan_Pengantar_Otomatis]`.
6. Tab WhatsApp Web/Desktop akan terbuka ke obrolan nomor pelanggan tersebut.
7. Kasir hanya perlu mengklik area *input chat* di WA, lalu menekan **Ctrl + V** (atau Cmd + V).
8. Gambar nota akan langsung menempel/attach, dan kasir tinggal klik **Kirim**.
9. Setelah selesai, kasir kembali ke tab ERP dan menutup dialog *standby* tadi.

## 💻 Kebutuhan Teknis (Technical Requirements)
1. **Library Capture DOM**: Membutuhkan *library* untuk mengubah HTML ke Image. 
   - **Rekomendasi**: `html2canvas` atau `html-to-image` (lebih modern).
2. **Secure Context (HTTPS)**: API `navigator.clipboard.write` (khususnya untuk *binary data* seperti blob gambar) sangat ketat dan mewajibkan aplikasi berjalan di lingkungan yang aman (*secure context*), yaitu `https://` atau `http://localhost`.
3. **Data Nomor HP**: Pastikan entitas `Invoice` atau `Customer` yang dipanggil memuat data nomor HP pelanggan. Jika nomor kosong, sistem bisa mengarahkan fallback ke `https://web.whatsapp.com` agar kasir bisa mencari kontaknya secara manual.
4. **Dialog Standby / Recopy**: Perlu dibuat satu komponen modal/dialog (misal: `DialogShareWhatsApp`) yang akan tetap terbuka di layar ERP saat proses bagikan berjalan.

## 📝 Langkah Implementasi
1. Instal dependensi: `pnpm add html2canvas` (atau library sejenis).
2. Siapkan komponen UI HTML struk yang akan difoto. Bisa berupa komponen yang terlihat di layar, atau komponen tersembunyi (*off-screen rendering*) jika ingin rasio gambarnya spesifik (misal struk thermal memanjang).
3. Buat *custom hook* atau fungsi *helper* `copyInvoiceToClipboard(elementRef)` yang menangani proses *rendering* dan penyalinan *blob image* ke *ClipboardItem*.
4. Buat komponen `DialogShareWhatsApp` yang menampilkan instruksi *paste* (Ctrl+V) dan menyediakan tombol "Salin Ulang Gambar". Tombol ini akan memanggil ulang helper di langkah 3.
5. Pasangkan alur di `InvoicePage.tsx`: saat klik "Share WA" -> lakukan *copy image* ke clipboard -> buka `DialogShareWhatsApp` -> buka tab baru via `window.open('https://wa.me/...')`.
