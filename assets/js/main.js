/* =====================================================================
   Portfolio renderer. You don't need to edit this file —
   all text, links and lists come from content.js.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------
     Helpers
     --------------------------------------------------------------- */
  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function str(v) { return typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim(); }
  function arr(v) { return Array.isArray(v) ? v.filter(function (x) { return x != null && x !== ""; }) : []; }
  /** *word* → italic serif accent */
  function rich(v) {
    return esc(v)
      .replace(/(\S+-\S+)/g, '<span class="nowrap">$1</span>')
      .replace(/\*([^*]+)\*/g, '<span class="em">$1</span>');
  }
  function plain(v) { return str(v).replace(/\*/g, ""); }
  function safeUrl(v) {
    var u = str(v);
    if (!u) return "";
    if (/^https?:\/\//i.test(u) || /^mailto:/i.test(u)) return u;
    if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return ""; // block javascript:, data:, …
    return u;
  }
  function isExternal(u) { return /^https?:\/\//i.test(u); }
  function slug(v) { return str(v).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "item"; }
  function pad(n) { return n < 10 ? "0" + n : String(n); }
  function initials(name) {
    var parts = str(name).replace(/[^A-Za-z\s.]/g, "").split(/[\s.]+/).filter(Boolean);
    var useful = parts.filter(function (p) { return p.length > 1; });
    var src = useful.length >= 2 ? useful : parts;
    if (!src.length) return "";
    return (src[0][0] + (src.length > 1 ? src[src.length - 1][0] : "")).toUpperCase();
  }
  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var sess = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  function localTime(tz) {
    try { return new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: tz || undefined }).format(new Date()); }
    catch (e) { return new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }).format(new Date()); }
  }

  /* ---------------------------------------------------------------
     Icons
     --------------------------------------------------------------- */
  var ICONS = {
    arrowRight: '<path d="M4 12h16M14 6l6 6-6 6"/>',
    arrowUpRight: '<path d="M7 17L17 7M8 7h9v9"/>',
    arrowUp: '<path d="M12 20V4M6 10l6-6 6 6"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="1.5"/><path d="M5 15V5a1 1 0 0 1 1-1h10"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    github: '<path d="M9 19c-4 1.5-4-2-6-2.5M15 21v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
    linkedin: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
    play: '<circle cx="12" cy="12" r="9"/><path d="M10 8.5l5 3.5-5 3.5z"/>'
  };
  function icon(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[n] || "") + "</svg>"; }
  var GH_MARK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>';

  function linkButton(o) {
    var url = safeUrl(o.url);
    var cls = "btn " + (o.cls || "");
    var inner = (o.icon ? icon(o.icon) : "") + "<span>" + esc(o.label) + "</span>" + (o.iconAfter ? icon(o.iconAfter) : "");
    if (!url) return '<span class="' + cls + '" aria-disabled="true" title="' + esc(o.disabledTitle || "Not available yet") + '">' + inner + "</span>";
    var attrs = ' href="' + esc(url) + '"';
    if (isExternal(url)) attrs += ' target="_blank" rel="noopener noreferrer"';
    if (o.download) attrs += " download";
    return '<a class="' + cls + '"' + attrs + ">" + inner + "</a>";
  }
  function magnetic(html) { return '<span class="magnetic">' + html + "</span>"; }
  function roll(text) {
    return '<span class="sr-only">' + esc(text) + '</span><span class="roll" aria-hidden="true">' +
      Array.from(text).map(function (ch, i) {
        var c = ch === " " ? " " : ch;
        return '<span class="roll-ch" data-ch="' + esc(c) + '" style="--i:' + i + '">' + esc(c) + "</span>";
      }).join("") + "</span>";
  }

  /* ---------------------------------------------------------------
     Project artwork — theme-aware line drawings, single accent.
     (A real screenshot can be set via `thumbnail` in content.js.)
     --------------------------------------------------------------- */
  var F = function (v, o) { return ' style="fill:' + v + (o != null ? ";fill-opacity:" + o : "") + '"'; };
  var S = function (v, o, w) { return ' style="fill:none;stroke:' + v + (o != null ? ";stroke-opacity:" + o : "") + ";stroke-width:" + (w || 2) + '"'; };
  var MONO = 'font-family="Geist Mono, ui-monospace, monospace"';
  function mono(x, y, t, o, anchor, size, fill) {
    return '<text x="' + x + '" y="' + y + '" ' + MONO + ' font-size="' + (size || 18) + '" letter-spacing="1.5" text-anchor="' + (anchor || "start") + '"' + F(fill || "var(--text)", o == null ? 0.5 : o) + ">" + t + "</text>";
  }
  function backdrop(id) {
    return '<defs><pattern id="' + id + 'g" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40"' + S("var(--text)", 0.05, 1) + "/></pattern></defs>" +
      '<rect width="1600" height="1000"' + F("var(--surface)") + "/>" +
      '<rect width="1600" height="1000" fill="url(#' + id + 'g)"/>';
  }
  var SVG_OPEN = '<svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';

  function visionArt(uid) {
    var id = "va" + uid;
    return SVG_OPEN + backdrop(id) +
      '<g' + S("var(--text)", 0.12) + '><path d="M520 1000 L760 600"/><path d="M1080 1000 L840 600"/></g>' +
      '<path d="M800 1000 V950 M800 900 V860 M800 820 V790"' + S("var(--text)", 0.2, 4) + "/>" +
      '<g transform="translate(800 560)">' +
      '<path d="M-300 60 Q-300 -20 -240 -44 L-184 -164 Q-172 -192 -140 -192 H140 Q172 -192 184 -164 L240 -44 Q300 -20 300 60 V156 Q300 184 272 184 H-272 Q-300 184 -300 156 Z"' + S("var(--text)", 0.55) + "/>" +
      '<path d="M-164 -156 H164 L208 -52 H-208 Z"' + S("var(--text)", 0.35) + "/>" +
      '<rect x="-276" y="-16" width="116" height="36" rx="10"' + S("var(--text)", 0.4) + "/>" +
      '<rect x="160" y="-16" width="116" height="36" rx="10"' + S("var(--text)", 0.4) + "/>" +
      '<rect x="-152" y="52" width="304" height="80" rx="10"' + F("var(--text)", 0.92) + "/>" +
      '<text x="0" y="106" text-anchor="middle" ' + MONO + ' font-weight="600" font-size="38" textLength="256" lengthAdjust="spacingAndGlyphs"' + F("var(--bg)") + ">TN 45 AB 1234</text>" +
      '<g' + S("var(--accent)", 1, 4) + ' stroke-linecap="square"><path d="M-180 60 V28 H-148"/><path d="M148 28 H180 V60"/><path d="M180 124 V156 H148"/><path d="M-148 156 H-180 V124"/></g>' +
      '<rect x="-180" y="-12" width="128" height="32"' + F("var(--accent)") + "/>" +
      mono(-116, 10, "PLATE", 1, "middle", 16, "var(--on-accent)") +
      '<rect x="-180" y="28" width="360" height="3"' + F("var(--accent)", 0.85) + '><animate attributeName="y" values="28;152;28" dur="3.6s" repeatCount="indefinite"/></rect>' +
      "</g>" +
      '<path d="M980 640 H1150 V380 H1200"' + S("var(--text)", 0.25, 1.5) + "/>" +
      '<circle cx="980" cy="640" r="5"' + F("var(--accent)") + "/>" +
      mono(1220, 372, "OCR", 0.45) +
      '<text x="1220" y="416" ' + MONO + ' font-size="34" textLength="232" lengthAdjust="spacingAndGlyphs"' + F("var(--text)", 0.92) + ">TN45AB1234</text>" +
      mono(1220, 456, "FORMAT ✓  VOTED ✓", 0.45) +
      '<circle cx="384" cy="270" r="7"' + F("var(--accent)") + '><animate attributeName="opacity" values="1;0.2;1" dur="1.8s" repeatCount="indefinite"/></circle>' +
      mono(404, 276, "CAM 01 — LIVE") +
      mono(384, 790, "YOLO → CROP → ENHANCE → OCR → VALIDATE", 0.35) +
      "</svg>";
  }

  function voiceArt(uid) {
    var id = "vo" + uid;
    var hs = [16, 30, 52, 38, 74, 104, 68, 128, 92, 150, 112, 80, 132, 98, 60, 118, 84, 52, 70, 40, 28, 46, 22, 14];
    var bars = hs.map(function (h, i) {
      var x = 572 + i * 20, lo = Math.max(10, Math.round(h * 0.4)), dur = (1.2 + (i % 5) * 0.21).toFixed(2);
      var acc = i === 9 || i === 12;
      return '<rect x="' + x + '" y="' + (500 - h / 2) + '" width="8" height="' + h + '" rx="4"' + F(acc ? "var(--accent)" : "var(--text)", acc ? 1 : 0.85) + ">" +
        '<animate attributeName="height" values="' + h + ";" + lo + ";" + h + '" dur="' + dur + 's" repeatCount="indefinite"/>' +
        '<animate attributeName="y" values="' + (500 - h / 2) + ";" + (500 - lo / 2) + ";" + (500 - h / 2) + '" dur="' + dur + 's" repeatCount="indefinite"/></rect>';
    }).join("");
    var cal = "";
    for (var i = 0; i < 15; i++) {
      var r = Math.floor(i / 5), c = i % 5, on = r === 1 && c === 3;
      cal += '<rect x="' + c * 24 + '" y="' + (22 + r * 24) + '" width="16" height="16"' + F(on ? "var(--accent)" : "var(--text)", on ? 1 : 0.14) + "/>";
    }
    var serif = 'font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="40"';
    return SVG_OPEN + backdrop(id) +
      '<circle cx="800" cy="500" r="190"' + S("var(--text)", 0.1) + "/>" +
      '<circle cx="800" cy="500" r="270"' + S("var(--text)", 0.07) + "/>" +
      bars +
      mono(380, 260, "CUSTOMER", 0.45) +
      '<text x="380" y="304" ' + serif + F("var(--text)", 0.92) + ">“Can I book a haircut on Friday?”</text>" +
      mono(1220, 746, "AI RECEPTIONIST", 0.45, "end") +
      '<text x="1220" y="790" text-anchor="end" ' + serif + F("var(--text)", 0.92) + ">“Sure — 4:00 PM is free.”</text>" +
      '<g transform="translate(1110 216)">' + mono(0, 0, "CALENDAR", 0.45) + cal + "</g>" +
      '<g transform="translate(380 760)">' + mono(0, 0, "WEBHOOK", 0.45) +
      '<path d="M120 -6 H196" stroke-dasharray="6 6"' + S("var(--accent)", 1) + '><animate attributeName="stroke-dashoffset" values="12;0" dur="0.9s" repeatCount="indefinite"/></path>' +
      mono(212, 0, "N8N", 0.45) + "</g>" +
      "</svg>";
  }

  function plainArt(title) {
    return SVG_OPEN + '<rect width="1600" height="1000"' + F("var(--surface)") + "/>" +
      '<text x="120" y="860" font-family="Geist, sans-serif" font-size="96" font-weight="500" letter-spacing="-4"' + F("var(--text)") + ">" + esc(title) + "</text>" +
      '<circle cx="1460" cy="140" r="10"' + F("var(--accent)") + "/></svg>";
  }

  var artN = 0;
  function projectArt(p) {
    artN += 1;
    var uid = slug(p.id || p.title) + artN;
    var img = safeUrl(p.thumbnail);
    if (img) return '<img src="' + esc(img) + '" alt="' + esc(p.title) + ' preview" loading="lazy">';
    if (p.visual === "vision") return visionArt(uid);
    if (p.visual === "voice") return voiceArt(uid);
    return plainArt(p.shortTitle || p.title);
  }

  /* ---------------------------------------------------------------
     Section header: "(02) — WORK" + heading with masked reveal
     --------------------------------------------------------------- */
  function sectionHead(n, label, title, sub, aside, id) {
    return '<div class="section-head reveal">' +
      '<p class="label">(' + pad(n) + ") — " + esc(label) + "</p>" +
      "<h2" + (id ? ' id="' + id + '"' : "") + '><span class="mask-line"><span>' + rich(title) + "</span></span></h2>" +
      (aside ? '<div class="aside label">' + aside + "</div>" : "<div></div>") +
      (sub ? '<p class="sub">' + esc(sub) + "</p>" : "") +
      "</div>";
  }

  /* ---------------------------------------------------------------
     Sections
     --------------------------------------------------------------- */
  function renderHero(d) {
    var p = d.profile || {};
    var avail = p.availability || {};
    var photo = safeUrl(p.photo);
    var ini = esc(initials(p.name) || "SG");
    var lines = arr(p.headline).map(function (l, i) {
      return '<span class="mask-line"><span style="--d:' + (0.1 + i * 0.09).toFixed(2) + 's">' + rich(l) + "</span></span>";
    }).join("");
    var photoHtml = photo
      ? '<img src="' + esc(photo) + '" alt="Portrait of ' + esc(p.name) + '" data-fallback="' + ini + '">'
      : '<span class="label photo-label">Portrait</span><span class="dot-accent"></span><span class="photo-initials">' + ini + '</span><span class="label photo-hint">Add your photo in content.js</span>';
    var edu = [str(p.degreeShort), str(p.graduation) ? "Graduation: " + str(p.graduation) : ""].filter(Boolean).join(" | ");
    var meta = [
      ["Role", p.role], ["Location", p.location], ["Education", edu],
      ["Local time", '<span data-clock>' + esc(localTime(p.timezone)) + "</span> " + esc(p.timezoneLabel || "")]
    ].filter(function (m) { return str(m[1]); }).map(function (m) {
      return '<li><span class="label">' + m[0] + "</span><span>" + (m[0] === "Local time" ? m[1] : esc(m[1])) + "</span></li>";
    }).join("");
    var roles = arr(p.identities).map(function (r) { return '<span class="label">' + esc(r) + "</span>"; }).join("");

    return '<div class="container hero-grid">' +
      '<div class="hero-copy">' +
      '<div class="hero-top reveal">' +
      (avail.show && str(avail.text) ? '<span class="availability"><span class="pulse"></span>' + esc(avail.text) + "</span>" : "") +
      '<span class="label">(00) — ' + esc(p.greeting || "") + "</span></div>" +
      '<h1 class="hero-title" aria-label="' + esc(plain(arr(p.headline).join(" "))) + '">' + lines + "</h1>" +
      '<p class="hero-tagline reveal" style="--d:.35s">' + esc(p.tagline || "") + "</p>" +
      '<div class="hero-actions reveal" style="--d:.45s">' +
      magnetic('<a class="btn btn-primary" href="#projects"><span>Explore My Projects</span>' + icon("arrowRight") + "</a>") +
      magnetic(linkButton({ url: p.resume, label: "Download Resume", icon: "download", download: true, disabledTitle: "Resume coming soon" })) +
      magnetic('<a class="btn btn-ghost" href="#contact"><span>Contact Me</span></a>') +
      "</div>" +
      (roles ? '<div class="hero-roles reveal" style="--d:.55s">' + roles + "</div>" : "") +
      "</div>" +
      '<div class="hero-visual reveal" style="--d:.25s"><div class="profile-card">' +
      '<div class="photo-frame">' + photoHtml + "</div>" +
      '<div class="profile-meta"><p class="profile-name">' + esc(p.name || "") + '</p><p class="profile-role">' + esc(arr(p.identities)[0] || p.role || "") + "</p>" +
      '<ul class="meta-list">' + meta + "</ul></div></div></div>" +
      "</div>";
  }

  function renderMarquee(d) {
    var items = arr((d.profile || {}).identities).concat(arr(d.skills).map(function (g) { return g.category; }));
    var avail = (d.profile || {}).availability || {};
    if (avail.show && str(avail.text)) items.unshift(avail.text);
    if (!items.length) return "";
    var group = items.map(function (t, i) {
      return '<span class="marquee-item">' + (i % 2 ? '<span class="em">' + esc(t) + "</span>" : esc(t)) + '</span><span class="marquee-sep">●</span>';
    }).join("");
    return '<div class="marquee-track"><div class="marquee-group">' + group + '</div><div class="marquee-group">' + group + "</div></div>";
  }

  function computeStats(d) {
    var tools = {};
    arr(d.skills).forEach(function (g) { arr(g.items).forEach(function (t) { tools[str(t).toLowerCase()] = 1; }); });
    var stages = arr(d.projects).reduce(function (n, p) { return n + arr(p.pipeline).length; }, 0);
    var acts = arr(d.achievements).filter(function (a) { return a && a.verified === true; }).length;
    return [
      [arr(d.projects).length, "Featured AI systems"],
      [Object.keys(tools).length, "Tools & technologies"],
      [acts, "Hackathons & communities"],
      [stages, "Pipeline stages built"]
    ].filter(function (s) { return s[0] > 0; });
  }

  function renderAbout(d, n) {
    var a = d.about || {};
    var paras = arr(a.paragraphs);
    var text = paras.map(function (t, i) {
      return '<p class="reveal' + (i === 0 ? " about-lead" : "") + '" style="--d:' + (i * 0.05).toFixed(2) + 's">' + (i === 0 ? rich(t) : esc(t)) + "</p>";
    }).join("");
    var hl = arr(a.highlights).map(function (h, i) {
      return '<div class="highlight reveal" style="--d:' + (i * 0.06).toFixed(2) + 's"><span class="label">' + pad(i + 1) + "</span><div><h3>" + esc(h.title) + "</h3><p>" + esc(h.text) + "</p></div></div>";
    }).join("");
    var stats = computeStats(d).map(function (s) {
      return '<div class="stat reveal"><dt class="label">' + esc(s[1]) + '</dt><dd data-count="' + s[0] + '">' + pad(s[0]) + "</dd></div>";
    }).join("");
    return '<div class="container">' +
      sectionHead(n, "About", "Engineering AI that works *outside* the notebook.", "", "", "about-title") +
      '<div class="about-grid"><div class="about-text">' + text + '</div><div class="highlights">' + hl + "</div></div>" +
      (stats ? '<dl class="stats">' + stats + "</dl>" : "") +
      "</div>";
  }

  function pipelineH(steps) {
    return '<ol class="pipeline">' + steps.map(function (s, i) {
      return '<li class="pipe-step"><div class="pipe-node"><span class="n">' + pad(i + 1) + '</span><span class="t">' + esc(s) + '</span></div><span class="pipe-link" aria-hidden="true"></span></li>';
    }).join("") + "</ol>";
  }

  function projectLinks(p, sm) {
    var c = sm ? "btn-sm" : "";
    return linkButton({ url: p.github, label: "GitHub", icon: "github", cls: c, disabledTitle: "Repository link not added yet" }) +
      linkButton({ url: p.demo, label: "Live Demo", icon: "play", cls: c, disabledTitle: "Live demo not available yet" });
  }

  function renderProjects(d, n) {
    var list = arr(d.projects);
    var items = list.map(function (p, i) {
      var id = slug(p.id || p.title);
      var steps = arr(p.pipeline);
      var cats = arr(p.categories).map(esc).join(" · ");
      var tech = arr(p.tech).map(function (t) { return '<span class="chip">' + esc(t) + "</span>"; }).join("");
      return '<article class="project reveal">' +
        '<div class="project-top">' +
        '<a class="project-thumb" href="#project-' + esc(id) + '" aria-label="Open details for ' + esc(p.title) + '">' + projectArt(p) + "</a>" +
        '<div class="project-body">' +
        '<div class="project-index"><span class="label">Project ' + pad(i + 1) + "</span>" +
        (str(p.status) ? '<span class="status" data-status="' + esc(slug(p.status)) + '">' + esc(p.status) + "</span>" : "") + "</div>" +
        "<h3>" + esc(p.title) + "</h3>" +
        '<p class="tag project-cats">' + cats + "</p>" +
        '<p class="project-summary">' + esc(p.summary || arr(p.description)[0] || "") + "</p>" +
        '<div class="tech-row">' + tech + "</div>" +
        '<div class="project-actions">' +
        '<a class="btn btn-primary btn-sm" href="#project-' + esc(id) + '"><span>View Details</span>' + icon("arrowRight") + "</a>" +
        projectLinks(p, true) +
        "</div></div></div>" +
        (steps.length ? '<div class="pipeline-wrap"><div class="pipeline-label"><span class="label">System architecture</span><span class="label">' + pad(steps.length) + " stages</span></div>" + pipelineH(steps) + "</div>" : "") +
        "</article>";
    }).join("");
    return '<div class="container">' +
      sectionHead(n, "Selected work", "Featured *projects.*", "Practical AI systems — from real-time computer vision to voice agents wired into real business workflows.", pad(list.length) + " Projects", "projects-title") +
      '<div class="projects">' + items + "</div></div>";
  }

  function renderProjectDetail(p, index, total, next) {
    var paras = arr(p.description).map(function (t, i) { return "<p" + (i === 0 ? ' class="lead"' : "") + ">" + esc(t) + "</p>"; }).join("");
    var feats = arr(p.features).map(function (f, i) { return '<li><span class="label">' + pad(i + 1) + "</span><span>" + esc(f) + "</span></li>"; }).join("");
    var tech = arr(p.tech).map(function (t) { return '<span class="chip">' + esc(t) + "</span>"; }).join("");
    var steps = arr(p.pipeline);
    var outs = arr(p.outcomes).map(function (o) { return "<li>" + esc(o) + "</li>"; }).join("");
    return '<div class="modal-bar"><span class="label">Project ' + pad(index + 1) + " / " + pad(total) + "</span>" +
      '<button class="icon-btn" type="button" data-close aria-label="Close project details">' + icon("close") + "</button></div>" +
      '<div class="modal-hero">' + projectArt(p) + "</div>" +
      '<div class="modal-content">' +
      '<div class="modal-meta">' + (str(p.status) ? '<span class="status" data-status="' + esc(slug(p.status)) + '">' + esc(p.status) + "</span>" : "") +
      '<span class="tag">' + arr(p.categories).map(esc).join(" · ") + "</span></div>" +
      '<h2 id="modal-title">' + esc(p.title) + "</h2>" + paras +
      '<div class="modal-actions">' + projectLinks(p) + "</div>" +
      (str(p.problem) ? '<h3 class="label">(01) — The problem</h3><p>' + esc(p.problem) + "</p>" : "") +
      (steps.length ? '<h3 class="label">(02) — Architecture & workflow</h3><ol class="pipeline-v">' + steps.map(function (s, i) {
        return '<li><span class="n">' + pad(i + 1) + "</span><span>" + esc(s) + '</span><span class="arrow">' + (i < steps.length - 1 ? "↓" : "●") + "</span></li>";
      }).join("") + "</ol>" : "") +
      (feats ? '<h3 class="label">(03) — Key features</h3><ul class="feature-list">' + feats + "</ul>" : "") +
      (outs ? '<h3 class="label">(04) — Outcomes</h3><ul class="outcomes">' + outs + "</ul>" : "") +
      (tech ? '<h3 class="label">Technology stack</h3><div class="tech-row">' + tech + "</div>" : "") +
      (next ? '<a class="modal-next" href="#project-' + esc(slug(next.id || next.title)) + '"><span><span class="label">Next project</span><strong>' + esc(next.shortTitle || next.title) + "</strong></span>" + icon("arrowRight") + "</a>" : "") +
      "</div>";
  }

  function renderSkills(d, n) {
    var groups = arr(d.skills);
    var total = groups.reduce(function (s, g) { return s + arr(g.items).length; }, 0);
    var tabs = '<button class="tab" type="button" data-skill="all" aria-pressed="true">All</button>' +
      groups.map(function (g) { return '<button class="tab" type="button" data-skill="' + esc(slug(g.category)) + '" aria-pressed="false">' + esc(g.category) + "</button>"; }).join("");
    var cards = groups.map(function (g) {
      var items = arr(g.items);
      return '<div class="skill-group" data-skill-group="' + esc(slug(g.category)) + '">' +
        '<div class="skill-group-head"><h3 class="label">' + esc(g.category) + '</h3><span class="label">' + pad(items.length) + "</span></div>" +
        '<ul class="skill-items">' + items.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></div>";
    }).join("");
    return '<div class="container">' +
      sectionHead(n, "Technical skills", "Tools I *build* with.", "", pad(total) + " Tools", "skills-title") +
      '<div class="skill-tabs reveal" role="group" aria-label="Filter skills">' + tabs + "</div>" +
      '<div class="skills-grid reveal">' + cards + "</div></div>";
  }

  function renderEducation(d, n) {
    var cards = arr(d.education).map(function (e) {
      var det = arr(e.details).map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
      return '<article class="edu-card reveal"><div><span class="label">' + esc(e.location) + "</span><h3>" + esc(e.institution) + '</h3><p class="edu-degree">' + esc(e.degree) + "</p>" +
        (det ? '<ul class="edu-details">' + det + "</ul>" : "") + "</div>" +
        (str(e.graduation) ? '<div class="edu-year"><div class="label">Graduation</div><div class="year">' + esc(e.graduation) + "</div></div>" : "<div></div>") +
        "</article>";
    }).join("");
    return '<div class="container">' + sectionHead(n, "Education", "Where I'm *learning.*", "", "", "education-title") + cards + "</div>";
  }

  function renderAchievements(d, n) {
    var items = arr(d.achievements).filter(function (a) { return a && a.verified === true; });
    var cats = [];
    items.forEach(function (a) { var c = str(a.category); if (c && cats.indexOf(c) === -1) cats.push(c); });
    var filters = cats.length > 1
      ? '<div class="ach-filters reveal" role="group" aria-label="Filter activities"><button class="tab" type="button" data-ach="all" aria-pressed="true">All</button>' +
        cats.map(function (c) { return '<button class="tab" type="button" data-ach="' + esc(slug(c)) + '" aria-pressed="false">' + esc(c) + "</button>"; }).join("") + "</div>"
      : "";
    var list = items.map(function (a) {
      var link = safeUrl(a.link);
      var sub = [str(a.role) ? '<span class="ach-role">' + esc(a.role) + "</span>" : "", esc(a.description || "")].filter(Boolean).join(" — ");
      return '<div class="ach-item" data-ach-cat="' + esc(slug(a.category)) + '">' +
        '<span class="label">' + esc(a.category || "") + "</span>" +
        "<div><h3>" + esc(a.title) + "</h3><p>" + sub + "</p></div>" +
        '<div class="ach-right">' + (str(a.year) ? '<span class="status plain">' + esc(a.year) + "</span>" : "") +
        (link ? linkButton({ url: link, label: "View", iconAfter: "arrowUpRight", cls: "btn-sm btn-ghost" }) : "") + "</div></div>";
    }).join("");
    return '<div class="container">' + sectionHead(n, "Achievements & activities", "Hackathons & *communities.*", "", "", "achievements-title") +
      filters + '<div class="ach-list reveal">' + (list || '<p class="ach-empty">New achievements coming soon.</p>') + "</div></div>";
  }

  function renderGithub(d, n) {
    var g = d.github || {};
    var user = str(g.username);
    var url = user ? "https://github.com/" + encodeURIComponent(user) : safeUrl((d.links || {}).github);
    return '<div class="container">' +
      sectionHead(n, "GitHub", "Open-source *work.*", "Code, experiments and projects — straight from my repositories.", "", "github-title") +
      '<div class="gh-grid"><aside class="gh-profile reveal"><div class="gh-logo">' + GH_MARK + "</div>" +
      "<h3>" + esc((d.profile || {}).name || "") + "</h3>" + (user ? '<p class="label handle">@' + esc(user) + "</p>" : "") +
      "<p>Source code for my projects, including computer vision pipelines and AI automation apps.</p>" +
      linkButton({ url: url, label: "View GitHub Profile", iconAfter: "arrowUpRight", cls: "btn-primary btn-sm", disabledTitle: "Add your GitHub link" }) +
      '</aside><div class="gh-repos reveal" id="gh-repos"></div></div></div>';
  }

  function renderContact(d, n) {
    var c = d.contact || {}, l = d.links || {}, p = d.profile || {};
    var email = str(l.email);
    var endpoint = safeUrl(c.formEndpoint);
    var socials = [
      linkButton({ url: l.github, label: "GitHub", icon: "github", cls: "btn-sm" }),
      safeUrl(l.linkedin) ? linkButton({ url: l.linkedin, label: "LinkedIn", icon: "linkedin", cls: "btn-sm" }) : "",
      safeUrl(p.resume) ? linkButton({ url: p.resume, label: "Resume", icon: "download", cls: "btn-sm", download: true }) : ""
    ].filter(Boolean).map(magnetic).join("");
    var left = '<div class="reveal">' +
      '<p class="label">(' + pad(n) + ") — Contact</p>" +
      '<h2 id="contact-title">' + rich(c.heading || "") + "</h2>" +
      '<p class="contact-text">' + esc(c.text || "") + "</p>" +
      (email ? '<p class="label" style="margin:0 0 8px">Email</p><button class="email-copy" type="button" data-copy="' + esc(email) + '"><span class="link-line">' + esc(email) + "</span>" + icon("copy") + "</button>" : "") +
      '<div class="contact-socials">' + socials + "</div>" +
      '<div class="contact-meta">' +
      ((p.availability || {}).show ? '<span class="label" style="display:inline-flex;align-items:center;gap:8px;color:var(--text)"><span class="pulse"></span>' + esc(p.availability.text) + "</span>" : "") +
      '<span class="label">' + esc(p.location || "") + " · <span data-clock>" + esc(localTime(p.timezone)) + "</span> " + esc(p.timezoneLabel || "") + "</span>" +
      "</div></div>";
    var right = "";
    if (email || endpoint) {
      right = '<div class="reveal" style="--d:.1s" id="form-wrap"><form class="form" id="contact-form" novalidate>' +
        '<div class="form-row">' +
        '<label class="field"><span class="label">Name</span><input name="name" autocomplete="name" placeholder="Your name"><span class="err" data-err="name"></span></label>' +
        '<label class="field"><span class="label">Email</span><input name="email" type="email" autocomplete="email" placeholder="you@example.com"><span class="err" data-err="email"></span></label>' +
        "</div>" +
        '<label class="field"><span class="label">Reason</span><select name="reason">' +
        ["Internship", "Research collaboration", "Hackathon team", "Project idea", "Just saying hi"].map(function (r) { return "<option>" + r + "</option>"; }).join("") +
        "</select></label>" +
        '<label class="field"><span class="label">Message</span><textarea name="message" rows="4" placeholder="Tell me about the role, project or idea…"></textarea><span class="err" data-err="message"></span></label>' +
        '<input class="hp" name="company" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<div class="form-foot">' + magnetic('<button class="btn btn-primary" type="submit"><span>Send message</span>' + icon("arrowUpRight") + "</button>") +
        '<span class="muted" id="form-status" role="status" style="font-size:14px"></span></div>' +
        "</form>" +
        (endpoint ? '<p class="privacy-note">Your name, email and message are only used to reply to you and are stored by my form provider. Nothing else is collected.</p>' : "") +
        "</div>";
    }
    return '<div class="container contact-grid">' + left + right + "</div>";
  }

  function renderFooter(d) {
    var p = d.profile || {}, l = d.links || {};
    var nav = [["#about", "About"], ["#projects", "Work"], ["#skills", "Skills"], ["#contact", "Contact"]]
      .map(function (x) { return '<li><a href="' + x[0] + '">' + roll(x[1]) + "</a></li>"; }).join("");
    var soc = [["GitHub", safeUrl(l.github)], ["LinkedIn", safeUrl(l.linkedin)], ["Email", str(l.email) ? "mailto:" + str(l.email) : ""]]
      .filter(function (x) { return x[1]; })
      .map(function (x) { return '<li><a href="' + esc(x[1]) + '"' + (isExternal(x[1]) ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" + roll(x[0]) + " ↗</a></li>"; }).join("");
    return '<div class="container">' +
      '<div class="footer-top">' +
      '<div class="footer-brand"><p class="footer-name">' + esc(p.name || "") + '</p><p class="muted" style="margin:0">' + esc(p.role || "") + " — " + esc(p.location || "") + "</p></div>" +
      '<div class="footer-col"><p class="label">Navigate</p><ul>' + nav + "</ul></div>" +
      '<div class="footer-col"><p class="label">Elsewhere</p><ul>' + soc + "</ul></div>" +
      '<div><p class="label">Local time</p><p style="margin:10px 0 16px"><span data-clock>' + esc(localTime(p.timezone)) + "</span> " + esc(p.timezoneLabel || "") + "</p>" +
      '<button class="back-top" type="button" data-top>Back to top ' + icon("arrowUp") + "</button></div>" +
      "</div>" +
      '<div class="footer-bottom"><span class="label">' + esc(str((d.footer || {}).text)) + " © " + new Date().getFullYear() + "</span>" +
      '<span class="label">' + esc(arr(p.identities).slice(0, 2).join(" · ")) + "</span></div>" +
      "</div>";
  }

  /* ---------------------------------------------------------------
     GitHub repositories (live, with offline fallback)
     --------------------------------------------------------------- */
  var LANG = { Python: "#3572A5", JavaScript: "#f1e05a", TypeScript: "#3178c6", Dart: "#00B4AB", "C++": "#f34b7d", Java: "#b07219", HTML: "#e34c26", CSS: "#563d7c", "Jupyter Notebook": "#DA5B0B", Shell: "#89e051" };
  function repoCard(r) {
    var meta = [];
    if (r.language) meta.push('<span class="label"><span class="lang-dot" style="background:' + (LANG[r.language] || "var(--accent)") + '"></span>' + esc(r.language) + "</span>");
    if (typeof r.stars === "number") meta.push('<span class="label">★ ' + r.stars + "</span>");
    if (r.updated) meta.push('<span class="label">' + esc(r.updated) + "</span>");
    var url = safeUrl(r.url);
    var inner = '<div class="repo-name"><span>' + esc(r.name) + "</span>" + icon("arrowUpRight") + "</div>" +
      '<p class="repo-desc">' + esc(r.description || "No description provided.") + '</p><div class="repo-meta">' + meta.join("") + "</div>";
    return url ? '<a class="repo" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + inner + "</a>" : '<div class="repo">' + inner + "</div>";
  }
  function fallbackRepos(d) {
    return arr(d.projects).filter(function (p) { return safeUrl(p.github); }).map(function (p) {
      var m = safeUrl(p.github).match(/github\.com\/[^/]+\/([^/?#]+)/i);
      return { name: m ? m[1] : p.shortTitle || p.title, description: p.summary || p.title, url: p.github };
    });
  }
  var ghReq = 0;
  function loadRepos(d) {
    var box = $("#gh-repos");
    if (!box) return;
    var g = d.github || {};
    var user = str(g.username);
    var count = Math.max(1, Math.min(12, parseInt(g.repoCount, 10) || 6));
    var id = ++ghReq;
    function fallback() {
      if (id !== ghReq) return;
      box.innerHTML = fallbackRepos(d).map(repoCard).join("") || '<p class="muted">Repositories will appear here once your GitHub username is added.</p>';
    }
    if (!user || g.showLatestRepos === false || !window.fetch) return fallback();
    var key = "sg-gh-" + user + "-" + count;
    var cached = sess.get(key);
    if (cached) { try { box.innerHTML = JSON.parse(cached).map(repoCard).join(""); return; } catch (e) {} }
    box.innerHTML = new Array(Math.min(count, 4) + 1).join('<div class="repo skeleton"></div>');
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 7000);
    fetch("https://api.github.com/users/" + encodeURIComponent(user) + "/repos?sort=pushed&per_page=30", { headers: { Accept: "application/vnd.github+json" }, signal: ctrl ? ctrl.signal : undefined })
      .then(function (res) { if (!res.ok) throw new Error(res.status); return res.json(); })
      .then(function (repos) {
        clearTimeout(timer);
        if (id !== ghReq || !Array.isArray(repos)) return fallback();
        var list = repos.filter(function (r) { return !r.fork && !r.archived; }).slice(0, count).map(function (r) {
          var dt = new Date(r.pushed_at);
          return { name: r.name, description: r.description, url: r.html_url, language: r.language, stars: r.stargazers_count, updated: isNaN(dt) ? "" : dt.toLocaleDateString("en-IN", { month: "short", year: "numeric" }) };
        });
        if (!list.length) return fallback();
        sess.set(key, JSON.stringify(list));
        box.innerHTML = list.map(repoCard).join("");
      })
      .catch(function () { clearTimeout(timer); fallback(); });
  }

  /* ---------------------------------------------------------------
     Project detail drawer — routed by #project-<id>
     --------------------------------------------------------------- */
  var DATA = null, lastFocus = null, savedScroll = 0;
  function findProject(id) {
    var list = arr(DATA && DATA.projects);
    for (var i = 0; i < list.length; i++) if (slug(list[i].id || list[i].title) === id) return { p: list[i], i: i, list: list };
    return null;
  }
  function openModal(id) {
    var f = findProject(id);
    if (!f) return false;
    var modal = $("#project-modal"), panel = $("#modal-panel");
    if (modal.hidden) { lastFocus = document.activeElement; savedScroll = window.pageYOffset; }
    var next = f.list.length > 1 ? f.list[(f.i + 1) % f.list.length] : null;
    panel.innerHTML = renderProjectDetail(f.p, f.i, f.list.length, next);
    panel.scrollTop = 0;
    $all("img", panel).forEach(function (img) { if (img.complete && img.naturalWidth) img.classList.add("loaded"); });
    modal.hidden = false;
    document.body.classList.add("modal-open");
    document.title = (f.p.shortTitle || f.p.title) + " — " + ((DATA.profile || {}).name || "") + " | " + ((DATA.profile || {}).role || "");
    setTimeout(function () { try { panel.focus({ preventScroll: true }); } catch (e) { panel.focus(); } }, 30);
    return true;
  }
  function closeModal(updateHash) {
    var modal = $("#project-modal");
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    document.title = str((DATA.site || {}).title) || document.title;
    if (updateHash && /^#project-/.test(location.hash)) {
      try { history.replaceState(null, "", location.pathname + location.search + "#projects"); } catch (e) {}
      window.scrollTo(0, savedScroll);
    }
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) {} }
  }
  function route() {
    var h = decodeURIComponent((location.hash || "").replace(/^#/, ""));
    if (h.indexOf("project-") === 0) { if (!openModal(h.slice(8))) closeModal(false); }
    else closeModal(false);
  }

  /* ---------------------------------------------------------------
     Interactions
     --------------------------------------------------------------- */
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }
  function setTheme(theme, persist) {
    var t = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", t);
    var m = $('meta[name="theme-color"]');
    if (m) m.setAttribute("content", t === "light" ? "#fbfbfc" : "#09090b");
    if (persist) store.set("sg-theme", t);
    if (typeof applyColors === "function") applyColors();
  }
  function filterGroup(btnSel, attr, itemSel, itemAttr, value, dimOnly) {
    $all(btnSel).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute(attr) === value ? "true" : "false"); });
    $all(itemSel).forEach(function (el) {
      var match = value === "all" || el.getAttribute(itemAttr) === value;
      if (dimOnly) el.classList.toggle("dim", !match); else el.hidden = !match;
    });
  }
  function toggleMenu(open) {
    var links = $("#nav-links"), btn = $("#menu-toggle");
    links.classList.toggle("open", open);
    $("#nav").classList.toggle("menu-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  function submitForm(form) {
    var data = {};
    Array.prototype.forEach.call(form.elements, function (el) { if (el.name) data[el.name] = str(el.value); });
    if (data.company) return;
    var errs = {};
    if (!data.name) errs.name = "Please tell me your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email || "")) errs.email = "Please enter a valid email.";
    if ((data.message || "").length < 10) errs.message = "A few more words, please (10+ characters).";
    $all("[data-err]", form).forEach(function (e) { e.textContent = errs[e.getAttribute("data-err")] || ""; });
    var first = Object.keys(errs)[0];
    if (first) { form.elements[first].focus(); return; }

    var c = DATA.contact || {}, email = str((DATA.links || {}).email), endpoint = safeUrl(c.formEndpoint);
    var btn = form.querySelector('button[type="submit"]'), status = $("#form-status");
    var done = function (msg) {
      $("#form-wrap").innerHTML = '<div class="form-done" role="status"><div class="check"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>' +
        '<h3>Thanks — I\'ll get back to you <span class="em">soon.</span></h3><p class="muted" style="margin:0">' + esc(msg) + "</p></div>";
    };
    if (form._sending) return;
    if (endpoint) {
      form._sending = true;
      btn.disabled = true;
      btn.innerHTML = '<span>Sending</span><span class="spinner"></span>';
      fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify({ name: data.name, email: data.email, reason: data.reason, message: data.message }) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); done("Your message has been sent."); })
        .catch(function () {
          form._sending = false;
          btn.disabled = false;
          btn.innerHTML = "<span>Send message</span>" + icon("arrowUpRight");
          status.textContent = "Sorry — the message couldn't be sent right now." + (email ? " Please email me directly at " + email + "." : " Please try again in a moment.");
        });
      return;
    }
    var subject = (data.reason || "Hello") + " — from " + data.name;
    var body = data.message + "\n\n— " + data.name + " (" + data.email + ")";
    window.location.href = "mailto:" + email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    setTimeout(function () { done("Your email app should have opened with the message ready to send."); }, 500);
  }

  var bound = false;
  function bindEvents() {
    if (bound) return;
    bound = true;

    document.addEventListener("click", function (e) {
      var t = e.target;
      if (!(t instanceof Element)) return;
      var dis = t.closest('[aria-disabled="true"]');
      if (dis) { e.preventDefault(); toast(dis.getAttribute("title") || "Not available yet"); return; }
      if (t.closest("[data-close]")) { e.preventDefault(); closeModal(true); return; }
      var sk = t.closest("[data-skill]");
      if (sk) { filterGroup("[data-skill]", "data-skill", "[data-skill-group]", "data-skill-group", sk.getAttribute("data-skill"), true); return; }
      var ac = t.closest("[data-ach]");
      if (ac) { filterGroup("[data-ach]", "data-ach", "[data-ach-cat]", "data-ach-cat", ac.getAttribute("data-ach"), false); return; }
      var cp = t.closest("[data-copy]");
      if (cp) {
        var text = cp.getAttribute("data-copy");
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { toast("Copied!"); }, function () { toast(text); });
        else toast(text);
        return;
      }
      if (t.closest("[data-top]")) { window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); return; }
      if (t.closest(".nav-links a")) toggleMenu(false);
    });

    document.addEventListener("submit", function (e) {
      if (e.target && e.target.id === "contact-form") { e.preventDefault(); submitForm(e.target); }
    });

    document.addEventListener("load", function (e) {
      if (e.target && e.target.tagName === "IMG") e.target.classList.add("loaded");
    }, true);

    document.addEventListener("error", function (e) {
      var img = e.target;
      if (img && img.tagName === "IMG" && img.hasAttribute("data-fallback")) {
        var frame = img.parentNode, ini = img.getAttribute("data-fallback");
        img.remove();
        frame.insertAdjacentHTML("afterbegin", '<span class="photo-initials">' + esc(ini) + "</span>");
      }
    }, true);

    document.addEventListener("keydown", function (e) {
      var modal = $("#project-modal");
      if (e.key === "Escape") { if (!modal.hidden) closeModal(true); else toggleMenu(false); }
      if (e.key === "Tab" && !modal.hidden) {
        var f = $all('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])', modal).filter(function (el) { return el.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === $("#modal-panel"))) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    $("#theme-toggle").addEventListener("click", function () {
      setTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
    });
    $("#menu-toggle").addEventListener("click", function () { toggleMenu(!$("#nav-links").classList.contains("open")); });
    window.addEventListener("hashchange", route);

    // Nav: glass after scrolling, hide on scroll down / show on scroll up; progress line
    var nav = $("#nav"), bar = $("#progress"), lastY = window.pageYOffset, ticking = false;
    function onScroll() {
      var y = window.pageYOffset;
      nav.classList.toggle("scrolled", y > 20);
      if (Math.abs(y - lastY) > 6) {
        nav.classList.toggle("hide", y > lastY && y > 200 && !$("#nav-links").classList.contains("open"));
        lastY = y;
      }
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
      ticking = false;
    }
    window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();

    // Live local time
    setInterval(function () {
      var tz = ((DATA || {}).profile || {}).timezone;
      $all("[data-clock]").forEach(function (el) { el.textContent = localTime(tz); });
    }, 20000);
  }

  /* Magnetic buttons (mouse only) */
  function setupMagnetic() {
    if (!finePointer || reduceMotion) return;
    $all(".magnetic").forEach(function (el) {
      if (el._mag) return;
      el._mag = true;
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.transition = "transform .2s ease-out";
        el.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + "px)";
      });
      el.addEventListener("pointerleave", function () {
        el.style.transition = "transform .7s cubic-bezier(0.22,1,0.36,1)";
        el.style.transform = "";
      });
    });
  }

  /* Scroll-reactive marquee */
  var marqueeStarted = false;
  function setupMarquee() {
    if (marqueeStarted || reduceMotion) return;
    var track = $(".marquee-track");
    if (!track) return;
    marqueeStarted = true;
    var x = 0, dir = 1, boost = 0, lastY = window.pageYOffset, lastT = performance.now();
    window.addEventListener("scroll", function () {
      var y = window.pageYOffset, dy = y - lastY;
      lastY = y;
      if (dy) dir = dy > 0 ? 1 : -1;
      boost = Math.min(Math.abs(dy), 40);
    }, { passive: true });
    (function frame(now) {
      var t = $(".marquee-track");
      var dt = Math.min(now - lastT, 50) / 1000;
      lastT = now;
      if (t) {
        var half = t.scrollWidth / 2;
        x -= dir * (40 + boost * 12) * dt;
        boost *= 0.9;
        if (half > 0) { if (x <= -half) x += half; if (x > 0) x -= half; }
        t.style.transform = "translate3d(" + x.toFixed(2) + "px,0,0)";
      }
      requestAnimationFrame(frame);
    })(lastT);
  }

  /* Reveals, counters, active nav link */
  var revealObs = null, navObs = null;
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduceMotion) { el.textContent = pad(target); return; }
    var start = performance.now(), dur = 1400;
    (function step(now) {
      var k = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = pad(Math.round(target * e));
      if (k < 1) requestAnimationFrame(step);
    })(start);
  }
  function setupObservers(instant) {
    var els = $all(".reveal, .section-head, .hero");
    if (revealObs) revealObs.disconnect();
    if (instant || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("in"); });
      $all("[data-count]").forEach(function (el) { el.textContent = pad(parseInt(el.getAttribute("data-count"), 10) || 0); });
    } else {
      $all("[data-count]").forEach(function (el) { el.textContent = "00"; });
      revealObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add("in");
          $all("[data-count]", en.target).forEach(animateCount);
          revealObs.unobserve(en.target);
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
      els.forEach(function (el) { revealObs.observe(el); });
    }
    if (navObs) navObs.disconnect();
    if ("IntersectionObserver" in window) {
      var links = $all(".nav-links a");
      navObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) links.forEach(function (a) { a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id); });
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      $all("main > section").forEach(function (s) { navObs.observe(s); });
    }
  }


  /* ---------------------------------------------------------------
     Theme: colour presets, font, background (from content.js → theme)
     --------------------------------------------------------------- */
  var PRESETS = {
    violet:  { dark: ["#8b7cff", "#4f8cff"], light: ["#6d5cf6", "#2f6fe8"] },
    emerald: { dark: ["#34d399", "#22d3ee"], light: ["#059669", "#0891b2"] },
    amber:   { dark: ["#f5a524", "#ff6b3d"], light: ["#d97706", "#ea580c"] },
    ocean:   { dark: ["#3b82f6", "#06b6d4"], light: ["#2563eb", "#0891b2"] },
    mono:    { dark: ["#e4e4e7", "#a1a1aa"], light: ["#18181b", "#52525b"] }
  };
  var FONTS = ["Inter", "Space Grotesk", "Manrope", "Plus Jakarta Sans", "Poppins", "Geist"];
  function hexRgb(h) {
    var m = /^#?([0-9a-f]{6})$/i.exec(str(h));
    if (!m) return "139, 124, 255";
    var n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(", ");
  }
  var currentTheme = {};
  function applyColors() {
    var mode = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    var preset = PRESETS[str(currentTheme.colors).toLowerCase()] || PRESETS.violet;
    var c = preset[mode];
    var root = document.documentElement.style;
    root.setProperty("--accent", c[0]);
    root.setProperty("--accent-2", c[1]);
    root.setProperty("--accent-rgb", hexRgb(c[0]));
    root.setProperty("--accent-2-rgb", hexRgb(c[1]));
    if (bg) bg.refresh();
  }
  function applyTheme(t) {
    currentTheme = t || {};
    var font = FONTS.indexOf(str(currentTheme.font)) !== -1 ? str(currentTheme.font) : "Inter";
    if (font !== "Inter" && !document.getElementById("font-" + slug(font))) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.id = "font-" + slug(font);
      link.href = "https://fonts.googleapis.com/css2?family=" + font.replace(/ /g, "+") + ":wght@400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
    document.documentElement.style.setProperty("--font-choice", '"' + font + '"');
    applyColors();
    if (bg) bg.setEnabled(str(currentTheme.background) !== "plain");
  }

  /* Subtle animated network background (accent-tinted) */
  var bg = (function () {
    var canvas = document.getElementById("bg-canvas");
    if (!canvas || !canvas.getContext) return null;
    var ctx = canvas.getContext("2d");
    var nodes = [], w = 0, h = 0, raf = 0, color = "139, 124, 255", enabled = true, running = false;
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(64, Math.max(24, (w * h) / 28000)));
      nodes = [];
      for (var i = 0; i < count; i++) nodes.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - 0.5) * 0.16, vy: (Math.random() - 0.5) * 0.16, r: Math.random() * 1.2 + 0.6 });
      draw();
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      if (!enabled) return;
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 150) {
            ctx.strokeStyle = "rgba(" + color + "," + (0.1 * (1 - d / 150)).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      ctx.fillStyle = "rgba(" + color + ",0.45)";
      for (var k = 0; k < nodes.length; k++) { ctx.beginPath(); ctx.arc(nodes[k].x, nodes[k].y, nodes[k].r, 0, Math.PI * 2); ctx.fill(); }
    }
    function step() {
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
      }
      draw();
      raf = requestAnimationFrame(step);
    }
    function start() { if (running || reduceMotion || !enabled) return; running = true; raf = requestAnimationFrame(step); }
    function stop() { running = false; cancelAnimationFrame(raf); }
    var t;
    window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(resize, 150); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });
    resize();
    start();
    return {
      refresh: function () {
        var v = getComputedStyle(document.documentElement).getPropertyValue("--accent-rgb").trim();
        if (v) color = v;
        if (!running) draw();
      },
      setEnabled: function (on) { enabled = on; canvas.style.display = on ? "" : "none"; if (on) start(); else stop(); draw(); }
    };
  })();

  /* ---------------------------------------------------------------
     Main render
     --------------------------------------------------------------- */
  function render(data, instant) {
    DATA = data || {};
    artN = 0;
    var site = DATA.site || {}, p = DATA.profile || {};
    applyTheme(DATA.theme);
    document.title = str(site.title) || (str(p.name) + " | " + str(p.role));
    var desc = $('meta[name="description"]');
    if (desc && str(site.description)) desc.setAttribute("content", site.description);

    $("#brand-mark").textContent = initials(p.name) || "SG";
    $("#brand-name").innerHTML = roll(p.name || "");
    var status = [];
    if ((p.availability || {}).show && str(p.availability.text)) status.push('<span class="pulse"></span><span>' + esc(p.availability.text) + "</span>");
    status.push('<span class="time" style="margin-left:10px;color:var(--text-3)">' + esc(p.timezoneLabel || "") + ' <span data-clock>' + esc(localTime(p.timezone)) + "</span></span>");
    $("#nav-status").innerHTML = status.join("");

    // Section order and numbering adapt to which sections have content
    var order = [
      ["about", true],
      ["projects", arr(DATA.projects).length > 0],
      ["skills", arr(DATA.skills).length > 0],
      ["education", arr(DATA.education).length > 0],
      ["achievements", true],
      ["github", !!(str((DATA.github || {}).username) || safeUrl((DATA.links || {}).github))],
      ["contact", true]
    ];
    var num = {}, k = 0;
    order.forEach(function (o) { if (o[1]) num[o[0]] = ++k; });

    $("#top").innerHTML = renderHero(DATA);
    $("#marquee").innerHTML = renderMarquee(DATA);
    $("#about").innerHTML = renderAbout(DATA, num.about);
    $("#projects").innerHTML = num.projects ? renderProjects(DATA, num.projects) : "";
    $("#skills").innerHTML = num.skills ? renderSkills(DATA, num.skills) : "";
    $("#education").innerHTML = num.education ? renderEducation(DATA, num.education) : "";
    $("#achievements").innerHTML = renderAchievements(DATA, num.achievements);
    $("#github").innerHTML = num.github ? renderGithub(DATA, num.github) : "";
    $("#contact").innerHTML = renderContact(DATA, num.contact);
    $("#footer").innerHTML = renderFooter(DATA);

    order.forEach(function (o) {
      var sec = document.getElementById(o[0]);
      if (sec) sec.hidden = !o[1];
      var a = $('.nav-links a[href="#' + o[0] + '"]');
      if (a) a.hidden = !o[1];
    });

    bindEvents();
    $all("img").forEach(function (img) { if (img.complete && img.naturalWidth) img.classList.add("loaded"); });
    setupObservers(instant);
    setupMagnetic();
    setupMarquee();
    loadRepos(DATA);
    route();
  }

  // Nav links get the letter-roll hover
  $all(".nav-links a").forEach(function (a) { a.innerHTML = roll(a.textContent); });

  (function initTheme() {
    var saved = store.get("sg-theme");
    var def = window.PORTFOLIO && window.PORTFOLIO.site && window.PORTFOLIO.site.defaultTheme;
    setTheme(saved || def || "dark", false);
  })();

  if (!window.PORTFOLIO) {
    $("#top").innerHTML = '<div class="container"><p class="muted">Could not load content.js. Check the file exists and has no typing errors (for example a missing comma or quote).</p></div>';
    return;
  }

  render(window.PORTFOLIO);

  // Live preview support for editor.html
  window.addEventListener("message", function (e) {
    var msg = e.data;
    if (!msg || msg.type !== "portfolio-preview" || !msg.data || e.source !== window.parent) return;
    var y = window.pageYOffset;
    render(msg.data, true);
    window.scrollTo(0, y);
  });
})();
