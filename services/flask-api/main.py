import random
import hashlib
from datetime import datetime, timedelta
from flask import Flask, jsonify, request

SERVICE_BASE_PATH = "/_/flask-api"

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Seed-based deterministic helpers so data is consistent across requests
# ---------------------------------------------------------------------------

def _seed_for_today():
    return int(hashlib.md5(datetime.utcnow().strftime("%Y-%m-%d").encode()).hexdigest(), 16) % (10**9)


def _generate_monthly_revenue():
    rng = random.Random(42)
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    base = 38000
    data = []
    for i, m in enumerate(months):
        growth = rng.uniform(5, 25)
        amount = int(base * (1 + growth / 100))
        data.append({"month": m, "amount": amount, "growth": round(growth, 1)})
        base = amount
    return data


def _generate_transactions():
    rng = random.Random(42)
    companies = [
        "Acme Corp", "TechNova Inc", "Quantum Labs", "SkyBridge AI",
        "Nebula Systems", "Ironclad Security", "Pixel Perfect",
        "DataStream Co", "CloudForge", "Apex Dynamics",
        "Stellar Works", "NeonGrid", "Vortex Media", "ZeroPoint",
    ]
    plans = ["Starter", "Growth", "Enterprise"]
    statuses = ["completed", "completed", "completed", "pending", "completed"]
    txns = []
    now = datetime.utcnow()
    for i in range(25):
        company = rng.choice(companies)
        plan = rng.choice(plans)
        plan_amounts = {"Starter": 4900, "Growth": 14900, "Enterprise": 49900}
        amount = plan_amounts[plan] + rng.randint(-500, 500)
        is_expense = rng.random() < 0.3
        txns.append({
            "id": f"TXN-{1000 + i}",
            "description": f"{plan} Plan – {company}" if not is_expense else f"Expense – {company}",
            "amount": amount if not is_expense else -rng.randint(2000, 15000),
            "type": "income" if not is_expense else "expense",
            "date": (now - timedelta(days=i)).strftime("%Y-%m-%d"),
            "status": rng.choice(statuses),
        })
    return txns


def _generate_expenses():
    return [
        {"category": "Engineering", "amount": 182000, "percentage": 34.8},
        {"category": "Marketing", "amount": 118000, "percentage": 22.6},
        {"category": "Sales", "amount": 87000, "percentage": 16.6},
        {"category": "Operations", "amount": 63000, "percentage": 12.1},
        {"category": "Infrastructure", "amount": 45000, "percentage": 8.6},
        {"category": "Legal & Compliance", "amount": 28000, "percentage": 5.3},
    ]


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get(f"{SERVICE_BASE_PATH}")
def api_root():
    return jsonify({
        "service": "MoneyMachine Core API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": [
            f"{SERVICE_BASE_PATH}/health",
            f"{SERVICE_BASE_PATH}/revenue",
            f"{SERVICE_BASE_PATH}/revenue/summary",
            f"{SERVICE_BASE_PATH}/expenses",
            f"{SERVICE_BASE_PATH}/transactions",
            f"{SERVICE_BASE_PATH}/projections",
        ],
    })


@app.get(f"{SERVICE_BASE_PATH}/health")
def health():
    return jsonify({"status": "healthy", "service": "flask-core-api", "timestamp": datetime.utcnow().isoformat()})


@app.get(f"{SERVICE_BASE_PATH}/revenue")
def revenue():
    return jsonify({"revenue": _generate_monthly_revenue()})


@app.get(f"{SERVICE_BASE_PATH}/revenue/summary")
def revenue_summary():
    monthly = _generate_monthly_revenue()
    total_rev = sum(m["amount"] for m in monthly)
    expenses = sum(e["amount"] for e in _generate_expenses())
    return jsonify({
        "total_revenue": total_rev,
        "total_expenses": expenses,
        "net_profit": total_rev - expenses,
        "growth_rate": 23.4,
        "mrr": round(total_rev / 12),
        "arr": total_rev,
        "burn_rate": round(expenses / 12),
        "runway_months": round((total_rev - expenses) / (expenses / 12), 1) if expenses > 0 else None,
    })


@app.get(f"{SERVICE_BASE_PATH}/expenses")
def expenses():
    return jsonify({"expenses": _generate_expenses()})


@app.get(f"{SERVICE_BASE_PATH}/transactions")
def transactions():
    limit = request.args.get("limit", 10, type=int)
    txns = _generate_transactions()[:limit]
    return jsonify({"transactions": txns, "total": len(_generate_transactions())})


@app.get(f"{SERVICE_BASE_PATH}/projections")
def projections():
    monthly = _generate_monthly_revenue()
    last_3 = [m["amount"] for m in monthly[-3:]]
    avg_growth = sum(m["growth"] for m in monthly[-3:]) / 3

    next_q = int(sum(last_3) * (1 + avg_growth / 100))
    next_y = int(sum(m["amount"] for m in monthly) * (1 + avg_growth / 100))

    return jsonify({
        "projections": {
            "next_quarter": {"revenue": next_q, "confidence": 0.87},
            "next_year": {"revenue": next_y, "confidence": 0.72},
        },
        "avg_monthly_growth": round(avg_growth, 1),
        "trend": "bullish" if avg_growth > 10 else "stable",
    })


@app.post(f"{SERVICE_BASE_PATH}/revenue")
def add_revenue():
    data = request.get_json(force=True)
    return jsonify({
        "status": "created",
        "entry": {
            "id": f"REV-{random.randint(10000, 99999)}",
            "amount": data.get("amount", 0),
            "source": data.get("source", "unknown"),
            "created_at": datetime.utcnow().isoformat(),
        },
    }), 201


@app.post(f"{SERVICE_BASE_PATH}/expenses")
def add_expense():
    data = request.get_json(force=True)
    return jsonify({
        "status": "created",
        "entry": {
            "id": f"EXP-{random.randint(10000, 99999)}",
            "amount": data.get("amount", 0),
            "category": data.get("category", "uncategorized"),
            "created_at": datetime.utcnow().isoformat(),
        },
    }), 201


@app.errorhandler(404)
def not_found(_error):
    return jsonify(detail="404 – endpoint not found", service="flask-core-api"), 404
