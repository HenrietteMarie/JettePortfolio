(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.getElementById("mobile-nav");
  var yearEl = document.getElementById("year");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Sticky header subtle state */
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 12) {
      header.classList.add("is-scrolled");
    } else {
      header.classList.remove("is-scrolled");
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile navigation */
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      var open = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", open ? "false" : "true");
      mobileNav.hidden = open;
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.setAttribute("aria-expanded", "false");
        mobileNav.hidden = true;
      });
    });
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* Hero greeting: show + typewriter effect */
  var heroReveal = document.querySelector(".hero-line-wrap[data-reveal]");
  var heroGreeting = document.querySelector(".hero-greeting");
  if (heroReveal) {
    requestAnimationFrame(function () {
      heroReveal.classList.add("is-visible");
    });
  }
  var heroTypeTimer = null;
  var heroTypeCleanupTimer = null;
  function startHeroTypewriter() {
    if (!heroGreeting) return;
    var greetingText = heroGreeting.getAttribute("data-typewriter-text") || heroGreeting.textContent || "";
    heroGreeting.setAttribute("data-typewriter-text", greetingText);
    if (heroTypeTimer) window.clearInterval(heroTypeTimer);
    if (heroTypeCleanupTimer) window.clearTimeout(heroTypeCleanupTimer);

    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      heroGreeting.classList.remove("is-typing");
      heroGreeting.textContent = greetingText;
      return;
    }

    heroGreeting.textContent = "";
    heroGreeting.classList.add("is-typing");
    var charIndex = 0;
    heroTypeTimer = window.setInterval(function () {
      charIndex += 1;
      heroGreeting.textContent = greetingText.slice(0, charIndex);
      if (charIndex >= greetingText.length) {
        window.clearInterval(heroTypeTimer);
        heroTypeTimer = null;
        heroTypeCleanupTimer = window.setTimeout(function () {
          heroGreeting.classList.remove("is-typing");
        }, 800);
      }
    }, 105);
  }

  if (heroGreeting) {
    window.addEventListener("load", startHeroTypewriter);
    window.addEventListener("pageshow", startHeroTypewriter);
    startHeroTypewriter();
  }

  /* Filter chips */
  var chips = document.querySelectorAll(".chip[data-filter]");
  var projectWraps = document.querySelectorAll(".project-card-wrap[data-category]");

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var filter = chip.getAttribute("data-filter");
      chips.forEach(function (c) {
        c.classList.toggle("is-active", c === chip);
        c.setAttribute("aria-selected", c === chip ? "true" : "false");
      });

      projectWraps.forEach(function (wrap) {
        if (filter === "all") {
          wrap.classList.remove("is-filtered-out");
          return;
        }
        var cats = (wrap.getAttribute("data-category") || "").toLowerCase().split(/\s+/);
        var match = cats.indexOf(filter) !== -1;
        wrap.classList.toggle("is-filtered-out", !match);
      });
    });
  });

  /* In-page nav: active state + smooth scroll (bi-directional sync) */
  var navLinks = Array.from(document.querySelectorAll('.nav a[href^="#"], .mobile-nav a[href^="#"]'));
  var sectionIds = Array.from(
    new Set(
      navLinks
        .map(function (link) { return link.getAttribute("href"); })
        .filter(function (href) { return href && href !== "#"; })
    )
  );
  var sections = sectionIds
    .map(function (id) { return document.querySelector(id); })
    .filter(Boolean);

  function setActiveNavLink(targetHash) {
    navLinks.forEach(function (link) {
      var isActive = !!targetHash && link.getAttribute("href") === targetHash;
      link.classList.toggle("is-active", isActive);
      link.setAttribute("aria-current", isActive ? "page" : "false");
    });
  }

  navLinks.forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var href = anchor.getAttribute("href");
      if (!href || href === "#") return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      setActiveNavLink(href);
      var headerHeight = header ? header.offsetHeight : 72;
      var top = target.getBoundingClientRect().top + window.scrollY - (headerHeight + 12);
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  if (sections.length) {
    var scrollTicking = false;

    function updateActiveByScrollPosition() {
      var headerHeight = header ? header.offsetHeight : 72;
      var markerY = headerHeight + 24;
      var firstSection = sections[0];
      var firstSectionRect = firstSection.getBoundingClientRect();
      var activeSection = null;
      var lastPassedSection = sections[0];

      if (firstSectionRect.top > markerY) {
        setActiveNavLink(null);
        scrollTicking = false;
        return;
      }

      sections.forEach(function (section) {
        var rect = section.getBoundingClientRect();

        if (rect.top <= markerY) {
          lastPassedSection = section;
        }

        if (rect.top <= markerY && rect.bottom > markerY) {
          activeSection = section;
        }
      });

      if (!activeSection) {
        activeSection = lastPassedSection;
      }

      setActiveNavLink("#" + activeSection.id);
      scrollTicking = false;
    }

    function onNavScroll() {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(updateActiveByScrollPosition);
    }

    window.addEventListener("scroll", onNavScroll, { passive: true });
    window.addEventListener("resize", onNavScroll);
    window.addEventListener("hashchange", onNavScroll);

    if (window.location.hash && sectionIds.indexOf(window.location.hash) !== -1) {
      setActiveNavLink(window.location.hash);
    }
    window.addEventListener("load", onNavScroll);
    onNavScroll();
  }

  /* About collage cluster hover */
  var collageWidget = document.querySelector(".about-collage-widget");
  if (collageWidget) {
    var singingTrigger = document.querySelector(".about-singing-trigger");
    var videoOverlay = collageWidget.querySelector(".about-video-overlay");
    var videoCloseBtn = collageWidget.querySelector(".about-video-close");
    var videoEmbed = collageWidget.querySelector(".about-video-embed");
    var collageItems = Array.from(collageWidget.querySelectorAll(".about-collage-item[data-cluster]"));
    var clusterLabel = collageWidget.querySelector(".about-cluster-label");
    var clusterTextWords = {
      "Art": ["THIS", "IS", "MY", "ART"],
      "Just Me": ["THATS", "JUST", "ME"],
      "Sport": ["THATS", "SPORTY", "ME"],
      "Musical Rent": ["THATS", "ME", "IN", "RENT", "(MUSICAL)"],
      "Singing": ["THATS", "ME", "SINGING"]
    };
    var clusterWordLayouts = {
      "Art": [
        { x: 42, y: 18 },
        { x: 27, y: 33 },
        { x: 36, y: 50 },
        { x: 43, y: 66 }
      ],
      "Sport": [
        { x: 30, y: 52 },
        { x: 30, y: 64 },
        { x: 30, y: 76 }
      ],
      "Just Me": [
        { x: 58, y: 21 },
        { x: 58, y: 35 },
        { x: 58, y: 49 }
      ],
      "Musical Rent": [
        { x: 16, y: 12 },
        { x: 42, y: 24 },
        { x: 24, y: 36 },
        { x: 50, y: 48 },
        { x: 32, y: 60 }
      ],
      "Singing": [
        { x: 22, y: 20 },
        { x: 22, y: 34 },
        { x: 27, y: 48 }
      ]
    };

    function rectsOverlap(a, b) {
      return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
    }

    function expandRect(rect, amount) {
      return {
        left: rect.left - amount,
        top: rect.top - amount,
        right: rect.right + amount,
        bottom: rect.bottom + amount
      };
    }

    function keepWordInsideAndOffFocus(clusterName) {
      if (!clusterLabel) return;

      var widgetRect = collageWidget.getBoundingClientRect();
      var safePadding = 16;
      var focusClearance = 24;
      var wordClearance = 10;
      var activeRects = collageItems
        .filter(function (item) {
          return item.getAttribute("data-cluster") === clusterName && item.offsetParent !== null;
        })
        .map(function (item) {
          var rect = item.getBoundingClientRect();
          return {
            left: rect.left - widgetRect.left,
            top: rect.top - widgetRect.top,
            right: rect.right - widgetRect.left,
            bottom: rect.bottom - widgetRect.top
          };
        });
      var restrictedRects = activeRects.map(function (rect) {
        return expandRect(rect, focusClearance);
      });

      var words = Array.from(clusterLabel.querySelectorAll(".about-cluster-word"));
      var nudgeCandidates = [
        { x: 0, y: 0 },
        { x: -24, y: 0 }, { x: 24, y: 0 },
        { x: 0, y: -22 }, { x: 0, y: 22 },
        { x: -36, y: -20 }, { x: 36, y: -20 },
        { x: -36, y: 20 }, { x: 36, y: 20 },
        { x: -52, y: 0 }, { x: 52, y: 0 },
        { x: 0, y: -36 }, { x: 0, y: 36 },
        { x: -68, y: -24 }, { x: 68, y: -24 },
        { x: -68, y: 24 }, { x: 68, y: 24 },
        { x: -84, y: 0 }, { x: 84, y: 0 },
        { x: 0, y: -52 }, { x: 0, y: 52 }
      ];
      var placedRects = [];

      words.forEach(function (word) {
        var baseLeft = parseFloat(word.style.left) || (widgetRect.width / 2);
        var baseTop = parseFloat(word.style.top) || (widgetRect.height / 2);
        var chosen = { x: baseLeft, y: baseTop };
        var bestScore = Number.POSITIVE_INFINITY;

        for (var i = 0; i < nudgeCandidates.length; i += 1) {
          var attemptX = baseLeft + nudgeCandidates[i].x;
          var attemptY = baseTop + nudgeCandidates[i].y;

          word.style.left = attemptX + "px";
          word.style.top = attemptY + "px";

          var wr = word.getBoundingClientRect();
          var wordRect = {
            left: wr.left - widgetRect.left,
            top: wr.top - widgetRect.top,
            right: wr.right - widgetRect.left,
            bottom: wr.bottom - widgetRect.top
          };

          var insideBounds =
            wordRect.left >= safePadding &&
            wordRect.top >= safePadding &&
            wordRect.right <= (widgetRect.width - safePadding) &&
            wordRect.bottom <= (widgetRect.height - safePadding);

          var overlapsRestricted = restrictedRects.some(function (restrictedRect) {
            return rectsOverlap(wordRect, restrictedRect);
          });
          var overlapsWords = placedRects.some(function (placedRect) {
            return rectsOverlap(wordRect, expandRect(placedRect, wordClearance));
          });

          if (insideBounds && !overlapsRestricted && !overlapsWords) {
            var score = Math.abs(nudgeCandidates[i].x) + Math.abs(nudgeCandidates[i].y);
            if (score < bestScore) {
              bestScore = score;
              chosen = { x: attemptX, y: attemptY };
            }
          }
        }

        // If nothing with full clearance fits, try a soft fallback
        if (!Number.isFinite(bestScore)) {
          for (var j = 0; j < nudgeCandidates.length; j += 1) {
            var softX = baseLeft + nudgeCandidates[j].x;
            var softY = baseTop + nudgeCandidates[j].y;
            word.style.left = softX + "px";
            word.style.top = softY + "px";

            var swr = word.getBoundingClientRect();
            var softRect = {
              left: swr.left - widgetRect.left,
              top: swr.top - widgetRect.top,
              right: swr.right - widgetRect.left,
              bottom: swr.bottom - widgetRect.top
            };
            var softInside =
              softRect.left >= safePadding &&
              softRect.top >= safePadding &&
              softRect.right <= (widgetRect.width - safePadding) &&
              softRect.bottom <= (widgetRect.height - safePadding);
            var softOverlap = activeRects.some(function (activeRect) {
              return rectsOverlap(softRect, activeRect);
            });
            var softWordOverlap = placedRects.some(function (placedRect) {
              return rectsOverlap(softRect, placedRect);
            });
            if (softInside && !softOverlap && !softWordOverlap) {
              chosen = { x: softX, y: softY };
            break;
            }
          }
        }

        word.style.left = chosen.x + "px";
        word.style.top = chosen.y + "px";

        // Hard clamp fallback: always keep the word inside widget bounds.
        var finalRect = word.getBoundingClientRect();
        var finalLocal = {
          left: finalRect.left - widgetRect.left,
          top: finalRect.top - widgetRect.top,
          right: finalRect.right - widgetRect.left,
          bottom: finalRect.bottom - widgetRect.top
        };
        var clampDx = 0;
        var clampDy = 0;

        if (finalLocal.left < safePadding) {
          clampDx = safePadding - finalLocal.left;
        } else if (finalLocal.right > (widgetRect.width - safePadding)) {
          clampDx = (widgetRect.width - safePadding) - finalLocal.right;
        }
        if (finalLocal.top < safePadding) {
          clampDy = safePadding - finalLocal.top;
        } else if (finalLocal.bottom > (widgetRect.height - safePadding)) {
          clampDy = (widgetRect.height - safePadding) - finalLocal.bottom;
        }

        if (clampDx !== 0 || clampDy !== 0) {
          word.style.left = (chosen.x + clampDx) + "px";
          word.style.top = (chosen.y + clampDy) + "px";
        }

        var placedRectDom = word.getBoundingClientRect();
        placedRects.push({
          left: placedRectDom.left - widgetRect.left,
          top: placedRectDom.top - widgetRect.top,
          right: placedRectDom.right - widgetRect.left,
          bottom: placedRectDom.bottom - widgetRect.top
        });
      });
    }

    function clearClusterState() {
      collageWidget.classList.remove("is-clustering");
      collageItems.forEach(function (item) {
        item.classList.remove("is-cluster-active");
      });
      if (clusterLabel) {
        clusterLabel.innerHTML = "";
      }
    }

    function applyClusterState(clusterName) {
      if (!clusterName) {
        clearClusterState();
        return;
      }
      collageWidget.classList.add("is-clustering");
      collageItems.forEach(function (item) {
        var isMatch = item.getAttribute("data-cluster") === clusterName;
        item.classList.toggle("is-cluster-active", isMatch);
      });
      if (clusterLabel) {
        var clusterSlug = clusterName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        clusterLabel.className = "about-cluster-label cluster-" + clusterSlug;
        var words = clusterTextWords[clusterName] || [clusterName.toUpperCase()];
        var layout = clusterWordLayouts[clusterName] || [];
        clusterLabel.innerHTML = words
          .map(function (word, idx) {
            var pos = layout[idx] || { x: 50, y: 50 + (idx * 10) };
            return "<span class=\"about-cluster-word\" style=\"left:" + pos.x + "%;top:" + pos.y + "%;\">" + word + "</span>";
          })
          .join("");

        Array.from(clusterLabel.querySelectorAll(".about-cluster-word")).forEach(function (wordEl) {
          var leftPercent = parseFloat(wordEl.style.left) || 50;
          var topPercent = parseFloat(wordEl.style.top) || 50;
          var leftPx = (leftPercent / 100) * collageWidget.clientWidth;
          var topPx = (topPercent / 100) * collageWidget.clientHeight;
          wordEl.style.left = leftPx + "px";
          wordEl.style.top = topPx + "px";
        });
        keepWordInsideAndOffFocus(clusterName);
      }
    }

    collageItems.forEach(function (item) {
      item.addEventListener("mouseenter", function () {
        applyClusterState(item.getAttribute("data-cluster"));
      });
    });

    collageWidget.addEventListener("mouseleave", clearClusterState);

    if (singingTrigger && videoOverlay && videoEmbed) {
      var ytPlayer = null;
      var ytApiReadyPromise = null;

      function loadYouTubeApi() {
        if (window.YT && window.YT.Player) {
          return Promise.resolve();
        }
        if (ytApiReadyPromise) return ytApiReadyPromise;

        ytApiReadyPromise = new Promise(function (resolve) {
          var prevReady = window.onYouTubeIframeAPIReady;
          window.onYouTubeIframeAPIReady = function () {
            if (typeof prevReady === "function") prevReady();
            resolve();
          };
          var script = document.createElement("script");
          script.src = "https://www.youtube.com/iframe_api";
          script.async = true;
          document.head.appendChild(script);
        });
        return ytApiReadyPromise;
      }

      function hideAboutVideo() {
        if (ytPlayer && typeof ytPlayer.stopVideo === "function") {
          ytPlayer.stopVideo();
        }
        videoOverlay.hidden = true;
        videoOverlay.setAttribute("aria-hidden", "true");
      }

      function ensureYoutubePlayer() {
        if (ytPlayer) return Promise.resolve(ytPlayer);
        return loadYouTubeApi().then(function () {
          return new Promise(function (resolve) {
            ytPlayer = new window.YT.Player("about-video-embed", {
              videoId: "1g7gud4u09g",
              playerVars: {
                autoplay: 1,
                controls: 1,
                rel: 0,
                modestbranding: 1,
                playsinline: 1
              },
              events: {
                onReady: function () {
                  resolve(ytPlayer);
                },
                onStateChange: function (event) {
                  if (event.data === window.YT.PlayerState.ENDED) {
                    hideAboutVideo();
                  }
                }
              }
            });
          });
        });
      }

      singingTrigger.addEventListener("click", function () {
        videoOverlay.hidden = false;
        videoOverlay.setAttribute("aria-hidden", "false");
        clearClusterState();
        ensureYoutubePlayer()
          .then(function (player) {
            if (player && typeof player.playVideo === "function") {
              player.playVideo();
            }
          })
          .catch(function () {
            hideAboutVideo();
          });
      });

      if (videoCloseBtn) {
        videoCloseBtn.addEventListener("click", hideAboutVideo);
      }
    }
  }
})();
