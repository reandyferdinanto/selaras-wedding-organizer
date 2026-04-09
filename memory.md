# Memory

## Product intent
- App ini adalah wedding planner Indonesia berbasis Next.js App Router dengan fondasi Supabase.
- Arah visual dibuat lembut, rapi, dan nyaman dibaca untuk melihat rencana acara, tugas, dan anggaran dalam waktu lama.
- Dashboard harus terasa sistematis dan user friendly: user cukup mengikuti langkah demi langkah tanpa bingung harus mulai dari mana.

## Current implementation
- Landing page pre-login sudah menampilkan value utama: timeline, vendor, budget, guest, dan checklist administrasi.
- Halaman `login` dan `register` sudah ada dan memakai alur akun dasar.
- Dashboard sekarang dibagi menjadi menu utama yang sistematis dan setiap fitur punya halaman tersendiri.
- Ringkasan setiap fitur tampil di halaman `/dashboard` agar progres mudah dilihat dalam satu layar.
- Template budaya mencakup opsi `Internasional` sebagai calon template default: susunan modern yang tetap sesuai kebiasaan umum pernikahan di Indonesia.
- Penyimpanan dasar sekarang memakai Supabase Auth user metadata untuk akun aktif, sehingga data planner inti bisa tersimpan tanpa menunggu tabel aplikasi penuh.
- Aplikasi tetap aman saat env belum diisi, jadi alur utama masih bisa ditinjau tanpa error.

## Dashboard feature map
1. `Data acara`: nama pasangan, tanggal, kota, jumlah tamu, template, konsep.
2. `Alur acara`: tahapan persiapan, momen acara, langkah lanjutan.
3. `Vendor`: prioritas vendor dan catatan kebutuhan utama.
4. `Tamu dan RSVP`: pembagian tamu, strategi RSVP, penerima tamu.
5. `Anggaran`: kelompok biaya dan kontrol budget awal.
6. `Dokumen`: berkas legal, kontrak vendor, dan arsip penting.

## Technical decisions
- Framework: Next.js 16 App Router + TypeScript + Tailwind CSS v4.
- Fondasi akun dan penyimpanan disiapkan dengan Supabase.
- Untuk iterasi aman dan bertahap, data planner utama sementara disimpan di `user_metadata.planner` pada akun Supabase aktif.
- Font utama memakai stack sistem yang rapi dan mudah dibaca lintas perangkat.
- Seed data awal tetap diletakkan di `src/lib/wedding-plan.ts` agar mudah dipindah ke tabel aplikasi nanti.
- Styling dipusatkan di `src/app/globals.css` dengan utility class kustom seperti `neo-panel`, `neo-panel-inset`, `neo-input`, `neo-button-*`, dan style dashboard nav.

## Step by step pembangunan fitur
1. Setup project dan styling foundation.
2. Kunci visual system dan typography agar semua page konsisten.
3. Bangun landing page sebelum login berdasarkan riset wedding Indonesia.
4. Tambahkan helper akun dan file `.env.example`.
5. Bangun halaman login dan register.
6. Buat dashboard sesudah login sebagai fondasi tahap persiapan dan rangkaian acara.
7. Verifikasi lint dan build dulu sebelum lanjut ke fitur data.
8. Siapkan data proyek, tahapan acara, daftar tugas, dan pilihan template acara termasuk template `Internasional` sebagai default.
9. Pecah dashboard menjadi menu utama per fitur agar user tinggal mengikuti alurnya.
10. Sambungkan penyimpanan dasar ke Supabase untuk data planner inti.
11. Lengkapi pengaturan template agar pasangan bisa memilih gaya acara umum atau adat tertentu.
12. Lanjutkan ke modul vendor, tamu, anggaran, dan dokumen dengan data yang makin terstruktur.
13. Setelah alur stabil, pindahkan penyimpanan dari metadata ke tabel aplikasi penuh.

## Recommended next build order
- Iterasi 2: tabel `projects`, `project_members`, `phases`, `tasks`.
- Iterasi 3: data template acara, termasuk `Internasional` sebagai default, serta editor rangkaian adat atau custom.
- Iterasi 4: tabel `vendors`, `vendor_quotes`, `contracts`, `payments`.
- Iterasi 5: tabel `guests`, `rsvps`, `invitations`.
- Iterasi 6: tabel `budget_categories`, `budget_items`, `transactions`.
- Iterasi 7: tabel `documents`, `legal_checklists`, `archives`.

## Important files
- `src/app/page.tsx`: landing page pre-login.
- `src/app/dashboard/layout.tsx`: kerangka dashboard dan menu utama.
- `src/app/dashboard/page.tsx`: overview + ringkasan progres fitur.
- `src/app/dashboard/proyek/page.tsx`: data acara utama.
- `src/app/dashboard/timeline/page.tsx`: tahapan acara dan langkah lanjutan.
- `src/app/dashboard/vendor/page.tsx`: vendor utama.
- `src/app/dashboard/tamu/page.tsx`: tamu dan RSVP.
- `src/app/dashboard/anggaran/page.tsx`: anggaran.
- `src/app/dashboard/dokumen/page.tsx`: dokumen penting.
- `src/lib/planner-data.ts`: metadata menu utama dan default planner snapshot.
- `src/lib/planner-store.ts`: baca snapshot planner dari Supabase.
- `src/lib/supabase/actions.ts`: auth + simpan planner ke Supabase.

## Notes for future work
- Jika ingin akun aktif sepenuhnya, isi `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Akun contoh masih cocok untuk demo alur, tetapi belum menyimpan data permanen.
- Saat mulai penyimpanan data penuh, buat perubahan sedikit demi sedikit agar lebih aman dan mudah dites.
- Fokus UX berikutnya: tambah indikator progres per langkah, autosave ringan, dan validasi lintas fitur.

