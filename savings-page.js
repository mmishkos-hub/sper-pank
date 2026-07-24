(function () {
  "use strict";

  var WALLET_KEY = "pwa_wallet_balance";
  var ACCOUNTS_KEY = "pwa_savings_accounts";
  var DEFAULT_WALLET = "1 964,77";
  var DEFAULT_ACCOUNTS = [
    {
      name: "Сберегательный счет",
      number: "2838",
      amount: "15 000,22",
      rate: "0,01",
      endDate: "2026-11-17",
    },
    {
      name: "Вклад «Лучший %»",
      number: "4812",
      amount: "120 000,00",
      rate: "14,5",
    },
    {
      name: "Накопительный счет",
      number: "9074",
      amount: "45 500,00",
      rate: "12",
    },
  ];

  function readAccounts() {
    try {
      var saved = JSON.parse(localStorage.getItem(ACCOUNTS_KEY));
      if (Array.isArray(saved) && saved.length === 3) {
        return DEFAULT_ACCOUNTS.map(function (defaults, index) {
          return Object.assign({}, defaults, saved[index]);
        });
      }
    } catch (e) {}
    return DEFAULT_ACCOUNTS;
  }

  function formatDate(value) {
    var normalized = String(value || "").trim();
    var isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      return isoMatch[3] + "." + isoMatch[2] + "." + isoMatch[1];
    }
    var displayMatch = normalized.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    return displayMatch ? normalized : "";
  }

  function amountToCents(value) {
    var normalized = String(value || "")
      .replace(/[\s\u00a0]/g, "")
      .replace(".", ",")
      .replace(/[^\d,]/g, "");
    var parts = normalized.split(",");
    var rubles = parseInt(parts[0] || "0", 10);
    var kopecks = parseInt(
      (parts[1] || "").slice(0, 2).padEnd(2, "0"),
      10
    );
    return rubles * 100 + kopecks;
  }

  function formatCents(cents) {
    var rubles = Math.floor(cents / 100)
      .toLocaleString("ru-RU")
      .replace(/\u00a0/g, " ");
    var kopecks = String(cents % 100).padStart(2, "0");
    return rubles + "," + kopecks;
  }

  function calculateTotal(accounts) {
    var total = amountToCents(
      localStorage.getItem(WALLET_KEY) || DEFAULT_WALLET
    );
    return accounts.reduce(function (sum, account) {
      return sum + amountToCents(account.amount);
    }, total);
  }

  function findTotalElement() {
    var labels = document.querySelectorAll("p");
    for (var i = 0; i < labels.length; i += 1) {
      if (labels[i].textContent.trim() !== "Всего средств") continue;
      var summary = labels[i].closest(".kIormwMN");
      if (summary) return summary.querySelector(".x5LmuIDy");
    }
    return null;
  }

  function setTotal(element, value) {
    if (!element) return;
    var textNode = Array.prototype.find.call(element.childNodes, function (node) {
      return node.nodeType === Node.TEXT_NODE;
    });
    if (textNode) {
      textNode.nodeValue = value + "\u00a0";
    } else {
      element.insertBefore(document.createTextNode(value + "\u00a0"), element.firstChild);
    }
  }

  function renderAccounts(accounts) {
    var list = document.querySelector("#accountsAndIma ul.dKqIH0ou");
    if (!list) return;

    var template = list.querySelector("li");
    if (!template) return;

    var items = accounts.map(function (account, index) {
      var item = template.cloneNode(true);
      var amount = item.querySelector(".SSSlz0xp");
      var title = item.querySelector(".PLvGm9zM");
      var rate = item.querySelector(".toNPJsam");
      var rateContainer = rate && rate.parentElement;
      var link = item.querySelector("a");
      var endDate = index === 0 ? formatDate(account.endDate) : "";

      if (amount) amount.textContent = account.amount + " ₽";
      if (title) title.textContent = account.name + " •• " + account.number;
      if (rate) rate.textContent = account.rate + "%";
      if (rateContainer && endDate) {
        var date = document.createElement("p");
        date.className = "pwa-account-end-date";
        date.textContent = "до " + endDate;
        rateContainer.appendChild(date);
      }
      if (link) {
        link.setAttribute(
          "aria-label",
          account.name +
            " •• " +
            account.number +
            ", " +
            account.amount +
            " ₽, " +
            account.rate +
            "%" +
            (endDate ? ", до " + endDate : "")
        );
      }
      return item;
    });

    list.replaceChildren.apply(list, items);
  }

  function renderSavings() {
    var accounts = readAccounts();
    setTotal(findTotalElement(), formatCents(calculateTotal(accounts)));
    renderAccounts(accounts);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderSavings);
  } else {
    renderSavings();
  }

  window.addEventListener("storage", renderSavings);
  window.addEventListener("pageshow", renderSavings);
  window.addEventListener("savings-config-updated", renderSavings);
})();
