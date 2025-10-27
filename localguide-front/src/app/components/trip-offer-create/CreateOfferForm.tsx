import React from "react";

interface TripRequire {
  ID: number;
  Title: string;
  Description: string;
  MinPrice: number;
  MaxPrice: number;
  StartDate: string;
  EndDate: string;
  Days: number;
  GroupSize: number;
  Province?: { Name: string };
}

type FormState = {
  title: string;
  description: string;
  itinerary: string;
  includedServices: string;
  excludedServices: string;
  totalPrice: number;
  priceBreakdown: string;
  terms: string;
  paymentTerms: string;
  validUntil: string;
  notes: string;
};

interface CreateOfferFormProps {
  formData: FormState;
  tripRequire: TripRequire;
  todayISO: string;
  maxValidUntilISO: string;
  priceOutOfRange: boolean;
  validUntilTooEarly: boolean;
  validUntilAfterTripStart: boolean;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitting: boolean;
}

export default function CreateOfferForm({
  formData,
  tripRequire,
  todayISO,
  maxValidUntilISO,
  priceOutOfRange,
  validUntilTooEarly,
  validUntilAfterTripStart,
  onChange,
  onSubmit,
  onCancel,
  submitting,
}: CreateOfferFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-6"
    >
      {/* ชื่อแพ็กเกจ */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          ชื่อแพ็กเกจ *
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={onChange}
          required
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      {/* รายละเอียดแพ็กเกจ */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          รายละเอียดแพ็กเกจ *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onChange}
          required
          rows={4}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="อธิบายรายละเอียดที่ลูกค้าจะได้รับ..."
        />
      </div>

      {/* กำหนดการเที่ยว */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          กำหนดการเที่ยว (Itinerary)
        </label>
        <textarea
          name="itinerary"
          value={formData.itinerary}
          onChange={onChange}
          rows={6}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder={`วันที่ 1: ...\nวันที่ 2: ...`}
        />
        <p className="mt-1 text-xs text-gray-500">
          แยกแต่ละวันด้วยการเว้นบรรทัด
        </p>
      </div>

      {/* บริการที่รวม / ไม่รวม */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            บริการที่รวมในแพ็กเกจ
          </label>
          <textarea
            name="includedServices"
            value={formData.includedServices}
            onChange={onChange}
            rows={4}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder={`- รถรับส่ง\n- ค่าน้ำมัน\n- ไกด์นำเที่ยว\n- ประกันภัย ...`}
          />
          <p className="mt-1 text-xs text-gray-500">
            แยกแต่ละบริการด้วยการเว้นบรรทัด
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            บริการที่ไม่รวมในแพ็กเกจ
          </label>
          <textarea
            name="excludedServices"
            value={formData.excludedServices}
            onChange={onChange}
            rows={4}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder={`- ค่าอาหาร\n- ค่าที่พัก\n- ค่าเข้าสถานที่ ...`}
          />
          <p className="mt-1 text-xs text-gray-500">
            แยกแต่ละบริการด้วยการเว้นบรรทัด
          </p>
        </div>
      </div>

      {/* ราคา + วันที่มีผล */}
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            ราคารวม (บาท) *
          </label>
          {tripRequire && (
            <p className="mb-1 text-xs text-gray-500">
              งบประมาณที่ลูกค้าต้องการ: {tripRequire.MinPrice.toLocaleString()}{" "}
              - {tripRequire.MaxPrice.toLocaleString()} บาท
            </p>
          )}
          <input
            type="number"
            name="totalPrice"
            value={formData.totalPrice}
            onChange={onChange}
            required
            className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              priceOutOfRange
                ? "border-rose-300 focus:ring-rose-200"
                : "border-gray-300 focus:border-emerald-500 focus:ring-emerald-200"
            }`}
          />
          {priceOutOfRange && (
            <p className="mt-1 text-xs text-rose-600">
              ราคารวมต้องอยู่ในช่วงงบประมาณของลูกค้า
            </p>
          )}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            ข้อเสนอมีผลถึง *
          </label>
          <input
            type="date"
            name="validUntil"
            value={formData.validUntil}
            min={todayISO}
            max={maxValidUntilISO || undefined}
            onChange={onChange}
            required
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
          {validUntilTooEarly && (
            <p className="mt-1 text-xs text-rose-600">
              วันที่ข้อเสนอมีผลถึง ต้องไม่น้อยกว่าวันนี้
            </p>
          )}
          {validUntilAfterTripStart && (
            <p className="mt-1 text-xs text-rose-600">
              วันที่ข้อเสนอมีผลถึง ต้องไม่เกินวันเริ่มทริปของลูกค้า
            </p>
          )}
        </div>
      </div>

      {/* รายละเอียดค่าใช้จ่าย */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          รายละเอียดค่าใช้จ่าย
        </label>
        <textarea
          name="priceBreakdown"
          value={formData.priceBreakdown}
          onChange={onChange}
          rows={3}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder={`- ค่าน้ำมัน: 2,000 บาท\n- ค่าไกด์: 3,000 บาท\n- อื่น ๆ: 1,000 บาท`}
        />
      </div>

      {/* เงื่อนไขการให้บริการ */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          เงื่อนไขการให้บริการ
        </label>
        <textarea
          name="terms"
          value={formData.terms}
          onChange={onChange}
          rows={3}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder={`- ชำระเงินล่วงหน้า ...\n- ยกเลิกก่อน ...`}
        />
      </div>

      {/* เงื่อนไขการชำระเงิน */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          เงื่อนไขการชำระเงิน
        </label>
        <textarea
          name="paymentTerms"
          value={formData.paymentTerms}
          onChange={onChange}
          rows={3}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder={`- วางมัดจำ ...\n- ชำระส่วนที่เหลือ ...`}
        />
      </div>

      {/* หมายเหตุเพิ่มเติม */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          หมายเหตุเพิ่มเติม
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={onChange}
          rows={3}
          className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          placeholder="ข้อมูลเพิ่มเติมที่อยากแจ้งลูกค้า..."
        />
      </div>

      {/* ปุ่ม Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {submitting ? "กำลังส่ง..." : "ตรวจสอบและส่ง"}
        </button>
      </div>
    </form>
  );
}
