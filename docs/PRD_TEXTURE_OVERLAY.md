# 产品需求文档 (PRD)：RedCanvas 材质遮罩与胶片颗粒系统 (Texture Overlay & Film Grain)

| 文档版本 | 状态 | 编写人 | 适用范围 | 最后更新时间 |
| :--- | :--- | :--- | :--- | :--- |
| **v1.2.0** | **已上线 (Implemented)** | AI 助手 / 产品团队 | RedCanvas Web & H5 端 | 2026-10-10 |

---

## 一、 背景与业务目标 (Background & Objective)

### 1.1 背景阐述
在小红书、Instagram 等视觉社交平台中，单纯的纯色或线性渐变背景已难以满足博主对“高级感”、“复古胶片感”和“纸张手账质感”的审美诉求。许多优质图文作品的视觉核心在于细腻的颗粒噪点（Grain）、纸张纤维纹理（Paper Texture）和统一的胶片滤镜调性。

在 RedCanvas 早期版本中：
1. **材质范围受限**：材质遮罩仅能作用于最底层背景，画面中的核心卡片、摄影插图与文字无法统一叠加质感，导致“前景与背景割裂”；
2. **移动端缺失**：移动端 H5 界面缺乏进入背景和材质遮罩的快捷操作路径；
3. **噪点粒度不可控**：固定尺寸的噪点在手机高分辨率视网膜屏上极不明显，无法满足用户对粗粝复古胶片（如 Kodak Tri-X 400）的定制需求；
4. **混合模式单一**：写死为 `overlay`，在某些极端亮暗场景下极易过曝或灰阶失真；
5. **代码耦合冗余**：多处面板重复实现相同的 UI 与控制逻辑，维护成本高。

### 1.2 目标与收益
- **用户价值**：让用户在 1 秒内为整张设计图或局部素材赋予专业杂志级的胶片颗粒与纸张肌理，所见即所得。
- **业务价值**：丰富 RedCanvas 的高阶质感工具链，增强小红书博主出图品质，提升模板复用率与成品保存率。
- **研发价值**：完成底层控制组件的高度封装（抽取 `TextureControlSection`），沉淀统一常量配置，降低后续扩展成本。

---

## 二、 用户画像与核心用例 (User Personas & Use Cases)

| 用户角色 | 核心场景 | 痛点 / 诉求 | 期望效果 |
| :--- | :--- | :--- | :--- |
| **小红书摄影/穿搭博主** | 胶片感排版、OOTD 拼图 | 手机拍摄原图偏数码感，排版显得平淡。 | 整张图片覆盖粗颗粒噪点，图片与背景融为一体，充满胶片颗粒质感。 |
| **手账/知识卡片博主** | 随笔语录、知识干货卡片 | 纯白或纯色卡片死板，缺乏纸质书籍印刷感。 | 叠加细微宣纸/牛皮纸/噪点纹理，前景文字清晰，背景与卡片呈现微纹理。 |
| **电商/活动促销设计师** | 醒目海报、促销大字报 | 画面需要特定风格（如朋克噪点、复古网点）。 | 自定义调节噪点大小与混合模式，适配不同明暗主色调。 |

---

## 三、 功能架构与详细需求 (Feature Specifications)

### 3.1 核心功能全景
```
RedCanvas 材质遮罩系统
├── 1. 作用范围分段 (Scope)
│   ├── 整张图片 (全画幅 / 'all') —— [顶层全局覆盖]
│   └── 仅限底层背景 ('bg')    —— [前景主体纯净]
├── 2. 材质库分类与预设 (Presets)
│   ├── 分类过滤: 全部 | 胶片 | 噪点 | 微粒 | 纸张 | 复古 | 几何
│   ├── 内置高质量无缝纹理卡片 (含即时预览)
│   └── 自定义外部图片 URL (PNG / SVG)
├── 3. 参数微调系统 (Controls)
│   ├── 颗粒浓度 (Opacity: 5% ~ 100%, 步长 5%, 默认 60%)
│   ├── 噪点大小 (Grain Size: 80px ~ 900px, 默认 320px)
│   │   └── 4 档快捷预设: 细腻(140px) | 适中(280px) | 明显(450px) | 粗粝(700px)
│   └── 混合模式 (Blend Mode, 默认 normal)
│       └── 正常(normal) | 叠加(overlay) | 柔光(soft-light) | 正片叠底(multiply) | 滤色(screen)
└── 4. 跨端适配
    ├── PC 端: 画布配置 Tab + 元素配置 Tab
    └── 移动端: 底部快捷浮层 & 配置抽屉呼出
```

---

### 3.2 详细功能规格

#### 需求点 1：作用范围选择（Texture Target Scope）
- **功能描述**：允许用户决定材质遮罩的层级深度。
- **选项定义**：
  1. **整张图片（全画幅 - `all`）**：
     - **行为**：纹理层挂载在画布的最顶层（`z-index: 40`，`pointer-events: none`）。
     - **视觉表现**：画面中所有图层（背景底色、图片卡片、贴纸、文字排版、水印）均统一蒙上颗粒，营造统一的拍摄冲印质感。
  2. **仅限底层背景（`bg`）**：
     - **行为**：纹理层仅挂载在底层背景容器内，位于所有前景浮动元素下方。
     - **视觉表现**：底色呈现材质肌理，但前景的人物照片、产品图和文字保持绝对高清纯净，互不干扰。
- **默认值**：`all`（整张图片全画幅）。

#### 需求点 2：噪点大小调节与快捷预设（Grain Size & Scale）
- **功能描述**：解决原先固定噪点尺寸在大屏/移动端不明显的问题，提供无级缩放与快速档位。
- **数值范围**：`80px` ～ `900px`，步长 `20px`，默认值 `320px`。
- **快捷预设档位**：
  - **细腻（140px）**：轻微质感，适合小清新手账、极简现代风；
  - **适中（280px）**：均衡效果，日常摄影与小红书通用推荐；
  - **明显（450px）**：经典 135 胶片颗粒感，电影画报风格；
  - **粗粝（700px）**：重颗粒、复古报纸、80 年代摇滚或朋克风。
- **交互规范**：点击预设档位立即联动滑块位置并同步更新画布。

#### 需求点 3：混合模式全面开放与默认值调整（Blend Mode）
- **功能描述**：支持 5 种最常用且视觉可预测的 CSS 混合模式。
- **核心变更**：**默认混合模式设为 `normal`（正常模式）**。
- **模式矩阵**：
  | 混合模式 | CSS 取值 | 特性与适用场景 | 默认状态 |
  | :--- | :--- | :--- | :--- |
  | **正常 (推荐)** | `normal` | 真实原图叠加，不改变画面底色明暗，最稳定可控 | **默认选中** |
  | **叠加** | `overlay` | 增强画面明暗对比，高光更透，暗部更沉 | 可选 |
  | **柔光** | `soft-light` | 柔和的胶片层次，不易过曝，适合人像或淡彩图 | 可选 |
  | **正片叠底** | `multiply` | 压暗整体色调，适合复古暗调、老报纸、复古做旧 | 可选 |
  | **滤色** | `screen` | 过滤暗部保留高光，适合星光、灰尘闪光材质 | 可选 |

#### 需求点 4：材质分类过滤与自定义接入
- **分类标签**：`全部`、`胶片`、`噪点`、`微粒`、`纸张`、`复古`、`几何`。
- **预设库预览**：每个预设卡片提供微缩深色背景实时渲染效果、名称与选中勾选状态。
- **自定义 URL**：支持用户粘贴任意无缝纹理 PNG/SVG 图片链接，并提供输入框一键清除与实时更新。

#### 需求点 5：移动端入口设计与适配
- **背景**：移动端屏幕空间受限，原先缺乏背景/全局配置的显式入口。
- **解决方案**：
  1. 移动端底部控制栏（`MobileConfigBar`）提供直接进入“画布/背景”配置的快捷入口；
  2. 弹出的移动端配置抽屉中，内嵌完整的 `TextureControlSection`；
  3. 滑块触控区域优化（加大触摸响应热区，防止误触）。

---

## 四、 技术架构与代码设计 (Technical Architecture)

### 4.1 数据模型 (Data Schema)
在 [`types.ts`](file:///c:/Users/huaye/Documents/Workspace/redcanvas/app/(projects)/redcanvas/types.ts) 中，图层元素及全局状态均统一遵循以下材质数据结构：
```typescript
export interface TextureConfig {
  /** 材质无缝贴图图片地址（为空表示无材质） */
  textureUrl?: string;
  /** 材质不透明度 (0.05 ~ 1.0) */
  textureOpacity?: number;
  /** 混合模式 */
  textureBlendMode?: 'normal' | 'overlay' | 'soft-light' | 'multiply' | 'screen';
  /** 作用范围：整张图片 (全画幅) 或 仅限底层背景 */
  textureTarget?: 'all' | 'bg';
  /** 噪点/纹理尺寸大小 (px) */
  textureSize?: number;
}
```

### 4.2 常量与单一可信源 (Single Source of Truth)
集中维护在 [`constants.ts`](file:///c:/Users/huaye/Documents/Workspace/redcanvas/app/(projects)/redcanvas/constants.ts)：
- `DEFAULT_TEXTURE_OPACITY = 0.6`
- `DEFAULT_TEXTURE_BLEND_MODE = 'normal'`
- `DEFAULT_TEXTURE_SIZE = 320`
- `DEFAULT_TEXTURE_TARGET = 'all'`
- `TEXTURE_PRESETS`: 内置纹理预设数组（包含分类、默认透明度、默认混合模式）
- `TEXTURE_BLEND_MODES`: 5 种混合模式元数据
- `GRAIN_SIZE_PRESETS`: 4 档尺寸预设

### 4.3 组件复用架构
提取并封装独立组件 [`TextureControlSection.tsx`](file:///c:/Users/huaye/Documents/Workspace/redcanvas/app/(projects)/redcanvas/components/studio/TextureControlSection.tsx)：
```tsx
<TextureControlSection
  title="胶片颗粒 · 材质遮罩"
  value={{
    textureUrl,
    textureOpacity,
    textureBlendMode,
    textureTarget,
    textureSize,
  }}
  onChange={(patch) => handleUpdate(patch)}
  showTargetScope={true} // 控制是否展示“整张图片 vs 仅限背景”
/>
```
**复用点**：
1. **画布控制面板**（[`CanvasControlTab.tsx`](file:///c:/Users/huaye/Documents/Workspace/redcanvas/app/(projects)/redcanvas/components/studio/CanvasControlTab.tsx)）
2. **背景元素面板**（[`ElementsControlTab.tsx`](file:///c:/Users/huaye/Documents/Workspace/redcanvas/app/(projects)/redcanvas/components/studio/ElementsControlTab.tsx)）
3. **单张图片/素材面板**（[`ElementsControlTab.tsx`](file:///c:/Users/huaye/Documents/Workspace/redcanvas/app/(projects)/redcanvas/components/studio/ElementsControlTab.tsx)）

### 4.4 渲染管线与性能
- **纯 CSS 平铺渲染**：
  ```css
  background-image: url('...');
  background-repeat: repeat;
  background-size: ${textureSize}px ${textureSize}px;
  mix-blend-mode: ${textureBlendMode};
  opacity: ${textureOpacity};
  pointer-events: none;
  ```
- **导出兼容性**：在通过 `html2canvas` 或 `html-to-image` 导出为高清海报时，由于使用的是纯标准 CSS 属性和无跨域 SVG/Base64/公开 CDN 图片，能保持 1:1 精确离线合成。

---

## 五、 体验设计与交互细节 (UI / UX Details)

1. **即时渲染**：所有滑块拖动无需等待，通过 React 状态毫秒级实时响应，画面颗粒平滑缩放。
2. **状态反馈**：当前启用的材质卡片高亮红色边框，右上角附带醒目的 `✓` 标记；若已有材质，顶部提供一键“清除材质”快捷文本按钮。
3. **友好解释文案**：
   - 切换到“整张图片”时，下方提示：“颗粒覆盖在最顶层，画面中所有卡片、插图和文字均染上统一胶片噪点。”
   - 切换到“仅限背景”时，提示：“颗粒仅附着在底色与背景渐变上，前景图片与卡片主体保持高清纯净。”
   - 尺寸调节处提示：“数值越大颗粒越粗粝明显，复古杂志质感越强；数值越小颗粒越细微。”

---

## 六、 验收标准与测试用例 (Acceptance Criteria)

| 编号 | 测试场景 | 预期结果 | 状态 |
| :--- | :--- | :--- | :--- |
| **TC-01** | 全局材质选择 | 点击任意预设（如 35mm 胶片），全图立即出现颗粒，默认混合模式为 `normal`，默认浓度为 60%。 | 通过 |
| **TC-02** | 作用范围切换 | 切换为“仅限背景”，前景图片卡片与文字上的颗粒立即消失，仅背景底色保留颗粒。 | 通过 |
| **TC-03** | 噪点尺寸无级调节 | 拖动 Grain Size 滑块（如从 140px 调至 700px），画面颗粒明显由细腻变得粗粝。 | 通过 |
| **TC-04** | 快捷档位联动 | 点击“细腻”按钮，滑块跳转至 140px，颗粒相应变细；点击“粗粝”跳转至 700px。 | 通过 |
| **TC-05** | 混合模式切换 | 依次切换 5 种混合模式，画面明暗与对比度正确呈现 CSS 对应的混合运算。 | 通过 |
| **TC-06** | 移动端入口响应 | 在移动端打开 RedCanvas，能顺畅唤起材质配置抽屉并自如滑动调节。 | 通过 |
| **TC-07** | 导出合成检验 | 点击导出 PNG / JPEG，生成的图片包含清晰准确的噪点纹理，无层级错乱。 | 通过 |

---

## 七、 未来迭代规划 (Roadmap)

1. **v1.3.0（自定义 SVG 噪点生成器）**：
   - 允许用户在前端通过 `feTurbulence` / `feColorMatrix` 参数实时生成独一无二的程序化矢量噪点，无需依赖外部图片网络加载。
2. **v1.4.0（局部材质画笔 / 擦除）**：
   - 支持蒙版遮罩画笔，允许用户擦除特定人脸区域的颗粒，实现“人脸高清美颜、背景与衣服复古胶片”的高级质感。
3. **v1.5.0（动态胶片颗粒实况 Live Photo）**：
   - 导出动态 MP4 / GIF 时，噪点以 24fps 产生随机微抖动，模拟真实电影放映机胶片播放效果。
