#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tldrawDir = path.join(__dirname, '../talks/2025/moegobff_sz/src/public/tldraw');

// 画布配置
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;
const PADDING = 40; // 边距

function optimizeTldrawFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  
  const store = data.store;
  const shapes = [];
  
  // 收集所有 shape
  for (const key of Object.keys(store)) {
    if (key.startsWith('shape:')) {
      shapes.push(store[key]);
    }
  }
  
  if (shapes.length === 0) {
    console.log(`  跳过 ${path.basename(filePath)}: 没有 shape`);
    return;
  }
  
  // 计算当前边界
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  
  for (const shape of shapes) {
    const x = shape.x || 0;
    const y = shape.y || 0;
    const w = shape.props?.w || 0;
    const h = shape.props?.h || 0;
    
    // 对于 arrow 类型，计算实际边界
    if (shape.type === 'arrow') {
      const startX = x + (shape.props?.start?.x || 0);
      const startY = y + (shape.props?.start?.y || 0);
      const endX = x + (shape.props?.end?.x || 0);
      const endY = y + (shape.props?.end?.y || 0);
      
      minX = Math.min(minX, Math.min(startX, endX));
      maxX = Math.max(maxX, Math.max(startX, endX));
      minY = Math.min(minY, Math.min(startY, endY));
      maxY = Math.max(maxY, Math.max(startY, endY));
    } else {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x + w);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y + h);
    }
  }
  
  // 计算当前尺寸
  const currentWidth = maxX - minX;
  const currentHeight = maxY - minY;
  
  // 计算居中偏移
  const targetCenterX = CANVAS_WIDTH / 2;
  const targetCenterY = CANVAS_HEIGHT / 2;
  const currentCenterX = minX + currentWidth / 2;
  const currentCenterY = minY + currentHeight / 2;
  
  const offsetX = targetCenterX - currentCenterX;
  const offsetY = targetCenterY - currentCenterY;
  
  let changes = [];
  
  // 更新所有 shape
  for (const shape of shapes) {
    // 1. 居中调整
    if (Math.abs(offsetX) > 5 || Math.abs(offsetY) > 5) {
      shape.x = Math.round((shape.x || 0) + offsetX);
      shape.y = Math.round((shape.y || 0) + offsetY);
      changes.push('居中');
    }
    
    // 2. 修改字体为 sans
    if (shape.props?.font === 'draw') {
      shape.props.font = 'sans';
      changes.push('字体');
    }
    
    // 3. 修改线条为实线
    if (shape.props?.dash === 'draw') {
      shape.props.dash = 'solid';
      changes.push('线条');
    }
  }
  
  // 保存文件
  if (changes.length > 0) {
    const uniqueChanges = [...new Set(changes)];
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`  ✓ ${path.basename(filePath)}: ${uniqueChanges.join(', ')}`);
  } else {
    console.log(`  - ${path.basename(filePath)}: 无需修改`);
  }
}

// 主程序
console.log('优化 tldraw 文件...\n');

const files = fs.readdirSync(tldrawDir)
  .filter(f => f.endsWith('.json'))
  .map(f => path.join(tldrawDir, f));

console.log(`找到 ${files.length} 个文件\n`);

for (const file of files) {
  try {
    optimizeTldrawFile(file);
  } catch (e) {
    console.error(`  ✗ ${path.basename(file)}: ${e.message}`);
  }
}

console.log('\n完成!');

