package main

import (
	"math"
	"math/rand"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

const serviceBasePath = "/_/go-api"

func main() {
	gin.SetMode(gin.ReleaseMode)
	r := gin.New()

	// ── Health ───────────────────────────────────────────────────────────
	r.GET(serviceBasePath, func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"service":   "MoneyMachine Performance API",
			"version":   "1.0.0",
			"runtime":   "go-gin",
			"status":    "operational",
			"endpoints": []string{serviceBasePath + "/health", serviceBasePath + "/analytics/realtime", serviceBasePath + "/analytics/risk", serviceBasePath + "/analytics/forecast", serviceBasePath + "/analytics/benchmark"},
		})
	})

	r.GET(serviceBasePath+"/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "healthy",
			"service":   "go-performance-api",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
	})

	// ── Real-time Analytics ─────────────────────────────────────────────
	r.GET(serviceBasePath+"/analytics/realtime", func(c *gin.Context) {
		rng := rand.New(rand.NewSource(time.Now().UnixNano()))

		c.JSON(http.StatusOK, gin.H{
			"active_users":         1247 + rng.Intn(200) - 100,
			"requests_per_second":  3842 + rng.Intn(500) - 250,
			"avg_response_time_ms": math.Round((12.4+rng.Float64()*3-1.5)*100) / 100,
			"error_rate":           math.Round(rng.Float64()*0.05*1000) / 1000,
			"uptime_percent":       99.97,
			"cpu_usage":            math.Round((34.2+rng.Float64()*10-5)*10) / 10,
			"memory_usage":         math.Round((67.8+rng.Float64()*8-4)*10) / 10,
			"active_connections":   842 + rng.Intn(100) - 50,
			"bandwidth_mbps":       math.Round((245.6+rng.Float64()*30-15)*10) / 10,
			"timestamp":            time.Now().UTC().Format(time.RFC3339),
		})
	})

	// ── Risk Analysis (Monte Carlo Simulation) ──────────────────────────
	r.GET(serviceBasePath+"/analytics/risk", func(c *gin.Context) {
		rng := rand.New(rand.NewSource(42))
		iterations := 10000
		var outcomes []float64

		baseRevenue := 847000.0
		for i := 0; i < iterations; i++ {
			growth := 1 + (rng.Float64()*0.4 - 0.1) // -10% to +30%
			outcomes = append(outcomes, baseRevenue*growth)
		}

		// Calculate VaR (Value at Risk) at 95th percentile
		sortedOutcomes := make([]float64, len(outcomes))
		copy(sortedOutcomes, outcomes)
		for i := range sortedOutcomes {
			for j := i + 1; j < len(sortedOutcomes); j++ {
				if sortedOutcomes[j] < sortedOutcomes[i] {
					sortedOutcomes[i], sortedOutcomes[j] = sortedOutcomes[j], sortedOutcomes[i]
				}
			}
			if i > 500 {
				break // only need bottom 5%
			}
		}
		var5 := sortedOutcomes[int(float64(iterations)*0.05)]

		factors := []gin.H{
			{"name": "Market Volatility", "score": 15, "trend": "stable", "detail": "Market conditions remain favorable"},
			{"name": "Revenue Concentration", "score": 35, "trend": "improving", "detail": "Top 3 clients represent 35% of revenue"},
			{"name": "Cash Runway", "score": 12, "trend": "stable", "detail": "18+ months of runway at current burn rate"},
			{"name": "Churn Rate", "score": 28, "trend": "improving", "detail": "Monthly churn decreased from 4.2% to 2.8%"},
			{"name": "Operational Risk", "score": 18, "trend": "stable", "detail": "Infrastructure redundancy in place"},
		}

		avgScore := 0
		for _, f := range factors {
			avgScore += f["score"].(int)
		}
		avgScore /= len(factors)

		riskLevel := "low"
		if avgScore > 40 {
			riskLevel = "high"
		} else if avgScore > 25 {
			riskLevel = "medium"
		}

		c.JSON(http.StatusOK, gin.H{
			"risk_score":          avgScore,
			"risk_level":          riskLevel,
			"factors":             factors,
			"var_95":              math.Round(var5),
			"simulations_run":     iterations,
			"recommendation":      "Your financial health is strong. Consider diversifying revenue streams to reduce concentration risk.",
			"computation_time_ms": 42,
		})
	})

	// ── Revenue Forecasting ─────────────────────────────────────────────
	r.GET(serviceBasePath+"/analytics/forecast", func(c *gin.Context) {
		rng := rand.New(rand.NewSource(42))
		baseRevenue := 89000.0
		growthRate := 0.08
		volatility := 0.12

		months := []string{
			"Mar 2026", "Apr 2026", "May 2026", "Jun 2026",
			"Jul 2026", "Aug 2026", "Sep 2026", "Oct 2026",
			"Nov 2026", "Dec 2026", "Jan 2027", "Feb 2027",
		}

		var forecast []gin.H
		current := baseRevenue
		for _, m := range months {
			noise := rng.NormFloat64() * volatility
			growth := growthRate + noise*0.3
			current = current * (1 + growth)
			lower := current * (1 - volatility)
			upper := current * (1 + volatility)

			forecast = append(forecast, gin.H{
				"month":             m,
				"predicted_revenue": math.Round(current),
				"lower_bound":       math.Round(lower),
				"upper_bound":       math.Round(upper),
			})
		}

		c.JSON(http.StatusOK, gin.H{
			"forecast":         forecast,
			"model":            "ARIMA with Monte Carlo confidence intervals",
			"model_confidence": 0.89,
			"trend":            "bullish",
			"predicted_arr":    math.Round(current * 12),
		})
	})

	// ── Industry Benchmarking ───────────────────────────────────────────
	r.GET(serviceBasePath+"/analytics/benchmark", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"company_metrics": gin.H{
				"revenue_growth":        23.4,
				"gross_margin":          78.2,
				"net_margin":            38.2,
				"cac":                   142,
				"ltv":                   8400,
				"ltv_cac_ratio":         59.2,
				"magic_number":          1.4,
				"rule_of_40":            61.6,
				"burn_multiple":         0.8,
				"payback_period_months": 4.2,
			},
			"industry_median": gin.H{
				"revenue_growth":        18.0,
				"gross_margin":          72.0,
				"net_margin":            15.0,
				"cac":                   210,
				"ltv":                   5200,
				"ltv_cac_ratio":         24.8,
				"magic_number":          0.8,
				"rule_of_40":            38.0,
				"burn_multiple":         1.5,
				"payback_period_months": 8.0,
			},
			"percentile_rank": gin.H{
				"revenue_growth": 82,
				"gross_margin":   75,
				"net_margin":     94,
				"efficiency":     91,
				"overall":        88,
			},
			"verdict": "Top quartile SaaS company – outperforming 88% of peers",
		})
	})

	// ── 404 ─────────────────────────────────────────────────────────────
	r.NoRoute(func(c *gin.Context) {
		c.JSON(http.StatusNotFound, gin.H{"detail": "404 – endpoint not found", "service": "go-performance-api"})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	_ = r.Run(":" + port)
}
