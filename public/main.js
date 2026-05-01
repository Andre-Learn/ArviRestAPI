"use strict";
// ════════════════════════════════════════════════════════
//  ARVI API — main.js  v6.0
//  Fully integrated with backend /config
//  Splash + typing, count-up from real data,
//  hero reveal, scroll animations, topbar, theme
// ════════════════════════════════════════════════════════

/* ── UTILS ─────────────────────────────────────────────── */
const delay = (ms) => new Promise(r => setTimeout(r, ms));
const rand  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

/* ── THEME ─────────────────────────────────────────────── */
function initTheme() {
    const saved = localStorage.getItem("arvi-theme") || "dark";
    applyTheme(saved, false);
}

function applyTheme(theme, animate = true) {
    if (animate) {
        document.body.classList.add("theme-transitioning");
        setTimeout(() => document.body.classList.remove("theme-transitioning"), 440);
    }
    document.documentElement.setAttribute("data-theme", theme);
}

function toggleTheme() {
    const cur  = document.documentElement.getAttribute("data-theme") || "dark";
    const next = cur === "dark" ? "light" : "dark";
    localStorage.setItem("arvi-theme", next);
    applyTheme(next);
}

/* ── CONFIG FETCH ───────────────────────────────────────── */
// Fetches /config and returns { totalEndpoints, totalCategories, settings }
async function fetchConfig() {
    try {
        const res  = await fetch("/config");
        const data = await res.json();
        const tags = data.tags || {};
        const totalEndpoints  = Object.values(tags).reduce((sum, arr) => sum + arr.length, 0);
        const totalCategories = Object.keys(tags).length;
        return {
            totalEndpoints,
            totalCategories,
            settings: data.settings || {},
            tags
        };
    } catch (e) {
        console.warn("[main] /config fetch failed, using defaults:", e.message);
        return {
            totalEndpoints:  158,
            totalCategories: 13,
            settings: {},
            tags: {}
        };
    }
}

/* ── TOPBAR SCROLL ─────────────────────────────────────── */
function initTopbar() {
    const topbar = document.getElementById("topbar");
    const btn    = document.getElementById("mobMenuBtn");
    const nav    = document.getElementById("mobNav");

    let ticking = false;
    window.addEventListener("scroll", () => {
        if (ticking) return;
        requestAnimationFrame(() => {
            topbar.classList.toggle("scrolled", window.scrollY > 18);
            ticking = false;
        });
        ticking = true;
    }, { passive: true });

    btn && btn.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        btn.classList.toggle("open", open);
        btn.setAttribute("aria-expanded", String(open));
    });

    nav && nav.querySelectorAll(".mob-nav-link").forEach(link =>
        link.addEventListener("click", () => {
            nav.classList.remove("open");
            btn.classList.remove("open");
        })
    );

    // active nav highlight
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".tnav-link");
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                navLinks.forEach(l => l.classList.remove("active"));
                const a = document.querySelector(`.tnav-link[href="#${e.target.id}"]`);
                if (a) a.classList.add("active");
            }
        });
    }, { threshold: 0.38 });
    sections.forEach(s => obs.observe(s));
}

/* ── CURSOR SPOTLIGHT ──────────────────────────────────── */
function initCursorSpotlight() {
    if (window.matchMedia("(hover: none)").matches) return;
    const spot = document.createElement("div");
    spot.className = "cursor-spotlight";
    document.body.appendChild(spot);
    let rx = 0, ry = 0, tx = 0, ty = 0, raf = 0;
    document.addEventListener("mousemove", (e) => {
        tx = e.clientX; ty = e.clientY;
        if (!raf) {
            raf = requestAnimationFrame(function lerp() {
                rx += (tx - rx) * 0.09;
                ry += (ty - ry) * 0.09;
                spot.style.left = rx + "px";
                spot.style.top  = ry + "px";
                if (Math.abs(tx - rx) > 0.5 || Math.abs(ty - ry) > 0.5) {
                    raf = requestAnimationFrame(lerp);
                } else { raf = 0; }
            });
        }
    });
    document.addEventListener("mouseleave", () => { spot.style.opacity = "0"; });
    document.addEventListener("mouseenter", () => { spot.style.opacity = "1"; });
}

/* ── RIPPLE ─────────────────────────────────────────────── */
function addRipple(el, e) {
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.8;
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px;position:absolute;pointer-events:none;`;
    el.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
}

function initRipple() {
    document.querySelectorAll(".cta-primary, .topbar-cta").forEach(el => {
        if (getComputedStyle(el).position === "static") el.style.position = "relative";
        el.style.overflow = "hidden";
        el.addEventListener("click", (e) => addRipple(el, e));
    });
}

/* ── SPLASH ─────────────────────────────────────────────── */
async function runSplash() {
    const splash   = document.getElementById("splash");
    const typed    = document.getElementById("splashTyped");
    const cursor   = document.getElementById("splashCursor");
    const ring     = document.getElementById("splashRing");
    const progWrap = document.getElementById("splashProgressWrap");
    const progFill = document.getElementById("splashProgress");
    const progLbl  = document.getElementById("splashProgressLabel");

    await delay(460);

    for (const ch of "ARVI API") {
        typed.textContent += ch;
        await delay(rand(50, 85));
    }
    await delay(300);
    for (const ch of " | DASHBOARD") {
        typed.textContent += ch;
        await delay(rand(36, 64));
    }
    await delay(400);

    ring.classList.add("active");
    await delay(660);
    ring.classList.remove("active");

    progWrap.classList.add("visible");
    await runProgress(progFill, progLbl);

    await delay(170);
    cursor.classList.add("hide");
    await delay(80);

    splash.classList.add("exit");
    document.getElementById("pageWrap").classList.add("visible");
    document.body.classList.remove("loading");

    await delay(660);
    splash.remove();
}

async function runProgress(fill, lbl) {
    const steps = [[14,72],[36,52],[60,45],[76,62],[88,50],[95,36],[100,26]];
    let cur = 0;
    for (const [target, interval] of steps) {
        while (cur < target) {
            cur = Math.min(cur + rand(1,3), target);
            fill.style.width = cur + "%";
            lbl.textContent  = cur + "%";
            await delay(interval);
        }
        await delay(rand(24, 68));
    }
}

/* ── COUNT-UP ───────────────────────────────────────────── */
function countUp(el, target, duration = 1500) {
    const t0 = performance.now();
    const tick = (now) => {
        const p    = Math.min((now - t0) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = String(Math.round(ease * target));
        if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

/* ── APPLY CONFIG TO PAGE ───────────────────────────────── */
function applyConfigToPage(config) {
    const { totalEndpoints, totalCategories, settings } = config;

    // ── Stat cards — update data-count so count-up uses real numbers
    const epEl  = document.querySelector(".sc-num[data-count='158']") ||
                  document.querySelector(".sc-num[data-count]");
    const catEl = document.querySelectorAll(".sc-num[data-count]")[1];

    if (epEl)  { epEl.dataset.count  = totalEndpoints;  }
    if (catEl) { catEl.dataset.count = totalCategories; }

    // ── Page title
    if (settings.apiName) {
        document.title = `${settings.apiName} · Free REST API Service`;
    }

    // ── Favicon
    if (settings.favicon) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) { link = document.createElement("link"); link.rel = "icon"; document.head.appendChild(link); }
        link.href = settings.favicon;
    }

    // ── Footer brand name (if it shows apiName text)
    const footerBrand = document.querySelector(".footer-brand .logo-wordmark");
    if (footerBrand && settings.apiName) {
        footerBrand.textContent = settings.apiName;
    }

    // ── Hero badge visitors (if settings has it)
    if (settings.visitors != null) {
        const badge = document.querySelector(".hero-badge");
        if (badge) {
            const current = badge.textContent.trim();
            // only update if it makes sense — keep original badge text otherwise
        }
    }
}

/* ── INIT STAT CARDS (count-up after splash) ───────────── */
function initStatCards() {
    document.querySelectorAll(".sc-num[data-count]").forEach(el =>
        countUp(el, parseInt(el.dataset.count || "0", 10))
    );
}

/* ── SCROLL REVEAL ──────────────────────────────────────── */
function initScrollReveal() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add("in-view");
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.07, rootMargin: "0px 0px -44px 0px" });
    document.querySelectorAll(".scroll-reveal").forEach(el => obs.observe(el));
}

/* ── 3D TILT ────────────────────────────────────────────── */
function initCardTilt() {
    const cards = document.querySelectorAll(".feat-card, .stat-card");
    cards.forEach(card => {
        let hovering = false;
        card.addEventListener("mouseenter", () => { hovering = true; });
        card.addEventListener("mousemove", (e) => {
            if (!hovering) return;
            const r  = card.getBoundingClientRect();
            const dx = (e.clientX - (r.left + r.width  / 2)) / (r.width  / 2);
            const dy = (e.clientY - (r.top  + r.height / 2)) / (r.height / 2);
            const base = card.classList.contains("feat-card")
                ? "translateY(-7px) scale(1.02)"
                : "translateY(-5px) scale(1.015)";
            card.style.transform = `${base} perspective(700px) rotateX(${(-dy*4.5).toFixed(2)}deg) rotateY(${(dx*4.5).toFixed(2)}deg)`;
        });
        card.addEventListener("mouseleave", () => { hovering = false; card.style.transform = ""; });
    });
}

/* ── MAGNETIC BUTTONS ───────────────────────────────────── */
function initMagneticBtns() {
    if (window.matchMedia("(hover: none)").matches) return;
    document.querySelectorAll(".cta-primary, .topbar-cta").forEach(btn => {
        let active = false;
        btn.addEventListener("mouseenter", () => { active = true; });
        btn.addEventListener("mousemove", (e) => {
            if (!active) return;
            const r  = btn.getBoundingClientRect();
            const dx = (e.clientX - (r.left + r.width  / 2)) * 0.2;
            const dy = (e.clientY - (r.top  + r.height / 2)) * 0.2;
            btn.style.transform = `translate(${dx}px, ${dy}px) translateY(-2px)`;
        });
        btn.addEventListener("mouseleave", () => { active = false; btn.style.transform = ""; });
        btn.addEventListener("mouseup",    () => { btn.style.transform = ""; });
    });
}

/* ── COPY BUTTON ────────────────────────────────────────── */
function initCopyBtn() {
    const btn  = document.getElementById("exCopyBtn");
    const lbl  = document.getElementById("exCopyLabel");
    const code = document.getElementById("exampleCode");
    if (!btn) return;
    btn.addEventListener("click", () => {
        navigator.clipboard.writeText(code ? code.innerText : "").then(() => {
            lbl.textContent = "Copied!";
            btn.classList.add("copied", "pop");
            btn.addEventListener("animationend", () => btn.classList.remove("pop"), { once: true });
            setTimeout(() => { lbl.textContent = "Copy"; btn.classList.remove("copied"); }, 2400);
        });
    });
}

/* ── CODE TABS ──────────────────────────────────────────── */
function initCodeTabs() {
    const tabs      = document.querySelectorAll(".code-tab");
    const codeEl    = document.getElementById("exampleCode");
    const lineNums  = document.querySelector(".code-line-nums");
    const badge     = document.querySelector(".code-method-badge");

    const REQ = `<span class="c-comment">$ curl -X GET \\</span>\n<span class="c-str">  "https://arvi-api.vercel.app/api/ai/chat?prompt=Hello"</span>`;
    const RES = `<span class="c-brace">{</span>\n  <span class="c-key">"status"</span>: <span class="c-bool">true</span>,\n  <span class="c-key">"creator"</span>: <span class="c-str">"Arvi"</span>,\n  <span class="c-key">"data"</span>: <span class="c-brace">{</span>\n    <span class="c-key">"response"</span>: <span class="c-str">"Halo! Saya adalah AI assistant Arvi API..."</span>\n  <span class="c-brace">}</span>\n<span class="c-brace">}</span>`;

    tabs.forEach((tab, i) => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            if (!codeEl) return;
            codeEl.style.opacity = "0";
            codeEl.style.transform = "translateY(8px)";
            codeEl.style.transition = "opacity .18s, transform .18s";
            setTimeout(() => {
                codeEl.innerHTML = i === 0 ? REQ + "\n\n" + RES : RES;
                if (lineNums) lineNums.innerHTML = (i === 0
                    ? ["1","2","3","4","5","6","7","8","9"]
                    : ["1","2","3","4","5","6","7"]
                ).map(n => `<span>${n}</span>`).join("");
                if (badge) badge.textContent = i === 0 ? "GET" : "200";
                codeEl.style.opacity = "1";
                codeEl.style.transform = "translateY(0)";
                setTimeout(() => { codeEl.style.transition = ""; }, 320);
            }, 180);
        });
    });
}

/* ── SMOOTH ANCHORS ─────────────────────────────────────── */
function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener("click", e => {
            const id = a.getAttribute("href").slice(1);
            const el = document.getElementById(id);
            if (el) { e.preventDefault(); el.scrollIntoView({ behavior: "smooth", block: "start" }); }
        });
    });
}

/* ── GRID STAGGER ───────────────────────────────────────── */
function initGridStagger() {
    document.querySelectorAll(".feat-card.scroll-reveal:not(.in-view)").forEach((card, i) => {
        if (!card.style.getPropertyValue("--sd")) {
            card.style.setProperty("--sd", `${i * 65}ms`);
        }
    });
}

/* ── FOOTER SOCIAL STAGGER ──────────────────────────────── */
function initFooterSocials() {
    const socials = document.querySelectorAll(".fsoc");
    if (!socials.length) return;
    const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                socials.forEach((el, i) => {
                    el.style.opacity = "0";
                    el.style.transform = "translateY(12px)";
                    el.style.transition = `opacity .45s ease ${i*80}ms, transform .45s ease ${i*80}ms`;
                    requestAnimationFrame(() => { el.style.opacity = "1"; el.style.transform = ""; });
                });
                obs.disconnect();
            }
        });
    }, { threshold: 0.5 });
    obs.observe(socials[0]);
}

/* ── BOOT ───────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", async () => {
    initTheme();
    initTopbar();
    initScrollReveal();
    initCopyBtn();
    initCodeTabs();
    initSmoothAnchors();
    initGridStagger();
    initFooterSocials();
    initCursorSpotlight();
    initRipple();

    document.getElementById("themeToggle")
        && document.getElementById("themeToggle").addEventListener("click", toggleTheme);

    // ── Fetch real config BEFORE splash finishes so count-up uses live data
    const configPromise = fetchConfig();

    // Run splash (parallel with config fetch)
    const splashPromise = runSplash();

    // Wait for both
    const [config] = await Promise.all([configPromise, splashPromise]);

    // Apply real data to page
    applyConfigToPage(config);

    // Now trigger count-up with real numbers
    initStatCards();

    // Defer heavy polish
    const schedule = (fn) =>
        (typeof requestIdleCallback !== "undefined")
            ? requestIdleCallback(fn)
            : setTimeout(fn, 80);

    schedule(() => {
        initCardTilt();
        initMagneticBtns();
    });
});
