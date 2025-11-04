interface EmptyOffersStateProps {
  hasOffers: boolean;
}

export default function EmptyOffersState({ hasOffers }: EmptyOffersStateProps) {
  if (hasOffers) return null;

  return (
    <div className="text-center py-12 bg-white rounded-lg shadow-md">
      <div className="text-gray-400 text-6xl mb-4">📋</div>
      <p className="text-gray-500 text-lg mb-2">
        ยังไม่มีข้อเสนอสำหรับความต้องการนี้
      </p>
      <p className="text-gray-400">โปรดรอไกด์ส่งข้อเสนอมาให้</p>
    </div>
  );
}
