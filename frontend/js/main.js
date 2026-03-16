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
        // included recommendation for workout
        let recommendation = "";
        const userGoal = document.getElementById('goal').value;

        if (bmi < 18.5) category = "Underweight";
        else if (bmi < 24.9) category = "Normal weight";
        else if (bmi < 29.9) category = "Overweight";
        else category = "Obese";

        // recommendation based on bmi
        if (userGoal === "Lose weight") {
            recommendation = "Focus on high-intensity exercises to burn calories, specifically cardio.";
        } else if (userGoal === "Gain muscle") {
            recommendation = "Focus on heavy compound lifts (squats, deadlifts, bench press) with minimum weight and maximum weight.";
        } else if (userGoal === "Improve endurance") {
            recommendation = "Focus on cardio exercises and high reps on lifts with minimum weight.";
        } else if (userGoal == "Maintain"){
            recommendation = "2 days of light cardio with about 2-3 days of lift days";
        }
        document.getElementById('workout-recommendation').innerText = `Recommendation: ${recommendation}`;

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

function recommendedWorkouts() {
    const goalRecommendation = document.getElementById('goal-recommendation');
    const specificRecommendation = document.getElementById('specific-recommendation');
    
    if (goalRecommendation) {
        const goalPlans = [
            { goal: "Lose weight", link: "lose-weight.html" },
            { goal: "Maintain", link: "maintain.html" },
            { goal: "Gain muscle", link: "gain-muscle.html" },
            { goal: "Improve endurance", link: "endurance.html" }
        ];

        goalRecommendation.innerHTML = goalPlans.map(plan => `
            <a href="${plan.link}" style="
                display: inline-block;
                width: 150px;
                padding: 30px 15px;
                margin: 5px;
                border: 2px solid #1b1b1b;
                border-radius: 10px;
                text-align: center;
                text-decoration: none;
                color: black;
            ">
                <h3 style="margin: 0; font-size: 1.1em;">${plan.goal}</h3>
            </a>
        `).join('');
    }

    if (specificRecommendation) {
        const bodyParts = [
            { part: "Chest", link: "chest.html" },
            { part: "Back", link: "back.html" },
            { part: "Legs", link: "legs.html" },
            { part: "Shoulders", link: "shoulders.html" },
            { part: "Arms", link: "arms.html" }
        ];

        specificRecommendation.innerHTML = bodyParts.map(item => `
            <a href="${item.link}" style="
                display: inline-block;
                width: 150px;
                padding: 30px 15px;
                margin: 5px;
                border: 2px solid #1b1b1b;
                border-radius: 10px;
                text-align: center;
                text-decoration: none;
                color: black;
            ">
                <h4 style="margin: 0; font-size: 1.1em;">${item.part}</h4>
            </a>
        `).join('');
    }
}
window.addEventListener('load', recommendedWorkouts);

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
