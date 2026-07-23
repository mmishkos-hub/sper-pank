(function () {
  var unlockedKey = "onlineAppUnlocked_v1";
  var hiddenAtKey = "onlineAppHiddenAt_v1";
  var relockAfterMs = 5 * 1000;

  function setStaticPageTheme() {
    var fileName = decodeURIComponent(location.pathname.split("/").pop() || "").toLowerCase();
    if (fileName !== "savings.htm") return;
    Array.prototype.forEach.call(
      document.querySelectorAll('meta[name="theme-color"]'),
      function (meta) {
        meta.setAttribute("content", "#F1F1F1");
      }
    );
  }

  setStaticPageTheme();

  function markAppHidden() {
    try {
      sessionStorage.setItem(hiddenAtKey, String(Date.now()));
    } catch (e) {}
  }

  function relockIfExpired() {
    var hiddenAt = 0;
    try {
      hiddenAt = Number(sessionStorage.getItem(hiddenAtKey) || 0);
      sessionStorage.removeItem(hiddenAtKey);
    } catch (e) {}

    if (!hiddenAt || Date.now() - hiddenAt < relockAfterMs) return false;

    try {
      sessionStorage.removeItem(unlockedKey);
    } catch (e) {}

    var fileName = decodeURIComponent(location.pathname.split("/").pop() || "").toLowerCase();
    if (fileName === "main.htm" || fileName === "") {
      location.reload();
    } else {
      location.replace(new URL("./Main.htm?lock=1", location.href).href);
    }
    return true;
  }

  window.addEventListener("pagehide", markAppHidden);
  window.addEventListener("pageshow", relockIfExpired);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      markAppHidden();
    } else if (document.visibilityState === "visible") {
      relockIfExpired();
    }
  });
  if (document.visibilityState === "visible") relockIfExpired();

  if (!("serviceWorker" in navigator)) return;

  var reloading = false;
  var registration;

  navigator.serviceWorker.addEventListener("controllerchange", function () {
    if (reloading) return;
    reloading = true;
    window.location.reload();
  });

  function activateWaitingWorker() {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  }

  function checkForUpdate() {
    if (!registration || !navigator.onLine) return;
    registration.update().then(activateWaitingWorker).catch(function () {});
  }

  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("./sw.js", { updateViaCache: "none" })
      .then(function (value) {
        registration = value;
        activateWaitingWorker();
        checkForUpdate();

        registration.addEventListener("updatefound", function () {
          var worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", function () {
            if (worker.state === "installed") activateWaitingWorker();
          });
        });
      })
      .catch(function () {});

    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().catch(function () {});
    }
  });

  window.addEventListener("online", checkForUpdate);
  window.addEventListener("pageshow", checkForUpdate);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") checkForUpdate();
  });
  window.setInterval(checkForUpdate, 30 * 60 * 1000);
})();
