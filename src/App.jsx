import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Award,
  CalendarDays,
  Check,
  ChevronRight,
  Code2,
  Flame,
  FolderKanban,
  Gauge,
  LockKeyhole,
  Map as MapIcon,
  Menu,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import {
  achievements,
  chapters,
  days,
  helpRules,
  projects,
  ratingOptions,
  ratingRules,
} from "./data";

const STORAGE_KEY = "agentic-roadmap-progress-v2";
const OLD_STORAGE_KEY = "automate60-progress-v1";
const TEST_STATUS = {
  untested: "Not attempted",
  failed: "Failed",
  passed: "Passed",
};

function emptyProgress() {
  return {
    completed: [],
    completionDates: {},
    ratings: {},
    testStatus: {},
    helpUsed: {},
    proof: {},
    testAnswers: {},
    testScores: {},
  };
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === "object") {
      return { ...emptyProgress(), ...saved };
    }
    const old = JSON.parse(localStorage.getItem(OLD_STORAGE_KEY));
    if (old && typeof old === "object") {
      return {
        ...emptyProgress(),
        completed: Array.isArray(old.completed) ? old.completed : [],
        completionDates: old.completionDates || {},
      };
    }
  } catch {
    return emptyProgress();
  }
  return emptyProgress();
}

function App() {
  const [progress, setProgress] = useState(loadProgress);
  const [selectedDay, setSelectedDay] = useState(() => {
    const initial = loadProgress();
    return Math.min(days.length, (initial.completed?.length || 0) + 1);
  });
  const [activeChapter, setActiveChapter] = useState("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const stats = useMemo(() => calculateStats(progress), [progress]);
  const current = days[selectedDay - 1] || days[0];
  const visibleDays =
    activeChapter === "all" ? days : days.filter((day) => day.chapter === activeChapter);

  function selectDay(number) {
    setSelectedDay(number);
    requestAnimationFrame(() => {
      document.getElementById("mission")?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function patchDayMap(key, dayNumber, value) {
    setProgress((previous) => ({
      ...previous,
      [key]: { ...previous[key], [dayNumber]: value },
    }));
  }

  function toggleDay(number) {
    const completedSet = new Set(progress.completed);
    const isComplete = completedSet.has(number);
    const today = new Date().toISOString().slice(0, 10);
    setProgress((previous) => ({
      ...previous,
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
    if (!window.confirm("Reset all progress, ratings, tests, proof, XP, and achievements?")) return;
    setProgress(emptyProgress());
    setSelectedDay(1);
  }

  return (
    <div className="app-shell">
      {celebrate ? <Celebration /> : null}
      <Header
        completedCount={stats.completedCount}
        totalXp={stats.totalXp}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />

      <main>
        <section className="hero" id="dashboard">
          <div className="hero-copy">
            <h1>
              Agentic AI Roadmap <span>2026</span>
            </h1>
            <p>
              A 60-day learning game for building reliable agents with LangGraph, Claude Agent
              SDK, evals, traces, guardrails, and portfolio proof.
            </p>
            <button className="primary-button" onClick={() => selectDay(Math.min(stats.completedCount + 1, days.length))}>
              <Play size={18} fill="currentColor" />
              Continue Day {Math.min(stats.completedCount + 1, days.length)}
            </button>
            <div className="plan-dates">
              <CalendarDays size={17} />
              June 15 - August 13, 2026
            </div>
          </div>

          <ProgressRing percent={stats.percent} completed={stats.completedCount} level={stats.level} />

          <MasteryPanel stats={stats} />
        </section>

        <section className="game-grid">
          <RepairQueue items={stats.repairQueue} selectDay={selectDay} />
          <WeaknessPanel weakness={stats.weakness} />
          <PhaseReadiness stats={stats} />
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
              const state = dayState(day, progress);
              return (
                <button
                  key={day.number}
                  className={`day-node ${selectedDay === day.number ? "selected" : ""} ${
                    state.completed ? "completed" : ""
                  } ${state.mastered ? "mastered" : ""} ${state.needsRepair ? "repair" : ""}`}
                  style={{ "--chapter": chapter.color }}
                  onClick={() => selectDay(day.number)}
                  aria-label={`Day ${day.number}: ${day.title}`}
                >
                  <span className="node-number">{state.mastered ? <Trophy size={16} /> : state.completed ? <Check size={17} /> : day.number}</span>
                  <span className="node-copy">
                    <small>{day.date} - {chapter.name}</small>
                    <strong>{day.title}</strong>
                    <em>{progress.ratings[day.number] || TEST_STATUS[progress.testStatus[day.number] || "untested"]}</em>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mission-layout" id="mission">
          <article className="mission-card" style={{ "--chapter": chapters[current.chapter].color }}>
            <MissionHeader current={current} progress={progress} stats={stats} />
            <p className="mission-intro">
              Finish the tasks, produce proof, pass the test, and rate honestly. Clicking done is
              cheap; mastery requires evidence.
            </p>

            <div className="learning-block">
              <p className="section-label">Learning content</p>
              <p>{current.learning}</p>
            </div>

            <div className="daily-steps">
              <p className="section-label">Tasks with resources</p>
              {current.steps.map((step, index) => (
                <div className="daily-step" key={`${current.number}-${step.text}`}>
                  <span>{index + 1}</span>
                  <p>
                    {step.text}
                    <a href={step.resource.url} target="_blank" rel="noreferrer">
                      Watch: {step.resource.title} ({step.resource.creator})
                    </a>
                  </p>
                </div>
              ))}
            </div>

            <div className="practice-grid">
              <InfoBlock title="Practice arena" value={current.practice.tool} body={current.practice.prompt} />
              <InfoBlock title="Proof required" value="No proof, no mastery" body={current.proofRequired} />
              <InfoBlock title="Help rule" value={current.helpAllowed.label} body={current.helpAllowed.detail} />
              <InfoBlock title="Pass criteria" value="Harsh mode" body={current.passCriteria} />
            </div>

            <div className="skill-test">
              <p className="section-label">Harsh skill test</p>
              {current.skillTest.map((question, index) => (
                <div className="test-question" key={question}>
                  <span>{index + 1}</span>
                  <label>
                    <strong>{question}</strong>
                    <textarea
                      value={progress.testAnswers[current.number]?.[index] || ""}
                      onChange={(event) => {
                        const answers = progress.testAnswers[current.number] || [];
                        patchDayMap("testAnswers", current.number, {
                          ...answers,
                          [index]: event.target.value,
                        });
                      }}
                      placeholder="Answer like an interview. Include evidence, failure mode, and how you would verify it."
                    />
                  </label>
                </div>
              ))}
              <TestScoreCard
                current={current}
                progress={progress}
                patchDayMap={patchDayMap}
              />
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

            <Controls
              current={current}
              progress={progress}
              patchDayMap={patchDayMap}
              toggleDay={toggleDay}
            />
          </article>
        </section>

        <section className="dashboard-grid" id="projects">
          <AchievementsPanel completedCount={stats.completedCount} masteredCount={stats.masteredCount} />
          <ProjectsPanel completedSet={stats.completedSet} selectDay={selectDay} />
        </section>

        <section className="finish-banner">
          <div>
            <Sparkles />
            <span>
              <strong>Final rule:</strong>
              S and A ratings are earned by evidence, not vibes.
            </span>
          </div>
          <button onClick={resetProgress}><RotateCcw size={16} /> Reset progress</button>
        </section>
      </main>

      <footer>
        <div className="brand"><Zap fill="currentColor" /> AGENTIC <span>60</span></div>
        <p>Built for the 2026 agentic AI engineer market.</p>
        <a href="https://github.com" target="_blank" rel="noreferrer"><Code2 size={17} /> Build in public</a>
      </footer>
    </div>
  );
}

function Header({ completedCount, totalXp, menuOpen, setMenuOpen }) {
  return (
    <header>
      <a className="brand" href="#dashboard"><Zap fill="currentColor" /> AGENTIC <span>60</span></a>
      <nav className={menuOpen ? "open" : ""}>
        <a href="#dashboard" onClick={() => setMenuOpen(false)}><Gauge /> Dashboard</a>
        <a href="#roadmap" onClick={() => setMenuOpen(false)}><MapIcon /> Roadmap</a>
        <a href="#projects" onClick={() => setMenuOpen(false)}><FolderKanban /> Projects</a>
      </nav>
      <div className="header-score">
        <span><Flame size={17} /> {completedCount}</span>
        <span><Star size={17} /> {totalXp} XP</span>
      </div>
      <button
        className="menu-button"
        onClick={() => setMenuOpen((value) => !value)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
      >
        {menuOpen ? <X /> : <Menu />}
      </button>
    </header>
  );
}

function MasteryPanel({ stats }) {
  return (
    <div className="progress-stats">
      <p className="section-label">Mastery dashboard</p>
      <Stat icon={<ShieldCheck />} value={`${stats.masteredCount} mastered`} meta={`${stats.masteryPercent}% mastery`} />
      <Stat icon={<Star />} value={`${stats.totalXp} XP`} meta={`Level ${stats.level}`} accent="gold" />
      <Stat icon={<Flame />} value={`${stats.streak} day streak`} meta={`${stats.streakMultiplier}x streak`} accent="orange" />
      <Stat icon={<AlertTriangle />} value={`${stats.repairQueue.length} repairs`} meta={`Overall ${stats.overallRating}`} accent="red" />
      <div className="level-track">
        <span>Level {stats.level}</span>
        <span>{stats.levelXp} / 500 XP</span>
        <i><b style={{ width: `${(stats.levelXp / 500) * 100}%` }} /></i>
      </div>
    </div>
  );
}

function ProgressRing({ percent, completed, level }) {
  return (
    <div className="ring-wrap">
      <div className="progress-ring" style={{ "--percent": `${percent * 3.6}deg` }}>
        <div>
          <strong>{completed} / {days.length}</strong>
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

function RepairQueue({ items, selectDay }) {
  return (
    <section className="panel repair-panel">
      <div className="panel-heading">
        <div><AlertTriangle /> <h2>Repair Queue</h2></div>
        <span>{items.length} active</span>
      </div>
      {items.length ? (
        <div className="repair-list">
          {items.slice(0, 6).map((item) => (
            <button key={item.number} onClick={() => selectDay(item.number)}>
              <strong>Day {item.number}</strong>
              <span>{item.title}</span>
              <small>{item.reason}</small>
            </button>
          ))}
        </div>
      ) : (
        <p className="empty-note">No repairs yet. That means you are either clean or not being harsh enough.</p>
      )}
    </section>
  );
}

function WeaknessPanel({ weakness }) {
  return (
    <section className="panel weakness-panel">
      <div className="panel-heading">
        <div><Target /> <h2>Weak Topics</h2></div>
        <span>From repairs</span>
      </div>
      <div className="weakness-list">
        {weakness.length ? weakness.map(([tag, count]) => (
          <span key={tag}>{tag}<b>{count}</b></span>
        )) : <p className="empty-note">Low ratings and failed tests will surface topic patterns here.</p>}
      </div>
    </section>
  );
}

function PhaseReadiness({ stats }) {
  return (
    <section className="panel phase-panel">
      <div className="panel-heading">
        <div><Gauge /> <h2>Phase Readiness</h2></div>
        <span>Mastery</span>
      </div>
      <div className="phase-list">
        {chapters.map((chapter, index) => {
          const phase = stats.phaseReadiness[index] || { mastered: 0, total: 0, percent: 0 };
          return (
            <div className="phase-row" key={chapter.name} style={{ "--chapter": chapter.color }}>
              <span>{chapter.name}</span>
              <b>{phase.mastered}/{phase.total}</b>
              <i><em style={{ width: `${phase.percent}%` }} /></i>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function MissionHeader({ current, progress, stats }) {
  const chapter = chapters[current.chapter];
  const state = dayState(current, progress);
  return (
    <>
      <div className="mission-topline">
        <span className="mission-day">Day {current.number}</span>
        <span>{current.date}</span>
        <span>{chapter.name}</span>
        <span className="xp-reward"><Star size={14} /> +{dayXp(current, progress, state)} XP</span>
      </div>
      <h2>{current.title}</h2>
      <div className="mission-badges">
        <span>{current.tag}</span>
        <span>{state.mastered ? "Mastered" : state.completed ? "Completed" : "Open"}</span>
        <span>{TEST_STATUS[progress.testStatus[current.number] || "untested"]}</span>
        <span>{progress.ratings[current.number] || "Unrated"}</span>
        <span>{stats.streakMultiplier}x streak</span>
      </div>
    </>
  );
}

function InfoBlock({ title, value, body }) {
  return (
    <div className="info-block">
      <p className="section-label">{title}</p>
      <strong>{value}</strong>
      <span>{body}</span>
    </div>
  );
}

function Controls({ current, progress, patchDayMap, toggleDay }) {
  const number = current.number;
  const state = dayState(current, progress);
  return (
    <div className="control-deck">
      <div className="control-group">
        <span>Rating</span>
        <div className="rating-buttons">
          {ratingOptions.map((rating) => (
            <button
              key={rating.label}
              className={progress.ratings[number] === rating.label ? "active" : ""}
              onClick={() => patchDayMap("ratings", number, rating.label)}
              title={rating.detail}
            >
              {rating.label}
            </button>
          ))}
        </div>
      </div>

      <label className="control-group">
        <span>Test status</span>
        <select
          value={progress.testStatus[number] || "untested"}
          onChange={(event) => patchDayMap("testStatus", number, event.target.value)}
        >
          {Object.entries(TEST_STATUS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>

      <label className="control-group">
        <span>Help used</span>
        <select
          value={progress.helpUsed[number] || current.helpKey}
          onChange={(event) => patchDayMap("helpUsed", number, event.target.value)}
        >
          {Object.entries(helpRules).map(([key, rule]) => (
            <option key={key} value={key}>{rule.label}</option>
          ))}
        </select>
      </label>

      <label className="proof-toggle">
        <input
          type="checkbox"
          checked={Boolean(progress.proof[number])}
          onChange={(event) => patchDayMap("proof", number, event.target.checked)}
        />
        Proof artifact exists
      </label>

      <button
        className={`complete-button ${state.completed ? "is-complete" : ""}`}
        onClick={() => toggleDay(number)}
      >
        {state.completed ? <Check size={20} /> : <Target size={20} />}
        {state.completed ? "Mission completed" : "Complete mission"}
      </button>

      <div className={`mastery-verdict ${state.mastered ? "mastered" : state.needsRepair ? "repair" : ""}`}>
        <strong>{state.mastered ? "Mastery earned" : state.needsRepair ? "Repair required" : "Not mastered yet"}</strong>
        <span>{state.reason}</span>
      </div>
    </div>
  );
}

function TestScoreCard({ current, progress, patchDayMap }) {
  const savedScore = progress.testScores[current.number];
  const answers = progress.testAnswers[current.number] || {};
  const score = savedScore || gradeSkillTest(current, answers);

  function runCheck() {
    const result = gradeSkillTest(current, answers);
    patchDayMap("testScores", current.number, result);
    patchDayMap("testStatus", current.number, result.score >= 80 ? "passed" : "failed");
    if (result.score >= 92 && !progress.ratings[current.number]) {
      patchDayMap("ratings", current.number, "A");
    }
    if (result.score < 70 && !progress.ratings[current.number]) {
      patchDayMap("ratings", current.number, "C");
    }
  }

  return (
    <div className={`test-score-card ${score.score >= 80 ? "pass" : "fail"}`}>
      <div>
        <strong>{score.score}%</strong>
        <span>{score.score >= 80 ? "Pass" : "Fail"} - 80% required</span>
      </div>
      <p>{score.message}</p>
      <ul>
        {score.feedback.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <button onClick={runCheck}>Check my answers</button>
    </div>
  );
}

function AchievementsPanel({ completedCount, masteredCount }) {
  return (
    <div className="panel achievements-panel">
      <div className="panel-heading">
        <div><Award /> <h2>Achievements</h2></div>
        <span>{achievements.filter((item) => completedCount >= item.at).length} / {achievements.length} unlocked</span>
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
      <p className="panel-note">{masteredCount} mastered days count toward true readiness.</p>
    </div>
  );
}

function ProjectsPanel({ completedSet, selectDay }) {
  return (
    <div className="panel projects-panel">
      <div className="panel-heading">
        <div><FolderKanban /> <h2>Portfolio proof</h2></div>
        <span>{projects.length} milestones</span>
      </div>
      <div className="project-list">
        {projects.map((project) => (
          <button key={project.name} onClick={() => selectDay(project.day)}>
            <i style={{ background: project.color }} />
            <span><strong>{project.name}</strong><small>Milestone - Day {project.day}</small></span>
            {completedSet.has(project.day) ? <Check className="done" /> : <ChevronRight />}
          </button>
        ))}
      </div>
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

function dayState(day, progress) {
  const completed = progress.completed.includes(day.number);
  const test = progress.testStatus[day.number] || "untested";
  const rating = progress.ratings[day.number];
  const proof = Boolean(progress.proof[day.number]);
  const mastered = completed && test === "passed" && proof && ["S", "A"].includes(rating);
  const needsRepair = test === "failed" || ["C", "Fail"].includes(rating);
  let reason = "Complete tasks, attach proof, pass the test, and earn A or S.";
  if (mastered) reason = "Tasks done, proof exists, test passed, and rating is strong.";
  else if (test === "failed") reason = "The skill test failed. Repair and retest.";
  else if (["C", "Fail"].includes(rating)) reason = "Your rating is too weak for mastery.";
  else if (completed && test !== "passed") reason = "Tasks are done, but the test is not passed.";
  else if (completed && !proof) reason = "Tasks are done, but proof is missing.";
  return { completed, test, rating, proof, mastered, needsRepair, reason };
}

function gradeSkillTest(day, answerMap) {
  const answers = day.skillTest.map((_, index) => String(answerMap[index] || "").trim());
  const topicWords = [
    day.tag,
    ...day.title.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 4),
  ];
  const evidenceWords = ["because", "proof", "test", "measure", "log", "trace", "eval", "example", "evidence", "verify"];
  const failureWords = ["fail", "risk", "error", "timeout", "missing", "wrong", "fallback", "guardrail", "retry", "edge"];
  const feedback = [];

  const perAnswer = answers.map((answer, index) => {
    const lower = answer.toLowerCase();
    const words = lower.split(/\s+/).filter(Boolean);
    let points = 0;
    if (words.length >= 35) points += 40;
    else if (words.length >= 20) points += 28;
    else if (words.length >= 10) points += 14;
    if (evidenceWords.some((word) => lower.includes(word))) points += 22;
    if (failureWords.some((word) => lower.includes(word))) points += 22;
    if (topicWords.some((word) => word && lower.includes(word))) points += 16;
    if (words.length < 20) feedback.push(`Q${index + 1}: too shallow. Give at least 20-35 words.`);
    if (!evidenceWords.some((word) => lower.includes(word))) feedback.push(`Q${index + 1}: missing proof, measurement, trace, eval, or verification.`);
    if (!failureWords.some((word) => lower.includes(word))) feedback.push(`Q${index + 1}: missing a failure mode or risk.`);
    return Math.min(100, points);
  });

  const answered = answers.filter(Boolean).length;
  if (answered < day.skillTest.length) {
    feedback.unshift(`Only ${answered}/${day.skillTest.length} answers written. Empty answers are automatic damage.`);
  }
  const score = Math.round(perAnswer.reduce((sum, item) => sum + item, 0) / day.skillTest.length);
  const message =
    score >= 90
      ? "Strong. Now defend it out loud without reading."
      : score >= 80
        ? "Pass, but not comfortable. Review the feedback before moving on."
        : score >= 60
          ? "Weak. You are close to fooling yourself. Repair and retest."
          : "Fail. This is watching-content energy, not engineering proof yet.";
  return {
    score,
    message,
    feedback: feedback.length ? feedback.slice(0, 8) : ["Meets the local harsh-check rubric. Final honesty check: can you explain it out loud?"],
  };
}

function dayXp(day, progress, state = dayState(day, progress)) {
  if (!state.completed) return 0;
  const helpKey = progress.helpUsed[day.number] || day.helpKey;
  const multiplier = helpRules[helpKey]?.xpMultiplier || 1;
  const rating = ratingRules[state.rating] || { xpBonus: 0 };
  const testBonus = state.test === "passed" ? 35 : state.test === "failed" ? -30 : 0;
  const proofBonus = state.proof ? 20 : 0;
  const raw = Math.round((day.xp + rating.xpBonus + testBonus + proofBonus) * multiplier);
  return Math.max(0, raw);
}

function calculateStats(progress) {
  const completedSet = new Set(progress.completed);
  const completedCount = progress.completed.length;
  const dayStates = days.map((day) => [day, dayState(day, progress)]);
  const mastered = dayStates.filter(([, state]) => state.mastered).map(([day]) => day);
  const repairQueue = dayStates
    .filter(([, state]) => state.needsRepair)
    .map(([day, state]) => ({ number: day.number, title: day.title, tag: day.tag, reason: state.reason }));
  const totalXp = days.reduce((sum, day) => sum + dayXp(day, progress), 0);
  const level = Math.floor(totalXp / 500) + 1;
  const levelXp = totalXp % 500;
  const percent = Math.round((completedCount / days.length) * 100);
  const masteryPercent = Math.round((mastered.length / days.length) * 100);
  const streak = calculateStreak(progress.completionDates);
  const streakMultiplier = streak >= 14 ? 1.3 : streak >= 7 ? 1.2 : streak >= 3 ? 1.1 : 1;
  const ratingScores = Object.values(progress.ratings)
    .map((rating) => ratingRules[rating]?.points)
    .filter((points) => typeof points === "number");
  const average = ratingScores.length
    ? Math.round(ratingScores.reduce((sum, item) => sum + item, 0) / ratingScores.length)
    : 0;
  const overallRating = average >= 96 ? "S" : average >= 86 ? "A" : average >= 75 ? "B" : average >= 60 ? "C" : "Unrated";
  const weaknessMap = repairQueue.reduce((map, item) => {
    map.set(item.tag, (map.get(item.tag) || 0) + 1);
    return map;
  }, new Map());
  const weakness = [...weaknessMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const phaseReadiness = chapters.map((_, chapterIndex) => {
    const phaseDays = days.filter((day) => day.chapter === chapterIndex);
    const phaseMastered = phaseDays.filter((day) => dayState(day, progress).mastered).length;
    return {
      total: phaseDays.length,
      mastered: phaseMastered,
      percent: phaseDays.length ? Math.round((phaseMastered / phaseDays.length) * 100) : 0,
    };
  });
  return {
    completedSet,
    completedCount,
    totalXp,
    level,
    levelXp,
    percent,
    masteredCount: mastered.length,
    masteryPercent,
    streak,
    streakMultiplier,
    repairQueue,
    weakness,
    phaseReadiness,
    overallRating,
  };
}

function calculateStreak(completionDates) {
  const uniqueDates = [...new Set(Object.values(completionDates || {}))].sort().reverse();
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
