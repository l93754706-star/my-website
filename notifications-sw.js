'use strict';
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data?.json() || {}; } catch {}
  event.waitUntil((async()=>{
    const clients=await self.clients.matchAll({type:'window',includeUncontrolled:true});
    const visible=clients.filter(c=>c.visibilityState==='visible'&&new URL(c.url).origin===self.location.origin);
    if(visible.length){visible.forEach(c=>c.postMessage({type:'mono-foreground-update',...data}));return;}
    await self.registration.showNotification(data.title || '愛', {
      body:data.body||'你有一条新消息',tag:data.chatId||data.section||'mono-push',data:{chatId:data.chatId||'',section:data.section||''}
    });
  })());
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const chatId = event.notification.data?.chatId || '';
  const target = new URL('./', self.registration.scope);
  target.hash = chatId ? 'chat/' + encodeURIComponent(chatId) : 'Chat';
  event.waitUntil((async () => {
    for (const client of await self.clients.matchAll({ type: 'window', includeUncontrolled: true })) {
      if (!client.url.startsWith(self.registration.scope)) continue;
      await client.focus(); await client.navigate(target.href); return;
    }
    await self.clients.openWindow(target.href);
  })());
});
