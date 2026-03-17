document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('settings-form');
    const status = document.getElementById('settings-status');

    // Load saved settings
    form.username.value = localStorage.getItem('username') || '';
    form.unit.value = localStorage.getItem('unit') || 'imperial';

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        localStorage.setItem('username', form.username.value);
        localStorage.setItem('unit', form.unit.value);
        if (status) {
            status.textContent = 'Settings saved locally and ready across the app.';
            status.classList.add('is-visible');
        }

        if (typeof window.refreshMotion === 'function') {
            window.refreshMotion();
        }
    });
});
