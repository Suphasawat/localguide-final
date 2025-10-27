interface GuideFormFieldsProps {
  formData: {
    bio: string;
    description: string;
    price: number;
    provinceId: number;
    selectedLanguages: number[];
    selectedAttractions: number[];
    certificationNumber: string;
  };
  provinces: Array<{ ID: number; Name: string }>;
  languages: Array<{ ID: number; Name: string }>;
  filteredAttractions: Array<{ ID: number; Name: string }>;
  onFormChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onLanguageToggle: (languageId: number) => void;
  onAttractionToggle: (attractionId: number) => void;
}

export default function GuideFormFields({
  formData,
  provinces,
  languages,
  filteredAttractions,
  onFormChange,
  onLanguageToggle,
  onAttractionToggle,
}: GuideFormFieldsProps) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          แนะนำตัว (Bio) *
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={onFormChange}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="แนะนำตัวสั้นๆ เช่น ไกด์ผู้เชี่ยวชาญการท่องเที่ยวภาคเหนือ..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          รายละเอียดการให้บริการ *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={onFormChange}
          required
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="อธิบายรายละเอียดการให้บริการ เช่น สถานที่ที่เชี่ยวชาญ ประสบการณ์ การบริการ..."
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ราคาค่าบริการ (บาท/วัน) *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={onFormChange}
            required
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="3000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            จังหวัด *
          </label>
          <select
            name="provinceId"
            value={formData.provinceId}
            onChange={onFormChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">เลือกจังหวัด</option>
            {provinces.map((province) => (
              <option key={province.ID} value={province.ID}>
                {province.Name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ภาษาที่สามารถใช้ได้ *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-3">
          {languages.map((language) => (
            <label key={language.ID} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.selectedLanguages.includes(language.ID)}
                onChange={() => onLanguageToggle(language.ID)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">{language.Name}</span>
            </label>
          ))}
        </div>
        {formData.selectedLanguages.length === 0 && (
          <p className="text-sm text-red-500 mt-1">
            กรุณาเลือกภาษาอย่างน้อย 1 ภาษา
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          สถานที่ท่องเที่ยวที่เชี่ยวชาญ *
        </label>
        {formData.provinceId === 0 && (
          <p className="text-sm text-gray-500 mb-2">
            กรุณาเลือกจังหวัดก่อนเพื่อดูสถานที่ท่องเที่ยว
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
          {filteredAttractions.map((attraction) => (
            <label key={attraction.ID} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.selectedAttractions.includes(attraction.ID)}
                onChange={() => onAttractionToggle(attraction.ID)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">{attraction.Name}</span>
            </label>
          ))}
        </div>
        {filteredAttractions.length === 0 && formData.provinceId > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            ไม่มีสถานที่ท่องเที่ยวในจังหวัดนี้
          </p>
        )}
        {formData.selectedAttractions.length === 0 && (
          <p className="text-sm text-red-500 mt-1">
            กรุณาเลือกสถานที่ท่องเที่ยวอย่างน้อย 1 แห่ง
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          หมายเลขใบอนุญาตไกด์ (ถ้ามี)
        </label>
        <input
          type="text"
          name="certificationNumber"
          value={formData.certificationNumber}
          onChange={onFormChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="GD-2024-001234"
        />
      </div>
    </>
  );
}
