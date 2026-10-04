# هامة فوز / أخطبوط روشن

## 1. ما هو المشروع؟

مجلد واحد يجمع واجهة عربية لتحليل مباريات كرة القدم، ومساعدًا نصيًا اسمه في الكود «أخطبوط روشن»، وصفحات باسم «هامة فوز». الواجهة HTML و CSS و JavaScript. التحليل يمر عبر خوادم Python (Flask) تستدعي واجهة API-Football ونموذج DeepSeek.

عنوان `index.html` هو «هامة فوز». صفحة `live-match.html` تعرض صورة `akhtabot.png` ونص «أخطبوط روشن». الاسم التسويقي في README السابق «أخطبوط روشن» يصف المساعد، بينما اسم الواجهة الرئيسية في الملفات «هامة فوز».

## 2. لماذا يوجد هذا المشروع؟

`around.html` يصف المنصة بأنها تجمع المشاهدة مع التحليل. `prompt_builder.py` يبني تعليمات لمحلل يرد باللهجة السعودية الخفيفة اعتمادًا على إحصاءات المباراة وأحداثها. README السابق يضيف تفاصيل عن تحليل كل 20 ثانية وبطاقات كل 5 دقائق. هذه التفاصيل تبقى صحيحة فقط حيث يؤكدها ملف واجهة أو سكربت، وواجهة `live-match.js` تحتوي نطقًا وسؤالًا وملخصًا مباشرًا وحفظ لقطة.

## 3. من يستخدمه؟

| الطرف | الواقع في الملفات |
| --- | --- |
| مشاهد | يفتح الصفحات ويسأل المساعد ويشغّل فيديو محلي |
| حساب مستخدم | صفحات `login.html` و `Sign-Up.html` و `logout.html` و `profile2.html` موجودة، ونموذج الدخول `action=""` فلا يحفظ حسابًا |
| مطور | يشغّل أحد سكربتات Python |

لا جدول مستخدمين ولا دور مدير.

## 4. ماذا يستطيع النظام أن يفعل؟

| القدرة | الملف |
| --- | --- |
| صفحة رئيسية «هامة فوز» مع تباين عالٍ وجلب مباريات من API-Football في المتصفح | `index.html` و `index.js` |
| صفحة حول | `around.html` |
| بث واجهة مع فيديو `videoplayback.mp4` وسؤال المساعد وملخص ونطق | `live-match.html` و `live-match.js` |
| وضع مسجّل بنفس ملف الفيديو | `offline.html` و `offline-match.js` |
| ملف شخصي وتعديل اسم وإعجاب | `profile2.html` و `profile.js` |
| سؤال DeepSeek مع إحصاءات مخزنة | `server.py` المسار `POST /ask` على المنفذ 200 |
| ملخص مباشر وسؤال | `live_match_server.py` المساران `GET /live-summary` و `POST /ask` على المنفذ 5000 |
| ملخص لفيديو غير مباشر | `offline_server.py` المسار `POST /offline-summary` |
| بناء نص التعليمات للمساعد | `prompt_builder.py` الدالة `build_master_prompt` |
| فحص بيانات مباراة من سطر الأوامر | `kani_check_match_data.py` |
| تجربة DeepSeek من سطر الأوامر | `analyze_with_deepseek.py` و `test_deepseek.py` |
| اختبار خادم | `server_test.py` |

شعارات أندية ودوريات كثيرة موجودة كصور في جذر المجلد (مثل `Hilal.png` و `Alahli.png` و `RSL.jpg`). ليست داخل مجلد `images/` كما ذكر README السابق.

## 5. كيف يعمل النظام؟

مساران يعملان في الملفات، وهما غير موحّدين على منفذ واحد:

```
المتصفح live-match.js
  -> http://127.0.0.1:5000/ask
  -> http://127.0.0.1:5000/live-summary
  -> live_match_server.py
  -> API-Football ثم DeepSeek
  -> JSON { reply أو نص الملخص }
```

```
server.py
  -> مجدول كل 5 دقائق
  -> إذا كانت حالة المباراة 1H أو 2H أو LIVE
  -> يخزن الإحصاءات والأحداث
  -> POST /ask يستخدم المخزن
  -> المنفذ 200
```

واجهة `live-match.js` لا تستدعي المنفذ 200. استنتاج من الكود: تشغيل `server.py` وحده لا يخدم الأزرار المربوطة بالمنفذ 5000.

الوضع غير المباشر: `offline-match.js` يرسل `POST` إلى `http://127.0.0.1:5000/offline-summary` مع `fixture_id` ومدة الفيديو. هذا المسار معرّف في `offline_server.py`. ملف المنفذ داخل `offline_server.py` غير ظاهر في بداية الملف المقروءة هنا؛ الواجهة تفترض المنفذ 5000، وهو نفس منفذ `live_match_server.py`. تشغيل الاثنين معًا على 5000 يتعارض.

## 6. أمثلة واقعية

### سؤال أثناء الواجهة المباشرة

1. المستخدم يفتح `live-match.html`.
2. الفيديو المحلي `videoplayback.mp4` يعمل داخل الصفحة، وهو ليس بثًا من خادم فيديو.
3. `analyzeInput` في `live-match.js` يرسل السؤال إلى `POST http://127.0.0.1:5000/ask`.
4. `live_match_server.py` يجلب إحصاءات وأحداث المباراة ذات `fixture_id = 1218540`.
5. `build_master_prompt` يكوّن النص.
6. الطلب يذهب إلى `https://api.deepseek.com/v1/chat/completions` والنموذج `deepseek-chat`.
7. الرد يرجع JSON. إذا كان النطق مفعّلًا عبر `toggleSpeech` تُنطق الإجابة بـ `speechSynthesis`.

### تحديث دوري في server.py

1. `BackgroundScheduler` يستدعي `update_match_data` كل 5 دقائق.
2. المباراة الثابتة `fixture_id = 1098863`. التعليق في الملف يقول الدوري اللبناني الممتاز.
3. إذا الحالة ليست `1H` أو `2H` أو `LIVE` يتوقف التحديث.
4. عند `POST /ask` إن لم توجد إحصاءات ولا أحداث تُرجع رسالة عربية جاهزة بأن البيانات ستصل لاحقًا.
5. الرد يُقص إلى 300 كلمة عبر `truncate_text`.

### ملخص غير مباشر

1. `offline-match.js` الدالة `fetchOfflineSummary`.
2. `offline_server.py` يجلب إحصاءات وأحداث `fixture_id` القادم من الطلب.
3. المدة الافتراضية للفيديو في الخادم 120 ثانية إذا لم تُرسل.
4. DeepSeek يعيد تحليلًا ثم الصفحة تعرض المقاطع عبر `displaySegment`.

## 7. رحلة المستخدم

1. `login.html` عنوانها «تسجيل الدخول». النموذج `POST` إلى `action=""`. لا معالج PHP للدخول. `config.php` موجود ولا يستدعيه هذا النموذج.
2. `index.html` يربط «تسجيل خروج» بـ `logout.html` و«الملف الشخصي» بـ `Profile.html`.
3. الملف الموجود اسمه `profile2.html` لا `Profile.html`. الرابط الحالي لا يطابق اسم الملف على ويندوز حساسًا لحالة الأحرف خارج هذا النظام، وعلى Linux يفشل.
4. من البث: سؤال أو ملخص أو نطق أو حفظ لقطة عبر `saveHighlight` في `live-match.js`.
5. لا قاعدة تحفظ السؤال أو الحساب.

## 8. الوحدات والأقسام

| الوحدة | الوظيفة | عمليات المستخدم | العلاقة |
| --- | --- | --- | --- |
| هامة فوز الرئيسية | عرض وتحليل قائمة مباريات من المتصفح | تصفح وتباين عالٍ | `index.js` يتصل بـ API-Football مباشرة |
| حول | نص تعريفي | قراءة | رابط من الرئيسية |
| البث | فيديو ومساعد | سؤال، نطق، ملخص، لقطة | يعتمد على خادم المنفذ 5000 |
| المسجّل | فيديو مع ترجمة علوية | تشغيل الملخص غير المباشر | `offline-match.js` |
| الملف الشخصي | اسم وإعجابات | `openEditForm` و `saveEdits` و `likeShot` | `profile.js` يبحث عن فيديو في مسار غير موجود |
| الدخول والخروج والتسجيل | واجهات HTML | تعبئة حقول | غير مربوطة بحفظ |
| prompt_builder | صياغة طلب الذكاء | لا واجهة | تستدعيه خوادم Python |
| config.php | اتصال MySQL بقيم نائبة | لا شيء | غير مستخدم من خوادم Flask |

## 9. الشركات والكيانات

غير موجود في الملفات الحالية. الشعارات ملفات صور لأندية، وليست كيانات متعددة داخل نظام صلاحيات.

## 10. الصلاحيات

غير موجود في الملفات الحالية. لا جلسة تمنع صفحة عن أخرى.

## 11. الأتمتة وWorkflows

| المهمة | الملف | الفترة |
| --- | --- | --- |
| تحديث إحصاءات المباراة 1098863 إذا كانت مباشرة | `server.py` الدالة `update_match_data` | كل 5 دقائق |
| جلب بيانات المباراة 1218540 | `live_match_server.py` | كل 60 ثانية |

لا طابور مهام منفصل. APScheduler يعمل داخل عملية Flask.

## 12. التكامل بين الوحدات

`index.js` يجلب المباريات في المتصفح من `https://v3.football.api-sports.io`. خوادم Python تجلب الإحصاءات والأحداث لنفس نوع الواجهة ثم ترسلها إلى DeepSeek. رقم المباراة في `server.py` هو 1098863 وفي `live_match_server.py` هو 1218540. استنتاج من الكود: الواجهة والخادم الرئيسي للمساعد لا يتفقان على مباراة واحدة ولا على منفذ واحد.

`profile.js` يضبط `video.src = "videos/your-video.mp4"` بينما الملف `your-video.mp4` في جذر المشروع ولا يوجد مجلد `videos/`. `offline.html` يطلب `videos/beep.mp3` بينما `beep.mp3` في الجذر، و`live-match.html` يطلب `beep.mp3` من الجذر.

## 13. المصطلحات

| المصطلح | المعنى هنا |
| --- | --- |
| هامة فوز | الاسم في عنوان الرئيسية والتذييل «فريق هامة فوز 2025» |
| أخطبوط روشن | اسم المساعد داخل `prompt_builder.py` و`live-match.html` |
| fixture | رقم مباراة في API-Football |
| DeepSeek | النموذج `deepseek-chat` على `api.deepseek.com` |
| API-Football | `v3.football.api-sports.io` |
| ملخص مباشر | `GET /live-summary` |
| ملخص غير مباشر | `POST /offline-summary` |

## 14. الأسئلة الشائعة

**أي خادم أشغّل للواجهة المباشرة؟**  
`live-match.js` ينادي المنفذ 5000، و`live_match_server.py` يستمع على 5000. `server.py` يستمع على 200.

**هل الفيديو بث حقيقي من النادي؟**  
الصفحة تشغّل ملف `videoplayback.mp4` المحلي. التحليل الرقمي يأتي من API-Football لا من قراءة صورة الفيديو.

**هل يُحفظ المستخدم؟**  
غير موجود في الملفات الحالية كتنفيذ. `config.php` فيه اتصال نائب باسم `your_database`.

**أين highlights.csv؟**  
غير موجود في الملفات الحالية. README السابق ذكره.

## 15. المعمارية

```
index.js ---------> API-Football (من المتصفح)
live-match.js ----> :5000 live_match_server.py --> API-Football
                 \-> DeepSeek
offline-match.js -> :5000 /offline-summary --> offline_server.py
server.py :200 ---> API-Football + DeepSeek + مجدول 5 دقائق
HTML/CSS/صور/فيديو محلي
config.php (MySQL نائب، غير موصول بالصفحات)
```

## 16. التقنيات

| التقنية | أين |
| --- | --- |
| HTML و CSS و JavaScript | صفحات الجذر |
| jQuery | مستدعى داخل `index.js` عبر `$` |
| Flask و flask_cors | `server.py` و `live_match_server.py` و `offline_server.py` |
| requests | استدعاء HTTP |
| APScheduler | `server.py` و `live_match_server.py` |
| DeepSeek | دردشة completions |
| API-Football | إحصاءات وأحداث ومباريات |
| PHP mysqli | `config.php` فقط |
| Web Speech API | `speechSynthesis` في `live-match.js` |

لا `requirements.txt`.

## 17. هيكل المشروع

الملفات البرمجية في الجذر، والصور في الجذر أيضًا، وليست في مجلد `backend/` ولا `images/`. `settings.json` يضبط `python.analysis.extraPaths` على `./backend`، وهذا المجلد غير موجود.

```
AI-PLAYBYPLAY/
  index.html  index.js  style.css
  around.html  around.css
  live-match.html  live-match.js  live-match-style.css
  offline.html  offline-match.js
  login.html  login-style.css
  Sign-Up.html  signup-style.css
  logout.html  logout-style.css
  profile2.html  profile.js  profile2.css
  server.py  live_match_server.py  offline_server.py
  prompt_builder.py
  analyze_with_deepseek.py  test_deepseek.py
  kani_check_match_data.py  server_test.py
  config.php  settings.json  README.md
  videoplayback.mp4  your-video.mp4  beep.mp3
  صور أندية وشعارات في الجذر
  ملفات prompt_builder.cpython-*.pyc
```

## 18. الواجهة

- صفحات متعددة منفصلة.
- `index.html` اللغة `ar` دون `dir="rtl"` في السطر الأول. `live-match.html` و `login.html` و `offline.html` فيها `dir="rtl"`.
- `index.js`: تباين عالٍ `toggleHighContrast`، جلب مباراة بالمعرف، جلب مباريات حسب التاريخ، `loadCurrentMatchesOrdered`، `loadRecordedSaudiMatches`.
- `live-match.js`: قائمة، نطق، `analyzeInput`، تعليقات نصية `submitTextComment` و `sendComment`، `saveHighlight`، `loadLiveSummary`، `displayLineByLine`.
- `profile.js` يعدّل الاسم في الصفحة عبر DOM. الحفظ في `saveEdits` لا يرسل إلى خادم في الجزء المقروء من بداية الوظائف.
- رابط Font Awesome في `index.html` مكتوب `href="../CSS/https://cdnjs..."` وهذا مسار غير صالح كعنوان شبكة.
- لا أيقونة تبويب (`favicon`) في الصفحات المقروءة.

## 19. الخادم

| الملف | المسارات | المنفذ في الملف |
| --- | --- | --- |
| `server.py` | `GET /` يعيد نص «السيرفر شغال تمام!»، `POST /ask` | 200، `debug=True` |
| `live_match_server.py` | `GET /live-summary`، `POST /ask` | 5000، `debug=True` |
| `offline_server.py` | `POST /offline-summary` | المنفذ في نهاية الملف؛ الواجهة تتوقع 5000 |

الدوال البارزة في `server.py`: `truncate_text`، `get_match_data`، `update_match_data`، `ask`، `initial_update_if_live`.

مفاتيح DeepSeek و API-Football مكتوبة نصًا داخل `server.py` و `live_match_server.py` و `offline_server.py`. لا تُنسخ القيم في هذا الملف. هذا وضع غير مناسب للنشر.

`CORS(app)` مفعّل في خوادم Flask المقروءة.

## 20. مسار الطلب

مثال السؤال من الواجهة المباشرة:

```
live-match.js analyzeInput
  -> POST http://127.0.0.1:5000/ask
  -> live_match_server.py
  -> get_match_data(1218540)
  -> API-Football statistics + events
  -> build_master_prompt
  -> DeepSeek chat completions
  -> JSON إلى المتصفح
  -> speechSynthesis إذا فُعّل النطق
```

مثال من `server.py` يختلف في المنفذ ورقم المباراة والمجدول.

## 21. قاعدة البيانات

غير موجودة كجداول. `config.php` يعرّف اتصال mysqli إلى `localhost` وقاعدة `your_database` ومستخدم `root` وكلمة مرور فارغة. لا ملف SQL.

تعليقات الواجهة واللقطات لا تُكتب في قاعدة داخل الملفات الحالية.

## 22. واجهة البرمجة

| الطريقة | المسار | الملف | الغرض | مدخلات | مصادقة |
| --- | --- | --- | --- | --- | --- |
| GET | `/` | `server.py` | فحص نصي | لا | لا |
| POST | `/ask` | `server.py` | رد المساعد من البيانات المخزنة | JSON فيه `question` | لا |
| GET | `/live-summary` | `live_match_server.py` | ملخص حسب الدقيقة | `elapsed` من الواجهة | لا |
| POST | `/ask` | `live_match_server.py` | سؤال مع جلب مباشر | JSON السؤال | لا |
| POST | `/offline-summary` | `offline_server.py` | تحليل مباراة لفيديو | `fixture_id`، `video_duration` | لا |

خدمات خارجية يستخدمها الخادم وليست مسارات المشروع: `fixtures/statistics` و `fixtures/events` و `fixtures` على API-Football، و `https://api.deepseek.com/v1/chat/completions`.

## 23. المصادقة والصلاحيات

صفحات الدخول والتسجيل والخروج واجهات فقط. نموذج الدخول بلا `action` مفيد. لا جلسات Flask للمستخدم. مفاتيح الواجهات الخارجية داخل الكود بلا طبقة تسجيل دخول.

## 24. الأمان

الموجود: قص الرد إلى 300 كلمة في `server.py`. CORS مفتوح على تطبيق Flask.

غير الموجود كحماية للمستخدم: جلسات، صلاحيات، حد محاولات، CSRF، تخزين المفاتيح خارج الكود.

`debug=True` في تشغيل Flask يعرض تفاصيل عند الخطأ. مفاتيح API الثابتة في المصدر تُعد سرًا مكشوفًا داخل المستودع المحلي ويجب تدويرها خارج هذا التوثيق، دون كتابة القيم هنا.

## 25. الإعدادات

| المكان | المحتوى |
| --- | --- |
| ثوابت داخل ملفات Python | مفاتيح API وأرقام المباريات والمنافذ |
| `config.php` | اتصال MySQL نائب |
| `settings.json` | مسار تحليل Python `./backend` غير الموجود |

لا `.env`. لا تُذكر قيم المفاتيح.

## 26. التكاملات

| الخدمة | الاستخدام |
| --- | --- |
| API-Football (`v3.football.api-sports.io`) | مباريات وإحصاءات وأحداث، الرأس `x-apisports-key` |
| DeepSeek | النموذج `deepseek-chat` |
| Web Speech | نطق الرد في المتصفح |

لا بريد ولا تخزين سحابي.

## 27. المهام المجدولة

موثقة في القسم 11. تعمل فقط ما دامت عملية Python شغالة. ليست Cron على نظام التشغيل.

## 28. تخزين الملفات

الفيديو والصوت والصور في جذر المشروع.

| الملف | ملاحظة |
| --- | --- |
| `videoplayback.mp4` | مصدر الفيديو في `live-match.html` و `offline.html`. الحجم أقل من 100 ميجابايت |
| `your-video.mp4` | في الجذر. `profile.js` يطلب `videos/your-video.mp4` |
| `beep.mp3` | في الجذر. الصفحة المباشرة تطلبه من الجذر، وصفحة المسجّل تطلب `videos/beep.mp3` |

لا مجلد رفع للمستخدم.

## 29. السجلات والمراقبة

`print` في `server.py` لحالة المباراة والأخطاء. لا ملفات log ولا تنبيهات. استثناء السؤال في `server.py` يعيد رسالة عربية عامة مع طباعة الخطأ في الطرفية.

## 30. التثبيت

1. Python مع الحزم المستوردة: `flask` و `flask-cors` و `requests` و `apscheduler`. لا ملف متطلبات يثبت الإصدارات.
2. انقل المفاتيح إلى متغيرات بيئة قبل أي تشغيل مشترك. القيم الحالية داخل الملفات ولا تُنسخ هنا.
3. للواجهة التي تنادي 5000:

```
python live_match_server.py
```

4. للمسار غير المباشر، عملية منفصلة تشغّل `offline_server.py` ولا يمكنها مشاركة المنفذ 5000 مع الخادم السابق في الوقت نفسه.
5. `server.py` منفذ مختلف:

```
python server.py
```

6. افتح `index.html` أو `live-match.html` عبر خادم ملفات أو مباشرة. طلبات `fetch` إلى `127.0.0.1` تحتاج الخادم المناسب شغّالًا.
7. README السابق يذكر `cd backend` ثم `python server.py`. مجلد `backend` غير موجود، والسكربت في الجذر.

## 31. دليل التطوير

- صفحة: أضف HTML في الجذر واربط CSS. القائمة منسوخة في أكثر من صفحة.
- مسار API: دالة في ملف Flask الحالي مع `@app.route`.
- مباراة جديدة: غيّر `fixture_id` في الملف الذي ستشغّله. يوجد رقمان مختلفان اليوم.
- جدول أو صلاحية: لا بنية جاهزة.
- لا تُضف المفاتيح داخل الملف. README السابق لا يذكر أنها مكتوبة في المصدر.

## 32. النشر

غير موثق. `debug=True` والمفاتيح داخل الكود والمنفذ 200 أو 5000 على الجهاز المحلي لا تمثل إعداد إنتاج. لا `Dockerfile` ولا ملف منصة نشر.

## 33. النسخ الاحتياطي

غير موجود في الملفات الحالية. الحالة الحية (`latest_stats`) في الذاكرة وتُفقد عند إيقاف العملية.

## 34. استكشاف الأخطاء

| العرض | السبب المطابق للملفات |
| --- | --- |
| الواجهة لا تجيب والمطور شغّل `server.py` فقط | الواجهة تنادي المنفذ 5000 لا 200 |
| مباراة غير المتوقعة | 1098863 في `server.py` و 1218540 في `live_match_server.py` |
| الملف الشخصي 404 | الرابط `Profile.html` والملف `profile2.html` |
| الفيديو في الملف الشخصي لا يعمل | المسار `videos/your-video.mp4` والمجلد غير موجود |
| صوت الصفحة المسجّلة لا يعمل | `videos/beep.mp3` والمقطع في الجذر |
| أيقونات الرئيسية لا تُحمّل | مسار Font Awesome يبدأ بـ `../CSS/https://` |
| رد «المباراة بدأت مؤخرًا» | لا إحصاءات ولا أحداث مخزنة في `server.py` |
| فشل DeepSeek أو API-Football | مفتاح أو شبكة أو حالة HTTP. لا تُطبع المفاتيح في السجلات العامة |

## 35. الاعتماديات

مستوردة في الكود بلا أرقام إصدارات: Flask، Flask-CORS، requests، APScheduler. PHP mysqli لملف `config.php` فقط. ملفات `prompt_builder.cpython-310.pyc` و `312` و `313` نواتج تشغيل محلية وليست مصدرًا.

## 36. القيود المعروفة

- اسما منتج في الواجهة: هامة فوز وأخطبوط روشن.
- منفذان ورقما مباراة مختلفان.
- الدخول لا يحفظ.
- مفاتيح API داخل المصدر.
- README السابق يذكر `images/` و `videos/` و `highlights.csv` و `backend/` وهي غير موجودة بهذه الأسماء.
- `profile.js` و `offline.html` يشيران إلى مجلد `videos/` غير الموجود.
- لا أيقونة تبويب.

## 37. حالة النظام الحالية

| الحالة | التفاصيل |
| --- | --- |
| موجود | واجهات HTML، ثلاثة خوادم Flask، بناء التعليمات، صور، مقطعا فيديو، صوت |
| يعمل بشرط تشغيل الخادم الصحيح والمفاتيح | السؤال والملخص |
| غير مكتمل | حسابات، توحيد المنفذ ورقم المباراة، مسارات الوسائط |
| غير موثق كإصدار | سجل إصدارات |

## 38. القرارات المعمارية

استنتاج من الكود: التحليل ليس من رؤية الفيديو، بل من أرقام API-Football ثم نموذج لغوي. الفيديو ملف محلي للعرض. وجود `server.py` و `live_match_server.py` معًا يكرر مسار `/ask` بإعدادين مختلفين. `prompt_builder.py` مشترك حتى يبقى نص المساعد في مكان واحد.

## 39. سجل التغييرات

غير موجود في الملفات الحالية كسجل إصدارات. التذييل في `index.html` يذكر 2025. README السابق يصف المزايا بصياغة أقدم ولا يطابق شجرة الملفات الحالية في مجلدات `backend` و `images` و `videos`.

## System Overview

```
مشاهد
  -> صفحات هامة فوز
       |                 \
       |                  +-> فيديو وصور محلية
       v
  Flask :5000 أو :200
       |
       +-> API-Football
       +-> DeepSeek
       +-> نص أخطبوط روشن
```

## Quick Reference

| الجزء | التقنية | الموقع | الوظيفة |
| --- | --- | --- | --- |
| الرئيسية | HTML/JS | `index.html` `index.js` | هامة فوز وجلب مباريات |
| البث | HTML/JS | `live-match.html` `live-match.js` | سؤال ونطق وملخص |
| المسجّل | HTML/JS | `offline.html` `offline-match.js` | ملخص غير مباشر |
| الملف | HTML/JS | `profile2.html` `profile.js` | عرض شخصي |
| الخادم 200 | Flask | `server.py` | `/ask` ومجدول |
| الخادم 5000 | Flask | `live_match_server.py` | ملخص مباشر وسؤال |
| غير المباشر | Flask | `offline_server.py` | `/offline-summary` |
| التعليمات | Python | `prompt_builder.py` | نص المساعد |
| اتصال نائب | PHP | `config.php` | MySQL غير مستخدم من الواجهة |

## Quick Start

```
pip install flask flask-cors requests apscheduler
python live_match_server.py
```

ثم افتح `live-match.html` مع خادم ملفات محلي. لا تشغّل `offline_server.py` على نفس المنفذ في الوقت نفسه.

## For Non-Technical Users

- ما هو النظام؟ صفحات مشاهدة وتحليل لمباراة كرة قدم، والمساعد الظاهر اسمه أخطبوط روشن، واسم الصفحة الرئيسية هامة فوز.
- ماذا يفعل؟ يعرض فيديو محفوظًا ويجيب عن أسئلة اعتمادًا على أرقام المباراة من خدمة خارجية.
- كيف يُستخدم؟ تشغيل برنامج الخادم على الجهاز ثم فتح صفحة البث وكتابة السؤال. يمكن تفعيل النطق من الزر في الصفحة.
- أهم الأقسام: الرئيسية، حول، البث المباشر، المسجّل، وصفحات الدخول والملف.
- تسجيل الدخول الظاهر لا ينشئ حسابًا في النسخة الحالية.

## For Developers

- التقنيات: HTML و CSS و JavaScript و Flask و API-Football و DeepSeek.
- المعمارية: واجهة تستدعي المنفذ 5000، وملف `server.py` منفصل على 200.
- قاعدة البيانات: غير منفذة. `config.php` نائب.
- API الداخلي: `/ask` و `/live-summary` و `/offline-summary`.
- أهم الملفات: `live-match.js`، `live_match_server.py`، `server.py`، `prompt_builder.py`، `offline_server.py`.
- التطوير: وحّد رقم المباراة والمنفذ، وأخرج المفاتيح من المصدر، وصحح مسارات `Profile.html` و `videos/`. لا تُكتب قيم المفاتيح في التوثيق ولا في المحادثة.
