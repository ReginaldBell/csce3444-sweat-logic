document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = 'http://localhost:8080/api';
    const USER_ID_KEY = 'sweatlogic-user-id';
    const PROFILE_KEY = 'sweatlogic-profile';
    const SETTINGS_EVENT = 'sweatlogic:settings-updated';
    const form = document.getElementById('settings-form');
    const status = document.getElementById('settings-status');
    const goalOptions = new Set(['strength', 'cardio', 'endurance']);
    const levelOptions = new Set(['beginner', 'intermediate', 'advanced']);

    if (!form) {
        return;
    }

    function setStatus(message, tone = 'success') {
        if (!status) {
            return;
        }

        status.textContent = message || '';
        status.classList.remove('is-visible', 'is-error', 'is-success');

        if (!message) {
            return;
        }

        status.classList.add('is-visible', tone === 'error' ? 'is-error' : 'is-success');
    }

    async function requestApi(path, options = {}) {
        const response = await fetch(`${API_BASE}${path}`, {
            headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
            ...options,
        });

        if (response.status === 204) {
            return null;
        }

        const contentType = response.headers.get('content-type') || '';
        const payload = contentType.includes('application/json')
            ? await response.json()
            : await response.text();

        if (!response.ok) {
            const message = typeof payload === 'string' && payload.trim()
                ? payload.trim()
                : `Request failed: ${response.status}`;
            const error = new Error(message);
            error.status = response.status;
            error.payload = payload;
            throw error;
        }

        return payload;
    }

    function readLocalSettings() {
        return {
            username: localStorage.getItem('username') || '',
            unit: localStorage.getItem('unit') || 'imperial',
            goal: goalOptions.has(localStorage.getItem('goal')) ? localStorage.getItem('goal') : 'strength',
            level: levelOptions.has(localStorage.getItem('level')) ? localStorage.getItem('level') : 'intermediate',
        };
    }

    function applyFormValues(settings) {
        form.username.value = settings.username || '';
        form.unit.value = settings.unit || 'imperial';
        form.goal.value = goalOptions.has(settings.goal) ? settings.goal : 'strength';
        form.level.value = levelOptions.has(settings.level) ? settings.level : 'intermediate';
    }

    function persistLocalSettings(settings) {
        localStorage.setItem('username', settings.username);
        localStorage.setItem('unit', settings.unit);
        localStorage.setItem('goal', settings.goal);
        localStorage.setItem('level', settings.level);
    }

    function syncProfileSnapshot(settings) {
        let profile = {};

        try {
            profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}');
        } catch {
            profile = {};
        }

        profile.name = settings.username;
        profile.goal = settings.goal;
        profile.unit = settings.unit;
        profile.updatedAt = new Date().toISOString();

        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    }

    function broadcastSettings(settings) {
        window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: settings }));
    }

    async function loadBackendUser() {
        const savedId = localStorage.getItem(USER_ID_KEY);
        const localSettings = readLocalSettings();

        if (savedId) {
            try {
                return await requestApi(`/users/${encodeURIComponent(savedId)}`);
            } catch {
                localStorage.removeItem(USER_ID_KEY);
            }
        }

        if (!localSettings.username.trim()) {
            return null;
        }

        try {
            const user = await requestApi(`/users/by-username/${encodeURIComponent(localSettings.username.trim())}`);
            if (user && user.id) {
                localStorage.setItem(USER_ID_KEY, String(user.id));
            }
            return user;
        } catch (error) {
            if (error.status === 404) {
                return null;
            }
            throw error;
        }
    }

    applyFormValues(readLocalSettings());

    loadBackendUser()
        .then((user) => {
            if (!user) {
                return;
            }

            const mergedSettings = {
                ...readLocalSettings(),
                username: user.username || readLocalSettings().username,
                unit: user.unit || readLocalSettings().unit,
            };

            applyFormValues(mergedSettings);
            persistLocalSettings(mergedSettings);
            syncProfileSnapshot(mergedSettings);
            broadcastSettings(mergedSettings);
        })
        .catch((error) => {
            console.warn('Unable to load backend user settings.', error);
        });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const settings = {
            username: form.username.value.trim(),
            unit: form.unit.value,
            goal: form.goal.value,
            level: form.level.value,
        };

        if (!settings.username) {
            setStatus('Enter a display name before saving.', 'error');
            form.username.focus();
            return;
        }

        persistLocalSettings(settings);
        syncProfileSnapshot(settings);
        broadcastSettings(settings);
        setStatus('');

        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
        }

        try {
            const existingId = localStorage.getItem(USER_ID_KEY);
            let savedUser;

            if (existingId) {
                savedUser = await requestApi(`/users/${encodeURIComponent(existingId)}`, {
                    method: 'PUT',
                    body: JSON.stringify({ username: settings.username, unit: settings.unit }),
                });
            } else {
                try {
                    const existingUser = await requestApi(`/users/by-username/${encodeURIComponent(settings.username)}`);
                    savedUser = await requestApi(`/users/${encodeURIComponent(existingUser.id)}`, {
                        method: 'PUT',
                        body: JSON.stringify({ username: settings.username, unit: settings.unit }),
                    });
                } catch (error) {
                    if (error.status !== 404) {
                        throw error;
                    }

                    savedUser = await requestApi('/users', {
                        method: 'POST',
                        body: JSON.stringify({ username: settings.username, unit: settings.unit }),
                    });
                }
            }

            if (savedUser && savedUser.id) {
                localStorage.setItem(USER_ID_KEY, String(savedUser.id));
            }

            setStatus('Settings saved locally and synced with the workout recommendation builder.');
        } catch (error) {
            console.warn('Unable to sync settings to backend.', error);
            setStatus('Settings saved locally. Backend sync was unavailable, so workout defaults still use your current choices.', 'success');
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
            }
        }

        if (typeof window.refreshMotion === 'function') {
            window.refreshMotion();
        }
    });
});
