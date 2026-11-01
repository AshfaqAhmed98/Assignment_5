"use client";

import { useState } from "react";

const banner = {
  background: "/community-events-background.jpg",
  eyebrow: "Community is a verb",
  heading: "A better neighborhood",
  highlight: "starts with us.",
  description:
    "Meet the people already making a difference nearby. Find a local project, lend a hand, and see what we can grow together.",
};

const communityStats = [
  {
    value: "02",
    label: "Days",
    accent: "from-violet-300 to-fuchsia-300",
  },
  {
    value: "12",
    label: "Hours",
    accent: "from-fuchsia-300 to-rose-300",
  },
  {
    value: "600",
    label: "Guests",
    accent: "from-rose-300 to-amber-200",
  },
  {
    value: "20",
    label: "Topics",
    accent: "from-cyan-200 to-blue-300",
  },
  {
    value: "10",
    label: "Speakers",
    accent: "from-emerald-200 to-cyan-300",
  },
];

const upcomingEvents = [
  {
    dateTime: "2026-11-08T09:00:00",
    date: "NOV 08",
    category: "Neighborhood",
    title: "Community Garden Morning",
    description:
      "Help prepare the shared garden for the season and meet neighbors who love to grow.",
    location: "Riverside Garden",
    time: "Sunday · 9:00 AM",
    accent: "from-emerald-400/25 via-teal-500/10 to-transparent",
    badge: "border-emerald-200/20 bg-emerald-300/10 text-emerald-100",
  },
  {
    dateTime: "2026-11-14T11:00:00",
    date: "NOV 14",
    category: "Food support",
    title: "A Seat at the Table",
    description:
      "Prepare and share a warm meal with neighbors at a welcoming community lunch.",
    location: "Eastside Community Hall",
    time: "Saturday · 11:00 AM",
    accent: "from-amber-400/25 via-rose-500/10 to-transparent",
    badge: "border-amber-200/20 bg-amber-300/10 text-amber-100",
  },
  {
    dateTime: "2026-11-21T13:00:00",
    date: "NOV 21",
    category: "Learning",
    title: "Skills Share Saturday",
    description:
      "Swap practical skills in a relaxed workshop and leave with a new idea to try.",
    location: "Maple Street Learning Hub",
    time: "Saturday · 1:00 PM",
    accent: "from-cyan-400/25 via-blue-500/10 to-transparent",
    badge: "border-cyan-200/20 bg-cyan-300/10 text-cyan-100",
  },
  {
    dateTime: "2026-11-28T10:00:00",
    date: "NOV 28",
    category: "Youth",
    title: "Little Neighbors, Big Ideas",
    description:
      "Help young people turn their ideas for a kinder neighborhood into a shared project.",
    location: "Northside Youth Center",
    time: "Saturday · 10:00 AM",
    accent: "from-violet-400/25 via-fuchsia-500/10 to-transparent",
    badge: "border-violet-200/20 bg-violet-300/10 text-violet-100",
  },
  {
    dateTime: "2026-12-05T10:30:00",
    date: "DEC 05",
    category: "Community care",
    title: "Winter Warmth Drive",
    description:
      "Sort donated essentials and help neighbors get ready for colder days.",
    location: "Cedar Park Neighbors Center",
    time: "Saturday · 10:30 AM",
    accent: "from-sky-400/25 via-indigo-500/10 to-transparent",
    badge: "border-sky-200/20 bg-sky-300/10 text-sky-100",
  },
  {
    dateTime: "2026-12-12T08:30:00",
    date: "DEC 12",
    category: "Nature",
    title: "Creekside Cleanup",
    description:
      "Spend a morning caring for a local walking trail and the wildlife around it.",
    location: "Willow Creek Trail",
    time: "Saturday · 8:30 AM",
    accent: "from-lime-400/25 via-emerald-500/10 to-transparent",
    badge: "border-lime-200/20 bg-lime-300/10 text-lime-100",
  },
];

export default function Home() {
  const [notice, setNotice] = useState("");

  return (
    <main className="flex-1 bg-[#1a1424] text-white">
      <section
        aria-label="Community service highlights"
        className="relative isolate flex min-h-[min(780px,calc(100svh-76px))] items-center justify-center overflow-hidden px-5 py-20 sm:px-12 lg:px-24"
      >
        <div
          aria-hidden="true"
          className="banner-background absolute inset-0 -z-20 overflow-hidden bg-[#554267] bg-cover bg-center"
          style={{
            backgroundImage: `url('${banner.background}')`,
          }}
        >
          <svg
            viewBox="0 0 1600 900"
            preserveAspectRatio="xMidYMid slice"
            className="hidden"
          >
            <defs>
              <linearGradient id="community-sky" x1="800" y1="0" x2="800" y2="900" gradientUnits="userSpaceOnUse">
                <stop stopColor="#829781" />
                <stop offset=".58" stopColor="#697f69" />
                <stop offset="1" stopColor="#355b45" />
              </linearGradient>
              <linearGradient id="community-ground" x1="0" y1="600" x2="1600" y2="900" gradientUnits="userSpaceOnUse">
                <stop stopColor="#17634c" />
                <stop offset=".34" stopColor="#62834c" />
                <stop offset=".68" stopColor="#a77a48" />
                <stop offset="1" stopColor="#286452" />
              </linearGradient>
              <linearGradient id="community-color-wash" x1="0" y1="220" x2="1600" y2="680" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0d8063" stopOpacity=".62" />
                <stop offset=".3" stopColor="#59a96d" stopOpacity=".3" />
                <stop offset=".58" stopColor="#e0b45e" stopOpacity=".24" />
                <stop offset=".79" stopColor="#db7958" stopOpacity=".34" />
                <stop offset="1" stopColor="#14745e" stopOpacity=".52" />
              </linearGradient>
              <linearGradient id="community-shade" x1="0" y1="0" x2="1600" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#102d25" stopOpacity=".58" />
                <stop offset=".48" stopColor="#182922" stopOpacity=".38" />
                <stop offset="1" stopColor="#43291f" stopOpacity=".52" />
              </linearGradient>
              <radialGradient id="community-sun-glow" cx="0" cy="0" r="1" gradientTransform="matrix(0 420 -510 0 1268 188)" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffd88b" stopOpacity=".48" />
                <stop offset="1" stopColor="#ffd88b" stopOpacity="0" />
              </radialGradient>
              <pattern id="community-grain" width="160" height="160" patternUnits="userSpaceOnUse">
                <circle cx="18" cy="32" r="1" fill="#FFF9E8" fillOpacity=".15" />
                <circle cx="112" cy="17" r=".8" fill="#FFF9E8" fillOpacity=".13" />
                <circle cx="78" cy="103" r="1" fill="#FFF9E8" fillOpacity=".12" />
                <circle cx="144" cy="132" r=".8" fill="#FFF9E8" fillOpacity=".14" />
                <circle cx="32" cy="146" r=".7" fill="#FFF9E8" fillOpacity=".12" />
              </pattern>
            </defs>

            <path fill="url(#community-sky)" d="M0 0h1600v900H0z" />
            <circle cx="1268" cy="188" r="98" fill="#E9BE79" fillOpacity=".74" />
            <circle cx="1268" cy="188" r="137" stroke="#E9BE79" strokeOpacity=".24" strokeWidth="2" />
            <path d="M0 427c136-91 245-99 374-47 117 47 209 53 343-5 138-60 238-41 351 13 158 76 331 50 532-53v565H0V427Z" fill="#769276" />
            <path d="M0 539c178-115 322-104 457-27 155 88 284 54 418-1 135-57 251-47 374 23 126 71 222 80 351 15v351H0V539Z" fill="#527557" />

            <path d="M101 441h226V610H101z" fill="#D6C7A7" />
            <path d="m75 444 139-119 140 119H75Z" fill="#A8684D" />
            <path d="M131 480h53v70h-53zm104 0h53v50h-53z" fill="#66816A" />
            <path d="M1256 399h236v211h-236z" fill="#D8CCB2" />
            <path d="m1229 402 145-122 145 122h-290Z" fill="#B56E52" />
            <path d="M1295 445h55v74h-55zm104 0h55v50h-55z" fill="#66816A" />
            <path d="M0 619c194-59 382-75 563-41 194 37 322 23 515-25 210-53 363-43 522 25v322H0V619Z" fill="url(#community-ground)" />

            <path d="M0 725c235-69 445-51 643 10 204 62 435 43 640-8 124-31 228-27 317-4v177H0V725Z" fill="#294a38" fillOpacity=".9" />
            <path d="M294 773c166-103 334-120 509-45 114 49 223 42 356-22" stroke="#D6BD8E" strokeOpacity=".7" strokeWidth="4" strokeDasharray="3 15" strokeLinecap="round" />

            <path d="M786 674V402" stroke="#916444" strokeWidth="27" strokeLinecap="round" />
            <path d="M785 486c-69-27-102-73-106-130 60 8 93 39 106 94m-1-42c11-70 55-111 128-121-3 67-46 108-128 121" stroke="#8FB37A" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M786 406c-16-75-4-132 39-180 36 56 24 112-39 180Z" fill="#A7C28A" />
            <path d="M775 662h25l29 32h-83l29-32Z" fill="#B37A4B" />
            <path d="M763 694h50l27 34H736l27-34Z" fill="#C48A54" />

            <path d="M407 660c5-53 24-89 64-106 38 7 61 39 65 96l-5 80H412l-5-70Z" fill="#D8795B" />
            <path d="M430 536c-9-24-5-60 10-78 20-23 56-21 72 3 14 21 9 60-7 81-23 28-63 23-75-6Z" fill="#A96E50" />
            <path d="M428 531c-15-40 1-87 34-103 33-16 66-2 73 24-25-8-43 2-55 22-12 21-28 34-52 36v21Z" fill="#302A27" />
            <path d="M424 593c-55 22-89 60-116 112m226-113c38 17 74 42 111 78" stroke="#A96E50" strokeWidth="24" strokeLinecap="round" />
            <path d="m310 705 41 13m299-48 24 25" stroke="#A96E50" strokeWidth="20" strokeLinecap="round" />
            <path d="m435 727-20 92m103-94 22 92" stroke="#273B33" strokeWidth="28" strokeLinecap="round" />

            <path d="M659 694c-1-67 20-124 59-151 48 0 77 41 82 110l-2 60H661l-2-19Z" fill="#E4B75C" />
            <path d="M684 526c-11-25-8-62 7-81 19-25 57-23 74 1 15 21 11 61-5 83-23 29-63 27-76-3Z" fill="#E5AD7D" />
            <path d="M680 519c-11-39 7-83 40-96 32-13 65 4 69 31-23-10-42 0-55 20-13 19-30 31-54 32v13Z" fill="#46332A" />
            <path d="M673 592c-34 25-63 57-88 98m210-100c44 18 82 43 115 79" stroke="#E5AD7D" strokeWidth="23" strokeLinecap="round" />
            <path d="m584 692 35 6m323-32 31 25" stroke="#E5AD7D" strokeWidth="18" strokeLinecap="round" />
            <path d="m696 711-19 108m102-108 18 108" stroke="#2B3E38" strokeWidth="28" strokeLinecap="round" />

            <path d="M1016 653c5-62 28-99 67-116 43 8 65 44 66 108l-7 87h-125l-1-79Z" fill="#7397A1" />
            <path d="M1040 529c-9-23-6-58 8-77 19-23 54-22 70 0 14 20 10 57-5 78-22 28-61 26-73-1Z" fill="#7D513E" />
            <path d="M1037 524c-13-37 3-81 35-96 31-15 64-2 70 25-24-8-42 3-54 22-12 20-28 33-52 35v14Z" fill="#25252A" />
            <path d="M1034 598c-49 20-86 51-119 96m230-97c45 13 84 35 124 69" stroke="#7D513E" strokeWidth="23" strokeLinecap="round" />
            <path d="m915 689 42 5m310-31 30 25" stroke="#7D513E" strokeWidth="18" strokeLinecap="round" />
            <path d="m1054 724-21 95m102-96 17 96" stroke="#293D39" strokeWidth="27" strokeLinecap="round" />

            <path d="M111 727c0-41 27-68 69-68 41 0 67 27 67 68v24H111v-24Z" fill="#D8AD61" />
            <path d="M112 725c-6-42 21-75 57-80 32-5 62 15 68 45-27-10-48-2-63 18-14 19-33 30-62 29v-12Z" fill="#40352D" />
            <path d="M132 767h100" stroke="#F0D8A5" strokeWidth="7" strokeLinecap="round" />

            <path d="M287 757c15-37 35-57 65-63m-54 68c18-21 39-31 65-33m564 43c17-40 40-62 73-69m-57 76c19-20 44-31 73-33" stroke="#A7C58F" strokeWidth="11" strokeLinecap="round" />
            <path d="M348 696c0 25-23 46-23 46s-24-21-24-46a24 24 0 1 1 47 0Zm550 28c0 24-22 44-22 44s-23-20-23-44a23 23 0 1 1 45 0Z" fill="#DF8B69" />
            <path d="M1191 737c0-20 17-36 37-36 19 0 35 16 35 36v18h-72v-18Z" fill="#C57A58" />
            <path d="M1191 735c-3-25 12-45 34-48 18-3 34 9 38 27-16-6-28-1-37 11-8 11-19 17-35 17v-7Z" fill="#2C302C" />
            <path d="M1174 777h106" stroke="#E4C48C" strokeWidth="7" strokeLinecap="round" />

            <path d="M96 552c27-32 50-42 80-36m133-78c24-22 48-26 72-13m910 130c24-27 49-35 79-26m-121-65c21-25 43-34 72-30" stroke="#D9D0AE" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round" />
            <circle cx="353" cy="314" r="7" fill="#E8C681" />
            <circle cx="1195" cy="341" r="6" fill="#E18B6B" />
            <circle cx="1326" cy="662" r="8" fill="#E8C681" />
            <circle cx="370" cy="707" r="6" fill="#E8C681" />

            <path fill="url(#community-sun-glow)" d="M0 0h1600v900H0z" />
            <path fill="url(#community-color-wash)" d="M0 0h1600v900H0z" />
            <path fill="url(#community-shade)" d="M0 0h1600v900H0z" />
            <path fill="url(#community-grain)" d="M0 0h1600v900H0z" />
          </svg>
        </div>

        <div
          aria-hidden="true"
          className="banner-color-overlay absolute inset-0 -z-10"
        />

        <div
          className="banner-copy mx-auto w-full max-w-4xl text-center"
        >
          <p className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-200 via-fuchsia-200 to-violet-200 bg-clip-text font-serif text-sm italic tracking-[0.18em] text-transparent drop-shadow-[0_2px_12px_rgba(7,28,21,0.85)] sm:text-base sm:tracking-[0.24em]">
            <span aria-hidden="true" className="hidden h-px w-8 bg-gradient-to-r from-violet-300 to-fuchsia-300 sm:block" />
            {banner.eyebrow}
            <span aria-hidden="true" className="hidden h-px w-8 bg-gradient-to-r from-fuchsia-300 to-cyan-300 sm:block" />
          </p>
          <h1 className="mt-5 font-sans text-4xl font-extrabold uppercase leading-[1.05] tracking-[0.015em] drop-shadow-[0_3px_22px_rgba(0,0,0,0.55)] sm:text-5xl md:text-6xl lg:text-7xl">
            <span className="block bg-gradient-to-r from-cyan-100 via-fuchsia-100 to-violet-100 bg-clip-text text-transparent">
              {banner.heading}
            </span>
            <span className="mt-1 block bg-gradient-to-r from-violet-200 via-pink-200 to-cyan-200 bg-clip-text text-transparent">
              {banner.highlight}
            </span>
          </h1>
          <span
            aria-hidden="true"
            className="mx-auto mt-5 block h-1 w-16 rounded-full bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-300 shadow-[0_0_16px_rgba(192,38,211,0.45)]"
          />
          <p className="mx-auto mt-5 max-w-2xl bg-gradient-to-r from-white via-cyan-100 to-fuchsia-100 bg-clip-text text-sm leading-6 text-transparent drop-shadow-[0_2px_12px_rgba(20,10,32,0.95)] sm:text-base sm:leading-7 md:text-lg">
            {banner.description}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() =>
                setNotice("Upcoming events will be available soon.")
              }
              className="inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-white/30 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-rose-500 px-7 py-3 text-sm font-bold text-white shadow-[0_8px_28px_rgba(124,58,237,0.4)] transition hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_12px_34px_rgba(219,39,119,0.5)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
            >
              Explore Upcoming Events
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="size-4"
              >
                <path
                  d="M3.5 10h13m-5-5 5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setNotice("Event creation will be available soon.")}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/55 bg-white/10 px-7 py-3 text-sm font-bold text-white shadow-[0_6px_24px_rgba(20,10,32,0.24)] backdrop-blur-md transition hover:-translate-y-0.5 hover:border-cyan-200/80 hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-200"
            >
              Create Event
            </button>
          </div>
          <p
            aria-live="polite"
            className="mt-3 min-h-5 text-sm font-medium text-cyan-100"
          >
            {notice}
          </p>
          <dl
            aria-label="Community event highlights"
            className="mx-auto mt-5 grid w-full max-w-3xl grid-cols-3 overflow-hidden rounded-xl border border-white/15 bg-[#111019]/75 px-1.5 py-2 shadow-[0_12px_35px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:mt-6 sm:grid-cols-5 sm:rounded-full sm:px-2"
          >
            {communityStats.map((stat) => (
              <div
                key={stat.label}
                className="relative flex min-h-[3.75rem] flex-col items-center justify-center px-1 py-1 text-center sm:min-h-[4rem] sm:px-2"
              >
                {stat.label !== "Days" && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-2 left-0 top-2 w-px bg-gradient-to-b from-transparent via-white/25 to-transparent"
                  />
                )}
                <dd
                  className={`bg-gradient-to-r ${stat.accent} bg-clip-text text-[1.35rem] font-bold leading-none tracking-tight text-transparent sm:text-2xl`}
                >
                  {stat.value}
                </dd>
                <dt className="mt-1 text-[0.55rem] font-medium tracking-wide text-white/60 sm:text-[0.65rem]">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section
        id="upcoming-events"
        aria-labelledby="upcoming-events-heading"
        className="scroll-mt-24 bg-[#15111f] px-5 py-16 text-white sm:px-8 sm:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-9 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-violet-300 bg-clip-text text-xs font-semibold uppercase tracking-[0.22em] text-transparent sm:text-sm">
                Make a little time for good
              </p>
              <h2
                id="upcoming-events-heading"
                className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
              >
                Upcoming{" "}
                <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                  events
                </span>
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/65 sm:text-base">
                A few ways to connect, lend a hand, and make your neighborhood
                feel a little closer.
              </p>
            </div>
            <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60">
              Sample events · UI preview
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((event) => (
              <article
                key={event.title}
                className={`group overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${event.accent} p-px transition duration-300 hover:-translate-y-1 hover:border-white/20`}
              >
                <div className="flex h-full flex-col rounded-[15px] bg-[#171421]/95 p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-[0.65rem] font-semibold tracking-wide ${event.badge}`}
                    >
                      {event.category}
                    </span>
                    <time
                      dateTime={event.dateTime}
                      className="text-xs font-bold tracking-[0.12em] text-white/75"
                    >
                      {event.date}
                    </time>
                  </div>
                  <h3 className="mt-5 text-lg font-bold tracking-tight text-white sm:text-xl">
                    {event.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-white/65">
                    {event.description}
                  </p>
                  <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-xs text-white/65">
                    <p className="flex items-center gap-2">
                      <span aria-hidden="true" className="text-fuchsia-200">
                        ◆
                      </span>
                      {event.location}
                    </p>
                    <p className="flex items-center gap-2">
                      <span aria-hidden="true" className="text-cyan-200">
                        ◷
                      </span>
                      {event.time}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="features-heading"
        className="bg-[#100d19] px-5 py-16 text-white sm:px-8 sm:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="bg-gradient-to-r from-cyan-300 via-fuchsia-300 to-violet-300 bg-clip-text text-xs font-semibold uppercase tracking-[0.22em] text-transparent sm:text-sm">
              Good things start together
            </p>
            <h2
              id="features-heading"
              className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
              A little help goes{" "}
              <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                a long way
              </span>
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/65 sm:text-base">
              Simple ways to find your people, share an idea, and make a
              difference close to home.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <article className="group rounded-2xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-transparent p-6 transition hover:-translate-y-1 hover:border-violet-300/30 sm:p-7">
              <span className="flex size-11 items-center justify-center rounded-xl border border-violet-300/20 bg-violet-400/10 text-violet-200">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-5"
                >
                  <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="1.7" />
                  <path d="m16 16 4.2 4.2M8 10.8h5.6m-2.8-2.8v5.6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </span>
              <h3 className="mt-5 text-lg font-bold">Find your next way to help</h3>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Explore community gatherings and discover causes that feel
                close to you.
              </p>
            </article>

            <article className="group rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/10 to-transparent p-6 transition hover:-translate-y-1 hover:border-fuchsia-300/30 sm:p-7">
              <span className="flex size-11 items-center justify-center rounded-xl border border-fuchsia-300/20 bg-fuchsia-400/10 text-fuchsia-200">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-5"
                >
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </span>
              <h3 className="mt-5 text-lg font-bold">Bring an idea to life</h3>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Shape a local get-together around a shared interest, skill, or
                community need.
              </p>
            </article>

            <article className="group rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-transparent p-6 transition hover:-translate-y-1 hover:border-cyan-300/30 sm:p-7">
              <span className="flex size-11 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-200">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="size-5"
                >
                  <path d="M16 20v-1.6a3.4 3.4 0 0 0-3.4-3.4H6.4A3.4 3.4 0 0 0 3 18.4V20m6.5-9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm6-6.7a3.5 3.5 0 0 1 0 6.8m2 3.9h.1a3.4 3.4 0 0 1 3.4 3.4V20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h3 className="mt-5 text-lg font-bold">Make it better together</h3>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Meet neighbors who care, share what you can, and turn small
                acts into lasting connections.
              </p>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
