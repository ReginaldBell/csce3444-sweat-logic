document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('settings-form');

    // Load saved settings
    form.username.value = localStorage.getItem('username') || '';
    form.unit.value = localStorage.getItem('unit') || 'imperial';

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        localStorage.setItem('username', form.username.value);
        localStorage.setItem('unit', form.unit.value);
        alert('Settings saved!');
    });
});
