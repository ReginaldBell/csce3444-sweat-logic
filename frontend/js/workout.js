document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('workout-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            type: form.type.value,
            duration: parseInt(form.duration.value, 10),
            notes: form.notes.value,
            date: new Date().toISOString(),
        };

        try {
            await apiFetch('/workouts', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            alert('Workout saved!');
            form.reset();
        } catch (err) {
            console.error('Failed to save workout:', err);
            alert('Error saving workout.');
        }
    });
});
