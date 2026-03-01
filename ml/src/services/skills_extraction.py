from transformers import pipeline
from src.utils.skills_postprocessing import merge_bio_entities

# Exctract skills from input (input text -> model -> skills)
def build_skill_pipeline(model, tokenizer):
    ner = pipeline(
        task="token-classification",
        model=model,
        tokenizer = tokenizer
    )

    return ner


def extract_skills(text, ner_pipeline, tokenizer, max_no_special=510):
    all_entities = []

    # 1) line-by-line
    for line in text.split("\n"):
        line = line.strip()
        if not line:
            continue

        # 2) if the line is long, chunk it by tokens; else run directly
        ids = tokenizer.encode(line, add_special_tokens=False)
        if len(ids) <= max_no_special:
            all_entities.extend(ner_pipeline(line))
        else:
            for start in range(0, len(ids), max_no_special):
                chunk_ids = ids[start:start + max_no_special]
                chunk_text = tokenizer.decode(chunk_ids, skip_special_tokens=True)
                all_entities.extend(ner_pipeline(chunk_text))

    skills = merge_bio_entities(all_entities)

    return skills