/**
 * خلفية طلبات جاكيت التخرج — Cloudflare Worker + قاعدة D1
 * الربط المطلوب: قاعدة D1 باسم المتغير DB، وسرّ باسم ADMIN_KEY (كلمة مرور المدير).
 */
const DEFAULTS = {
  open: true, closedMessage: "باب الطلبات مغلق حالياً.", maxChars: 8, number: "28",
  sizes: ["S", "M", "L", "XL", "XXL"], countryCode: "965", title: "جاكيت التخرج",
  intro: "اكتب الاسم أو الختم الذي ترغب بظهوره على ظهر الجاكيت، واختر مقاسك، ثم أرسل الطلب.",
  approveMsg: "السلام عليكم {student}،\nتم اعتماد طلبك لجاكيت التخرج:\nالاسم على الجاكيت: {name}\nالمقاس: {size}\nشكراً لك.",
  editMsg: "السلام عليكم {student}،\nنأمل تعديل الاسم المكتوب على الجاكيت ({name}) وإعادة إرسال الطلب من نفس الرابط برقم هاتفك نفسه.\nشكراً لك."
};
const ALL_SIZES = ["S", "M", "L", "XL", "XXL"];
const STATUSES = ["new", "approved", "edit", "cancelled"];
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" };

let ready = null;
function init(env) {
  if (!ready) ready = env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, created_at TEXT NOT NULL, updated_at TEXT, student TEXT NOT NULL, grade TEXT NOT NULL, phone TEXT NOT NULL, size TEXT NOT NULL, jacket_name TEXT NOT NULL, number TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new')"),
    env.DB.prepare("CREATE INDEX IF NOT EXISTS orders_phone ON orders (phone)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL)")
  ]).catch(e => { ready = null; throw e; });
  return ready;
}

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...CORS } });

function digits(s) {
  return String(s == null ? "" : s).replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)).replace(/\D/g, "");
}
async function getSettings(env) {
  const row = await env.DB.prepare("SELECT data FROM settings WHERE id = 1").first();
  let s = {}; try { s = row ? JSON.parse(row.data) : {}; } catch (e) {}
  return { ...DEFAULTS, ...s };
}
const pub = s => ({ open: s.open, closedMessage: s.closedMessage, maxChars: s.maxChars, number: s.number, sizes: s.sizes, title: s.title, intro: s.intro });
const rowToOrder = r => ({ id: r.id, createdAt: r.created_at, student: r.student, grade: r.grade, phone: r.phone, size: r.size, jacketName: r.jacket_name, number: r.number, status: r.status, updatedAt: r.updated_at || "" });

async function isAdmin(env, key) {
  const a = env.ADMIN_KEY || "";
  const ok = !!a && typeof key === "string" && key.length === a.length && [...a].every((c, i) => c === key[i]);
  if (!ok) await new Promise(r => setTimeout(r, 400));
  return ok;
}

async function submit(env, o, s) {
  if (!s.open) return { ok: false, error: s.closedMessage };
  const jn = String(o.jacketName || "").trim(), size = String(o.size || ""), st = String(o.student || "").trim(), gr = String(o.grade || "").trim(), ph = digits(o.phone);
  if (!/^[ء-غف-يـ ]+$/.test(jn)) return { ok: false, error: "الاسم على الجاكيت يجب أن يكون بحروف عربية." };
  if ([...jn].length > s.maxChars) return { ok: false, error: "الاسم أطول من الحد المسموح (" + s.maxChars + " حروف)." };
  if (!s.sizes.includes(size)) return { ok: false, error: "المقاس غير متاح." };
  if (st.length < 3 || st.length > 80 || !gr || gr.length > 40 || ph.length !== 8) return { ok: false, error: "بيانات التحقق غير مكتملة." };
  const now = new Date().toISOString();
  const ex = await env.DB.prepare("SELECT id, status FROM orders WHERE phone = ? AND status <> 'cancelled' ORDER BY id DESC LIMIT 1").bind(ph).first();
  if (ex) {
    if (ex.status !== "edit") return { ok: false, error: "يوجد طلب مسجّل بهذا الرقم مسبقاً. للتعديل تواصل مع المشرف." };
    await env.DB.prepare("UPDATE orders SET student = ?, grade = ?, size = ?, jacket_name = ?, status = 'new', updated_at = ? WHERE id = ?").bind(st, gr, size, jn, now, ex.id).run();
    return { ok: true, id: ex.id, updated: true };
  }
  const r = await env.DB.prepare("INSERT INTO orders (id, created_at, student, grade, phone, size, jacket_name, number, status) VALUES ((SELECT COALESCE(MAX(id), 1000) + 1 FROM orders), ?, ?, ?, ?, ?, ?, ?, 'new') RETURNING id")
    .bind(now, st, gr, ph, size, jn, String(s.number)).first();
  return { ok: true, id: r.id };
}

async function handle(env, p) {
  const s = await getSettings(env), a = p.action;
  if (a === "settings") return { ok: true, settings: pub(s) };
  if (a === "submit") return submit(env, p.order || {}, s);
  if (!(await isAdmin(env, p.key))) return { ok: false, error: "كلمة المرور غير صحيحة" };
  if (a === "orders") {
    const { results } = await env.DB.prepare("SELECT * FROM orders ORDER BY id").all();
    return { ok: true, orders: results.map(rowToOrder), settings: s };
  }
  if (a === "setStatus") {
    if (!STATUSES.includes(p.status)) return { ok: false, error: "حالة غير صالحة" };
    const r = await env.DB.prepare("UPDATE orders SET status = ?, updated_at = ? WHERE id = ?").bind(p.status, new Date().toISOString(), Number(p.id)).run();
    return r.meta.changes ? { ok: true } : { ok: false, error: "الطلب غير موجود" };
  }
  if (a === "deleteOrder") {
    const row = await env.DB.prepare("SELECT status FROM orders WHERE id = ?").bind(Number(p.id)).first();
    if (!row) return { ok: false, error: "الطلب غير موجود" };
    if (row.status !== "cancelled") return { ok: false, error: "لا يُحذف نهائياً إلا الطلب الملغي" };
    await env.DB.prepare("DELETE FROM orders WHERE id = ?").bind(Number(p.id)).run();
    return { ok: true };
  }
  if (a === "saveSettings") {
    const n = p.settings || {}, next = { ...s };
    for (const k of Object.keys(DEFAULTS)) if (n[k] !== undefined) next[k] = n[k];
    next.maxChars = Math.max(1, Math.min(30, Number(next.maxChars) || 8));
    next.sizes = (Array.isArray(next.sizes) ? next.sizes : []).filter(z => ALL_SIZES.includes(z));
    if (!next.sizes.length) return { ok: false, error: "اختر مقاساً واحداً على الأقل." };
    await env.DB.prepare("INSERT INTO settings (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data").bind(JSON.stringify(next)).run();
    return { ok: true };
  }
  return { ok: false, error: "طلب غير معروف" };
}

export default {
  async fetch(req, env) {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    try {
      await init(env);
      if (req.method === "GET") {
        const a = new URL(req.url).searchParams.get("action");
        return json(a === "settings" ? await handle(env, { action: "settings" }) : { ok: true, service: "jacket-orders" });
      }
      if (req.method !== "POST") return json({ ok: false, error: "طريقة غير مدعومة" }, 405);
      let p; try { p = JSON.parse(await req.text()); } catch (e) { return json({ ok: false, error: "طلب غير صالح" }, 400); }
      return json(await handle(env, p || {}));
    } catch (e) {
      return json({ ok: false, error: "خطأ في الخادم: " + (e && e.message || e) }, 500);
    }
  }
};
