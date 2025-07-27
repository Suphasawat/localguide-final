package migrations

import (
	"localguide-back/models"

	"gorm.io/gorm"
)

func SeedTouristAttractions(db *gorm.DB) error {
    attractions := []models.TouristAttraction{
        // กรุงเทพมหานคร
        {Name: "วัดพระแก้ว", Description: "วัดพระแก้วเป็นวัดที่สำคัญที่สุดในประเทศไทย", ProvinceID: 1, District: "พระนคร", City: "กรุงเทพฯ", Category: "วัด", Rating: 4.8},
        {Name: "วัดอรุณราชวราราม", Description: "วัดอรุณหรือวัดแจ้ง", ProvinceID: 1, District: "บางกอกใหญ่", City: "กรุงเทพฯ", Category: "วัด", Rating: 4.6},
        {Name: "ตลาดจตุจักร", Description: "ตลาดนัดที่ใหญ่ที่สุดในประเทศไทย", ProvinceID: 1, District: "จตุจักร", City: "กรุงเทพฯ", Category: "ตลาด", Rating: 4.4},

        // เชียงใหม่
        {Name: "วัดพระธาตุดอยสุเทพ", Description: "วัดบนดอยสุเทพที่มีชื่อเสียง", ProvinceID: 2, District: "เมืองเชียงใหม่", City: "เชียงใหม่", Category: "วัด", Rating: 4.9},
        {Name: "ตลาดกาดหลวง", Description: "ตลาดเก่าแก่ของเชียงใหม่", ProvinceID: 2, District: "เมืองเชียงใหม่", City: "เชียงใหม่", Category: "ตลาด", Rating: 4.2},

        // ภูเก็ต
        {Name: "หาดป่าตอง", Description: "หาดที่มีชื่อเสียงของภูเก็ต", ProvinceID: 3, District: "กะทู้", City: "ภูเก็ต", Category: "ชายหาด", Rating: 4.3},
        {Name: "เกาะพีพี", Description: "เกาะสวยในทะเลอันดามัน", ProvinceID: 3, District: "เมืองภูเก็ต", City: "ภูเก็ต", Category: "เกาะ", Rating: 4.7},

        // เชียงราย
        {Name: "วัดร่องขุ่น", Description: "วัดสีขาวที่มีชื่อเสียงของเชียงราย", ProvinceID: 4, District: "เมืองเชียงราย", City: "เชียงราย", Category: "วัด", Rating: 4.7},
        {Name: "สามเหลี่ยมทองคำ", Description: "จุดที่แม่น้ำโขงและแม่น้ำรวกบรรจบกัน", ProvinceID: 4, District: "เชียงแสน", City: "เชียงราย", Category: "ธรรมชาติ", Rating: 4.5},

        // ชลบุรี (พัทยา)
        {Name: "หาดจอมเทียน", Description: "หาดทรายสวยใกล้พัทยา", ProvinceID: 5, District: "บางละมุง", City: "พัทยา", Category: "ชายหาด", Rating: 4.2},
        {Name: "เกาะล้าน", Description: "เกาะสวยใกล้พัทยา", ProvinceID: 5, District: "บางละมุง", City: "พัทยา", Category: "เกาะ", Rating: 4.4},

        // กระบี่
        {Name: "อ่าวไร่เลย์", Description: "หาดทรายขาวน้ำใสที่สวยงาม", ProvinceID: 6, District: "เมืองกระบี่", City: "กระบี่", Category: "ชายหาด", Rating: 4.8},
        {Name: "เกาะปอดะ", Description: "เกาะในทะเลอันดามัน", ProvinceID: 6, District: "เมืองกระบี่", City: "กระบี่", Category: "เกาะ", Rating: 4.6},

        // สุโขทัย
        {Name: "อุทยานประวัติศาสตร์สุโขทัย", Description: "โบราณสถานที่สำคัญของไทย", ProvinceID: 7, District: "เมืองสุโขทัย", City: "สุโขทัย", Category: "โบราณสถาน", Rating: 4.7},

        // พระนครศรีอยุธยา
        {Name: "วัดพระศรีสรรเพชญ์", Description: "วัดสำคัญในอุทยานประวัติศาสตร์อยุธยา", ProvinceID: 8, District: "พระนครศรีอยุธยา", City: "อยุธยา", Category: "โบราณสถาน", Rating: 4.5},
        {Name: "วัดไชยวัฒนาราม", Description: "วัดโบราณที่มีพระปรางค์สูง", ProvinceID: 8, District: "พระนครศรีอยุธยา", City: "อยุธยา", Category: "โบราณสถาน", Rating: 4.4},

        // สุราษฎร์ธานี (เกาะสมุย)
        {Name: "หาดเฉวง", Description: "หาดที่มีชื่อเสียงของเกาะสมุย", ProvinceID: 9, District: "เกาะสมุย", City: "สุราษฎร์ธานี", Category: "ชายหาด", Rating: 4.5},
        {Name: "หินตาหินยาย", Description: "ก้อนหินธรรมชาติที่มีรูปร่างแปลก", ProvinceID: 9, District: "เกาะสมุย", City: "สุราษฎร์ธานี", Category: "ธรรมชาติ", Rating: 4.0},

        // ประจวบคีรีขันธ์ (หัวหิน)
        {Name: "หาดหัวหิน", Description: "หาดที่เป็นที่นิยมของนักท่องเที่ยว", ProvinceID: 10, District: "หัวหิน", City: "ประจวบคีรีขันธ์", Category: "ชายหาด", Rating: 4.3},
    }

    for _, attraction := range attractions {
        if err := db.FirstOrCreate(&attraction, models.TouristAttraction{Name: attraction.Name}).Error; err != nil {
            return err
        }
    }

    return nil
}