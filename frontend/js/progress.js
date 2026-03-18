document.addEventListener('DOMContentLoaded', async () => {
    try {
        const workouts = await apiFetch('/workouts');
        const metrics = typeof window.getWorkoutMetrics === 'function'
            ? window.getWorkoutMetrics(workouts)
            : { currentStreak: 0, longestStreak: 0 };
        console.log('Loaded workouts for progress:', workouts.length);

        // Top stats
        const totalEl = document.getElementById('progress-total-workouts');
        const hoursEl = document.getElementById('progress-total-hours');
        const avgEl = document.getElementById('progress-avg-session');
        const currentStreakEl = document.getElementById('progress-current-streak');
        const longestStreakEl = document.getElementById('progress-longest-streak');

        if (totalEl) totalEl.textContent = workouts.length;
        const totalMin = workouts.reduce((s, w) => s + w.duration, 0);
        if (hoursEl) hoursEl.textContent = (totalMin / 60).toFixed(1);
        if (avgEl) avgEl.textContent = workouts.length > 0 ? Math.round(totalMin / workouts.length) : '--';
        if (currentStreakEl) currentStreakEl.textContent = metrics.currentStreak;
        if (longestStreakEl) longestStreakEl.textContent = metrics.longestStreak;

        // Type breakdown
        var typeCounts = { running: 0, cycling: 0, weights: 0, other: 0 };
        workouts.forEach(function(w) {
            var t = (w.type || 'other').toLowerCase();
            if (typeCounts[t] !== undefined) {
                typeCounts[t]++;
            } else {
                typeCounts.other++;
            }
        });

        var total = workouts.length || 1;
        var types = ['running', 'cycling', 'weights', 'other'];
        types.forEach(function(type) {
            var pct = Math.round((typeCounts[type] / total) * 100);
            var pctEl = document.getElementById(type + '-pct');
            var barEl = document.getElementById(type + '-bar');
            if (pctEl) pctEl.textContent = pct + '%';
            if (barEl) barEl.style.width = pct + '%';
        });

        var summaryCards = document.querySelectorAll('.progress-stat-row .stat-card');
        var avgSession = workouts.length > 0 ? Math.round(totalMin / workouts.length) : 0;
        var cardProgress = [
            Math.min(workouts.length / 40, 1),
            Math.min(totalMin / 1200, 1),
            Math.min(avgSession / 90, 1),
            Math.min(metrics.currentStreak / 7, 1),
            Math.min(metrics.longestStreak / 14, 1)
        ];
        summaryCards.forEach(function(card, index) {
            if (typeof window.setMotionProgress === 'function') {
                window.setMotionProgress(card, cardProgress[index] || 0);
            }
        });

        // Recent history list
        var historyList = document.getElementById('history-list');
        if (historyList && workouts.length > 0) {
            historyList.innerHTML = '';
            workouts.slice(0, 8).forEach(function(w) {
                var li = document.createElement('li');
                var dateStr = w.date ? new Date(w.date).toLocaleDateString() : 'Recent';
                li.innerHTML =
                    '<span class="history-date">' + dateStr + '</span>' +
                    '<strong>' + (w.type || 'Workout') + '</strong>' +
                    '<span style="margin-left: auto; color: var(--muted);">' + w.duration + ' min</span>';
                historyList.appendChild(li);
            });
        }

        if (typeof window.refreshMotion === 'function') {
            window.refreshMotion();
        }

        // TODO: render charts using workouts data
    } catch (err) {
        console.error('Failed to load progress data:', err);
    }
});
