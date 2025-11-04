import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import ProvinceHero from "@/app/components/province/ProvinceHero";
import ProvinceGrid from "@/app/components/province/ProvinceGrid";
import { northernProvinces } from "@/app/components/province/provinceData";

export default function Province() {
  return (
    <>
      <Navbar />

      <ProvinceHero
        title="จังหวัดรองของภาคเหนือ"
        description="จังหวัดรองของภาคเหนือทั้ง 16 แห่ง เต็มไปด้วยเสน่ห์ของธรรมชาติ วัฒนธรรม และวิถีชีวิตท้องถิ่นที่เรียบง่ายไม่เหมือนใคร เหมาะสำหรับผู้ที่อยากสัมผัสกลิ่นอายล้านนาแท้ ๆ พร้อมค้นพบความงดงามที่ซ่อนอยู่ในแต่ละเมืองเล็กอย่างอบอุ่นและน่าประทับใจ"
      />

      <ProvinceGrid provinces={northernProvinces} />

      <Footer />
    </>
  );
}
