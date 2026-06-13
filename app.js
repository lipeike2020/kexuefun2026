(function () {
  "use strict";

  var articles = window.KEXUE_ARTICLES || [];
  var categories = window.KEXUE_CATEGORIES || [];
  var page = document.body.dataset.page || "";

  function headerHtml() {
    return (
      '<header class="site-header">' +
      '<div class="container header-inner">' +
      '<a class="logo" href="index.html" aria-label="kexue.fun 首页">kexue<span>.fun</span></a>' +
      '<nav class="desktop-nav" aria-label="主导航">' +
      navLink("index.html", "首页", "home") +
      navLink("science.html", "科普知识", "science") +
      navLink("about.html", "关于我们", "about") +
      "</nav>" +
      '<button id="menu-button" class="menu-button" type="button" aria-expanded="false" aria-label="打开菜单">菜单</button>' +
      "</div>" +
      '<nav id="mobile-nav" class="mobile-nav" aria-label="移动端主导航" hidden>' +
      navLink("index.html", "首页", "home") +
      navLink("science.html", "科普知识", "science") +
      navLink("about.html", "关于我们", "about") +
      "</nav>" +
      "</header>"
    );
  }

  function navLink(href, label, key) {
    return (
      '<a href="' +
      href +
      '" class="' +
      (page === key ? "active" : "") +
      '">' +
      label +
      "</a>"
    );
  }

  function footerHtml() {
    return (
      '<footer class="site-footer"><div class="container footer-inner">' +
      '<div><a class="logo footer-logo" href="index.html">kexue<span>.fun</span></a>' +
      "<p>把好奇心，变成每天的新发现。</p></div>" +
      '<div class="footer-links"><a href="science.html">科普知识</a><a href="about.html">关于我们</a></div>' +
      "<p>© 2026 kexue.fun 儿童科普教育</p>" +
      "</div></footer>"
    );
  }

  function articleCard(article) {
    return (
      '<article class="science-card">' +
      '<a class="card-image" href="article.html?slug=' +
      encodeURIComponent(article.slug) +
      '"><img src="' +
      article.image +
      '" alt="' +
      article.imageAlt +
      '" loading="lazy"></a>' +
      '<div class="card-body"><span class="eyebrow" style="color:' +
      article.color +
      '">' +
      article.category +
      "</span><h3><a href=\"article.html?slug=" +
      encodeURIComponent(article.slug) +
      '">' +
      article.title +
      "</a></h3><p>" +
      article.summary +
      '</p><div class="card-meta"><span>' +
      article.age +
      "</span><span>" +
      article.readingTime +
      '阅读</span></div><a class="text-link" href="article.html?slug=' +
      encodeURIComponent(article.slug) +
      '">阅读文章 →</a></div></article>'
    );
  }

  function mountSharedLayout() {
    var header = document.getElementById("site-header");
    var footer = document.getElementById("site-footer");
    if (header) header.innerHTML = headerHtml();
    if (footer) footer.innerHTML = footerHtml();

    var button = document.getElementById("menu-button");
    var mobileNav = document.getElementById("mobile-nav");
    if (button && mobileNav) {
      button.addEventListener("click", function () {
        var open = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!open));
        button.setAttribute("aria-label", open ? "打开菜单" : "关闭菜单");
        button.textContent = open ? "菜单" : "关闭";
        button.classList.toggle("open", !open);
        mobileNav.hidden = open;
      });
    }
  }

  function mountHome() {
    var container = document.getElementById("home-articles");
    if (container) {
      container.innerHTML = articles.slice(0, 3).map(articleCard).join("");
    }
  }

  function mountScienceList() {
    var list = document.getElementById("science-list");
    var filters = document.getElementById("category-filters");
    var search = document.getElementById("search-input");
    var count = document.getElementById("result-count");
    var empty = document.getElementById("empty-state");
    if (!list || !filters || !search || !count || !empty) return;

    var params = new URLSearchParams(window.location.search);
    var selected = params.get("category") || "全部";
    if (categories.indexOf(selected) === -1) selected = "全部";

    filters.innerHTML = ["全部"].concat(categories).map(function (category) {
      return (
        '<button type="button" data-category="' +
        category +
        '" class="' +
        (selected === category ? "selected" : "") +
        '">' +
        category +
        "</button>"
      );
    }).join("");

    function render() {
      var query = search.value.trim().toLowerCase();
      var results = articles.filter(function (article) {
        var categoryMatch = selected === "全部" || article.category === selected;
        var text = (article.title + article.summary).toLowerCase();
        return categoryMatch && (!query || text.indexOf(query) !== -1);
      });
      count.textContent = "找到 " + results.length + " 个科学发现";
      list.innerHTML = results.map(articleCard).join("");
      list.hidden = results.length === 0;
      empty.hidden = results.length !== 0;
    }

    filters.addEventListener("click", function (event) {
      var target = event.target.closest("button[data-category]");
      if (!target) return;
      selected = target.dataset.category;
      filters.querySelectorAll("button").forEach(function (button) {
        button.classList.toggle("selected", button === target);
      });
      render();
    });

    search.addEventListener("input", render);
    render();
  }

  function mountArticle() {
    var root = document.getElementById("article-root");
    if (!root) return;

    var slug = new URLSearchParams(window.location.search).get("slug");
    var article = articles.find(function (item) {
      return item.slug === slug;
    });

    if (!article) {
      root.innerHTML =
        '<section class="not-found"><div><span>404</span><h1>这颗知识星球还没有被发现</h1><p>返回科普列表，继续寻找有趣的问题吧。</p><a class="button primary" href="science.html">返回科普知识</a></div></section>';
      document.title = "没有找到文章 | kexue.fun";
      return;
    }

    document.title = article.title + " | kexue.fun";

    var sections = article.sections.map(function (section) {
      var paragraphs = section.paragraphs.map(function (paragraph) {
        return "<p>" + paragraph + "</p>";
      }).join("");
      var fact = section.fact
        ? '<div class="fact-box"><span>科学小知识</span><p>' + section.fact + "</p></div>"
        : "";
      return "<section><h2>" + section.title + "</h2>" + paragraphs + fact + "</section>";
    }).join("");

    var related = articles.filter(function (item) {
      return item.slug !== article.slug;
    }).slice(0, 3);

    root.innerHTML =
      '<article class="article-page"><div class="container article-header">' +
      '<a class="back-link" href="science.html">← 返回科普列表</a>' +
      '<span class="article-category" style="color:' +
      article.color +
      '">' +
      article.category +
      "</span><h1>" +
      article.title +
      '</h1><p class="article-summary">' +
      article.summary +
      '</p><div class="article-meta"><span>适合 ' +
      article.age +
      "</span><span>阅读约 " +
      article.readingTime +
      '</span></div><div class="article-cover"><img src="' +
      article.image +
      '" alt="' +
      article.imageAlt +
      '"></div></div>' +
      '<div class="container article-layout"><aside><span>先想一想</span><strong>' +
      article.question +
      '</strong></aside><div class="article-content"><p class="article-lead">' +
      article.lead +
      "</p>" +
      sections +
      "</div></div></article>" +
      '<section class="section related"><div class="container"><div class="section-head compact"><div><span class="section-label">继续探索</span><h2>你可能还会喜欢</h2></div></div><div class="card-grid">' +
      related.map(articleCard).join("") +
      "</div></div></section>";
  }

  mountSharedLayout();
  mountHome();
  mountScienceList();
  mountArticle();
})();
