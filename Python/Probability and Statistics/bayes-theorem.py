# Step 5 - Conditional probability and Bayes' theorem
# Scenario: a medical screening test.
#   Prior       P(disease)             - how common the condition is before testing
#   Likelihood  P(positive | disease)   - the test's sensitivity
#   Evidence    P(positive)             - how often ANY person tests positive
#   Posterior   P(disease | positive)   - what we actually want to know

import numpy as np


def bayes_theorem(prior, likelihood, evidence):
    return (likelihood * prior) / evidence


prior = 0.01  # 1% of people have the condition
likelihood = 0.90  # test catches 90% of real cases (sensitivity)
false_positive_rate = 0.05  # 5% of healthy people also test positive

# Evidence by the law of total probability: positives come from sick AND healthy people
evidence = likelihood * prior + false_positive_rate * (1 - prior)

posterior = bayes_theorem(prior, likelihood, evidence)

print(f"Prior P(disease):              {prior:.3f}")
print(f"Likelihood P(positive|disease): {likelihood:.3f}")
print(f"Evidence P(positive):           {evidence:.4f}")
print(f"Posterior P(disease|positive):  {posterior:.3f}")

# --- The same answer with natural frequencies --------------------------
population = 10_000
sick = population * prior
healthy = population - sick
true_positives = sick * likelihood
false_positives = healthy * false_positive_rate
print(f"\nOf {population:,} people: {sick:.0f} are sick and {healthy:.0f} are healthy.")
print(f"  True positives:  {true_positives:.0f}")
print(f"  False positives: {false_positives:.0f}")
print(
    f"  A positive result is a true case only {true_positives:.0f} out of "
    f"{true_positives + false_positives:.0f} times = {true_positives / (true_positives + false_positives):.3f}"
)

# --- Check by simulation -----------------------------------------------
rng = np.random.default_rng(42)
n = 1_000_000
has_condition = rng.random(n) < prior
positive = np.where(has_condition, rng.random(n) < likelihood, rng.random(n) < false_positive_rate)
print(f"\nSimulated P(disease|positive) over {n:,} people: {has_condition[positive].mean():.3f}")

# --- The prior drives the answer ---------------------------------------
print("\nSame test, different prior:")
for p in (0.001, 0.01, 0.1, 0.5):
    ev = likelihood * p + false_positive_rate * (1 - p)
    print(f"  prior {p:>5.3f} -> posterior {bayes_theorem(p, likelihood, ev):.3f}")

print(
    "\nWhy a positive test is not proof: when the condition is rare, healthy people "
    "vastly outnumber sick ones, so their false positives swamp the true positives."
)
