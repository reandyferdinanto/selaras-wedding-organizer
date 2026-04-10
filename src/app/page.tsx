import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  FileText,
  HeartHandshake,
  Users,
  WalletCards,
} from "lucide-react";

const supportItems = [
  {
    title: "Acara utama",
    description: "Tanggal, venue, konsep, dan jumlah tamu jadi dasar kerja yang langsung terbaca.",
    icon: CalendarDays,
  },
  {
    title: "Koordinasi keluarga",
    description: "Timeline, tamu, dan dokumen tetap nyambung dari satu dashboard yang sama.",
    icon: Users,
  },
  {
    title: "Keputusan vendor",
    description: "Budget, paket, dan pembayaran penting tidak tercecer di percakapan yang berbeda.",
    icon: WalletCards,
  },
];

const steps = [
  "Isi data acara",
  "Susun timeline",
  "Lengkapi tamu, vendor, budget, dan dokumen",
];

const heroFrames = [
  {
    src: "/mobile-1.png",
    alt: "Preview mobile workspace pernikahan Selaras Planner",
    className: "is-primary theme-light",
  },
  {
    src: "/date-example.png",
    alt: "Preview elemen tanggal yang lembut untuk pengalaman perencanaan",
    className: "is-secondary theme-light",
  },
  {
    src: "/neo-example.png",
    alt: "Preview panel antarmuka terang dengan nuansa lembut",
    className: "is-tertiary theme-light",
  },
  {
    src: "/langkah-1-preview.png",
    alt: "Preview pengisian data acara di Selaras Planner",
    className: "is-primary theme-dark",
  },
  {
    src: "/ringkasan-timeline.png",
    alt: "Preview ringkasan timeline pernikahan di dashboard",
    className: "is-secondary theme-dark",
  },
  {
    src: "/vendor-illustration.png",
    alt: "Preview pengelolaan vendor pada workspace pernikahan",
    className: "is-tertiary theme-dark",
  },
];

const proofPanels = [
  {
    label: "Satu ritme kerja",
    title: "Mulai dari data acara, lalu semua langkah mengikuti arah yang sama.",
    body: "Begitu fondasi acara terisi, dashboard menahan konteks inti agar keputusan keluarga, vendor, dan dokumen tetap selaras.",
    image: "/acara-utama.png",
    alt: "Tampilan data acara utama pada dashboard Selaras Planner",
  },
  {
    label: "Motion picture",
    title: "Perubahan terasa hidup, bukan daftar isian yang diam.",
    body: "Preview layar bergerak pelan untuk menunjukkan progres, perpindahan fokus, dan bagian yang siap dilanjutkan tanpa membuat halaman terasa berat.",
    image: "/mobile-1.png",
    alt: "Tampilan mobile dashboard Selaras Planner",
  },
];

export default function Home() {
  return (
    <main className="home-page">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero-copy">
          <span className="neo-badge">
            <HeartHandshake size={14} />
            Selaras Planner
          </span>
          <p className="home-section-label">Workspace pernikahan</p>
          <h1 id="home-hero-title">Rencana pernikahan yang rapi dalam satu tempat.</h1>
          <p>
            Atur acara, keluarga, vendor, tamu, budget, dan dokumen tanpa spreadsheet yang terpencar. Semua progres tetap terlihat, bergerak, dan mudah dilanjutkan.
          </p>
          <div className="home-hero-actions">
            <Link href="/register" className="neo-button-primary">
              Mulai project
              <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="neo-button-secondary">
              Masuk
            </Link>
          </div>

          <div className="home-hero-points" aria-label="Keunggulan utama Selaras Planner">
            {supportItems.map(({ title, icon: Icon }) => (
              <div key={title} className="home-hero-point">
                <span className="home-support-icon">
                  <Icon size={18} />
                </span>
                <span>{title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="home-visual-plane" aria-hidden="true">
          <div className="home-motion-stage">
            <div className="home-motion-screen">
              {heroFrames.map((frame, index) => (
                <figure key={frame.src} className={`home-motion-frame ${frame.className} is-frame-${index + 1}`}>
                  <Image src={frame.src} alt={frame.alt} fill sizes="(max-width: 1024px) 90vw, 42vw" priority={index === 0} />
                </figure>
              ))}
            </div>

            <div className="home-motion-ribbon is-top">
              <span>Data acara siap dibaca</span>
              <span>Timeline tetap terarah</span>
              <span>Vendor lebih cepat diputuskan</span>
            </div>
            <div className="home-motion-ribbon is-bottom">
              <span>Ringkasan bergerak</span>
              <span>Progress selalu terlihat</span>
              <span>Lanjutkan kapan saja</span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-support" aria-labelledby="home-support-title">
        <div>
          <div className="home-section-label">Yang disusun</div>
          <h2 id="home-support-title">Semua bagian penting tetap terlihat.</h2>
        </div>
        <div className="home-support-list">
          {supportItems.map(({ title, description, icon: Icon }) => (
            <article key={title} className="home-support-item">
              <span className="home-support-icon">
                <Icon size={18} />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-proof" aria-labelledby="home-proof-title">
        <div>
          <div className="home-section-label">Tampilan depan</div>
          <h2 id="home-proof-title">Halaman utama yang terasa hidup sejak layar pertama.</h2>
        </div>
        <div className="home-proof-grid">
          {proofPanels.map((panel) => (
            <article key={panel.title} className="home-proof-band">
              <div className="home-proof-copy">
                <p className="home-proof-label">{panel.label}</p>
                <h3>{panel.title}</h3>
                <p>{panel.body}</p>
              </div>
              <div className="home-proof-media">
                <Image src={panel.image} alt={panel.alt} fill sizes="(max-width: 1024px) 100vw, 44vw" />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-flow" aria-labelledby="home-flow-title">
        <div>
          <div className="home-section-label">Alur awal</div>
          <h2 id="home-flow-title">Mulai dari yang paling menentukan.</h2>
          <p>
            Isi bertahap. Dashboard akan menandai bagian yang belum diisi, sedang disusun, dan selesai tanpa membuat Anda kehilangan konteks.
          </p>
        </div>
        <ol className="home-flow-list">
          {steps.map((step, index) => (
            <li key={step}>
              <span>{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="home-final">
        <span className="home-support-icon">
          <FileText size={18} />
        </span>
        <div>
          <div className="home-section-label">Siap dipakai</div>
          <h2>Bangun rencana acara yang bisa dilanjutkan kapan saja.</h2>
        </div>
        <Link href="/register" className="neo-button-primary">
          Buat workspace
          <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}
