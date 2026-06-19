import { useEffect, useMemo, useState } from "react";
import {
  Award,
  CalendarDays,
  Check,
  Code2,
  Flame,
  FolderKanban,
  Gauge,
  LockKeyhole,
  Map,
  Menu,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { achievements, chapters, days, projects } from "./data";

const STORAGE_KEY = "automate60-progress-v1";

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return {
      completed: Array.isArray(saved?.completed) ? saved.completed : [],
      completionDates: saved?.completionDates || {},
    };
  } catch {
    return { completed: [], completionDates: {} };
  }
}

function App() {
  const [progress, setProgress] = useState(loadProgress);
  const [selectedDay, setSelectedDay] = useState(() => {
    const initial = loadProgress();
    return Math.min(60, (initial.completed?.length || 0) + 1);
  });
  const [activeChapter, setActiveChapter] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const completedSet = useMemo(() => new Set(progress.completed), [progress.completed]);
  const completedCount = progress.completed.length;
  const totalXp = useMemo(
    () => days.reduce((sum, day) => sum + (completedSet.has(day.number) ? day.xp : 0), 0),
    [completedSet],
  );
  const level = Math.floor(totalXp / 500) + 1;
  const levelXp = totalXp % 500;
  const current = days[selectedDay - 1];
  const percent = Math.round((completedCount / 60) * 100);
  const streak = calculateStreak(progress.completionDates);

  const visibleDays =
    activeChapter === "all" ? days : days.filter((day) => day.chapter === activeChapter);

  function selectDay(number) {
    setSelectedDay(number);
    requestAnimationFrame(() => {
      document.getElementById("mission")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function toggleDay(number) {
    const isComplete = completedSet.has(number);
    const today = new Date().toISOString().slice(0, 10);
    setProgress((previous) => ({
      completed: isComplete
        ? previous.completed.filter((item) => item !== number)
        : [...previous.completed, number].sort((a, b) => a - b),
      completionDates: isComplete
        ? Object.fromEntries(
            Object.entries(previous.completionDates).filter(([key]) => Number(key) !== number),
          )
        : { ...previous.completionDates, [number]: today },
    }));
    if (!isComplete) {
      setCelebrate(true);
      window.setTimeout(() => setCelebrate(false), 900);
    }
  }

  function resetProgress() {
    if (!window.confirm("Reset all completed days, XP, and achievements?")) return;
    setProgress({ completed: [], completionDates: {} });
    setSelectedDay(1);
  }

  return (
    <div className="app-shell">
      {celebrate ? <Celebration /> : null}
      <Header
        completedCount={completedCount}
        totalXp={totalXp}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      <main>
        <section className="hero" id="dashboard">
          <div className="hero-copy">
            <h1>
              Your 60-day path to <span>AI Automation</span>
            </h1>
            <p>
              Six focused chapters. Real projects. Curated lessons. Complete daily missions,
              compound your skills, and launch your AI automation career.
            </p>
            <button className="primary-button" onClick={() => selectDay(Math.min(completedCount + 1, 60))}>
              <Play size={18} fill="currentColor" />
              Continue Day {Math.min(completedCount + 1, 60)}
            </button>
            <div className="plan-dates">
              <CalendarDays size={17} />
              June 15 - August 13, 2026
            </div>
          </div>

          <ProgressRing percent={percent} completed={completedCount} level={level} />

          <div className="progress-stats">
            <p className="section-label">Your progress</p>
            <Stat icon={<CalendarDays />} value={`${completedCount} / 60 days`} meta={`${percent}%`} />
            <Stat icon={<Star />} value={`${totalXp} XP`} meta={`Level ${level}`} accent="gold" />
            <Stat icon={<Flame />} value={`${streak} day streak`} meta="Keep it going" accent="orange" />
            <div className="level-track">
              <span>Level {level}</span>
              <span>{levelXp} / 500 XP</span>
              <i><b style={{ width: `${(levelXp / 500) * 100}%` }} /></i>
            </div>
          </div>
        </section>

        <section className="roadmap-section" id="roadmap">
          <div className="section-heading">
            <div>
              <p className="section-label">The journey</p>
              <h2>Choose your next mission</h2>
            </div>
            <div className="chapter-filters" aria-label="Filter roadmap by chapter">
              <button
                className={activeChapter === "all" ? "active" : ""}
                onClick={() => setActiveChapter("all")}
              >
                All days
              </button>
              {chapters.map((chapter, index) => (
                <button
                  key={chapter.name}
                  className={activeChapter === index ? "active" : ""}
                  style={{ "--chapter": chapter.color }}
                  onClick={() => setActiveChapter(index)}
                >
                  {chapter.name}
                </button>
              ))}
            </div>
          </div>

          <div className="roadmap-track">
            {visibleDays.map((day) => {
              const chapter = chapters[day.chapter];
              const isCompleted = completedSet.has(day.number);
              return (
                <button
                  key={day.number}
                  className={`day-node ${selectedDay === day.number ? "selected" : ""} ${
                    isCompleted ? "completed" : ""
                  }`}
                  style={{ "--chapter": chapter.color }}
                  onClick={() => selectDay(day.number)}
                  aria-label={`Day ${day.number}: ${day.title}`}
                >
                  <span className="node-number">{isCompleted ? <Check size={17} /> : day.number}</span>
                  <span className="node-copy">
                    <small>{day.date}</small>
                    <strong>{day.title}</strong>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mission-layout" id="mission">
          <article className="mission-card" style={{ "--chapter": chapters[current.chapter].color }}>
            <div className="mission-topline">
              <span className="mission-day">Day {current.number}</span>
              <span>{current.date}</span>
              <span className="xp-reward"><Star size={14} /> +{current.xp} XP</span>
            </div>
            <h2>{current.title}</h2>
            <p className="mission-intro">
              Finish the objectives, learn from a trusted creator, and leave one tangible artifact
              behind. Small daily proof beats passive watching.
            </p>

            <div className="learning-block">
              <p className="section-label">Learning content</p>
              <p>{current.learning}</p>
            </div>

            <div className="daily-steps">
              <p className="section-label">What to do today</p>
              {current.steps.map((step, index) => (
                <div className="daily-step" key={step.text}>
                  <span>{index + 1}</span>
                  <p>
                    {step.text}
                    <a href={step.video.url} target="_blank" rel="noreferrer">
                      {step.video.url}
                    </a>
                  </p>
                </div>
              ))}
            </div>

            <div className="objectives">
              <p className="section-label">Proof to finish</p>
              {current.objectives.map((objective, index) => (
                <div className="objective" key={objective}>
                  <span>{index + 1}</span>
                  <p>{objective}</p>
                </div>
              ))}
            </div>

            <button
              className={`complete-button ${completedSet.has(current.number) ? "is-complete" : ""}`}
              onClick={() => toggleDay(current.number)}
            >
              {completedSet.has(current.number) ? <Check size={20} /> : <Target size={20} />}
              {completedSet.has(current.number) ? "Mission completed" : "Complete mission"}
            </button>
          </article>
        </section>

        <section className="dashboard-grid" id="projects">
          <div className="panel achievements-panel">
            <div className="panel-heading">
              <div><Award /> <h2>Achievements</h2></div>
              <span>{achievements.filter((item) => completedCount >= item.at).length} / 7 unlocked</span>
            </div>
            <div className="achievement-list">
              {achievements.map((achievement) => {
                const unlocked = completedCount >= achievement.at;
                return (
                  <div className={`achievement ${unlocked ? "unlocked" : ""}`} key={achievement.name}>
                    <div className="achievement-icon">
                      {unlocked ? <Trophy /> : <LockKeyhole />}
                    </div>
                    <strong>{achievement.name}</strong>
                    <small>{achievement.detail}</small>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel projects-panel">
            <div className="panel-heading">
              <div><FolderKanban /> <h2>Build portfolio proof</h2></div>
              <span>5 projects</span>
            </div>
            <div className="project-list">
              {projects.map((project) => (
                <button key={project.name} onClick={() => selectDay(project.day)}>
                  <i style={{ background: project.color }} />
                  <span><strong>{project.name}</strong><small>Milestone · Day {project.day}</small></span>
                  {completedSet.has(project.day) ? <Check className="done" /> : <span aria-hidden="true">›</span>}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="finish-banner">
          <div>
            <Sparkles />
            <span>
              <strong>60 days to become interview-ready.</strong>
              Every checked mission becomes evidence you can show.
            </span>
          </div>
          <button onClick={resetProgress}><RotateCcw size={16} /> Reset progress</button>
        </section>
      </main>

      <footer>
        <div className="brand"><Zap fill="currentColor" /> AUTOMATE <span>60</span></div>
        <p>Built around your AI Automation Specialist roadmap.</p>
        <a href="https://github.com" target="_blank" rel="noreferrer"><Code2 size={17} /> Build in public</a>
      </footer>
    </div>
  );
}

function Header({ completedCount, totalXp, menuOpen, setMenuOpen }) {
  return (
    <header>
      <a className="brand" href="#dashboard"><Zap fill="currentColor" /> AUTOMATE <span>60</span></a>
      <nav className={menuOpen ? "open" : ""}>
        <a href="#dashboard" onClick={() => setMenuOpen(false)}><Gauge /> Dashboard</a>
        <a href="#roadmap" onClick={() => setMenuOpen(false)}><Map /> Roadmap</a>
        <a href="#projects" onClick={() => setMenuOpen(false)}><FolderKanban /> Projects</a>
      </nav>
      <div className="header-score">
        <span><Flame size={17} /> {completedCount}</span>
        <span><Star size={17} /> {totalXp} XP</span>
      </div>
      <button className="menu-button" onClick={() => setMenuOpen((value) => !value)} aria-label="Open menu">
        {menuOpen ? <X /> : <Menu />}
      </button>
    </header>
  );
}

function ProgressRing({ percent, completed, level }) {
  return (
    <div className="ring-wrap">
      <div className="progress-ring" style={{ "--percent": `${percent * 3.6}deg` }}>
        <div>
          <strong>{completed} / 60</strong>
          <span>days complete</span>
          <b>Level {level}</b>
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, value, meta, accent = "" }) {
  return (
    <div className={`stat ${accent}`}>
      {icon}
      <strong>{value}</strong>
      <span>{meta}</span>
    </div>
  );
}

function Celebration() {
  return (
    <div className="celebration" aria-hidden="true">
      {Array.from({ length: 18 }, (_, index) => (
        <i key={index} style={{ "--i": index }} />
      ))}
    </div>
  );
}

function calculateStreak(completionDates) {
  const uniqueDates = [...new Set(Object.values(completionDates))].sort().reverse();
  if (!uniqueDates.length) return 0;
  let streak = 1;
  let cursor = new Date(`${uniqueDates[0]}T12:00:00`);
  for (let index = 1; index < uniqueDates.length; index += 1) {
    const previous = new Date(cursor);
    previous.setDate(previous.getDate() - 1);
    if (uniqueDates[index] !== previous.toISOString().slice(0, 10)) break;
    streak += 1;
    cursor = previous;
  }
  return streak;
}

export default App;
