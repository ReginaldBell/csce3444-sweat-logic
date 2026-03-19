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
        const diff = currentVal - prevVal;
        const pct  = prevVal > 0 ? Math.round((diff / prevVal) * 100) : null;
        const sign  = diff >= 0 ? '↑' : '↓';
        const tone  = diff >= 0 ? 'positive' : 'negative';
        const label = pct !== null
            ? `${sign} ${Math.abs(pct)}% vs last week`
            : (diff > 0 ? 'New this period' : '');
        if (!label) return;
        const span = document.createElement('span');
        span.className = `stat-delta stat-delta--${tone}`;
        span.textContent = label;
        card.appendChild(span);
    }

    // ── ISO week label ──────────────────────────────────────────────
    function getISOWeekLabel(dateStr) {
        const d = new Date(dateStr);
        const day = (d.getDay() + 6) % 7;
        d.setDate(d.getDate() - day + 3);
        const jan4 = new Date(d.getFullYear(), 0, 4);
        const week = Math.round((d - jan4) / 604800000) + 1;
        return `W${String(week).padStart(2, '0')}`;
    }

    // ── Chart helpers ───────────────────────────────────────────────
    let workoutsChart = null;
    let durationChart = null;

    function buildChartData(workouts) {
        const weeks = {};
        workouts.forEach((w) => {
            const label = getISOWeekLabel(w.date);
            if (!weeks[label]) weeks[label] = { count: 0, duration: 0 };
            weeks[label].count    += 1;
            weeks[label].duration += w.duration;
        });
        const labels    = Object.keys(weeks).sort();
        const counts    = labels.map((l) => weeks[l].count);
        const durations = labels.map((l) => weeks[l].duration);
        return { labels, counts, durations };
    }

    function renderCharts(workouts) {
        const { labels, counts, durations } = buildChartData(workouts);
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#566273' } },
                y: { grid: { color: 'rgba(16,32,51,0.06)' }, ticks: { font: { size: 11 }, color: '#566273' }, beginAtZero: true },
            },
        };

        if (workoutsChart) workoutsChart.destroy();
        if (durationChart) durationChart.destroy();

        const ctx1 = document.getElementById('workouts-chart');
        if (ctx1 && typeof Chart !== 'undefined') {
            workoutsChart = new Chart(ctx1, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        data: counts,
                        tension: 0.4,
                        fill: true,
                        borderColor: '#0b8f2a',
                        backgroundColor: 'rgba(11,143,42,0.08)',
                        pointBackgroundColor: '#0b8f2a',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                    }],
                },
                options: commonOptions,
            });
        }

        const ctx2 = document.getElementById('duration-chart');
        if (ctx2 && typeof Chart !== 'undefined') {
            durationChart = new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        data: durations,
                        backgroundColor: 'rgba(11,143,42,0.18)',
                        borderColor: '#0b8f2a',
                        borderWidth: 1.5,
                        borderRadius: 6,
                    }],
                },
                options: commonOptions,
            });
        }
    }

    // ── Planned days — localStorage persistence ─────────────────────
    const PLANNED_DAYS_KEY = 'sweatlogic-planned-days';

    function loadPlannedDays() {
        try {
            return new Set(JSON.parse(localStorage.getItem(PLANNED_DAYS_KEY) || '[]'));
        } catch {
            return new Set();
        }
    }

    function savePlannedDays(set) {
        localStorage.setItem(PLANNED_DAYS_KEY, JSON.stringify([...set]));
    }

    // ── Activity heatmap ────────────────────────────────────────────
    function renderHeatmap(workouts) {
        const grid = document.getElementById('heatmap-grid');
        if (!grid) return;

        const plannedDays = loadPlannedDays();

        // Build date → count map
        const dayCounts = {};
        workouts.forEach((w) => {
            const key = w.date ? w.date.slice(0, 10) : null;
            if (key) dayCounts[key] = (dayCounts[key] || 0) + 1;
        });

        // Determine range: oldest workout date to 4 weeks from today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayKey  = today.toISOString().slice(0, 10);
        const futureEnd = new Date(today.getTime() + 4 * 7 * 86400000);

        const dates = Object.keys(dayCounts).sort();
        const startDate = dates.length > 0 ? new Date(dates[0]) : new Date(today.getTime() - 12 * 7 * 86400000);
        startDate.setHours(0, 0, 0, 0);

        // Align startDate to Monday of its week
        const startDay = (startDate.getDay() + 6) % 7; // 0=Mon
        startDate.setDate(startDate.getDate() - startDay);

        // Build full list of days from startDate to futureEnd
        const days = [];
        for (let d = new Date(startDate); d <= futureEnd; d.setDate(d.getDate() + 1)) {
            days.push(new Date(d));
        }

        // Pad to full weeks
        while (days.length % 7 !== 0) days.push(new Date(days[days.length - 1].getTime() + 86400000));

        const maxCount = Math.max(1, ...Object.values(dayCounts));

        // Build grid: 7 rows (Mon–Sun), N columns (weeks)
        const numWeeks = days.length / 7;
        grid.style.setProperty('--heatmap-weeks', numWeeks);
        grid.innerHTML = '';

        // Week labels row (top)
        const labelRow = document.createElement('div');
        labelRow.className = 'heatmap-labels';
        for (let w = 0; w < numWeeks; w++) {
            const weekStart = days[w * 7];
            const span = document.createElement('span');
            if (w % 2 === 0) {
                span.textContent = getISOWeekLabel(weekStart.toISOString().slice(0, 10));
            }
            labelRow.appendChild(span);
        }
        grid.appendChild(labelRow);

        // Day rows (Mon=0 … Sun=6)
        const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        for (let row = 0; row < 7; row++) {
            const rowEl = document.createElement('div');
            rowEl.className = 'heatmap-row';

            const dayLabel = document.createElement('span');
            dayLabel.className = 'heatmap-day-label';
            dayLabel.textContent = DAY_NAMES[row];
            rowEl.appendChild(dayLabel);

            for (let col = 0; col < numWeeks; col++) {
                const day  = days[col * 7 + row];
                const key  = day.toISOString().slice(0, 10);
                const count    = dayCounts[key] || 0;
                const isFuture = key > todayKey;
                const isPlanned = isFuture && plannedDays.has(key);
                const level = count === 0 ? 0 : Math.ceil((count / maxCount) * 4);

                const cell = document.createElement('span');
                cell.className = 'heatmap-cell';
                cell.dataset.level = level;
                cell.dataset.date  = key;

                if (isFuture) {
                    cell.dataset.future = 'true';
                    if (isPlanned) cell.dataset.planned = 'true';
                    cell.title = isPlanned
                        ? `${key}: Planned workout — click to unplan`
                        : `${key}: Click to plan a workout`;

                    cell.addEventListener('click', () => {
                        const fresh = loadPlannedDays();
                        if (fresh.has(key)) {
                            fresh.delete(key);
                            delete cell.dataset.planned;
                            cell.title = `${key}: Click to plan a workout`;
                        } else {
                            fresh.add(key);
                            cell.dataset.planned = 'true';
                            cell.title = `${key}: Planned workout — click to unplan`;
                        }
                        savePlannedDays(fresh);
                    });
                } else {
                    cell.title = `${key}: ${count} workout${count !== 1 ? 's' : ''}`;
                }

                rowEl.appendChild(cell);
            }
            grid.appendChild(rowEl);
        }
    }

    // ── Insight generator ───────────────────────────────────────────
    function getPeakWeek(workouts) {
        const weeks = {};
        workouts.forEach((w) => {
            const label = getISOWeekLabel(w.date);
            weeks[label] = (weeks[label] || 0) + 1;
        });
        let peak = null, peakCount = 0;
        Object.entries(weeks).forEach(([label, count]) => {
            if (count > peakCount) { peak = label; peakCount = count; }
        });
        return { label: peak, count: peakCount };
    }

    function generateInsight(all, filtered, metrics) {
        if (filtered.length === 0) return null;
        const now      = Date.now();
        const thisWeek = all.filter((w) => now - new Date(w.date).getTime() < 7 * 86400000).length;
        const lastWeek = all.filter((w) => {
            const age = now - new Date(w.date).getTime();
            return age >= 7 * 86400000 && age < 14 * 86400000;
        }).length;

        const peak = getPeakWeek(filtered);
        const streakGap = metrics && metrics.longestStreak > metrics.currentStreak
            ? metrics.longestStreak - metrics.currentStreak
            : null;

        if (thisWeek > lastWeek && lastWeek > 0) {
            const pct = Math.round(((thisWeek - lastWeek) / lastWeek) * 100);
            const streakNote = streakGap === 1 ? ' One more session ties your personal best streak!' : '';
            return `You trained ${pct}% more this week than last week.${streakNote} Keep it up!`;
        }
        if (thisWeek === 0 && lastWeek > 0) {
            return `You haven't logged a session yet this week — last week you did ${lastWeek}.`;
        }
        if (peak.label && peak.count >= 3) {
            const streakNote = streakGap !== null && streakGap > 0
                ? ` You're ${streakGap} day${streakGap === 1 ? '' : 's'} away from beating your longest streak.`
                : '';
            return `Solid consistency. Your peak week was ${peak.label} with ${peak.count} sessions.${streakNote}`;
        }
        if (filtered.length >= 10) {
            return `You've logged ${filtered.length} sessions in this period. Solid consistency.`;
        }
        return `${filtered.length} session${filtered.length === 1 ? '' : 's'} logged. Every rep counts.`;
    }

    // ── History with grouping ───────────────────────────────────────
    function bucketByRecency(workouts) {
        const now = Date.now();
        return {
            'This Week': workouts.filter((w) => now - new Date(w.date).getTime() < 7 * 86400000),
            'Last Week': workouts.filter((w) => {
                const age = now - new Date(w.date).getTime();
                return age >= 7 * 86400000 && age < 14 * 86400000;
            }),
            'Earlier': workouts.filter((w) => now - new Date(w.date).getTime() >= 14 * 86400000),
        };
    }

    function renderHistory(workouts) {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;
        if (workouts.length === 0) {
            historyList.innerHTML = '<li style="color: var(--muted); font-size: 0.92rem;">No workouts in this period.</li>';
            return;
        }

        const buckets = bucketByRecency(workouts.slice(0, 20));
        historyList.innerHTML = '';

        Object.entries(buckets).forEach(([label, items]) => {
            if (items.length === 0) return;
            const header = document.createElement('li');
            header.className = 'history-group-header';
            header.textContent = label;
            historyList.appendChild(header);

            items.forEach((w) => {
                const li = document.createElement('li');
                const dateStr = w.date ? new Date(w.date).toLocaleDateString() : 'Recent';
                const typeName = (w.type || 'workout');
                const label = typeName.charAt(0).toUpperCase() + typeName.slice(1);
                li.innerHTML =
                    `<span class="history-type-icon">${getTypeIcon(w.type)}</span>` +
                    `<span class="history-date">${dateStr}</span>` +
                    `<strong>${label}</strong>` +
                    `<span style="margin-left:auto;color:var(--muted)">${w.duration} min</span>`;
                historyList.appendChild(li);
            });
        });
    }

    // ── Type breakdown ──────────────────────────────────────────────
    function renderBreakdown(workouts) {
        const typeCounts = { running: 0, cycling: 0, weights: 0, other: 0 };
        workouts.forEach((w) => {
            const t = (w.type || 'other').toLowerCase();
            if (typeCounts[t] !== undefined) typeCounts[t]++;
            else typeCounts.other++;
        });
        const total = workouts.length || 1;
        ['running', 'cycling', 'weights', 'other'].forEach((type) => {
            const pct   = Math.round((typeCounts[type] / total) * 100);
            const pctEl = document.getElementById(type + '-pct');
            const barEl = document.getElementById(type + '-bar');
            if (pctEl) pctEl.textContent = pct + '%';
            if (barEl) barEl.style.width = pct + '%';
        });
    }

    // ── Main render ─────────────────────────────────────────────────
    function renderPage(filtered, all, metrics) {
        // Stat values
        const totalEl         = document.getElementById('progress-total-workouts');
        const hoursEl         = document.getElementById('progress-total-hours');
        const avgEl           = document.getElementById('progress-avg-session');
        const currentStreakEl = document.getElementById('progress-current-streak');
        const longestStreakEl = document.getElementById('progress-longest-streak');

        const totalMin  = filtered.reduce((s, w) => s + w.duration, 0);
        const hours     = parseFloat((totalMin / 60).toFixed(1));
        const avgMin    = filtered.length > 0 ? Math.round(totalMin / filtered.length) : 0;

        if (totalEl) animateCountUp(totalEl, filtered.length);
        if (hoursEl) animateCountUp(hoursEl, hours);
        if (avgEl)   animateCountUp(avgEl, avgMin);
        if (currentStreakEl) animateCountUp(currentStreakEl, metrics.currentStreak);
        if (longestStreakEl) animateCountUp(longestStreakEl, metrics.longestStreak);

        // Week-over-week deltas (compare to previous 7-day window)
        const now        = Date.now();
        const thisWeek   = all.filter((w) => now - new Date(w.date).getTime() < 7 * 86400000);
        const lastWeek   = all.filter((w) => {
            const age = now - new Date(w.date).getTime();
            return age >= 7 * 86400000 && age < 14 * 86400000;
        });
        injectDelta('progress-total-workouts-card', thisWeek.length, lastWeek.length);

        const thisWeekMin = thisWeek.reduce((s, w) => s + w.duration, 0);
        const lastWeekMin = lastWeek.reduce((s, w) => s + w.duration, 0);
        injectDelta('progress-total-hours-card',
            parseFloat((thisWeekMin / 60).toFixed(1)),
            parseFloat((lastWeekMin / 60).toFixed(1))
        );

        const thisWeekAvg = thisWeek.length > 0 ? Math.round(thisWeekMin / thisWeek.length) : 0;
        const lastWeekAvg = lastWeek.length > 0 ? Math.round(lastWeekMin / lastWeek.length) : 0;
        injectDelta('progress-avg-session-card', thisWeekAvg, lastWeekAvg);

        // Progress meters
        const summaryCards  = document.querySelectorAll('.progress-stat-row .stat-card');
        const avgSession    = filtered.length > 0 ? Math.round(totalMin / filtered.length) : 0;
        const cardProgress  = [
            Math.min(filtered.length / 40, 1),
            Math.min(totalMin / 1200, 1),
            Math.min(avgSession / 90, 1),
            Math.min(metrics.currentStreak / 7, 1),
            Math.min(metrics.longestStreak / 14, 1),
        ];
        summaryCards.forEach((card, i) => {
            if (typeof window.setMotionProgress === 'function') {
                window.setMotionProgress(card, cardProgress[i] || 0);
            }
        });

        // Charts
        renderCharts(filtered);

        // Heatmap
        renderHeatmap(filtered);

        // Breakdown
        renderBreakdown(filtered);

        // Insight card
        const insightCard = document.getElementById('insight-card');
        const insightText = document.getElementById('insight-text');
        const insight = generateInsight(all, filtered, metrics);
        if (insightCard && insightText) {
            if (insight) {
                insightText.textContent = insight;
                insightCard.hidden = false;
            } else {
                insightCard.hidden = true;
            }
        }

        // History
        renderHistory(filtered);

        if (typeof window.refreshMotion === 'function') window.refreshMotion();
    }

    // ── Filter by period ────────────────────────────────────────────
    function filterByPeriod(workouts, days) {
        if (!days) return workouts;
        const cutoff = Date.now() - days * 86400000;
        return workouts.filter((w) => new Date(w.date).getTime() >= cutoff);
    }

    // ── Init ────────────────────────────────────────────────────────
    let allWorkouts = [];
    let activePeriod = 0; // default: all time

    try {
        allWorkouts = await apiFetch('/workouts');
        const metrics = typeof window.getWorkoutMetrics === 'function'
            ? window.getWorkoutMetrics(allWorkouts)
            : { currentStreak: 0, longestStreak: 0 };

        // Period filter buttons
        document.querySelectorAll('.period-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                activePeriod = parseInt(btn.dataset.period, 10);
                document.querySelectorAll('.period-btn').forEach((b) => b.classList.remove('is-active'));
                btn.classList.add('is-active');
                renderPage(filterByPeriod(allWorkouts, activePeriod), allWorkouts, metrics);
            });
        });

        renderPage(filterByPeriod(allWorkouts, activePeriod), allWorkouts, metrics);

    } catch (err) {
        console.error('Failed to load progress data:', err);
    }
});
