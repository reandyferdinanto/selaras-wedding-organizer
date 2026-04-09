type AuthNoticeProps = {
  enabled: boolean;
  message?: string;
};

export function AuthNotice({ enabled, message }: AuthNoticeProps) {
  if (!message && enabled) {
    return null;
  }

  return (
    <div className="neo-panel-inset mt-5 p-4 text-sm leading-7 text-slate-600">
      {message ||
        "Beberapa bagian masih dalam tahap penyiapan, tetapi alur utama aplikasi sudah bisa dilihat."}
    </div>
  );
}
