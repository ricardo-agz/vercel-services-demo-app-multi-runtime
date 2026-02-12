'use client';

import { useState, useEffect, useCallback } from 'react';

// ─── API Config ──────────────────────────────────────────────────────────────
const FLASK_API_URL = process.env.NEXT_PUBLIC_FLASK_API_URL;
const GO_API_URL = process.env.NEXT_PUBLIC_GO_API_URL;
const EXPRESS_API_URL = process.env.NEXT_PUBLIC_EXPRESS_API_URL;

// ─── Favicon Domains ─────────────────────────────────────────────────────────
const FAVICON = {
  'Next.js': 'nextjs.org',
  'Flask': 'flask.palletsprojects.com',
  'Go': 'go.dev',
  'Express': 'expressjs.com',
};

function faviconUrl(tech, size = 128) {
  const domain = FAVICON[tech];
  return domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}` : null;
}

// ─── Service Definitions ─────────────────────────────────────────────────────
const SERVICES = [
  { id: 'web', name: 'Web', tech: 'Next.js', route: '/', color: '#888', kind: 'frontend' },
  { id: 'flask-api', name: 'Core API', tech: 'Flask', route: FLASK_API_URL, color: '#3b82f6', kind: 'backend' },
  { id: 'go-api', name: 'Analytics API', tech: 'Go', route: GO_API_URL, color: '#00c853', kind: 'backend' },
  { id: 'express-api', name: 'Users API', tech: 'Express', route: EXPRESS_API_URL, color: '#f59e0b', kind: 'backend' },
];

// ─── Endpoint Registry ───────────────────────────────────────────────────────
const ENDPOINT_GROUPS = [
  {
    name: 'Flask API',
    description: 'Core business logic',
    runtime: 'Python',
    tech: 'Flask',
    color: '#3b82f6',
    baseUrl: FLASK_API_URL,
    endpoints: [
      { id: 'flask-root', method: 'GET', path: '', name: 'API Root', description: 'Returns service information and list of available endpoints.', params: [], body: null },
      { id: 'flask-health', method: 'GET', path: '/health', name: 'Health Check', description: 'Returns health status of the Flask API service.', params: [], body: null },
      { id: 'flask-revenue', method: 'GET', path: '/revenue', name: 'Monthly Revenue', description: 'Returns monthly revenue data for the current year with growth percentages.', params: [], body: null },
      { id: 'flask-revenue-summary', method: 'GET', path: '/revenue/summary', name: 'Revenue Summary', description: 'Aggregated revenue metrics including total revenue, MRR, ARR, net profit, and runway.', params: [], body: null },
      { id: 'flask-expenses', method: 'GET', path: '/expenses', name: 'Expenses', description: 'Breakdown of expenses by category with percentages.', params: [], body: null },
      { id: 'flask-transactions', method: 'GET', path: '/transactions', name: 'Transactions', description: 'List of recent transactions with amounts, types, and dates.', params: [{ name: 'limit', type: 'number', default: 10, description: 'Max number of transactions' }], body: null },
      { id: 'flask-projections', method: 'GET', path: '/projections', name: 'Projections', description: 'Revenue projections for next quarter and year based on recent growth trends.', params: [], body: null },
      { id: 'flask-add-revenue', method: 'POST', path: '/revenue', name: 'Add Revenue', description: 'Create a new revenue entry.', params: [], body: JSON.stringify({ amount: 5000, source: 'subscription' }, null, 2) },
      { id: 'flask-add-expense', method: 'POST', path: '/expenses', name: 'Add Expense', description: 'Create a new expense entry.', params: [], body: JSON.stringify({ amount: 2500, category: 'engineering' }, null, 2) },
    ],
  },
  {
    name: 'Go API',
    description: 'Performance analytics engine',
    runtime: 'Go',
    tech: 'Go',
    color: '#00c853',
    baseUrl: GO_API_URL,
    endpoints: [
      { id: 'go-root', method: 'GET', path: '', name: 'API Root', description: 'Returns service information and list of available endpoints.', params: [], body: null },
      { id: 'go-health', method: 'GET', path: '/health', name: 'Health Check', description: 'Returns health status of the Go API service.', params: [], body: null },
      { id: 'go-realtime', method: 'GET', path: '/analytics/realtime', name: 'Real-time Analytics', description: 'Live metrics including active users, request rate, CPU/memory usage, and error rates.', params: [], body: null },
      { id: 'go-risk', method: 'GET', path: '/analytics/risk', name: 'Risk Analysis', description: 'Monte Carlo simulation-based risk assessment with VaR calculation and risk factors.', params: [], body: null },
      { id: 'go-forecast', method: 'GET', path: '/analytics/forecast', name: 'Revenue Forecast', description: 'ARIMA model revenue predictions with confidence intervals for 12 months.', params: [], body: null },
      { id: 'go-benchmark', method: 'GET', path: '/analytics/benchmark', name: 'Industry Benchmark', description: 'Company metrics vs. industry medians with percentile rankings.', params: [], body: null },
    ],
  },
  {
    name: 'Express API',
    description: 'Users & subscriptions management',
    runtime: 'Node.js',
    tech: 'Express',
    color: '#f59e0b',
    baseUrl: EXPRESS_API_URL,
    endpoints: [
      { id: 'express-root', method: 'GET', path: '', name: 'API Root', description: 'Returns service information and list of available endpoints.', params: [], body: null },
      { id: 'express-health', method: 'GET', path: '/health', name: 'Health Check', description: 'Returns health status of the Express API service.', params: [], body: null },
      { id: 'express-users', method: 'GET', path: '/users', name: 'Users', description: 'List of users with plan, status, and spend details.', params: [{ name: 'limit', type: 'number', default: 10, description: 'Max number of users' }, { name: 'status', type: 'string', default: '', description: 'Filter by status (active, trial, churned)' }], body: null },
      { id: 'express-user-stats', method: 'GET', path: '/users/stats', name: 'User Stats', description: 'Aggregated user metrics including total, active, trial, churned, and activation rate.', params: [], body: null },
      { id: 'express-subscriptions', method: 'GET', path: '/subscriptions', name: 'Subscriptions', description: 'Subscription plans with active counts and MRR per plan.', params: [], body: null },
      { id: 'express-mrr', method: 'GET', path: '/subscriptions/mrr', name: 'MRR Breakdown', description: 'Total MRR, ARR, paying customers, ARPU, and MRR trend over time.', params: [], body: null },
      { id: 'express-churn', method: 'GET', path: '/churn', name: 'Churn Analysis', description: 'Monthly churn rates, recovered users, and top churn reasons.', params: [], body: null },
      { id: 'express-add-user', method: 'POST', path: '/users', name: 'Add User', description: 'Create a new user account.', params: [], body: JSON.stringify({ name: 'New User', email: 'user@example.com', plan: 'starter' }, null, 2) },
    ],
  },
];

const ALL_ENDPOINTS = ENDPOINT_GROUPS.flatMap(g =>
  g.endpoints.filter(e => e.method === 'GET').map(e => ({
    ...e, baseUrl: g.baseUrl, service: g.name, tech: g.tech, color: g.color, runtime: g.runtime,
  }))
);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function syntaxHighlightJson(json) {
  if (!json) return '';
  const escaped = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = 'json-number';
      if (/^"/.test(match)) {
        cls = /:$/.test(match) ? 'json-key' : 'json-string';
      } else if (/true|false/.test(match)) {
        cls = 'json-boolean';
      } else if (/null/.test(match)) {
        cls = 'json-null';
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

function percentile(arr, p) {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

function latencyColor(ms) {
  if (ms < 50) return '#00c853';
  if (ms < 150) return '#ffd600';
  if (ms < 500) return '#ff9100';
  return '#ff1744';
}

// ─── Shared Components ───────────────────────────────────────────────────────
function Skeleton({ w = '100%', h = 20 }) {
  return <div className="skeleton" style={{ width: w, height: h }} />;
}

function TechIcon({ tech, size = 16, style = {} }) {
  const url = faviconUrl(tech, size);
  if (!url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={tech} width={size} height={size} style={{ borderRadius: 3, flexShrink: 0, ...style }} />
  );
}

function MethodBadge({ method, small }) {
  const size = small ? { fontSize: 9, padding: '1px 5px' } : { fontSize: 10, padding: '2px 8px' };
  return (
    <span className={`method-${method.toLowerCase()}`} style={{
      ...size, borderRadius: 4, fontWeight: 700, fontFamily: 'var(--font-mono)',
      letterSpacing: '0.02em', flexShrink: 0, display: 'inline-block',
    }}>
      {method}
    </span>
  );
}

function StatusDot({ status, size = 8 }) {
  const color = status === 'healthy' ? '#00c853' : status === 'checking' ? '#ffd600' : '#ff1744';
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0,
      boxShadow: status === 'healthy' ? `0 0 6px ${color}` : 'none',
      animation: status === 'checking' ? 'pulse 1s infinite' : 'none',
    }} />
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      style={{
        padding: '3px 8px', borderRadius: 4, border: '1px solid #222', background: 'transparent',
        color: copied ? '#00c853' : '#666', fontSize: 10, cursor: 'pointer', fontFamily: 'var(--font-mono)',
        transition: 'all .15s',
      }}
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  {
    id: 'overview', name: 'Overview',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1.5" y="1.5" width="5" height="5" rx="1" />
        <rect x="9.5" y="1.5" width="5" height="5" rx="1" />
        <rect x="1.5" y="9.5" width="5" height="5" rx="1" />
        <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      </svg>
    ),
  },
  {
    id: 'explorer', name: 'API Explorer',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 3L2 8l3 5" />
        <path d="M11 3l3 5-3 5" />
        <path d="M9 2L7 14" />
      </svg>
    ),
  },
  {
    id: 'benchmark', name: 'Benchmark',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M1 14h14" />
        <rect x="2" y="8" width="3" height="6" rx="0.5" fill="currentColor" opacity="0.3" />
        <rect x="6.5" y="4" width="3" height="10" rx="0.5" fill="currentColor" opacity="0.5" />
        <rect x="11" y="1" width="3" height="13" rx="0.5" fill="currentColor" opacity="0.7" />
      </svg>
    ),
  },
];

function Sidebar({ activeTab, onTabChange, serviceHealth }) {
  return (
    <aside style={{
      width: 'var(--sidebar-width)', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 50,
      background: 'var(--bg-sidebar)', borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em' }}>Full-Stack Projects</div>
            <div style={{ fontSize: 11, color: 'var(--gray-600)' }}>API Dashboard</div>
          </div>
        </a>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '12px 10px', flex: 1 }}>
        <div style={{ fontSize: 10, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, padding: '4px 10px 8px' }}>
          Navigation
        </div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
              padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: activeTab === item.id ? 'var(--bg-hover)' : 'transparent',
              color: activeTab === item.id ? '#fff' : 'var(--gray-500)',
              fontSize: 13, fontWeight: activeTab === item.id ? 600 : 400,
              fontFamily: 'inherit', transition: 'all .15s', marginBottom: 2, textAlign: 'left',
            }}
          >
            <span style={{ opacity: activeTab === item.id ? 1 : 0.6, display: 'flex' }}>{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>

      {/* Services Status */}
      <div style={{ padding: '0 10px 16px', borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <div style={{ fontSize: 10, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, padding: '0 10px 10px' }}>
          Services
        </div>
        {SERVICES.map(s => (
          <div key={s.id} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', fontSize: 12, color: 'var(--gray-500)',
          }}>
            <StatusDot status={serviceHealth[s.id] || 'checking'} size={6} />
            <TechIcon tech={s.tech} size={14} />
            <span style={{ flex: 1 }}>{s.name}</span>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: s.color }}>{s.tech}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        padding: '12px 20px', borderTop: '1px solid var(--border)',
        fontSize: 10, color: 'var(--gray-800)', display: 'flex', gap: 12,
      }}>
        <a href="/" style={{ color: 'var(--gray-600)', transition: 'color .15s' }}>Home</a>
        <span style={{ marginLeft: 'auto', color: 'var(--gray-800)' }}>4 services · 1 URL</span>
      </div>
    </aside>
  );
}

// ─── Overview Tab ────────────────────────────────────────────────────────────
function OverviewTab({ serviceHealth, loading, onRefresh, error }) {
  const [flaskSample, setFlaskSample] = useState(null);
  const [goSample, setGoSample] = useState(null);
  const [expressSample, setExpressSample] = useState(null);
  const [flaskLatency, setFlaskLatency] = useState(null);
  const [goLatency, setGoLatency] = useState(null);
  const [expressLatency, setExpressLatency] = useState(null);
  const [flaskStatus, setFlaskStatus] = useState(null);
  const [goStatus, setGoStatus] = useState(null);
  const [expressStatus, setExpressStatus] = useState(null);

  const fetchSamples = useCallback(async () => {
    // Flask sample
    const s1 = performance.now();
    try {
      const res = await fetch(`${FLASK_API_URL}/revenue/summary`);
      setFlaskLatency(Math.round(performance.now() - s1));
      setFlaskStatus(res.status);
      setFlaskSample(JSON.stringify(await res.json(), null, 2));
    } catch (e) {
      setFlaskLatency(Math.round(performance.now() - s1));
      setFlaskStatus(0);
      setFlaskSample(JSON.stringify({ error: e.message }, null, 2));
    }
    // Go sample
    const s2 = performance.now();
    try {
      const res = await fetch(`${GO_API_URL}/analytics/realtime`);
      setGoLatency(Math.round(performance.now() - s2));
      setGoStatus(res.status);
      setGoSample(JSON.stringify(await res.json(), null, 2));
    } catch (e) {
      setGoLatency(Math.round(performance.now() - s2));
      setGoStatus(0);
      setGoSample(JSON.stringify({ error: e.message }, null, 2));
    }
    // Express sample
    const s3 = performance.now();
    try {
      const res = await fetch(`${EXPRESS_API_URL}/users/stats`);
      setExpressLatency(Math.round(performance.now() - s3));
      setExpressStatus(res.status);
      setExpressSample(JSON.stringify(await res.json(), null, 2));
    } catch (e) {
      setExpressLatency(Math.round(performance.now() - s3));
      setExpressStatus(0);
      setExpressSample(JSON.stringify({ error: e.message }, null, 2));
    }
  }, []);

  useEffect(() => { fetchSamples(); }, [fetchSamples]);

  return (
    <div className="fade-in" style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em' }}>Overview</h1>
          <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 4 }}>
            How this project connects 4 services through a single Vercel URL
          </p>
        </div>
        <button
          onClick={() => { onRefresh(); fetchSamples(); }} disabled={loading}
          style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'transparent', color: '#fff', fontSize: 13, fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1,
            fontFamily: 'inherit', transition: 'all .15s',
          }}
        >
          {loading ? 'Loading...' : 'Refresh All'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 8, background: '#1a0000', border: '1px solid #330000',
          color: '#ff6666', fontSize: 13, marginBottom: 20, lineHeight: 1.5,
        }}>
          Failed to load data: {error}. Make sure the API services are running.
        </div>
      )}

      {/* ─── Architecture Diagram ─────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
        padding: 28, marginBottom: 20,
      }}>
        {/* URL bar */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px',
            background: '#111', border: '1px solid var(--border)', borderRadius: 20,
            fontSize: 13, fontFamily: 'var(--font-mono)',
          }}>
            <span style={{ color: 'var(--gray-600)' }}>https://</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>your-project.vercel.app</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--gray-700)', marginTop: 8 }}>
            All traffic routes through a single domain — Vercel resolves each path to the right service
          </div>
        </div>

        {/* Connecting lines visual */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: '80%', height: 1, background: 'var(--border)', position: 'relative' }}>
            {[0, 25, 50, 75, 100].map(p => (
              <div key={p} style={{ position: 'absolute', left: `${p}%`, top: -4, width: 1, height: 9, background: 'var(--border)' }} />
            ))}
          </div>
        </div>

        {/* All services */}
        <div>
          <div style={{ fontSize: 10, color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 10, paddingLeft: 4 }}>
            Services
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SERVICES.length}, 1fr)`, gap: 10 }}>
            {SERVICES.map(s => (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                background: '#080808', border: `1px solid ${s.color}33`, borderRadius: 8,
              }}>
                <TechIcon tech={s.tech} size={20} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--gray-600)', fontFamily: 'var(--font-mono)' }}>{s.tech}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: s.color }}>{s.route}</div>
                  <div style={{ marginTop: 4, display: 'flex', justifyContent: 'flex-end' }}>
                    <StatusDot status={serviceHealth[s.id] || 'checking'} size={6} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Backend API Connection Cards ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        {/* Flask API */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <TechIcon tech="Flask" size={22} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Flask API</div>
              <div style={{ fontSize: 11, color: 'var(--gray-600)', fontFamily: 'var(--font-mono)' }}>
                Python · <span style={{ color: '#3b82f6' }}>{FLASK_API_URL}/*</span>
              </div>
            </div>
            <StatusDot status={serviceHealth['flask-api'] || 'checking'} />
          </div>

          {/* Endpoints list */}
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 8 }}>
              {ENDPOINT_GROUPS[0].endpoints.length} Endpoints
            </div>
            {ENDPOINT_GROUPS[0].endpoints.map(ep => (
              <div key={ep.id} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 11,
              }}>
                <MethodBadge method={ep.method} small />
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gray-400)', flex: 1 }}>{ep.path}</span>
                <span style={{ color: 'var(--gray-700)', fontSize: 10 }}>{ep.name}</span>
              </div>
            ))}
          </div>

          {/* Live sample */}
          <div style={{ padding: '12px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Live Response
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gray-600)' }}>
                GET /revenue/summary
              </span>
              {flaskStatus && (
                <span style={{
                  marginLeft: 'auto', padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  background: flaskStatus >= 200 && flaskStatus < 300 ? 'rgba(0,200,83,0.12)' : 'rgba(255,23,68,0.12)',
                  color: flaskStatus >= 200 && flaskStatus < 300 ? '#00c853' : '#ff1744',
                }}>
                  {flaskStatus}
                </span>
              )}
              {flaskLatency != null && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: latencyColor(flaskLatency) }}>
                  {flaskLatency}ms
                </span>
              )}
            </div>
            {flaskSample ? (
              <div
                className="json-viewer"
                style={{ maxHeight: 180, overflowY: 'auto', fontSize: 11 }}
                dangerouslySetInnerHTML={{ __html: syntaxHighlightJson(flaskSample) }}
              />
            ) : (
              <Skeleton h={100} />
            )}
          </div>
        </div>

        {/* Go API */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <TechIcon tech="Go" size={22} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Go API</div>
              <div style={{ fontSize: 11, color: 'var(--gray-600)', fontFamily: 'var(--font-mono)' }}>
                Go / Gin · <span style={{ color: '#00c853' }}>{GO_API_URL}/*</span>
              </div>
            </div>
            <StatusDot status={serviceHealth['go-api'] || 'checking'} />
          </div>

          {/* Endpoints list */}
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 8 }}>
              {ENDPOINT_GROUPS[1].endpoints.length} Endpoints
            </div>
            {ENDPOINT_GROUPS[1].endpoints.map(ep => (
              <div key={ep.id} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 11,
              }}>
                <MethodBadge method={ep.method} small />
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gray-400)', flex: 1 }}>{ep.path}</span>
                <span style={{ color: 'var(--gray-700)', fontSize: 10 }}>{ep.name}</span>
              </div>
            ))}
          </div>

          {/* Live sample */}
          <div style={{ padding: '12px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Live Response
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gray-600)' }}>
                GET /analytics/realtime
              </span>
              {goStatus && (
                <span style={{
                  marginLeft: 'auto', padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  background: goStatus >= 200 && goStatus < 300 ? 'rgba(0,200,83,0.12)' : 'rgba(255,23,68,0.12)',
                  color: goStatus >= 200 && goStatus < 300 ? '#00c853' : '#ff1744',
                }}>
                  {goStatus}
                </span>
              )}
              {goLatency != null && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: latencyColor(goLatency) }}>
                  {goLatency}ms
                </span>
              )}
            </div>
            {goSample ? (
              <div
                className="json-viewer"
                style={{ maxHeight: 180, overflowY: 'auto', fontSize: 11 }}
                dangerouslySetInnerHTML={{ __html: syntaxHighlightJson(goSample) }}
              />
            ) : (
              <Skeleton h={100} />
            )}
          </div>
        </div>

        {/* Express API */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <TechIcon tech="Express" size={22} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Express API</div>
              <div style={{ fontSize: 11, color: 'var(--gray-600)', fontFamily: 'var(--font-mono)' }}>
                Node.js · <span style={{ color: '#f59e0b' }}>{EXPRESS_API_URL}/*</span>
              </div>
            </div>
            <StatusDot status={serviceHealth['express-api'] || 'checking'} />
          </div>

          {/* Endpoints list */}
          <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 8 }}>
              {ENDPOINT_GROUPS[2].endpoints.length} Endpoints
            </div>
            {ENDPOINT_GROUPS[2].endpoints.map(ep => (
              <div key={ep.id} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 11,
              }}>
                <MethodBadge method={ep.method} small />
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--gray-400)', flex: 1 }}>{ep.path}</span>
                <span style={{ color: 'var(--gray-700)', fontSize: 10 }}>{ep.name}</span>
              </div>
            ))}
          </div>

          {/* Live sample */}
          <div style={{ padding: '12px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: 'var(--gray-700)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                Live Response
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gray-600)' }}>
                GET /users/stats
              </span>
              {expressStatus && (
                <span style={{
                  marginLeft: 'auto', padding: '1px 6px', borderRadius: 3, fontSize: 10, fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  background: expressStatus >= 200 && expressStatus < 300 ? 'rgba(0,200,83,0.12)' : 'rgba(255,23,68,0.12)',
                  color: expressStatus >= 200 && expressStatus < 300 ? '#00c853' : '#ff1744',
                }}>
                  {expressStatus}
                </span>
              )}
              {expressLatency != null && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: latencyColor(expressLatency) }}>
                  {expressLatency}ms
                </span>
              )}
            </div>
            {expressSample ? (
              <div
                className="json-viewer"
                style={{ maxHeight: 180, overflowY: 'auto', fontSize: 11 }}
                dangerouslySetInnerHTML={{ __html: syntaxHighlightJson(expressSample) }}
              />
            ) : (
              <Skeleton h={100} />
            )}
          </div>
        </div>
      </div>

      {/* Footer summary */}
      <div style={{
        textAlign: 'center', padding: '20px 0 8px', fontSize: 11, color: 'var(--gray-800)',
        fontFamily: 'var(--font-mono)',
      }}>
        4 services · 4 runtimes · 1 domain — all orchestrated by Vercel
      </div>
    </div>
  );
}

// ─── API Explorer: Endpoint Card ─────────────────────────────────────────────
function EndpointCard({ endpoint, group }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [latency, setLatency] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const [paramValues, setParamValues] = useState(() => {
    const vals = {};
    endpoint.params.forEach(p => { vals[p.name] = String(p.default); });
    return vals;
  });
  const [bodyValue, setBodyValue] = useState(endpoint.body || '');

  const sendRequest = async () => {
    setLoading(true);
    setResponse(null);
    setLatency(null);
    setStatusCode(null);

    let url = `${group.baseUrl}${endpoint.path}`;
    const params = new URLSearchParams();
    endpoint.params.forEach(p => {
      const val = paramValues[p.name];
      if (val !== '') params.set(p.name, val);
    });
    const qs = params.toString();
    if (qs) url += `?${qs}`;

    const options = { method: endpoint.method };
    if (endpoint.method === 'POST' && bodyValue) {
      options.headers = { 'Content-Type': 'application/json' };
      options.body = bodyValue;
    }

    const start = performance.now();
    try {
      const res = await fetch(url, options);
      const dur = Math.round(performance.now() - start);
      setLatency(dur);
      setStatusCode(res.status);
      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      const dur = Math.round(performance.now() - start);
      setLatency(dur);
      setStatusCode(0);
      setResponse(JSON.stringify({ error: err.message }, null, 2));
    }
    setLoading(false);
  };

  return (
    <div style={{
      border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden',
      transition: 'border-color .15s',
      borderColor: isOpen ? 'var(--border-hover)' : 'var(--border)',
    }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 16px',
          background: isOpen ? '#0c0c0c' : 'var(--bg-card)', border: 'none', cursor: 'pointer',
          color: '#fff', fontFamily: 'inherit', textAlign: 'left', transition: 'background .15s',
        }}
      >
        <MethodBadge method={endpoint.method} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--gray-300)', flex: 1 }}>
          {endpoint.path}
        </span>
        <span style={{ fontSize: 12, color: 'var(--gray-600)', marginRight: 8 }}>{endpoint.name}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"
          style={{ color: 'var(--gray-600)', transition: 'transform .2s', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          <path d="M4.5 2.5L8 6l-3.5 3.5" />
        </svg>
      </button>

      {isOpen && (
        <div style={{ padding: '0 16px 16px', background: '#0c0c0c' }} className="fade-in">
          <p style={{ fontSize: 13, color: 'var(--gray-500)', margin: '8px 0 16px', lineHeight: 1.5 }}>
            {endpoint.description}
          </p>

          {endpoint.params.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Parameters
              </div>
              {endpoint.params.map(p => (
                <div key={p.name} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
                  background: '#080808', borderRadius: 6, border: '1px solid var(--border)',
                }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--purple)', fontWeight: 600, width: 60 }}>{p.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--gray-600)', flex: 1 }}>{p.description}</span>
                  <input
                    type={p.type === 'number' ? 'number' : 'text'}
                    value={paramValues[p.name] || ''}
                    onChange={e => setParamValues(prev => ({ ...prev, [p.name]: e.target.value }))}
                    style={{
                      width: 80, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)',
                      background: '#000', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 12,
                      outline: 'none', textAlign: 'right',
                    }}
                    placeholder={String(p.default)}
                  />
                </div>
              ))}
            </div>
          )}

          {endpoint.body !== null && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Request Body
              </div>
              <textarea
                value={bodyValue}
                onChange={e => setBodyValue(e.target.value)}
                rows={5}
                style={{
                  width: '100%', padding: '12px', borderRadius: 6, border: '1px solid var(--border)',
                  background: '#050505', color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 12,
                  lineHeight: 1.6, resize: 'vertical', outline: 'none',
                }}
              />
            </div>
          )}

          <button
            onClick={sendRequest} disabled={loading}
            style={{
              padding: '8px 20px', borderRadius: 6, border: 'none',
              background: loading ? 'var(--gray-800)' : group.color,
              color: '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            {loading && (
              <span style={{
                width: 12, height: 12, border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite',
                display: 'inline-block',
              }} />
            )}
            {loading ? 'Sending...' : 'Send Request'}
          </button>

          {response && (
            <div style={{ marginTop: 16 }} className="fade-in">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Response</span>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
                    background: statusCode >= 200 && statusCode < 300 ? 'rgba(0,200,83,0.12)' : 'rgba(255,23,68,0.12)',
                    color: statusCode >= 200 && statusCode < 300 ? '#00c853' : '#ff1744',
                  }}>
                    {statusCode || 'ERR'}
                  </span>
                  {latency != null && (
                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: latencyColor(latency) }}>{latency}ms</span>
                  )}
                </div>
                <CopyButton text={response} />
              </div>
              <div
                className="json-viewer"
                style={{ maxHeight: 400, overflowY: 'auto' }}
                dangerouslySetInnerHTML={{ __html: syntaxHighlightJson(response) }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── API Explorer Tab ────────────────────────────────────────────────────────
function ExplorerTab() {
  return (
    <div className="fade-in" style={{ padding: '24px 32px', maxWidth: 960, margin: '0 auto' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>API Explorer</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 4, lineHeight: 1.6 }}>
          Interactive API documentation. Click any endpoint to send requests and inspect responses.
        </p>
      </div>

      {ENDPOINT_GROUPS.map(group => (
        <div key={group.name} style={{ marginBottom: 32 }}>
          {/* Group Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, padding: '0 4px' }}>
            <TechIcon tech={group.tech} size={22} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>
                {group.name}
                <span style={{ fontSize: 11, color: 'var(--gray-600)', fontWeight: 400, marginLeft: 8 }}>{group.runtime}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-600)' }}>{group.description}</div>
            </div>
            <span style={{
              marginLeft: 'auto', padding: '2px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600,
              background: group.color + '15', color: group.color, fontFamily: 'var(--font-mono)',
            }}>
              {group.endpoints.length} endpoints
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {group.endpoints.map(ep => (
              <EndpointCard key={ep.id} endpoint={ep} group={group} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Benchmark Tab ───────────────────────────────────────────────────────────
function BenchmarkTab() {
  const [selected, setSelected] = useState(() => {
    const init = {};
    ALL_ENDPOINTS.forEach(e => { init[e.id] = true; });
    return init;
  });
  const [iterations, setIterations] = useState(5);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  const toggleEndpoint = (id) => setSelected(prev => ({ ...prev, [id]: !prev[id] }));

  const selectGroup = (tech) => {
    setSelected(prev => {
      const next = { ...prev };
      const g = ALL_ENDPOINTS.filter(e => e.tech === tech);
      const allOn = g.every(e => next[e.id]);
      g.forEach(e => { next[e.id] = !allOn; });
      return next;
    });
  };

  const runBenchmark = async () => {
    setRunning(true);
    setProgress(0);
    setResults(null);
    const endpoints = ALL_ENDPOINTS.filter(e => selected[e.id]);
    const total = endpoints.length * iterations;
    let done = 0;
    const allResults = [];

    for (const ep of endpoints) {
      const latencies = [];
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        try {
          const res = await fetch(`${ep.baseUrl}${ep.path}`);
          latencies.push({ duration: Math.round(performance.now() - start), ok: res.ok });
        } catch {
          latencies.push({ duration: Math.round(performance.now() - start), ok: false });
        }
        done++;
        setProgress(Math.round((done / total) * 100));
      }
      const durations = latencies.map(l => l.duration);
      const avg = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
      allResults.push({
        ...ep, latencies: durations, avg,
        min: Math.min(...durations), max: Math.max(...durations),
        p50: percentile(durations, 50), p95: percentile(durations, 95),
        successRate: Math.round((latencies.filter(l => l.ok).length / latencies.length) * 100),
      });
    }
    setResults(allResults);
    setRunning(false);
  };

  const flaskResults = results?.filter(r => r.tech === 'Flask') || [];
  const goResults = results?.filter(r => r.tech === 'Go') || [];
  const expressResults = results?.filter(r => r.tech === 'Express') || [];
  const flaskAvg = flaskResults.length ? Math.round(flaskResults.reduce((a, b) => a + b.avg, 0) / flaskResults.length) : 0;
  const goAvg = goResults.length ? Math.round(goResults.reduce((a, b) => a + b.avg, 0) / goResults.length) : 0;
  const expressAvg = expressResults.length ? Math.round(expressResults.reduce((a, b) => a + b.avg, 0) / expressResults.length) : 0;
  const maxLatency = results ? Math.max(...results.map(r => r.max)) : 0;
  const avgEntries = [flaskAvg && { name: 'Flask', avg: flaskAvg }, goAvg && { name: 'Go', avg: goAvg }, expressAvg && { name: 'Express', avg: expressAvg }].filter(Boolean);
  const fastest = avgEntries.length ? avgEntries.reduce((a, b) => a.avg < b.avg ? a : b) : null;
  const slowest = avgEntries.length ? avgEntries.reduce((a, b) => a.avg > b.avg ? a : b) : null;

  return (
    <div className="fade-in" style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>Latency Benchmark</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 4, lineHeight: 1.6 }}>
          Fire requests at Flask, Go, and Express endpoints side by side. Compare response times, throughput, and reliability.
        </p>
      </div>

      {/* Config Section */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 20, marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
          {/* Flask Endpoints */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TechIcon tech="Flask" size={16} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Flask API</span>
                <span style={{ fontSize: 11, color: 'var(--gray-600)' }}>Python</span>
              </div>
              <button onClick={() => selectGroup('Flask')} style={{
                padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--gray-600)', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit',
              }}>Toggle All</button>
            </div>
            {ALL_ENDPOINTS.filter(e => e.tech === 'Flask').map(ep => (
              <label key={ep.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px',
                borderRadius: 6, cursor: 'pointer', fontSize: 12, color: selected[ep.id] ? '#fff' : 'var(--gray-600)',
              }}>
                <input type="checkbox" checked={selected[ep.id] || false} onChange={() => toggleEndpoint(ep.id)} style={{ accentColor: '#3b82f6' }} />
                <MethodBadge method={ep.method} small />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{ep.path}</span>
              </label>
            ))}
          </div>

          {/* Go Endpoints */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TechIcon tech="Go" size={16} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Go API</span>
                <span style={{ fontSize: 11, color: 'var(--gray-600)' }}>Go / Gin</span>
              </div>
              <button onClick={() => selectGroup('Go')} style={{
                padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--gray-600)', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit',
              }}>Toggle All</button>
            </div>
            {ALL_ENDPOINTS.filter(e => e.tech === 'Go').map(ep => (
              <label key={ep.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px',
                borderRadius: 6, cursor: 'pointer', fontSize: 12, color: selected[ep.id] ? '#fff' : 'var(--gray-600)',
              }}>
                <input type="checkbox" checked={selected[ep.id] || false} onChange={() => toggleEndpoint(ep.id)} style={{ accentColor: '#00c853' }} />
                <MethodBadge method={ep.method} small />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{ep.path}</span>
              </label>
            ))}
          </div>

          {/* Express Endpoints */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <TechIcon tech="Express" size={16} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>Express API</span>
                <span style={{ fontSize: 11, color: 'var(--gray-600)' }}>Node.js</span>
              </div>
              <button onClick={() => selectGroup('Express')} style={{
                padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border)',
                background: 'transparent', color: 'var(--gray-600)', fontSize: 10, cursor: 'pointer', fontFamily: 'inherit',
              }}>Toggle All</button>
            </div>
            {ALL_ENDPOINTS.filter(e => e.tech === 'Express').map(ep => (
              <label key={ep.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px',
                borderRadius: 6, cursor: 'pointer', fontSize: 12, color: selected[ep.id] ? '#fff' : 'var(--gray-600)',
              }}>
                <input type="checkbox" checked={selected[ep.id] || false} onChange={() => toggleEndpoint(ep.id)} style={{ accentColor: '#f59e0b' }} />
                <MethodBadge method={ep.method} small />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{ep.path}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: 'var(--gray-600)' }}>Iterations:</span>
            <input type="range" min={1} max={50} value={iterations} onChange={e => setIterations(Number(e.target.value))} style={{ width: 120, accentColor: '#fff' }} disabled={running} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, width: 28, textAlign: 'right' }}>{iterations}</span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--gray-700)' }}>
            {ALL_ENDPOINTS.filter(e => selected[e.id]).length} endpoints × {iterations} = {ALL_ENDPOINTS.filter(e => selected[e.id]).length * iterations} requests
          </span>
          <button onClick={runBenchmark} disabled={running || !ALL_ENDPOINTS.some(e => selected[e.id])} style={{
            marginLeft: 'auto', padding: '8px 24px', borderRadius: 8, border: 'none',
            background: running ? 'var(--gray-800)' : '#fff', color: running ? 'var(--gray-500)' : '#000',
            fontSize: 13, fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            {running && <span style={{ width: 12, height: 12, border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />}
            {running ? `Running ${progress}%` : 'Run Benchmark'}
          </button>
        </div>
        {running && (
          <div style={{ marginTop: 12, height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: '#fff', borderRadius: 2, transition: 'width 0.2s ease' }} />
          </div>
        )}
      </div>

      {/* Results */}
      {results && (
        <div className="fade-in">
          {/* Summary Cards */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 140, padding: '16px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <TechIcon tech="Flask" size={14} />
                <span style={{ fontSize: 10, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Flask Avg</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{flaskAvg}<span style={{ fontSize: 14, color: 'var(--gray-600)' }}>ms</span></div>
            </div>
            <div style={{ flex: 1, minWidth: 140, padding: '16px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <TechIcon tech="Go" size={14} />
                <span style={{ fontSize: 10, color: '#00c853', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Go Avg</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{goAvg}<span style={{ fontSize: 14, color: 'var(--gray-600)' }}>ms</span></div>
            </div>
            <div style={{ flex: 1, minWidth: 140, padding: '16px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <TechIcon tech="Express" size={14} />
                <span style={{ fontSize: 10, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Express Avg</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{expressAvg}<span style={{ fontSize: 14, color: 'var(--gray-600)' }}>ms</span></div>
            </div>
            <div style={{ flex: 1, minWidth: 140, padding: '16px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
              <div style={{ fontSize: 10, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 6 }}>Fastest</div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {fastest && slowest && fastest.avg !== slowest.avg ? <>{(slowest.avg / fastest.avg).toFixed(1)}<span style={{ fontSize: 14, color: 'var(--gray-600)' }}>x</span></> : '—'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--gray-600)', marginTop: 2 }}>
                {fastest ? `${fastest.name} is fastest` : '—'}
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 140, padding: '16px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
              <div style={{ fontSize: 10, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 6 }}>Total Requests</div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{results.length * iterations}</div>
              <div style={{ fontSize: 11, color: 'var(--gray-600)', marginTop: 2 }}>
                {results.filter(r => r.successRate === 100).length}/{results.length} endpoints OK
              </div>
            </div>
          </div>

          {/* Latency Bars */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>Response Time Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {results.map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 240, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TechIcon tech={r.tech} size={14} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gray-400)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.path}
                    </span>
                  </div>
                  <div style={{ flex: 1, height: 28, background: '#111', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 4, bottom: 4, left: `${(r.min / maxLatency) * 100}%`, width: `${((r.max - r.min) / maxLatency) * 100}%`, background: r.color + '22', borderRadius: 3 }} />
                    <div className="bench-bar" style={{ position: 'absolute', top: 6, bottom: 6, left: 0, width: `${(r.avg / maxLatency) * 100}%`, background: `linear-gradient(90deg, ${r.color}88, ${r.color})`, borderRadius: 3, minWidth: 4 }} />
                    <div style={{ position: 'absolute', top: 2, bottom: 2, left: `${(r.p50 / maxLatency) * 100}%`, width: 2, background: '#fff', opacity: 0.6, borderRadius: 1 }} />
                  </div>
                  <div style={{ width: 80, flexShrink: 0, textAlign: 'right' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: latencyColor(r.avg) }}>{r.avg}ms</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--gray-700)', marginLeft: 4 }}>avg</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              {[
                { label: 'Avg latency', el: <span style={{ width: 16, height: 3, background: 'var(--gray-400)', borderRadius: 1, display: 'inline-block' }} /> },
                { label: 'p50', el: <span style={{ width: 2, height: 10, background: '#fff', opacity: 0.6, borderRadius: 1, display: 'inline-block' }} /> },
                { label: 'Min–Max range', el: <span style={{ width: 16, height: 8, background: 'var(--gray-500)', opacity: 0.15, borderRadius: 2, display: 'inline-block' }} /> },
              ].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--gray-600)' }}>
                  {l.el}{l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Detail Table */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 600 }}>Detailed Results</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Endpoint', 'Service', 'Avg', 'Min', 'Max', 'p50', 'p95', 'Success'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #111' }}>
                      <td style={{ padding: '10px 16px', color: 'var(--gray-300)' }}>{r.path}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: r.color + '18', color: r.color }}>
                          <TechIcon tech={r.tech} size={12} />
                          {r.tech}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', fontWeight: 700, color: latencyColor(r.avg) }}>{r.avg}ms</td>
                      <td style={{ padding: '10px 16px', color: 'var(--gray-500)' }}>{r.min}ms</td>
                      <td style={{ padding: '10px 16px', color: 'var(--gray-500)' }}>{r.max}ms</td>
                      <td style={{ padding: '10px 16px', color: 'var(--gray-400)' }}>{r.p50}ms</td>
                      <td style={{ padding: '10px 16px', color: 'var(--gray-400)' }}>{r.p95}ms</td>
                      <td style={{ padding: '10px 16px', color: r.successRate === 100 ? '#00c853' : '#ff1744' }}>{r.successRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Per-Request Sparklines */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, marginTop: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>Per-Request Latency</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {results.map(r => (
                <div key={r.id} style={{ padding: 12, background: '#080808', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <TechIcon tech={r.tech} size={14} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gray-400)' }}>{r.path}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--gray-600)' }}>{r.tech}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 40 }}>
                    {r.latencies.map((l, i) => {
                      const localMax = Math.max(...r.latencies);
                      const h = localMax > 0 ? (l / localMax) * 36 : 4;
                      return (
                        <div key={i} title={`${l}ms`} style={{
                          flex: 1, height: Math.max(h, 3), background: r.color,
                          borderRadius: '2px 2px 0 0', opacity: 0.7,
                        }} />
                      );
                    })}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--gray-700)', fontFamily: 'var(--font-mono)' }}>
                    <span>req 1</span>
                    <span>req {r.latencies.length}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!results && !running && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--gray-600)', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10 }}>
          <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>⚡</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--gray-500)' }}>Select endpoints and run the benchmark</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Compare Flask (Python) vs Go (Gin) vs Express (Node.js) response times head-to-head</div>
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);
  const [serviceHealth, setServiceHealth] = useState({});
  const [loading, setLoading] = useState(false);

  const checkHealth = useCallback(async () => {
    const checks = [
      { id: 'web', url: '/' },
      { id: 'flask-api', url: `${FLASK_API_URL}/health` },
      { id: 'go-api', url: `${GO_API_URL}/health` },
      { id: 'express-api', url: `${EXPRESS_API_URL}/health` },
    ];
    for (const check of checks) {
      setServiceHealth(prev => ({ ...prev, [check.id]: 'checking' }));
      try {
        const res = await fetch(check.url);
        setServiceHealth(prev => ({ ...prev, [check.id]: res.ok ? 'healthy' : 'error' }));
      } catch {
        setServiceHealth(prev => ({ ...prev, [check.id]: 'error' }));
      }
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    checkHealth().finally(() => setLoading(false));
  }, [checkHealth]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} serviceHealth={serviceHealth} />
      <main style={{ flex: 1, marginLeft: 'var(--sidebar-width)', minHeight: '100vh' }}>
        {activeTab === 'overview' && (
          <OverviewTab
            serviceHealth={serviceHealth} loading={loading} error={error}
            onRefresh={() => { setLoading(true); checkHealth().finally(() => setLoading(false)); }}
          />
        )}
        {activeTab === 'explorer' && <ExplorerTab />}
        {activeTab === 'benchmark' && <BenchmarkTab />}
      </main>
    </div>
  );
}
