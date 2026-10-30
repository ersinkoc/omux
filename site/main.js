// Points the Download buttons at the latest release's .dmg (or .zip) asset and shows
// its version. If the GitHub API can't be reached, the links keep their
// static href (the releases/latest page) and their static label.
(function () {
  var FALLBACK = "https://github.com/onurozcan/omux/releases/latest";
  var links = document.querySelectorAll("[data-download]");
  var labels = document.querySelectorAll("[data-download-label]");
  var versions = document.querySelectorAll("[data-release-version]");
  var sizes = document.querySelectorAll("[data-release-size]");

  if (typeof fetch !== "function") return;

  fetch("https://api.github.com/repos/onurozcan/omux/releases/latest", {
    headers: { Accept: "application/vnd.github+json" }
  })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (release) {
      var assets = Array.isArray(release.assets) ? release.assets : [];
      // Prefer the disk image; older releases only have a zip.
      var zip = assets.find(function (a) {
        return typeof a.name === "string" && /\.dmg$/i.test(a.name);
      }) || assets.find(function (a) {
        return typeof a.name === "string" && /\.zip$/i.test(a.name);
      });
      var version = String(release.tag_name || "").replace(/^v/, "");
      var href = zip && /^https:\/\/github\.com\//.test(zip.browser_download_url)
        ? zip.browser_download_url
        : FALLBACK;

      links.forEach(function (a) { a.href = href; });
      if (version) {
        labels.forEach(function (a) { a.textContent = "Download omux " + version + " for macOS"; });
        versions.forEach(function (el) { el.textContent = version; });
      }
      if (zip && typeof zip.size === "number" && zip.size > 0) {
        var mb = (zip.size / (1024 * 1024)).toFixed(1);
        var kind = /\.dmg$/i.test(zip.name) ? "dmg" : "zip";
        sizes.forEach(function (el) { el.textContent = mb + " MB " + kind; });
      }
    })
    .catch(function () {
      // Keep the static fallback.
    });
})();
