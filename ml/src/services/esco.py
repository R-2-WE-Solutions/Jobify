import requests

ESCO_URL = "https://ec.europa.eu/esco/api"
ESCO_SCHEME_SKILLS = "http://data.europa.eu/esco/concept-scheme/skills"

# search for skill in ESCO dataset and return it if valid
def search_skill_esco(skill: str):
    skill = skill.lower().strip()
    params = {
        "text": skill,
        "language": "en",
        "type": ["skill"],
        "isInScheme": [ESCO_SCHEME_SKILLS],
        "limit": 5,
        "offset": 0,
        "full": False
    }

    try:
        r = requests.get(ESCO_URL, params=params, timeout=6)
        r.raise_for_status()
        data = r.json()

        results = data.get("_embedded", {}).get("results", [])
        if not results:
            return None

        best = results[0]

        return {
            "normalized_name": best.get("title"),
            "esco_uri": best.get("uri")
        }

    except Exception:
        return None
    

    


    
