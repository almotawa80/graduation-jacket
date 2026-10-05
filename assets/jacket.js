/* رسم الجاكيت (أمام وخلف) بـ SVG، مع الاسم والرقم على الظهر وشعار المدرسة على الصدر */
(function (global) {
  var BEIGE = "#cbc5a5", seq = 0;

  /* صور الجاكيت الحقيقية (خلفية شفافة) والنص فوقها. إحداثيات الـ viewBox: 600 × 782 */
  var VB = 'viewBox="0 0 600 782"';
  function backSvg() {
    return '<svg xmlns="http://www.w3.org/2000/svg" ' + VB + ' role="img" aria-label="ظهر جاكيت التخرج">' +
      '<image href="assets/hoodie-back.webp" x="0" y="0" width="600" height="782"/>' +
      '<g>' +
        '<text class="jName" x="300" y="408" text-anchor="middle" direction="rtl" fill="' + BEIGE + '" style="font-family:\'Foda Display\',serif" font-size="86"></text>' +
        '<text class="jNum" x="300" y="556" text-anchor="middle" fill="' + BEIGE + '" style="font-family:\'Jacket Num\',serif;font-weight:800" font-size="150"></text>' +
      '</g></svg>';
  }
  function frontSvg() {
    return '<svg xmlns="http://www.w3.org/2000/svg" ' + VB + ' role="img" aria-label="أمام جاكيت التخرج">' +
      '<image href="assets/hoodie-front.webp" x="0" y="0" width="600" height="782"/>' +
      /* شعار المدرسة على الصدر الأيسر للابس */
      '<image href="assets/logo-chest.webp" x="378" y="262" width="78" height="63" preserveAspectRatio="xMidYMid meet"/>' +
      '</svg>';
  }

  function mount(el) {
    var p = "j" + (++seq) + "-";
    el.innerHTML = '<div class="jwrap" data-view="back">' +
      '<div class="jview jv-back">' + backSvg() + '</div>' +
      '<div class="jview jv-front"></div>' +
      '<div class="jtoggle" role="group" aria-label="وجه الجاكيت"><button type="button" data-v="back" aria-pressed="true">' + (window.IC?IC("shirt"):"") + 'الخلف</button><button type="button" data-v="front" aria-pressed="false">' + (window.IC?IC("shirt"):"") + 'الأمام</button></div>' +
      '</div>';
    var wrap = el.querySelector(".jwrap"); wrap.__p = p;
    wrap.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("button[data-v]"); if (b) show(wrap, b.getAttribute("data-v"));
    });
    return wrap.querySelector(".jv-back svg");
  }

  function show(node, view) {
    var wrap = node.closest ? node.closest(".jwrap") : node;
    if (!wrap) return;
    if (view === "front" && !wrap.__front) { wrap.__front = true; wrap.querySelector(".jv-front").innerHTML = frontSvg(); }
    wrap.setAttribute("data-view", view);
    wrap.querySelectorAll(".jtoggle button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-v") === view)); });
  }

  function fit(node, maxW, maxSize, minSize) {
    var size = maxSize;
    node.setAttribute("font-size", size);
    var w = node.getComputedTextLength ? node.getComputedTextLength() : 0;
    if (w > maxW && w > 0) size = Math.max(minSize, Math.floor(maxSize * maxW / w));
    node.setAttribute("font-size", size);
  }

  function update(svg, name, number) {
    var n = svg.querySelector(".jName"), d = svg.querySelector(".jNum");
    n.textContent = name || ""; d.textContent = number || "";
    fit(n, 240, 92, 38);
    fit(d, 190, 150, 60);
  }

  global.Jacket = { mount: mount, update: update, show: show };
})(window);
