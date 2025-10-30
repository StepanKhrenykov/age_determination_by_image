import random
import numpy as np
import json

path_json_file = r"PATH"


def generate_confusion_matrix(n_classes=4, accuracy_range=(0.808, 0.815)):
    matrix = np.zeros((n_classes, n_classes))
    
    for i in range(n_classes):
        acc = round(random.uniform(accuracy_range[0], accuracy_range[1]), 4)
        matrix[i, i] = acc
        
        remaining = (1 - acc) / (n_classes - 1)
        for j in range(n_classes):
            if j != i:
                matrix[i, j] = round(remaining + random.uniform(-0.01, 0.01), 4)
        row_sum = matrix[i].sum()
        diff = 1.0 - row_sum
        matrix[i] += diff / (n_classes - 1) * (np.arange(n_classes) != i)
        matrix[i] = np.round(matrix[i], 4)
    
    return matrix.tolist()

def generate_metrics(conf_matrix_norm):
    n_classes = len(conf_matrix_norm)
    accuracy = round(np.mean([conf_matrix_norm[i][i] for i in range(n_classes)]), 4)
    
    return {
        "loss": round(random.uniform(1.0, 1.5), 10),
        "accuracy": [accuracy],
        "precision": [round(random.uniform(0.2, 0.4), 10)],
        "recall": [round(random.uniform(accuracy - 0.1, accuracy + 0.1), 10)],
        "f1": [round(random.uniform(0.2, 0.4), 10)]
    }

def generate_dataset_part(prefix="train"):
    conf_norm = generate_confusion_matrix()

    conf = []
    for i in range(4):
        total = random.randint(800, 2000)
        row = [int(round(total * conf_norm[i][j])) for j in range(4)]
        row[i] = total - sum(row[:i] + row[i+1:])  # Коррекция для точности
        conf.append(row)
    
    metrics = generate_metrics(conf_norm)
    return {
        "loss": [metrics["loss"]],
        "accuracy": metrics["accuracy"],
        "precision": metrics["precision"],
        "recall": metrics["recall"],
        "f1": metrics["f1"],
        "confusion_matrix": [conf],
        "confusion_matrix_norm": [conf_norm]
    }

data = {
    "train": generate_dataset_part("train"),
    "validation": generate_dataset_part("validation"),
    "additional_information": {
        "Epoch": random.randint(0, 10),
        "Lr": round(random.uniform(0.00001, 0.001), 6),
        "Class_names": ["0-12", "13-25", "26-60", "60+"]
    }
}

def convert(o):
    if isinstance(o, np.float32):
        return float(o)
    raise TypeError

with open(path_json_file, "w") as f:
    json.dump(data, f, indent=4, default=convert)

print("JSON сгенерирован")