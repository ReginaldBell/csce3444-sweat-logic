document.addEventListener('DOMContentLoaded', () => {
    const WORKOUT_API_BASE = 'http://localhost:8080/api';
    const DEFAULT_BODY_PART = 'chest';
    const DEFAULT_GOAL = 'strength';
    const DEFAULT_LEVEL = 'intermediate';
    const GOAL_OPTIONS = new Set(['strength', 'cardio', 'endurance']);
    const LEVEL_OPTIONS = new Set(['beginner', 'intermediate', 'advanced']);

    const manualForm = document.getElementById('workout-form');
    const workoutType = document.getElementById('workout-type');
    const manualDuration = document.getElementById('duration');
    const manualNotes = document.getElementById('notes');

    const bodyPartSelect = document.getElementById('recommend-body-part');
    const bodyPartSelector = document.getElementById('body-part-selector');
    const goalSelect = document.getElementById('recommend-goal');
    const levelSelect = document.getElementById('recommend-level');
    const generateButton = document.getElementById('generate-plan-btn');
    const recommendationStatus = document.getElementById('recommendation-status');

    const outputTitle = document.getElementById('plan-output-title');
    const outputCopy = document.getElementById('plan-output-copy');
    const emptyState = document.getElementById('workout-empty-state');
    const generatedPlanPanel = document.getElementById('generated-plan-panel');
    const planSummaryGrid = document.getElementById('plan-summary-grid');
    const exercisePlanList = document.getElementById('exercise-plan-list');
    const generatedDuration = document.getElementById('generated-duration');
    const generatedNotes = document.getElementById('generated-notes');
    const completeGeneratedButton = document.getElementById('complete-generated-btn');
    const generatedPlanStatus = document.getElementById('generated-plan-status');

    let currentPlan = null;

    function formatLocalDateTime(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    }

    async function requestApi(path, options = {}) {
        const response = await fetch(`${WORKOUT_API_BASE}${path}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
            },
            ...options,
        });

        if (response.status === 204) {
            return null;
        }

        const contentType = response.headers.get('content-type') || '';
        const payload = contentType.includes('application/json')
            ? await response.json()
            : await response.text();

        if (!response.ok) {
            const message = typeof payload === 'string' && payload.trim()
                ? payload.trim()
                : `Request failed: ${response.status}`;
            const error = new Error(message);
            error.status = response.status;
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
        if (!element) {
            return;
        }

        element.textContent = message || '';
        element.classList.remove('is-visible', 'is-error', 'is-success');

        if (!message) {
            return;
        }

        element.classList.add('is-visible', tone === 'error' ? 'is-error' : 'is-success');
    }

    function setLoading(button, isLoading, loadingText, defaultText) {
        if (!button) {
            return;
        }

        button.disabled = isLoading;
        button.textContent = isLoading ? loadingText : defaultText;
    }

    function persistBuilderPreferences() {
        localStorage.setItem('recommendBodyPart', bodyPartSelect.value);
        localStorage.setItem('goal', goalSelect.value);
        localStorage.setItem('level', levelSelect.value);
    }

    function mapProfileGoalToBuilderGoal(profileGoal) {
        switch (profileGoal) {
            case 'Gain muscle':
                return 'strength';
            case 'Improve endurance':
                return 'endurance';
            case 'Lose weight':
                return 'cardio';
            default:
                return '';
        }
    }

    function getStoredGoalPreference() {
        const storedGoal = localStorage.getItem('goal');
        if (GOAL_OPTIONS.has(storedGoal)) {
            return storedGoal;
        }

        const rawProfile = localStorage.getItem('sweatlogic-profile');
        if (!rawProfile) {
            return DEFAULT_GOAL;
        }

        try {
            const profile = JSON.parse(rawProfile);
            const mappedGoal = mapProfileGoalToBuilderGoal(profile.goal);
            return GOAL_OPTIONS.has(mappedGoal) ? mappedGoal : DEFAULT_GOAL;
        } catch {
            return DEFAULT_GOAL;
        }
    }

    function syncActiveBodyPartButton(selectedBodyPart) {
        if (!bodyPartSelector) {
            return;
        }

        bodyPartSelector.querySelectorAll('.body-part-btn').forEach((button) => {
            button.classList.toggle('is-active', button.dataset.part === selectedBodyPart);
        });
    }

    function loadBuilderPreferences() {
        const availableBodyParts = new Set(
            Array.from(bodyPartSelector.querySelectorAll('.body-part-btn')).map((button) => button.dataset.part)
        );
        const storedBodyPart = localStorage.getItem('recommendBodyPart');
        const storedLevel = localStorage.getItem('level');

        bodyPartSelect.value = availableBodyParts.has(storedBodyPart) ? storedBodyPart : DEFAULT_BODY_PART;
        goalSelect.value = getStoredGoalPreference();
        levelSelect.value = LEVEL_OPTIONS.has(storedLevel) ? storedLevel : DEFAULT_LEVEL;
        syncActiveBodyPartButton(bodyPartSelect.value);
    }

    function renderEmptyState() {
        currentPlan = null;
        outputTitle.textContent = 'Recommended Session';
        outputCopy.textContent = 'Generate a plan on the left to see live exercises here, or keep using the manual logger for running, cycling, weights, and other workouts.';
        emptyState.hidden = false;
        generatedPlanPanel.hidden = true;
        planSummaryGrid.innerHTML = '';
        exercisePlanList.innerHTML = '';
        generatedDuration.value = '';
        generatedNotes.value = '';
        setStatus(generatedPlanStatus, '');
        if (typeof window.refreshMotion === 'function') {
            window.refreshMotion();
        }
    }

    function buildSummaryChips(plan) {
        const chips = [
            { label: 'Body Part', value: toTitleCase(plan.bodyPart) },
            { label: 'Goal', value: toTitleCase(plan.goal) },
            { label: 'Level', value: toTitleCase(plan.level) },
            { label: 'Exercises', value: String(plan.exercises.length) },
        ];

        return chips.map((chip) => `
            <div class="plan-summary-chip">
                <span>${chip.label}</span>
                <strong>${chip.value}</strong>
            </div>
        `).join('');
    }

    function buildExerciseMarkup(exercise, index) {
        return `
            <article class="exercise-plan-item">
                <div class="exercise-plan-header">
                    <div>
                        <span class="exercise-plan-step">Exercise ${index + 1}</span>
                        <h4>${exercise.name}</h4>
                    </div>
                    <div class="exercise-plan-meta">
                        <span>${exercise.sets} sets</span>
                        <strong>${exercise.reps}</strong>
                    </div>
                </div>
                <p>${exercise.instructions}</p>
            </article>
        `;
    }

    function renderPlan(plan) {
        currentPlan = plan;
        outputTitle.textContent = `${toTitleCase(plan.bodyPart)} Workout Plan`;
        outputCopy.textContent = `This ${plan.goal} plan is tailored for a ${plan.level} athlete and includes ${plan.exercises.length} recommended exercises.`;
        emptyState.hidden = true;
        generatedPlanPanel.hidden = false;
        planSummaryGrid.innerHTML = buildSummaryChips(plan);
        exercisePlanList.innerHTML = plan.exercises.map(buildExerciseMarkup).join('');
        generatedDuration.value = '';
        generatedNotes.value = '';
        setStatus(generatedPlanStatus, '');
        if (typeof window.refreshMotion === 'function') {
            window.refreshMotion();
        }
    }

    function buildGeneratedWorkoutNotes(plan, userNotes) {
        const exerciseNames = plan.exercises.map((exercise) => exercise.name).join(', ');
        const summary = [
            `Generated ${toTitleCase(plan.bodyPart)} plan`,
            `goal: ${toTitleCase(plan.goal)}`,
            `level: ${toTitleCase(plan.level)}`,
            `exercises: ${exerciseNames}`,
        ].join(' | ');

        const trimmedNotes = userNotes.trim();
        return trimmedNotes ? `${summary} | notes: ${trimmedNotes}` : summary;
    }

    async function generatePlan() {
        const bodyPart = bodyPartSelect.value;
        const goal = goalSelect.value;
        const level = levelSelect.value;

        persistBuilderPreferences();
        setStatus(recommendationStatus, '');
        setStatus(generatedPlanStatus, '');
        setLoading(generateButton, true, 'Generating Plan...', 'Generate Plan');

        try {
            const plan = await requestApi(
                `/recommendations/generate/${encodeURIComponent(bodyPart)}?goal=${encodeURIComponent(goal)}&level=${encodeURIComponent(level)}`
            );

            if (!plan || !Array.isArray(plan.exercises) || plan.exercises.length === 0) {
                throw new Error('The recommendation service returned an empty workout plan.');
            }

            renderPlan(plan);
            setStatus(recommendationStatus, 'Workout plan ready. Review the exercises and complete it when you finish.', 'success');
        } catch (error) {
            renderEmptyState();
            setStatus(recommendationStatus, error.message || 'Unable to generate a workout plan right now.', 'error');
        } finally {
            setLoading(generateButton, false, 'Generating Plan...', 'Generate Plan');
        }
    }

    function handlePreferenceChange() {
        persistBuilderPreferences();
        if (currentPlan) {
            generatePlan();
        } else {
            setStatus(recommendationStatus, 'Builder settings updated. Click Generate Plan to load a workout.', 'success');
        }
    }

    if (bodyPartSelector) {
        bodyPartSelector.addEventListener('click', (event) => {
            const button = event.target.closest('.body-part-btn');
            if (!button) {
                return;
            }

            bodyPartSelect.value = button.dataset.part;
            syncActiveBodyPartButton(button.dataset.part);
            generatePlan();
        });
    }

    generateButton.addEventListener('click', generatePlan);
    goalSelect.addEventListener('change', handlePreferenceChange);
    levelSelect.addEventListener('change', handlePreferenceChange);

    completeGeneratedButton.addEventListener('click', async () => {
        if (!currentPlan) {
            setStatus(generatedPlanStatus, 'Generate a plan before trying to complete it.', 'error');
            return;
        }

        const durationValue = parseInt(generatedDuration.value, 10);
        if (!Number.isFinite(durationValue) || durationValue <= 0) {
            setStatus(generatedPlanStatus, 'Enter a valid duration before saving the generated workout.', 'error');
            generatedDuration.focus();
            return;
        }

        setStatus(generatedPlanStatus, '');
        setLoading(completeGeneratedButton, true, 'Saving Workout...', 'Complete Generated Workout');

        const payload = {
            type: 'weights',
            duration: durationValue,
            notes: buildGeneratedWorkoutNotes(currentPlan, generatedNotes.value),
            date: formatLocalDateTime(),
        };

        try {
            await requestApi('/workouts', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            setStatus(recommendationStatus, 'Generated plan completed and saved to your workout history.', 'success');
            renderEmptyState();
        } catch (error) {
            setStatus(generatedPlanStatus, error.message || 'Unable to save the generated workout.', 'error');
        } finally {
            setLoading(completeGeneratedButton, false, 'Saving Workout...', 'Complete Generated Workout');
        }
    });

    manualForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const payload = {
            type: workoutType.value,
            duration: parseInt(manualDuration.value, 10),
            notes: manualNotes.value,
            date: formatLocalDateTime(),
        };

        try {
            await requestApi('/workouts', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            alert('Workout saved!');
            workoutType.value = 'running';
            manualDuration.value = '';
            manualNotes.value = '';
        } catch (error) {
            console.error('Failed to save workout:', error);
            alert(error.message || 'Error saving workout.');
        }
    });

    loadBuilderPreferences();
    persistBuilderPreferences();
    renderEmptyState();
});
