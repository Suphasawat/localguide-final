import Link from "next/link";

export default function Footer() {
  return (
    <>
    <div className="w-full bg-[#BFE3D4] py-10 text-gray-800">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 sm:grid-cols-2 md:grid-cols-3">
        
        <div>
          <h3 className="mb-3 text-lg font-semibold">เกี่ยวกับ LocalGuide</h3>
          <ul className="space-y-1 text-sm">
            <li><Link href="/about" className="hover:underline">เกี่ยวกับเรา</Link></li>
            <li><Link href="/step-guide" className="hover:underline">ร่วมงานกับเรา</Link></li>
            <li><Link href="/province" className="hover:underline">จังหวัดรองของภาคเหนือ</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold">พาร์ทเนอร์</h3>
          <ul className="space-y-1 text-sm">
            <li><Link href="/step-guide" className="hover:underline">คุณสมบัติในการสมัครเป็นไกด์นำเที่ยว</Link></li>
            <li><Link href="/become-guide" className="hover:underline">สมัครเป็นไกด์ท้องถิ่นนำเที่ยว</Link></li>
            <li><Link href="/dashboard" className="hover:underline">เข้าสู่ระบบไกด์นำเที่ยว</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-lg font-semibold">ติดต่อเรา</h3>
          <address className="not-italic text-sm leading-relaxed">
            Kamphaeng Saen, Kamphaeng Saen District,<br />
            Nakhon Pathom 73140
          </address>
        </div>
      </div>

      <div className="mt-10 border-t border-gray-300 pt-5 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} LocalGuide. All rights reserved.
      </div>
    </div>
    </>
  );
};