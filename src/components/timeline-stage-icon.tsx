import type { TimelineStageLabel } from "@/lib/timeline-guide";

function IconPertemuanKeluarga({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Table */}
      <rect x="10" y="28" width="44" height="4" rx="2" fill="currentColor" opacity="0.18" />
      <rect x="14" y="32" width="3" height="10" rx="1.5" fill="currentColor" opacity="0.14" />
      <rect x="47" y="32" width="3" height="10" rx="1.5" fill="currentColor" opacity="0.14" />
      {/* Person left */}
      <circle cx="15" cy="17" r="5" fill="currentColor" opacity="0.28" />
      <path d="M8 28c0-3.866 3.134-7 7-7s7 3.134 7 7" fill="currentColor" opacity="0.18" />
      {/* Person center */}
      <circle cx="32" cy="14" r="6" fill="currentColor" opacity="0.55" />
      <path d="M23 27c0-4.971 4.029-9 9-9s9 4.029 9 9" fill="currentColor" opacity="0.38" />
      {/* Person right */}
      <circle cx="49" cy="17" r="5" fill="currentColor" opacity="0.28" />
      <path d="M42 28c0-3.866 3.134-7 7-7s7 3.134 7 7" fill="currentColor" opacity="0.18" />
      {/* Chat bubbles above */}
      <ellipse cx="22" cy="6" rx="5" ry="3.5" fill="currentColor" opacity="0.18" />
      <polygon points="22,9.5 20,12.5 24,9.5" fill="currentColor" opacity="0.18" />
      <ellipse cx="44" cy="6" rx="5" ry="3.5" fill="currentColor" opacity="0.18" />
      <polygon points="44,9.5 42,12.5 46,9.5" fill="currentColor" opacity="0.18" />
    </svg>
  );
}

function IconLamaran({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Ring band */}
      <circle cx="32" cy="38" r="16" stroke="currentColor" strokeWidth="4" opacity="0.32" />
      <circle cx="32" cy="38" r="16" stroke="currentColor" strokeWidth="2" opacity="0.18" fill="none" />
      {/* Diamond gem */}
      <polygon points="32,10 24,20 32,25 40,20" fill="currentColor" opacity="0.52" />
      <polygon points="32,10 24,20 32,25" fill="currentColor" opacity="0.72" />
      <polygon points="32,32 24,20 32,25" fill="currentColor" opacity="0.22" />
      <polygon points="32,32 40,20 32,25" fill="currentColor" opacity="0.38" />
      {/* Setting mount */}
      <path d="M27 24 Q32 28 37 24" stroke="currentColor" strokeWidth="2" opacity="0.42" fill="none" />
      {/* Sparkles */}
      <line x1="50" y1="14" x2="50" y2="20" stroke="currentColor" strokeWidth="2" opacity="0.28" strokeLinecap="round" />
      <line x1="47" y1="17" x2="53" y2="17" stroke="currentColor" strokeWidth="2" opacity="0.28" strokeLinecap="round" />
      <line x1="16" y1="18" x2="16" y2="22" stroke="currentColor" strokeWidth="1.5" opacity="0.22" strokeLinecap="round" />
      <line x1="14" y1="20" x2="18" y2="20" stroke="currentColor" strokeWidth="1.5" opacity="0.22" strokeLinecap="round" />
    </svg>
  );
}

function IconPengajianSiraman({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Water pour / bowl */}
      <ellipse cx="32" cy="46" rx="18" ry="6" fill="currentColor" opacity="0.18" />
      <path d="M14 46 Q16 56 32 56 Q48 56 50 46" fill="currentColor" opacity="0.14" />
      {/* Water drops falling */}
      <ellipse cx="26" cy="30" rx="3" ry="5" fill="currentColor" opacity="0.38" />
      <ellipse cx="32" cy="22" rx="3.5" ry="6" fill="currentColor" opacity="0.55" />
      <ellipse cx="38" cy="30" rx="3" ry="5" fill="currentColor" opacity="0.38" />
      {/* Flower / kembang head */}
      <circle cx="32" cy="12" r="6" fill="currentColor" opacity="0.28" />
      <ellipse cx="24" cy="10" rx="4" ry="5" fill="currentColor" opacity="0.22" transform="rotate(-30 24 10)" />
      <ellipse cx="40" cy="10" rx="4" ry="5" fill="currentColor" opacity="0.22" transform="rotate(30 40 10)" />
      <ellipse cx="32" cy="4" rx="4" ry="5" fill="currentColor" opacity="0.22" />
      <circle cx="32" cy="12" r="4" fill="currentColor" opacity="0.45" />
      {/* Ripple in bowl */}
      <ellipse cx="32" cy="46" rx="8" ry="2.5" stroke="currentColor" strokeWidth="1.5" opacity="0.25" fill="none" />
      <ellipse cx="32" cy="46" rx="13" ry="4" stroke="currentColor" strokeWidth="1" opacity="0.14" fill="none" />
    </svg>
  );
}

function IconAkadNikah({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Mosque dome */}
      <path d="M20 32 Q20 16 32 16 Q44 16 44 32" fill="currentColor" opacity="0.28" />
      {/* Minaret left */}
      <rect x="12" y="20" width="6" height="18" rx="2" fill="currentColor" opacity="0.18" />
      <path d="M12 20 Q15 14 18 20" fill="currentColor" opacity="0.28" />
      {/* Minaret right */}
      <rect x="46" y="20" width="6" height="18" rx="2" fill="currentColor" opacity="0.18" />
      <path d="M46 20 Q49 14 52 20" fill="currentColor" opacity="0.28" />
      {/* Main base */}
      <rect x="10" y="32" width="44" height="5" rx="2" fill="currentColor" opacity="0.22" />
      {/* Crescent and star on dome */}
      <path d="M30 20 Q28 24 32 26 Q29 24.5 27 26 Q31 23 30 20Z" fill="currentColor" opacity="0.55" />
      <circle cx="36" cy="20" r="1.5" fill="currentColor" opacity="0.55" />
      {/* Joined hands / ijab kabul */}
      <path d="M18 44 Q24 40 32 42 Q40 40 46 44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.38" fill="none" />
      <path d="M22 44 Q28 48 32 46 Q36 48 42 44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.28" fill="none" />
    </svg>
  );
}

function IconResepsi({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Venue arch */}
      <path d="M14 48 Q14 22 32 22 Q50 22 50 48" fill="currentColor" opacity="0.14" />
      <path d="M14 48 Q14 22 32 22 Q50 22 50 48" stroke="currentColor" strokeWidth="2.5" opacity="0.28" fill="none" />
      {/* Hanging lights */}
      <line x1="22" y1="22" x2="22" y2="30" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <circle cx="22" cy="31" r="2" fill="currentColor" opacity="0.38" />
      <line x1="32" y1="22" x2="32" y2="26" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <circle cx="32" cy="27" r="2.5" fill="currentColor" opacity="0.55" />
      <line x1="42" y1="22" x2="42" y2="30" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      <circle cx="42" cy="31" r="2" fill="currentColor" opacity="0.38" />
      {/* Flower left */}
      <circle cx="18" cy="44" r="6" fill="currentColor" opacity="0.18" />
      <ellipse cx="18" cy="37" rx="3" ry="4" fill="currentColor" opacity="0.22" />
      <ellipse cx="12" cy="42" rx="3" ry="4" fill="currentColor" opacity="0.22" transform="rotate(-60 12 42)" />
      <ellipse cx="24" cy="42" rx="3" ry="4" fill="currentColor" opacity="0.22" transform="rotate(60 24 42)" />
      <circle cx="18" cy="44" r="3.5" fill="currentColor" opacity="0.42" />
      {/* Flower right */}
      <circle cx="46" cy="44" r="6" fill="currentColor" opacity="0.18" />
      <ellipse cx="46" cy="37" rx="3" ry="4" fill="currentColor" opacity="0.22" />
      <ellipse cx="40" cy="42" rx="3" ry="4" fill="currentColor" opacity="0.22" transform="rotate(-60 40 42)" />
      <ellipse cx="52" cy="42" rx="3" ry="4" fill="currentColor" opacity="0.22" transform="rotate(60 52 42)" />
      <circle cx="46" cy="44" r="3.5" fill="currentColor" opacity="0.42" />
      {/* Couple silhouettes */}
      <circle cx="29" cy="36" r="4" fill="currentColor" opacity="0.45" />
      <circle cx="35" cy="36" r="4" fill="currentColor" opacity="0.45" />
      <path d="M24 48 Q26 40 32 40 Q38 40 40 48" fill="currentColor" opacity="0.28" />
    </svg>
  );
}

function IconUnduhMantu({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* House roof */}
      <polygon points="8,30 32,10 56,30" fill="currentColor" opacity="0.28" />
      <polygon points="8,30 32,10 56,30" stroke="currentColor" strokeWidth="2" opacity="0.18" fill="none" />
      {/* House body */}
      <rect x="12" y="30" width="40" height="24" rx="3" fill="currentColor" opacity="0.18" />
      {/* Door */}
      <rect x="26" y="40" width="12" height="14" rx="2" fill="currentColor" opacity="0.32" />
      <circle cx="35" cy="47" r="1" fill="currentColor" opacity="0.55" />
      {/* Windows */}
      <rect x="15" y="34" width="8" height="7" rx="1.5" fill="currentColor" opacity="0.28" />
      <rect x="41" y="34" width="8" height="7" rx="1.5" fill="currentColor" opacity="0.28" />
      {/* Chimney */}
      <rect x="42" y="14" width="5" height="10" rx="1.5" fill="currentColor" opacity="0.22" />
      {/* Smoke puffs */}
      <circle cx="44" cy="11" r="2.5" fill="currentColor" opacity="0.14" />
      <circle cx="47" cy="8" r="2" fill="currentColor" opacity="0.10" />
      {/* Path to house */}
      <path d="M26 54 Q32 57 38 54" stroke="currentColor" strokeWidth="2" opacity="0.22" strokeLinecap="round" fill="none" />
      {/* Heart above */}
      <path d="M30 6 Q31 4 32 6 Q33 4 34 6 Q34 9 32 11 Q30 9 30 6Z" fill="currentColor" opacity="0.45" />
    </svg>
  );
}

const stageIconMap: Record<TimelineStageLabel, (props: { className?: string }) => React.ReactElement> = {
  "Pertemuan keluarga": IconPertemuanKeluarga,
  "Lamaran": IconLamaran,
  "Pengajian / Siraman": IconPengajianSiraman,
  "Akad nikah": IconAkadNikah,
  "Resepsi": IconResepsi,
  "Unduh mantu / acara lanjutan": IconUnduhMantu,
};

export function TimelineStageIcon({
  label,
  state,
  className,
}: {
  label: TimelineStageLabel;
  state: "done" | "current" | "upcoming";
  className?: string;
}) {
  const Icon = stageIconMap[label];
  if (!Icon) return null;
  return (
    <span
      className={[
        "timeline-stage-icon",
        `is-${state}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    >
      <Icon />
    </span>
  );
}
