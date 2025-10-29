import { Province, CreateTripRequireData } from "@/app/types";

interface TripRequireFormProps {
  formData: CreateTripRequireData;
  provinces: Province[];
  loading: boolean;
  error?: string;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onCancel: () => void;
  submitButtonText: string;
  isPriceInvalid: boolean;
  isDateRangeInvalid: boolean;
}

export default function TripRequireForm({
  formData,
  provinces,
  loading,
  error,
  onSubmit,
  onChange,
  onCancel,
  submitButtonText,
  isPriceInvalid,
  isDateRangeInvalid,

}: TripRequireFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-7">
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <p className="mb-2 text-sm font-extrabold text-gray-900">หัวข้อ *</p>
        <input
          type="text"
          name="title"
          required
          className="w-full h-12 rounded-full border-2 border-gray-300 px-5 text-[15px] placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          placeholder="เช่น หาไกด์เที่ยวแม่ฮ่องสอน 3 วัน 2 คืน"
          value={formData.title}
          onChange={onChange}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-extrabold text-gray-900">
          รายละเอียด *
        </p>
        <textarea
          name="description"
          required
          rows={4}
          className="w-full rounded-2xl border-2 border-gray-300 px-5 py-4 text-[15px] placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          placeholder="อธิบายรายละเอียดการเที่ยวที่ต้องการ"
          value={formData.description}
          onChange={onChange}
        />
      </div>

      <div>
        <p className="mb-2 text-sm font-extrabold text-gray-900">จังหวัด *</p>
        <select
          name="province_id"
          required
          className="w-full h-12 rounded-full border-2 border-gray-300 px-5 text-[15px] focus:outline-none focus:ring-0 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          value={formData.province_id}
          onChange={onChange}
        >
          <option value={0}>เลือกจังหวัด</option>
          {provinces.map((p) => (
            <option key={p.ID} value={p.ID}>
              {p.Name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <p className="mb-2 text-sm font-extrabold text-gray-900">
            ราคาต่ำสุด (บาท) *
          </p>
          <input
            type="number"
            name="min_price"
            required
            min={0}
            step={100}
            className="w-full h-12 rounded-full border-2 border-gray-300 px-5 text-[15px] focus:outline-none focus:ring-0 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            value={formData.min_price}
            onChange={onChange}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-extrabold text-gray-900">
            ราคาสูงสุด (บาท) *
          </p>
          <input
            type="number"
            name="max_price"
            required
            min={0}
            step={100}
            className="w-full h-12 rounded-full border-2 border-gray-300 px-5 text-[15px] focus:outline-none focus:ring-0 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            value={formData.max_price}
            onChange={onChange}
          />
          {isPriceInvalid && (
            <p className="mt-1 text-xs text-red-600">
              ราคาสูงสุดต้องมากกว่าราคาต่ำสุด
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <p className="mb-2 text-sm font-extrabold text-gray-900">
            วันเริ่มต้น *
          </p>
          <input
            type="date"
            name="start_date"
            required
            className="w-full h-12 rounded-full border-2 border-gray-300 px-5 text-[15px] focus:outline-none focus:ring-0 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            value={formData.start_date}
            onChange={onChange}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-extrabold text-gray-900">
            วันสิ้นสุด *
          </p>
          <input
            type="date"
            name="end_date"
            required
            min={formData.start_date || undefined}
            className="w-full h-12 rounded-full border-2 border-gray-300 px-5 text-[15px] focus:outline-none focus:ring-0 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            value={formData.end_date}
            onChange={onChange}
          />
          {isDateRangeInvalid && (
            <p className="mt-1 text-xs text-red-600">
              วันสิ้นสุดต้องไม่เร็วกว่าวันเริ่มต้น
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <p className="mb-2 text-sm font-extrabold text-gray-900">
            จำนวนวัน *
          </p>
          <input
            type="number"
            name="days"
            readOnly
            aria-readonly="true"
            min={1}
            className="w-full h-12 rounded-full border-2 border-gray-200 bg-gray-100 px-5 text-[15px] text-gray-700 cursor-not-allowed focus:outline-none"
            value={formData.days}
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-extrabold text-gray-900">จำนวนคน *</p>
          <input
            type="number"
            name="group_size"
            required
            min={1}
            className="w-full h-12 rounded-full border-2 border-gray-300 px-5 text-[15px] focus:outline-none focus:ring-0 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            value={formData.group_size}
            onChange={onChange}
          />
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-extrabold text-gray-900">
          คะแนนไกด์ขั้นต่ำ
        </p>
        <select
          name="min_rating"
          className="w-full h-12 rounded-full border-2 border-gray-300 px-5 text-[15px] focus:outline-none focus:ring-0 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          value={formData.min_rating}
          onChange={onChange}
        >
          <option value={0}>ไม่กำหนด</option>
          <option value={3}>3 ดาวขึ้นไป</option>
          <option value={4}>4 ดาวขึ้นไป</option>
          <option value={4.5}>4.5 ดาวขึ้นไป</option>
        </select>
      </div>

      <div>
        <p className="mb-2 text-sm font-extrabold text-gray-900">
          ความต้องการพิเศษ
        </p>
        <textarea
          name="requirements"
          rows={3}
          className="w-full rounded-2xl border-2 border-gray-300 px-5 py-4 text-[15px] placeholder-gray-400 focus:outline-none focus:ring-0 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          placeholder="เช่น ต้องการไกด์พูดภาษาอังกฤษได้, มีรถรับส่ง"
          value={formData.requirements}
          onChange={onChange}
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={
            loading ||
            isPriceInvalid ||
            isDateRangeInvalid ||
            !formData.title ||
            !formData.description ||
            !formData.province_id
          }
          className="flex-1 rounded-full bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "กำลังบันทึก..." : submitButtonText}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border-2 border-gray-300 px-6 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition"
        >
          ยกเลิก
        </button>
      </div>
    </form>
  );
}
