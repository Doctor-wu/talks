import fs from 'node:fs/promises'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { execa } from 'execa'
import prompts from 'prompts'

async function startPicker(args: string[]) {
  const talksDir = new URL('../talks', import.meta.url)
  
  // 获取所有年份目录
  const years = (await fs.readdir(talksDir, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(year => year.match(/^\d{4}$/))
    .sort((a, b) => -a.localeCompare(b))

  if (years.length === 0) {
    console.error('No year directories found in talks/')
    return
  }

  // 选择年份
  const yearResult = args.includes('-y')
    ? { year: years[0] }
    : await prompts([
        {
          type: 'select',
          name: 'year',
          message: 'Pick a year',
          choices: years.map(year => ({ title: year, value: year })),
        },
      ])

  if (!yearResult.year) return

  // 获取该年份下的所有分享目录
  const yearDir = new URL(`../talks/${yearResult.year}`, import.meta.url)
  const talks = (await fs.readdir(yearDir, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .sort((a, b) => -a.localeCompare(b))

  if (talks.length === 0) {
    console.error(`No talks found in talks/${yearResult.year}/`)
    return
  }

  // 选择分享
  const talkResult = args.includes('-y')
    ? { talk: talks[0] }
    : await prompts([
        {
          type: 'select',
          name: 'talk',
          message: 'Pick a talk',
          choices: talks.map(talk => ({ title: talk, value: talk })),
        },
      ])

  args = args.filter(arg => arg !== '-y')

  if (talkResult.talk) {
    const talkPath = `../talks/${yearResult.year}/${talkResult.talk}/src`
    if (args[0] === 'dev')
      await execa('cursor', [fileURLToPath(new URL(`${talkPath}/slides.md`, import.meta.url))])
    await execa('pnpm', ['run', ...args], {
      cwd: new URL(talkPath, import.meta.url),
      stdio: 'inherit',
    })
  }
}

await startPicker(process.argv.slice(2))
