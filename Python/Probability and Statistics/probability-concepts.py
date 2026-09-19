# Day 25 - Probability Concepts
# Sample space, events, simple probability, intersection (AND) and union (OR)

# --- Sample space and simple probability -------------------------------
sample_space = ["Heads", "Tails"]
event = ["Heads"]  # an event is a subset of the sample space

# P(A) = number of favourable outcomes / total outcomes in the sample space
p_heads = len(event) / len(sample_space)
print(f"Sample space: {sample_space}")
print(f"P(Heads) = {p_heads}")  # 0.5

# --- Initialize probability values -------------------------------------
prob_a = 0.6  # Probability of event A
prob_b = 0.4  # Probability of event B

# --- Intersection (AND) for independent events -------------------------
# P(A and B) = P(A) * P(B)
prob_and = prob_a * prob_b
# Result: prob_and = 0.24

# --- Union (OR) --------------------------------------------------------
# P(A or B) = P(A) + P(B) - P(A and B)
prob_or = prob_a + prob_b - prob_and
# Result: prob_or = 0.76

# --- Print results -----------------------------------------------------
print(f"P(A): {prob_a}, P(B): {prob_b}")
print(f"P(A AND B): {prob_and:.2f}")
print(f"P(A OR B): {prob_or:.2f}")

# --- Slide examples: coin and die --------------------------------------
# P(Heads AND 6) = 1/2 * 1/6 = 1/12
p_heads_and_six = (1 / 2) * (1 / 6)
print(f"P(Heads AND 6) = {p_heads_and_six:.4f}  (1/12 = {1 / 12:.4f})")

# Union of two die outcomes that cannot happen together (e.g. roll a 1 or a 2):
# P(1 or 2) = 1/6 + 1/6 - 0 = 1/3
p_one_or_two = 1 / 6 + 1 / 6 - 0
print(f"P(roll a 1 OR a 2) = {p_one_or_two:.4f}")
