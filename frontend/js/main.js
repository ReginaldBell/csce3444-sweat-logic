const API_BASE = 'http://localhost:8080/api';

async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return res.json();
}

// asks user for weight when first click get started
function showBMICalculator() {
    const bmiSection = document.getElementById('bmi-section');
    if (bmiSection) {
        bmiSection.style.display = 'block';
        bmiSection.scrollIntoView({ behavior: 'smooth' });
    }
}

//function for saving information to a local profile 
function loadSavedProfile() {
    const saved = localStorage.getItem('sweatlogic-profile');
    if (!saved) return;

    try {
        const profile = JSON.parse(saved);
        if (profile.name) document.getElementById('name').value = profile.name;
        if (profile.age) document.getElementById('age').value = profile.age;
        if (profile.gender) document.getElementById('gender').value = profile.gender;
        if (profile.goal) document.getElementById('goal').value = profile.goal;
        if (profile.weight) document.getElementById('weight').value = profile.weight;
        if (profile.height) document.getElementById('height').value = profile.height;

        if (profile.bmi && profile.category) {
            document.getElementById('bmi-result').innerText = `Your BMI is ${profile.bmi} (${profile.category})`;
            const good = profile.category !== 'Underweight' && profile.category !== 'Overweight';
            document.getElementById('bmi-result').style.color = good ? '#32CD32' : '#d65a6d';
            const bmiSection = document.getElementById('bmi-section');
            if (bmiSection) bmiSection.style.display = 'block';
        }
    } catch (err) {
        console.warn('Invalid saved profile', err);
    }
}

window.addEventListener('DOMContentLoaded', loadSavedProfile);

function calculateBMI() {
    const weight = document.getElementById('weight').value;
    const height = document.getElementById('height').value / 100; // Convert cm to meters

    if (weight > 0 && height > 0) {
        const bmi = (weight / (height * height)).toFixed(1);
        let category = "";

        if (bmi < 18.5) category = "Underweight";
        else if (bmi < 24.9) category = "Normal weight";
        else if (bmi < 29.9) category = "Overweight";
        else category = "Obese";

        let color = "#d65a6d"; // default color for under/over
        if (category === "Normal weight") {
            color = "#32CD32"; // lime green for good
        }

        document.getElementById('bmi-result').innerText = `Your BMI is ${bmi} (${category})`;
        document.getElementById('bmi-result').style.color = color;

        const profile = {
            name: document.getElementById('name').value.trim(),
            age: document.getElementById('age').value.trim(),
            gender: document.getElementById('gender').value,
            goal: document.getElementById('goal').value,
            weight,
            height: document.getElementById('height').value.trim(),
            bmi,
            category,
            updatedAt: new Date().toISOString(),
        };
        localStorage.setItem('sweatlogic-profile', JSON.stringify(profile));
    } else {
        alert("Please enter a valid height and weight!");
    }
}

//function to clear profile information from local storage
function clearProfile() {
    localStorage.removeItem('sweatlogic-profile');
    document.getElementById('name').value = '';
    document.getElementById('age').value = '';
    document.getElementById('gender').value = '';
    document.getElementById('goal').value = '';
    document.getElementById('weight').value = '';
    document.getElementById('height').value = '';
    document.getElementById('bmi-result').innerText = '';
    const bmiSection = document.getElementById('bmi-section');
    if (bmiSection) bmiSection.style.display = 'none';
}
