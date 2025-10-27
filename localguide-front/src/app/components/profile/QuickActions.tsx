interface QuickActionsProps {
  userRole: number;
  onChangePassword: () => void;
  onBecomeGuide: () => void;
  onManageOffers: () => void;
}

export default function QuickActions({
  userRole,
  onChangePassword,
  onBecomeGuide,
  onManageOffers,
}: QuickActionsProps) {
  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h4 className="text-md font-semibold text-gray-900 mb-4">การดำเนินการ</h4>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onChangePassword}
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
        >
          เปลี่ยนรหัสผ่าน
        </button>

        {userRole === 1 && (
          <button
            onClick={onBecomeGuide}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            สมัครเป็นไกด์
          </button>
        )}

        {userRole === 2 && (
          <button
            onClick={onManageOffers}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            จัดการข้อเสนอ
          </button>
        )}
      </div>
    </div>
  );
}
