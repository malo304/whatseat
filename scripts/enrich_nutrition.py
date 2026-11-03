#!/usr/bin/env python3
"""Enrichit le catalogue existant à partir des valeurs nutritionnelles publiques HelloFresh.
Ne modifie jamais les recettes ni les valeurs déjà renseignées. Sans donnée fiable, conserve null.
"""
import json, re, time, sys
from pathlib import Path
from sync_hellofresh import Scripts, get, nodes

CATALOGUE = Path(__file__).resolve().parents[1] / 'recipes.json'

def numeric(value):
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return float(value)
    if not isinstance(value, str):
        return None
    m = re.search(r'(?<!\d)(\d{1,5}(?:[\s\u00a0]\d{3})*(?:[.,]\d+)?)\s*(?:kcal|g|grammes?)?\b', value.strip(), re.I)
    if not m:
        return None
    try:
        return float(m.group(1).replace(' ', '').replace('\u00a0', '').replace(',', '.'))
    except ValueError:
        return None

def nutrition_from_page(html):
    parser = Scripts()
    parser.feed(html)
    for raw in parser.data:
        try:
            obj = json.loads(raw)
        except (ValueError, TypeError):
            continue
        for node in nodes(obj):
            typ = node.get('@type', [])
            if isinstance(typ, str):
                typ = [typ]
            if 'Recipe' not in typ:
                continue
            nutrition = node.get('nutrition') or {}
            if isinstance(nutrition, list):
                nutrition = next((x for x in nutrition if isinstance(x, dict)), {})
            if not isinstance(nutrition, dict):
                continue
            kcal = numeric(nutrition.get('calories'))
            protein = numeric(nutrition.get('proteinContent'))
            # JSON-LD Recipe nutrition is per serving according to Schema.org.
            if (kcal is not None and 0 < kcal < 5000) or (protein is not None and 0 <= protein < 500):
                return (round(kcal) if kcal is not None and 0 < kcal < 5000 else None,
                        round(protein, 1) if protein is not None and 0 <= protein < 500 else None)
    return None

def main():
    payload = json.loads(CATALOGUE.read_text(encoding='utf-8'))
    recipes = payload.get('recipes', [])
    updated = 0
    missing = 0
    failed = 0
    for i, recipe in enumerate(recipes, 1):
        if recipe.get('kcal') is not None and recipe.get('protein') is not None:
            continue
        url = recipe.get('url', '')
        if not re.match(r'^https://(?:www\.)?hellofresh\.fr/recipes/', url):
            continue
        try:
            result = nutrition_from_page(get(url))
            if result is None:
                missing += 1
                continue
            kcal, protein = result
            changed = False
            if recipe.get('kcal') is None and kcal is not None:
                recipe['kcal'] = kcal
                changed = True
            if recipe.get('protein') is None and protein is not None:
                recipe['protein'] = protein
                changed = True
            if changed:
                updated += 1
            print(f'[{i}/{len(recipes)}] {recipe.get("title", "")[:55]} : {kcal} kcal, {protein} g')
        except Exception as exc:
            failed += 1
            print(f'[{i}/{len(recipes)}] Échec : {str(exc)[:100]}', file=sys.stderr)
        finally:
            time.sleep(0.3)
    if updated:
        CATALOGUE.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Bilan : {updated} enrichies, {missing} sans nutrition publique exploitable, {failed} erreurs.')

if __name__ == '__main__':
    main()
