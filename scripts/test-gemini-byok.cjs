/* 隔離假資料測試，不讀金鑰、不呼叫真實 Google API。 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync('src/lib/gemini.ts', 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
const fakeKey = 'test-only-not-a-real-api-key-000000';
const model = { name: 'models/gemini-2.5-flash-lite', displayName: '測試文字模型', supportedGenerationMethods: ['generateContent'] };
let passed = 0;
function harness(timerOverride) {
  let calls = [];
  let mock = async () => ({ ok: true, status: 200, json: async () => ({ models: [model] }) });
  let now = 1700000000000;
  class Clock extends Date { static now() { return now; } }
  const context = { exports: {}, Date: Clock, Event, AbortController, setTimeout: timerOverride || setTimeout, clearTimeout,
    window: { dispatchEvent() {} },
    localStorage: { setItem() { throw Error('不得存金鑰'); } },
    sessionStorage: { setItem() { throw Error('不得存金鑰'); } },
    fetch: async (url, init) => { calls.push({ url, init }); return mock(url, init); } };
  vm.runInNewContext(js, context);
  return { api: context.exports, calls, setMock(fn) { mock = fn; }, advance(ms) { now += ms; } };
}
const goodResult = () => ({ ok: true, status: 200, json: async () => ({ candidates: [{ finishReason: 'STOP', content: { parts: [{ text: '溫暖的' }, { text: '練習建議' }] } }] }) });
async function test(name, fn) { await fn(); passed++; console.log(`通過：${name}`); }
(async () => {
  await test('沒有內嵌或持久化金鑰', async () => {
    assert(!source.includes('NEXT_PUBLIC_GEMINI_API_KEY'));
    assert(!source.includes('localStorage.') && !source.includes('sessionStorage.'));
    const h = harness(); await assert.rejects(h.api.generateText('測試'), /先由教師/); assert.equal(h.calls.length, 0);
  });
  await test('先查模型且金鑰不出現在網址、只傳 Google header', async () => {
    const h = harness(); await h.api.configureGemini(fakeKey);
    assert.equal(h.calls.length, 1); assert(h.calls[0].url.includes('/models?pageSize=1000'));
    assert(!h.calls[0].url.includes(fakeKey)); assert.equal(h.calls[0].init.headers['x-goog-api-key'], fakeKey);
    assert.equal(h.api.getGeminiStatus().model, model.name); assert(!JSON.stringify(h.api.getGeminiStatus()).includes(fakeKey));
  });
  await test('排除圖片、預覽及不支援生成的模型', async () => {
    const h = harness(); h.setMock(async () => ({ ok: true, json: async () => ({ models: [model,
      { ...model, name: 'models/gemini-3-preview' }, { ...model, name: 'models/gemini-2.5-flash-image' },
      { ...model, name: 'models/gemini-2.5-pro', supportedGenerationMethods: ['embedContent'] }] }) }));
    const list = await h.api.configureGemini(fakeKey); assert.equal(list.length, 1);
    assert.throws(() => h.api.selectGeminiModel('models/not-verified'), /已驗證/);
  });
  await test('分頁完整讀取模型清單', async () => {
    const h = harness(); let count = 0;
    h.setMock(async () => ({ ok: true, json: async () => ++count === 1 ? { models: [], nextPageToken: 'next/page' } : { models: [model] } }));
    await h.api.configureGemini(fakeKey); assert.equal(h.calls.length, 2); assert(h.calls[1].url.includes('next%2Fpage'));
  });
  await test('超長輸入在生成請求之前攔截', async () => {
    const h = harness(); await h.api.configureGemini(fakeKey); h.setMock(goodResult);
    await assert.rejects(h.api.generateText('測'.repeat(2001)), /2000/); assert.equal(h.calls.length, 1);
  });
  await test('五次提醒、清金鑰不歸零、超限不送出生成、一小時後恢復', async () => {
    const h = harness(); await h.api.configureGemini(fakeKey); h.setMock(goodResult);
    for (let i = 0; i < 5; i++) assert.equal(await h.api.generateText('測試'), '溫暖的練習建議');
    await assert.rejects(h.api.generateText('第六次'), /5 次/); assert.equal(h.calls.length, 6);
    h.api.clearGeminiConfiguration(); assert.equal(h.api.getGeminiStatus().generationCount, 5);
    h.setMock(async () => ({ ok: true, json: async () => ({ models: [model] }) })); await h.api.configureGemini(fakeKey);
    h.setMock(goodResult); h.advance(3600001); await h.api.generateText('新一小時');
    assert.equal(h.api.getGeminiStatus().generationCount, 1);
  });
  await test('Google錯誤不回顯機密、不以模板假裝成功', async () => {
    const h = harness(); await h.api.configureGemini(fakeKey);
    h.setMock(async () => ({ ok: false, status: 403, json: async () => ({ error: { message: fakeKey } }) }));
    await assert.rejects(h.api.generateText('測試'), e => /權限/.test(e.message) && !e.message.includes(fakeKey));
    assert.equal(h.api.getGeminiStatus().generationCount, 1);
  });
  await test('拒絕截斷、安全攔截及空回應', async () => {
    const h = harness(); await h.api.configureGemini(fakeKey);
    for (const finishReason of ['MAX_TOKENS', 'SAFETY', 'STOP']) {
      h.setMock(async () => ({ ok: true, json: async () => ({ candidates: [{ finishReason, content: { parts: [] } }] }) }));
      await assert.rejects(h.api.generateText('測試'));
    }
  });
  await test('清除後舊請求不得重新顯示', async () => {
    const h = harness(); await h.api.configureGemini(fakeKey); let release;
    h.setMock(() => new Promise(resolve => { release = resolve; }));
    const pending = h.api.generateText('測試');
    await assert.rejects(h.api.generateText('重複'), /上一份/);
    h.api.clearGeminiConfiguration(); release(goodResult());
    await assert.rejects(pending, /已變更/); assert.equal(h.api.isGeminiAvailable(), false);
  });
  await test('完整內容停滯仍受逾時保護且解除生成鎖', async () => {
    const h = harness((fn, ms) => setTimeout(fn, ms === 60000 ? 10 : ms));
    await h.api.configureGemini(fakeKey);
    h.setMock(async () => ({ ok: true, json: () => new Promise(() => {}) }));
    await assert.rejects(h.api.generateText('停滯內容'), /逾時/);
    h.setMock(goodResult); await h.api.generateText('恢復');
  });
  await test('清除設定可中止停滯內容且不讓舊finally干擾新請求', async () => {
    const h = harness(); await h.api.configureGemini(fakeKey);
    h.setMock(async () => ({ ok: true, json: () => new Promise(() => {}) }));
    const pending = h.api.generateText('停滯內容'); h.api.clearGeminiConfiguration();
    await assert.rejects(pending, /已變更/);
    h.setMock(async () => ({ ok: true, json: async () => ({ models: [model] }) }));
    await h.api.configureGemini(fakeKey); h.setMock(goodResult); await h.api.generateText('恢復');
  });
  await test('分析不傳學生自由姓名、活動名稱或任意選項文字', async () => {
    const h = harness(); await h.api.configureGemini(fakeKey); h.setMock(goodResult);
    await h.api.generatePersonalAnalysis({ type: 'ENFJ', nickname: '真實姓名禁止', branch: 'main', pickedTags: ['禁止自由文字'] });
    await h.api.generateSelPrescription({ style: 'solve', nickname: '真實姓名禁止', scores: { express: 1, solve: 3, calm: 2, connect: 2 } });
    await h.api.generateClassInsight({ sessionLabel: '活動姓名禁止', totalCount: 1, completedCount: 1, typeDistribution: { ENFJ: 1 }, axisCount: { E: 1, I: 0, S: 0, N: 1, T: 0, F: 1, J: 1, P: 0 } });
    for (const call of h.calls.slice(1)) assert(!/禁止/.test(call.init.body));
  });
  console.log(`隔離測試 ${passed}/${passed} 通過；未呼叫真實 Google API。`);
})().catch(error => { console.error(error); process.exitCode = 1; });
