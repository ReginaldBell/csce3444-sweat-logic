document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('settings-form');
    const status = document.getElementById('settings-status');
    const goalOptions = new Set(['strength', 'cardio', 'endurance']);
    const levelOptions = new Set(['beginner', 'intermediate', 'advanced']);

    // Load saved settings
    form.username.value = localStorage.getItem('username') || '';
    form.unit.value = localStorage.getItem('unit') || 'imperial';
    form.goal.value = goalOptions.has(localStorage.getItem('goal')) ? localStorage.getItem('goal') : 'strength';
    form.level.value = levelOptions.has(localStorage.getItem('level')) ? localStorage.getItem('level') : 'intermediate';

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        localStorage.setItem('username', form.username.value);
        localStorage.setItem('unit', form.unit.value);
        localStorage.setItem('goal', form.goal.value);
        localStorage.setItem('level', form.level.value);
        if (status) {
            status.textContent = 'Settings saved locally and synced with the workout recommendation builder.';
            status.classList.remove('is-error');
            status.classList.add('is-success');
            status.classList.add('is-visible');
        }

        if (typeof window.refreshMotion === 'function') {
            window.refreshMotion();
        }
    });
});
