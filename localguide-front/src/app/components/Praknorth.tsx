import Image from "next/image";

export default function Praknorth() {
  return (
    <>
      <div className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <h2 className="mb-12 text-center text-3xl md:text-4xl font-bold">
            แนะนำภาคเหนือ
          </h2>
          <div className="grid items-start gap-10 md:grid-cols-2">
            <div className="self-start justify-self-center">
              <div className="flex justify-center">
                <Image
                  src="/praknorth/north-map.png"
                  alt="แผนที่ภาคเหนือ"
                  width={540}
                  height={700}
                  className="h-auto w-full max-w-[540px] object-contain object-top"
                  sizes="(min-width: 1024px) 540px, (min-width: 768px) 500px, 92vw"
                />
              </div>
            </div>
            <div className="self-start mt-6 md:mt-10 lg:mt-14">
              <h3 className="mb-4 text-3xl md:text-4xl font-extrabold text-red-600">
                ภาคเหนือ
              </h3>
              <p className="text-gray-700 leading-relaxed">
                ภาคเหนือเป็นพื้นที่ที่ตั้งอยู่บนที่สูง
                มีเทือกเขาสูงสลับซับซ้อนและป่าไม้หนาแน่น
                อากาศเย็นสบายกว่าภูมิภาคอื่น โดยเฉพาะในฤดูหนาว
                เป็นแหล่งกำเนิดของแม่น้ำสายสำคัญของไทย ได้แก่ ปิง วัง ยม และน่าน
                ซึ่งไหลมารวมกันเป็นแม่น้ำเจ้าพระยา วัฒนธรรมล้านนาโดดเด่นทั้งภาษา
                สถาปัตยกรรม อาหาร และประเพณี เช่น ยี่เป็ง/ลอยกระทง
                และป๋าเวณีปี๋ใหม่เมือง
              </p>

              <p className="mt-4 text-gray-700 leading-relaxed">
                เมืองท่องเที่ยวยอดนิยมจังหวัดรอง เช่น เชียงราย น่าน แม่ฮ่องสอน
                ลำปาง ลำพูน พะเยา ไฮไลต์มีทั้งดอยอินทนนท์ ดอยหลวงเชียงดาว
                ภูชี้ฟ้า ปางอุ๋ง วัดวาอาราม ถนนคนเดิน และวิถีชีวิตของคนท้องถิ่น
                อาหารพื้นเมืองที่ไม่ควรพลาด ได้แก่ ข้าวซอย น้ำเงี้ยว ไส้อั่ว
                และแคบหมู ช่วงเหมาะแก่การท่องเที่ยวคือ พ.ย.–ก.พ.
                เพื่อชมทะเลหมอกและดอกไม้ฤดูหนาว
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
