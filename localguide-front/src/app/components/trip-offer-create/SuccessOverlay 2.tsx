interface SuccessOverlayProps {
  show: boolean;
}

export default function SuccessOverlay({ show }: SuccessOverlayProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 w-[92%] max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-center h-14 w-14 rounded-full bg-emerald-100 mx-auto">
          <div className="h-7 w-7 rounded-full bg-emerald-500" />
        </div>
        <h4 className="mt-4 text-center text-lg font-semibold text-gray-900">
          เสนอราคาเรียบร้อยแล้ว
        </h4>
        <p className="mt-1 text-center text-sm text-gray-600">
          กำลังพาไปยังหน้ารายการข้อเสนอของคุณ...
        </p>
      </div>
    </div>
  );
}
