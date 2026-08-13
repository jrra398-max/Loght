# LightFrame AI — Real Video Upload + AI Processing

هذا الإصدار ليس مجرد واجهة: فيه Frontend + Node.js backend + رفع فيديو + اتصال بـ Replicate.

## التشغيل

1. ثبّت Node.js.
2. افتح مجلد المشروع.
3. شغّل:
   npm install
4. انسخ `.env.example` إلى `.env`.
5. ضع مفتاح Replicate:
   REPLICATE_API_TOKEN=...
6. شغّل:
   npm start
7. افتح:
   http://localhost:3000

## ملاحظات مهمة
- التوكن يبقى في السيرفر ولا يوضع في JavaScript الخاص بالمتصفح.
- المشروع يستخدم نموذج `cjwbw/controlvideo` كطبقة video-to-video تجريبية.
- قد تختلف جودة تثبيت هوية/ملامح الأشخاص من نموذج لآخر؛ هذا ليس ضماناً أن كل إطار سيحافظ على الشخص الآخر حرفياً.
- لو أردت نتيجة أدق جداً لتحويل شخص واحد فقط مع إبقاء باقي الفيديو ثابتاً، الأفضل إضافة segmentation/masking وتتبع للشخص ثم معالجة المنطقة المحددة فقط.
