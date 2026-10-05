/* رسم الجاكيت (أمام وخلف) بـ SVG، مع الاسم والرقم على الظهر وشعار المدرسة على الصدر */
(function (global) {
  var BEIGE = "#cbc5a5", seq = 0;

  /* هندسة مشتركة (إحداثيات مستخرجة من الصور القريبة) */
  var SLEEVE_L = "M122 248 C86 268 52 320 40 385 C32 418 40 448 60 470 L100 515 L140 500 C146 465 150 420 152 350 L152 300 C146 272 136 255 122 248 Z";
  var SLEEVE_R = "M478 248 C514 268 548 320 560 385 C568 418 560 448 540 470 L500 515 L460 500 C454 465 450 420 448 350 L448 300 C454 272 464 255 478 248 Z";
  var CUFF_L = "M100 515 L140 500 L148 526 L108 545 Z";
  var CUFF_R = "M500 515 L460 500 L452 526 L492 545 Z";
  var BODY = "M205 208 L125 248 L152 300 L150 430 L152 560 L448 560 L450 430 L448 300 L475 248 L395 208 C350 220 250 220 205 208 Z";
  var HEM = "M152 548 L448 548 L452 596 C390 610 210 610 148 596 Z";

  function defs(p) {
    return '<defs>' +
     '<linearGradient id="' + p + 'body" x1="0" x2="1"><stop offset="0" stop-color="#141943"/><stop offset=".25" stop-color="#232b67"/><stop offset=".5" stop-color="#2f3880"/><stop offset=".75" stop-color="#232b67"/><stop offset="1" stop-color="#141943"/></linearGradient>' +
     '<linearGradient id="' + p + 'slL" x1="0" x2="1"><stop offset="0" stop-color="#121740"/><stop offset=".55" stop-color="#262e6c"/><stop offset="1" stop-color="#1b2152"/></linearGradient>' +
     '<linearGradient id="' + p + 'slR" x1="1" x2="0"><stop offset="0" stop-color="#121740"/><stop offset=".55" stop-color="#262e6c"/><stop offset="1" stop-color="#1b2152"/></linearGradient>' +
     '<radialGradient id="' + p + 'hood" cx=".5" cy=".3" r=".8"><stop offset="0" stop-color="#34408f"/><stop offset=".6" stop-color="#232b67"/><stop offset="1" stop-color="#141943"/></radialGradient>' +
     '<linearGradient id="' + p + 'lin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6edcc"/><stop offset="1" stop-color="#d6c692"/></linearGradient>' +
     '<pattern id="' + p + 'rib" width="8" height="10" patternUnits="userSpaceOnUse"><rect width="3" height="10" fill="#fff" opacity=".08"/></pattern>' +
     '<radialGradient id="' + p + 'fl"><stop offset="0" stop-color="#141943" stop-opacity=".34"/><stop offset=".6" stop-color="#141943" stop-opacity=".14"/><stop offset="1" stop-color="#141943" stop-opacity="0"/></radialGradient>' +
    '</defs>';
  }

  function common(p) {
    return '<ellipse cx="300" cy="642" rx="240" ry="22" fill="url(#' + p + 'fl)"/>';
  }

  function sleeves(p) {
    return '<path d="' + SLEEVE_L + '" fill="url(#' + p + 'slL)"/><path d="' + SLEEVE_R + '" fill="url(#' + p + 'slR)"/>' +
      '<path d="' + CUFF_L + '" fill="#111538"/><path d="' + CUFF_R + '" fill="#111538"/>' +
      '<path d="' + CUFF_L + '" fill="url(#' + p + 'rib)"/><path d="' + CUFF_R + '" fill="url(#' + p + 'rib)"/>';
  }
  function hem(p) {
    return '<path d="' + HEM + '" fill="#111538"/><path d="' + HEM + '" fill="url(#' + p + 'rib)"/>';
  }
  function folds() {
    return '<g fill="none" stroke-linecap="round">' +
      '<g stroke="#0b0e2a" stroke-width="3" opacity=".24"><path d="M156 340 C164 400 164 450 152 520"/><path d="M444 340 C436 400 436 450 448 520"/>' +
      '<path d="M58 398 C72 410 84 428 92 448"/><path d="M542 398 C528 410 516 428 508 448"/></g>' +
      '<g stroke="#4a56a8" stroke-width="2" opacity=".5"><path d="M152 548 L448 548"/></g></g>';
  }

  function backSvg(p) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700" role="img" aria-label="ظهر جاكيت التخرج">' + defs(p) + common(p) +
      '<g>' +
        '<ellipse cx="298" cy="54" rx="56" ry="18" fill="url(#' + p + 'lin)"/>' +
        '<path d="' + BODY + '" fill="url(#' + p + 'body)"/>' + hem(p) + sleeves(p) +
        '<path d="M198 214 C240 238 360 238 402 214 C404 250 350 262 300 262 C250 262 196 250 198 214 Z" fill="#0b0e2a" opacity=".3"/>' +
        '<path d="M196 110 C190 76 240 56 262 58 C280 66 316 66 336 58 C360 56 408 78 402 112 C398 150 410 186 404 214 C360 234 240 234 196 214 C188 186 200 150 196 110 Z" fill="url(#' + p + 'hood)"/>' +
      '</g>' + folds() +
      '<g fill="none" stroke="#4a56a8" stroke-width="2" opacity=".5" stroke-linecap="round"><path d="M298 68 C294 120 302 180 294 226"/><path d="M200 214 C186 235 176 262 172 300"/><path d="M400 214 C414 235 424 262 428 300"/></g>' +
      '<ellipse cx="300" cy="120" rx="52" ry="34" fill="#fff" opacity=".07"/>' +
      '<g>' +
        '<text class="jName" x="300" y="284" text-anchor="middle" direction="rtl" fill="' + BEIGE + '" style="font-family:\'Foda Display\',serif" font-size="86"></text>' +
        '<text class="jNum" x="300" y="442" text-anchor="middle" fill="' + BEIGE + '" style="font-family:\'Jacket Num\',serif;font-weight:800" font-size="150"></text>' +
      '</g></svg>';
  }

  function frontSvg(p) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700" role="img" aria-label="أمام جاكيت التخرج">' + defs(p) + common(p) +
      '<g>' +
        '<path d="M190 214 C176 160 196 84 250 56 C275 46 325 46 350 56 C404 84 424 160 410 214 Z" fill="url(#' + p + 'hood)"/>' +
        '<path d="' + BODY + '" fill="url(#' + p + 'body)"/>' + hem(p) +
        /* جيب الكنغر */
        '<path d="M206 420 C256 428 344 428 394 420 L440 548 L160 548 Z" fill="#1c2260"/>' +
        sleeves(p) +
        /* طوق غطاء الرأس: البطانة البيج */
        '<ellipse cx="300" cy="226" rx="86" ry="42" fill="url(#' + p + 'lin)"/>' +
        '<ellipse cx="300" cy="234" rx="62" ry="28" fill="#0f1338"/>' +
        '<path d="M246 226 C262 252 338 252 354 226 C348 262 252 262 246 226 Z" fill="#232b67"/>' +
      '</g>' + folds() +
      '<g fill="none" stroke="#4a56a8" stroke-width="2" opacity=".5" stroke-linecap="round">' +
        '<path d="M206 420 C256 428 344 428 394 420"/><path d="M206 420 L160 548"/><path d="M394 420 L440 548"/><path d="M300 262 L300 420" opacity=".4"/></g>' +
      /* الأربطة */
      '<g fill="none" stroke="#e7dbb4" stroke-width="5" stroke-linecap="round"><path d="M272 248 C268 290 272 330 268 372"/><path d="M296 252 C294 292 300 334 296 366"/></g>' +
      '<g fill="#8f875f"><rect x="264" y="370" width="8" height="16" rx="3"/><rect x="292" y="364" width="8" height="16" rx="3"/></g>' +
      /* شعار المدرسة على الصدر الأيسر للابس */
      '<g><image href="assets/logo-chest.webp" x="322" y="266" width="80" height="65" preserveAspectRatio="xMidYMid meet"/></g>' +
      '</svg>';
  }

  function mount(el) {
    var p = "j" + (++seq) + "-";
    el.innerHTML = '<div class="jwrap" data-view="back">' +
      '<div class="jview jv-back">' + backSvg(p + "b-") + '</div>' +
      '<div class="jview jv-front"></div>' +
      '<div class="jtoggle" role="group" aria-label="وجه الجاكيت"><button type="button" data-v="back" aria-pressed="true">الخلف</button><button type="button" data-v="front" aria-pressed="false">الأمام</button></div>' +
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
    if (view === "front" && !wrap.__front) { wrap.__front = true; wrap.querySelector(".jv-front").innerHTML = frontSvg(wrap.__p + "f-"); }
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
