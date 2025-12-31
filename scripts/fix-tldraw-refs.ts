#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

/**
 * 修复 Slidev 文件中的 tldraw 引用
 * 将 document 属性的值还原到 doc 字段
 * 
 * 例如：
 * <tldraw document="doc-bff-architecture" class="h-90" doc="tldraw/doc-xxx.json"></tldraw>
 * 修复为：
 * <tldraw document="doc-bff-architecture" class="h-90" doc="tldraw/doc-bff-architecture.json"></tldraw>
 */

function fixTldrawRefs(filePath: string) {
  console.log(`处理文件: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let changeCount = 0;
  
  // 匹配 tldraw 标签的正则表达式
  // 捕获 document 属性的值和整个 doc 属性
  const tldrawRegex = /<tldraw\s+document="([^"]+)"([^>]*?)doc="tldraw\/[^"]*\.json"([^>]*?)>/g;
  
  content = content.replace(tldrawRegex, (match, documentValue, beforeDoc, afterDoc) => {
    const newDocValue = `tldraw/${documentValue}.json`;
    const fixed = `<tldraw document="${documentValue}"${beforeDoc}doc="${newDocValue}"${afterDoc}>`;
    
    if (match !== fixed) {
      changeCount++;
      console.log(`  ✅ 修复: ${documentValue}`);
      console.log(`     原: doc="..."`);
      console.log(`     新: doc="${newDocValue}"`);
    }
    
    return fixed;
  });
  
  if (changeCount > 0) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`\n✨ 共修复 ${changeCount} 处引用\n`);
  } else {
    console.log(`\n✅ 未发现需要修复的引用\n`);
  }
  
  return changeCount;
}

// 获取命令行参数
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ 请提供 slides.md 文件路径');
  console.log('\n用法:');
  console.log('  pnpm tsx scripts/fix-tldraw-refs.ts <slides.md路径>');
  console.log('\n示例:');
  console.log('  pnpm tsx scripts/fix-tldraw-refs.ts talks/2025/moegobff_sz/src/slides.md');
  process.exit(1);
}

const filePath = path.resolve(process.cwd(), args[0]);

if (!fs.existsSync(filePath)) {
  console.error(`❌ 文件不存在: ${filePath}`);
  process.exit(1);
}

console.log('🔧 开始修复 tldraw 引用...\n');
fixTldrawRefs(filePath);
console.log('✅ 完成！');

