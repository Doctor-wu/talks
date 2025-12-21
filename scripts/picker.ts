import fs from 'node:fs/promises'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { execa } from 'execa'
import prompts from 'prompts'

async function getDirectories(dir: URL): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  return entries
    .filter(entry => entry.isDirectory())
    .filter(entry => !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'dist')
    .map(entry => entry.name)
    .sort((a, b) => -a.localeCompare(b))
}

async function hasSrcDir(dir: URL): Promise<boolean> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true })
    return entries.some(e => e.isDirectory() && e.name === 'src')
  } catch {
    return false
  }
}

async function selectFolderRecursive(dir: URL, basePath: string = '', autoSelect: boolean = false): Promise<string | null> {
  const directories = await getDirectories(dir)
  
  if (directories.length === 0) {
    return null
  }

  // 检查当前目录是否包含 src（表示这是一个有效的项目目录）
  const hasSrc = await hasSrcDir(dir)
  
  // 如果当前目录有 src 且不是根目录，直接返回当前路径（不需要再选择）
  if (hasSrc && basePath !== '') {
    return basePath
  }

  // 筛选出纯数字目录（一级菜单）或其他目录（二级及以下菜单）
  const numericDirs = directories.filter(name => /^\d+$/.test(name))
  const otherDirs = directories.filter(name => !/^\d+$/.test(name))
  
  let choices: Array<{ title: string; value: string }> = []
  
  // 如果当前路径为空，只显示纯数字目录（一级菜单）
  if (basePath === '') {
    choices = numericDirs.map(name => ({ title: name, value: name }))
  } else {
    // 如果没有 src，显示子目录供选择
    if (otherDirs.length > 0) {
      choices = otherDirs.map(name => ({ title: name, value: name }))
    }
  }

  if (choices.length === 0) {
    return null
  }

  let selected: string
  if (autoSelect) {
    selected = choices[0].value
  } else {
    const message = basePath === '' ? '选择年份' : `选择项目 (${basePath})`
    
    const result = await prompts([
      {
        type: 'select',
        name: 'folder',
        message,
        choices,
      },
    ])
    
    if (!result.folder) {
      return null
    }
    selected = result.folder
  }

  // 构建新的路径并递归选择
  const newPath = basePath ? `${basePath}/${selected}` : selected
  const newDir = new URL(selected + '/', dir)
  
  return await selectFolderRecursive(newDir, newPath, autoSelect)
}

async function startPicker(args: string[]) {
  const autoSelect = args.includes('-y')
  const selectedFolder = await selectFolderRecursive(
    new URL('..', import.meta.url),
    '',
    autoSelect
  )

  if (!selectedFolder) {
    return
  }

  args = args.filter(arg => arg !== '-y')

  if (args[0] === 'dev') {
    await execa('cursor', [fileURLToPath(new URL(`../${selectedFolder}/src/slides.md`, import.meta.url))])
  }
  
  await execa('pnpm', ['run', ...args], {
    cwd: new URL(`../${selectedFolder}/src`, import.meta.url),
    stdio: 'inherit',
  })
}

await startPicker(process.argv.slice(2))
