/*! behaviors.js is part of Webrecorder project. Copyright (C) 2021, Webrecorder Software. Licensed under the Affero General Public License v3. */(()=>{"use strict";let t=console.log,e=null;const i=200;function s(t){return new Promise((e=>setTimeout(e,t)))}function a(){return new Promise((t=>{"complete"===document.readyState?t():window.addEventListener("load",t)}))}function o(e,i="debug"){t&&t({data:e,type:i})}function r(e){t=e}function n(t){t.__bx_behaviors=new e}class l{constructor(t,e){this.matchValue=d(t,e)}async restore(t,e){let i=null;for(;i=c(t),!i;)await s(100);return c(e.replace("$1",this.matchValue),i)}}class h{constructor(t){this.loc=window.location.href,t()}get changed(){return window.location.href!==this.loc}goBack(t){if(!this.changed)return Promise.resolve(!0);const e=c(t);return new Promise((t=>{window.addEventListener("popstate",(()=>{t()}),{once:!0}),e?e.click():window.history.back()}))}}function c(t,e){return e=e||document,document.evaluate(t,e,null,XPathResult.FIRST_ORDERED_NODE_TYPE).singleNodeValue}function d(t,e){return e=e||document,document.evaluate(t,e,null,XPathResult.STRING_TYPE).stringValue}class u{constructor(){this._running=null,this.paused=null,this._unpause=null}start(){this._running=this.run()}done(){return this._running?this._running:Promise.resolve()}async run(){try{for await(const t of this)o(t,"info"),this.paused&&await this.paused;o(this.getState("done!"),"info")}catch(t){o(this.getState(t),"info")}}pause(){this.paused||(this.paused=new Promise((t=>{this._unpause=t})))}unpause(){this._unpause&&(this._unpause(),this.paused=null,this._unpause=null)}getState(t,e){return e&&null!=this.state[e]&&this.state[e]++,{state:this.state,msg:t}}cleanup(){}}const m=/\s*(\S*\s+[\d.]+[wx]),|(?:\s*,(?:\s+|(?=https?:)))/,w=/(url\s*\(\s*[\\"']*)([^)'"]+)([\\"']*\s*\))/gi,f=/(@import\s*[\\"']*)([^)'";]+)([\\"']*\s*;?)/gi;class p{constructor(){this.urlSet=new Set,this.urlqueue=[],this.numPending=0,this.start()}async start(){await a(),this.run(),this.initObserver()}done(){return Promise.resolve()}async run(){this.extractSrcSrcSetAll(document),this.extractStyleSheets()}isValidUrl(t){return t&&(t.startsWith("http:")||t.startsWith("https:"))}queueUrl(t){try{t=new URL(t,document.baseURI).href}catch(t){return}this.isValidUrl(t)&&(this.urlSet.has(t)||(this.urlSet.add(t),this.doFetch(t)))}async doFetch(t){if(this.urlqueue.push(t),this.numPending<=6)for(;this.urlqueue.length>0;){const t=this.urlqueue.shift();try{this.numPending++,o("AutoFetching: "+t);const e=await fetch(t);await e.blob()}catch(t){o(t)}this.numPending--}}initObserver(){this.mutobz=new MutationObserver((t=>this.observeChange(t))),this.mutobz.observe(document.documentElement,{characterData:!1,characterDataOldValue:!1,attributes:!0,attributeOldValue:!0,subtree:!0,childList:!0,attributeFilter:["srcset"]})}processChangedNode(t){switch(t.nodeType){case Node.ATTRIBUTE_NODE:"srcset"===t.nodeName&&this.extractSrcSetAttr(t.nodeValue);break;case Node.TEXT_NODE:t.parentNode&&"STYLE"===t.parentNode.tagName&&this.extractStyleText(t.nodeValue);break;case Node.ELEMENT_NODE:t.sheet&&this.extractStyleSheet(t.sheet),this.extractSrcSrcSet(t),setTimeout((()=>this.extractSrcSrcSetAll(t)),1e3)}}observeChange(t){for(const e of t)if(this.processChangedNode(e.target),"childList"===e.type)for(const t of e.addedNodes)this.processChangedNode(t)}extractSrcSrcSetAll(t){const e=t.querySelectorAll("img[srcset], img[data-srcset], img[data-src], video[srcset], video[data-srcset], video[data-src], audio[srcset], audio[data-srcset], audio[data-src], picture > source[srcset], picture > source[data-srcset], picture > source[data-src], video > source[srcset], video > source[data-srcset], video > source[data-src], audio > source[srcset], audio > source[data-srcset], audio > source[data-src]");for(const t of e)this.extractSrcSrcSet(t)}extractSrcSrcSet(t){if(!t||t.nodeType!==Node.ELEMENT_NODE)return void console.warn("No elem to extract from");const e=t.src||t.getAttribute("data-src");e&&this.queueUrl(e);const i=t.srcset||t.getAttribute("data-srcset");i&&this.extractSrcSetAttr(i)}extractSrcSetAttr(t){for(const e of t.split(m))if(e){const t=e.trim().split(" ");this.queueUrl(t[0])}}extractStyleSheets(t){t=t||document;for(const e of t.styleSheets)this.extractStyleSheet(e)}extractStyleSheet(t){let e;try{e=t.cssRules||t.rules}catch(t){return void o("Can't access stylesheet")}for(const t of e)t.type===CSSRule.MEDIA_RULE&&this.extractStyleText(t.cssText)}extractStyleText(t){const e=(t,e,i,s)=>(this.queueUrl(i),e+i+s);t.replace(w,e).replace(f,e)}}class g{constructor(){this.mediaSet=new Set,this.promises=[],this.promises.push(new Promise((t=>this._initDone=t))),this.start()}async start(){await a(),this.initObserver();for(const[,t]of document.querySelectorAll("video, audio").entries())this.addMediaWait(t);await s(1e3),this._initDone()}initObserver(){this.mutobz=new MutationObserver((t=>this.observeChange(t))),this.mutobz.observe(document.documentElement,{characterData:!1,characterDataOldValue:!1,attributes:!1,attributeOldValue:!1,subtree:!0,childList:!0})}observeChange(t){for(const e of t)if("childList"===e.type)for(const t of e.addedNodes)t instanceof HTMLMediaElement&&this.addMediaWait(t)}addMediaWait(t){if(o("media: "+t.outerHTML),(t.src&&t.src.startsWith("http:")||t.src.startsWith("https:"))&&!this.mediaSet.has(t.src))return o("fetch media URL: "+t.src),this.mediaSet.add(t.src),void this.promises.push(fetch(t.src).then((t=>t.blob())));if(t.play){let e;const i=new Promise((t=>{e=t}));this.promises.push(i),t.addEventListener("loadstart",(()=>o("loadstart"))),t.addEventListener("loadeddata",(()=>o("loadeddata"))),t.addEventListener("playing",(()=>{o("playing"),e()})),t.addEventListener("ended",(()=>{o("ended"),e()})),t.addEventListener("paused",(()=>{o("paused"),e()})),t.addEventListener("error",(()=>{o("error"),e()})),t.paused&&(o("generic play event for: "+t.outerHTML),t.muted=!0,t.click(),t.play())}}done(){return Promise.allSettled(this.promises)}}class y extends u{static get name(){return"Autoscroll"}async*[Symbol.asyncIterator](){const t={top:250,left:0,behavior:"auto"};for(;self.scrollY+self.innerHeight<Math.max(self.document.body.scrollHeight,self.document.body.offsetHeight,self.document.documentElement.clientHeight,self.document.documentElement.scrollHeight,self.document.documentElement.offsetHeight);)self.scrollBy(t),yield{msg:"Scrolling by "+t.top},await s(500)}}class S extends u{static isMatch(){return window.location.href.match(/https:\/\/(www\.)?instagram\.com\/\w[\w]+/)}static get name(){return"Instagram"}constructor(){super(),this.state={},this.rootPath="//article/div/div",this.childMatchSelect="string(.//a[starts-with(@href, '/')]/@href)",this.childMatch="child::div[.//a[@href='$1']]",this.firstPostInRow="div[1]/a",this.postCloseButton='//button[.//*[@aria-label="Close"]]',this.nextPost="//div[@role='dialog']//a[text()='Next']",this.postLoading="//*[@aria-label='Loading...']",this.subpostNextOnlyChevron="//article[@role='presentation']//div[@role='presentation']/following-sibling::button",this.subpostPrevNextChevron=this.subpostNextOnlyChevron+"[2]",this.commentRoot="//article/div[3]/div[1]/ul",this.viewReplies="li//button[span[contains(text(), 'View replies')]]",this.loadMore="//button[span[@aria-label='Load more comments']]",this.scrollOpts={block:"start",inline:"nearest",behavior:"smooth"},this.postOnlyWindow=null,this.state={posts:0,slides:0,comments:0,rows:0}}cleanup(){this.postOnlyWindow&&(this.postOnlyWindow.close(),this.postOnlyWindow=null)}async waitForNext(t){return t?(await s(i),t.nextElementSibling?t.nextElementSibling:null):null}async*iterRow(){let t=c(this.rootPath);if(!t)return;let e=t.firstElementChild;if(e)for(;e;){await s(i);const t=new l(this.childMatchSelect,e);t.matchValue&&(yield e,e=await t.restore(this.rootPath,this.childMatch)),e=await this.waitForNext(e)}}async*viewStandalonePost(){let t=c(this.rootPath);if(!t||!t.firstElementChild)return;const e=d(this.childMatchSelect,t.firstElementChild);yield this.getState("Opening new window for first post: "+e);try{this.postOnlyWindow=window.open(e,"_blank","resizable"),n(this.postOnlyWindow),this.postOnlyWindow.__bx_behaviors.run({autofetch:!0}),await s(2e3)}catch(t){o(t)}}async*iterSubposts(){let t=c(this.subpostNextOnlyChevron),e=1;for(;t;)t.click(),await s(1e3),yield this.getState(`Loading Slide ${++e} for ${window.location.href}`,"slides"),t=c(this.subpostPrevNextChevron);await s(1e3)}async iterComments(){const t=c(this.commentRoot);if(!t)return;let e=t.firstElementChild,i=!1;for(;e;){let t;for(e.scrollIntoView(this.scrollOpts),i=!0;null!==(t=c(this.viewReplies,e));)t.click(),this.state.comments++,await s(500);if(e.nextElementSibling&&"LI"===e.nextElementSibling.tagName){let t=c(this.loadMore,e.nextElementSibling);t&&(t.click(),this.state.comments++,await s(1e3))}e=e.nextElementSibling,await s(500)}return i}async*iterPosts(t){let e=0;for(;t&&++e<=3;)for(t.click(),await s(2e3),yield this.getState("Loading Post: "+window.location.href,"posts"),await fetch(window.location.href),yield*this.iterSubposts(),await Promise.race([this.iterComments(),s(2e4)])&&(yield this.getState("Loaded Comments","comments")),t=c(this.nextPost);!t&&c(this.postLoading);)await s(500);await s(1e3)}async*[Symbol.asyncIterator](){yield*this.viewStandalonePost();for await(const t of this.iterRow()){t.scrollIntoView(this.scrollOpts),await s(500),yield this.getState("Loading Row","rows");const e=c(this.firstPostInRow,t);yield*this.iterPosts(e);const i=c(this.postCloseButton);i&&i.click(),await s(1e3)}}}class v extends u{static isMatch(){return window.location.href.match(/https:\/\/(www\.)?twitter\.com\//)}static get name(){return"Twitter"}constructor(t=0){super(),this.maxDepth=t||0,this.rootPath="//div[starts-with(@aria-label, 'Timeline')]/*[1]",this.anchorQuery=".//article",this.childMatchSelect="string(.//article//a[starts-with(@href, '/') and @aria-label]/@href)",this.childMatch="child::div[.//a[@href='$1']]",this.expandQuery=".//div[@role='button' and @aria-haspopup='false']//*[contains(text(), 'more repl')]",this.quoteQuery=".//div[@role='blockquote' and @aria-haspopup='false']",this.imageQuery=".//a[@role='link' and starts-with(@href, '/') and contains(@href, '/photo/')]",this.imageNextQuery="//div[@aria-label='Next slide']",this.imageCloseQuery="//div[@aria-label='Close' and @role='button']",this.backButtonQuery="//div[@aria-label='Back' and @role='button']",this.progressQuery=".//*[@role='progressbar']",this.promoted='.//*[text()="Promoted"]',this.seenTweets=new Set,this.seenMediaTweets=new Set,this.state={videos:0,imagePopups:0,threads:0,tweets:0}}async waitForNext(t){if(!t)return null;if(await s(400),!t.nextElementSibling)return null;for(;c(this.progressQuery,t.nextElementSibling);)await s(i);return t.nextElementSibling}async expandMore(t){const e=c(this.expandQuery,t);if(!e)return t;const a=t.previousElementSibling;for(e.click(),await s(i);c(this.progressQuery,a.nextElementSibling);)await s(i);return t=a.nextElementSibling}async*infScroll(){let t=c(this.rootPath);if(!t)return;let e=t.firstElementChild;if(e)for(;e;){let t=c(this.anchorQuery,e);if(!t&&this.expandQuery&&(e=await this.expandMore(e,this.expandQuery,this.progressQuery),t=c(this.anchorQuery,e)),e&&e.innerText&&e.scrollIntoView(),e&&t){await s(i);const a=new l(this.childMatchSelect,e);a.matchValue&&(yield t,e=await a.restore(this.rootPath,this.childMatch))}e=await this.waitForNext(e,this.progressQuery)}}async*mediaPlaying(t){const e=c("(.//video | .//audio)",t);if(!e||e.paused)return;let i="Waiting for media playback";try{const e=new URL(d(this.childMatchSelect,t.parentElement),window.location.origin).href;if(this.seenMediaTweets.has(e))return;i+=" for "+e,this.seenMediaTweets.add(e)}catch(t){console.warn(t)}i+=" to finish...",yield this.getState(i,"videos");const a=new Promise((t=>{e.addEventListener("ended",(()=>t())),e.addEventListener("abort",(()=>t())),e.addEventListener("error",(()=>t())),e.addEventListener("pause",(()=>t()))}));await Promise.race([a,s(6e4)])}async*iterTimeline(t=0){if(!this.seenTweets.has(window.location.href)){yield this.getState("Capturing thread: "+window.location.href,"threads");for await(const e of this.infScroll()){if(c(this.promoted,e))continue;await s(500),yield*this.clickImages(e,t);const i=c(this.quoteQuery,e);i&&(yield*this.clickTweet(i,1e3)),yield*this.mediaPlaying(e),yield*this.clickTweet(e,t),await s(1e3)}}}async*clickImages(t){const e=c(this.imageQuery,t);if(e){const t=new h((()=>e.click()));yield this.getState("Loading Image: "+window.location.href,"imagePopups"),await s(1e3);let i=null,a=window.location.href;for(;null!=(i=c(this.imageNextQuery));){if(i.click(),await s(400),window.location.href===a){await s(1e3);break}a=window.location.href,yield this.getState("Loading Image: "+window.location.href,"imagePopups"),await s(1e3)}await t.goBack(this.imageCloseQuery)}}async*clickTweet(t,e){const a=new h((()=>t.click()));await s(i),a.changed&&(yield this.getState("Capturing Tweet: "+window.location.href,"tweets"),e<this.maxDepth&&!this.seenTweets.has(window.location.href)&&(yield*this.iterTimeline(e+1,this.maxDepth)),this.seenTweets.add(window.location.href),await s(400),await a.goBack(this.backButtonQuery),await s(i))}async*[Symbol.asyncIterator](){yield*this.iterTimeline(0)}}const b=[S,v];e=class{constructor(){this.behaviors=[],this.mainBehavior=null,this.inited=!1,o("Loaded behaviors for: "+self.location.href)}init(t={autofetch:!0,autoplay:!0,autoscroll:!0,siteSpecific:!0}){if(this.inited)return;if(this.inited=!0,!self.window)return;if(this.timeout=t.timeout,void 0!==t.log){let e=t.log;"string"==typeof e&&(e=self[e]),"function"==typeof e?r(e):!1===e&&r(null)}t.autofetch&&(o("Enable AutoFetcher"),this.behaviors.push(new p)),t.autoplay&&(o("Enable Autoplay"),this.behaviors.push(new g));let e=!1;if(self.window.top===self.window){if(t.siteSpecific)for(const t of b)if(t.isMatch()){o("Starting Site-Specific Behavior: "+t.name),this.mainBehaviorClass=t,this.mainBehavior=new t,e=!0;break}!e&&t.autoscroll&&(o("Starting Autoscroll"),this.mainBehaviorClass=y,this.mainBehavior=new y),this.mainBehavior&&this.behaviors.push(this.mainBehavior)}}async run(t){this.init(t),await a(),this.mainBehavior&&this.mainBehavior.start();let e=Promise.allSettled(this.behaviors.map((t=>t.done())));this.timeout?(o(`Waiting for behaviors to finish or ${this.timeout}ms timeout`),e=Promise.race([e,s(this.timeout)])):o("Waiting for behaviors to finish"),await e,o("All Behaviors Done!"),this.mainBehavior&&this.mainBehaviorClass.cleanup&&this.mainBehavior.cleanup()}pause(){o("Pausing Main Behavior"+this.mainBehaviorClass.name),this.mainBehavior&&this.mainBehavior.pause()}unpause(){o("Unpausing Main Behavior: "+this.mainBehaviorClass.name),this.mainBehavior&&this.mainBehavior.unpause()}};n(self)})();