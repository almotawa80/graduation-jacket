/* بطاقة الطلب كصورة PNG: تُرسم على canvas بنفس إحداثيات معاينة الجاكيت */
(function (g) {
  var W = 1080, H = 1400, GOLD = "#c9a24b", BEIGE = "#cbc5a5";
  function img(src) { return new Promise(function (ok) { var i = new Image(); i.onload = function () { ok(i); }; i.onerror = function () { ok(null); }; i.src = src; }); }
  function fitText(c, t, maxW, size, min, font, weight) {
    for (; size > min; size -= 2) { c.font = (weight || "") + " " + size + "px " + font; if (c.measureText(t).width <= maxW) break; }
    return size;
  }
  async function build(o) {
    try { await Promise.all([document.fonts.load('80px "Foda Display"'), document.fonts.load('800 80px "Jacket Num"'), document.fonts.load('700 40px "Tajawal"')]); } catch (e) {}
    var res = await Promise.all([img("assets/hoodie-back.webp"), img("assets/logo-word.webp")]);
    var cv = document.createElement("canvas"); cv.width = W; cv.height = H; var c = cv.getContext("2d");
    var bg = c.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, "#252d6b"); bg.addColorStop(1, "#141838");
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    c.strokeStyle = GOLD; c.lineWidth = 4; c.strokeRect(28, 28, W - 56, H - 56);
    c.direction = "rtl"; c.textAlign = "center"; c.textBaseline = "alphabetic";
    c.fillStyle = GOLD; c.font = "700 34px Tajawal"; c.fillText("دفعة التخرج", W / 2, 100);
    c.fillStyle = "#fff"; c.font = "700 56px Tajawal"; c.fillText("جاكيت التخرج", W / 2, 170);
    /* الجاكيت */
    var s = 1.12, jw = 600 * s, jh = 782 * s, jx = (W - jw) / 2, jy = 230;
    var halo = c.createRadialGradient(W / 2, jy + jh * .45, 40, W / 2, jy + jh * .45, 520); halo.addColorStop(0, "rgba(255,255,255,.18)"); halo.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = halo; c.fillRect(0, jy - 40, W, jh + 80);
    if (res[0]) c.drawImage(res[0], jx, jy, jw, jh);
    c.fillStyle = BEIGE;
    var name = o.name || "", nSize = fitText(c, name, 240 * s, 92 * s, 38 * s, '"Foda Display"', "");
    c.font = nSize + 'px "Foda Display"'; c.fillText(name, W / 2, jy + 408 * s);
    var num = String(o.number || ""), dSize = fitText(c, num, 190 * s, 150 * s, 60 * s, '"Jacket Num"', "800");
    c.font = "800 " + dSize + 'px "Jacket Num"'; c.fillText(num, W / 2, jy + 556 * s);
    /* التفاصيل */
    var y = jy + jh + 30;
    c.fillStyle = GOLD; c.font = "700 64px Tajawal"; c.fillText("طلب رقم " + o.id, W / 2, y + 20);
    c.fillStyle = "#e9e6d6"; c.font = "400 38px Tajawal"; c.fillText(o.student + "  ·  المقاس " + o.size, W / 2, y + 80);
    if (res[1]) { var lh = 70, lw = res[1].width * lh / res[1].height; c.drawImage(res[1], (W - lw) / 2, H - 140, lw, lh); }
    return cv;
  }
  async function save(o) {
    var cv = await build(o);
    var blob = await new Promise(function (r) { cv.toBlob(r, "image/png"); });
    var file = new File([blob], "jacket-order-" + o.id + ".png", { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: "طلب جاكيت التخرج" }); return; } catch (e) { if (e && e.name === "AbortError") return; }
    }
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = file.name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }
  g.JacketCard = { build: build, save: save };
})(window);
