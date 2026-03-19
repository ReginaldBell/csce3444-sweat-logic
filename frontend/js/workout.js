document.addEventListener('DOMContentLoaded', () => {
    const WORKOUT_API_BASE = 'http://localhost:8080/api';
    const DEFAULT_BODY_PART = 'chest';
    const DEFAULT_GOAL = 'strength';
    const DEFAULT_LEVEL = 'intermediate';
    const LAST_PATH_KEY = 'sweatlogic-last-path';
    const SESSION_KEY = 'sweatlogic-active-guided-session';
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const GOAL_OPTIONS = new Set(['strength', 'cardio', 'endurance']);
    const LEVEL_OPTIONS = new Set(['beginner', 'intermediate', 'advanced']);
    const GOAL_COMPATIBILITY = {
        core:  new Set(['strength', 'cardio', 'endurance']),
        chest: new Set(['strength']),
        back:  new Set(['strength']),
        legs:  new Set(['strength']),
        arms:  new Set(['strength']),
    };

    // ── Path chooser ───────────────────────────────────────────────
    const pathChooser   = document.getElementById('path-chooser');
    const guidedPath    = document.getElementById('guided-path');
    const guidedSplit   = document.getElementById('guided-split');
    const manualPath    = document.getElementById('manual-path');
    const pathCards     = Array.from(pathChooser ? pathChooser.querySelectorAll('.path-card') : []);

    // ── Shared helpers ─────────────────────────────────────────────
    function formatLocalDateTime(date = new Date()) {
        const year    = date.getFullYear();
        const month   = String(date.getMonth() + 1).padStart(2, '0');
        const day     = String(date.getDate()).padStart(2, '0');
        const hours   = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    async function requestApi(path, options = {}) {
        const response = await fetch(`${WORKOUT_API_BASE}${path}`, {
            headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
            ...options,
        });

        if (response.status === 204) return null;

        const contentType = response.headers.get('content-type') || '';
        const payload = contentType.includes('application/json')
            ? await response.json()
            : await response.text();

        if (!response.ok) {
            const message = typeof payload === 'string' && payload.trim()
                ? payload.trim()
                : `Request failed: ${response.status}`;
            const error = new Error(message);
            error.status  = response.status;
            error.payload = payload;
            throw error;
        }

        return payload;
    }

    function toTitleCase(value) {
        return String(value || '')
            .split(/[\s-]+/)
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(' ');
    }

    function setStatus(element, message, tone = 'success') {
        if (!element) return;
        element.textContent = message || '';
        element.classList.remove('is-visible', 'is-error', 'is-success');
        if (!message) return;
        element.classList.add('is-visible', tone === 'error' ? 'is-error' : 'is-success');
    }

    function setLoading(button, isLoading, loadingText, defaultText) {
        if (!button) return;
        button.disabled    = isLoading;
        button.classList.toggle('is-loading', isLoading);
        button.textContent = isLoading ? loadingText : defaultText;
    }

    function getMotionBehavior() {
        return prefersReducedMotion ? 'auto' : 'smooth';
    }

    function pulseElement(element, className = 'is-pulsing', duration = 560) {
        if (!element || prefersReducedMotion) return;
        element.classList.remove(className);
        void element.offsetWidth;
        element.classList.add(className);
        window.setTimeout(() => element.classList.remove(className), duration);
    }

    function celebrateElement(element, className = 'is-celebrating', duration = 620) {
        if (!element || prefersReducedMotion) return;
        element.classList.remove(className);
        void element.offsetWidth;
        element.classList.add(className);
        window.setTimeout(() => element.classList.remove(className), duration);
    }

    function queueWorkoutMotionRefresh() {
        if (typeof window.refreshMotion === 'function') {
            window.refreshMotion();
        }
    }

    function showView(section) {
        if (!section) return;
        section.hidden = false;
        section.classList.remove('is-active-view');
        requestAnimationFrame(() => section.classList.add('is-active-view'));
    }

    function hideView(section) {
        if (!section) return;
        section.classList.remove('is-active-view');
        section.hidden = true;
    }

    function activatePath(path, { animate = true } = {}) {
        // Block switching to manual when a guided session is active
        const session = loadActiveSession();
        if (path === 'manual' && session && session.status !== 'completed') {
            return;
        }

        const isDeciding = pathChooser && pathChooser.classList.contains('is-deciding');

        pathCards.forEach((card) => {
            const isSelected = card.dataset.path === path;
            card.classList.toggle('is-selected', isSelected);
            if (isSelected && animate) pulseElement(card);
        });

        if (isDeciding && pathChooser) {
            pathChooser.classList.remove('is-deciding');
            document.body.classList.remove('is-deciding');
        }

        localStorage.setItem(LAST_PATH_KEY, path);

        if (path === 'manual') {
            hideView(guidedPath);
            showView(manualPath);
        } else {
            hideView(manualPath);
            showView(guidedPath);
        }

        updateSwitchLink(path);
        queueWorkoutMotionRefresh();
    }

    function updateSwitchLink(activePath) {
        const existingLink = document.getElementById('path-switch-link');
        if (existingLink) existingLink.remove();

        // No switch link while a guided session is active
        const session = loadActiveSession();
        if (session && session.status !== 'completed') return;

        const otherPath  = activePath === 'guided' ? 'manual' : 'guided';
        const otherLabel = activePath === 'guided' ? 'Log a session manually' : 'Build a guided workout';
        const anchor     = activePath === 'guided' ? guidedPath : manualPath;
        if (!anchor) return;

        const btn = document.createElement('button');
        btn.id        = 'path-switch-link';
        btn.className = 'path-switch-link';
        btn.type      = 'button';
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg> Switch to: ${otherLabel}`;
        btn.addEventListener('click', () => activatePath(otherPath));
        anchor.parentNode.insertBefore(btn, anchor);
    }

    pathCards.forEach((card) => {
        card.addEventListener('click', () => activatePath(card.dataset.path));
    });

    // ── Guided builder DOM refs ─────────────────────────────────────
    const bodyPartSelect = document.getElementById('recommend-body-part');
    const goalSelect     = document.getElementById('recommend-goal');
    const levelSelect    = document.getElementById('recommend-level');

    const stepBodyPart = document.getElementById('step-body-part');
    const stepGoal     = document.getElementById('step-goal');
    const stepLevel    = document.getElementById('step-level');
    const stepGenerate = document.getElementById('step-generate');

    const builderSteps      = document.querySelectorAll('.builder-step');
    const builderStepsTrack = document.getElementById('builder-steps');

    const bodyZoneCards   = document.querySelectorAll('.body-zone-card');
    const goalOptionBtns  = document.querySelectorAll('.goal-option-btn');
    const levelOptionBtns = document.querySelectorAll('.level-option-btn');

    const goalRestrictionNote = document.getElementById('goal-restriction-note');
    const generateSummary     = document.getElementById('generate-summary');
    const generateButton      = document.getElementById('generate-plan-btn');
    const recommendationStatus = document.getElementById('recommendation-status');

    // Output panel refs
    const outputTitle         = document.getElementById('plan-output-title');
    const outputCopy          = document.getElementById('plan-output-copy');
    const outputPanel         = document.querySelector('.workout-output-panel');
    const emptyState          = document.getElementById('workout-empty-state');
    const generatedPlanPanel  = document.getElementById('generated-plan-panel');
    const planSummaryGrid     = document.getElementById('plan-summary-grid');
    const exercisePlanList    = document.getElementById('exercise-plan-list');
    const generatedDuration   = document.getElementById('generated-duration');
    const generatedNotes      = document.getElementById('generated-notes');
    const completeGeneratedButton = document.getElementById('complete-generated-btn');
    const generatedPlanStatus = document.getElementById('generated-plan-status');

    // Timer / session control refs
    const sessionTimer      = document.getElementById('session-timer');
    const timerDisplay      = document.getElementById('timer-display');
    const timerStartBtn     = document.getElementById('timer-start-btn');
    const timerPauseBtn     = document.getElementById('timer-pause-btn');
    const timerResumeBtn    = document.getElementById('timer-resume-btn');
    const sessionCompleteBtn = document.getElementById('session-complete-btn');
    const timerProgress     = document.getElementById('timer-progress');

    // Guided session header refs
    const guidedSessionHeader = document.getElementById('guided-session-header');
    const sessionStatusBadge  = document.getElementById('session-status-badge');
    const sessionHeaderChips  = document.getElementById('session-header-chips');
    const sessionDiscardBtn   = document.getElementById('session-discard-btn');

    // Review banner ref
    const sessionReviewBanner  = document.getElementById('session-review-banner');
    const sessionReviewSummary = document.getElementById('session-review-summary');

    // Plan reveal frame handle
    let planRevealFrame = null;

    // ── Session Store ───────────────────────────────────────────────
    function loadActiveSession() {
        try {
            const raw = sessionStorage.getItem(SESSION_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function saveActiveSession(session) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    function clearActiveSession() {
        sessionStorage.removeItem(SESSION_KEY);
    }

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function createSessionFromPlan(plan) {
        const ts = Date.now();
        return {
            id: `gs-${ts}`,
            status: 'ready',
            bodyPart: plan.bodyPart || plan.body_part || '',
            goal: plan.goal || '',
            level: plan.level || '',
            startedAt: null,
            pausedAt: null,
            completedAt: null,
            elapsedSeconds: 0,
            exercises: plan.exercises.map((ex, idx) => ({
                id: `ex-${idx}-${ts}`,
                name: ex.name,
                sets: ex.sets,
                reps: ex.reps,
                instructions: ex.instructions,
                completed: false,
                completedAt: null,
            })),
        };
    }

    // ── Timer Controller ────────────────────────────────────────────
    let timerInterval = null;

    function formatTime(seconds) {
        if (seconds >= 3600) {
            const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
            const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
            const s = String(seconds % 60).padStart(2, '0');
            return `${h}:${m}:${s}`;
        }
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        return `${m}:${s}`;
    }

    function startTimerInterval() {
        stopTimerInterval();
        timerInterval = setInterval(() => {
            const session = loadActiveSession();
            if (!session || session.status !== 'in_progress') {
                stopTimerInterval();
                return;
            }
            session.elapsedSeconds += 1;
            saveActiveSession(session);
            if (timerDisplay) timerDisplay.textContent = formatTime(session.elapsedSeconds);
        }, 1000);
    }

    function stopTimerInterval() {
        if (timerInterval !== null) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }

    // ── Session Machine ─────────────────────────────────────────────
    function startSession() {
        const session = loadActiveSession();
        if (!session || session.status !== 'ready') return;
        session.status    = 'in_progress';
        session.startedAt = formatLocalDateTime();
        saveActiveSession(session);
        startTimerInterval();
        renderGuidedSession(session);
        const spotlight = document.getElementById('current-exercise-spotlight');
        if (spotlight) spotlight.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function pauseSession() {
        const session = loadActiveSession();
        if (!session || session.status !== 'in_progress') return;
        stopTimerInterval();
        session.status   = 'paused';
        session.pausedAt = formatLocalDateTime();
        saveActiveSession(session);
        renderGuidedSession(session);
    }

    function resumeSession() {
        const session = loadActiveSession();
        if (!session || session.status !== 'paused') return;
        session.status   = 'in_progress';
        session.pausedAt = null;
        saveActiveSession(session);
        startTimerInterval();
        renderGuidedSession(session);
    }

    function toggleExerciseCompleted(exerciseId) {
        const session = loadActiveSession();
        if (!session || (session.status !== 'in_progress' && session.status !== 'paused')) return;
        const ex = session.exercises.find((e) => e.id === exerciseId);
        if (!ex) return;
        ex.completed   = !ex.completed;
        ex.completedAt = ex.completed ? formatLocalDateTime() : null;
        saveActiveSession(session);
        renderChecklist(session);
        // Fire per-item celebration after the checklist re-renders
        if (ex.completed) {
            const article = exercisePlanList
                ? exercisePlanList.querySelector(`[data-exercise-id="${exerciseId}"]`)
                : null;
            celebrateElement(article);
        }
        renderSessionControls(session);
        renderTimerProgress(session);
    }

    function enterReviewState() {
        const session = loadActiveSession();
        if (!session || (session.status !== 'in_progress' && session.status !== 'paused')) return;
        if (!session.exercises.every((e) => e.completed)) return;
        stopTimerInterval();
        session.status      = 'review';
        session.completedAt = formatLocalDateTime();
        saveActiveSession(session);

        // Auto-fill duration from elapsed time if field is empty
        if (generatedDuration && !generatedDuration.value && session.elapsedSeconds > 0) {
            generatedDuration.value = String(Math.max(1, Math.ceil(session.elapsedSeconds / 60)));
        }

        renderGuidedSession(session);
    }

    function discardSession() {
        stopTimerInterval();
        clearActiveSession();
        if (generatedDuration) generatedDuration.value = '';
        if (generatedNotes) generatedNotes.value = '';
        renderGuidedSession(null);
        setStatus(recommendationStatus, '');
        setStatus(generatedPlanStatus, '');
    }

    // ── Duration presets ────────────────────────────────────────────
    function bindDurationPresets(gridId, inputId) {
        const grid  = document.getElementById(gridId);
        const input = document.getElementById(inputId);
        if (!grid || !input) return;

        function syncActive() {
            const val = parseInt(input.value, 10);
            grid.querySelectorAll('.duration-preset-btn').forEach((btn) => {
                btn.classList.toggle('is-active', parseInt(btn.dataset.value, 10) === val);
            });
        }

        grid.addEventListener('click', (e) => {
            const btn = e.target.closest('.duration-preset-btn');
            if (!btn) return;
            input.value = btn.dataset.value;
            syncActive();
        });

        input.addEventListener('input', syncActive);
    }

    bindDurationPresets('manual-duration-presets', 'duration');
    bindDurationPresets('generated-duration-presets', 'generated-duration');

    // ── Step indicator helpers ──────────────────────────────────────
    function setActiveStep(stepNumber) {
        builderSteps.forEach((step) => {
            const n = parseInt(step.dataset.step, 10);
            step.classList.toggle('is-active', n === stepNumber);
            step.classList.toggle('is-done', n < stepNumber);
        });

        if (builderStepsTrack) {
            builderStepsTrack.dataset.activeStep = String(stepNumber);
        }

        [
            [1, stepBodyPart],
            [2, stepGoal],
            [3, stepLevel],
            [4, stepGenerate],
        ].forEach(([n, card]) => {
            if (!card) return;
            card.classList.toggle('is-current-stage', n === stepNumber);
        });
    }

    // ── Body part selection ─────────────────────────────────────────
    function activateMuscleGroup(part) {
        document.querySelectorAll('.muscle-group').forEach((group) => {
            group.classList.toggle('is-active', group.dataset.muscle === part);
        });
    }

    function selectBodyPart(part) {
        bodyPartSelect.value = part;

        bodyZoneCards.forEach((card) => {
            const isActive = card.dataset.part === part;
            card.classList.toggle('is-active', isActive);
            card.setAttribute('aria-pressed', String(isActive));
        });

        document.querySelectorAll('.body-zone').forEach((zone) => {
            const isActive = zone.dataset.part === part;
            zone.setAttribute('aria-pressed', String(isActive));
            if (isActive) pulseElement(zone);
        });

        activateMuscleGroup(part);

        const selectedCard = Array.from(bodyZoneCards).find((card) => card.dataset.part === part);
        pulseElement(selectedCard);

        updateGoalOptions(part);
        persistBuilderPreferences();
        revealStep('goal');
        setActiveStep(2);
    }

    bodyZoneCards.forEach((card) => {
        card.addEventListener('click', () => selectBodyPart(card.dataset.part));
    });

    document.querySelectorAll('.body-zone').forEach((zone) => {
        zone.addEventListener('click', () => selectBodyPart(zone.dataset.part));
    });

    // ── Goal options ────────────────────────────────────────────────
    function updateGoalOptions(bodyPart) {
        const supported = GOAL_COMPATIBILITY[bodyPart] || new Set(['strength']);
        let needsReset  = false;

        goalOptionBtns.forEach((btn) => {
            const isSupported = supported.has(btn.dataset.goal);
            btn.disabled = !isSupported;
            if (!isSupported && btn.getAttribute('aria-pressed') === 'true') {
                needsReset = true;
                btn.setAttribute('aria-pressed', 'false');
            }
        });

        if (needsReset) {
            goalSelect.value = 'strength';
            goalOptionBtns.forEach((btn) => {
                btn.setAttribute('aria-pressed', String(btn.dataset.goal === 'strength'));
            });
        }

        if (goalRestrictionNote) {
            if (supported.size < GOAL_OPTIONS.size) {
                goalRestrictionNote.textContent = 'Cardio and Endurance are only supported for Core workouts.';
                goalRestrictionNote.hidden = false;
            } else {
                goalRestrictionNote.textContent = '';
                goalRestrictionNote.hidden = true;
            }
        }
    }

    goalOptionBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            if (btn.disabled) return;
            const goal = btn.dataset.goal;
            goalSelect.value = goal;
            goalOptionBtns.forEach((b) => b.setAttribute('aria-pressed', 'false'));
            btn.setAttribute('aria-pressed', 'true');
            pulseElement(btn);
            persistBuilderPreferences();
            revealStep('level');
            setActiveStep(3);
        });
    });

    // ── Level options ───────────────────────────────────────────────
    levelOptionBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const level = btn.dataset.level;
            levelSelect.value = level;
            levelOptionBtns.forEach((b) => {
                b.classList.remove('is-active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('is-active');
            btn.setAttribute('aria-pressed', 'true');
            pulseElement(btn);
            persistBuilderPreferences();
            revealStep('generate');
            setActiveStep(4);
            refreshGenerateSummary();
        });
    });

    // ── Step reveal ─────────────────────────────────────────────────
    function revealStep(name) {
        const map = { goal: stepGoal, level: stepLevel, generate: stepGenerate };
        const el  = map[name];
        if (!el || !el.hidden) return;
        el.hidden = false;
        queueWorkoutMotionRefresh();
        el.scrollIntoView({ behavior: getMotionBehavior(), block: 'nearest' });
    }

    // ── Generate summary chips ──────────────────────────────────────
    function refreshGenerateSummary() {
        if (!generateSummary) return;
        const chips = [
            { label: 'Body Part', value: toTitleCase(bodyPartSelect.value) },
            { label: 'Goal',      value: toTitleCase(goalSelect.value) },
            { label: 'Level',     value: toTitleCase(levelSelect.value) },
        ];
        generateSummary.innerHTML = chips.map((c) => `
            <span class="generate-chip">
                <span class="generate-chip-label">${c.label}</span>
                ${c.value}
            </span>
        `).join('');
    }

    // ── Persistence ─────────────────────────────────────────────────
    function persistBuilderPreferences() {
        localStorage.setItem('recommendBodyPart', bodyPartSelect.value);
        localStorage.setItem('goal', goalSelect.value);
        localStorage.setItem('level', levelSelect.value);
    }

    function mapProfileGoalToBuilderGoal(profileGoal) {
        switch (profileGoal) {
            case 'Gain muscle':       return 'strength';
            case 'Improve endurance': return 'endurance';
            case 'Lose weight':       return 'cardio';
            default:                  return '';
        }
    }

    function getStoredGoalPreference() {
        const storedGoal = localStorage.getItem('goal');
        if (GOAL_OPTIONS.has(storedGoal)) return storedGoal;
        const rawProfile = localStorage.getItem('sweatlogic-profile');
        if (!rawProfile) return DEFAULT_GOAL;
        try {
            const profile    = JSON.parse(rawProfile);
            const mappedGoal = mapProfileGoalToBuilderGoal(profile.goal);
            return GOAL_OPTIONS.has(mappedGoal) ? mappedGoal : DEFAULT_GOAL;
        } catch {
            return DEFAULT_GOAL;
        }
    }

    function loadBuilderPreferences() {
        const availableBodyParts = new Set(Array.from(bodyZoneCards).map((c) => c.dataset.part));
        const storedBodyPart = localStorage.getItem('recommendBodyPart');
        const storedLevel    = localStorage.getItem('level');
        const storedGoal     = getStoredGoalPreference();

        const bodyPart = availableBodyParts.has(storedBodyPart) ? storedBodyPart : DEFAULT_BODY_PART;
        const level    = LEVEL_OPTIONS.has(storedLevel) ? storedLevel : DEFAULT_LEVEL;

        bodyPartSelect.value = bodyPart;
        goalSelect.value     = storedGoal;
        levelSelect.value    = level;

        bodyZoneCards.forEach((card) => {
            const active = card.dataset.part === bodyPart;
            card.classList.toggle('is-active', active);
            card.setAttribute('aria-pressed', String(active));
        });

        document.querySelectorAll('.body-zone').forEach((zone) => {
            zone.setAttribute('aria-pressed', String(zone.dataset.part === bodyPart));
        });

        activateMuscleGroup(bodyPart);

        goalOptionBtns.forEach((btn) => {
            btn.setAttribute('aria-pressed', String(btn.dataset.goal === storedGoal));
        });

        levelOptionBtns.forEach((btn) => {
            const active = btn.dataset.level === level;
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-pressed', String(active));
        });

        updateGoalOptions(bodyPart);

        if (storedBodyPart && availableBodyParts.has(storedBodyPart)) {
            stepGoal.hidden     = false;
            stepLevel.hidden    = false;
            stepGenerate.hidden = false;
            setActiveStep(4);
            refreshGenerateSummary();
        }
    }

    // ── Plan rendering helpers ──────────────────────────────────────
    function buildSummaryChips(session) {
        const chips = [
            { label: 'Body Part', value: toTitleCase(session.bodyPart) },
            { label: 'Goal',      value: toTitleCase(session.goal) },
            { label: 'Level',     value: toTitleCase(session.level) },
            { label: 'Exercises', value: String(session.exercises.length) },
        ];
        return chips.map((chip, index) => `
            <div class="plan-summary-chip" style="--plan-delay:${120 + (index * 80)}ms">
                <span>${chip.label}</span>
                <strong>${chip.value}</strong>
            </div>
        `).join('');
    }

    function setOutputPanelState(state = 'idle') {
        if (!outputPanel) return;
        outputPanel.classList.toggle('is-generating', state === 'generating');
        outputPanel.classList.toggle('is-plan-ready', state === 'ready');
    }

    function revealGeneratedPlan() {
        if (!generatedPlanPanel) return;
        generatedPlanPanel.classList.remove('is-plan-visible');
        if (planRevealFrame) cancelAnimationFrame(planRevealFrame);
        planRevealFrame = requestAnimationFrame(() => {
            generatedPlanPanel.classList.add('is-plan-visible');
        });
    }

    // ── Renderer ────────────────────────────────────────────────────
    function renderTimer(session) {
        if (!sessionTimer) return;
        const secs   = session ? session.elapsedSeconds : 0;
        const status = session ? session.status : null;

        if (timerDisplay) timerDisplay.textContent = formatTime(secs);

        sessionTimer.classList.toggle('is-running', status === 'in_progress');
        sessionTimer.classList.toggle('is-paused',  status === 'paused');
        sessionTimer.classList.toggle('is-review',  status === 'review');
    }

    function renderTimerProgress(session) {
        if (!timerProgress) return;
        if (!session) {
            timerProgress.textContent = '';
            timerProgress.style.setProperty('--timer-progress-value', '0');
            if (sessionTimer) sessionTimer.classList.remove('is-complete');
            return;
        }

        const total    = session.exercises.length;
        const done     = session.exercises.filter((e) => e.completed).length;
        const progress = total > 0 ? done / total : 0;
        const isComplete = total > 0 && done === total;
        const wasComplete = sessionTimer ? sessionTimer.classList.contains('is-complete') : false;

        timerProgress.textContent = '';
        timerProgress.style.setProperty('--timer-progress-value', progress.toFixed(3));
        const progressLabel = document.getElementById('timer-progress-label');
        if (progressLabel) progressLabel.textContent = total > 0 ? `${done} / ${total}` : '';

        if (sessionTimer) sessionTimer.classList.toggle('is-complete', isComplete);
        if (isComplete && !wasComplete) celebrateElement(sessionTimer);
    }

    function renderSessionControls(session) {
        const status = session ? session.status : null;

        if (timerStartBtn)  timerStartBtn.hidden  = status !== 'ready';
        if (timerPauseBtn)  timerPauseBtn.hidden  = status !== 'in_progress';
        if (timerResumeBtn) timerResumeBtn.hidden = status !== 'paused';

        if (sessionCompleteBtn) {
            const showComplete = status === 'in_progress' || status === 'paused';
            sessionCompleteBtn.hidden = !showComplete;
            if (showComplete) {
                const allDone = session.exercises.every((e) => e.completed);
                sessionCompleteBtn.disabled = !allDone;
                sessionCompleteBtn.classList.toggle('is-ready', allDone);
            } else {
                sessionCompleteBtn.classList.remove('is-ready');
            }
        }
    }

    function renderChecklist(session) {
        if (!exercisePlanList) return;
        if (!session) { exercisePlanList.innerHTML = ''; return; }

        const locked = session.status === 'review' || session.status === 'completed';
        const checkSvg = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="2 6 5 9 10 3"/></svg>`;

        exercisePlanList.innerHTML = session.exercises.map((ex, index) => {
            const doneClass   = ex.completed ? ' is-done' : '';
            const lockedClass = locked ? ' is-locked' : '';
            const btnText     = ex.completed ? 'Done' : 'Mark Done';
            const btnHidden   = locked ? ' hidden' : '';

            return `
                <article class="exercise-plan-item${doneClass}${lockedClass}" data-exercise-id="${escapeHtml(ex.id)}" style="--plan-delay:${320 + (index * 90)}ms">
                    <div class="exercise-plan-header">
                        <div>
                            <span class="exercise-plan-step">Exercise ${index + 1}</span>
                            <h4>${escapeHtml(ex.name)}</h4>
                        </div>
                        <div class="exercise-plan-meta">
                            <span>${escapeHtml(String(ex.sets))} sets</span>
                            <strong>${escapeHtml(String(ex.reps))}</strong>
                        </div>
                    </div>
                    <p>${escapeHtml(ex.instructions)}</p>
                    <button type="button" class="exercise-done-btn" data-exercise-id="${escapeHtml(ex.id)}"${btnHidden}>
                        ${checkSvg} ${btnText}
                    </button>
                </article>
            `;
        }).join('');

        // ── Spotlight card ───────────────────────────────────────────
        const spotlight     = document.getElementById('current-exercise-spotlight');
        const spotName      = document.getElementById('spotlight-name');
        const spotMeta      = document.getElementById('spotlight-meta');
        const spotInstr     = document.getElementById('spotlight-instructions');
        const spotNext      = document.getElementById('spotlight-next');
        const spotComplBtn  = document.getElementById('spotlight-complete-btn');

        const showSpotlight = session.status === 'in_progress' || session.status === 'paused';
        const firstIncomplete = session.exercises.find((e) => !e.completed);

        if (spotlight) {
            spotlight.classList.toggle('is-active', showSpotlight && !!firstIncomplete);
        }

        if (showSpotlight && firstIncomplete && spotName && spotMeta && spotInstr && spotNext) {
            spotName.textContent  = firstIncomplete.name;
            spotMeta.textContent  = `${firstIncomplete.sets} sets · ${firstIncomplete.reps} reps`;
            spotInstr.textContent = firstIncomplete.instructions;

            const nextEx = session.exercises.find((e) => !e.completed && e.id !== firstIncomplete.id);
            spotNext.textContent = nextEx ? `Next up: ${nextEx.name}` : 'Last exercise — finish strong!';

            if (spotComplBtn) {
                spotComplBtn.onclick = () => toggleExerciseCompleted(firstIncomplete.id);
            }
        }
    }

    function renderCompletionActions(session) {
        const actionsEl = generatedPlanPanel
            ? generatedPlanPanel.querySelector('.generated-plan-actions')
            : null;

        const status = session ? session.status : null;

        // Completion save form — only visible in review
        if (actionsEl) actionsEl.hidden = status !== 'review';

        // Review banner
        if (sessionReviewBanner) {
            sessionReviewBanner.hidden = status !== 'review';
            if (status === 'review' && sessionReviewSummary) {
                const done    = session.exercises.length;
                const elapsed = formatTime(session.elapsedSeconds);
                sessionReviewSummary.textContent =
                    `${done} of ${done} exercises completed · ${elapsed} elapsed`;
            }
        }

        // Save button label — only update when entering review
        if (completeGeneratedButton && status === 'review') {
            completeGeneratedButton.textContent = 'Save Session';
        }
    }

    function renderSessionChrome(session) {
        const hasActiveSession = !!(session && session.status !== 'completed');

        // Guided session header
        if (guidedSessionHeader) {
            guidedSessionHeader.hidden = !hasActiveSession;
            if (hasActiveSession) {
                if (sessionStatusBadge) {
                    const labels = {
                        ready:       'Ready',
                        in_progress: 'In Progress',
                        paused:      'Paused',
                        review:      'Review',
                    };
                    sessionStatusBadge.textContent   = labels[session.status] || session.status;
                    sessionStatusBadge.dataset.status = session.status;
                }
                if (sessionHeaderChips) {
                    sessionHeaderChips.innerHTML = [
                        toTitleCase(session.bodyPart),
                        toTitleCase(session.goal),
                        toTitleCase(session.level),
                    ].map((label) => `<span class="session-chip">${label}</span>`).join('');
                }
            }
        }

        // Hide guided builder while session is active; collapse the path-chooser guided card
        const builderEl = guidedPath ? guidedPath.querySelector('.guided-builder') : null;
        if (builderEl) builderEl.hidden = hasActiveSession;

        // Mark the split wrapper so CSS can respond
        if (guidedSplit) guidedSplit.classList.toggle('has-active-session', hasActiveSession);

        // Disable the guided path-card in the chooser when session is active
        if (pathChooser) pathChooser.classList.toggle('has-active-session', hasActiveSession);
    }

    function syncWorkoutBgState(session) {
        const body = document.body;
        body.classList.remove('state-idle', 'state-active', 'state-completed');
        if (!session || session.status === 'completed') {
            body.classList.add('state-idle');
        } else if (session.status === 'review') {
            body.classList.add('state-completed');
        } else {
            // ready, in_progress, paused
            body.classList.add('state-active');
        }
    }

    function renderGuidedSession(session) {
        syncWorkoutBgState(session);
        renderSessionChrome(session);

        if (!session) {
            // No session — reset output panel to empty state
            setOutputPanelState('idle');
            if (outputTitle) outputTitle.textContent = 'Your Session';
            if (outputCopy) outputCopy.textContent = 'Complete the steps on the left to generate your personalized workout plan.';
            if (emptyState) emptyState.hidden = false;
            if (generatedPlanPanel) {
                generatedPlanPanel.classList.remove('is-plan-visible');
                generatedPlanPanel.hidden = true;
            }
            if (planSummaryGrid) planSummaryGrid.innerHTML = '';
            renderChecklist(null);
            renderTimer(null);
            renderTimerProgress(null);
            renderSessionControls(null);
            if (sessionReviewBanner) sessionReviewBanner.hidden = true;
            if (generatedPlanPanel) {
                const actionsEl = generatedPlanPanel.querySelector('.generated-plan-actions');
                if (actionsEl) actionsEl.hidden = true;
            }
            updateSwitchLink('guided');
            return;
        }

        // Active session
        setOutputPanelState('ready');
        if (outputTitle) outputTitle.textContent = `${toTitleCase(session.bodyPart)} Workout`;
        if (outputCopy) outputCopy.textContent = '';
        if (emptyState) emptyState.hidden = true;
        if (generatedPlanPanel) {
            const wasHidden = generatedPlanPanel.hidden;
            generatedPlanPanel.hidden = false;
            if (wasHidden) revealGeneratedPlan();
        }
        if (planSummaryGrid) planSummaryGrid.innerHTML = buildSummaryChips(session);

        renderTimer(session);
        renderTimerProgress(session);
        renderSessionControls(session);
        renderChecklist(session);
        renderCompletionActions(session);

        // Auto-fill duration when restoring a review session with an empty field
        if (session.status === 'review' && generatedDuration && !generatedDuration.value && session.elapsedSeconds > 0) {
            generatedDuration.value = String(Math.max(1, Math.ceil(session.elapsedSeconds / 60)));
        }

        updateSwitchLink('guided');
    }

    // ── Session event bindings ──────────────────────────────────────
    if (timerStartBtn)     timerStartBtn.addEventListener('click', startSession);
    if (timerPauseBtn)     timerPauseBtn.addEventListener('click', pauseSession);
    if (timerResumeBtn)    timerResumeBtn.addEventListener('click', resumeSession);
    if (sessionCompleteBtn) sessionCompleteBtn.addEventListener('click', enterReviewState);

    if (sessionDiscardBtn) {
        sessionDiscardBtn.addEventListener('click', () => {
            if (window.confirm('Discard this session? Your progress will not be saved.')) {
                discardSession();
            }
        });
    }

    if (exercisePlanList) {
        exercisePlanList.addEventListener('click', (e) => {
            const btn = e.target.closest('.exercise-done-btn');
            if (!btn) return;
            const exerciseId = btn.dataset.exerciseId;
            if (exerciseId) toggleExerciseCompleted(exerciseId);
        });
    }

    // ── Generate plan ───────────────────────────────────────────────
    async function generatePlan() {
        const existing = loadActiveSession();
        if (existing && existing.status !== 'completed') {
            setStatus(recommendationStatus, 'Finish or discard your current session before generating a new plan.', 'error');
            return;
        }

        const bodyPart = bodyPartSelect.value;
        const goal     = goalSelect.value;
        const level    = levelSelect.value;

        persistBuilderPreferences();
        setOutputPanelState('generating');
        setStatus(recommendationStatus, '');
        setStatus(generatedPlanStatus, '');
        setLoading(generateButton, true, 'Generating Plan\u2026', 'Generate Workout Plan');

        try {
            const plan = await requestApi(
                `/recommendations/generate/${encodeURIComponent(bodyPart)}?goal=${encodeURIComponent(goal)}&level=${encodeURIComponent(level)}`
            );

            if (!plan || !Array.isArray(plan.exercises) || plan.exercises.length === 0) {
                throw new Error('The recommendation service returned an empty workout plan.');
            }

            const session = createSessionFromPlan(plan);
            saveActiveSession(session);
            renderGuidedSession(session);
            setStatus(recommendationStatus, 'Workout plan ready \u2014 start the timer when you\'re ready to begin.', 'success');
        } catch (error) {
            setOutputPanelState('idle');
            setStatus(recommendationStatus, error.message || 'Unable to generate a workout plan right now.', 'error');
        } finally {
            setLoading(generateButton, false, 'Generating Plan\u2026', 'Generate Workout Plan');
        }
    }

    generateButton.addEventListener('click', generatePlan);

    // ── Save session (review → completed) ──────────────────────────
    function buildSaveNotes(session, userNotes) {
        const exerciseNames = session.exercises.map((e) => e.name).join(', ');
        const summary = [
            `Generated ${toTitleCase(session.bodyPart)} plan`,
            `goal: ${toTitleCase(session.goal)}`,
            `level: ${toTitleCase(session.level)}`,
            `exercises: ${exerciseNames}`,
        ].join(' | ');
        const trimmed = userNotes.trim();
        return trimmed ? `${summary} | notes: ${trimmed}` : summary;
    }

    function inferWorkoutType(session) {
        if (!session || !session.exercises || session.exercises.length === 0) return 'other';
        if (session.goal === 'strength') return 'weights';
        return 'other';
    }

    completeGeneratedButton.addEventListener('click', async () => {
        const session = loadActiveSession();
        if (!session || session.status !== 'review') {
            setStatus(generatedPlanStatus, 'Complete all exercises and enter review before saving.', 'error');
            return;
        }

        // Auto-fill from timer if blank
        if (generatedDuration && !generatedDuration.value && session.elapsedSeconds > 0) {
            generatedDuration.value = String(Math.max(1, Math.ceil(session.elapsedSeconds / 60)));
        }

        const durationValue = parseInt(generatedDuration.value, 10);
        if (!Number.isFinite(durationValue) || durationValue <= 0) {
            setStatus(generatedPlanStatus, 'Enter a valid duration before saving.', 'error');
            if (generatedDuration) generatedDuration.focus();
            return;
        }

        setStatus(generatedPlanStatus, '');
        setLoading(completeGeneratedButton, true, 'Saving\u2026', 'Save Session');

        const payload = {
            type:     inferWorkoutType(session),
            duration: durationValue,
            notes:    buildSaveNotes(session, generatedNotes ? generatedNotes.value : ''),
            date:     formatLocalDateTime(),
        };

        try {
            await requestApi('/workouts', { method: 'POST', body: JSON.stringify(payload) });
            clearActiveSession();
            stopTimerInterval();
            renderGuidedSession(null);
            setStatus(recommendationStatus, 'Session saved to your workout history.', 'success');
        } catch (error) {
            setStatus(generatedPlanStatus, error.message || 'Unable to save the session.', 'error');
        } finally {
            setLoading(completeGeneratedButton, false, 'Saving\u2026', 'Save Session');
        }
    });

    // ── Manual log ──────────────────────────────────────────────────
    const manualForm        = document.getElementById('workout-form');
    const workoutTypeSelect = document.getElementById('workout-type');
    const manualDuration    = document.getElementById('duration');
    const manualNotes       = document.getElementById('notes');
    const manualSaveStatus  = document.getElementById('manual-save-status');

    document.querySelectorAll('input[name="workout-type-radio"]').forEach((radio) => {
        radio.addEventListener('change', () => {
            if (workoutTypeSelect) workoutTypeSelect.value = radio.value;
        });
    });

    manualForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const payload = {
            type:     workoutTypeSelect ? workoutTypeSelect.value : 'other',
            duration: parseInt(manualDuration.value, 10),
            notes:    manualNotes.value,
            date:     formatLocalDateTime(),
        };

        const submitBtn = manualForm.querySelector('[type="submit"]');
        setLoading(submitBtn, true, 'Saving\u2026', 'Save Workout');
        setStatus(manualSaveStatus, '');

        try {
            await requestApi('/workouts', { method: 'POST', body: JSON.stringify(payload) });
            setStatus(manualSaveStatus, 'Workout saved to your history.', 'success');
            celebrateElement(manualForm.closest('.manual-log-card'));
            const firstRadio = manualForm.querySelector('input[name="workout-type-radio"]');
            if (firstRadio) {
                manualForm.querySelectorAll('input[name="workout-type-radio"]').forEach((r) => { r.checked = false; });
                firstRadio.checked = true;
                if (workoutTypeSelect) workoutTypeSelect.value = firstRadio.value;
            }
            manualDuration.value = '';
            manualNotes.value    = '';
        } catch (error) {
            setStatus(manualSaveStatus, error.message || 'Error saving workout.', 'error');
        } finally {
            setLoading(submitBtn, false, 'Saving\u2026', 'Save Workout');
        }
    });

    // ── Init ────────────────────────────────────────────────────────
    setActiveStep(1);

    const storedPath = localStorage.getItem(LAST_PATH_KEY);
    const restoredSession = loadActiveSession();

    if (restoredSession) {
        // Always land on guided path when a session is active
        activatePath('guided', { animate: false });
        loadBuilderPreferences();
        persistBuilderPreferences();
        renderGuidedSession(restoredSession);
        if (restoredSession.status === 'in_progress') {
            startTimerInterval();
        }
    } else {
        if (storedPath === 'guided' || storedPath === 'manual') {
            activatePath(storedPath, { animate: false });
        } else {
            if (pathChooser) pathChooser.classList.add('is-deciding');
            document.body.classList.add('is-deciding');
        }
        loadBuilderPreferences();
        persistBuilderPreferences();
        renderGuidedSession(null);
    }
});
