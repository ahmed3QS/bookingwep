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

  // تحقق من دعم Apple Pay على الجهاز
  if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
    showApplePay(bookingData); // تفعيل الدفع عبر Apple Pay إذا كان مدعومًا
  } else {
    // إذا لم يكن Apple Pay مدعومًا، يتم إرسال الطلب إلى الخادم بالطريقة التقليدية
    sendBookingToServer(bookingData);
  }
});

// دالة لإظهار واجهة Apple Pay
function showApplePay(bookingData) {
  const paymentRequest = {
    countryCode: 'SA',
    currencyCode: 'SAR',
    total: {
      label: 'حجز الورشة',
      amount: bookingData.packagePrice // استخدام سعر الباقة من بيانات الحجز
    },
    supportedNetworks: ['visa', 'masterCard', 'mada'],
    merchantCapabilities: ['supports3DS'],
  };

  const session = new ApplePaySession(3, paymentRequest);

  session.onpaymentauthorized = (event) => {
    const paymentData = event.payment.token;
    sendPaymentToServer(paymentData, bookingData); // إرسال بيانات الدفع مع الحجز
    session.completePayment(ApplePaySession.STATUS_SUCCESS);
  };

  session.begin();
}

// دالة لإرسال بيانات الحجز إلى الخادم
function sendBookingToServer(bookingData) {
  fetch('http://localhost:3001/booking', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookingData) // إرسال بيانات الحجز إلى الخادم
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
}

// دالة لإرسال بيانات الدفع إلى الخادم
function sendPaymentToServer(paymentData, bookingData) {
  fetch('http://localhost:3001/confirm-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      paymentData: paymentData,
      bookingData: bookingData // إرسال بيانات الحجز مع بيانات الدفع
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('تم تأكيد الحجز:', data);
    window.location.href = "confirmation.html"; // توجيه المستخدم إلى صفحة التأكيد
  })
  .catch(error => {
    console.error('خطأ في إرسال بيانات الدفع:', error);
  });
}
