document.addEventListener('DOMContentLoaded', async () => {
    try {
        const workouts = await apiFetch('/workouts');
        const list = document.getElementById('workout-list');
        workouts.slice(0, 5).forEach(w => {
            const li = document.createElement('li');
            li.textContent = `${w.type} — ${w.duration} min`;
            list.appendChild(li);
        });

        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const weeklyWorkouts = workouts.filter(w => new Date(w.date) >= oneWeekAgo);
        document.getElementById('total-workouts').textContent = weeklyWorkouts.length;
        const totalDuration = weeklyWorkouts.reduce((sum, w) => sum + w.duration, 0);
        document.getElementById('total-duration').textContent = totalDuration;
    } catch (err) {
        console.error('Failed to load dashboard data:', err);
    }
});
