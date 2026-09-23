import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative, resolve, sep } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '..')
const violations = []
const isStrict = process.argv.includes('--strict')

const conceptFiles = [
  'src/main.js',
  'vite.config.js',
  'src/router/index.js',
  'src/stores/auth.js',
  'src/stores/scrap.js',
  'src/api/http.js',
  'src/composables/useJobs.js',
  'src/composables/useMediaQuery.js',
  'src/composables/useFocusTrap.js',
  'src/utils/format.js',
  'src/components/base/BaseButton.vue',
  'src/components/base/BaseInput.vue',
  'src/components/base/BaseSelect.vue',
  'src/components/base/BaseTabs.vue',
  'src/components/base/BaseModal.vue',
  'src/components/job/JobCard.vue',
  'src/components/job/JobFilter.vue',
  'src/views/JobListView.vue',
  'src/views/JobDetailView.vue',
  'src/App.vue',
]

function displayPath(filePath) {
  return relative(projectRoot, filePath).split(sep).join('/')
}

function collectSourceFiles(directory) {
  if (!existsSync(directory)) return []

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name)

    if (entry.isDirectory()) return collectSourceFiles(entryPath)
    return ['.vue', '.js'].includes(extname(entry.name)) ? [entryPath] : []
  })
}

const componentSourceFiles = [
  ...collectSourceFiles(join(projectRoot, 'src/components')),
  ...collectSourceFiles(join(projectRoot, 'src/views')),
]

const importPattern = /\bimport\s*(?:\(\s*)?(?:[^'";]*?\s+from\s+)?(["'])([^"']+)\1\s*\)?/g

for (const filePath of componentSourceFiles) {
  const source = readFileSync(filePath, 'utf8')
  const importedModules = [...source.matchAll(importPattern)].map((match) => match[2])

  if (importedModules.includes('axios')) {
    violations.push(`${displayPath(filePath)}: axios를 직접 import할 수 없습니다.`)
  }

  if (importedModules.some((moduleName) => moduleName.startsWith('@/api/'))) {
    violations.push(`${displayPath(filePath)}: @/api/ 모듈을 직접 import할 수 없습니다.`)
  }
}

for (const file of conceptFiles) {
  const filePath = join(projectRoot, file)

  if (!existsSync(filePath)) {
    if (isStrict) violations.push(`${file}: 필수 파일이 없습니다.`)
    continue
  }

  const source = readFileSync(filePath, 'utf8')
  if (!source.includes('[개념]')) {
    violations.push(`${file}: [개념] 주석이 없습니다.`)
  }
  if (!source.includes('[Vue 2였다면]')) {
    violations.push(`${file}: [Vue 2였다면] 주석이 없습니다.`)
  }
}

const indexPath = join(projectRoot, 'index.html')
if (!existsSync(indexPath)) {
  violations.push('index.html: 파일이 없습니다.')
} else {
  const indexSource = readFileSync(indexPath, 'utf8')
  if (/user-scalable\s*=\s*["']?\s*no/i.test(indexSource)) {
    violations.push('index.html: 확대를 제한하는 user-scalable=no 설정을 사용할 수 없습니다.')
  }
  if (/maximum-scale\s*=/i.test(indexSource)) {
    violations.push('index.html: 확대를 제한하는 maximum-scale 설정을 사용할 수 없습니다.')
  }
}

if (violations.length > 0) {
  console.error('verify: FAILED')
  for (const violation of violations) console.error(`- ${violation}`)
  process.exit(1)
}

console.log('verify: OK')
