// Configuration des critères
const CRITERIA = {
    C: {
        title: "C. Travail de préparation (20 pts)",
        individual: false,
        isNumeric: true,
        items: [
            {
                id: 'preparation',
                label: 'Note de préparation en classe',
                max: 20
            }
        ]
    },
    A: {
        title: "A. Maîtrise de l'expression orale (50 pts)",
        individual: true,
        items: [
            {
                id: 'temps',
                label: 'Respect du temps de parole (2-3 min)',
                levels: [
                    { label: 'Insuf.', points: null },
                    { label: 'Fragile', points: 1 },
                    { label: 'Satisf.', points: 2 },
                    { label: 'Très bien', points: 3 }
                ]
            },
            {
                id: 'posture',
                label: 'Posture et expression (gestuelle, regard, aisance, voix)',
                levels: [
                    { label: 'Insuf.', points: 1 },
                    { label: 'Fragile', points: 5 },
                    { label: 'Satisf.', points: 7 },
                    { label: 'Très bien', points: 10 }
                ]
            },
            {
                id: 'detachement',
                label: 'Capacité à se détacher du texte écrit',
                levels: [
                    { label: 'Insuf.', points: 1 },
                    { label: 'Fragile', points: 3 },
                    { label: 'Satisf.', points: 5 },
                    { label: 'Très bien', points: 7 }
                ]
            },
            {
                id: 'clarte',
                label: 'Clarté : syntaxe, vocabulaire adapté',
                levels: [
                    { label: 'Insuf.', points: 1 },
                    { label: 'Fragile', points: 5 },
                    { label: 'Satisf.', points: 7 },
                    { label: 'Très bien', points: 10 }
                ]
            },
            {
                id: 'correction',
                label: 'Correction de la langue',
                levels: [
                    { label: 'Insuf.', points: 1 },
                    { label: 'Fragile', points: 5 },
                    { label: 'Satisf.', points: 7 },
                    { label: 'Très bien', points: 10 }
                ]
            },
            {
                id: 'reformulation',
                label: 'Capacité à reformuler, développer ses idées',
                levels: [
                    { label: 'Insuf.', points: 1 },
                    { label: 'Fragile', points: 5 },
                    { label: 'Satisf.', points: 7 },
                    { label: 'Très bien', points: 10 }
                ]
            }
        ]
    },
    B: {
        title: "B. Maîtrise du sujet (30 pts)",
        individual: false,
        items: [
            {
                id: 'structure',
                label: 'Structure du discours (intro, problématique, plan, conclusion)',
                levels: [
                    { label: 'Insuf.', points: 1 },
                    { label: 'Fragile', points: 3 },
                    { label: 'Satisf.', points: 5 },
                    { label: 'Très bien', points: 7 }
                ]
            },
            {
                id: 'connaissances',
                label: 'Restitution des connaissances et compétences',
                levels: [
                    { label: 'Insuf.', points: 1 },
                    { label: 'Fragile', points: 3 },
                    { label: 'Satisf.', points: 5 },
                    { label: 'Très bien', points: 7 }
                ]
            },
            {
                id: 'questions',
                label: 'Capacité à répondre aux questions du jury',
                levels: [
                    { label: 'Insuf.', points: 1 },
                    { label: 'Fragile', points: 3 },
                    { label: 'Satisf.', points: 5 },
                    { label: 'Très bien', points: 7 }
                ]
            },
            {
                id: 'support',
                label: 'Support visuel de qualité scientifique',
                levels: [
                    { label: 'Insuf.', points: 1 },
                    { label: 'Fragile', points: 3 },
                    { label: 'Satisf.', points: 5 },
                    { label: 'Très bien', points: 7 }
                ]
            },
            {
                id: 'sources',
                label: 'Références documentaires, sources citées',
                levels: [
                    { label: 'Insuf.', points: null },
                    { label: 'Fragile', points: 1 },
                    { label: 'Satisf.', points: null },
                    { label: 'Très bien', points: 2 }
                ]
            }
        ]
    }
};

// État de l'application
let groups = [];
let currentGroupId = null;
let currentTab = 0;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadGroups();
    renderGroupsList();

    document.getElementById('btn-new-group').addEventListener('click', () => {
        showScreen('create');
    });

    document.getElementById('form-group').addEventListener('submit', handleCreateGroup);
    document.getElementById('btn-export-pdf').addEventListener('click', exportPDF);
    document.getElementById('btn-delete-group').addEventListener('click', deleteCurrentGroup);

    // Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(console.error);
    }
});

// Navigation
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(`screen-${screenName}`).classList.add('active');

    // Rafraîchir la liste quand on revient dessus
    if (screenName === 'list') {
        renderGroupsList();
    }
}

// Gestion des groupes
function loadGroups() {
    const saved = localStorage.getItem('notation-orale-groups');
    groups = saved ? JSON.parse(saved) : [];
}

function saveGroups() {
    localStorage.setItem('notation-orale-groups', JSON.stringify(groups));
}

function renderGroupsList() {
    const container = document.getElementById('groups-list');

    if (groups.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Aucun groupe créé</p>
            </div>
        `;
        return;
    }

    container.innerHTML = groups.map(group => {
        const avgScore = calculateGroupAverage(group);
        return `
            <div class="group-card" onclick="openGroup('${group.id}')">
                <h3>${group.name}</h3>
                <div class="subject">📚 ${group.subject}</div>
                <div class="meta">
                    ${group.students.length} élève(s) •
                    <span class="score">Moyenne: ${avgScore}/100</span>
                </div>
            </div>
        `;
    }).join('');
}

function handleCreateGroup(e) {
    e.preventDefault();

    const subject = document.getElementById('subject-name').value.trim();
    const name = document.getElementById('group-name').value.trim();
    const studentsText = document.getElementById('students-list').value.trim();
    const students = studentsText.split('\n').map(s => s.trim()).filter(s => s);

    if (students.length === 0) {
        alert('Ajoutez au moins un élève');
        return;
    }

    const group = {
        id: Date.now().toString(),
        subject,
        name,
        students: students.map(name => ({
            name,
            grades: {}
        })),
        groupGrades: {}
    };

    groups.push(group);
    saveGroups();

    // Reset form
    document.getElementById('form-group').reset();

    renderGroupsList();
    showScreen('list');
}

function openGroup(groupId) {
    currentGroupId = groupId;
    const group = groups.find(g => g.id === groupId);

    document.getElementById('grade-title').textContent = group.name;
    document.getElementById('grade-subject').textContent = `📚 ${group.subject}`;

    renderTabs(group);
    renderGradeContent(group, 0);

    showScreen('grade');
}

function renderTabs(group) {
    const nav = document.getElementById('tabs-nav');

    const tabs = [
        ...group.students.map((s, i) => ({ label: s.name, index: i })),
        { label: '📊 Groupe', index: group.students.length }
    ];

    nav.innerHTML = tabs.map((tab, i) => `
        <button class="tab-btn ${i === 0 ? 'active' : ''}" onclick="switchTab(${tab.index})">
            ${tab.label}
        </button>
    `).join('');

    currentTab = 0;
}

function switchTab(index) {
    const group = groups.find(g => g.id === currentGroupId);
    currentTab = index;

    document.querySelectorAll('.tab-btn').forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });

    renderGradeContent(group, index);
}

function renderGradeContent(group, tabIndex) {
    const container = document.getElementById('grade-content');
    const isGroupTab = tabIndex === group.students.length;

    if (isGroupTab) {
        // Onglet groupe : critères B + C (préparation)
        container.innerHTML = renderCriteriaSection('B', group, null) + renderNumericSection('C', group);
    } else {
        // Onglet élève : critères A + score
        const student = group.students[tabIndex];
        container.innerHTML = renderCriteriaSection('A', group, student) + renderStudentScore(group, student);
    }

    // Attacher les événements
    container.querySelectorAll('input[type="radio"]').forEach(input => {
        input.addEventListener('change', handleGradeChange);
    });

    // Événement pour l'input numérique
    container.querySelectorAll('.numeric-input').forEach(input => {
        input.addEventListener('input', handleNumericChange);
    });
}

function renderCriteriaSection(sectionKey, group, student) {
    const section = CRITERIA[sectionKey];

    return `
        <div class="criteria-section">
            <h2>${section.title}</h2>
            ${section.items.map(criterion => renderCriterion(criterion, sectionKey, group, student)).join('')}
        </div>
    `;
}

function renderNumericSection(sectionKey, group) {
    const section = CRITERIA[sectionKey];
    const criterion = section.items[0];
    const currentValue = group.groupGrades[criterion.id] ?? '';

    return `
        <div class="criteria-section">
            <h2>${section.title}</h2>
            <div class="criterion numeric-criterion">
                <div class="criterion-label">${criterion.label}</div>
                <div class="numeric-input-wrapper">
                    <input type="number"
                           id="numeric-${criterion.id}"
                           class="numeric-input"
                           min="0"
                           max="${criterion.max}"
                           value="${currentValue}"
                           placeholder="0"
                           data-criterion="${criterion.id}"
                           data-max="${criterion.max}">
                    <span class="numeric-max">/ ${criterion.max}</span>
                </div>
            </div>
        </div>
    `;
}

function renderCriterion(criterion, sectionKey, group, student) {
    const inputName = student
        ? `${student.name}-${criterion.id}`
        : `group-${criterion.id}`;

    const currentValue = student
        ? (student.grades[criterion.id] ?? '')
        : (group.groupGrades[criterion.id] ?? '');

    return `
        <div class="criterion">
            <div class="criterion-label">${criterion.label}</div>
            <div class="criterion-options">
                ${criterion.levels.map((level, i) => {
                    if (level.points === null) {
                        return `
                            <div class="criterion-option">
                                <label style="opacity: 0.4; cursor: not-allowed;">
                                    <span class="points">/</span>
                                    <span class="level">${level.label}</span>
                                </label>
                            </div>
                        `;
                    }
                    return `
                        <div class="criterion-option">
                            <input type="radio"
                                   name="${inputName}"
                                   value="${level.points}"
                                   data-section="${sectionKey}"
                                   data-criterion="${criterion.id}"
                                   data-student="${student ? student.name : ''}"
                                   ${currentValue == level.points ? 'checked' : ''}>
                            <label>
                                <span class="points">${level.points}</span>
                                <span class="level">${level.label}</span>
                            </label>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function renderStudentScore(group, student) {
    const scoreA = calculateScoreA(student);
    const scoreB = calculateScoreB(group);
    const scoreC = calculateScoreC(group);
    const total = scoreA + scoreB + scoreC;

    return `
        <div class="score-display">
            <div class="total">${total} / 100</div>
            <div class="breakdown">A: ${scoreA}/50 + B: ${scoreB}/30 + Prépa: ${scoreC}/20</div>
        </div>
    `;
}

function handleGradeChange(e) {
    const { section, criterion, student } = e.target.dataset;
    const value = parseInt(e.target.value);

    const group = groups.find(g => g.id === currentGroupId);

    if (student) {
        const studentObj = group.students.find(s => s.name === student);
        studentObj.grades[criterion] = value;
    } else {
        group.groupGrades[criterion] = value;
    }

    saveGroups();

    // Mettre à jour l'affichage du score si on est sur un onglet élève
    if (student) {
        const studentObj = group.students.find(s => s.name === student);
        const scoreDisplay = document.querySelector('.score-display');
        if (scoreDisplay) {
            const scoreA = calculateScoreA(studentObj);
            const scoreB = calculateScoreB(group);
            const scoreC = calculateScoreC(group);
            const total = scoreA + scoreB + scoreC;
            scoreDisplay.innerHTML = `
                <div class="total">${total} / 100</div>
                <div class="breakdown">A: ${scoreA}/50 + B: ${scoreB}/30 + Prépa: ${scoreC}/20</div>
            `;
        }
    }
}

function handleNumericChange(e) {
    const { criterion, max } = e.target.dataset;
    let value = parseInt(e.target.value) || 0;

    // Limiter entre 0 et max
    value = Math.max(0, Math.min(parseInt(max), value));

    const group = groups.find(g => g.id === currentGroupId);
    group.groupGrades[criterion] = value;

    saveGroups();
}

// Calculs des scores
function calculateScoreA(student) {
    return CRITERIA.A.items.reduce((sum, criterion) => {
        return sum + (student.grades[criterion.id] || 0);
    }, 0);
}

function calculateScoreB(group) {
    return CRITERIA.B.items.reduce((sum, criterion) => {
        return sum + (group.groupGrades[criterion.id] || 0);
    }, 0);
}

function calculateScoreC(group) {
    return group.groupGrades['preparation'] || 0;
}

function calculateStudentTotal(group, student) {
    return calculateScoreA(student) + calculateScoreB(group) + calculateScoreC(group);
}

function calculateGroupAverage(group) {
    if (group.students.length === 0) return 0;
    const total = group.students.reduce((sum, student) => {
        return sum + calculateStudentTotal(group, student);
    }, 0);
    return Math.round(total / group.students.length);
}

// Export PDF
function exportPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const group = groups.find(g => g.id === currentGroupId);

    let y = 20;

    // En-tête
    doc.setFontSize(18);
    doc.text('Notation Orale', 105, y, { align: 'center' });
    y += 10;

    doc.setFontSize(14);
    doc.text(`Sujet : ${group.subject}`, 105, y, { align: 'center' });
    y += 8;
    doc.text(`Groupe : ${group.name}`, 105, y, { align: 'center' });
    y += 15;

    // Score groupe (partie B)
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('B. Maîtrise du sujet (commun) : ' + calculateScoreB(group) + '/30', 20, y);
    doc.setFont(undefined, 'normal');
    y += 8;

    CRITERIA.B.items.forEach(criterion => {
        const score = group.groupGrades[criterion.id] || 0;
        const maxScore = Math.max(...criterion.levels.filter(l => l.points !== null).map(l => l.points));
        doc.setFontSize(10);
        doc.text(`  • ${criterion.label}: ${score}/${maxScore}`, 20, y);
        y += 6;
    });

    y += 8;

    // Score préparation (partie C)
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('C. Travail de préparation (commun) : ' + calculateScoreC(group) + '/20', 20, y);
    doc.setFont(undefined, 'normal');
    y += 12;

    // Détail par élève
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Détail par élève :', 20, y);
    doc.setFont(undefined, 'normal');
    y += 10;

    group.students.forEach(student => {
        if (y > 250) {
            doc.addPage();
            y = 20;
        }

        const scoreA = calculateScoreA(student);
        const scoreB = calculateScoreB(group);
        const scoreC = calculateScoreC(group);
        const total = scoreA + scoreB + scoreC;

        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text(`${student.name} : ${total}/100`, 20, y);
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(`(A: ${scoreA}/50 + B: ${scoreB}/30 + C: ${scoreC}/20)`, 80, y);
        y += 7;

        CRITERIA.A.items.forEach(criterion => {
            const score = student.grades[criterion.id] || 0;
            const maxScore = Math.max(...criterion.levels.filter(l => l.points !== null).map(l => l.points));
            doc.text(`  • ${criterion.label.substring(0, 50)}${criterion.label.length > 50 ? '...' : ''}: ${score}/${maxScore}`, 25, y);
            y += 5;
        });

        y += 8;
    });

    // Moyenne du groupe
    y += 5;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`Moyenne du groupe : ${calculateGroupAverage(group)}/100`, 20, y);

    // Télécharger
    doc.save(`notation-${group.name.replace(/\s+/g, '-')}.pdf`);
}

// Suppression
function deleteCurrentGroup() {
    if (!confirm('Supprimer ce groupe et toutes ses notes ?')) return;

    groups = groups.filter(g => g.id !== currentGroupId);
    saveGroups();
    renderGroupsList();
    showScreen('list');
}
