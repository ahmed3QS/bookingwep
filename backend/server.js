const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const path = require('path');
const cors = require('cors');
const xlsx = require('xlsx');
const fs = require('fs');

const app = express();
const port = 3001;

// تمكين CORS لجميع النطاقات
app.use(cors());

// إعداد Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'a1234test1@gmail.com', // بريدك الإلكتروني
    pass: 'iwrd uoun ykud uqfb', // كلمة مرور التطبيقات
  }
});

// إعداد Twilio
const client = new twilio('AC05bf3e6e45bf30f06c30f006d6a0696c', '8de4cd970047d5e9c7d701b9b56589c3');

// إعداد Express لاستخدام body-parser
app.use(bodyParser.json());

// إعداد مسار الملف للحجوزات
const filePath = path.join(__dirname, 'bookings.xlsx');
console.log('مسار الملف:', filePath);

// نقطة النهاية GET للمسار "/"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); 
});

// إعداد نقطة النهاية (API) لاستقبال بيانات الحجز
app.post('/booking', (req, res) => {
  const bookingData = req.body;

  const packageName = bookingData.packageName || 'غير محددة';
  const packagePrice = bookingData.packagePrice || 'غير محدد';

  // إعداد البريد الإلكتروني
  const mailOptions = {
    from: 'a1234test1@gmail.com',
    to: 'a1234test1@gmail.com',
    subject: 'حجز جديد في الورشة',
    text: `
      تم حجز موعد جديد:
      - الاسم: ${bookingData.name}
      - الهاتف: ${bookingData.phone}
      - المنطقة: ${bookingData.region}
      - نوع السيارة: ${bookingData.carType}
      - الموديل: ${bookingData.carModel}
      - التاريخ: ${bookingData.date}
      - الوقت: ${bookingData.time}
      - الملاحظات: ${bookingData.notes}
      - الباقة المختارة: ${packageName}
      - سعر الباقة: ${packagePrice}
    `
  };

  // إرسال البريد الإلكتروني
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('حدث خطأ أثناء إرسال البريد الإلكتروني:', error);
      return res.status(500).json({ message: 'حدث خطأ أثناء إرسال البريد الإلكتروني' });
    }
    console.log('تم إرسال البريد الإلكتروني:', info.response);

    // إرسال رسالة SMS باستخدام Twilio
    client.messages.create({
      body: `حجز جديد:\nاسم: ${bookingData.name}\nهاتف: ${bookingData.phone}\nالمنطقة: ${bookingData.region}\nالباقة: ${packageName}\nسعر الباقة: ${packagePrice}\nموعد: ${bookingData.date} الساعة ${bookingData.time}`,
      from: '+14238291780',
      to: `+966509020938`
    })
    .then(message => console.log('تم إرسال رسالة SMS:', message.sid))
    .catch(err => console.error('حدث خطأ أثناء إرسال رسالة SMS:', err));

    // قراءة الملف الحالي أو إنشاء بيانات جديدة
    let bookings = [];
    if (fs.existsSync(filePath)) {
      const workbook = xlsx.readFile(filePath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      bookings = xlsx.utils.sheet_to_json(worksheet);
    }

    // إضافة الحجز الجديد إلى البيانات
    bookings.push({
      name: bookingData.name,
      phone: bookingData.phone,
      region: bookingData.region,
      carType: bookingData.carType,
      carModel: bookingData.carModel,
      date: bookingData.date,
      time: bookingData.time,
      notes: bookingData.notes,
      packageName: packageName,
      packagePrice: packagePrice,
    });

    // كتابة البيانات إلى الملف Excel
    const newWorkbook = xlsx.utils.book_new();
    const newWorksheet = xlsx.utils.json_to_sheet(bookings);
    xlsx.utils.book_append_sheet(newWorkbook, newWorksheet, 'Bookings');
    xlsx.writeFile(newWorkbook, filePath);

    res.status(200).json({ message: 'تم إرسال الحجز بنجاح!' });
  });
});

// تشغيل الخادم
app.listen(port, () => {
  console.log(`الخادم يعمل على http://localhost:${port}`);
});

