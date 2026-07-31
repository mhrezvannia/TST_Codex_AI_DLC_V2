# Performance Test Instructions — W2-02 Design-System Closure

## Applicable budgets

This instruction applies the performance design consumed alongside `booking-design-system-closure/code-generation/code-generation-plan.md` and `booking-design-system-closure/code-generation/code-summary.md`. It does not invent load, percentile, SLA, or capacity claims.

Executable budgets are the existing 2,500 ms Booking BFF abort, at most 25 rendered list rows, one pending command/one network call, zero unexpected browser errors/timeouts, stable loading geometry, intentional table overflow only, and no page-level overflow at 375/768/1024/1440.

## Measurement method

The 98-case Playwright run records route/state/action timings, network observations, viewport, theme, and terminal discriminator. Inspect case records rather than deriving percentiles from one local run. Production builds must show no unexplained production dependency growth.

## Pass criteria and limitations

PASS requires all named budgets and layout assertions green. Full load, soak, stress, autoscaling, production capacity, and SLA validation are not applicable to this design-system closure and remain unclaimed.

