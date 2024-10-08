import { NextResponse } from 'next/server';
import { promises as fs } from 'fs'; // ใช้ fs แบบ promises เพื่อรองรับ async/await
import path from 'path';

export async function GET() {
  const directoryPath = path.join('D:/senior-project-1/back-end/output_frames');

  try {
    // อ่านไฟล์ทั้งหมดใน directory แบบ asynchronous
    const files = await fs.readdir(directoryPath);

    // สร้าง array ของ object ที่มีข้อมูล url, glassesType, และ timestamp
    const imageUrls = files.map((file) => {
      // แยกชื่อไฟล์เพื่อดึงข้อมูล timestamp ที่เป็นตัวเลขหลัง 'frame'
      const timestampMatch = file.match(/_frame_(\d+)\.jpg$/);
      const timestampInSeconds = timestampMatch ? parseFloat(timestampMatch[1]) : 0;

      // แปลง timestamp เป็นรูปแบบ hh:mm:ss
      const timestamp = formatTimestamp(timestampInSeconds);

      // ดึงข้อมูลส่วน glasses และ sunglasses จากชื่อไฟล์
      let glassesType = 'Unknown'; // ตั้งค่า default เป็น Unknown
      const nameMatch = file.match(/(G\d+_SG\d+)/);

      if (nameMatch) {
        // แทนที่ G ด้วย "clear glasses" และ SG ด้วย "sunglasses" และคั่นด้วย ", "
        glassesType = nameMatch[1]
          .replace('G', 'clear glasses')
          .replace('SG', 'sunglasses')
          .replace('_', ', ');
      }

      return { url: `http://localhost:5000/output_frames/${file}`, glassesType, timestamp };
    });

    return NextResponse.json({ images: imageUrls }, { status: 200 });
  } catch (error) {
    console.error('Error reading directory:', error);
    return NextResponse.json({ error: 'Error fetching images' }, { status: 500 });
  }
}

// ฟังก์ชันสำหรับแปลง timestamp เป็นรูปแบบ hh:mm:ss
function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600); // คำนวณจำนวนชั่วโมง
  const minutes = Math.floor((seconds % 3600) / 60); // คำนวณจำนวนที่เหลือเป็นนาที
  const remainingSeconds = Math.floor(seconds % 60); // คำนวณจำนวนที่เหลือเป็นวินาที

  // ใช้เมธอด padStart เพื่อเพิ่มเลขศูนย์ด้านหน้าให้กับค่าที่น้อยกว่า 10
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = remainingSeconds.toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}
