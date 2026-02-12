const express = require("express");

const SERVICE_BASE_PATH = "/_/express-api";

const app = express();
app.use(express.json());

// ---------------------------------------------------------------------------
// Seed-based deterministic helpers (consistent data across requests)
// ---------------------------------------------------------------------------

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateUsers() {
  const rng = seededRandom(42);
  const firstNames = [
    "Alice", "Bob", "Carlos", "Diana", "Elena",
    "Frank", "Grace", "Hiro", "Iris", "Jake",
    "Kara", "Liam", "Mia", "Noah", "Olivia",
  ];
  const lastNames = [
    "Chen", "Martinez", "Patel", "Johansson", "Williams",
    "Kim", "Müller", "Silva", "Tanaka", "Okafor",
    "Rossi", "Andersen", "Gupta", "Lee", "Dubois",
  ];
  const plans = ["free", "starter", "growth", "enterprise"];
  const statuses = ["active", "active", "active", "active", "churned", "trial"];

  const users = [];
  const now = new Date();
  for (let i = 0; i < 20; i++) {
    const first = firstNames[Math.floor(rng() * firstNames.length)];
    const last = lastNames[Math.floor(rng() * lastNames.length)];
    const plan = plans[Math.floor(rng() * plans.length)];
    const status = statuses[Math.floor(rng() * statuses.length)];
    const daysAgo = Math.floor(rng() * 365);
    const joinDate = new Date(now - daysAgo * 86400000);

    users.push({
      id: `USR-${1000 + i}`,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      plan,
      status,
      joined: joinDate.toISOString().split("T")[0],
      monthly_spend: plan === "free" ? 0 : Math.round(rng() * 400 + 20) * 100,
    });
  }
  return users;
}

function generateSubscriptions() {
  const rng = seededRandom(99);
  const plans = [
    { name: "Free", price: 0, interval: "month" },
    { name: "Starter", price: 4900, interval: "month" },
    { name: "Growth", price: 14900, interval: "month" },
    { name: "Enterprise", price: 49900, interval: "month" },
  ];

  return plans.map((plan) => {
    const count = Math.floor(rng() * 300) + (plan.price === 0 ? 400 : 20);
    return {
      plan: plan.name,
      price_cents: plan.price,
      interval: plan.interval,
      active_count: count,
      mrr_cents: plan.price * count,
    };
  });
}

function generateUserStats() {
  return {
    total_users: 1847,
    active_users: 1523,
    trial_users: 189,
    churned_users: 135,
    new_this_month: 94,
    activation_rate: 72.4,
    avg_revenue_per_user: 12840,
    daily_active_users: [
      { date: "Mon", count: 1102 },
      { date: "Tue", count: 1247 },
      { date: "Wed", count: 1189 },
      { date: "Thu", count: 1301 },
      { date: "Fri", count: 1156 },
      { date: "Sat", count: 634 },
      { date: "Sun", count: 589 },
    ],
  };
}

function generateChurnAnalysis() {
  const rng = seededRandom(77);
  const months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  return months.map((month) => {
    const rate = Math.round((rng() * 3 + 1.5) * 10) / 10;
    const recovered = Math.floor(rng() * 15) + 3;
    return {
      month,
      churn_rate: rate,
      churned_users: Math.floor(rng() * 40) + 10,
      recovered_users: recovered,
      net_churn: Math.floor(rng() * 30) + 5 - recovered,
    };
  });
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.get(SERVICE_BASE_PATH, (_req, res) => {
  res.json({
    service: "MoneyMachine Users & Subscriptions API",
    version: "1.0.0",
    runtime: "express-node",
    status: "operational",
    endpoints: [
      `${SERVICE_BASE_PATH}/health`,
      `${SERVICE_BASE_PATH}/users`,
      `${SERVICE_BASE_PATH}/users/stats`,
      `${SERVICE_BASE_PATH}/subscriptions`,
      `${SERVICE_BASE_PATH}/subscriptions/mrr`,
      `${SERVICE_BASE_PATH}/churn`,
    ],
  });
});

app.get(`${SERVICE_BASE_PATH}/health`, (_req, res) => {
  res.json({
    status: "healthy",
    service: "express-users-api",
    timestamp: new Date().toISOString(),
  });
});

app.get(`${SERVICE_BASE_PATH}/users`, (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 10;
  const status = req.query.status;
  let users = generateUsers();
  if (status) {
    users = users.filter((u) => u.status === status);
  }
  res.json({
    users: users.slice(0, limit),
    total: users.length,
  });
});

app.get(`${SERVICE_BASE_PATH}/users/stats`, (_req, res) => {
  res.json(generateUserStats());
});

app.get(`${SERVICE_BASE_PATH}/subscriptions`, (_req, res) => {
  res.json({ subscriptions: generateSubscriptions() });
});

app.get(`${SERVICE_BASE_PATH}/subscriptions/mrr`, (_req, res) => {
  const subs = generateSubscriptions();
  const totalMrr = subs.reduce((sum, s) => sum + s.mrr_cents, 0);
  const paidSubs = subs.filter((s) => s.price_cents > 0);
  const paidCount = paidSubs.reduce((sum, s) => sum + s.active_count, 0);

  res.json({
    total_mrr_cents: totalMrr,
    total_arr_cents: totalMrr * 12,
    paying_customers: paidCount,
    arpu_cents: paidCount > 0 ? Math.round(totalMrr / paidCount) : 0,
    breakdown: subs.map((s) => ({
      plan: s.plan,
      mrr_cents: s.mrr_cents,
      percentage: totalMrr > 0 ? Math.round((s.mrr_cents / totalMrr) * 1000) / 10 : 0,
    })),
    mrr_trend: [
      { month: "Sep", mrr: totalMrr - 580000 },
      { month: "Oct", mrr: totalMrr - 420000 },
      { month: "Nov", mrr: totalMrr - 310000 },
      { month: "Dec", mrr: totalMrr - 180000 },
      { month: "Jan", mrr: totalMrr - 60000 },
      { month: "Feb", mrr: totalMrr },
    ],
  });
});

app.get(`${SERVICE_BASE_PATH}/churn`, (_req, res) => {
  const analysis = generateChurnAnalysis();
  const avgChurn =
    Math.round(
      (analysis.reduce((s, m) => s + m.churn_rate, 0) / analysis.length) * 10
    ) / 10;

  res.json({
    monthly_churn: analysis,
    avg_churn_rate: avgChurn,
    churn_trend: avgChurn < 3.0 ? "improving" : "needs_attention",
    top_churn_reasons: [
      { reason: "Price sensitivity", percentage: 34.2 },
      { reason: "Missing features", percentage: 27.8 },
      { reason: "Competitor switch", percentage: 18.5 },
      { reason: "No longer needed", percentage: 12.1 },
      { reason: "Poor support experience", percentage: 7.4 },
    ],
  });
});

app.post(`${SERVICE_BASE_PATH}/users`, (req, res) => {
  const { name, email, plan } = req.body || {};
  res.status(201).json({
    status: "created",
    user: {
      id: `USR-${Math.floor(Math.random() * 90000) + 10000}`,
      name: name || "New User",
      email: email || "user@example.com",
      plan: plan || "free",
      status: "trial",
      joined: new Date().toISOString().split("T")[0],
      monthly_spend: 0,
    },
  });
});

// ── 404 ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    detail: "404 – endpoint not found",
    service: "express-users-api",
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`express-users-api listening on :${port}`);
});

module.exports = app;
