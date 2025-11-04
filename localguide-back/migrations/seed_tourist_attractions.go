package migrations

import (
	"localguide-back/models"

	"gorm.io/gorm"
)

func SeedTouristAttractions(db *gorm.DB) error {
    attractions := []models.TouristAttraction{
		// 1 เชียงราย
		{Name: "วัดร่องขุ่น", Description: "วัดศิลปะสีขาวอันโด่งดัง", ProvinceID: 1, District: "เมืองเชียงราย", City: "เชียงราย", Category: "วัด", Rating: 4.8},
		{Name: "สามเหลี่ยมทองคำ", Description: "จุดบรรจบสามประเทศ ริมแม่น้ำโขง", ProvinceID: 1, District: "เชียงแสน", City: "เชียงราย", Category: "ธรรมชาติ", Rating: 4.6},

		// 2 น่าน
		{Name: "วัดภูมินทร์", Description: "วัดจิตรกรรมกระซิบรักบันลือโลก", ProvinceID: 2, District: "เมืองน่าน", City: "น่าน", Category: "วัด", Rating: 4.7},
		{Name: "ดอยเสมอดาว", Description: "จุดชมทะเลหมอกและดาวสวยงาม", ProvinceID: 2, District: "นาน้อย", City: "น่าน", Category: "ธรรมชาติ", Rating: 4.8},

		// 3 พะเยา
		{Name: "กว๊านพะเยา", Description: "ทะเลสาบน้ำจืดขนาดใหญ่กลางเมือง", ProvinceID: 3, District: "เมืองพะเยา", City: "พะเยา", Category: "ธรรมชาติ", Rating: 4.4},
		{Name: "วัดศรีโคมคำ", Description: "วัดคู่บ้านคู่เมืองพะเยา ริมกว๊านพะเยา", ProvinceID: 3, District: "เมืองพะเยา", City: "พะเยา", Category: "วัด", Rating: 4.5},

		// 4 ลำปาง
		{Name: "วัดพระธาตุลำปางหลวง", Description: "วัดสำคัญศิลปะล้านนา", ProvinceID: 4, District: "เกาะคา", City: "ลำปาง", Category: "วัด", Rating: 4.7},
		{Name: "อุทยานแห่งชาติแจ้ซ้อน", Description: "บ่อน้ำพุร้อนและน้ำตกธรรมชาติ", ProvinceID: 4, District: "เมืองปาน", City: "ลำปาง", Category: "ธรรมชาติ", Rating: 4.6},

		// 5 ลำพูน
		{Name: "วัดพระธาตุหริภุญชัย", Description: "วัดเก่าแก่ศูนย์รวมจิตใจชาวลำพูน", ProvinceID: 5, District: "เมืองลำพูน", City: "ลำพูน", Category: "วัด", Rating: 4.8},
		{Name: "กู่ช้าง กู่ม้า", Description: "โบราณสถานสำคัญทางประวัติศาสตร์", ProvinceID: 5, District: "เมืองลำพูน", City: "ลำพูน", Category: "โบราณสถาน", Rating: 4.3},

		// 6 แพร่
		{Name: "วัดพระธาตุช่อแฮ", Description: "วัดประจำปีเกิดปีขาล", ProvinceID: 6, District: "เมืองแพร่", City: "แพร่", Category: "วัด", Rating: 4.7},
		{Name: "ถ้ำผานางคอย", Description: "ถ้ำหินงอกที่มีตำนานพื้นบ้าน", ProvinceID: 6, District: "ร่องฟอง", City: "แพร่", Category: "ธรรมชาติ", Rating: 4.5},

		// 7 แม่ฮ่องสอน
		{Name: "ปาย", Description: "เมืองท่องเที่ยวธรรมชาติยอดนิยม", ProvinceID: 7, District: "ปาย", City: "แม่ฮ่องสอน", Category: "ธรรมชาติ", Rating: 4.7},
		{Name: "ถ้ำปลา", Description: "น้ำใสกับปลามากมายในถ้ำ", ProvinceID: 7, District: "สบป่อง", City: "แม่ฮ่องสอน", Category: "ธรรมชาติ", Rating: 4.4},

		// 8 อุตรดิตถ์
		{Name: "เขื่อนสิริกิติ์", Description: "เขื่อนขนาดใหญ่รายล้อมด้วยธรรมชาติ", ProvinceID: 8, District: "ท่าปลา", City: "อุตรดิตถ์", Category: "ธรรมชาติ", Rating: 4.5},
		{Name: "วัดพระบรมธาตุทุ่งยั้ง", Description: "วัดเก่าแก่สำคัญประจำจังหวัด", ProvinceID: 8, District: "ลับแล", City: "อุตรดิตถ์", Category: "วัด", Rating: 4.4},

		// 9 ตาก
		{Name: "น้ำตกทีลอซู", Description: "หนึ่งในน้ำตกที่ใหญ่ที่สุดของไทย", ProvinceID: 9, District: "อุ้มผาง", City: "ตาก", Category: "ธรรมชาติ", Rating: 4.9},
		{Name: "ดอยมูเซอ", Description: "จุดชมวิวและหมู่บ้านชาวเขา", ProvinceID: 9, District: "แม่สอด", City: "ตาก", Category: "ธรรมชาติ", Rating: 4.3},

		// 10 สุโขทัย
		{Name: "อุทยานประวัติศาสตร์สุโขทัย", Description: "แหล่งมรดกโลกยูเนสโก", ProvinceID: 10, District: "เมืองสุโขทัย", City: "สุโขทัย", Category: "โบราณสถาน", Rating: 4.9},
		{Name: "วัดศรีชุม", Description: "มีพระพุทธรูปองค์ใหญ่ในมณฑป", ProvinceID: 10, District: "เมืองสุโขทัย", City: "สุโขทัย", Category: "วัด", Rating: 4.7},

		// 11 พิษณุโลก
		{Name: "วัดพระศรีรัตนมหาธาตุ", Description: "พระพุทธชินราชอันศักดิ์สิทธิ์", ProvinceID: 11, District: "เมืองพิษณุโลก", City: "พิษณุโลก", Category: "วัด", Rating: 4.8},
		{Name: "ทุ่งแพะเมืองผี", Description: "พื้นที่ธรรมชาติลึกลับแปลกตา", ProvinceID: 11, District: "ชาติตระการ", City: "พิษณุโลก", Category: "ธรรมชาติ", Rating: 4.2},

		// 12 พิจิตร
		{Name: "บึงสีไฟ", Description: "แหล่งท่องเที่ยวพักผ่อนของจังหวัด", ProvinceID: 12, District: "เมืองพิจิตร", City: "พิจิตร", Category: "ธรรมชาติ", Rating: 4.3},
		{Name: "วัดท่าหลวง", Description: "วัดเก่าแก่ริมแม่น้ำน่าน", ProvinceID: 12, District: "เมืองพิจิตร", City: "พิจิตร", Category: "วัด", Rating: 4.5},

		// 13 กำแพงเพชร
		{Name: "อุทยานประวัติศาสตร์กำแพงเพชร", Description: "โบราณสถานมรดกโลก", ProvinceID: 13, District: "เมืองกำแพงเพชร", City: "กำแพงเพชร", Category: "โบราณสถาน", Rating: 4.8},
		{Name: "น้ำพุร้อนพระร่วง", Description: "บ่อน้ำร้อนธรรมชาติ", ProvinceID: 13, District: "คลองลาน", City: "กำแพงเพชร", Category: "ธรรมชาติ", Rating: 4.4},

		// 14 นครสวรรค์
		{Name: "บึงบอระเพ็ด", Description: "ทะเลสาบน้ำจืดที่ใหญ่ที่สุดของไทย", ProvinceID: 14, District: "เมืองนครสวรรค์", City: "นครสวรรค์", Category: "ธรรมชาติ", Rating: 4.5},
		{Name: "วัดคีรีวงศ์", Description: "วัดบนยอดเขามองเห็นเมืองนครสวรรค์", ProvinceID: 14, District: "เมืองนครสวรรค์", City: "นครสวรรค์", Category: "วัด", Rating: 4.6},

		// 15 อุทัยธานี
		{Name: "หุบป่าตาด", Description: "ป่าดึกดำบรรพ์ที่ซ่อนอยู่ในภูเขา", ProvinceID: 15, District: "ลานสัก", City: "อุทัยธานี", Category: "ธรรมชาติ", Rating: 4.7},
		{Name: "วัดถ้ำเขาวง", Description: "วัดบนหน้าผาหินปูนกลางน้ำ", ProvinceID: 15, District: "บ้านไร่", City: "อุทัยธานี", Category: "วัด", Rating: 4.5},

		// 16 เพชรบูรณ์
		{Name: "ภูทับเบิก", Description: "ทะเลหมอกและไร่กะหล่ำปลีชื่อดัง", ProvinceID: 16, District: "หล่มเก่า", City: "เพชรบูรณ์", Category: "ธรรมชาติ", Rating: 4.9},
		{Name: "เขาค้อ", Description: "แหล่งท่องเที่ยวภูเขาอากาศเย็น", ProvinceID: 16, District: "เขาค้อ", City: "เพชรบูรณ์", Category: "ธรรมชาติ", Rating: 4.8},
	}

    for _, attraction := range attractions {
        if err := db.FirstOrCreate(&attraction, models.TouristAttraction{Name: attraction.Name}).Error; err != nil {
            return err
        }
    }

    return nil
}