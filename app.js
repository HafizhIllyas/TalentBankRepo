/* ============================================
   TalentR — Shared App Logic
   Import this in any page that needs
   interactivity (skill toggles, salary calc)
============================================ */

// ─── Skill Toggle ─────────────────────────
function toggleSkill(el) {
  if (el.classList.contains('tag-gold')) {
    el.className = 'tag tag-neutral skill-tag';
  } else {
    el.className = 'tag tag-gold skill-tag';
  }
}

// ─── Salary Data ──────────────────────────
var BASE_SALARIES = {
  'Software Engineer':   6200,
  'Data Analyst':        5100,
  'Product Manager':     7800,
  'UI/UX Designer':      5400,
  'Marketing Executive': 4200,
  'HR Executive':        4000,
  'Business Analyst':    5800,
  'DevOps Engineer':     7000
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

// ─── Get Selected Skills ──────────────────
function getSelectedSkills() {
  var selected = [];
  document.querySelectorAll('.skill-tag.tag-gold').forEach(function (el) {
    selected.push(el.textContent.trim());
  });
  return selected;
}

// ─── Calculate Salary ─────────────────────
// Called from 02-candidate-form.html
// Stores result in sessionStorage, then
// redirects to the loading → results page
function calcSalary() {
  var job     = document.getElementById('jobTitle').value;
  var state   = document.getElementById('state').value;
  var exp     = parseInt(document.getElementById('expRange').value);
  var current = parseInt(document.getElementById('currentSalary').value) || 0;

  if (!job || !state) {
    alert('Please select a job title and state.');
    return;
  }

  var expBonus   = Math.min(exp * 180, 2000);
  var skills     = getSelectedSkills();
  var skillBonus = skills.length * 200;
  var base       = BASE_SALARIES[job]   || 5000;
  var mult       = STATE_MULTIPLIERS[state] || 0.85;
  var median     = Math.round((base * mult + expBonus + skillBonus) / 100) * 100;
  var low        = Math.round(median * 0.82 / 100) * 100;
  var high       = Math.round(median * 1.22 / 100) * 100;

  // Save to sessionStorage so results page can read it
  sessionStorage.setItem('tr_result', JSON.stringify({
    job: job, state: state, exp: exp,
    current: current, skills: skills,
    median: median, low: low, high: high,
    expBonus: expBonus, skillBonus: skillBonus,
    stateMult: STATE_MULTIPLIERS[state] || 0.85
  }));

  window.location.href = '03-loading.html';
}

// ─── Render Results ───────────────────────
// Called on 04-candidate-results.html on load
function renderResults() {
  var raw = sessionStorage.getItem('tr_result');

  // Fallback demo data if no session (e.g. direct page load)
  var d = raw ? JSON.parse(raw) : {
    job: 'Software Engineer', state: 'Kuala Lumpur', exp: 3,
    current: 5100, skills: ['SQL', 'React'],
    median: 6200, low: 5100, high: 7600,
    expBonus: 540, skillBonus: 400, stateMult: 1.0
  };

  // Subtitle
  document.getElementById('resultSubtitle').textContent =
    d.job + ' · ' + d.state + ' · ' + d.exp + 'yr exp';

  // Salary range
  document.getElementById('salaryRange').textContent =
    'RM ' + d.low.toLocaleString() + ' — RM ' + d.high.toLocaleString() + '/month';
  document.getElementById('barMin').textContent = 'RM ' + d.low.toLocaleString();
  document.getElementById('barMax').textContent = 'RM ' + d.high.toLocaleString();

  // Bar position & note
  var pct = 55; var posText = ''; var salNote = '';

  if (d.current > 0) {
    var diff = ((d.current - d.median) / d.median * 100).toFixed(0);
    pct = Math.min(Math.max(
      Math.round(((d.current - d.low) / (d.high - d.low)) * 100), 5), 95);

    if (d.current < d.low) {
      posText = 'You are earning below the market range — you may have a case to negotiate.';
      salNote = 'Your current salary is ' + Math.abs(diff) + '% below market median (RM ' + d.median.toLocaleString() + ')';
    } else if (d.current > d.high) {
      posText = 'You are earning above market rate. Strong position!';
      salNote = 'You are ' + Math.abs(diff) + '% above market median (RM ' + d.median.toLocaleString() + ')';
    } else {
      posText = 'Your salary is within the market range.';
      salNote = 'Market median for this role is RM ' + d.median.toLocaleString() + '/month';
    }
  } else {
    posText = 'Median market rate for ' + d.job + ' in ' + d.state + '.';
    salNote = 'Based on Talentbank benchmarking data';
  }

  document.getElementById('barFill').style.width  = pct + '%';
  document.getElementById('barMarker').style.left = pct + '%';
  document.getElementById('positionText').textContent = posText;
  document.getElementById('salaryNote').textContent   = salNote;

  // Factors
  var skillImpact = d.skills.length > 0
    ? '+RM ' + d.skillBonus.toLocaleString() + ' from skills'
    : 'Add in-demand skills to boost pay';

  document.getElementById('factorsList').innerHTML = [
    { icon: '📍', label: d.state + ' location',       note: d.stateMult >= 0.95 ? 'High-pay market' : 'Location adjustment applied' },
    { icon: '⏱',  label: d.exp + ' years experience', note: '+RM ' + d.expBonus.toLocaleString() + ' from experience' },
    { icon: '🛠',  label: d.skills.length + ' skills verified', note: skillImpact }
  ].map(function (f) {
    return '<div class="insight-row">'
      + '<div class="insight-icon">' + f.icon + '</div>'
      + '<div class="insight-text"><strong>' + f.label + '</strong>'
      + '<small>' + f.note + '</small></div></div>';
  }).join('');

  // Next steps
  var steps = [];
  if (d.skills.indexOf('Python') === -1) steps.push('Learn Python (+RM 400 avg)');
  if (d.skills.indexOf('AWS')    === -1) steps.push('Add a cloud skill (+RM 600 avg)');
  if (d.exp < 3) steps.push('Build 2–3 portfolio projects');
  steps.push('Negotiate using this market data');

  document.getElementById('nextStepsList').innerHTML = steps.slice(0, 3).map(function (s) {
    return '<div class="insight-row">'
      + '<div class="insight-icon">→</div>'
      + '<div class="insight-text">' + s + '</div></div>';
  }).join('');

  // Similar roles
  document.getElementById('similarRoles').innerHTML = [
    { role: 'Senior ' + d.job, salary: 'RM ' + (Math.round(d.high * 1.30 / 100) * 100).toLocaleString() + '/mo' },
    { role: d.job + ' (KL)',   salary: 'RM ' + (Math.round((BASE_SALARIES[d.job] || 5000) / 100) * 100).toLocaleString() + '/mo' },
    { role: 'Lead ' + d.job,   salary: 'RM ' + (Math.round(d.high * 1.60 / 100) * 100).toLocaleString() + '/mo' }
  ].map(function (r) {
    return '<div class="insight-row">'
      + '<div class="insight-text" style="flex:1"><strong>' + r.role + '</strong></div>'
      + '<span class="tag tag-gold">' + r.salary + '</span></div>';
  }).join('');
}
