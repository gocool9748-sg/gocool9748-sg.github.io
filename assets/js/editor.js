/* Portfolio content editor — builds forms from content.js and exports a new content.js */
(function () {
  "use strict";

  var DRAFT_KEY = "sg-portfolio-draft";

  var SECTIONS = [
    { key: "profile", label: "Profile & Hero", desc: "Your name, headline, photo, resume and availability badge — the first thing visitors see." },
    { key: "links", label: "Contact Links", desc: "Leave a link empty to hide it. Buttons only appear when a link is filled in." },
    { key: "about", label: "About", desc: "Your introduction paragraphs and the highlight list beside them." },
    { key: "projects", label: "Projects", desc: "Each project gets a card, an architecture pipeline and its own detail page. Use the arrows to reorder." },
    { key: "skills", label: "Skills", desc: "Skill groups. Add a group, or add skills inside a group." },
    { key: "education", label: "Education", desc: "Your education entries." },
    { key: "achievements", label: "Achievements", desc: "Hackathons, competitions, workshops, certifications, awards. Only items ticked as verified are shown." },
    { key: "github", label: "GitHub", desc: "Your GitHub username. The site loads your latest public repositories automatically." },
    { key: "contact", label: "Contact Section", desc: "The closing call-to-action at the bottom of the page." },
    { key: "footer", label: "Footer", desc: "Small text in the footer." },
    { key: "theme", label: "Theme & Fonts", desc: "Pick a colour preset, a font and the background style. The preview updates instantly — try a few!" },
    { key: "site", label: "Site Settings", desc: "Browser tab title, search engine description and default colour theme." }
  ];

  var LABELS = {
    title: "Title", description: "Description", defaultTheme: "Default theme",
    name: "Full name", greeting: "Small greeting above the headline", headline: "Headline lines", tagline: "Supporting text",
    role: "Main role", identities: "Titles / identities", location: "Location", degreeShort: "Degree (short form)",
    graduation: "Graduation year", photo: "Profile photo", resume: "Resume PDF", availability: "Availability badge",
    show: "Show the badge", text: "Text", email: "Email address", github: "GitHub link", linkedin: "LinkedIn link",
    paragraphs: "Paragraphs", highlights: "Highlights", institution: "Institution", degree: "Degree",
    details: "Extra points", id: "Short ID (used in the page link)", shortTitle: "Short title",
    categories: "Categories", status: "Status", visual: "Built-in thumbnail artwork", thumbnail: "Custom thumbnail image",
    summary: "One-line summary (shown on the card)", tech: "Technology stack", features: "Key features",
    pipeline: "Architecture / workflow steps (in order)", demo: "Live demo link", category: "Category", icon: "Icon",
    items: "Skills", organization: "Organisation", year: "Year", link: "Link (certificate, post, etc.)",
    verified: "Verified — show on website", username: "GitHub username", showLatestRepos: "Load latest repos from GitHub automatically",
    repoCount: "Number of repos to show", heading: "Heading",
    colors: "Colour preset", font: "Font", background: "Background",
    timezone: "Time zone", timezoneLabel: "Time zone label", formEndpoint: "Form service URL",
    problem: "The problem (shown in project details)", outcomes: "Outcomes (shown in project details)"
  };

  var HINTS = {
    photo: "Put the image in the assets/img folder, then type its path, e.g. assets/img/profile.jpg. Leave empty to show your initials.",
    resume: "Put the PDF in the assets/files folder, then type its path, e.g. assets/files/Sai_Gokul_Resume.pdf. Leave empty to disable the button.",
    thumbnail: "Optional. e.g. assets/img/lpr.png — leave empty to use the built-in artwork.",
    github: "Full link starting with https:// — leave empty to disable the button.",
    demo: "Full link starting with https:// — leave empty to disable the button.",
    linkedin: "e.g. https://www.linkedin.com/in/your-profile",
    link: "Optional. Full link starting with https://",
    id: "Lowercase words with dashes, e.g. my-new-project. Must be unique.",
    status: "e.g. Completed, In Progress, Prototype",
    repoCount: "A number from 1 to 12.",
    email: "Adding your email turns on the copy-email button and the contact form.",
    headline: "Each item is one line. Wrap words in *asterisks* to highlight them in the accent colour.",
    heading: "Wrap words in *asterisks* to highlight them in the accent colour.",
    timezone: "e.g. Asia/Kolkata — used for the live local time.",
    colors: "violet (original) · emerald (green-teal) · amber (warm orange) · ocean (blue-cyan) · mono (black & white)",
    font: "The main font for the whole site.",
    background: "network = soft animated dots, plain = solid background.",
    formEndpoint: "Optional, e.g. a Formspree URL. Empty = the form opens the visitor's email app."
  };

  var SELECTS = {
    defaultTheme: ["dark", "light"],
    colors: ["violet", "emerald", "amber", "ocean", "mono"],
    font: ["Inter", "Space Grotesk", "Manrope", "Plus Jakarta Sans", "Poppins", "Geist"],
    background: ["network", "plain"],
    visual: ["vision", "voice", "none"],
    icon: ["code", "brain", "layers", "plug", "globe", "terminal", "cloud", "database", "chip", "spark"]
  };

  var LONG_KEYS = { description: 1, text: 1, tagline: 1, summary: 1, paragraphs: 1, problem: 1 };

  var TEMPLATES = {
    projects: { id: "new-project", title: "New Project", shortTitle: "", categories: [], status: "In Progress", visual: "none", thumbnail: "", summary: "", description: [""], tech: [], features: [], pipeline: [], problem: "", outcomes: [], github: "", demo: "" },
    skills: { category: "New Skill Group", icon: "spark", items: [] },
    achievements: { title: "New Achievement", category: "Hackathons", organization: "", year: "", role: "", description: "", link: "", verified: true },
    education: { institution: "", degree: "", location: "", graduation: "", details: [] },
    highlights: { title: "", text: "" }
  };

  /* --------------------------------------------------------------- */
  function clone(v) { return JSON.parse(JSON.stringify(v)); }
  function $(s, r) { return (r || document).querySelector(s); }
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") e.textContent = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];
      else if (k.indexOf("on") === 0) e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== false && attrs[k] != null) e.setAttribute(k, attrs[k] === true ? "" : attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  function labelFor(key) {
    if (LABELS[key]) return LABELS[key];
    return String(key).replace(/([A-Z])/g, " $1").replace(/^./, function (c) { return c.toUpperCase(); });
  }
  function store(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} }
  function load(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }

  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("show"); }, 2400);
  }

  /* --------------------------------------------------------------- */
  var ORIGINAL = window.PORTFOLIO ? clone(window.PORTFOLIO) : null;
  var data = ORIGINAL ? clone(ORIGINAL) : {};
  var current = SECTIONS[0].key;
  var openItems = {};

  function getAt(path) { var o = data; for (var i = 0; i < path.length; i++) { if (o == null) return undefined; o = o[path[i]]; } return o; }
  function setAt(path, value) { var o = data; for (var i = 0; i < path.length - 1; i++) o = o[path[i]]; o[path[path.length - 1]] = value; }

  /* ---------- change handling ---------- */
  var previewTimer = null;
  function changed() {
    store(DRAFT_KEY, JSON.stringify(data));
    clearTimeout(previewTimer);
    previewTimer = setTimeout(sendPreview, 250);
  }

  function sendPreview() {
    var frame = $("#preview");
    if (!frame || !frame.contentWindow) return;
    try { frame.contentWindow.postMessage({ type: "portfolio-preview", data: data }, "*"); } catch (e) {}
  }

  /* ---------- form builders ---------- */
  function isLong(key, value) { return LONG_KEYS[key] || (typeof value === "string" && value.length > 90); }

  function scalarInput(path, key, value, parentKey) {
    var id = "f-" + path.join("-");
    if (typeof value === "boolean") {
      var cb = el("input", { type: "checkbox", id: id });
      cb.checked = value;
      cb.addEventListener("change", function () { setAt(path, cb.checked); changed(); });
      return el("label", { "class": "check", "for": id }, [cb, labelFor(key)]);
    }
    if (SELECTS[key]) {
      var sel = el("select", { id: id });
      var opts = SELECTS[key].slice();
      if (opts.indexOf(value) === -1 && value !== "") opts.unshift(value);
      opts.forEach(function (o) { var op = el("option", { value: o, text: o }); if (o === value) op.selected = true; sel.appendChild(op); });
      sel.addEventListener("change", function () { setAt(path, sel.value); changed(); });
      return sel;
    }
    var isNum = typeof value === "number";
    var long = isLong(key, value) || isLong(parentKey, value);
    var input = long ? el("textarea", { id: id, rows: 3 }) : el("input", { type: "text", id: id });
    input.value = value == null ? "" : String(value);
    input.addEventListener("input", function () {
      var v = input.value;
      if (isNum) { var n = parseInt(v, 10); v = isNaN(n) ? 0 : n; }
      setAt(path, v);
      changed();
      refreshTitles();
    });
    return input;
  }

  function field(path, key, value) {
    var wrap = el("div", { "class": "field" });
    if (Array.isArray(value)) {
      wrap.appendChild(el("span", { "class": "label", text: labelFor(key) }));
      if (value.length && typeof value[0] === "object" && value[0] !== null || (!value.length && TEMPLATES[key])) {
        wrap.appendChild(objectList(path, key, value));
      } else {
        wrap.appendChild(stringList(path, key, value));
      }
    } else if (value && typeof value === "object") {
      var g = el("div", { "class": "group" }, [el("p", { "class": "group-title", text: labelFor(key) })]);
      Object.keys(value).forEach(function (k) { g.appendChild(field(path.concat(k), k, value[k])); });
      return g;
    } else {
      if (typeof value !== "boolean") wrap.appendChild(el("label", { "for": "f-" + path.join("-"), text: labelFor(key) }));
      wrap.appendChild(scalarInput(path, key, value));
    }
    if (HINTS[key]) wrap.appendChild(el("span", { "class": "hint", text: HINTS[key] }));
    return wrap;
  }

  function move(arr, from, to) {
    if (to < 0 || to >= arr.length) return;
    var item = arr.splice(from, 1)[0];
    arr.splice(to, 0, item);
  }

  function rowTools(arr, i, onDone) {
    return el("div", { "class": "row-tools" }, [
      el("button", { "class": "btn btn-sm icon-btn", type: "button", title: "Move up", "aria-label": "Move up", text: "↑", disabled: i === 0, onclick: function (e) { e.stopPropagation(); move(arr, i, i - 1); onDone(); } }),
      el("button", { "class": "btn btn-sm icon-btn", type: "button", title: "Move down", "aria-label": "Move down", text: "↓", disabled: i === arr.length - 1, onclick: function (e) { e.stopPropagation(); move(arr, i, i + 1); onDone(); } }),
      el("button", { "class": "btn btn-sm icon-btn btn-danger", type: "button", title: "Remove", "aria-label": "Remove", text: "✕", onclick: function (e) {
        e.stopPropagation();
        var v = arr[i];
        var label = typeof v === "string" ? v : (v && (v.title || v.category || v.institution)) || "this item";
        if (typeof v === "object" && !window.confirm("Remove \"" + label + "\"?")) return;
        arr.splice(i, 1); onDone();
      } })
    ]);
  }

  function structural() { changed(); renderForm(true); }

  function stringList(path, key, arr) {
    var box = el("div", { "class": "list" });
    arr.forEach(function (v, i) {
      var input = scalarInput(path.concat(i), key, v, key);
      box.appendChild(el("div", { "class": "list-row" }, [input, rowTools(arr, i, structural)]));
    });
    box.appendChild(el("button", { "class": "btn btn-sm add", type: "button", text: "+ Add " + singular(key), onclick: function () {
      arr.push(""); structural();
      setTimeout(function () {
        var last = document.getElementById("f-" + path.concat(arr.length - 1).join("-"));
        if (last) last.focus();
      }, 0);
    } }));
    return box;
  }

  function itemTitle(v, i) {
    return (v && (v.title || v.category || v.institution || v.name)) || "Item " + (i + 1);
  }

  function objectList(path, key, arr) {
    var box = el("div");
    arr.forEach(function (v, i) {
      var p = path.concat(i);
      var pk = p.join(".");
      var item = el("div", { "class": "item" + (openItems[pk] ? " open" : ""), "data-path": pk });
      var head = el("div", { "class": "item-head", role: "button", tabindex: "0", "aria-expanded": openItems[pk] ? "true" : "false" }, [
        el("span", { "class": "chev", text: "›" }),
        el("span", { "class": "num", text: String(i + 1).padStart(2, "0") }),
        el("span", { "class": "title", text: itemTitle(v, i) }),
        rowTools(arr, i, structural)
      ]);
      function toggle() {
        openItems[pk] = !openItems[pk];
        item.classList.toggle("open", !!openItems[pk]);
        head.setAttribute("aria-expanded", openItems[pk] ? "true" : "false");
      }
      head.addEventListener("click", toggle);
      head.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
      var body = el("div", { "class": "item-body" });
      Object.keys(v || {}).forEach(function (k) { body.appendChild(field(p.concat(k), k, v[k])); });
      item.appendChild(head); item.appendChild(body);
      box.appendChild(item);
    });
    box.appendChild(el("button", { "class": "btn btn-sm add", type: "button", text: "+ Add " + singular(key), onclick: function () {
      var tpl = TEMPLATES[key] ? clone(TEMPLATES[key]) : blankFrom(arr[0]);
      if (key === "projects") tpl.id = uniqueId(arr, "new-project");
      arr.push(tpl);
      openItems[path.concat(arr.length - 1).join(".")] = true;
      structural();
    } }));
    return box;
  }

  function uniqueId(arr, base) {
    var ids = arr.map(function (p) { return p.id; });
    var id = base, n = 2;
    while (ids.indexOf(id) !== -1) id = base + "-" + n++;
    return id;
  }

  function blankFrom(sample) {
    if (!sample || typeof sample !== "object") return {};
    var out = {};
    Object.keys(sample).forEach(function (k) {
      var v = sample[k];
      out[k] = Array.isArray(v) ? [] : typeof v === "boolean" ? v : typeof v === "number" ? 0 : v && typeof v === "object" ? blankFrom(v) : "";
    });
    return out;
  }

  function singular(key) {
    var map = { outcomes: "outcome", projects: "project", skills: "skill group", achievements: "achievement", education: "education entry", highlights: "highlight", paragraphs: "paragraph", items: "skill", features: "feature", pipeline: "step", tech: "technology", categories: "category", identities: "title", headline: "line", details: "point", description: "paragraph" };
    return map[key] || "item";
  }

  function refreshTitles() {
    document.querySelectorAll(".item[data-path]").forEach(function (item) {
      var path = item.getAttribute("data-path").split(".").map(function (p) { return /^\d+$/.test(p) ? +p : p; });
      var v = getAt(path);
      var t = item.querySelector(":scope > .item-head .title");
      if (t) t.textContent = itemTitle(v, path[path.length - 1]);
    });
  }

  /* ---------- page ---------- */
  function sectionList() {
    var keys = SECTIONS.map(function (s) { return s.key; });
    var extra = Object.keys(data).filter(function (k) { return keys.indexOf(k) === -1; }).map(function (k) { return { key: k, label: labelFor(k), desc: "" }; });
    return SECTIONS.filter(function (s) { return s.key in data; }).concat(extra);
  }

  function renderSidebar() {
    var nav = $("#sidebar");
    nav.innerHTML = "";
    sectionList().forEach(function (s) {
      nav.appendChild(el("button", { type: "button", "aria-current": s.key === current ? "true" : "false", text: s.label, onclick: function () {
        current = s.key; renderSidebar(); renderForm(false); $(".form-pane").scrollTop = 0;
        var anchor = { profile: "top", links: "contact", site: "top", footer: "footer" }[s.key] || s.key;
        var frame = $("#preview");
        try {
          var target = frame.contentDocument && frame.contentDocument.getElementById(anchor);
          if (target) target.scrollIntoView({ behavior: "smooth" });
        } catch (e) {}
      } }));
    });
  }

  function renderForm(keepScroll) {
    var pane = $(".form-pane");
    var y = pane.scrollTop;
    var form = $("#form");
    form.innerHTML = "";
    var meta = sectionList().filter(function (s) { return s.key === current; })[0] || { key: current, label: labelFor(current), desc: "" };
    form.appendChild(el("h2", { "class": "section-title", text: meta.label }));
    if (meta.desc) form.appendChild(el("p", { "class": "section-desc", text: meta.desc }));
    var value = data[current];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.keys(value).forEach(function (k) { form.appendChild(field([current, k], k, value[k])); });
    } else {
      form.appendChild(field([current], current, value));
    }
    if (keepScroll) pane.scrollTop = y;
  }

  /* ---------- export ---------- */
  function buildFile() {
    return "/* =====================================================================\n" +
      "   PORTFOLIO CONTENT — the only file you need to edit.\n" +
      "   Easiest way to edit: open editor.html, make changes, click\n" +
      "   \"Download content.js\" and replace this file.\n" +
      "   Leave any link as \"\" (empty) to hide its button.\n" +
      "   Generated by the Portfolio Editor on " + new Date().toISOString().slice(0, 10) + ".\n" +
      "   ===================================================================== */\n\n" +
      "window.PORTFOLIO = " + JSON.stringify(data, null, 2) + ";\n";
  }

  function validate() {
    var problems = [];
    var ids = {};
    (data.projects || []).forEach(function (p, i) {
      if (!p.id) problems.push("Project " + (i + 1) + " needs a Short ID.");
      else if (ids[p.id]) problems.push("Two projects share the ID \"" + p.id + "\".");
      ids[p.id] = true;
    });
    function checkUrl(u, where) { if (u && !/^(https?:\/\/|mailto:)/i.test(u) && /^[a-z]+:/i.test(u)) problems.push(where + " link looks invalid."); }
    var l = data.links || {};
    checkUrl(l.github, "GitHub"); checkUrl(l.linkedin, "LinkedIn");
    if (l.linkedin && !/^https?:\/\//i.test(l.linkedin)) problems.push("LinkedIn link should start with https://");
    if (l.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l.email)) problems.push("Email address doesn't look right.");
    (data.projects || []).forEach(function (p) {
      ["github", "demo"].forEach(function (k) { if (p[k] && !/^https?:\/\//i.test(p[k])) problems.push("\"" + p.title + "\" " + k + " link should start with https://"); });
    });
    return problems;
  }

  function download() {
    var problems = validate();
    if (problems.length && !window.confirm("Please check:\n\n• " + problems.join("\n• ") + "\n\nDownload anyway?")) return;
    var blob = new Blob([buildFile()], { type: "text/javascript" });
    var a = el("a", { href: URL.createObjectURL(blob), download: "content.js" });
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    toast("Downloaded content.js — replace the old file with it");
  }

  function showCode() {
    $("#code-out").value = buildFile();
    $("#code-dialog").hidden = false;
    var ta = $("#code-out");
    ta.focus(); ta.select();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(ta.value).then(function () { toast("Copied to clipboard"); }, function () {});
    }
  }

  function parseFile(text) {
    var m = text.indexOf("window.PORTFOLIO");
    var body = m === -1 ? text : text.slice(text.indexOf("=", m) + 1);
    body = body.trim().replace(/;\s*$/, "");
    try { return JSON.parse(body); } catch (e) {}
    // Hand-edited files may contain comments or unquoted keys
    var sandbox = {};
    /* eslint-disable no-new-func */
    new Function("window", text)(sandbox);
    if (!sandbox.PORTFOLIO || typeof sandbox.PORTFOLIO !== "object") throw new Error("No PORTFOLIO data found");
    return sandbox.PORTFOLIO;
  }

  /* ---------- init ---------- */
  function init() {
    if (!ORIGINAL) {
      $("#form").innerHTML = '<p class="section-desc">Could not load content.js. Make sure editor.html is in the same folder as content.js, or use <b>Open file</b> above.</p>';
    }

    var draft = load(DRAFT_KEY);
    if (draft && ORIGINAL && draft !== JSON.stringify(ORIGINAL)) {
      $("#draft-banner").hidden = false;
      $("#btn-restore").addEventListener("click", function () {
        try { data = JSON.parse(draft); renderSidebar(); renderForm(false); sendPreview(); toast("Draft restored"); } catch (e) { toast("Could not restore draft"); }
        $("#draft-banner").hidden = true;
      });
      $("#btn-discard").addEventListener("click", function () { store(DRAFT_KEY, null); $("#draft-banner").hidden = true; });
    }

    $("#btn-download").addEventListener("click", download);
    $("#btn-copy").addEventListener("click", showCode);
    $("#close-code").addEventListener("click", function () { $("#code-dialog").hidden = true; });
    $("#code-dialog").addEventListener("click", function (e) { if (e.target === e.currentTarget) e.currentTarget.hidden = true; });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") $("#code-dialog").hidden = true; });

    $("#btn-reset").addEventListener("click", function () {
      if (!ORIGINAL) return;
      if (!window.confirm("Discard all changes and go back to the current content.js?")) return;
      data = clone(ORIGINAL); store(DRAFT_KEY, null); openItems = {};
      renderSidebar(); renderForm(false); sendPreview(); toast("Reset to content.js");
    });

    $("#btn-preview").addEventListener("click", function () {
      var on = this.getAttribute("aria-pressed") !== "true";
      this.setAttribute("aria-pressed", on ? "true" : "false");
      $("#layout").classList.toggle("no-preview", !on);
    });

    document.querySelectorAll(".seg button").forEach(function (b) {
      b.addEventListener("click", function () {
        document.querySelectorAll(".seg button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        $(".preview-stage").classList.toggle("mobile", b.getAttribute("data-size") === "mobile");
      });
    });

    $("#import-file").addEventListener("change", function () {
      var f = this.files && this.files[0];
      if (!f) return;
      var reader = new FileReader();
      var input = this;
      reader.onload = function () {
        try {
          data = parseFile(String(reader.result));
          openItems = {};
          if (!(current in data)) current = Object.keys(data)[0];
          changed(); renderSidebar(); renderForm(false); sendPreview();
          toast("Loaded " + f.name);
        } catch (e) {
          toast("That file couldn't be read — is it a content.js file?");
        }
        input.value = "";
      };
      reader.readAsText(f);
    });

    $("#preview").addEventListener("load", sendPreview);

    if (ORIGINAL) { renderSidebar(); renderForm(false); }
  }

  init();
})();
