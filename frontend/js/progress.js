document.addEventListener('DOMContentLoaded', async () => {
    try {
        const workouts = await apiFetch('/workouts');
        // TODO: render charts using workouts data
        console.log('Loaded workouts for progress:', workouts.length);
    } catch (err) {
        console.error('Failed to load progress data:', err);
    }
});
