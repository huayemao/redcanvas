import { packImagesAndConfigZip, generateConfigExportFile, unpackConfigZip } from '../app/(projects)/redcanvas/lib/configPack';
import type { StudioProjectSnapshot } from '../app/(projects)/redcanvas/store/useStudioStore';

async function test() {
  const mockSnapshot: StudioProjectSnapshot = {
    __type: 'redcanvas-studio-project',
    version: 2,
    exportedAt: new Date().toISOString(),
    currentPageId: 'page-1',
    customExportName: '测试画板项目',
    pages: [
      {
        id: 'page-1',
        name: '第 1 页',
        data: {
          title: '首图标题',
          templateId: 'showcase',
          floatingElements: [
            { id: 'el-1', type: 'text', content: '测试标题', fontSize: 32, zIndex: 10, x: 10, y: 10 },
          ],
        } as any,
      },
    ],
  };

  // 1. 测试单页导出配置生成
  const fileRes = await generateConfigExportFile(mockSnapshot, '测试画板项目');
  console.log('generateConfigExportFile filename:', fileRes.filename);
  if (!fileRes.filename.startsWith('测试画板项目-config-')) {
    throw new Error('Config export filename mismatch');
  }

  // 2. 测试多页打包 ZIP 同时包含 PNG 和 config.json
  const mockPngBlob1 = new Blob(['mock png 1'], { type: 'image/png' });
  const mockPngBlob2 = new Blob(['mock png 2'], { type: 'image/png' });

  const zipBlob = await packImagesAndConfigZip(
    [
      { name: '测试-01.png', blob: mockPngBlob1 },
      { name: '测试-02.png', blob: mockPngBlob2 },
    ],
    mockSnapshot
  );

  console.log('Packed zip size:', zipBlob.size);

  // 3. 测试该 ZIP 是否能被 unpackConfigZip 成功还原（即包含合法的 config.json）
  const restored = await unpackConfigZip(zipBlob);
  if (!restored || restored.__type !== 'redcanvas-studio-project') {
    throw new Error('Failed to unpack config from combined zip!');
  }

  if ((restored as StudioProjectSnapshot).customExportName !== '测试画板项目') {
    throw new Error('Restored snapshot content mismatch');
  }

  console.log('ALL BUNDLE TESTS PASSED! Combined ZIP successfully restores project snapshot!');
}

test().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
