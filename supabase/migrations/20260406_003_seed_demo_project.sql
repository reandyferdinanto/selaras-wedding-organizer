insert into public.projects (
  owner_user_id,
  bride_name,
  groom_name,
  wedding_date,
  city,
  venue,
  guest_count,
  template,
  concept,
  phase_plan,
  moments,
  next_steps,
  vendor_plan,
  guest_plan,
  budget_plan,
  document_plan
)
select
  u.id,
  'Maulidina',
  'Nashir',
  date '2026-07-25',
  'Medan',
  'Jambur Jawata',
  400,
  'Internasional',
  'Intimate wedding bernuansa hangat dengan akad pagi, resepsi malam, dan alur keluarga inti yang ringkas agar tamu merasa dekat dan nyaman.',
  $$
{"planningWindow":"Resepsi","stageFocus":"Resepsi malam intimate dengan keluarga besar dan teman dekat setelah akad pagi selesai.","mainMoments":"Jambur Jawata, Sabtu 25 Juli 2026, open gate 18.00 WIB dan prosesi masuk keluarga inti 19.00 WIB.","familyFlow":"Catering keluarga, dekorasi ballroom, dokumentasi, live music akustik, MC, penerima tamu, dan liaison keluarga inti.","nextPriority":"Finalisasi seating keluarga, rundown MC, dan konfirmasi jumlah tamu H-7."}
  $$,
  $$
Akad pagi | 08.00 WIB | Keluarga inti dan saksi hadir lebih awal untuk briefing singkat.
Resepsi malam | 18.30 WIB | Open gate, sambutan keluarga, makan malam, lalu sesi foto bersama.
  $$,
  'Finalisasi rundown MC dan briefing penerima tamu satu minggu sebelum acara.',
  $$
{"venueStatus":"Jambur Jawata sudah dipilih sebagai venue utama. Layout ballroom dan area penerima tamu tinggal finalisasi bersama dekorasi.","cateringStatus":"Menu buffet Nusantara dan stall ringan sedang difinalkan. Testing rasa terakhir dijadwalkan dua minggu sebelum acara.","documentationStatus":"Vendor foto dan video sudah shortlist dua kandidat. Fokus utama pada dokumentasi candid keluarga dan highlight video singkat.","coordinatorNeed":"Butuh satu PIC keluarga dan satu koordinator lapangan untuk jembatan vendor, keluarga inti, dan MC saat hari H.","paymentPlan":"DP venue sudah berjalan. Pembayaran catering, dekorasi, dan dokumentasi dibagi menjadi termin DP, pelunasan H-7, dan closing pasca acara."}
  $$,
  $$
{"guestGroups":"Daftar tamu dibagi ke keluarga besar mempelai wanita, keluarga besar mempelai pria, teman dekat, kolega, dan tamu orang tua.","invitationChannel":"Undangan digital dan kartu cetak untuk keluarga inti","rsvpOwner":"RSVP dipegang oleh Dina dan satu PIC keluarga agar update jumlah tamu harian tetap terpantau.","familySeating":"Meja keluarga inti diletakkan paling dekat panggung dengan jalur masuk yang mudah untuk sesi foto dan salam keluarga.","hospitalityNotes":"Siapkan dua penerima tamu utama, satu meja registrasi, dan penanda meja keluarga agar alur masuk tetap rapi."}
  $$,
  $$
{"totalRange":"Rp180 juta - Rp220 juta","biggestExpense":"Biaya terbesar saat ini diperkirakan ada di venue, catering, dan dekorasi ballroom.","paymentStrategy":"Pembayaran dibagi bertahap sesuai milestone vendor agar arus kas keluarga tetap aman menjelang hari acara.","reserveFund":"Sisihkan 8-10% dari total budget untuk kebutuhan mendadak seperti penambahan tamu atau perubahan teknis venue.","budgetControl":"Setiap perubahan vendor atau penambahan kebutuhan harus dicatat di satu ringkasan anggaran mingguan."}
  $$,
  $$
{"legalChecklist":"KTP, KK, surat numpang nikah bila diperlukan, dan berkas KUA/rumah ibadah disusun dalam satu map utama.","familyDocuments":"Data keluarga inti, kontak darurat, dan susunan perwakilan keluarga disimpan dalam catatan bersama.","vendorContracts":"Semua quotation, invoice, dan kontrak vendor disimpan dalam folder cloud dan satu map cetak.","paymentProofs":"Bukti transfer venue, catering, dan dekorasi diarsipkan per vendor agar mudah dicek saat pelunasan.","finalArchive":"Setelah acara, dokumentasi akhir, invoice lunas, dan daftar ucapan terima kasih akan disatukan dalam arsip proyek."}
  $$
from auth.users u
where lower(u.email) = 'demo@selaras.app'
on conflict (owner_user_id)
do update set
  bride_name = excluded.bride_name,
  groom_name = excluded.groom_name,
  wedding_date = excluded.wedding_date,
  city = excluded.city,
  venue = excluded.venue,
  guest_count = excluded.guest_count,
  template = excluded.template,
  concept = excluded.concept,
  phase_plan = excluded.phase_plan,
  moments = excluded.moments,
  next_steps = excluded.next_steps,
  vendor_plan = excluded.vendor_plan,
  guest_plan = excluded.guest_plan,
  budget_plan = excluded.budget_plan,
  document_plan = excluded.document_plan,
  updated_at = timezone('utc', now());
