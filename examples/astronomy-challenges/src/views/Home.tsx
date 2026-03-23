import { Link } from 'react-router-dom'
import { Data, Events } from 'cosmos-lib'
import { challenges, resources } from '../data/challenges'

export function Home() {
  const catalogCount = Data.all().length
  const constellationCount = 88
  const upcomingEvents = Events.nextEvents(new Date(), {
    observer: { latitude: 0, longitude: 0, elevation: 0 },
    days: 30,
    limit: 5,
  })

  return (
    <div>
      <div className="page-header">
        <h2>The Astronomy Grand Challenges</h2>
        <p>
          A roadmap to unsolved mysteries — foundational problems that, if solved,
          would represent major leaps forward for the entire field. This app uses{' '}
          <code>cosmos-lib</code> to visualize and explore these challenges
          interactively.
        </p>
      </div>

      <div className="section">
        <h3>What are "Grand Challenges"?</h3>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          In astronomy, a <strong>Grand Challenge</strong> is a foundational problem
          that, if solved, would represent a major leap forward for the entire field.
          Similar to the "Protein Folding Problem" in biology, these challenges are
          often too large for a single institution to solve. Instead, the community
          creates <strong>Roadmaps</strong> that define specific physics or data
          bottlenecks, standardize the requirements for a "solution," and coordinate
          global resources (like the James Webb or Rubin Observatories) to gather the
          necessary evidence.
        </p>
      </div>

      <div className="stat-row">
        <div className="stat-box">
          <div className="label">Catalog Objects</div>
          <div className="value">{catalogCount.toLocaleString()}</div>
        </div>
        <div className="stat-box">
          <div className="label">Constellations</div>
          <div className="value">{constellationCount}</div>
        </div>
        <div className="stat-box">
          <div className="label">Challenges</div>
          <div className="value">{challenges.length}</div>
        </div>
        <div className="stat-box">
          <div className="label">Events (30d)</div>
          <div className="value">{upcomingEvents.length}</div>
        </div>
      </div>

      <div className="section">
        <h3>Active Challenges</h3>
        <div className="card-grid">
          {challenges.map((c) => (
            <Link
              to={c.route}
              key={c.id}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="card">
                <span className={`badge ${c.badgeClass}`}>{c.shortTitle}</span>
                <h3 style={{ marginTop: 12 }}>{c.title}</h3>
                <p>{c.description}</p>
                <p style={{ marginTop: 12, fontSize: '0.8rem', color: c.color }}>
                  Goal: {c.goal}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="section">
        <h3>How to Participate & Find Data</h3>
        <p
          style={{
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            marginBottom: 16,
          }}
        >
          Solving these issues now relies heavily on <strong>Data Science</strong>{' '}
          and <strong>Citizen Science</strong>. You don't always need a telescope;
          you need a powerful algorithm or a keen eye. Standardized benchmarks,
          public archives like MAST, and open challenge platforms like Kaggle and
          Zooniverse make participation accessible to everyone.
        </p>
        <table className="link-table">
          <thead>
            <tr>
              <th>Resource</th>
              <th>Description</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((r) => (
              <tr key={r.name}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {r.name}
                </td>
                <td>{r.description}</td>
                <td>
                  <a href={r.url} target="_blank" rel="noreferrer">
                    Visit
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="section">
        <h3>Upcoming Astronomical Events</h3>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            marginBottom: 12,
          }}
        >
          These events, computed via <code>Events.nextEvents()</code>, represent
          opportunities for observation campaigns relevant to the grand challenges.
        </p>
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {upcomingEvents.map((evt, i) => (
              <tr key={i}>
                <td style={{ color: 'var(--text-primary)' }}>{evt.title}</td>
                <td>{new Date(evt.date).toLocaleDateString()}</td>
                <td>
                  <span className="badge badge--cosmic">{evt.category}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
