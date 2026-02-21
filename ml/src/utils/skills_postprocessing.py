# Merge BIO entities -> I-skill + B-skill merged
def merge_bio_entities(ner_output):
    skills = []
    current = []
    scores = []

    for skill in ner_output:
        token = skill['word']
        label = skill['entity']
        score = skill['score']

        if token.startswith("##"):
            if current:
                current[-1] += token[2:]
                scores[-1] += score
                continue

        if label.startswith("B"):
            if current:
                skills.append({"skill": " ".join(current).strip().lower(),
                               "score": sum(scores) / len(scores)
                                })
            
            current = [token]
            scores = [score]

        elif label.startswith("I"):
            if current:
                current.append(token)
                scores.append(score)

        else:  # label == "O"
            if current:
                skills.append({"skill": " ".join(current).strip().lower(),
                               "score": sum(scores) / len(scores)
                            })
                
                current = []
                scores = []
    
    if current:
        skills.append({"skill": " ".join(current).strip().lower(),
                       "score": sum(scores) / len(scores)
                    })

    return skills