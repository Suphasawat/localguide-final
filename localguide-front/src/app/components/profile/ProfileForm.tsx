interface UserProfile {
  FirstName: string;
  LastName: string;
  Nickname: string;
  BirthDate: string;
  Phone: string;
  Nationality: string;
  Sex: string;
  AuthUser: {
    Email: string;
  };
}

interface FormData {
  firstName: string;
  lastName: string;
  nickname: string;
  birthDate: string;
  phone: string;
  nationality: string;
  sex: string;
}

interface ProfileFormProps {
  profile: UserProfile;
  editing: boolean;
  saving: boolean;
  formData: FormData;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}

export default function ProfileForm({
  profile,
  editing,
  saving,
  formData,
  onEdit,
  onCancel,
  onSave,
  onChange,
}: ProfileFormProps) {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">ข้อมูลส่วนตัว</h3>
        {!editing ? (
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          >
            แก้ไขข้อมูล
          </button>
        ) : (
          <div className="space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ชื่อจริง
          </label>
          {editing ? (
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="กรอกชื่อจริง"
            />
          ) : (
            <p className="py-2 text-gray-900">{profile.FirstName || "-"}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            นามสกุล
          </label>
          {editing ? (
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="กรอกนามสกุล"
            />
          ) : (
            <p className="py-2 text-gray-900">{profile.LastName || "-"}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ชื่อเล่น
          </label>
          {editing ? (
            <input
              type="text"
              name="nickname"
              value={formData.nickname}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="กรอกชื่อเล่น"
            />
          ) : (
            <p className="py-2 text-gray-900">{profile.Nickname || "-"}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            วันเกิด
          </label>
          {editing ? (
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          ) : (
            <p className="py-2 text-gray-900">
              {profile.BirthDate
                ? new Date(profile.BirthDate).toLocaleDateString("th-TH")
                : "-"}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            เบอร์โทรศัพท์
          </label>
          {editing ? (
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="กรอกเบอร์โทรศัพท์"
            />
          ) : (
            <p className="py-2 text-gray-900">{profile.Phone || "-"}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            สัญชาติ
          </label>
          {editing ? (
            <input
              type="text"
              name="nationality"
              value={formData.nationality}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="กรอกสัญชาติ"
            />
          ) : (
            <p className="py-2 text-gray-900">{profile.Nationality || "-"}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            เพศ
          </label>
          {editing ? (
            <select
              name="sex"
              value={formData.sex}
              onChange={onChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">เลือกเพศ</option>
              <option value="Male">ชาย</option>
              <option value="Female">หญิง</option>
              <option value="Other">อื่นๆ</option>
            </select>
          ) : (
            <p className="py-2 text-gray-900">
              {profile.Sex === "Male"
                ? "ชาย"
                : profile.Sex === "Female"
                ? "หญิง"
                : profile.Sex === "Other"
                ? "อื่นๆ"
                : "-"}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            อีเมล
          </label>
          <p className="py-2 text-gray-900">{profile.AuthUser?.Email || "-"}</p>
          <p className="text-xs text-gray-500">ไม่สามารถแก้ไขอีเมลได้</p>
        </div>
      </div>
    </div>
  );
}
