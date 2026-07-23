/* Sber local PWA service worker */
const CACHE = "sber-local-pwa-v15";
const PRECACHE = ["./", "./index.html", "./manifest.webmanifest", "./pwa-register.js", "./hide-balances.js", "./Main.htm", "./Savings.htm", "./Main_files/antifraud.min_8-Se.js", "./Main_files/antifraud.min_JTUt.js", "./Main_files/bfd_8-Se.js", "./Main_files/bfd_JTUt.js", "./Main_files/bizone_8-Se.js", "./Main_files/bizone_JTUt.js", "./Main_files/dynatrace_8-Se.js", "./Main_files/dynatrace_JTUt.js", "./Main_files/EdCMEglM056sRRUIHIkGOjJ1jOM7r8H1_8-Se.htm", "./Main_files/EdCMEglM056sRRUIHIkGOjJ1jOM7r8H1_JTUt.htm", "./Main_files/empty_8-Se.gif", "./Main_files/empty_JTUt.gif", "./Main_files/index_002_8-Se.js", "./Main_files/index_002_JTUt.js", "./Main_files/index_8-Se.js", "./Main_files/index_JTUt.js", "./Main_files/styles_8-Se.css", "./Main_files/styles_JTUt.css", "./Savings_files/bizone-rsa_avtb.js", "./Savings_files/bizone_avtb.js", "./Savings_files/dc9mgjm6967QP4Sh7He7i7joR31Tr87c_avtb.htm", "./Savings_files/dynatrace_avtb.js", "./Savings_files/empty_avtb.gif", "./Savings_files/index_002_avtb.js", "./Savings_files/index_avtb.js", "./Savings_files/styles_avtb.css", "./fonts/sbsans/bold/sbsans.woff", "./fonts/sbsans/bold/sbsans.woff2", "./fonts/sbsans/display-bold/sbsans.woff", "./fonts/sbsans/display-bold/sbsans.woff2", "./fonts/sbsans/display-medium/sbsans.woff", "./fonts/sbsans/display-medium/sbsans.woff2", "./fonts/sbsans/display-regular/sbsans.woff", "./fonts/sbsans/display-regular/sbsans.woff2", "./fonts/sbsans/display-semibold/sbsans.woff", "./fonts/sbsans/display-semibold/sbsans.woff2", "./fonts/sbsans/medium/sbsans.woff", "./fonts/sbsans/medium/sbsans.woff2", "./fonts/sbsans/regular/sbsans.woff", "./fonts/sbsans/regular/sbsans.woff2", "./fonts/sbsans/semibold/sbsans.woff", "./fonts/sbsans/semibold/sbsans.woff2", "./pwa-icons/favicon-16.png", "./pwa-icons/favicon-32.png", "./pwa-icons/icon-120.png", "./pwa-icons/icon-152.png", "./pwa-icons/icon-180.png", "./pwa-icons/icon-192.png", "./pwa-icons/icon-256.png", "./pwa-icons/icon-512.png", "./welcome-capture/autumn_2025-portrait.jpeg", "./welcome-capture/autumn_2025.jpeg", "./welcome-capture/capture-meta.json", "./welcome-capture/web_config.json", "./welcome-capture/web_config_v3.json", "./local-cdn/pl-res/region.stories/1.0.2/35.index.js", "./local-cdn/pl-res/region.stories/1.0.2/480.index.js", "./local-cdn/pl-res/region.stories/1.0.2/94.index.js", "./local-cdn/pl-res/region.search/4.0.8/56.index.js", "./local-cdn/pl-res/region.search/4.0.8/793.index.js", "./local-cdn/pl-res/region.search/4.0.8/817.index.js", "./local-cdn/pl-res/region.csi/3.0.2/635.index.js", "./local-cdn/pl-res/region.csi/3.0.2/913.index.js", "./local-cdn/cms-res-web/ALF/PFMALF_Options_Web_v1.json", "./local-cdn/cms-res-web/ophistory/composite-icons-config.json", "./local-cdn/cms-res-web/tarlimpt/tariffs_v2.json", "./local-cdn/cms-res-web/plsbol/img/errors/ds_ill_256_astronaut_no_wifi.png", "./local-cdn/cms-res-web/plsbol/img/errors/ds_ill_256_monitor_exclamation_sad.png", "./local-cdn/cms-res-web/plsbol/img/errors/ds_ill_256_monitor_magnifying_glass_sad.png", "./local-cdn/cdnweb/lifetab/json/web.catalog.json", "./local-cdn/cdnweb/lifetab/json/web.lifetab.main.json", "./local-cdn/cdnweb/lifetab/json/web.new.navmenu.json", "./local-cdn/cdnweb/lifetab/json/web.openproducts.json", "./local-cdn/stories-stat/MEDIA/marketplace/web.catalog.json", "./local-cdn/stories-stat/MEDIA/marketplace/webpro.catalog.json", "./local-cdn/cms-res-web-test/plsbol/img/sberkids_main_screen_new.png", "./local-cdn/cms-res-web/1c/80/c2/a8/260bfc7752a82cc7e3ae3821_12301.png", "./local-cdn/cdn/lifetab/json/web.services.json", "./local-cdn/stories-res/catalog/image/icon/ic_36_case.svg", "./local-cdn/cdnweb/lifetab/image/icon/ds_ic_36_case_diagram.svg", "./local-cdn/cdnweb/lifetab/image/icon/ds_ic_36_ingot.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_bag.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_banknote.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_card1.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_card_chevron_left1.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_card_grid.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_case_diagram.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_coat_of_arms1.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_document.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_document_on_document.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_document_rating.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_gosuslugi.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_ingot.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_mail.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_pram.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_round_speech_bubble_question.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_safe.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_safes.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_safe_diagram.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_sberprime.png", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_scales.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_shield.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_wallet.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_wallet_lines.svg", "./local-cdn/cdnweb/lifetab/image/icon/ic_36_watering_can.svg", "./local-cdn/cdn/lifetab/image/megamarket/1200x664_spasibo_1774.jpg", "./local-cdn/cdn/lifetab/image/megamarket/260x144_1765.jpg", "./local-cdn/cdn/lifetab/image/megamarket/adv_1814.jpg", "./local-cdn/cdn/lifetab/image/megamarket/adv_1817.jpg", "./local-cdn/cdn/lifetab/image/okko/image_affeksjonsverdi_462x690.jpg", "./local-cdn/cdn/lifetab/image/okko/image_bg_cheburashka-2_462x690.jpg", "./local-cdn/cdn/lifetab/image/okko/image_bg_hauru-no-ugoku-shiro_1200x664.jpg", "./local-cdn/cdn/lifetab/image/okko/image_levsha-644541042_462x690.jpeg", "./local-cdn/cdn/lifetab/image/okko/image_metod-tutberidze_462x690.jpg", "./local-cdn/cdn/lifetab/image/okko/image_na-ldu_462x690.jpg", "./local-cdn/cdn/lifetab/image/okko/image_now-you-see-me-3_462x690.jpg", "./local-cdn/cdn/lifetab/image/okko/image_the-housemaid_462x690.jpeg", "./local-cdn/cdn/lifetab/image/okko/image_vstat-na-nogi_462x690.jpg", "./local-cdn/cdn/lifetab/image/okko/image_wind_hill_462x690.jpg", "./local-cdn/cdn/lifetab/image/samokat/123x184_spasibo_samokat.jpg", "./local-cdn/cdn/lifetab/image/samokat/card_interesnoe_frov_3.jpg", "./local-cdn/cdn/lifetab/image/samokat/card_interesnoe_ot_shefa.jpg", "./local-cdn/cdn/lifetab/image/samokat/card_pobalovat_kombo_naborii_NEW26.jpg", "./local-cdn/cdn/lifetab/image/samokat/card_polka_NEW26.jpg", "./local-cdn/cdn/lifetab/image/samokat/card_sale_kvi_NEW26.jpg", "./local-cdn/cdn/lifetab/image/samokat/card_snacks_NEW26.jpg", "./local-cdn/cdn/lifetab/image/sbermobile/image_frk_dlyavseh2_sbermobile.jpg", "./local-cdn/cdn/lifetab/image/sbermobile/image_frk_dlyavseh_sbermobile.jpg", "./local-cdn/cdn/lifetab/image/sbermobile/image_pc_dostavka_sbermobile.jpg", "./local-cdn/cdn/lifetab/image/sbermobile/image_pc_sber_sbermobile.jpg", "./local-cdn/cdn/lifetab/image/sbermobile/spasibo_new_sbermobile.jpg", "./local-cdn/cdn/lifetab/image/zvuk/beg_pod_dozhdem_zvuk_280_280.png", "./local-cdn/cdn/lifetab/image/zvuk/mc_leto_zakat_zvuk_280_280.png", "./local-cdn/cdn/lifetab/image/zvuk/ppl_podpevay_zvuk_280_280.png", "./local-cdn/cdn/lifetab/image/zvuk/ppl_top50_zarubezhnyy_pop_v_hi-fi_zvuk_280_280.png", "./local-cdn/cdn/lifetab/image/zvuk/PZD_xity_do_utra_zvuk_280x280.png", "./local-cdn/cdn/lifetab/image/zvuk/sit_trenirovka_280_280.png", "./local-cdn/cdn/lifetab/image/icon/logo/Avatar_Afisha.png", "./local-cdn/cdn/lifetab/image/icon/logo/Avatar_Kuper.png", "./local-cdn/cdn/lifetab/image/icon/logo/Avatar_MM.png", "./local-cdn/cdn/lifetab/image/icon/logo/Avatar_Okko.png", "./local-cdn/cdn/lifetab/image/icon/logo/Avatar_Samokat.png", "./local-cdn/cdn/lifetab/image/icon/logo/Avatar_Sbermobile.png", "./local-cdn/cdn/lifetab/image/icon/logo/Avatar_Zvuk2.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      for (const url of PRECACHE) {
        try {
          await cache.add(url);
        } catch (e) {
          // ignore missing optional assets
        }
      }
      // Also try unencoded filenames (some servers differ)
      for (const url of ["./Main.htm", "./Savings.htm"]) {
        try {
          await cache.add(url);
        } catch (e) {}
      }
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

function isNavigation(request) {
  return request.mode === "navigate" ||
    (request.method === "GET" && request.headers.get("accept")?.includes("text/html"));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    // Network-first for remote, fall through to cache if previously stored
    event.respondWith(
      fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(request))
    );
    return;
  }

  if (isNavigation(request)) {
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const routeFallback = {
      "/": "./index.html",
      "/app": "./Main.htm",
      "/app/main": "./Main.htm",
      "/app/savings": "./Savings.htm",
    };
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(async () => {
          const mapped = routeFallback[path];
          return (
            (await caches.match(request)) ||
            (mapped && (await caches.match(mapped))) ||
            (await caches.match("./Main.htm")) ||
            (await caches.match("./Main.htm")) ||
            (await caches.match("./index.html"))
          );
        })
    );
    return;
  }

  // Cache-first for same-origin static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
        }
        return res;
      });
    })
  );
});
