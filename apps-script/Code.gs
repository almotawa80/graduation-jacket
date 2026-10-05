/**
 * خلفية طلبات جاكيت التخرج — Google Apps Script مرتبط بجدول Google Sheets.
 * خطوات الإعداد في DEPLOY.md.
 * كلمة مرور المدير: Project Settings > Script properties > ADMIN_KEY
 */
var DEFAULTS = {
  open: true, closedMessage: 'باب الطلبات مغلق حالياً.', maxChars: 8, number: '28',
  sizes: ['S', 'M', 'L', 'XL', 'XXL'], countryCode: '965', title: 'جاكيت التخرج',
  intro: 'اكتب الاسم أو الختم الذي ترغب بظهوره على ظهر الجاكيت، واختر مقاسك، ثم أرسل الطلب.',
  approveMsg: 'السلام عليكم {student}،\nتم اعتماد طلبك لجاكيت التخرج:\nالاسم على الجاكيت: {name}\nالمقاس: {size}\nشكراً لك.',
  editMsg: 'السلام عليكم {student}،\nنأمل تعديل الاسم المكتوب على الجاكيت ({name}) وإعادة إرسال الطلب من نفس الرابط برقم هاتفك نفسه.\nشكراً لك.'
};
var HEAD = ['id', 'createdAt', 'student', 'grade', 'phone', 'size', 'jacketName', 'number', 'status', 'updatedAt'];

function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function props_() { return PropertiesService.getScriptProperties(); }
function settings_() {
  var raw = props_().getProperty('SETTINGS'), s = {};
  try { s = raw ? JSON.parse(raw) : {}; } catch (e) {}
  var r = {}; for (var k2 in DEFAULTS) r[k2] = (s[k2] !== undefined ? s[k2] : DEFAULTS[k2]);
  return r;
}
function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet(), sh = ss.getSheetByName('Orders');
  if (!sh) { sh = ss.insertSheet('Orders'); sh.appendRow(HEAD); sh.setFrozenRows(1); sh.getRange('E:E').setNumberFormat('@'); }
  return sh;
}
function rows_() {
  var sh = sheet_(), v = sh.getDataRange().getValues(), res = [];
  for (var i = 1; i < v.length; i++) {
    var o = {}; for (var j = 0; j < HEAD.length; j++) o[HEAD[j]] = v[i][j];
    o.createdAt = o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt;
    o.updatedAt = o.updatedAt instanceof Date ? o.updatedAt.toISOString() : o.updatedAt;
    o.phone = String(o.phone); o._row = i + 1; res.push(o);
  }
  return res;
}
function digits_(s) {
  return String(s || '').replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); }).replace(/\D/g, '');
}
function pub_(s) { return { open: s.open, closedMessage: s.closedMessage, maxChars: s.maxChars, number: s.number, sizes: s.sizes, title: s.title, intro: s.intro }; }
function isAdmin_(k) { var a = props_().getProperty('ADMIN_KEY'); return !!a && k === a; }

function doGet(e) {
  var a = e && e.parameter && e.parameter.action;
  if (a === 'settings') return out_({ ok: true, settings: pub_(settings_()) });
  return out_({ ok: true, service: 'jacket-orders' });
}

function doPost(e) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    var p = JSON.parse(e.postData.contents), s = settings_();
    if (p.action === 'submit') return out_(submit_(p.order || {}, s));
    if (!isAdmin_(p.key)) return out_({ ok: false, error: 'كلمة المرور غير صحيحة' });
    if (p.action === 'orders') { var os = rows_(); os.forEach(function (o) { delete o._row; }); return out_({ ok: true, orders: os, settings: s }); }
    if (p.action === 'setStatus') {
      if (['new', 'approved', 'edit', 'cancelled'].indexOf(p.status) < 0) return out_({ ok: false, error: 'حالة غير صالحة' });
      var r = rows_().filter(function (o) { return String(o.id) === String(p.id); })[0];
      if (!r) return out_({ ok: false, error: 'الطلب غير موجود' });
      var sh = sheet_(); sh.getRange(r._row, HEAD.indexOf('status') + 1).setValue(p.status);
      sh.getRange(r._row, HEAD.indexOf('updatedAt') + 1).setValue(new Date());
      return out_({ ok: true });
    }
    if (p.action === 'deleteOrder') {
      var d = rows_().filter(function (o) { return String(o.id) === String(p.id); })[0];
      if (!d) return out_({ ok: false, error: 'الطلب غير موجود' });
      if (d.status !== 'cancelled') return out_({ ok: false, error: 'لا يُحذف نهائياً إلا الطلب الملغي' });
      sheet_().deleteRow(d._row);
      return out_({ ok: true });
    }
    if (p.action === 'saveSettings') {
      var n = p.settings || {}, c = {};
      for (var k in DEFAULTS) c[k] = (n[k] !== undefined ? n[k] : s[k]);
      c.maxChars = Math.max(1, Math.min(30, +c.maxChars || 8));
      props_().setProperty('SETTINGS', JSON.stringify(c)); return out_({ ok: true });
    }
    return out_({ ok: false, error: 'طلب غير معروف' });
  } catch (err) { return out_({ ok: false, error: 'خطأ في الخادم' }); }
  finally { lock.releaseLock(); }
}

function submit_(o, s) {
  if (!s.open) return { ok: false, error: s.closedMessage };
  var jn = String(o.jacketName || '').trim(), size = String(o.size || ''), st = String(o.student || '').trim(), gr = String(o.grade || '').trim(), ph = digits_(o.phone);
  if (!/^[ء-غف-يـ ]+$/.test(jn)) return { ok: false, error: 'الاسم على الجاكيت يجب أن يكون بحروف عربية.' };
  if (jn.length > s.maxChars) return { ok: false, error: 'الاسم أطول من الحد المسموح (' + s.maxChars + ' حروف).' };
  if (s.sizes.indexOf(size) < 0) return { ok: false, error: 'المقاس غير متاح.' };
  if (st.length < 3 || !gr || ph.length !== 8) return { ok: false, error: 'بيانات التحقق غير مكتملة.' };
  var rows = rows_(), ex = rows.filter(function (r) { return digits_(r.phone) === ph && r.status !== 'cancelled'; })[0], sh = sheet_();
  if (ex) {
    if (ex.status !== 'edit') return { ok: false, error: 'يوجد طلب مسجّل بهذا الرقم مسبقاً. للتعديل تواصل مع المشرف.' };
    sh.getRange(ex._row, 3, 1, 5).setValues([[st, gr, ph, size, jn]]);
    sh.getRange(ex._row, 9, 1, 2).setValues([['new', new Date()]]);
    return { ok: true, id: ex.id, updated: true };
  }
  var id = rows.length ? Math.max.apply(null, rows.map(function (r) { return +r.id || 1000; })) + 1 : 1001;
  sh.appendRow([id, new Date(), st, gr, ph, size, jn, s.number, 'new', '']);
  return { ok: true, id: id };
}

/** شغّل هذه الدالة مرة واحدة لإنشاء ورقة الطلبات */
function setup() { sheet_(); }
