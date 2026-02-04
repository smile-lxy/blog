// Giscus 调试脚本 - 用于排查404问题
// 将此文件内容放到浏览器console中运行

console.log('Giscus Debug Script Started');

// 监听giscus发送的消息，捕获API错误
window.addEventListener('message', function(event) {
  if (event.origin !== 'https://giscus.app') return;
  
  console.log('Message from giscus:', event.data);
  
  if (event.data.giscus) {
    console.log('Giscus Status:', event.data.giscus);
  }
}, false);

// 获取giscus容器的配置
const giscusScript = document.querySelector('script[src="https://giscus.app/client.js"]');
if (giscusScript) {
  console.log('Giscus Configuration:');
  console.log('- repo:', giscusScript.dataset.repo);
  console.log('- repoId:', giscusScript.dataset.repoId);
  console.log('- category:', giscusScript.dataset.category);
  console.log('- categoryId:', giscusScript.dataset.categoryId);
  console.log('- mapping:', giscusScript.dataset.mapping);
  console.log('- theme:', giscusScript.dataset.theme);
  console.log('- lang:', giscusScript.dataset.lang);
  
  // 诊断信息
  console.log('\n诊断信息:');
  console.log('- 当前页面路径:', window.location.pathname);
  console.log('- LocalStorage中的giscus数据:', localStorage.getItem('giscus-discussion-repo-id'));
}

// 如果有错误消息，会在控制台显示
console.log('如果看到404错误，检查:');
console.log('1. Category名称是否正确');
console.log('2. Category在GitHub Repo中是否真的存在');
console.log('3. categoryId是否正确对应该category');
