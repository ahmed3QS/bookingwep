window.addEventListener('DOMContentLoaded', function() {
    // جلب البيانات من Local Storage
    const bookingData = JSON.parse(localStorage.getItem('bookingData'));
  
    // التأكد من وجود بيانات
    if (bookingData) {
      // عرض البيانات في الصفحة
      const bookingDetails = document.getElementById('bookingDetails');
      bookingDetails.innerHTML = `
        <p><strong>الاسم:</strong> ${bookingData.name}</p>
        <p><strong>الجوال:</strong> ${bookingData.phone}</p>
        <p><strong>المنطقة:</strong> ${bookingData.region}</p>
        <p><strong>نوع السيارة:</strong> ${bookingData.carType}</p>
        <p><strong>الموديل:</strong> ${bookingData.carModel}</p>
        <p><strong>تاريخ الحجز:</strong> ${bookingData.date}</p>
        <p><strong>وقت الحجز:</strong> ${bookingData.time}</p>
        <p><strong>ملاحظات:</strong> ${bookingData.notes}</p>
      `;
  
      // حذف البيانات من Local Storage بعد دقيقتين (120 ثانية)
      setTimeout(function() {
        localStorage.removeItem('bookingData');
      }, 120000); // 120000 ملي ثانية = دقيقتين
    } else {
      // في حالة عدم وجود بيانات
      document.getElementById('bookingDetails').innerText = 'لا توجد بيانات متاحة لعرضها.';
    }
  });
  