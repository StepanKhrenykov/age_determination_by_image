// Глобальные переменные для хранения графиков
let charts = {
    loss: null,
    accuracy: null,
    precision: null,
    recall: null,
    f1: null
};

// Имена классов
let classNames = [];

// Флаг режима автообновления (по умолчанию включено)
let autoUpdateLatestEpoch = true;

// Сохраненная выбранная пользователем эпоха
let userSelectedEpoch = 0;

// Цвета для графиков
const colors = {
    train: {
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)'
    },
    validation: {
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)'
    }
};

// Функция инициализации графиков
function initCharts() {
    // Инициализация графика потерь
    charts.loss = new Chart(document.getElementById('lossChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Train Loss',
                    data: [],
                    backgroundColor: colors.train.backgroundColor,
                    borderColor: colors.train.borderColor,
                    borderWidth: 2,
                    tension: 0.1
                },
                {
                    label: 'Validation Loss',
                    data: [],
                    backgroundColor: colors.validation.backgroundColor,
                    borderColor: colors.validation.borderColor,
                    borderWidth: 2,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: false
                }
            }
        }
    });

    // Инициализация графика точности
    charts.accuracy = new Chart(document.getElementById('accuracyChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Train Accuracy',
                    data: [],
                    backgroundColor: colors.train.backgroundColor,
                    borderColor: colors.train.borderColor,
                    borderWidth: 2,
                    tension: 0.1
                },
                {
                    label: 'Validation Accuracy',
                    data: [],
                    backgroundColor: colors.validation.backgroundColor,
                    borderColor: colors.validation.borderColor,
                    borderWidth: 2,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1
                }
            }
        }
    });

    // Инициализация графика точности (precision)
    charts.precision = new Chart(document.getElementById('precisionChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Train Precision',
                    data: [],
                    backgroundColor: colors.train.backgroundColor,
                    borderColor: colors.train.borderColor,
                    borderWidth: 2,
                    tension: 0.1
                },
                {
                    label: 'Validation Precision',
                    data: [],
                    backgroundColor: colors.validation.backgroundColor,
                    borderColor: colors.validation.borderColor,
                    borderWidth: 2,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1
                }
            }
        }
    });

    // Инициализация графика полноты (recall)
    charts.recall = new Chart(document.getElementById('recallChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Train Recall',
                    data: [],
                    backgroundColor: colors.train.backgroundColor,
                    borderColor: colors.train.borderColor,
                    borderWidth: 2,
                    tension: 0.1
                },
                {
                    label: 'Validation Recall',
                    data: [],
                    backgroundColor: colors.validation.backgroundColor,
                    borderColor: colors.validation.borderColor,
                    borderWidth: 2,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1
                }
            }
        }
    });

    // Инициализация графика F1-меры
    charts.f1 = new Chart(document.getElementById('f1Chart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Train F1',
                    data: [],
                    backgroundColor: colors.train.backgroundColor,
                    borderColor: colors.train.borderColor,
                    borderWidth: 2,
                    tension: 0.1
                },
                {
                    label: 'Validation F1',
                    data: [],
                    backgroundColor: colors.validation.backgroundColor,
                    borderColor: colors.validation.borderColor,
                    borderWidth: 2,
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1
                }
            }
        }
    });
}

// Функция обновления графиков новыми данными
function updateCharts(data) {
    // Обновление меток эпох
    const epochs = Array.from({ length: data.train.loss.length }, (_, i) => i + 1);
    
    // Обновляем данные для каждого графика
    Object.keys(charts).forEach(metric => {
        charts[metric].data.labels = epochs;
        charts[metric].data.datasets[0].data = data.train[metric];
        charts[metric].data.datasets[1].data = data.validation[metric];
        charts[metric].update();
    });
}

// Функция создания и отрисовки матрицы ошибок
function renderConfusionMatrix(confusionMatrixData, classNames, containerId, isNormalized = false) {
    const container = document.getElementById(containerId);
    
    // Очищаем предыдущую матрицу
    container.innerHTML = '';
    
    if (!confusionMatrixData || confusionMatrixData.length === 0) {
        container.innerHTML = '<p class="text-muted">Нет данных для отображения матрицы ошибок</p>';
        return;
    }
    
    // Создаем таблицу для матрицы ошибок
    const table = document.createElement('table');
    table.className = 'table table-bordered';
    
    // Создаем заголовок таблицы
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    // Пустая ячейка в верхнем левом углу
    const emptyHeader = document.createElement('th');
    emptyHeader.innerHTML = '<div class="cm-axis-label">Actual / Predicted</div>';
    headerRow.appendChild(emptyHeader);
    
    // Заголовки столбцов (предсказанные классы)
    classNames.forEach(className => {
        const th = document.createElement('th');
        th.textContent = className;
        th.className = 'text-center';
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Создаем тело таблицы
    const tbody = document.createElement('tbody');
    
    // Заполняем строки матрицы ошибок
    confusionMatrixData.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        
        // Заголовок строки (фактический класс)
        const th = document.createElement('th');
        th.textContent = classNames[rowIndex];
        th.className = 'text-center';
        tr.appendChild(th);
        
        // Значения ячеек матрицы
        row.forEach((value, colIndex) => {
            const td = document.createElement('td');
            // Форматируем значение в зависимости от того, нормализовано оно или нет
            if (isNormalized) {
                td.textContent = (value * 100).toFixed(2) + '%';
            } else {
                td.textContent = value;
            }
            
            // Выделяем диагональные элементы (правильные предсказания)
            if (rowIndex === colIndex) {
                td.className = 'diagonal cm-value';
            } else {
                td.className = 'off-diagonal cm-value';
            }
            
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
}

// Функция форматирования чисел для отображения метрик
function formatMetricValue(value) {
    if (value === undefined || value === null) {
        return "-";
    }
    return typeof value === 'number' ? value.toFixed(4) : value;
}

// Функция для форматирования массива значений LR
function formatLearningRates(lrArray) {
    if (!lrArray || !Array.isArray(lrArray) || lrArray.length === 0) {
        return "-";
    }
    
    // Форматируем каждое значение LR с научной нотацией
    return lrArray.map(lr => {
        if (typeof lr === 'number') {
            // Используем научную нотацию для маленьких чисел
            return lr.toExponential(4);
        }
        return lr;
    }).join(', ');
}

// Функция обновления значений метрик для выбранной эпохи
function updateMetricsForEpoch(data, epochIndex) {
    const metrics = ['loss', 'accuracy', 'precision', 'recall', 'f1'];
    
    metrics.forEach(metric => {
        // Обновляем значения для validation
        const validationMetrics = data.validation[metric] || [];
        if (validationMetrics.length > 0) {
            const validationEpochIndex = epochIndex < validationMetrics.length ? epochIndex : validationMetrics.length - 1;
            document.getElementById(`validation-${metric}`).textContent = formatMetricValue(validationMetrics[validationEpochIndex]);
        } else {
            document.getElementById(`validation-${metric}`).textContent = "-";
        }
        
        // Обновляем значения для train
        const trainMetrics = data.train[metric] || [];
        if (trainMetrics.length > 0) {
            const trainEpochIndex = epochIndex < trainMetrics.length ? epochIndex : trainMetrics.length - 1;
            document.getElementById(`train-${metric}`).textContent = formatMetricValue(trainMetrics[trainEpochIndex]);
        } else {
            document.getElementById(`train-${metric}`).textContent = "-";
        }
    });
}

// Функция обновления выпадающего списка эпох
function updateEpochSelector(data) {
    const selector = document.getElementById('confusionMatrixEpochSelect');
    
    // Сохраняем текущий выбор пользователя (если есть)
    const currentSelection = selector.value !== '' ? parseInt(selector.value, 10) : -1;
    
    // Очищаем текущие опции
    selector.innerHTML = '<option value="" disabled>Выберите эпоху</option>';
    
    // Определяем максимальное доступное количество эпох из validation.confusion_matrix
    const validationMatrices = data.validation.confusion_matrix || [];
    const availableEpochs = validationMatrices.length;
    
    for (let i = 0; i < availableEpochs; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `Эпоха ${i + 1}`;
        selector.appendChild(option);
    }
    
    // Выбираем эпоху в зависимости от режима
    if (availableEpochs > 0) {
        if (autoUpdateLatestEpoch) {
            // В автоматическом режиме всегда выбираем последнюю эпоху
            selector.value = availableEpochs - 1;
        } else if (currentSelection >= 0 && currentSelection < availableEpochs) {
            // В ручном режиме восстанавливаем выбор пользователя, если он еще доступен
            selector.value = currentSelection;
        } else {
            // Если выбранная эпоха больше не доступна, используем последнюю
            selector.value = userSelectedEpoch < availableEpochs ? userSelectedEpoch : availableEpochs - 1;
        }
    }
}

// Обновление матриц ошибок
function updateConfusionMatrices(data, epochIndex) {
    // Обновляем значения метрик для выбранной эпохи
    updateMetricsForEpoch(data, epochIndex);
    
    // Отображаем стандартную матрицу ошибок для validation
    const validationMatrices = data.validation.confusion_matrix || [];
    if (validationMatrices.length > 0) {
        // Проверяем, доступна ли выбранная эпоха
        const validationEpochIndex = epochIndex < validationMatrices.length ? epochIndex : validationMatrices.length - 1;
        renderConfusionMatrix(validationMatrices[validationEpochIndex], classNames, 'validationConfusionMatrix');
    } else {
        document.getElementById('validationConfusionMatrix').innerHTML = 
            '<p class="text-center text-muted">Нет данных для отображения матрицы ошибок</p>';
    }
    
    // Отображаем нормализованную матрицу ошибок для validation
    const validationMatricesNorm = data.validation.confusion_matrix_norm || [];
    if (validationMatricesNorm.length > 0) {
        // Проверяем, доступна ли выбранная эпоха
        const validationEpochIndex = epochIndex < validationMatricesNorm.length ? epochIndex : validationMatricesNorm.length - 1;
        renderConfusionMatrix(validationMatricesNorm[validationEpochIndex], classNames, 'validationConfusionMatrixNorm', true);
    } else {
        document.getElementById('validationConfusionMatrixNorm').innerHTML = 
            '<p class="text-center text-muted">Нет данных для отображения нормализованной матрицы ошибок</p>';
    }
    
    // Отображаем стандартную матрицу ошибок для train (если она есть)
    const trainMatrices = data.train.confusion_matrix || [];
    if (trainMatrices.length > 0) {
        // Проверяем, доступна ли выбранная эпоха
        const trainEpochIndex = epochIndex < trainMatrices.length ? epochIndex : trainMatrices.length - 1;
        renderConfusionMatrix(trainMatrices[trainEpochIndex], classNames, 'trainConfusionMatrix');
    } else {
        document.getElementById('trainConfusionMatrix').innerHTML = 
            '<p class="text-center text-muted">Нет данных для отображения матрицы ошибок</p>';
    }
    
    // Отображаем нормализованную матрицу ошибок для train (если она есть)
    const trainMatricesNorm = data.train.confusion_matrix_norm || [];
    if (trainMatricesNorm.length > 0) {
        // Проверяем, доступна ли выбранная эпоха
        const trainEpochIndex = epochIndex < trainMatricesNorm.length ? epochIndex : trainMatricesNorm.length - 1;
        renderConfusionMatrix(trainMatricesNorm[trainEpochIndex], classNames, 'trainConfusionMatrixNorm', true);
    } else {
        document.getElementById('trainConfusionMatrixNorm').innerHTML = 
            '<p class="text-center text-muted">Нет данных для отображения нормализованной матрицы ошибок</p>';
    }
}

// Функция обновления всех компонентов UI
function updateUI(data) {
    // Проверка наличия данных
    if (!data || data.error) {
        console.error('Ошибка получения данных:', data ? data.error : 'Нет данных');
        
        // Отображаем сообщение об отсутствии данных
        document.getElementById('epoch').textContent = "-";
        document.getElementById('lr').textContent = "-";
        
        // Очищаем таблицы с метриками
        const metrics = ['loss', 'accuracy', 'precision', 'recall', 'f1'];
        metrics.forEach(metric => {
            document.getElementById(`validation-${metric}`).textContent = "-";
            document.getElementById(`train-${metric}`).textContent = "-";
        });
        
        // Очищаем матрицы ошибок
        document.getElementById('validationConfusionMatrix').innerHTML = 
            '<p class="text-center text-muted">Нет данных для отображения матрицы ошибок</p>';
        document.getElementById('validationConfusionMatrixNorm').innerHTML = 
            '<p class="text-center text-muted">Нет данных для отображения нормализованной матрицы ошибок</p>';
        document.getElementById('trainConfusionMatrix').innerHTML = 
            '<p class="text-center text-muted">Нет данных для отображения матрицы ошибок</p>';
        document.getElementById('trainConfusionMatrixNorm').innerHTML = 
            '<p class="text-center text-muted">Нет данных для отображения нормализованной матрицы ошибок</p>';
        
        // Очищаем графики
        Object.keys(charts).forEach(metric => {
            charts[metric].data.labels = [];
            charts[metric].data.datasets[0].data = [];
            charts[metric].data.datasets[1].data = [];
            charts[metric].update();
        });
        
        return;
    }
    
    // Обновляем статус обучения
    document.getElementById('epoch').textContent = data.additional_information.Epoch;
    
    // Обновляем значения LR (несколько значений)
    const lrValues = data.additional_information.Lr;
    document.getElementById('lr').textContent = formatLearningRates(lrValues);
    
    // Сохраняем имена классов
    classNames = data.additional_information.Class_names;
    
    // Обновляем графики
    updateCharts(data);
    
    // Получаем текущую выбранную эпоху до обновления списка
    const selector = document.getElementById('confusionMatrixEpochSelect');
    const currentEpochIndex = selector.value !== '' ? parseInt(selector.value, 10) : -1;
    
    // Обновляем выпадающий список эпох
    updateEpochSelector(data);
    
    // Определяем индекс эпохи для отображения
    const updatedSelector = document.getElementById('confusionMatrixEpochSelect');
    const epochIndex = updatedSelector.value !== '' ? parseInt(updatedSelector.value, 10) : 0;
    
    // Обновляем матрицы ошибок только если выбрана эпоха
    if (epochIndex >= 0) {
        updateConfusionMatrices(data, epochIndex);
    }
}

// Функция периодического обновления данных
function fetchMetrics() {
    fetch('/metrics')
        .then(response => {
            if (!response.ok) {
                throw new Error('Ошибка при получении данных: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            updateUI(data);
        })
        .catch(error => {
            console.error('Ошибка при получении метрик:', error);
            // В случае ошибки отображаем пустые данные
            updateUI({error: error.message});
        });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем графики
    initCharts();
    
    // Получаем начальные данные
    fetchMetrics();
    
    // Устанавливаем интервал обновления (каждые 5 секунд)
    setInterval(fetchMetrics, 5000);
    
    // Обработчик для кнопки "Последняя эпоха"
    document.getElementById('cmLatestBtn').addEventListener('click', function() {
        document.getElementById('cmLatestBtn').classList.add('active');
        
        // Включаем режим автообновления
        autoUpdateLatestEpoch = true;
        
        fetch('/metrics')
            .then(response => response.json())
            .then(data => {
                // Получаем максимальное количество доступных эпох
                const validationMatrices = data.validation.confusion_matrix || [];
                const lastEpochIndex = validationMatrices.length - 1;
                
                if (lastEpochIndex >= 0) {
                    // Обновляем выпадающий список и выбираем последнюю эпоху
                    updateEpochSelector(data);
                    document.getElementById('confusionMatrixEpochSelect').value = lastEpochIndex;
                    
                    // Обновляем матрицы ошибок
                    updateConfusionMatrices(data, lastEpochIndex);
                }
            });
    });
    
    // Обработчик для выпадающего списка эпох
    document.getElementById('confusionMatrixEpochSelect').addEventListener('change', function() {
        const selectedEpoch = parseInt(this.value, 10);
        
        // Сохраняем выбранную пользователем эпоху
        userSelectedEpoch = selectedEpoch;
        
        // Выключаем режим автообновления
        autoUpdateLatestEpoch = false;
        
        // Снимаем выделение с кнопки "Последняя эпоха"
        document.getElementById('cmLatestBtn').classList.remove('active');
        
        fetch('/metrics')
            .then(response => response.json())
            .then(data => {
                updateConfusionMatrices(data, selectedEpoch);
            });
    });
});