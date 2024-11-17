// الاستماع لحدث إرسال النموذج
document.getElementById('bookingForm').addEventListener('submit', function(event) {
  event.preventDefault(); // منع إرسال النموذج بالطريقة التقليدية

  // جمع البيانات من النموذج
  const bookingData = {
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    region: document.getElementById('region').value,
    carType: document.getElementById('carType').value,
    carModel: document.getElementById('carModel').value,
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    notes: document.getElementById('notes').value
  };

  // جلب بيانات الباقة من localStorage
  const selectedPackage = JSON.parse(localStorage.getItem("selectedPackage"));
  
  if (selectedPackage) {
    // إضافة بيانات الباقة إلى بيانات الحجز
    bookingData.packageName = selectedPackage.name;
    bookingData.packagePrice = selectedPackage.price;
  } else {
    console.log("لم يتم اختيار باقة.");
  }

  // عرض البيانات في الـ Console للتأكد من أنها تم جمعها بشكل صحيح
  console.log("تم تجهيز بيانات الحجز:", bookingData);

  // إرسال الطلب إلى الخادم
  fetch('http://localhost:3001/booking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookingData) // إرسال البيانات إلى الخادم
  })
  
  .then(response => response.json())
  .then(data => {
    console.log('رد الخادم:', data);
    
    // توجيه المستخدم إلى صفحة التأكيد
    window.location.href = "confirmation.html";
  })
  .catch(error => {
    console.error('حدث خطأ:', error);
  });
});
