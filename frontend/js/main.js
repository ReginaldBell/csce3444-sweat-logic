const API_BASE = 'http://localhost:8080/api';

const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionGroups = [
    {
        selector: '.hero, .page-intro, .cta-band',
        animation: 'hero',
        step: 140,
    },
    {
        selector: '.hero .eyebrow, .hero h2, .hero p, .hero-actions, .hero-metrics',
        animation: 'hero-slice',
        step: 120,
    },
    {
        selector: '.feature-grid .feature-card:nth-child(odd), .progress-grid .chart-panel:first-child, .settings-layout form, .logic-stack .logic-row',
        animation: 'slide-left',
        step: 100,
    },
    {
        selector: '.feature-grid .feature-card:nth-child(even), .progress-grid .chart-panel:last-child, .settings-info-panel',
        animation: 'dash-in',
        step: 100,
    },
    {
        selector: '.feature-card, .stat-card, .dash-panel, .chart-panel, .breakdown-panel, .map-main, .map-info-card, .workout-output-panel, .preview-card, .split-copy, form, .card',
        animation: 'pop',
        step: 90,
    },
    {
        selector: '.metric-tile, .detail-chip, .mini-metric, .recommendation-card, .tip-card, .info-tile, .activity-item, .quick-action-btn, .breakdown-item, .history-list li, .legend-list li, .legend-list-grid li, .hours-list li, .map-tip, .workout-empty-state, .plan-summary-chip, .exercise-plan-item, .generated-plan-actions',
        animation: 'slide-right',
        step: 80,
    },
];
const countSelector = '.stat-value, #weekly-sessions-count, #weekly-time-total, #progress-total-workouts, #progress-total-hours, #progress-avg-session, .mini-metric strong, .detail-chip strong';
const progressSelector = '.metric-tile[data-progress], .stat-card[data-progress]';

const countState = new WeakMap();
let motionObserver;
let refreshQueued = false;

async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (res.status === 204) {
        return null;
    }

    const contentType = res.headers.get('content-type') || '';
    let payload;

    if (contentType.includes('application/json')) {
        payload = await res.json();
    } else {
        payload = await res.text();
    }

    if (!res.ok) {
        const message = typeof payload === 'string' && payload.trim()
            ? payload.trim()
            : `Request failed: ${res.status}`;
        const error = new Error(message);
        error.status = res.status;
        error.payload = payload;
        throw error;
    }

    return payload;
}

function findMatches(root, selector) {
    const matches = [];

    if (root instanceof Element && root.matches(selector)) {
        matches.push(root);
    }

    if (root.querySelectorAll) {
        matches.push(...root.querySelectorAll(selector));
    }

    return matches;
}

function ensureMotionObserver() {
    if (motionObserver || reduceMotionQuery.matches) {
        return;
    }

    motionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add('is-visible');
            revealCountTargets(entry.target);
            motionObserver.unobserve(entry.target);
        });
    }, {
        threshold: 0.16,
        rootMargin: '0px 0px -8% 0px',
    });
}

function prepareAnimatedElements(root = document) {
    if (reduceMotionQuery.matches) {
        return;
    }

    ensureMotionObserver();

    motionGroups.forEach((group) => {
        findMatches(root, group.selector).forEach((element, index) => {
            if (element.dataset.motionReady === 'true') {
                return;
            }

            element.dataset.motionReady = 'true';
            element.setAttribute('data-animate', group.animation);
            const scope = element.closest('.hero, .feature-grid, .split-panel, .stat-row, .dash-grid, .progress-grid, .settings-layout, .map-below, .quick-actions, .mini-metric-grid, .detail-grid') || element.parentElement || root;
            const scopedItems = Array.from(scope.querySelectorAll(group.selector));
            const scopedIndex = scopedItems.indexOf(element) >= 0 ? scopedItems.indexOf(element) : index;
            const step = group.step || 85;
            element.style.setProperty('--stagger-delay', `${(scopedIndex % 6) * step}ms`);
            motionObserver.observe(element);
        });
    });
}

function setupCountTargets(root = document) {
    findMatches(root, countSelector).forEach((element) => {
        if (element.dataset.countReady === 'true') {
            return;
        }

        element.dataset.countReady = 'true';
    });
}

function parseNumberParts(text) {
    const match = text.trim().match(/(-?\d+(?:\.\d+)?)/);

    if (!match) {
        return null;
    }

    const whole = match[0];
    const decimals = whole.includes('.') ? whole.split('.')[1].length : 0;
    const startIndex = match.index || 0;

    return {
        value: parseFloat(whole),
        decimals,
        prefix: text.slice(0, startIndex),
        suffix: text.slice(startIndex + whole.length),
    };
}

function formatAnimatedValue(parts, value) {
    const nextValue = parts.decimals > 0 ? value.toFixed(parts.decimals) : Math.round(value).toString();
    return `${parts.prefix}${nextValue}${parts.suffix}`;
}

function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
}

function animateCount(element) {
    const text = element.textContent.trim();
    const parsed = parseNumberParts(text);

    if (!parsed) {
        return;
    }

    const previous = countState.get(element);
    if (previous && previous.text === text) {
        return;
    }

    if (reduceMotionQuery.matches) {
        countState.set(element, { text, value: parsed.value });
        return;
    }

    const startValue = previous && Number.isFinite(previous.value) ? previous.value : 0;
    const endValue = parsed.value;

    if (startValue === endValue) {
        countState.set(element, { text, value: endValue });
        return;
    }

    const duration = 900;
    const startTime = performance.now();

    const tick = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = startValue + (endValue - startValue) * eased;

        element.textContent = formatAnimatedValue(parsed, current);

        if (progress < 1) {
            requestAnimationFrame(tick);
            return;
        }

        element.textContent = text;
        countState.set(element, { text, value: endValue });
    };

    requestAnimationFrame(tick);
}

function revealCountTargets(root) {
    const targets = findMatches(root, countSelector);
    targets.forEach((target) => {
        target.dataset.countVisible = 'true';
        animateCount(target);
    });
    revealProgressTargets(root);
}

function refreshCountTargets(root = document) {
    findMatches(root, countSelector).forEach((element) => {
        if (element.dataset.countVisible === 'true' || isInViewport(element)) {
            animateCount(element);
        }
    });
}

function queueMotionRefresh() {
    if (refreshQueued) {
        return;
    }

    refreshQueued = true;

    requestAnimationFrame(() => {
        refreshQueued = false;
        prepareAnimatedElements(document);
        setupCountTargets(document);
        refreshCountTargets(document);
        refreshProgressTargets(document);
    });
}

function initializeMotion() {
    document.body.classList.add('is-loaded');

    prepareAnimatedElements(document);
    setupCountTargets(document);
    refreshCountTargets(document);
    refreshProgressTargets(document);
}

function clampProgress(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
        return 0;
    }

    return Math.max(0, Math.min(1, numeric));
}

function setMeterScale(element, progress) {
    element.style.setProperty('--meter-scale', clampProgress(progress).toFixed(3));
}

function revealProgressTargets(root = document) {
    findMatches(root, progressSelector).forEach((element) => {
        const progress = element.dataset.progress;
        if (!progress) {
            return;
        }

        setMeterScale(element, progress);
    });
}

function refreshProgressTargets(root = document) {
    findMatches(root, progressSelector).forEach((element) => {
        if (!isInViewport(element)) {
            return;
        }

        const progress = element.dataset.progress;
        if (progress) {
            setMeterScale(element, progress);
        }
    });
}

function normalizeWorkoutDate(value) {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    const year = parsed.getFullYear();
    const month = parsed.getMonth();
    const day = parsed.getDate();

    return {
        key: `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        serial: Math.floor(Date.UTC(year, month, day) / 86400000),
    };
}

function getWorkoutDaySerials(workouts = []) {
    const uniqueSerials = new Set();

    workouts.forEach((workout) => {
        const normalized = normalizeWorkoutDate(workout.date);
        if (normalized) {
            uniqueSerials.add(normalized.serial);
        }
    });

    return Array.from(uniqueSerials).sort((a, b) => a - b);
}

function getCurrentWorkoutStreak(daySerials) {
    if (!daySerials.length) {
        return 0;
    }

    const today = normalizeWorkoutDate(new Date());
    if (!today) {
        return 0;
    }

    const serialSet = new Set(daySerials);
    if (!serialSet.has(today.serial)) {
        return 0;
    }

    let streak = 0;
    let cursor = today.serial;

    while (serialSet.has(cursor)) {
        streak += 1;
        cursor -= 1;
    }

    return streak;
}

function getLongestWorkoutStreak(daySerials) {
    if (!daySerials.length) {
        return 0;
    }

    let longest = 0;
    let current = 0;
    let previous = null;

    daySerials.forEach((serial) => {
        current = previous !== null && serial === previous + 1 ? current + 1 : 1;
        longest = Math.max(longest, current);
        previous = serial;
    });

    return longest;
}

function getWorkoutMetrics(workouts = []) {
    const daySerials = getWorkoutDaySerials(workouts);

    return {
        daySerials,
        currentStreak: getCurrentWorkoutStreak(daySerials),
        longestStreak: getLongestWorkoutStreak(daySerials),
    };
}

function getSelectedUnit() {
    return localStorage.getItem('unit') || 'imperial';
}

function applyUnitSettings() {
    const unit = getSelectedUnit();
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const unitNote = document.getElementById('unit-note');

    if (!weightInput || !heightInput) {
        return;
    }

    if (unit === 'metric') {
        weightInput.placeholder = 'Weight (kg)';
        heightInput.placeholder = 'Height (cm)';
        if (unitNote) {
            unitNote.innerText = 'Unit: Metric (kg, cm)';
        }
    } else {
        weightInput.placeholder = 'Weight (lbs)';
        heightInput.placeholder = 'Height (in)';
        if (unitNote) {
            unitNote.innerText = 'Unit: Imperial (lbs, in)';
        }
    }
}

function loadSavedProfile() {
    const saved = localStorage.getItem('sweatlogic-profile');
    if (!saved) {
        const goalField = document.getElementById('goal');
        const storedGoal = localStorage.getItem('goal');
        if (goalField && storedGoal) {
            goalField.value = storedGoal;
        }
        return;
    }

    try {
        const profile = JSON.parse(saved);
        const fieldIds = ['name', 'age', 'gender', 'goal', 'weight', 'height'];

        fieldIds.forEach((id) => {
            const element = document.getElementById(id);
            if (element && profile[id] !== undefined && profile[id] !== null) {
                element.value = profile[id];
            }
        });

        const bmiResult = document.getElementById('bmi-result');
        const recommendation = document.getElementById('workout-recommendation');
        const bmiSection = document.getElementById('bmi-section');

        if (profile.bmi && profile.category && bmiResult) {
            bmiResult.innerText = `Your BMI is ${profile.bmi} (${profile.category})`;
            if (bmiSection) {
                bmiSection.style.display = 'block';
            }
        }

        if (profile.recommendation && recommendation) {
            recommendation.innerText = `Recommendation: ${profile.recommendation}`;
        }
    } catch (err) {
        console.warn('Invalid saved profile', err);
    }
}

function showBMICalculator() {
    const bmiSection = document.getElementById('bmi-section');
    if (bmiSection) {
        bmiSection.style.display = 'block';
        applyUnitSettings();
        prepareAnimatedElements(bmiSection);
        setupCountTargets(bmiSection);
        bmiSection.classList.add('is-visible');
        bmiSection.scrollIntoView({ behavior: reduceMotionQuery.matches ? 'auto' : 'smooth', block: 'start' });
    }
}

function calculateBMI() {
    const unit = getSelectedUnit();
    const weightInput = document.getElementById('weight');
    const heightInput = document.getElementById('height');
    const recommendationEl = document.getElementById('workout-recommendation');
    const goalInput = document.getElementById('goal');
    const rawWeight = weightInput ? parseFloat(weightInput.value) : NaN;
    const rawHeight = heightInput ? parseFloat(heightInput.value) : NaN;
    let bmi;

    if (unit === 'metric') {
        const heightMeters = rawHeight / 100;
        if (rawWeight > 0 && heightMeters > 0) {
            bmi = (rawWeight / (heightMeters * heightMeters)).toFixed(1);
        }
    } else if (rawWeight > 0 && rawHeight > 0) {
        bmi = ((703 * rawWeight) / (rawHeight * rawHeight)).toFixed(1);
    }

    if (bmi) {
        let category = '';
        let recommendation = '';
        const userGoal = goalInput ? goalInput.value : '';

        if (bmi < 18.5) category = 'Underweight';
        else if (bmi < 24.9) category = 'Normal weight';
        else if (bmi < 29.9) category = 'Overweight';
        else category = 'Obese';

        if (userGoal === 'Lose weight' || userGoal === 'cardio') {
            recommendation = 'Focus on higher-volume cardio and calorie-burning sessions.';
        } else if (userGoal === 'Gain muscle' || userGoal === 'strength') {
            recommendation = 'Focus on compound lifts and progressive overload for strength gains.';
        } else if (userGoal === 'Improve endurance' || userGoal === 'endurance') {
            recommendation = 'Prioritize steady-state cardio and higher-rep training blocks.';
        } else if (userGoal === 'Maintain') {
            recommendation = 'Balance lighter cardio days with a few consistent strength sessions.';
        }

        const bmiResult = document.getElementById('bmi-result');
        if (bmiResult) {
            bmiResult.innerText = `Your BMI is ${bmi} (${category})`;
        }

        if (recommendationEl && recommendation) {
            recommendationEl.innerText = `Recommendation: ${recommendation}`;
        }

        const profile = {
            name: document.getElementById('name')?.value?.trim() || '',
            age: document.getElementById('age')?.value?.trim() || '',
            gender: document.getElementById('gender')?.value || '',
            goal: userGoal,
            weight: rawWeight,
            height: rawHeight,
            unit,
            bmi,
            category,
            recommendation,
            updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('sweatlogic-profile', JSON.stringify(profile));
        queueMotionRefresh();
    } else {
        alert('Please enter a valid height and weight!');
    }
}

function clearProfile() {
    localStorage.removeItem('sweatlogic-profile');
    ['name', 'age', 'gender', 'goal', 'weight', 'height'].forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = '';
        }
    });

    const bmiResult = document.getElementById('bmi-result');
    const recommendation = document.getElementById('workout-recommendation');
    if (bmiResult) {
        bmiResult.innerText = '';
    }
    if (recommendation) {
        recommendation.innerText = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.refreshMotion = queueMotionRefresh;
    window.setMotionProgress = (element, progress) => {
        if (!element) {
            return;
        }

        element.dataset.progress = clampProgress(progress).toFixed(3);
        setMeterScale(element, progress);
    };
    window.getWorkoutMetrics = getWorkoutMetrics;
    window.clearProfile = clearProfile;
    applyUnitSettings();
    loadSavedProfile();
    initializeMotion();
});

function generateCalendar(){
    const grid = document.getElementById('calendar-grid');
    const monthLabel = document.getElementById('calendar-month');
    if (!grid || !monthLabel) return;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November","December" ];
    monthLabel.innerText = monthNames[month] + " " + year;

    const firstDay = new Date(year, month, 1 ).getDay();
    const daysInMonth = new Date(year, month +1, 0).getDate();

    grid.innerHTML = "";

    const workedOutDays = [2,4,5,10,12,13,15]; // Temp values

    for (let day = 1; day <= daysInMonth; day++) {
        const isToday = day === now.getDate();
        const hasWorkout = workedOutDays.includes(day);

        grid.innerHTML += `
            <div style="
                height: 35px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                font-size: 0.9em;
                ${hasWorkout ? 'background: #32CD32; color: white;' : 'color: #333;'}
                ${isToday ? 'border: 2px solid #1b1b1b;' : ''}
            ">
                ${day}
            </div>
        `;
    }
}

window.addEventListener('load', () => {
    generateCalendar();
})
