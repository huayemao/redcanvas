# PrettyScore - 琴谱一键美化工具

<p align="center">
  <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20music%20sheet%20with%20beautiful%20color%20theme%20and%20decorative%20borders%2C%20professional%20design%2C%20high%20quality&image_size=square_hd" alt="PrettyScore Preview" width="400" />
</p>

## 项目背景

用 MuseScore 等制谱工具导出的琴谱，都是黑白的，看起来感觉很单调。怎么快速为琴谱更换配色，让琴谱变得更好看呢？

流传的琴谱图片大都不是制谱工具直接导出的，这使得图像处理变得困难：
- 图片格式的琴谱通常分辨率较低，放大后会失真
- 图片中的文字和符号边缘模糊，难以精确处理
- 色彩信息已经混合，无法单独调整墨色和背景

因此，PrettyScore 约束输入必须是 PDF 或矢量 SVG 格式，这样才能保证处理后的琴谱质量。

## 功能介绍

- **一键导入**：支持拖入 SVG/PDF 格式琴谱，自动加载并处理
- **主题配色**：提供多种预设配色主题，一键应用即可改变琴谱风格
- **自定义选项**：
  - 纸张纹理：选择预设纸张效果或上传自定义背景
  - 墨色调整：自由选择琴谱线条和文字的颜色
  - 装饰边框：添加古典、花角、复古等多种边框效果
  - 氛围微调：调整暗角、暖调等参数，增强琴谱的艺术感
- **高清导出**：支持导出为高清图片或 PDF 格式，方便分享、打印或装裱

## 技术原理

### 核心技术栈

- **前端框架**：React + TypeScript
- **状态管理**：Zustand
- **动画效果**：Framer Motion
- **文件处理**：
  - PDF 处理：pdfjs-dist
  - SVG 处理：原生 Canvas API
- **图像处理**：Canvas API

### 图像处理原理

1. **文件加载与渲染**：
   - PDF 文件：使用 pdfjs-dist 将 PDF 页面渲染为 Canvas
   - SVG 文件：直接将 SVG 渲染为 Canvas

2. **颜色转换**：
   - 基于像素级处理，计算每个像素的亮度
   - 将亮度值转换为目标颜色的透明度
   - 替换原始黑色为用户选择的颜色

3. **效果叠加**：
   - 背景层：应用纸张纹理或自定义背景
   - 覆盖层：添加暖调、渐变等效果
   - 装饰层：绘制边框和装饰元素
   - 暗角效果：添加径向渐变暗角，增强氛围感

4. **性能优化**：
   - 使用防抖处理，避免频繁重绘
   - 仅在颜色变化时重新处理像素数据
   - 分层渲染，提高渲染效率

## 使用方法

### 快速开始

1. **导入琴谱**：
   - 直接拖放 PDF 或 SVG 文件到应用窗口
   - 或点击 "Load Sample" 加载示例文件

2. **选择主题**：
   - 在右侧控制面板中选择预设主题
   - 或手动调整各项参数

3. **自定义调整**：
   - **背景**：选择纸张预设或上传自定义背景
   - **墨色**：选择预设颜色或使用颜色选择器
   - **装饰**：添加边框效果
   - **氛围**：调整暗角和暖调参数

4. **导出结果**：
   - 点击 "Export Image" 导出为 PNG 图片
   - 点击 "Export PDF" 导出为 PDF 文件

### 页面导航

如果导入的是多页 PDF，可以使用底部的页码导航器切换页面，每个页面都会应用相同的美化设置。

## 预设主题

- **Ivory Sonata**：经典象牙白背景，适合古典音乐
- **Dusty Rose**：温柔玫瑰色，适合浪漫曲谱
- **Midnight Velvet**：深邃午夜蓝，适合现代作品
- **Sage Whisper**：清新 Sage 绿色，适合自然风格
- **Abyssal Teal**：深海蓝绿色，适合现代爵士乐
- **Architect**：蓝图风格，适合现代音乐
- **Noir**：黑白经典，适合极简风格
- **Amethyst**：紫水晶色调，适合神秘风格
- **Gilded Age**：金色奢华，适合巴洛克音乐

## 纸张预设

- **Masterpiece**：经典高质量纸张
- **Antique**：复古做旧效果
- **Crumpled**：褶皱纸张质感
- **Parchment**：羊皮纸效果

## 装饰边框

- **Classic Border**：经典双线边框
- **Floral Corners**：花角装饰
- **Vintage Frame**：复古相框效果
- **Art Deco**：装饰艺术风格边框
- **Minimalist Grid**：极简网格边框

## 技术实现细节

### 核心函数

1. **processScoreCanvas**：将黑白琴谱转换为指定颜色
   - 遍历每个像素，计算亮度
   - 根据亮度设置目标颜色和透明度

2. **drawFinal**：组合所有效果，生成最终图像
   - 绘制背景
   - 应用暖调效果
   - 叠加处理后的琴谱
   - 添加装饰边框
   - 应用暗角效果

3. **renderPdfPageToCanvas**：将 PDF 页面渲染为 Canvas

4. **renderSvgToCanvas**：将 SVG 渲染为 Canvas

### 状态管理

使用 Zustand 管理应用状态，包括：
- 应用状态（ idle / editor ）
- 文件信息（ PDF 文档、页数、当前页码 ）
- 样式设置（ 背景类型、颜色、装饰、效果参数 ）

### 性能优化

- **防抖处理**：对用户输入进行防抖，避免频繁重绘
- **缓存机制**：仅在颜色变化时重新处理像素数据
- **分层渲染**：将不同效果分层处理，提高渲染效率

## 项目结构

```
prettyscore/
├── components/
│   ├── Canvas.tsx          # 画布组件和渲染逻辑
│   ├── ControlsPanel.tsx   # 控制面板组件
│   ├── Editor.tsx          # 编辑器主组件
│   ├── IntroScreen.tsx     # 初始屏幕组件
│   └── ProcessingOverlay.tsx # 处理中覆盖层
├── utils/
│   ├── canvasHelper.ts     # 画布辅助函数
│   ├── imageHelper.ts      # 图像处理函数
│   └── pdfHelper.ts        # PDF 处理函数
├── hooks/
│   └── useDebounce.ts      # 防抖钩子
├── constants.ts            # 常量定义（主题、纸张预设等）
├── store.ts                # 状态管理
├── page.tsx                # 主页面
└── README.md               # 项目说明
```

## 注意事项

- **输入格式**：仅支持 PDF 和 SVG 格式，确保文件是制谱工具直接导出的
- **文件大小**：建议文件大小不超过 10MB，以保证处理速度
- **分辨率**：导出的图片分辨率取决于原始文件质量，建议使用高质量的源文件
- **浏览器支持**：推荐使用 Chrome、Firefox 等现代浏览器

## 未来计划

- [ ] 支持批量处理多页 PDF
- [ ] 添加更多主题和装饰效果
- [ ] 实现琴谱预览和对比功能
- [ ] 支持更多导出格式
- [ ] 添加用户保存和加载配置功能

## 贡献

欢迎提交 Issue 和 Pull Request，帮助改进 PrettyScore！

## 许可证

MIT License

---

无论你是古典音乐爱好者还是流行音乐玩家，PrettyScore 都能为你的琴谱增添美感，让练琴的过程更加愉悦！