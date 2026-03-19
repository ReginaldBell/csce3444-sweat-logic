document.addEventListener('DOMContentLoaded', async () => {

    // ── SVG icon map ────────────────────────────────────────────────
    const TYPE_ICONS = {
        running: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="4" r="1.5"/><path d="M9 12l2-2 2.5 3L16 9"/><path d="M7 20l2-5h6l2 5"/><path d="M10 13l-2 3"/><path d="M14 13l2 3"/></svg>`,
        cycling: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>`,
        weights: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.5 6.5h11"/><path d="M6.5 17.5h11"/><rect x="4.5" y="5.5" width="2" height="13" rx="1"/><rect x="17.5" y="5.5" width="2" height="13" rx="1"/><rect x="1.5" y="8.5" width="3" height="7" rx="1"/><rect x="19.5" y="8.5" width="3" height="7" rx="1"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
        other:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
    };

    function getTypeIcon(type) {
        return TYPE_ICONS[(type || '').toLowerCase()] || TYPE_ICONS.other;
    }

    // ── Count-up animation ──────────────────────────────────────────
    function animateCountUp(el, targetValue, suffix = '') {
        if (!el || isNaN(targetValue)) return;
        const duration = 800;
        const start = performance.now();
        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * targetValue) + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    // ── Week-over-week delta ────────────────────────────────────────
    function injectDelta(cardId, currentVal, prevVal) {
        const card = document.getElementById(cardId);
        if (!card) return;
        card.querySelector('.stat-delta')?.remove();
        if (prevVal === 0 && currentVal === 0) return;
        const diff  = currentVal - prevVal;
        const pct   = prevVal > 0 ? Math.round((diff / prevVal) * 100) : null;
        const sign  = diff >= 0 ? '↑' : '↓';
        const tone  = diff >= 0 ? 'positive' : 'negative';
        const label = pct !== null
            ? `${sign} ${Math.abs(pct)}% vs prev week`
            : (diff > 0 ? 'New this week' : '');
        if (!label) return;
        const span = document.createElement('span');
        span.className = `stat-delta stat-delta--${tone}`;
        span.textContent = label;
        card.appendChild(span);
    }

    try {
        const workouts = await apiFetch('/workouts');
        const metrics = typeof window.getWorkoutMetrics === 'function'
            ? window.getWorkoutMetrics(workouts)
            : { currentStreak: 0, longestStreak: 0 };

        const list       = document.getElementById('workout-list');
        const emptyState = document.getElementById('empty-state');

        if (workouts.length === 0 && emptyState) {
            emptyState.style.display = 'block';
        }

        // Recent activity list with SVG icons
        workouts.slice(0, 5).forEach((w) => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            const typeName = (w.type || 'workout');
            const label    = typeName.charAt(0).toUpperCase() + typeName.slice(1);
            const dateStr  = w.date ? new Date(w.date).toLocaleDateString() : 'Recent';
            item.innerHTML =
                `<div class="activity-icon activity-icon--svg">${getTypeIcon(w.type)}</div>` +
                `<div class="activity-details">` +
                    `<strong>${label}</strong>` +
                    `<span>${dateStr}</span>` +
                `</div>` +
                `<span class="activity-duration">${w.duration} min</span>`;
            list.appendChild(item);
        });

        // Weekly window
        const now         = Date.now();
        const oneWeekAgo  = now - 7 * 86400000;
        const twoWeeksAgo = now - 14 * 86400000;

        const weeklyWorkouts   = workouts.filter((w) => new Date(w.date).getTime() >= oneWeekAgo);
        const prevWeekWorkouts = workouts.filter((w) => {
            const t = new Date(w.date).getTime();
            return t >= twoWeeksAgo && t < oneWeekAgo;
        });

        const weeklyCount    = weeklyWorkouts.length;
        const prevWeekCount  = prevWeekWorkouts.length;
        const totalDuration  = weeklyWorkouts.reduce((sum, w) => sum + w.duration, 0);
        const prevDuration   = prevWeekWorkouts.reduce((sum, w) => sum + w.duration, 0);
        const avgDuration    = weeklyCount > 0 ? Math.round(totalDuration / weeklyCount) : 0;

        // Stat card values with count-up
        animateCountUp(document.getElementById('total-workouts'), weeklyCount);
        animateCountUp(document.getElementById('total-duration'), totalDuration);

        const avgEl = document.getElementById('avg-duration');
        if (avgEl) {
            if (weeklyCount > 0) animateCountUp(avgEl, avgDuration);
            else avgEl.textContent = '--';
        }

        animateCountUp(document.getElementById('streak-count'), metrics.currentStreak);

        // Week-over-week deltas
        injectDelta('total-workouts', weeklyCount, prevWeekCount);
        injectDelta('total-duration', totalDuration, prevDuration);

        // Weekly summary tiles
        const sessionsCount = document.getElementById('weekly-sessions-count');
        const timeTotal     = document.getElementById('weekly-time-total');
        if (sessionsCount) animateCountUp(sessionsCount, weeklyCount);
        if (timeTotal)     animateCountUp(timeTotal, totalDuration);

        // Progress meters
        const statCards = document.querySelectorAll('.stat-card');
        const progressValues = [
            Math.min(weeklyCount / 7, 1),
            Math.min(totalDuration / 300, 1),
            weeklyCount > 0 ? Math.min(avgDuration / 90, 1) : 0,
            Math.min(metrics.currentStreak / 7, 1),
        ];
        statCards.forEach((card, index) => {
            if (typeof window.setMotionProgress === 'function') {
                window.setMotionProgress(card, progressValues[index] || 0);
            }
        });

        if (typeof window.refreshMotion === 'function') window.refreshMotion();

    } catch (err) {
        console.error('Failed to load dashboard data:', err);
    }
});
