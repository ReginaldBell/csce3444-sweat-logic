document.addEventListener('DOMContentLoaded', async () => {
    try {
        const workouts = await apiFetch('/workouts');
        const list = document.getElementById('workout-list');
        const emptyState = document.getElementById('empty-state');

        if (workouts.length === 0 && emptyState) {
            emptyState.style.display = 'block';
        }

        workouts.slice(0, 5).forEach((w, i) => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            const iconClass = i % 2 === 0 ? '' : ' blue';
            const initial = w.type ? w.type.charAt(0).toUpperCase() : 'W';
            item.innerHTML =
                '<div class="activity-icon' + iconClass + '">' + initial + '</div>' +
                '<div class="activity-details">' +
                    '<strong>' + (w.type || 'Workout') + '</strong>' +
                    '<span>' + (w.date ? new Date(w.date).toLocaleDateString() : 'Recent') + '</span>' +
                '</div>' +
                '<span class="activity-duration">' + w.duration + ' min</span>';
            list.appendChild(item);
        });

        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const weeklyWorkouts = workouts.filter(w => new Date(w.date) >= oneWeekAgo);
        const weeklyCount = weeklyWorkouts.length;
        const totalDuration = weeklyWorkouts.reduce((sum, w) => sum + w.duration, 0);

        document.getElementById('total-workouts').textContent = weeklyCount;
        document.getElementById('total-duration').textContent = totalDuration;

        // Additional stat cards
        const avgEl = document.getElementById('avg-duration');
        if (avgEl) {
            avgEl.textContent = weeklyCount > 0 ? Math.round(totalDuration / weeklyCount) : '--';
        }

        // Weekly summary tiles
        const sessionsCount = document.getElementById('weekly-sessions-count');
        const timeTotal = document.getElementById('weekly-time-total');
        if (sessionsCount) sessionsCount.textContent = weeklyCount;
        if (timeTotal) timeTotal.textContent = totalDuration;

        if (typeof window.refreshMotion === 'function') {
            window.refreshMotion();
        }

    } catch (err) {
        console.error('Failed to load dashboard data:', err);
    }
});
