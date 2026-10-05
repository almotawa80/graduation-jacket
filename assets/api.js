/* طبقة الاتصال: Google Apps Script الحقيقي، أو وضع تجريبي محلي عند عدم وجود رابط */
(function (g) {
  var DEFAULTS = {
    open: true,
    closedMessage: "باب الطلبات مغلق حالياً.",
    maxChars: 8,
    number: "28",
    sizes: ["S", "M", "L", "XL", "XXL"],
    countryCode: "965",
    title: "جاكيت التخرج",
    intro: "اكتب الاسم أو الختم الذي ترغب بظهوره على ظهر الجاكيت، واختر مقاسك، ثم أرسل الطلب.",
    approveMsg: "السلام عليكم {student}،\nتم اعتماد طلبك لجاكيت التخرج:\nالاسم على الجاكيت: {name}\nالمقاس: {size}\nشكراً لك.",
    editMsg: "السلام عليكم {student}،\nنأمل تعديل الاسم المكتوب على الجاكيت ({name}) وإعادة إرسال الطلب من نفس الرابط برقم هاتفك نفسه.\nشكراً لك."
  };
  var ALL_SIZES = ["S", "M", "L", "XL", "XXL"];
  var url = (g.APP_CONFIG && g.APP_CONFIG.API_URL) || "";
  var demo = !url;

  var mem = {};
  function ls(k, d) { try { var v = localStorage.getItem(k); if (v) return JSON.parse(v); } catch (e) {} return mem[k] !== undefined ? mem[k] : d; }
  function sv(k, v) { mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  function digits(s) {
    return String(s || "").replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); })
      .replace(/[۰-۹]/g, function (d) { return "۰۱۲۳۴۵۶۷۸۹".indexOf(d); }).replace(/\D/g, "");
  }

  function mock(action, p) {
    var st = Object.assign({}, DEFAULTS, ls("jk_settings", {}));
    var orders = ls("jk_orders", []);
    if (action === "settings") return { ok: true, settings: pub(st) };
    if (action === "submit") {
      if (!st.open) return { ok: false, error: st.closedMessage };
      var o = p.order, ph = digits(o.phone);
      var ex = orders.filter(function (x) { return digits(x.phone) === ph && x.status !== "cancelled"; })[0];
      if (ex) {
        if (ex.status === "edit") {
          ex.jacketName = o.jacketName; ex.size = o.size; ex.student = o.student; ex.grade = o.grade;
          ex.status = "new"; ex.updatedAt = new Date().toISOString(); sv("jk_orders", orders);
          return { ok: true, id: ex.id, updated: true };
        }
        return { ok: false, error: "يوجد طلب مسجّل بهذا الرقم مسبقاً. للتعديل تواصل مع المشرف." };
      }
      var id = (orders.length ? Math.max.apply(null, orders.map(function (x) { return x.id; })) : 1000) + 1;
      orders.push({ id: id, createdAt: new Date().toISOString(), student: o.student, grade: o.grade, phone: ph, size: o.size,
        jacketName: o.jacketName, number: st.number, status: "new", updatedAt: "" });
      sv("jk_orders", orders); return { ok: true, id: id };
    }
    if (p.key !== "admin") return { ok: false, error: "كلمة المرور غير صحيحة" };
    if (action === "orders") return { ok: true, orders: orders, settings: st };
    if (action === "setStatus") {
      orders.forEach(function (x) { if (x.id === p.id) { x.status = p.status; x.updatedAt = new Date().toISOString(); } });
      sv("jk_orders", orders); return { ok: true };
    }
    if (action === "saveSettings") { sv("jk_settings", p.settings); return { ok: true }; }
    return { ok: false, error: "طلب غير معروف" };
  }

  function pub(s) {
    return { open: s.open, closedMessage: s.closedMessage, maxChars: s.maxChars, number: s.number, sizes: s.sizes, title: s.title, intro: s.intro };
  }

  async function call(action, p) {
    p = p || {};
    if (demo) return mock(action, p);
    try {
      var r;
      if (action === "settings") r = await fetch(url + "?action=settings");
      else r = await fetch(url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(Object.assign({ action: action }, p)) });
      return await r.json();
    } catch (e) { return { ok: false, error: "تعذّر الاتصال بالخادم، تحقق من الإنترنت وأعد المحاولة." }; }
  }

  g.API = { call: call, demo: demo, DEFAULTS: DEFAULTS, ALL_SIZES: ALL_SIZES, digits: digits };
})(window);
