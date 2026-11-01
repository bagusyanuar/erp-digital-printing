#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const ROOT_DIR = process.cwd();
const ROOT_PKG_PATH = path.join(ROOT_DIR, 'package.json');
const APP_PKG_PATH = path.join(ROOT_DIR, 'apps/back-office-app/package.json');

// Helper to run shell command and return stdout
function run(cmd, options = {}) {
  return execSync(cmd, { encoding: 'utf-8', ...options }).trim();
}

// Helper to parse semver string [major, minor, patch]
function parseSemver(versionStr) {
  const match = versionStr.match(/^(\d+)\.(\d+)\.(\d+)(.*)$/);
  if (!match) return null;
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || ''
  };
}

function bumpVersion(currentVersion, bumpType) {
  const parsed = parseSemver(currentVersion);
  if (!parsed) {
    throw new Error(`Invalid semver format: ${currentVersion}`);
  }

  const { major, minor, patch } = parsed;
  switch (bumpType) {
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'major':
      return `${major + 1}.0.0`;
    default:
      return bumpType; // Custom version string
  }
}

async function main() {
  const rl = readline.createInterface({ input, output });

  try {
    console.log('\n🚀 ========================================');
    console.log('   Monorepo Release & Version Bump Tool   ');
    console.log('========================================\n');

    // 1. Read current version from root package.json
    if (!fs.existsSync(ROOT_PKG_PATH)) {
      console.error('❌ Root package.json not found!');
      process.exit(1);
    }
    const rootPkg = JSON.parse(fs.readFileSync(ROOT_PKG_PATH, 'utf-8'));
    const currentVersion = rootPkg.version || '1.0.0';

    console.log(`📌 Current Base Version: \x1b[36m${currentVersion}\x1b[0m\n`);

    // 2. Parse CLI arguments or prompt
    const args = process.argv.slice(2);
    let target = args[0]?.toLowerCase(); // 'dev' or 'prod'
    let bumpType = args[1]?.toLowerCase(); // 'patch', 'minor', 'major', or specific version

    // Target Selection
    if (!target || !['dev', 'prod'].includes(target)) {
      console.log('Pilih Target Environment:');
      console.log('  1) dev  -> Tag: dev-vX.Y.Z (Memicu Docker CI Dev)');
      console.log('  2) prod -> Tag: vX.Y.Z     (Memicu Docker CI/CD Prod)');
      const targetAns = (await rl.question('\nPilihan (1/2 atau dev/prod) [default: 1]: ')).trim().toLowerCase();

      if (targetAns === '2' || targetAns === 'prod') {
        target = 'prod';
      } else {
        target = 'dev';
      }
    }

    const tagPrefix = target === 'dev' ? 'dev-v' : 'v';
    console.log(`🎯 Target Environment : \x1b[33m${target.toUpperCase()}\x1b[0m (Prefix Git Tag: \x1b[35m${tagPrefix}\x1b[0m)\n`);

    // Check if the current base version is already tagged in git
    const candidateCurrentTag = `${tagPrefix}${currentVersion}`;
    let isCurrentVersionTagged = false;
    try {
      isCurrentVersionTagged = Boolean(run(`git tag -l "${candidateCurrentTag}"`));
    } catch {
      isCurrentVersionTagged = false;
    }

    // Bump Type Selection
    const parsed = parseSemver(currentVersion) || { major: 1, minor: 0, patch: 0 };
    const patchPreview = `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
    const minorPreview = `${parsed.major}.${parsed.minor + 1}.0`;
    const majorPreview = `${parsed.major + 1}.0.0`;

    if (!bumpType) {
      console.log(`Pilih Tipe Version Bump:`);
      if (!isCurrentVersionTagged) {
        console.log(`  0) initial -> Tag: \x1b[35m${tagPrefix}${currentVersion}\x1b[0m (Versi package.json: ${currentVersion})`);
      }
      console.log(`  1) patch   -> Tag: \x1b[35m${tagPrefix}${patchPreview}\x1b[0m (Versi package.json: ${patchPreview})`);
      console.log(`  2) minor   -> Tag: \x1b[35m${tagPrefix}${minorPreview}\x1b[0m (Versi package.json: ${minorPreview})`);
      console.log(`  3) major   -> Tag: \x1b[35m${tagPrefix}${majorPreview}\x1b[0m (Versi package.json: ${majorPreview})`);
      console.log(`  4) custom  -> Masukkan versi manual`);

      const defaultChoice = !isCurrentVersionTagged ? '0' : '1';
      const promptRange = !isCurrentVersionTagged ? '0-4' : '1-4';
      const bumpAns = (await rl.question(`\nPilihan (${promptRange}) [default: ${defaultChoice}]: `)).trim();

      if (!isCurrentVersionTagged && (bumpAns === '0' || bumpAns === 'initial' || bumpAns === '')) {
        bumpType = currentVersion;
      } else if (bumpAns === '2' || bumpAns === 'minor') {
        bumpType = 'minor';
      } else if (bumpAns === '3' || bumpAns === 'major') {
        bumpType = 'major';
      } else if (bumpAns === '4' || bumpAns === 'custom') {
        const customVer = (await rl.question(`Masukkan versi baru (contoh: ${currentVersion}): `)).trim();
        if (!parseSemver(customVer)) {
          console.error('❌ Format versi tidak valid (harus semver misal: X.Y.Z)');
          process.exit(1);
        }
        bumpType = customVer;
      } else {
        bumpType = 'patch';
      }
    }

    // 3. Compute New Version & Tag Name
    const newVersion = ['patch', 'minor', 'major'].includes(bumpType)
      ? bumpVersion(currentVersion, bumpType)
      : bumpType;

    const tagName = target === 'dev' ? `dev-v${newVersion}` : `v${newVersion}`;

    console.log('\n----------------------------------------');
    console.log(`🎯 Target      : \x1b[33m${target.toUpperCase()}\x1b[0m`);
    console.log(`📦 Versi Baru  : \x1b[32m${newVersion}\x1b[0m`);
    console.log(`🏷️  Git Tag     : \x1b[35m${tagName}\x1b[0m`);
    console.log('----------------------------------------\n');

    // Check if tag already exists in local git
    try {
      const existingTag = run(`git tag -l "${tagName}"`);
      if (existingTag) {
        console.error(`❌ Tag "${tagName}" sudah ada di lokal git! Gunakan versi lain.`);
        process.exit(1);
      }
    } catch {
      // ignore
    }

    // Check working directory status
    const gitStatus = run('git status --porcelain');
    if (gitStatus) {
      console.log('⚠️  Perhatian: Ada perubahan file yang belum di-commit:');
      console.log(gitStatus);
      const proceed = (await rl.question('\nLanjutkan proses release? (y/N): ')).trim().toLowerCase();
      if (proceed !== 'y') {
        console.log('❌ Release dibatalkan.');
        process.exit(0);
      }
    }

    // Final confirmation
    const confirm = (await rl.question(`Yakin ingin merilis ${tagName}? (Y/n): `)).trim().toLowerCase();
    if (confirm !== '' && confirm !== 'y') {
      console.log('❌ Release dibatalkan.');
      process.exit(0);
    }

    // 4. Update package.json files
    console.log('\n📝 Mengupdate file package.json...');
    rootPkg.version = newVersion;
    fs.writeFileSync(ROOT_PKG_PATH, JSON.stringify(rootPkg, null, 2) + '\n');
    console.log('  ✓ Updated root package.json');

    if (fs.existsSync(APP_PKG_PATH)) {
      const appPkg = JSON.parse(fs.readFileSync(APP_PKG_PATH, 'utf-8'));
      appPkg.version = newVersion;
      fs.writeFileSync(APP_PKG_PATH, JSON.stringify(appPkg, null, 2) + '\n');
      console.log('  ✓ Updated apps/back-office-app/package.json');
    }

    // 5. Git Commit & Tag
    console.log('\n📌 Membuat Git Commit & Tag...');
    const commitMsg = target === 'dev'
      ? `chore(release): dev-v${newVersion}`
      : `chore(release): v${newVersion}`;

    run(`git add package.json apps/back-office-app/package.json`);
    run(`git commit -m "${commitMsg}"`);
    console.log(`  ✓ Commit created: "${commitMsg}"`);

    run(`git tag -a "${tagName}" -m "Release ${tagName}"`);
    console.log(`  ✓ Tag created: ${tagName}`);

    // 6. Push to Remote GitHub
    const pushAns = (await rl.question('\n🚀 Push commit dan tag ke GitHub origin sekarang? (Y/n): ')).trim().toLowerCase();
    if (pushAns === '' || pushAns === 'y') {
      const currentBranch = run('git rev-parse --abbrev-ref HEAD');
      console.log(`\nPushing to origin/${currentBranch}...`);
      run(`git push origin ${currentBranch}`);
      console.log(`Pushing tag ${tagName} to origin...`);
      run(`git push origin ${tagName}`);
      console.log(`\n🎉 Berhasil! Workflow GitHub Actions untuk ${target.toUpperCase()} otomatis berjalan.`);
    } else {
      console.log('\nℹ️  Kamu bisa push manual kapan saja dengan:');
      console.log(`   git push origin && git push origin ${tagName}`);
    }

  } catch (err) {
    console.error('\n❌ Terjadi kesalahan saat release:', err.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();

