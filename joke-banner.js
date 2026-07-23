(function () {
  "use strict";

  function mountJokeBanner() {
    if (document.getElementById("joke-app-banner")) return;

    var style = document.createElement("style");
    style.id = "joke-app-banner-styles";
    style.textContent =
      "#joke-app-banner{" +
      "position:relative;" +
      "display:flex;align-items:center;justify-content:center;gap:10px;" +
      "box-sizing:border-box;width:100%;margin-top:32px;padding:12px 16px;" +
      "background:#c1121f;color:#fff;" +
      "font:700 15px/1.35 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;" +
      "letter-spacing:.01em;text-align:center;" +
      "}" +
      "#joke-app-banner .joke-app-banner__mark{" +
      "flex:0 0 auto;font-size:20px;line-height:1" +
      "}" +
      "#joke-app-banner strong{font-weight:800}" +
      "@media(max-width:1199px){" +
      "#joke-app-banner.joke-app-banner--with-nav{" +
      "margin-bottom:calc(64px + env(safe-area-inset-bottom, 0px))" +
      "}" +
      "}" +
      "@media(max-width:520px){" +
      "#joke-app-banner{gap:7px;margin-top:24px;padding:10px;font-size:12px}" +
      "#joke-app-banner.joke-app-banner--with-nav{" +
      "margin-bottom:calc(62px + env(safe-area-inset-bottom, 0px))" +
      "}" +
      "#joke-app-banner .joke-app-banner__mark{font-size:17px}" +
      "}";

    var banner = document.createElement("aside");
    banner.id = "joke-app-banner";
    banner.setAttribute("role", "note");
    banner.setAttribute("aria-label", "Предупреждение");
    banner.innerHTML =
      '<span class="joke-app-banner__mark" aria-hidden="true">⚠</span>' +
      "<span><strong>ШУТОЧНОЕ ПРИЛОЖЕНИЕ.</strong> Это прикол, не настоящий банк.</span>";

    document.head.appendChild(style);
    if (document.querySelector(".scaffold__nav")) {
      banner.classList.add("joke-app-banner--with-nav");
    }
    var footerHost =
      document.querySelector(".scaffold__section") ||
      document.querySelector(".admin-container") ||
      document.body;
    footerHost.appendChild(banner);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountJokeBanner);
  } else {
    mountJokeBanner();
  }
})();
