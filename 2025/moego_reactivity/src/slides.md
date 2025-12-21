---
layout: cover
highlighter: shiki
css: unocss
colorSchema: dark
transition: fade-out
mdc: true
glowSeed: 7
title: 给 React 开发者的响应式原理分享
---

<h2>给 React 开发者的响应式原理分享</h2>
<p class="text-gray-400 text-s">
Doctor Wu / 2025 08
</p>

---
layout: intro
class: pl-35
glowSeed: 12
---

## Doctor Wu

<div class="[&>*]:important-leading-10 opacity-80">

{Vue} {VueUse} 核心团队成员<br>
现就职于 {MoeGo}<br>

</div>

<div my-10 w-max flex="~ gap-1" items-center justify-center>
  <div i-ri-user-3-line op50 ma text-xl />
  <div><a href="https://doctorwu.me" target="_blank" class="border-none! font-300">doctorwu.me</a></div>
  <div i-ri-github-line op50 ma text-xl ml4/>
  <div><a href="https://github.com/Doctor-wu" target="_blank" class="border-none! font-300">Doctor-wu</a></div>
  <div i-ri-twitter-x-line op50 ma text-xl ml4/>
  <div><a href="https://twitter.com/Doctorwu666" target="_blank" class="border-none! font-300">Doctorwu666</a></div>
  <div i-ri-bilibili-line op50 ma text-xl ml4/>
  <div><a href="https://space.bilibili.com/343921694" target="_blank" class="border-none! font-300" ws-nowrap>Doctor___Wu</a></div>
 </div>

<img src="https://github.com/Doctor-wu.png" absolute top-36 right-35 w-40 rounded-full/>

---
---

## 今天聊什么

- 基础心智模型：React setState/useEffect vs Vue ref/computed/effect
- 从依赖声明到自动追踪：为什么不再需要 deps 数组
- 常见坑位对比：闭包、竞态、过度渲染、依赖遗漏
- 性能与调度：批量更新、脏值检查、去重调度
- 在 React 项目中使用 Vue 响应式（可选桥接）

---
---

## React vs Vue：最小对比

```tsx
// React
function Counter() {
  const [count, setCount] = useState(0)
  const double = useMemo(() => count * 2, [count])
  useEffect(() => {
    document.title = `count: ${count}`
  }, [count])
  return <button onClick={() => setCount(v => v + 1)}>{double}</button>
}
```

```ts
// Vue（Composition API 原语）
import { ref, computed, watchEffect } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)
watchEffect(() => {
  document.title = `count: ${count.value}`
})
// 在组件 <script setup> 中直接使用
```

---
---

## 自动依赖追踪 vs 依赖声明

- React 需要在 `useMemo`/`useEffect` 中维护依赖数组
- Vue 通过运行期收集依赖，省去显式 deps；避免遗漏与过量依赖

```ts
const a = ref(1)
const b = ref(2)
const sum = computed(() => a.value + b.value) // 自动追踪 a、b
```

---
---

## 常见坑位对比（节选）

- 闭包陷阱：React 需要小心 stale closure；Vue 的计算值始终读取最新依赖
- 依赖遗漏：React deps 数组容易出错；Vue 自动收集
- 过度渲染：React effect 依赖过宽；Vue 以最小依赖触发

---
---

## Vue 原语一览（给 React 开发者）

- `ref`：类似 `useState` 的容器，但不绑定组件生命周期
- `reactive`：对象级响应
- `computed`：类 `useMemo`，但自动依赖追踪
- `watchEffect`：类 `useEffect`，但自动收集依赖并去重调度

---
---

## 计算属性 computed

```ts
const price = ref(100)
const count = ref(2)
const total = computed(() => price.value * count.value)

// total 仅在 price 或 count 变化时重算
```

---
layout: fact
---

## 副作用 watchEffect（自动依赖）

```ts
const q = ref('vue')
watchEffect(async () => {
  // 仅在 q 变化时重新执行
  const res = await fetch(`/api/search?q=${q.value}`)
  // ...
})
```

提示：配合节流/去抖与中断控制可避免竞态与抖动。

---
layout: fact
---

## 批量与去重调度（直觉版）

```ts
// 同一 tick 内多次 set，不会造成多次 effect 执行
const n = ref(0)
watchEffect(() => console.log('render with', n.value))

Promise.resolve().then(() => {
  n.value++
  n.value++
  n.value++
})
// 控制台只打印一次
```

---
layout: fact
---

## 与 React 互操作（可选）

在 React 中可用 `useSyncExternalStore` 对接 `@vue/reactivity`：

```tsx
// react-bridge.tsx（思路示例）
import { effect, stop, ref } from '@vue/reactivity'
import { useSyncExternalStore } from 'react'

export function useSignal<T>(initial: T) {
  const s = ref(initial)
  const subscribe = (cb: () => void) => {
    const runner = effect(() => { s.value; cb() })
    return () => stop(runner)
  }
  const getSnapshot = () => s.value
  const value = useSyncExternalStore(subscribe, getSnapshot)
  return [value, (v: T) => (s.value = v)] as const
}
```

---
layout: fact
---

## 最佳实践速记

- 先用 `ref`/`computed` 表达数据关系，再落到 `watchEffect` 做副作用
- 将副作用按“读/写/订阅外部资源”分类；最小化依赖
- 组件外也可持有状态（不强绑组件生命周期）

---
layout: fact
---

## 进一步阅读

<PR link="https://github.com/vuejs/core/pull/5912" title="feat(reactivity): more efficient reactivity system" />
<br>
<Repo name="vuejs/core" /> ・ <Repo name="preactjs/signals" />

---
layout: fact
---

## Thank you!

<section pt-10 text-s text-gray-400>
Created using <logos-slidev ml-2 /> Slidev
</section>


