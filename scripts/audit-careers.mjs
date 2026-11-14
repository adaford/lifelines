// node scripts/audit-careers.mjs --baseline .git/career-realism-baseline/jobs.json --output test-artifacts/careers-audit.json
import { readFile, writeFile } from 'node:fs/promises';
import { JOBS } from '../jobs.js';
import { CAREER_SOURCES } from '../career-profiles.js';
import { careerFit, careerYear } from '../career-rules.js';
import { lifestyleFromResources } from '../lifestyle.js';
const args = process.argv.slice(2);
const option = key => args.includes(key) ? args[args.indexOf(key) + 1] : null;
const keys = ['intelligence', 'strength', 'attractiveness', 'social', 'creativity'];
const neutral = Object.fromEntries(keys.map(key => [key, 5]));
const report = {
  assumptions: 'All rating caps, pay anchors and potential scores are fictional balancing choices informed by occupational duties and advancement paths, not real-world wage ceilings or guaranteed outcomes. Each cap applies to earnings in this role; wealth, household support and a later career change remain separate.',
  sources: CAREER_SOURCES,
  count: JOBS.length,
  roles: JOBS.map(job => ({
    id: job.id, name: job.name, category: job.category,
    duties: job.description, successFactors: job.affinities, normalizedWeights: job.weights,
    age: job.minAge, requiresCollege: job.requiresCollege, requirements: job.requirements,
    baseSalary: job.baseSalary, baseLifestyle: job.baseLifestyle, maxSalary: job.maxSalary, maxLifestyle: job.maxLifestyle,
    advancementPotential: job.advancementPotential, advancementDescription: job.advancementDescription,
    neutralFit: careerFit(job, neutral),
    marginalFit: Object.fromEntries(keys.map(key => [key, careerFit(job, { ...neutral, [key]: 6 }) - careerFit(job, neutral)])),
    maximumOutcome: careerYear({ job, stats: Object.fromEntries(keys.map(key => [key, 10])), focus: 4, years: 40, progress: 1 }),
  })),
};
const problems = [];
if (new Set(JOBS.map(job => job.id)).size !== JOBS.length) problems.push('Repeated job IDs');
for (const role of report.roles) {
  if (!(role.maxSalary > role.baseSalary && role.maxLifestyle > role.baseLifestyle && role.maxLifestyle < 10)) problems.push(`${role.id}: invalid cap`);
  if (role.maximumOutcome.income > role.maxSalary) problems.push(`${role.id}: income exceeds cap`);
  if (role.maxLifestyle !== lifestyleFromResources(role.maxSalary, 0)) problems.push(`${role.id}: mismatched resource scale`);
  if (!(role.advancementPotential > 0 && role.advancementPotential <= 10)) problems.push(`${role.id}: invalid potential`);
}
if (option('--baseline')) {
  const baseline = JSON.parse(await readFile(option('--baseline'), 'utf8'));
  const current = new Map(JOBS.map(job => [job.id, job]));
  const protectedFields = ['id', 'name', 'category', 'description', 'minAge', 'requirements', 'requiresCollege', 'baseSalary'];
  report.baseline = {
    count: baseline.length,
    removed: baseline.filter(job => !current.has(job.id)).map(job => job.id),
    eligibilityOrIdentityChanges: baseline.flatMap(job => protectedFields.filter(field => JSON.stringify(job[field]) !== JSON.stringify(current.get(job.id)?.[field])).map(field => `${job.id}:${field}`)),
    fitChanges: baseline.filter(job => JSON.stringify(job.weights) !== JSON.stringify(current.get(job.id)?.weights)).map(job => job.id),
    added: JOBS.filter(job => !baseline.some(old => old.id === job.id)).map(job => job.id),
  };
  problems.push(...report.baseline.removed, ...report.baseline.eligibilityOrIdentityChanges);
}
report.problems = problems;
if (option('--output')) await writeFile(option('--output'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ count: report.count, problems, baseline: report.baseline, output: option('--output') }, null, 2));
if (problems.length) process.exitCode = 1;
