"use client";

import { useEffect } from "react";

/* ---- media manifest (files live in /public) ---- */
const M = (id: string) => `/media/guluna/${id}.mp4`;
const P = (id: string) => `/posters/${id}.jpg`;
const IMG = (id: string) => `/media/guluna/${id}.jpg`;

const WALL: string[] = [
  "3867189186759796180",
  "3892418097304531213",
  "3896193166409233347",
  "3903354100178265536",
  "3905563878448403184",
  "3918501885110141874",
  "3889508140109468116",
  "3870753567057417565",
];

function Reel({ id, autoPlay = false }: { id: string; autoPlay?: boolean }) {
  return (
    <video
      src={M(id)}
      poster={P(id)}
      muted
      loop
      playsInline
      preload="none"
      autoPlay={autoPlay}
    />
  );
}

export default function Landing() {
  useEffect(() => {
    const RM = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cleanups: Array<() => void> = [];
    const on = (
      t: EventTarget,
      ev: string,
      fn: EventListener,
      opts?: boolean | AddEventListenerOptions
    ) => {
      t.addEventListener(ev, fn, opts);
      cleanups.push(() => t.removeEventListener(ev, fn, opts));
    };

    /* loader */
    const showSite = () =>
      setTimeout(() => document.body.classList.add("loaded"), RM ? 0 : 1700);
    if (document.readyState === "complete") showSite();
    else on(window, "load", showSite);

    /* nav scroll state */
    const hdr = document.getElementById("hdr");
    const onScrollNav = () =>
      hdr && hdr.classList.toggle("scrolled", window.scrollY > 60);
    onScrollNav();
    on(window, "scroll", onScrollNav, { passive: true });

    /* reveal observer */
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-revealed");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());

    /* videos: force muted, gate autoplay by viewport */
    const vids = [...document.querySelectorAll("video")];
    vids.forEach((v) => {
      v.muted = true;
    });
    const vio = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) {
            if (v.preload === "none") {
              v.preload = "auto";
              v.load();
            }
            v.play().catch(() => {});
          } else v.pause();
        }),
      { threshold: 0.35 }
    );
    vids.forEach((v) => vio.observe(v));
    cleanups.push(() => vio.disconnect());

    /* click a video to toggle its own sound; unmuting one mutes the rest */
    vids.forEach((v) => {
      const h = () => {
        if (v.muted) {
          vids.forEach((o) => (o.muted = true));
          v.muted = false;
          v.play().catch(() => {});
        } else v.muted = true;
      };
      on(v, "click", h);
    });

    /* reel wall horizontal scrub */
    const wall = document.getElementById("reels");
    const track = document.getElementById("rwTrack");
    const bar = document.getElementById("rwBar");
    let maxX = 0;
    const sizeWall = () => {
      if (RM || window.innerWidth <= 780 || !wall || !track) {
        if (wall) wall.style.height = "";
        if (track) track.style.transform = "";
        return;
      }
      maxX = Math.max(0, track.scrollWidth - window.innerWidth);
      wall.style.height = maxX + window.innerHeight + "px";
    };
    const scrubWall = () => {
      if (RM || window.innerWidth <= 780 || !wall || !track) return;
      const top = wall.offsetTop;
      const p = Math.min(
        Math.max((window.scrollY - top) / (wall.offsetHeight - window.innerHeight), 0),
        1
      );
      track.style.transform = "translate3d(" + -p * maxX + "px,0,0)";
      if (bar) bar.style.width = p * 100 + "%";
    };
    const onResize = () => {
      sizeWall();
      scrubWall();
    };
    on(window, "resize", onResize);
    on(window, "scroll", scrubWall, { passive: true });
    sizeWall();
    scrubWall();
    cleanups.push(() => {
      if (wall) wall.style.height = "";
      if (track) track.style.transform = "";
    });

    /* hero side parallax */
    const sides = [...document.querySelectorAll<HTMLElement>(".r-side")];
    const onParallax = () => {
      if (RM) return;
      const y = window.scrollY * 0.06;
      sides.forEach((s, i) => (s.style.transform = "translateY(" + (i ? y : -y) + "px)"));
    };
    on(window, "scroll", onParallax, { passive: true });

    /* custom cursor */
    const cur = document.getElementById("cursor");
    if (!RM && window.matchMedia("(hover:hover)").matches && cur) {
      const cursorEl = cur;
      const onMove = (e: Event) => {
        const p = e as PointerEvent;
        cursorEl.style.left = p.clientX + "px";
        cursorEl.style.top = p.clientY + "px";
      };
      on(window, "pointermove", onMove);
      document
        .querySelectorAll("a,button,.rw-card,.duo-media,.mosaic figure,video")
        .forEach((el) => {
          const en = () => cursorEl.classList.add("big");
          const lv = () => cursorEl.classList.remove("big");
          on(el, "pointerenter", en);
          on(el, "pointerleave", lv);
        });
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <>
      {/* LOADER */}
      <div id="loader">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="l-mascot" src="/mascot-loader.svg" alt="" width={150} height={195} />
        <div className="l-word">
          Melado <b>by Guluna</b>
        </div>
        <div className="l-kick">Peshawar, since the dream began</div>
        <div className="l-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </div>

      {/* CURSOR */}
      <div className="cursor" id="cursor" />

      {/* NAV */}
      <header id="hdr">
        <div className="wrap nav">
          <a className="brand" href="#top">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/mascot.svg" alt="" />
            Melado <b>by{" "}Guluna</b>
          </a>
          <nav className="nav-links">
            <a href="#reels">Reels</a>
            <a href="#flavors">Flavors</a>
            <a href="#story">Story</a>
            <a href="#visit">Visit</a>
            <a
              className="pill"
              href="https://www.instagram.com/meladobyguluna/"
              target="_blank"
              rel="noopener"
            >
              Order on Instagram
            </a>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" id="top">
        <div className="hero-stage">
          <div className="reel r-side">
            <Reel id="3903354100178265536" />
          </div>
          <div className="reel r-center">
            <Reel id="3867189186759796180" autoPlay />
          </div>
          <div className="reel r-side">
            <Reel id="3892418097304531213" />
          </div>
        </div>
        <div className="hero-veil" />
        <div className="wrap hero-copy">
          <h1>
            <span className="w">Crafted</span>{" "}
            <span className="w it">cold,</span>{" "}
            <span className="w">served{" "}late.</span>
          </h1>
          <p className="lead">
            Premium dairy ice cream and artisanal pure fruit popsicles, handmade
            in University Town, Peshawar. Open every day until 1 AM.
          </p>
        </div>
      </section>

      {/* REEL WALL */}
      <section className="reelwall" id="reels">
        <div className="rw-sticky">
          <div className="rw-aside">
            <h2 className="serif">{"Watch it melt"}</h2>
          </div>
          <div className="rw-track" id="rwTrack">
            {WALL.map((id) => (
              <article className="rw-card" key={id}>
                <Reel id={id} />
              </article>
            ))}
          </div>
          <div className="rw-foot">
            <div className="rw-bar">
              <i id="rwBar" />
            </div>
            <div>58K on Instagram</div>
          </div>
        </div>
      </section>

      {/* FLAVORS */}
      <section className="sec wrap" id="flavors">
        <div className="sec-head reveal rise">
          <p className="cap">The menu, abridged</p>
          <h2 className="serif">
            <span className="ul-draw">19</span> flavors, none of them ordinary.
          </h2>
          <p>
            Premium dairy ice cream, milkshakes, cones and pure fruit popsicles,
            made fresh and priced for everyone. The full lineup lives in store,
            so here are the ones people keep coming back for.
          </p>
        </div>

        <div className="duo">
          <div className="duo-media reveal clip">
            <Reel id="3905563878448403184" />
          </div>
          <div className="reveal rise">
            <h3 className="serif">Pure fruit popsicles</h3>
            <p>
              Real fruit, frozen the slow way. No shortcuts, no fake colour. The
              first thing Guluna ever asked for, now the thing Peshawar lines up
              for.
            </p>
          </div>
        </div>

        <div className="duo">
          <div className="duo-media reveal clip">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMG("3914393213153081028")} alt="Mango ice cream in a Melado tub" />
          </div>
          <div className="reveal rise">
            <h3 className="serif">Mango mania</h3>
            <p>
              Dense, creamy, unapologetically mango. A scoop of Pakistani summer
              in a Melado tub, gone fast every season.
            </p>
          </div>
        </div>

        <div className="duo">
          <div className="duo-media reveal clip">
            <Reel id="3892418097304531213" />
          </div>
          <div className="reveal rise">
            <h3 className="serif">Late night scoops</h3>
            <p>
              The kitchen stays cold till 1 AM. Premium dairy, handcrafted daily,
              because the best ice cream run never happens at noon.
            </p>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section className="story sec" id="story">
        <div className="wrap story-grid">
          <div className="story-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="story-mascot reveal rise" src="/mascot.svg" alt="Guluna mascot" />
            <div>
              <p className="cap" style={{ color: "var(--amber)" }}>
                The story
              </p>
              <h2 className="serif reveal rise">
                A father turned his daughter{"’"}s wish into a brand.
              </h2>
              <p className="reveal rise" data-delay="1">
                It started with one small request for ice cream. Today,{" "}
                <b>Melado by Guluna</b>, a brand of Prime Industries in the
                family of <b>Melado</b>, serves premium dairy ice cream and
                natural popsicles across Pakistan, with Asim Kamal and Guluna
                Kamal at its heart.
              </p>
              <p className="reveal rise" data-delay="2">
                Same idea, every single scoop: real ingredients, made with love,
                served late.
              </p>
              <div className="sign reveal rise" data-delay="3">
                Crafted from natural ingredients
              </div>
            </div>
          </div>
          <div className="story-reel reveal clip">
            <Reel id="3888053110231702119" />
          </div>
        </div>
      </section>

      {/* NEW BRANCH */}
      <section className="branch sec wrap">
        <div className="branch-grid">
          <div>
            <span className="tag reveal rise">Now opening</span>
            <h2 className="serif reveal rise" data-delay="1">
              Swat, we{"’"}re
              <br />
              coming. <span className="date">Mingora.</span>
            </h2>
            <div className="card reveal rise" data-delay="2">
              <div className="row">
                <span>Opening</span>
                <b>20 June, 2 PM onwards</b>
              </div>
              <div className="row">
                <span>Meet and greet</span>
                <b>Asim Kamal</b>
              </div>
              <div className="row">
                <span>First guests</span>
                <b>Special treats</b>
              </div>
              <div className="row">
                <span>Where</span>
                <b>Mingora, Swat</b>
              </div>
            </div>
          </div>
          <div className="branch-img reveal clip">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={IMG("3922229711789388356")}
              alt="Melado opening soon in Mingora, Swat"
            />
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="sec wrap">
        <div className="sec-head reveal rise">
          <p className="cap">Lately at Melado</p>
          <h2 className="serif">Moments, not just menus.</h2>
        </div>
        <div className="mosaic">
          {/* eslint-disable @next/next/no-img-element */}
          <figure className="m-a reveal clip">
            <img src={IMG("3911938263676373609")} alt="50K followers celebration" />
          </figure>
          <figure className="m-tall reveal clip" data-delay="1">
            <img src={IMG("3867880258548804424")} alt="Father and daughter with a popsicle" />
          </figure>
          <figure className="reveal clip" data-delay="2">
            <img src={IMG("3914393213153081028")} alt="Mango ice cream" />
          </figure>
          <figure className="reveal clip" data-delay="2">
            <img src={IMG("3922431052860196215")} alt="Happy 4th birthday Guluna" />
          </figure>
          <figure className="m-tall reveal clip" data-delay="3">
            <img src={IMG("3922229711789388356")} alt="Swat opening poster" />
          </figure>
          {/* eslint-enable @next/next/no-img-element */}
        </div>
      </section>

      {/* VISIT */}
      <section className="sec wrap" id="visit">
        <div className="visit-grid">
          <div className="visit">
            <div className="sec-head reveal rise">
              <p className="cap">Find us</p>
              <h2 className="serif">University Town, after dark.</h2>
            </div>
            <dl className="reveal rise" data-delay="1">
              <div>
                <dt>Address</dt>
                <dd>
                  B1, Old Jamrud Road, near Bitani Plaza,
                  <br />
                  University Town, Peshawar
                </dd>
              </div>
              <div>
                <dt>Hours</dt>
                <dd style={{ fontVariantNumeric: "tabular-nums" }}>
                  Open daily, 12:00 PM to 1:00 AM
                </dd>
              </div>
              <div>
                <dt>Landmark</dt>
                <dd>A scoop away from Chief Grill</dd>
              </div>
            </dl>
            <p
              className="reveal rise"
              data-delay="3"
              style={{ marginTop: 26, display: "flex", gap: 12, flexWrap: "wrap" }}
            >
              <a
                className="btn pink"
                href="https://www.instagram.com/meladobyguluna/"
                target="_blank"
                rel="noopener"
              >
                DM to order, 58K ↗
              </a>
              <a
                className="btn"
                href="https://www.google.com/maps/search/?api=1&query=Melado+by+Guluna+University+Town+Peshawar"
                target="_blank"
                rel="noopener"
              >
                Open in Maps
              </a>
            </p>
          </div>
          <div className="map-card reveal clip">
            <iframe
              title="Melado by Guluna location on Google Maps"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://maps.google.com/maps?q=Melado%20by%20Guluna%20Old%20Jamrud%20Road%20University%20Town%20Peshawar&t=&z=15&ie=UTF8&iwloc=&output=embed"
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot-top">
            <div className="foot-word reveal rise">
              Melado <b>by Guluna</b>
            </div>
            <div className="foot-links reveal rise" data-delay="1">
              <a href="https://www.instagram.com/meladobyguluna/" target="_blank" rel="noopener">
                Instagram ↗
              </a>
              <a href="#flavors">Flavors</a>
              <a href="#story">Story</a>
              <a href="#visit">Visit</a>
            </div>
          </div>
          <div className="foot-bar">
            <span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="foot-mascot" src="/mascot.svg" alt="" /> Peshawar
              and now Swat. Open 12 PM to 1 AM
            </span>
            <span>Crafted from natural ingredients. A brand of Prime Industries</span>
            <span>© 2026 Melado by Guluna</span>
          </div>
        </div>
      </footer>
    </>
  );
}
