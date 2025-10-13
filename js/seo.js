(function seoBootstrap() {
  // --- read per-page overrides from the <script src="/js/seo.js" ...> tag ---
  function getScriptOverrides() {
    var scripts = document.getElementsByTagName("script");
    var me = null;
    for (var i = scripts.length - 1; i >= 0; i--) {
      var s = scripts[i];
      var src = s.getAttribute("src") || "";
      if (src.indexOf("/js/seo.js") !== -1) { me = s; break; }
    }
    if (!me || !me.dataset) return {};

    var out = {};
    Object.keys(me.dataset).forEach(function (k) {
      var v = me.dataset[k];
      if (v == null) return;
      // smart-ish parsing: JSON -> boolean -> number -> string
      var parsed = v;
      try {
        // If it looks like JSON (starts with { or [ or "true"/"false"/number"), try parse
        if (/^\s*(\[|\{|"|true|false|-?\d)/i.test(v)) parsed = JSON.parse(v);
      } catch (e) { /* keep as string */ }

      if (parsed === "true") parsed = true;
      else if (parsed === "false") parsed = false;
      else if (!isNaN(parsed) && parsed !== "" && typeof parsed !== "object") parsed = Number(parsed);

      // camelCase the dataset key (title -> title, twitterHandle -> twitterHandle)
      out[k] = parsed;
    });
    return out;
  }

  // --- defaults (sane site-wide values) ---
  var defaults = {
    siteName: "EATS - Engineering and Technology Solutions",
    orgName: "EATS SYSTEMS",
    url: "https://eats-systems.com",
    logo: "https://eats-systems.com/images/logo.png",
    cover: "https://eats-systems.com/images/og-cover.jpg",
    title: document.title || "EATS - Engineering and Technology Solutions",
    description: "EATS SYSTEMS specializes in developing embedded systems from concept to mass production.",
    lang: document.documentElement.lang || "en",
    languages: ["en", "he"],
    supportEmail: "support@eats-systems.com",
    sameAs: [], // e.g., ["https://github.com/NaveItay"]
    enableTwitter: true,
    twitterCard: "summary_large_image",
    twitterHandle: ""
  };

  // --- build final config: defaults < script data-* < window.EATS_SEO (if present) ---
  var cfg = Object.assign({}, defaults, getScriptOverrides(), (window.EATS_SEO || {}));

  // --- helpers ---
  function addMeta(name, content, attr) {
    if (!content) return;
    var selector = attr === "property" ? 'meta[property="'+name+'"]' : 'meta[name="'+name+'"]';
    var el = document.querySelector(selector);
    if (!el) {
      el = document.createElement("meta");
      (attr === "property" ? el.setAttribute("property", name) : el.setAttribute("name", name));
      el.setAttribute("content", content);
      document.head.appendChild(el);
    } else if (!el.getAttribute("content")) {
      el.setAttribute("content", content);
    }
  }
  function addLink(rel, href) {
    if (!href) return;
    var el = document.querySelector('link[rel="'+rel+'"]');
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", rel);
      el.setAttribute("href", href);
      document.head.appendChild(el);
    } else if (!el.getAttribute("href")) {
      el.setAttribute("href", href);
    }
  }
  function addJSONLD(id, obj) {
    if (!obj) return;
    if (id && document.getElementById(id)) return; // avoid duplicates
    var s = document.createElement("script");
    s.type = "application/ld+json";
    if (id) s.id = id;
    s.text = JSON.stringify(obj);
    document.head.appendChild(s);
  }
  function canonicalFromLocation() {
    try {
      var u = new URL(window.location.href);
      u.hash = "";
      if (u.pathname === "/") u.pathname = "/";
      return u.toString();
    } catch(e) { return cfg.url; }
  }

  // --- canonical ---
  addLink("canonical", canonicalFromLocation());

  // --- Open Graph ---
  addMeta("og:type", "website", "property");
  addMeta("og:title", cfg.title, "property");
  addMeta("og:description", cfg.description, "property");
  addMeta("og:url", canonicalFromLocation(), "property");
  addMeta("og:image", cfg.cover, "property");
  addMeta("og:site_name", cfg.orgName, "property");

  // --- Twitter Cards ---
  if (cfg.enableTwitter) {
    addMeta("twitter:card", cfg.twitterCard);
    addMeta("twitter:title", cfg.title);
    addMeta("twitter:description", cfg.description);
    addMeta("twitter:image", cfg.cover);
    if (cfg.twitterHandle) addMeta("twitter:site", cfg.twitterHandle);
  }

  // --- Basic meta fallbacks ---
  addMeta("description", cfg.description);
  addMeta("theme-color", "#ffffff");

  // --- hreflang (simple same-URL per language; expand if you localize URLs) ---
  if (cfg.languages && cfg.languages.length) {
    var selfHref = canonicalFromLocation();
    cfg.languages.forEach(function(l){
      var link = document.createElement("link");
      link.setAttribute("rel", "alternate");
      link.setAttribute("hreflang", l);
      link.setAttribute("href", selfHref);
      document.head.appendChild(link);
    });
    var xd = document.createElement("link");
    xd.setAttribute("rel","alternate");
    xd.setAttribute("hreflang","x-default");
    xd.setAttribute("href", selfHref);
    document.head.appendChild(xd);
  }

  // --- Organization JSON-LD ---
  var orgLD = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": cfg.url + "/#org",
    "name": cfg.orgName,
    "url": cfg.url,
    "logo": cfg.logo,
    "contactPoint": [{
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": cfg.supportEmail,
      "availableLanguage": cfg.languages
    }]
  };
  if (cfg.sameAs && cfg.sameAs.length) orgLD.sameAs = cfg.sameAs;
  addJSONLD("ld-org", orgLD);

  // --- WebSite JSON-LD (with SearchAction) ---
  var siteLD = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": cfg.url + "/#website",
    "url": cfg.url,
    "name": cfg.siteName,
    "inLanguage": cfg.lang,
    "potentialAction": [{
      "@type": "SearchAction",
      "target": cfg.url.replace(/\/$/, "") + "/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }]
  };
  addJSONLD("ld-site", siteLD);

  // --- WebPage JSON-LD (lightweight) ---
  var pageLD = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": canonicalFromLocation() + "#webpage",
    "url": canonicalFromLocation(),
    "name": cfg.title,
    "inLanguage": cfg.lang,
    "isPartOf": { "@id": cfg.url + "/#website" },
    "about": { "@id": cfg.url + "/#org" }
  };
  addJSONLD("ld-page", pageLD);

  // Debug hint
  if (typeof console !== "undefined") {
    console.info("[SEO] Meta & JSON-LD injected", cfg);
  }
})();
