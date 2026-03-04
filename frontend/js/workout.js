// ---------------------------------------------------------------------------
// State — tracks the user's current selections and the active workout plan
// ---------------------------------------------------------------------------
const state = {
    goal:      'strength',
    level:     'intermediate',
    bodyPart:  null,          // required before generating
    plan:      null,          // WorkoutPlan returned by the API
};

// ---------------------------------------------------------------------------
// DOM refs
// ---------------------------------------------------------------------------
const generateBtn   = document.getElementById('generate-btn');
const regenerateBtn = document.getElementById('regenerate-btn');
const completeBtn   = document.getElementById('complete-btn');
const planSection   = document.getElementById('plan-section');
const exerciseList  = document.getElementById('exercise-list');
const planTitle     = document.getElementById('plan-title');
const planSubtitle  = document.getElementById('plan-subtitle');
const durationInput = document.getElementById('duration-input');
const completeMsg   = document.getElementById('complete-msg');
const configError   = document.getElementById('config-error');

// ---------------------------------------------------------------------------
// Toggle-button groups
// Each group allows exactly one active selection at a time.
// ---------------------------------------------------------------------------
function initToggleGroup(groupId, stateKey, onSelect) {
    const group = document.getElementById(groupId);
    group.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            group.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state[stateKey] = btn.dataset.value;
            if (onSelect) onSelect();
        });
    });
}

function onBodyPartSelected() {
    generateBtn.textContent = `Generate ${capitalise(state.bodyPart)} Workout`;
    generateBtn.disabled = false;
    configError.textContent = '';
}

initToggleGroup('goal-group',     'goal',     null);
initToggleGroup('level-group',    'level',    null);
initToggleGroup('bodypart-group', 'bodyPart', onBodyPartSelected);

// ---------------------------------------------------------------------------
// Generate workout — calls the recommendation API and renders the plan
// ---------------------------------------------------------------------------
generateBtn.addEventListener('click', () => fetchAndRender());
regenerateBtn.addEventListener('click', () => fetchAndRender());

async function fetchAndRender() {
    if (!state.bodyPart) return;

    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating…';
    configError.textContent = '';
    clearPlan();

    try {
        const plan = await apiFetch(
            `/recommendations/generate/${state.bodyPart}?goal=${state.goal}&level=${state.level}`
        );
        state.plan = plan;
        renderPlan(plan);
    } catch (err) {
        configError.textContent = 'Could not reach the server. Make sure the backend is running.';
        console.error('Generate failed:', err);
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = `Generate ${capitalise(state.bodyPart)} Workout`;
    }
}

// ---------------------------------------------------------------------------
// Render the WorkoutPlan returned by the API
// ---------------------------------------------------------------------------
function renderPlan(plan) {
    // Header
    planTitle.textContent =
        `${capitalise(plan.bodyPart)} — ${capitalise(plan.goal)} Day`;
    planSubtitle.textContent =
        `${capitalise(plan.level)} · ${plan.exercises.length} exercises`;

    // Exercise cards
    plan.exercises.forEach((ex, i) => {
        const card = document.createElement('div');
        card.className = 'card exercise-card';
        card.innerHTML = `
            <div class="exercise-header">
                <span class="exercise-number">${i + 1}</span>
                <div class="exercise-meta">
                    <h3 class="exercise-name">${ex.name}</h3>
                    <span class="exercise-badge">${ex.sets} sets &times; ${ex.reps}</span>
                </div>
            </div>
            <p class="exercise-instructions">${ex.instructions}</p>
        `;
        exerciseList.appendChild(card);
    });

    // Show the plan section, reset completion state
    planSection.classList.remove('hidden');
    completeMsg.textContent = '';
    completeBtn.disabled = false;
    completeBtn.textContent = 'Complete Workout';
    durationInput.value = '';

    // Scroll to plan smoothly
    planSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function clearPlan() {
    exerciseList.innerHTML = '';
    planSection.classList.add('hidden');
    state.plan = null;
}

// ---------------------------------------------------------------------------
// Complete workout — POSTs a log entry to /api/workouts
// ---------------------------------------------------------------------------
completeBtn.addEventListener('click', async () => {
    if (!state.plan) return;

    const duration = parseInt(durationInput.value, 10);
    if (!duration || duration < 1) {
        completeMsg.textContent = 'Please enter how many minutes the workout took.';
        completeMsg.style.color = '#e94560';
        return;
    }

    completeBtn.disabled = true;
    completeBtn.textContent = 'Saving…';
    completeMsg.textContent = '';

    // Build a human-readable notes string from the exercise list
    const exerciseNames = state.plan.exercises.map(e => e.name).join(', ');
    const notes = `${capitalise(state.plan.bodyPart)} workout (${state.plan.goal}): ${exerciseNames}`;

    // Map goal → workout type for the log entry
    const typeMap = { cardio: 'cardio', endurance: 'cardio', strength: 'weights' };
    const type = typeMap[state.plan.goal] || 'other';

    try {
        await apiFetch('/workouts', {
            method: 'POST',
            body: JSON.stringify({
                type,
                duration,
                notes,
                date: new Date().toISOString(),
            }),
        });

        completeBtn.textContent = 'Workout Logged!';
        completeMsg.textContent = `Saved: ${duration} min ${capitalise(state.plan.bodyPart)} session.`;
        completeMsg.style.color = '#2a9d5c';
    } catch (err) {
        completeBtn.disabled = false;
        completeBtn.textContent = 'Complete Workout';
        completeMsg.textContent = 'Failed to save. Is the backend running?';
        completeMsg.style.color = '#e94560';
        console.error('Complete workout failed:', err);
    }
});

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------
function capitalise(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
