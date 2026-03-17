// ─── Group accent colors ──────────────────────────────────────────────────────
export const GROUP_COLORS = {
  fitness:    { accent: '#0b8f2a', light: 'rgba(11,143,42,0.13)'  },
  aquatics:   { accent: '#0f8ab7', light: 'rgba(15,138,183,0.13)' },
  courts:     { accent: '#22c55e', light: 'rgba(34,197,94,0.13)'  },
  recreation: { accent: '#f97316', light: 'rgba(249,115,22,0.13)' },
  services:   { accent: '#8b9aaa', light: 'rgba(139,154,170,0.10)'},
};

// ─── Zone store ───────────────────────────────────────────────────────────────
export const ZONES = {

  // ── Floor 1 ──────────────────────────────────────────────────────────────

  'soccer': {
    label: 'Soccer Field',
    floor: 1,
    group: 'courts',
    meta: {
      capacity: 60,
      equipment: ['Goals', 'Field Turf', 'Boundary Markings'],
      hours: '6AM – 11PM',
    },
    ui: { gridArea: 'soccer', icon: 'fa-futbol', youAreHere: false },
    status: null,
  },

  'courts-a': {
    label: 'Courts A',
    floor: 1,
    group: 'courts',
    meta: {
      capacity: 30,
      equipment: ['Basketball Hoops', 'Volleyball Net', 'Hardwood Floor'],
      hours: '6AM – 11PM',
    },
    ui: { gridArea: 'courtsA', icon: 'fa-basketball', youAreHere: false },
    status: null,
  },

  'courts-b': {
    label: 'Courts B',
    floor: 1,
    group: 'courts',
    meta: {
      capacity: 30,
      equipment: ['Volleyball Net', 'Badminton Net', 'Hardwood Floor'],
      hours: '6AM – 11PM',
    },
    ui: { gridArea: 'courtsB', icon: 'fa-volleyball', youAreHere: false },
    status: null,
  },

  'courts-c': {
    label: 'Courts C',
    floor: 1,
    group: 'courts',
    meta: {
      capacity: 30,
      equipment: ['Table Tennis Tables', 'Badminton Net', 'Hardwood Floor'],
      hours: '6AM – 11PM',
    },
    ui: { gridArea: 'courtsC', icon: 'fa-table-tennis-paddle-ball', youAreHere: false },
    status: null,
  },

  'leisure-pool': {
    label: 'Leisure Pool',
    floor: 1,
    group: 'aquatics',
    meta: {
      capacity: 50,
      equipment: ['Water Slides', 'Lazy River', 'Hot Tub', 'Splash Zone'],
      hours: '6AM – 11PM',
    },
    ui: { gridArea: 'leisurePool', icon: 'fa-person-swimming', youAreHere: false },
    status: null,
  },

  'lap-pool': {
    label: 'Lap Pool',
    floor: 1,
    group: 'aquatics',
    meta: {
      capacity: 30,
      equipment: ['25-Yard Lanes', 'Lane Ropes', 'Starting Blocks', 'Pace Clock'],
      hours: '6AM – 11PM',
    },
    ui: { gridArea: 'lapPool', icon: 'fa-person-swimming', youAreHere: false },
    status: null,
  },

  'lockers': {
    label: 'Locker Rooms',
    floor: 1,
    group: 'services',
    meta: {
      capacity: 80,
      equipment: ['Day Lockers', 'Showers', 'Sauna', 'Bring Your Own Lock'],
      hours: '6AM – 11PM',
    },
    ui: { gridArea: 'lockers', icon: 'fa-lock', youAreHere: false },
    status: null,
  },

  'sand-vball': {
    label: 'Sand Volleyball',
    floor: 1,
    group: 'recreation',
    meta: {
      capacity: 20,
      equipment: ['Sand Court', 'Net', 'Balls Available at Front Desk'],
      hours: '6AM – 11PM',
    },
    ui: { gridArea: 'sandVball', icon: 'fa-volleyball', youAreHere: false },
    status: null,
  },

  'weights': {
    label: 'Weight Room',
    floor: 1,
    group: 'fitness',
    meta: {
      capacity: 40,
      equipment: ['Barbells', 'Squat Racks', 'Dumbbells', 'Bench Press', 'Cable Machines'],
      hours: '6AM – 11PM',
    },
    ui: { gridArea: 'weights', icon: 'fa-dumbbell', youAreHere: false },
    status: null,
  },

  'fitness-ofc': {
    label: 'Fitness Office',
    floor: 1,
    group: 'services',
    meta: {
      capacity: 10,
      equipment: ['Staff Desk', 'Personal Training Sign-Up', 'Consultation Area'],
      hours: '8AM – 8PM',
    },
    ui: { gridArea: 'fitnessOfc', icon: 'fa-clipboard', youAreHere: false },
    status: null,
  },

  'entrance': {
    label: 'Front Entrance',
    floor: 1,
    group: 'services',
    meta: {
      capacity: 100,
      equipment: ['Member Services', 'Check-In Kiosks', 'Rec Sports Office', 'PointBank Lounge'],
      hours: '6AM – 11PM',
    },
    ui: { gridArea: 'entrance', icon: 'fa-door-open', youAreHere: true },
    status: null,
  },

  'cardio': {
    label: 'Cardio Machines',
    floor: 1,
    group: 'fitness',
    meta: {
      capacity: 35,
      equipment: ['Treadmills', 'Ellipticals', 'Stationary Bikes', 'Stair Climbers'],
      hours: '6AM – 11PM',
    },
    ui: { gridArea: 'cardio', icon: 'fa-person-running', youAreHere: false },
    status: null,
  },

  'climbing': {
    label: 'Climbing Wall',
    floor: 1,
    group: 'recreation',
    meta: {
      capacity: 20,
      equipment: ['Top Rope Wall', 'Lead Wall', 'Bouldering Cave', 'Rental Shoes Available'],
      hours: '10AM – 10PM',
    },
    ui: { gridArea: 'climbing', icon: 'fa-mountain', youAreHere: false },
    status: null,
  },

  'opc': {
    label: 'Outdoor Pursuits',
    floor: 1,
    group: 'recreation',
    meta: {
      capacity: 15,
      equipment: ['Gear Rental', 'Kayaks', 'Camping Gear', 'Trip Planning Services'],
      hours: '10AM – 6PM',
    },
    ui: { gridArea: 'opc', icon: 'fa-tent', youAreHere: false },
    status: null,
  },

  'smoothie': {
    label: 'Smoothie King',
    floor: 1,
    group: 'services',
    meta: {
      capacity: 15,
      equipment: ['Smoothie Bar', 'Protein Supplements', 'Healthy Snacks'],
      hours: '7AM – 9PM',
    },
    ui: { gridArea: 'smoothie', icon: 'fa-blender', youAreHere: false },
    status: null,
  },

  // ── Floor 2 ──────────────────────────────────────────────────────────────

  'track': {
    label: 'Indoor Running Track',
    floor: 2,
    group: 'fitness',
    meta: {
      capacity: 50,
      equipment: ['1/8 Mile Track', 'Pace Markers', 'Water Fountain', 'Rubberized Surface'],
      hours: '6AM – 11PM',
    },
    ui: { gridArea: 'track', icon: 'fa-person-running', youAreHere: false },
    status: null,
  },

  'weights-2': {
    label: 'Weight Room',
    floor: 2,
    group: 'fitness',
    meta: {
      capacity: 45,
      equipment: ['Free Weights', 'Smith Machines', 'Cable Machines', 'Foam Rollers'],
      hours: '6AM – 11PM',
    },
    ui: { gridArea: 'weights2', icon: 'fa-dumbbell', youAreHere: false },
    status: null,
  },

  'cardio-2': {
    label: 'Cardio Floor',
    floor: 2,
    group: 'fitness',
    meta: {
      capacity: 40,
      equipment: ['Treadmills', 'Rowing Machines', 'Spin Bikes', 'Battle Ropes'],
      hours: '6AM – 11PM',
    },
    ui: { gridArea: 'cardio2', icon: 'fa-heart-pulse', youAreHere: false },
    status: null,
  },
};

// ─── Floor configs ────────────────────────────────────────────────────────────
export const FLOORS = {
  1: {
    label: 'Main Floor',
    gridTemplateAreas: `
      "soccer leisurePool sandVball cardio"
      "soccer leisurePool weights   cardio"
      "courtsA lapPool    weights   climbing"
      "courtsB lockers    fitnessOfc opc"
      "courtsC lockers    entrance  smoothie"
    `,
    gridTemplateColumns: '1.2fr 1fr 1fr 1fr',
    gridTemplateRows: '1fr 1fr 1fr 1fr 1fr',
  },
  2: {
    label: '2nd Floor',
    gridTemplateAreas: `
      "track    track"
      "weights2 cardio2"
    `,
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1.2fr 1fr',
  },
};
