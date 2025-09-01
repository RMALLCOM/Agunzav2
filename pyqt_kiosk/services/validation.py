from typing import Dict, List


def validate(measure: Dict, rules: Dict) -> Dict:
    """
    measure: {"class":str,"width_cm":float,"length_cm":float,"weight_kg":float}
    rules: {
      "profile": "cabin"|"handbag",
      "tolerance_cm": float,
      "handbag": {"width":..,"height":..,"length":..,"weight":..},
      "cabin":   {...}
    }
    """
    profile = rules.get("profile", "cabin")
    tol = float(rules.get("tolerance_cm", 0))
    lim = rules.get(profile, {})

    reasons: List[str] = []
    authorized = True

    width_ok = measure.get("width_cm", 0) <= (lim.get("width", 0) + tol)
    length_ok = measure.get("length_cm", 0) <= (lim.get("length", 0) + tol)
    weight_ok = measure.get("weight_kg", 0) <= (lim.get("weight", 0))

    if not width_ok:
        authorized = False
        diff = round(measure.get("width_cm", 0) - lim.get("width", 0), 1)
        reasons.append(f"Excede ancho por {diff} cm")
    if not length_ok:
        authorized = False
        diff = round(measure.get("length_cm", 0) - lim.get("length", 0), 1)
        reasons.append(f"Excede largo por {diff} cm")
    if not weight_ok:
        authorized = False
        diff = round(measure.get("weight_kg", 0) - lim.get("weight", 0), 1)
        reasons.append(f"Excede peso por {diff} kg")

    return {"authorized": authorized, "reasons": reasons}