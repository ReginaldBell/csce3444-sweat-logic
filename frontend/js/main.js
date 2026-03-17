const API_BASE = 'http://localhost:8080/api';

const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionGroups = [
    {
        selector: '.hero, .page-intro, .cta-band',
        animation: 'hero',
    },
    {
        selector: '.feature-card, .stat-card, .dash-panel, .chart-panel, .breakdown-panel, .map-main, .map-info-card, .workout-output-panel, .settings-info-panel, .preview-card, .split-copy, form, .card',
        animation: 'pop',
    },
    {
        selector: '.metric-tile, .detail-chip, .mini-metric, .recommendation-card, .tip-card, .info-tile, .activity-item, .quick-action-btn, .breakdown-item, .history-list li, .legend-list li, .legend-list-grid li, .hours-list li, .map-tip',
        animation: 'slide-right',
    },
];
const countSelector = '.stat-value, #weekly-sessions-count, #weekly-time-total, #progress-total-workouts, #progress-total-hours, #progress-avg-session, .mini-metric strong, .detail-chip strong';

const countState = new WeakMap();
let motionObserver;
let refreshQueued = false;

async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
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
            element.style.setProperty('--stagger-delay', `${(index % 6) * 85}ms`);
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
    });
}

function initializeMotion() {
    document.body.classList.add('is-loaded');

    prepareAnimatedElements(document);
    setupCountTargets(document);
    refreshCountTargets(document);
}

// asks user for weight when first click get started
function showBMICalculator() {
    const bmiSection = document.getElementById('bmi-section');
    if (bmiSection) {
        bmiSection.style.display = 'block';
        prepareAnimatedElements(bmiSection);
        setupCountTargets(bmiSection);
        bmiSection.classList.add('is-visible');
        bmiSection.scrollIntoView({ behavior: reduceMotionQuery.matches ? 'auto' : 'smooth', block: 'start' });
    }
}

function calculateBMI() {
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value / 100;

    if (weight > 0 && height > 0) {
        const bmi = (weight / (height * height)).toFixed(1);
        let category = '';

        if (bmi < 18.5) category = 'Underweight';
        else if (bmi < 24.9) category = 'Normal weight';
        else if (bmi < 29.9) category = 'Overweight';
        else category = 'Obese';

        document.getElementById('bmi-result').innerText = `Your BMI is ${bmi} (${category})`;
        queueMotionRefresh();
    } else {
        alert('Please enter a valid height and weight!');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.refreshMotion = queueMotionRefresh;
    initializeMotion();
});
