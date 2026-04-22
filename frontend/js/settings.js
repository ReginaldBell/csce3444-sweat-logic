document.addEventListener('DOMContentLoaded', () => {
    const USER_ID_KEY = 'sweatlogic-user-id';
    const PROFILE_KEY = 'sweatlogic-profile';
    const SETTINGS_EVENT = 'sweatlogic:settings-updated';
    const form = document.getElementById('settings-form');
    const status = document.getElementById('settings-status');
    const backendStatus = document.getElementById('settings-backend-status');
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

    function setBackendStatus(error, fallback = 'Could not reach the server. Check that the backend is running and try again.') {
        if (typeof window.setAlertState !== 'function') {
            return;
        }

        const message = typeof window.getRequestErrorMessage === 'function'
            ? window.getRequestErrorMessage(error, fallback)
            : fallback;

        window.setAlertState(backendStatus, message, 'error');
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
            if (typeof window.setAlertState === 'function') {
                window.setAlertState(backendStatus, '');
            }
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
            setBackendStatus(error, 'Could not reach the server. Using your locally saved settings for now.');
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

            if (typeof window.setAlertState === 'function') {
                window.setAlertState(backendStatus, '');
            }
            setStatus('Settings saved locally and synced with the workout recommendation builder.');
        } catch (error) {
            setBackendStatus(error, 'Could not reach the server. Your settings were still saved locally.');
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

    // Export button handler
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = 'http://localhost:8080/api/workouts/export';
            link.download = 'workouts.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // Import button handler
    const importBtn = document.getElementById('import-btn');
    const importFile = document.getElementById('import-file');
    if (importBtn) {
        importBtn.addEventListener('click', () => {
            const file = importFile.files[0];
            if (!file) {
                alert('Please select a file to import.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const workouts = JSON.parse(e.target.result);
                    fetch('http://localhost:8080/api/workouts/import', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(workouts)
                    }).then(response => {
                        if (response.ok) {
                            alert('Workouts imported successfully!');
                        } else {
                            alert('Import failed. Please check the file format.');
                        }
                    }).catch(err => {
                        alert('An error occurred during import.');
                    });
                } catch (err) {
                    alert('Invalid JSON file. Please select a valid workouts JSON file.');
                }
            };
            reader.readAsText(file);
        });
    }

    // Reset button handler
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all workouts? This action cannot be undone.')) {
                fetch('http://localhost:8080/api/workouts/import', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify([])
                }).then(response => {
                    if (response.ok) {
                        alert('Workouts reset successfully!');
                    } else {
                        alert('Reset failed.');
                    }
                }).catch(err => {
                    alert('An error occurred during reset.');
                });
            }
        });
    }
});
