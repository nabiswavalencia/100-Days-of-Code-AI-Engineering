# Shared helpers for the Titanic exercises (Day 28)

from pathlib import Path

import pandas as pd

REPO_ROOT = Path(__file__).resolve().parents[2]
TITANIC_CSV = REPO_ROOT / "Projects" / "titanic-project" / "data" / "titanic.csv"
PLOTS_DIR = Path(__file__).resolve().parent / "plots"


def load_titanic():
    return pd.read_csv(TITANIC_CSV)


def save_plot(fig, name):
    PLOTS_DIR.mkdir(exist_ok=True)
    fig.savefig(PLOTS_DIR / name, dpi=120, bbox_inches="tight")
