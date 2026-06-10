/* ============================================
   TalentR — App Logic
============================================ */

// ─── State ────────────────────────────────
var selectedSkills = [];

// ─── Navigation ───────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(function (p) {
    p.classList.remove('active');
  });
  document.querySelectorAll('.nav-link').forEach(function (l) {
    l.classList.remove('active');
  });

  document.getElementById(id).classList.add('active');

  var map = { home: 0, candidate: 1, employer: 2 };
  document.querySelectorAll('.nav-link')[map[id]].classList.add('active');
}

// ─── Skill Toggle ─────────────────────────
function toggleSkill(el, skill) {
  var idx = selectedSkills.indexOf(skill);
  if (idx > -1) {
    selectedSkills.splice(idx, 1);
    el.className = 'tag tag-neutral skill-tag';
  } else {
    selectedSkills.push(skill);
    el.className = 'tag tag-gold skill-tag';
  }
}

// ─── Salary Data ──────────────────────────
var BASE_SALARIES = {
  'Software Engineer':    6200,
  'Data Analyst':         5100,
  'Product Manager':      7800,
  'UI/UX Designer':       5400,
  'Marketing Executive':  4200,
  'HR Executive':         4000,
  'Business Analyst':     5800,
  'DevOps Engineer':      7000
};

var STATE_MULTIPLIERS = {
  'Kuala Lumpur': 1.00,
  'Selangor':     0.95,
  'Penang':       0.88,
  'Johor':        0.82,
  'Perak':        0.75,
  'Sabah':        0.70,
  'Sarawak':      0.72
};

// ─── Calculate & Render Results ───────────
function calcSalary() {
  var job     = document.getElementById('jobTitle').value;
  var state   = document.getElementById('state').value;
  var exp     = parseInt(document.getElementById('expRange').value);
  var current = parseInt(document.getElementById('currentSalary').value) || 0;

  if (!job || !state) {
    alert('Please select a job title and state.');
    return;
  }

  // Compute salary range
  var expBonus   = Math.min(exp * 180, 2000);
  var skillBonus = selectedSkills.length * 200;
  var base       = BASE_SALARIES[job] || 5000;
  var mult       = STATE_MULTIPLIERS[state] || 0.85;
  var median     = Math.round((base * mult + expBonus + skillBonus) / 100) * 100;
  var low        = Math.round(median * 0.82 / 100) * 100;
  var high       = Math.round(median * 1.22 / 100) * 100;

  // Subtitle
  document.getElementById('resultSubtitle').textContent =
    job + ' · ' + state + ' · ' + exp + 'yr exp';

  // Range display
  document.getElementById('salaryRange').textContent =
    'RM ' + low.toLocaleString() + ' — RM ' + high.toLocaleString() + '/month';
  document.getElementById('barMin').textContent = 'RM ' + low.toLocaleString();
  document.getElementById('barMax').textContent = 'RM ' + high.toLocaleString();

  // Bar position & position text
  var pct     = 55;
  var posText = '';
  var salNote = '';

  if (current > 0) {
    var diff = ((current - median) / median * 100).toFixed(0);
    pct = Math.min(
      Math.max(Math.round(((current - low) / (high - low)) * 100), 5),
      95
    );

    if (current < low) {
      posText = 'You are earning below the market range — you may have a case to negotiate.';
      salNote = 'Your current salary is ' + Math.abs(diff) + '% below market median (RM ' + median.toLocaleString() + ')';
    } else if (current > high) {
      posText = 'You are earning above market rate. Strong position!';
      salNote = 'You are ' + Math.abs(diff) + '% above market median (RM ' + median.toLocaleString() + ')';
    } else {
      posText = 'Your salary is within the market range.';
      salNote = 'Market median for this role is RM ' + median.toLocaleString() + '/month';
    }
  } else {
    posText = 'Median market rate for ' + job + ' in ' + state + '.';
    salNote = 'Based on Talentbank benchmarking data';
    pct     = 55;
  }

  document.getElementById('barFill').style.width    = pct + '%';
  document.getElementById('barMarker').style.left   = pct + '%';
  document.getElementById('positionText').textContent = posText;
  document.getElementById('salaryNote').textContent   = salNote;

  // Factors
  var skillImpact = selectedSkills.length > 0
    ? '+RM ' + (selectedSkills.length * 200).toLocaleString() + ' from skills'
    : 'Add in-demand skills to boost pay';

  var factors = [
    { icon: '📍', label: state + ' location',        note: STATE_MULTIPLIERS[state] >= 0.95 ? 'High-pay market'            : 'Location adjustment applied' },
    { icon: '⏱',  label: exp + ' years experience', note: '+RM ' + expBonus.toLocaleString() + ' from experience' },
    { icon: '🛠',  label: selectedSkills.length + ' skills verified', note: skillImpact }
  ];

  document.getElementById('factorsList').innerHTML = factors.map(function (f) {
    return '<div class="insight-row">'
      + '<div class="insight-icon">' + f.icon + '</div>'
      + '<div class="insight-text"><strong>' + f.label + '</strong>'
      + '<small>' + f.note + '</small></div>'
      + '</div>';
  }).join('');

  // Next steps
  var steps = [];
  if (selectedSkills.indexOf('Python') === -1) steps.push('Learn Python (+RM 400 avg)');
  if (selectedSkills.indexOf('AWS')    === -1) steps.push('Add a cloud skill (+RM 600 avg)');
  if (exp < 3) steps.push('Build 2–3 portfolio projects');
  steps.push('Negotiate using this market data');

  document.getElementById('nextStepsList').innerHTML = steps.slice(0, 3).map(function (s) {
    return '<div class="insight-row">'
      + '<div class="insight-icon">→</div>'
      + '<div class="insight-text">' + s + '</div>'
      + '</div>';
  }).join('');

  // Similar roles
  var similar = [
    { role: 'Senior ' + job,  salary: 'RM ' + (Math.round(high * 1.30 / 100) * 100).toLocaleString() + '/mo' },
    { role: job + ' (KL)',    salary: 'RM ' + (Math.round(base       / 100) * 100).toLocaleString() + '/mo' },
    { role: 'Lead ' + job,    salary: 'RM ' + (Math.round(high * 1.60 / 100) * 100).toLocaleString() + '/mo' }
  ];

  document.getElementById('similarRoles').innerHTML = similar.map(function (r) {
    return '<div class="insight-row">'
      + '<div class="insight-text" style="flex:1"><strong>' + r.role + '</strong></div>'
      + '<span class="tag tag-gold">' + r.salary + '</span>'
      + '</div>';
  }).join('');

  // Show result, hide form
  document.getElementById('cand-form').style.display = 'none';
  document.getElementById('cand-result').classList.remove('result-hidden');
  document.getElementById('s2').classList.add('done');
  document.getElementById('s3').classList.add('done');
}

// ─── Back to Form ──────────────────────────
function backToForm() {
  document.getElementById('cand-form').style.display = 'block';
  document.getElementById('cand-result').classList.add('result-hidden');
  document.getElementById('s2').classList.remove('done');
  document.getElementById('s3').classList.remove('done');
}
