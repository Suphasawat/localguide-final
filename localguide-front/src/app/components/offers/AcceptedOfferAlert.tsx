interface AcceptedOfferAlertProps {
  show: boolean;
}

export default function AcceptedOfferAlert({ show }: AcceptedOfferAlertProps) {
  if (!show) return null;

  return (
    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
      ✅ คุณได้ยอมรับข้อเสนอแล้ว สามารถตรวจสอบการจองได้ที่หน้า "การจองทริป"
    </div>
  );
}
