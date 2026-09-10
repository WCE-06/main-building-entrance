import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const source=await readFile(new URL("../index.html",import.meta.url),"utf8");

test("本館入口のインラインJavaScriptに構文エラーがない",()=>{
 const scripts=[...source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(match=>match[1]);
 assert.ok(scripts.length>0);
 scripts.forEach(script=>new Function(script));
});

test("通信結果不明を開錠成功として表示しない",()=>{
 assert.match(source,/function showUncertain\(\)/);
 assert.match(source,/開錠結果を確認できませんでした/);
 assert.match(source,/if \(!isCommunicationError\(result\)\)/);
 assert.match(source,/showUncertain\(\);/);
 assert.doesNotMatch(source,/二重開錠を避けるため再送せず、受付済みとして完了画面へ進む/);
});

test("同じ受付IDで認証準備と開錠確定を自動再試行する",()=>{
 assert.match(source,/function postEntryActionWithRetry\(action, customerCode, requestId, attempts\)/);
 assert.match(source,/'entry_prepare', customerCode, requestId, APP_CONFIG\.prepareRetryCount/);
 assert.match(source,/'entry_commit', customerCode, requestId, APP_CONFIG\.commitRetryCount/);
 assert.match(source,/result\.reason === 'entry_commit_processing'/);
});
