'use strict';
const ACCOUNT = { //账号相关，安全性更高

    "user" : "admin", //博客后台用户名
    "password" : "cfblog-plus", //博客后台密码
    "cacheZoneId":"935xxxxxxxxxxxx",//区域 ID
    "cacheToken":"AQxxxxxxxx",//API token

    "kv_var": this['CFBLOG'],//workers绑定kv时用的变量名
}

const OPT = { //网站配置
    "siteDomain" : "域名",// 域名(不带https 也不带/)
    "siteName" : "CFBLOG-Plus",//博客名称
    "siteDescription":"CFBLOG-Plus" ,//博客描述
    "keyWords":"cloudflare,KV,workers,blog",//关键字
    "logo":"//cdn.jsdelivr.net/gh/Arronlong/cfblog-plus@master/themes/JustNews/files/logo2.png",//JustNews主题的logo

    //主题路径
    "theme_github_path":"//cdn.jsdelivr.net/gh/Arronlong/cfblog-plus@master/themes/",
    "editor_page_scripts": `
        //关闭email匹配和@匹配，否则图片使用jsdelivr的cdn，如果有版本号会匹配成“mailto:xxx”从而导致显示异常
        mdEditor.settings.emailLink=false;
        mdEditor.settings.atLink=false;
        mdEditor.settings.emoji=true
        mdEditor.settings.taskList=true;// 默认不解析
        mdEditor.settings.tex=true;// 默认不解析
        mdEditor.settings.flowChart=true; // 默认不解析
        mdEditor.settings.sequenceDiagram=true;// 默认不解析
        
        //开启全局html标签解析-不推荐
        //mdEditor.settings.htmlDecode=true;
        
        window.mdEditor=mdEditor;        
        //editormd工具栏上添加html标签解析开关
        mdEditor.getToolbarHandles().parseHtml=function(){
            let ele = $(".editormd-menu li a i:last");
            if(ele.hasClass('fa-toggle-off')){
                ele.removeClass('fa-toggle-off').addClass('fa-toggle-on');
                mdEditor.settings.htmlDecode = true;
            }else if(ele.hasClass('fa-toggle-on')){
                ele.removeClass('fa-toggle-on').addClass('fa-toggle-off')
                mdEditor.settings.htmlDecode = false;
            }
            mdEditor.setMarkdown(mdEditor.getMarkdown());
        }
        setTimeout(function(){
            $(".editormd-menu").append('<li class="divider" unselectable="on">|</li><li><a href="javascript:;" title="解析HTML标签" unselectable="on"><i class="fa fa-toggle-off" name="parseHtml" unselectable="on"> 解析HTML标签 </i></a></li>')
            mdEditor.setToolbarHandler(mdEditor.getToolbarHandles())
        },300)        
        
        //默认图片，工具：https://tool.lu/imageholder/
        if($('#img').val()=="")$('#img').val('https://cdn.jsdelivr.net/gh/Arronlong/cdn@master/cfblog/cfblog-plus.png');
        //默认时间设置为当前时间
        if($('#createDate').val()=="")$('#createDate').val(new Date(new Date().getTime()+8*60*60*1000).toJSON().substr(0,16));
        `, //后台编辑页面脚本

    "pageSize" : 5,//每页文章数
    "recentlySize" : 6,//最近文章数
    "readMoreLength":150,//阅读更多截取长度	
    "cacheTime" : 60*60*24*2, //网页缓存时长(秒),建议=文章更新频率
    "themeURL" : "https://raw.githubusercontent.com/Arronlong/cfblog-plus/master/themes/JustNews/", // 模板地址,以 "/"" 结尾
    "html404" : `<b>404</b>`,//404页面代码    
    "codeBeforHead":`
    <script src="https://cdn.staticfile.org/jquery/2.2.4/jquery.min.js"></script>
    `,//其他代码,显示在</head>前
    "codeBeforBody":``,//其他代码,显示在</body>前
    "commentCode":`
    <script>
        //文章详情页 添加编辑直达功能
        $(".entry-info").append('<a style="float:right;margin-left:5px;" href="'+location.href.replace('/article/','/admin/edit/')+'" target="_blank">编辑</a>')
    </script>`,//评论区代码
    "widgetOther":``,//20201224新增参数,用于右侧 小部件扩展
    "otherCodeA":`热度`,//模板开发用的其他自定义变量
    "otherCodeB":``,//
    "otherCodeC":``,//
    "otherCodeD":``,//
    "otherCodeE":``,//
    "copyRight" :`Powered by <a href="https://www.cloudflare.com">Cloudflare</a> & <a href="https://blog.arrontg.cf">CFBlog-Plus</a> & <a href="https://blog.gezhong.vip">CF-Blog </a>`,//自定义版权信息,建议保留大公无私的 Coudflare 和 作者 的链接
    "robots":`User-agent: *
Disallow: /admin`//robots.txt设置
};


//CFBLOG 通用变量
this.CFBLOG = ACCOUNT.kv_var;
//默认为非私密博客
if(null==OPT.privateBlog){
    OPT.privateBlog=false;
}
//处理themeURL、theme_github_path参数设定
if(OPT.themeURL.substr(-1)!='/'){
    OPT.themeURL=OPT.themeURL+'/';
}
if(OPT.theme_github_path.substr(-1)!='/'){
    OPT.theme_github_path=OPT.theme_github_path+'/';
}

//引入mustache.js，4.1.0：https://cdn.bootcdn.net/ajax/libs/mustache.js/4.1.0/mustache.min.js
(function(global,factory){typeof exports==="object"&&typeof module!=="undefined"?module.exports=factory():typeof define==="function"&&define.amd?define(factory):(global=global||self,global.Mustache=factory())})(this,function(){"use strict";var objectToString=Object.prototype.toString;var isArray=Array.isArray||function isArrayPolyfill(object){return objectToString.call(object)==="[object Array]"};function isFunction(object){return typeof object==="function"}function typeStr(obj){return isArray(obj)?"array":typeof obj}function escapeRegExp(string){return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")}function hasProperty(obj,propName){return obj!=null&&typeof obj==="object"&&propName in obj}function primitiveHasOwnProperty(primitive,propName){return primitive!=null&&typeof primitive!=="object"&&primitive.hasOwnProperty&&primitive.hasOwnProperty(propName)}var regExpTest=RegExp.prototype.test;function testRegExp(re,string){return regExpTest.call(re,string)}var nonSpaceRe=/\S/;function isWhitespace(string){return!testRegExp(nonSpaceRe,string)}var entityMap={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"};function escapeHtml(string){return String(string).replace(/[&<>"'`=\/]/g,function fromEntityMap(s){return entityMap[s]})}var whiteRe=/\s*/;var spaceRe=/\s+/;var equalsRe=/\s*=/;var curlyRe=/\s*\}/;var tagRe=/#|\^|\/|>|\{|&|=|!/;function parseTemplate(template,tags){if(!template)return[];var lineHasNonSpace=false;var sections=[];var tokens=[];var spaces=[];var hasTag=false;var nonSpace=false;var indentation="";var tagIndex=0;function stripSpace(){if(hasTag&&!nonSpace){while(spaces.length)delete tokens[spaces.pop()]}else{spaces=[]}hasTag=false;nonSpace=false}var openingTagRe,closingTagRe,closingCurlyRe;function compileTags(tagsToCompile){if(typeof tagsToCompile==="string")tagsToCompile=tagsToCompile.split(spaceRe,2);if(!isArray(tagsToCompile)||tagsToCompile.length!==2)throw new Error("Invalid tags: "+tagsToCompile);openingTagRe=new RegExp(escapeRegExp(tagsToCompile[0])+"\\s*");closingTagRe=new RegExp("\\s*"+escapeRegExp(tagsToCompile[1]));closingCurlyRe=new RegExp("\\s*"+escapeRegExp("}"+tagsToCompile[1]))}compileTags(tags||mustache.tags);var scanner=new Scanner(template);var start,type,value,chr,token,openSection;while(!scanner.eos()){start=scanner.pos;value=scanner.scanUntil(openingTagRe);if(value){for(var i=0,valueLength=value.length;i<valueLength;++i){chr=value.charAt(i);if(isWhitespace(chr)){spaces.push(tokens.length);indentation+=chr}else{nonSpace=true;lineHasNonSpace=true;indentation+=" "}tokens.push(["text",chr,start,start+1]);start+=1;if(chr==="\n"){stripSpace();indentation="";tagIndex=0;lineHasNonSpace=false}}}if(!scanner.scan(openingTagRe))break;hasTag=true;type=scanner.scan(tagRe)||"name";scanner.scan(whiteRe);if(type==="="){value=scanner.scanUntil(equalsRe);scanner.scan(equalsRe);scanner.scanUntil(closingTagRe)}else if(type==="{"){value=scanner.scanUntil(closingCurlyRe);scanner.scan(curlyRe);scanner.scanUntil(closingTagRe);type="&"}else{value=scanner.scanUntil(closingTagRe)}if(!scanner.scan(closingTagRe))throw new Error("Unclosed tag at "+scanner.pos);if(type==">"){token=[type,value,start,scanner.pos,indentation,tagIndex,lineHasNonSpace]}else{token=[type,value,start,scanner.pos]}tagIndex++;tokens.push(token);if(type==="#"||type==="^"){sections.push(token)}else if(type==="/"){openSection=sections.pop();if(!openSection)throw new Error('Unopened section "'+value+'" at '+start);if(openSection[1]!==value)throw new Error('Unclosed section "'+openSection[1]+'" at '+start)}else if(type==="name"||type==="{"||type==="&"){nonSpace=true}else if(type==="="){compileTags(value)}}stripSpace();openSection=sections.pop();if(openSection)throw new Error('Unclosed section "'+openSection[1]+'" at '+scanner.pos);return nestTokens(squashTokens(tokens))}function squashTokens(tokens){var squashedTokens=[];var token,lastToken;for(var i=0,numTokens=tokens.length;i<numTokens;++i){token=tokens[i];if(token){if(token[0]==="text"&&lastToken&&lastToken[0]==="text"){lastToken[1]+=token[1];lastToken[3]=token[3]}else{squashedTokens.push(token);lastToken=token}}}return squashedTokens}function nestTokens(tokens){var nestedTokens=[];var collector=nestedTokens;var sections=[];var token,section;for(var i=0,numTokens=tokens.length;i<numTokens;++i){token=tokens[i];switch(token[0]){case"#":case"^":collector.push(token);sections.push(token);collector=token[4]=[];break;case"/":section=sections.pop();section[5]=token[2];collector=sections.length>0?sections[sections.length-1][4]:nestedTokens;break;default:collector.push(token)}}return nestedTokens}function Scanner(string){this.string=string;this.tail=string;this.pos=0}Scanner.prototype.eos=function eos(){return this.tail===""};Scanner.prototype.scan=function scan(re){var match=this.tail.match(re);if(!match||match.index!==0)return"";var string=match[0];this.tail=this.tail.substring(string.length);this.pos+=string.length;return string};Scanner.prototype.scanUntil=function scanUntil(re){var index=this.tail.search(re),match;switch(index){case-1:match=this.tail;this.tail="";break;case 0:match="";break;default:match=this.tail.substring(0,index);this.tail=this.tail.substring(index)}this.pos+=match.length;return match};function Context(view,parentContext){this.view=view;this.cache={".":this.view};this.parent=parentContext}Context.prototype.push=function push(view){return new Context(view,this)};Context.prototype.lookup=function lookup(name){var cache=this.cache;var value;if(cache.hasOwnProperty(name)){value=cache[name]}else{var context=this,intermediateValue,names,index,lookupHit=false;while(context){if(name.indexOf(".")>0){intermediateValue=context.view;names=name.split(".");index=0;while(intermediateValue!=null&&index<names.length){if(index===names.length-1)lookupHit=hasProperty(intermediateValue,names[index])||primitiveHasOwnProperty(intermediateValue,names[index]);intermediateValue=intermediateValue[names[index++]]}}else{intermediateValue=context.view[name];lookupHit=hasProperty(context.view,name)}if(lookupHit){value=intermediateValue;break}context=context.parent}cache[name]=value}if(isFunction(value))value=value.call(this.view);return value};function Writer(){this.templateCache={_cache:{},set:function set(key,value){this._cache[key]=value},get:function get(key){return this._cache[key]},clear:function clear(){this._cache={}}}}Writer.prototype.clearCache=function clearCache(){if(typeof this.templateCache!=="undefined"){this.templateCache.clear()}};Writer.prototype.parse=function parse(template,tags){var cache=this.templateCache;var cacheKey=template+":"+(tags||mustache.tags).join(":");var isCacheEnabled=typeof cache!=="undefined";var tokens=isCacheEnabled?cache.get(cacheKey):undefined;if(tokens==undefined){tokens=parseTemplate(template,tags);isCacheEnabled&&cache.set(cacheKey,tokens)}return tokens};Writer.prototype.render=function render(template,view,partials,config){var tags=this.getConfigTags(config);var tokens=this.parse(template,tags);var context=view instanceof Context?view:new Context(view,undefined);return this.renderTokens(tokens,context,partials,template,config)};Writer.prototype.renderTokens=function renderTokens(tokens,context,partials,originalTemplate,config){var buffer="";var token,symbol,value;for(var i=0,numTokens=tokens.length;i<numTokens;++i){value=undefined;token=tokens[i];symbol=token[0];if(symbol==="#")value=this.renderSection(token,context,partials,originalTemplate,config);else if(symbol==="^")value=this.renderInverted(token,context,partials,originalTemplate,config);else if(symbol===">")value=this.renderPartial(token,context,partials,config);else if(symbol==="&")value=this.unescapedValue(token,context);else if(symbol==="name")value=this.escapedValue(token,context,config);else if(symbol==="text")value=this.rawValue(token);if(value!==undefined)buffer+=value}return buffer};Writer.prototype.renderSection=function renderSection(token,context,partials,originalTemplate,config){var self=this;var buffer="";var value=context.lookup(token[1]);function subRender(template){return self.render(template,context,partials,config)}if(!value)return;if(isArray(value)){for(var j=0,valueLength=value.length;j<valueLength;++j){buffer+=this.renderTokens(token[4],context.push(value[j]),partials,originalTemplate,config)}}else if(typeof value==="object"||typeof value==="string"||typeof value==="number"){buffer+=this.renderTokens(token[4],context.push(value),partials,originalTemplate,config)}else if(isFunction(value)){if(typeof originalTemplate!=="string")throw new Error("Cannot use higher-order sections without the original template");value=value.call(context.view,originalTemplate.slice(token[3],token[5]),subRender);if(value!=null)buffer+=value}else{buffer+=this.renderTokens(token[4],context,partials,originalTemplate,config)}return buffer};Writer.prototype.renderInverted=function renderInverted(token,context,partials,originalTemplate,config){var value=context.lookup(token[1]);if(!value||isArray(value)&&value.length===0)return this.renderTokens(token[4],context,partials,originalTemplate,config)};Writer.prototype.indentPartial=function indentPartial(partial,indentation,lineHasNonSpace){var filteredIndentation=indentation.replace(/[^ \t]/g,"");var partialByNl=partial.split("\n");for(var i=0;i<partialByNl.length;i++){if(partialByNl[i].length&&(i>0||!lineHasNonSpace)){partialByNl[i]=filteredIndentation+partialByNl[i]}}return partialByNl.join("\n")};Writer.prototype.renderPartial=function renderPartial(token,context,partials,config){if(!partials)return;var tags=this.getConfigTags(config);var value=isFunction(partials)?partials(token[1]):partials[token[1]];if(value!=null){var lineHasNonSpace=token[6];var tagIndex=token[5];var indentation=token[4];var indentedValue=value;if(tagIndex==0&&indentation){indentedValue=this.indentPartial(value,indentation,lineHasNonSpace)}var tokens=this.parse(indentedValue,tags);return this.renderTokens(tokens,context,partials,indentedValue,config)}};Writer.prototype.unescapedValue=function unescapedValue(token,context){var value=context.lookup(token[1]);if(value!=null)return value};Writer.prototype.escapedValue=function escapedValue(token,context,config){var escape=this.getConfigEscape(config)||mustache.escape;var value=context.lookup(token[1]);if(value!=null)return typeof value==="number"&&escape===mustache.escape?String(value):escape(value)};Writer.prototype.rawValue=function rawValue(token){return token[1]};Writer.prototype.getConfigTags=function getConfigTags(config){if(isArray(config)){return config}else if(config&&typeof config==="object"){return config.tags}else{return undefined}};Writer.prototype.getConfigEscape=function getConfigEscape(config){if(config&&typeof config==="object"&&!isArray(config)){return config.escape}else{return undefined}};var mustache={name:"mustache.js",version:"4.1.0",tags:["{{","}}"],clearCache:undefined,escape:undefined,parse:undefined,render:undefined,Scanner:undefined,Context:undefined,Writer:undefined,set templateCache(cache){defaultWriter.templateCache=cache},get templateCache(){return defaultWriter.templateCache}};var defaultWriter=new Writer;mustache.clearCache=function clearCache(){return defaultWriter.clearCache()};mustache.parse=function parse(template,tags){return defaultWriter.parse(template,tags)};mustache.render=function render(template,view,partials,config){if(typeof template!=="string"){throw new TypeError('Invalid template! Template should be a "string" '+'but "'+typeStr(template)+'" was given as the first '+"argument for mustache#render(template, view, partials)")}return defaultWriter.render(template,view,partials,config)};mustache.escape=escapeHtml;mustache.Scanner=Scanner;mustache.Context=Context;mustache.Writer=Writer;return mustache});

//扩展String的方法：
//trim清除前后空格
String.prototype.trim=function(t){
  return t?this.replace(new RegExp("^\\"+t+"+|\\"+t+"+$","g"),""):this.replace(/^\s+|\s+$/g,"")
}
//replaceHtmlPara替换<!--{参数}-->
String.prototype.replaceHtmlPara=function(t,e){
  return null!=e&&(e=e.replace(new RegExp("[$]","g"),"$$$$")),this.replace(new RegExp("\x3c!--{"+t+"}--\x3e","g"),e)
}
//replaceAll 替换全部
String.prototype.replaceAll=function(t,e){
  return this.replace(new RegExp(t,"g"),e)
}

//小于2位，前面补个0
function pad(t){
    return t>=0&&t<=9?"0"+t:t
}

//排序（默认倒序）
function sort(arr, field, desc=true){
    return arr.sort((function(m,n){
        var a=m[field],
            b=n[field];
        return desc?(a>b?-1:(a<b?1:0)):(a<b?-1:(a>b?1:0))
    }))
}

//判断格式:字符串是否为json，或者参数是否为对象
function checkFormat(t){
    if("string"==typeof t){
        try{
            var e=JSON.parse(t);
            return !("object"!=typeof e||!e)
        }catch(t){
            return false
        }
    }
    return !("object"!=typeof t||!t)
}

/**------【猎杀时刻】-----**/


//获取主题指定页的模板源码, template_path:模板的相对路径
async function getThemeHtml(template_path){
  template_path=template_path.replace(".html","")
  let html = await (await fetch(OPT.themeURL+template_path+".html",{cf:{cacheTtl:600}})).text();
  
  //对后台编辑页下手
  if("admin/index|admin/editor".includes(template_path)){
      html = html.replace("$('#WidgetCategory').val(JSON.stringify(categoryJson))",OPT.editor_page_scripts+"$('#WidgetCategory').val(JSON.stringify(categoryJson))")
  }
  
  return html
}

/* 【KV的Key的含义】
  SYSTEM_VALUE_WidgetMenu       导航栏
  SYSTEM_VALUE_WidgetCategory   分类目录
  SYSTEM_VALUE_WidgetTags       标签
  SYSTEM_VALUE_WidgetLink       链接
  SYSTEM_INDEX_LIST             文章列表(不包含内容)
  SYSTEM_INDEX_NUM              文章数量
*/
//KV读取，toJson是否转为json，默认false
async function getKV(key, toJson=false){
  console.log("------------KV读取------------key,toJson:", key, toJson);
  let value=await CFBLOG.get(key);
  if(!toJson)
    return null==value?"[]":value;
  try{
    return null==value?[]:JSON.parse(value)
  }catch(e){
    return[]
  }
}

async function getArticlesList(){
  return await getKV("SYSTEM_INDEX_LIST", true);
}
async function getIndexNum(){
  return await getKV("SYSTEM_INDEX_NUM", true);
}
async function getWidgetMenu(){
  return await getKV("SYSTEM_VALUE_WidgetMenu", true);
}
async function getWidgetCategory(){
  return await getKV("SYSTEM_VALUE_WidgetCategory", true);
}
async function getWidgetLink(){
  return await getKV("SYSTEM_VALUE_WidgetLink", true);
}
async function getWidgetTags(){
  return await getKV("SYSTEM_VALUE_WidgetTags", true);
}
async function getArticle(id){
  return await getKV(id, true);
}

//写入kv，value如果未对象类型（数组或者json对象）需要序列化为字符串
async function saveKV(key,value){
    if(null!=value){
        if("object"==typeof value){
            value=JSON.stringify(value)
        }
        await CFBLOG.put(key,value)
        return true
    }
    return false;
}
async function saveArticlesList(value){
  return await saveKV("SYSTEM_INDEX_LIST",value);
}
async function saveIndexNum(value){
  return await saveKV("SYSTEM_INDEX_NUM", value);
}
async function saveWidgetMenu(){
  return await saveKV("SYSTEM_VALUE_WidgetMenu", value);
}
async function saveWidgetCategory(){
  return await saveKV("SYSTEM_VALUE_WidgetCategory", value);
}
async function saveWidgetLink(){
  return await saveKV("SYSTEM_VALUE_WidgetLink", value);
}
async function saveWidgetTags(){
  return await saveKV("SYSTEM_VALUE_WidgetTags", value);
}
async function saveArticle(id,value){
  return await saveKV(id, value);
}

//根据文章id，返回上篇、下篇文章
async function getSiblingArticle(id){
    id=("00000"+parseInt(id)).substr(-6);
    //读取文章列表，查找指定id的文章
    let articles_all=await getArticlesList(),
        article_idx=-1;
    for(var i=0,len=articles_all.length;i<len;i++)
    if(articles_all[i].id==id){
        article_idx=i;
        break
    }
    let value=await getArticle(id);
    return null==value||0===value.length?[void 0,void 0,void 0]:[articles_all[article_idx-1],value,articles_all[article_idx+1]]
}

//清除缓存
async function purge(cacheZoneId=ACCOUNT.cacheZoneId,cacheToken=ACCOUNT.cacheToken){
    if(null==cacheZoneId||null==cacheToken||cacheZoneId.length<5||cacheToken.length<5){
        return false;
    }
    let ret=await fetch(`https://api.cloudflare.com/client/v4/zones/${cacheZoneId}/purge_cache`,{
        method:"POST",
        headers:{
            "Authorization":"Bearer "+cacheToken,
            "Content-Type":"application/json"
        },
        body:'{"purge_everything":true}'
    });
    return (await ret.json()).success
}

//后台-翻页，返回[文章列表,是否无下一页]
async function admin_nextPage(pageNo,pageSize=OPT.pageSize){
    pageNo=pageNo<=1?1:pageNo;
    let articles_all=await getArticlesList(),
        articles=[];
    for(var i=(pageNo-1)*pageSize,s=Math.min(pageNo*pageSize,articles_all.length);i<s;i++){
        articles.push(articles_all[i]);
    }
    articles=sort(articles,"id");
    return articles
}

//解析请求数据
async function parseReq(request){
    const content_type=request.headers.get("content-type")||"";
    //json格式
    if(content_type.includes("application/json")){
    let json=JSON.stringify(await request.json()),
        content_type=JSON.parse(json),
        settings={category:[]};
        for(var i=0;i<content_type.length;i++){
            if("tags"==content_type[i].name){//标签，用逗号分隔
                settings[content_type[i].name]=content_type[i].value.split(",")
            }else if(content_type[i].name.includes("category")){
                settings.category.push(content_type[i].value)
            }else{
                settings[content_type[i].name]=content_type[i].value
            }
        }
        return settings
    }
    if(content_type.includes("application/text")){
        return await request.text();
    }
    if(content_type.includes("text/html")){
        return await request.text();
    }
    if(content_type.includes("form")){
        const formData=await request.formData(),
                ret={};
        for(const field of formData.entries())
            ret[field[0]]=field[1];
        return JSON.stringify(ret)
    }
    {
        const blob=await request.blob();
        return URL.createObjectURL(blob)
    }
}

//为文章分配ID
async function generateId(){
    //KV中读取文章数量（初始化为1），并格式化为6位，不足6位前面补零
    let article_id_seq=await getIndexNum();
    if(""===article_id_seq||null===article_id_seq||"[]"===article_id_seq||void 0===article_id_seq){
        await saveIndexNum(1)
        return "000001"
    }else{
        await saveIndexNum(parseInt(article_id_seq)+1)
        return ("00000"+(parseInt(article_id_seq)+1)).substr(-6)
    }
}
//---------------------

//访问管理后台或私密博客，则进行Base Auth
function parseBasicAuth(request){
    const auth=request.headers.get("Authorization");
    if(!auth||!/^Basic [A-Za-z0-9._~+/-]+=*$/i.test(auth)){
        return false;
    }
    const[user,pwd]=atob(auth.split(" ").pop()).split(":");
    console.log("-----parseBasicAuth----- ", user, pwd)
    return user===ACCOUNT.user && pwd===ACCOUNT.password
}

//请求sitemap.xml
async function getSiteMap(){
    console.log("进入函数 getSiteMap");
    //读取文章列表，并按照特定的xml格式进行组装
    let articles_all=await getArticlesList(),
        e='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    for(var i=0;i<articles_all.length;i++){
        e+="\n\t<url>",
        e+="\n\t\t<loc>https://"+OPT.siteDomain+"/article/"+articles_all[i].id+"/"+articles_all[i].link+".html</loc>",
        e+="\n\t\t<lastmod>"+articles_all[i].createDate.substr(0,10)+"</lastmod>",
        e+="\n\t\t<changefreq>"+(void 0===articles_all[i].changefreq?"daily":articles_all[i].changefreq)+"</changefreq>",
        e+="\n\t\t<priority>"+(void 0===articles_all[i].priority?"0.5":articles_all[i].priority)+"</priority>",
        e+="\n\t</url>";
    }
    return e+="\n</urlset>",e
}

//访问: favicon.ico
async function handle_favicon(request){
    /*
      想要自定义，或者用指定的ico，可将此请求置为404，并在codeBeforHead中自行添加类似代码：
      <link rel="icon" type="image/x-icon" href="https://cdn.jsdelivr.net/gh/gdtool/zhaopp/cfblog/favicon.ico" />
      <link rel="Shortcut Icon" href="https://cdn.jsdelivr.net/gh/gdtool/zhaopp/cfblog/favicon.ico">
    */
    //return new Response("404",{
    //    headers:{
    //        "content-type":"text/plain;charset=UTF-8"
    //    },
    //    status:404
    //});
    let url = new URL(request.url)
    url.host="dash.cloudflare.com"
    return await fetch(new Request(url, request));
}
//访问: robots.txt
async function handle_robots(request){
    return new Response(OPT.robots+"\nSitemap: https://"+OPT.siteDomain+"/sitemap.xml",{
        headers:{
            "content-type":"text/plain;charset=UTF-8"
        },
        status:200
    });
}
//访问: sitemap.xml
async function handle_sitemap(request){
    //读取文章列表，并按照特定的xml格式进行组装
    let articles_all=await getArticlesList()
    let xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd" xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    for(var i=0;i<articles_all.length;i++){
        xml+="\n\t<url>",
        xml+="\n\t\t<loc>https://"+OPT.siteDomain+"/article/"+articles_all[i].id+"/"+articles_all[i].link+".html</loc>",
        xml+="\n\t\t<lastmod>"+articles_all[i].createDate.substr(0,10)+"</lastmod>",
        xml+="\n\t\t<changefreq>"+(void 0===articles_all[i].changefreq?"daily":articles_all[i].changefreq)+"</changefreq>",
        xml+="\n\t\t<priority>"+(void 0===articles_all[i].priority?"0.5":articles_all[i].priority)+"</priority>",
        xml+="\n\t</url>";
    }
    xml+="\n</urlset>"
    return new Response(xml,{
        headers:{
            "content-type":"text/xml;charset=UTF-8"
        },
        status:200
    });
}
//渲染前端博客：指定一级路径page\tags\category，二级路径value，以及页码，默认第一页
async function renderBlog(url){
    console.log("---进入renderBlog函数---，path=", url.href.substr(url.origin.length))
    
    //处理主题预览及分页
    let theme=url.searchParams.get("theme"),
        pageSize=url.searchParams.get("pageSize");
    if(theme){
        OPT.themeURL=OPT.theme_github_path+theme+"/";
    }
    if(pageSize){
        OPT.pageSize=parseInt(pageSize);
    }
    //如果采用默认default主题，则改为加载default2.0主题
    if(OPT.theme_github_path+"default/"==OPT.themeURL){
        OPT.themeURL=OPT.theme_github_path+"default2.0/";
    }
    console.log("theme pageSize",OPT.pageSize,OPT.themeURL)
    
    //获取主页模板源码
    let theme_html=await getThemeHtml("index"),
        //KV中读取导航栏、分类目录、标签、链接、所有文章、近期文章等配置信息
        menus=await getWidgetMenu(),
        categories=await getWidgetCategory(),
        tags=await getWidgetTags(),
        links=await getWidgetLink(),
        articles_all=await getArticlesList(),
        articles_recently=articles_all.slice(0,OPT.recentlySize);
    
    for(var i=0;i<articles_recently.length;i++){
        //调整文章的日期(yyyy-MM-dd)和url
        articles_recently[i].createDate10=articles_recently[i].createDate.substr(0,10),
        articles_recently[i].url="/article/"+articles_recently[i].id+"/"+articles_recently[i].link+".html";
    }
    
    /** 前台博客
     *  路径格式：
     *  域名/              文章列表首页，等价于域名/page/1
     *  域名/page/xxx      文章列表翻页
     * 
     *  域名/category/xxx  分类页，等价于域名/category/xxx/page/1
     *  域名/category/xxx/page/xxx  分类页+翻页
     * 
     *  域名/tags/xxx      标签页，等价于域名/tags/xxx/page/1
     *  域名/tags/xxx/page/xxx  分类页+翻页
     * 
     */
    let paths = url.pathname.trim("/").split("/")
    let articles=[],
        pageNo=1
    //获取文章列表
    switch(paths[0]||"page"){
    case "page":
        articles = articles_all
        pageNo = paths[1]||1
        break;
    case "tags":
    case "category":
        let category_tag = paths.slice(1).join("");//如果无分页，tags、category后面都是标签、分类名
        if(paths.length>3 && paths.includes("page")){
            pageNo = paths[paths.indexOf("page")+1] //分页的页码
            category_tag = paths.slice(1, paths.lastIndexOf("page")-1).join("") //tags、category后，分页前的为标签、分类名
        }
        category_tag = decodeURIComponent(category_tag)
        articles = articles_all.filter(a => a[paths[0]].includes(category_tag))
        break;
    }
    pageNo = parseInt(pageNo)
    // console.log(pageNo)
    // console.log(articles)

    //获取当页要显示文章列表
    let articles_show = articles.slice((pageNo-1)*OPT.pageSize,pageNo*OPT.pageSize);
    // console.log(articles_show)
    for(i=0;i<articles_show.length;i++){
        //调整文章的日期(yyyy-MM-dd)、年、月、日、内容长度和url
        articles_show[i].createDate10=articles_show[i].createDate.substr(0,10),
        articles_show[i].createDateYear=articles_show[i].createDate.substr(0,4),
        articles_show[i].createDateMonth=articles_show[i].createDate.substr(5,7),
        articles_show[i].createDateDay=articles_show[i].createDate.substr(8,10),
        articles_show[i].contentLength=articles_show[i].contentText.length,
        articles_show[i].url="/article/"+articles_show[i].id+"/"+articles_show[i].link+".html";
    }
    // console.log(url.pathname)
    let url_prefix = url.pathname.replace(/(.*)\/page\/\d+/,'$1/')
    if(url_prefix.substr(-1)=='/'){
        url_prefix=url_prefix.substr(0,url_prefix.length-1);
    }
    // console.log(url_prefix)
    //组装各种参数
    let newer=[{title:"上一页",url:url_prefix+"/page/"+(pageNo-1)}];
    if(1==pageNo){
        newer=[];
    }
    let older=[{title:"下一页",url:url_prefix+"/page/"+(pageNo+1)}];
    if(pageNo*OPT.pageSize>=articles.length){
        older=[];
    }
    // console.log(newer)
    // console.log(older)

    //文章标题、关键字
    let title=(pageNo>1 ? "page "+pageNo+" - " : "")+OPT.siteName,
        keyWord=OPT.keyWords,
        cfg={};
    cfg.widgetMenuList=menus,//导航
    cfg.widgetCategoryList=categories,//分类目录
    cfg.widgetTagsList=tags,//标签
    cfg.widgetLinkList=links,//链接
    cfg.widgetRecentlyList=articles_recently,//近期文章
    cfg.articleList=articles_show,//当前页文章列表
    cfg.pageNewer=newer,//上翻页链接
    cfg.pageOlder=older,//下翻页链接
    cfg.title=title,//网页title
    cfg.keyWords=keyWord;//SEO关键字
    
    //使用mustache.js进行页面渲染（参数替换）
    cfg.OPT=OPT
    
    let html = Mustache.render(theme_html,cfg)
    
    return new Response(html,{
        headers:{
          "content-type":"text/html;charset=UTF-8"
        },
        status:200
    })
}
//文章内容页
async function handle_article(id){
    //获取内容页模板源码
    let theme_html=await getThemeHtml("article"),
        //KV中读取导航栏、分类目录、标签、链接、近期文章等配置信息
        menus=await getWidgetMenu(),
        categories=await getWidgetCategory(),
        tags=await getWidgetTags(),
        links=await getWidgetLink(),
        articles_recently=(await getArticlesList()).slice(0,OPT.recentlySize);
    
    for(var i=0;i<articles_recently.length;i++){
        //调整文章的日期(yyyy-MM-dd)和url
        articles_recently[i].createDate10=articles_recently[i].createDate.substr(0,10),
        articles_recently[i].url="/article/"+articles_recently[i].id+"/"+articles_recently[i].link+".html";
    }

    //获取上篇、本篇、下篇文章
    let articles_sibling=await getSiblingArticle(id);
    for(i=0;i<articles_sibling.length;i++){
        //调整文章的日期(yyyy-MM-dd)、文章长度和url
        if(articles_sibling[i]){
            //调整文章的日期(yyyy-MM-dd)、年、月、日、内容长度和url
            articles_sibling[i].createDate10=articles_sibling[i].createDate.substr(0,10),
            articles_sibling[i].createDateYear=articles_sibling[i].createDate.substr(0,4),
            articles_sibling[i].createDateMonth=articles_sibling[i].createDate.substr(5,7),
            articles_sibling[i].createDateDay=articles_sibling[i].createDate.substr(8,10),
            articles_sibling[i].contentLength=articles_sibling[i].contentText.length,
            articles_sibling[i].url="/article/"+articles_sibling[i].id+"/"+articles_sibling[i].link+".html";
        }
    }
    
    //获取本篇文章
    let article=articles_sibling[1];

    //组装文章详情页各参数
    let title=article.title+" - "+OPT.siteName, 
        keyWord=article.tags.concat(article.category).join(","),
        cfg={};
    cfg.widgetMenuList=menus,//导航
    cfg.widgetCategoryList=categories,//分类目录
    cfg.widgetTagsList=tags,//标签
    cfg.widgetLinkList=links,//链接
    cfg.widgetRecentlyList=articles_recently,//近期文章
    cfg.articleOlder=articles_sibling[0]?[articles_sibling[0]]:[],//上篇文章
    cfg.articleSingle=article,//本篇文章
    cfg.articleNewer=articles_sibling[2]?[articles_sibling[2]]:[],//下篇文章
    cfg.title=title,//网页title
    cfg.keyWords=keyWord;//SEO关键字
    
    //使用mustache.js渲染页面（参数替换）
    cfg.OPT=OPT
    
    let html = Mustache.render(theme_html,cfg)

      //非sitemap.xml，以html格式返回
    return new Response(html,{
        headers:{
          "content-type":"text/html;charset=UTF-8"
        },
        status:200
    })
}
//后台
async function handle_admin(request){
    let url = new URL(request.url),
        paths = url.pathname.trim("/").split("/"),
        html,//返回html
        json;//返回json
    //新建页
    if(1==paths.length||"list"==paths[1]){
        //读取主题的admin/index.html源码
        let theme_html=await getThemeHtml("admin/index"),
            //KV中读取导航栏、分类目录、链接、近期文章等配置信息
            categoryJson=await getWidgetCategory(),
            menuJson=await getWidgetMenu(),
            linkJson=await getWidgetLink();
        
        //手动替换<!--{xxx}-->格式的参数
        html = theme_html.replaceHtmlPara("categoryJson",JSON.stringify(categoryJson))
                        .replaceHtmlPara("menuJson",JSON.stringify(menuJson))
                        .replaceHtmlPara("linkJson",JSON.stringify(linkJson))
    }

    //发布
    if("publish"==paths[1]){
        //KV中获取文章列表
        let articles_all=await getArticlesList(),
            tags=[]; //操作标签
        
        //遍历所有文章，汇集所有的tag
        for(var i=0;i<articles_all.length;i++){
            //若文章设定了标签
            if("object"==typeof articles_all[i].tags){
                //将所有tags存入e中
                for(var j=0;j<articles_all[i].tags.length;j++){
                    if(articles_all[i].tags[j] 
                        && articles_all[i].tags[j].length>0 
                        && -1==tags.indexOf(articles_all[i].tags[j])){
                        tags.push(articles_all[i].tags[j]);
                    }
                }
            }
        }
        console.log(articles_all)
        //将所有标签一次性写入到KV中，并清除缓存
        await saveW("SYSTEM_VALUE_WidgetTags",JSON.stringify(tags))
        
        json = await purge()?'{"msg":"published ,purge Cache true","rst":true}':'{"msg":"published ,buuuuuuuuuuuut purge Cache false !!!!!!","rst":true}'
        
    }

    //文章列表
    if("getList"==paths[1]){
        //默认取第一页，每页20篇
        let pageNo=(undefined===paths[2]) ? 1 : parseInt(paths[2]),
            list=await admin_nextPage(pageNo, 20);//每次加载20个
        json = JSON.stringify(list)
    }
    
    //修改文章
    if("edit"==paths[1]){
        let id=paths[2],
            //获取主题admin/edit源码
            theme_html=await getThemeHtml("admin/edit"),
            //KV中读取分类
            categoryJson=JSON.stringify(await getWidgetCategory()),
            //KV中读取文章内容
            articleJson=JSON.stringify(await getArticle(id));
        
        //手动替换<!--{xxx}-->格式的参数
        html = theme_html.replaceHtmlPara("categoryJson",categoryJson).replaceHtmlPara("articleJson",articleJson.replaceAll("script>","script＞"))
    }
    
    //保存配置
    if("saveConfig"==paths[1]){
        const ret=await parseReq(request);
        let widgetCategory=ret.WidgetCategory,//分类
            widgetMenu=ret.WidgetMenu,//导航
            widgetLink=ret.WidgetLink;//链接
        
        
        //判断格式，写入分类、导航、链接到KV中
        if(checkFormat(widgetCategory) && checkFormat(widgetMenu) && checkFormat(widgetLink)){
            let success = await saveWidgetCategory(widgetCategory)
            success = success && await saveWidgetMenu(widgetMenu)
            success = success && await saveWidgetLink(widgetLink)
            json = success ? '{"msg":"saved","rst":true}' : '{"msg":"Save Faild!!!","ret":false}'
        }else{
            json = '{"msg":"Not a JSON object","rst":false}'
        }
    }
    
    //导入
    if("import"==paths[1]){
        let importJsone=(await parseReq(request)).importJson;
        console.log("开始导入",typeof importJson)
        
        if(checkFormat(importJson)){
            let importJson=JSON.parse(importJson),
                keys=Object.keys(importJson);
            for(let i=0;i<keys.length;++i){
                console.log(keys[i],importJson[keys[i]]),
                await saveArticle(keys[i],importJson[keys[i]]);
            }
            json = '{"msg":"import success!","rst":true}'
        }else{
            json = '{"msg":" importJson Not a JSON object","rst":false}'
        }        
    }
    
    //新建文章
    if("saveAddNew"==paths[1]){
        const ret=await parseReq(request);
        let title=ret.title,//文章标题
            img=ret.img,//插图
            link=ret.link,//永久链接
            createDate=ret.createDate,//发布日期
            category=ret.category,//分类
            tags=ret.tags,//标签
            priority=void 0===ret.priority?"0.5":ret.priority,//权重
            changefreq=void 0===ret.changefreq?"daily":ret.changefreq,//更新频率
            contentMD=ret["content-markdown-doc"],//文章内容-md格式
            contentHtml=ret["content-html-code"],//文章内容-html格式
            contentText="",//文章摘要
            id="";//文章id
        
        //校验参数完整性
        if(title.length>0
            && createDate.length>0
            && category.length>0
            && contentMD.length>0
            && contentHtml.length>0){

            id=await generateId(),
            contentText=contentHtml.replace(/<\/?[^>]*>/g,"").trim().substring(0,OPT.readMoreLength);//摘要
            //组装文章json
            let article={
                id:id,
                title:title,
                img:img,
                link:link,
                createDate:createDate,
                category:category,
                tags:tags,
                contentMD:contentMD,
                contentHtml:contentHtml,
                contentText:contentText,
                priority:priority,
                changefreq:changefreq
            };
            
            //将文章json写入KV（key为文章id，value为文章json字符串）
            await saveArticle(id,JSON.stringify(article));
            
            //组装文章json
            let articleWithoutHtml={
                    id:id,
                    title:title,
                    img:img,
                    link:link,
                    createDate:createDate,
                    category:category,
                    tags:tags,
                    contentText:contentText,
                    priority:priority,
                    changefreq:changefreq
                },
                articles_all_old=await getArticlesList(),//读取文章列表
                articles_all=[];
            
            //将最新的文章写入文章列表中，并按id排序后，再次回写到KV中
            articles_all.push(articleWithoutHtml),
            articles_all=articles_all.concat(articles_all_old),
            articles_all=sort(articles_all,"id"),
            await saveArticle("SYSTEM_INDEX_LIST",JSON.stringify(articles_all))
            
            json = '{"msg":"added OK","rst":true,"id":"'+id+'"}'
        }else{
            json = '{"msg":"信息不全","rst":false}'
        }
    }
    
    //删除
    if("delete"==paths[1]){
        let t=paths[2];
        if(6==t.length){
            await CFBLOG.delete(t);
            let e=await getArticlesList();
            for(r=0;r<e.length;r++){
                if(t==e[r].id){
                    e.splice(r,1);
                }
                await saveArticlesList(JSON.stringify(e))
                json = '{"msg":"Delete ('+t+')  OK","rst":true,"id":"'+t+'"}'
            }
        }else{
            json = '{"msg":"Delete  false ","rst":false,"id":"'+t+'"}'
        }
    }
    
    //保存编辑的文章
    if("saveEdit"==paths[1]){
        const ret=await parseReq(request);
        let title=ret.title,//文章标题
            img=ret.img,//插图
            link=ret.link,//永久链接
            createDate=ret.createDate,//发布日期
            category=ret.category,//分类
            tags=ret.tags,//标签
            priority=void 0===ret.priority?"0.5":ret.priority,//权重
            changefreq=void 0===ret.changefreq?"daily":ret.changefreq,//更新频率
            contentMD=ret["content-markdown-doc"],//文章内容-md格式
            contentHtml=ret["content-html-code"],//文章内容-html格式
            contentText="",//文章摘要
            id=ret.id;//文章id
            
        //校验参数完整性
        if(title.length>0
            && createDate.length>0
            && category.length>0
            && contentMD.length>0
            && contentHtml.length>0){
                
            contentText=contentHtml.replace(/<\/?[^>]*>/g,"").trim().substring(0,OPT.readMoreLength);//摘要
            //组装文章json
            let article={
                id:id,
                title:title,
                img:img,
                link:link,
                createDate:createDate,
                category:category,
                tags:tags,
                contentMD:contentMD,
                contentHtml:contentHtml,
                contentText:contentText,
                priority:priority,
                changefreq:changefreq
            };
            
            //将文章json写入KV（key为文章id，value为文章json字符串）
            await saveArticle(id,JSON.stringify(article));
            
            //组装文章json
            let articleWithoutHtml={
                    id:id,
                    title:title,
                    img:img,
                    link:link,
                    createDate:createDate,
                    category:category,
                    tags:tags,
                    contentText:contentText,
                    priority:priority,
                    changefreq:changefreq
                },
                articles_all=await getArticlesList();//读取文章列表
            console.log(articles_all)
            //将原对象删掉，将最新的文章加入文章列表中，并重新按id排序后，再次回写到KV中
            for(var i=articles_all.length-1;i>=0;i--){//按索引删除，要倒序，否则索引值会变
                if(articles_all[i].id == id){
                    articles_all.splice(i,1);
                }
            }
            articles_all.push(articleWithoutHtml),
            articles_all=sort(articles_all,"id"),
            await saveArticlesList(JSON.stringify(articles_all))
            json = '{"msg":"Edit OK","rst":true,"id":"'+id+'"}'
        }else{
            json = '{"msg":"信息不全","rst":false}'
        }
    }
    
    //返回结果
    if(!json &&!html){
        json = '{"msg":"some errors","rst":false}'
    }
    if(html){
        return new Response(html,{
            headers:{
                "content-type":"text/html;charset=UTF-8"
            },
            status:200
        })
    }
    if(json){
        return new Response(json ,{
            headers:{
                "content-type":"application/json;charset=UTF-8"
            },
            status:200
        })
    }
}
// 处理请求
async function handlerRequest(event){
    let request = event.request
    //获取url请求对象
    let url=new URL(request.url)
    let paths=url.pathname.trim("/").split("/")

    //校验权限
    if(("admin"==paths[0]||true===OPT.privateBlog) &&!parseBasicAuth(request)){
        return new Response("Unauthorized",{
            headers:{
                "WWW-Authenticate":'Basic realm="cfblog"',
                "Access-Control-Allow-Origin":"*"
            },
            status:401
        });
    }

    //组装请求url，查看是否有缓存
    const D=caches.default,
          M="https://"+OPT.siteDomain+url.pathname,
          x=new Request(M, request);
    console.log("cacheFullPath:",M);
    let k=await D.match(x);
    if(k){
      console.log("hit cache!")
      return k;
    }

    switch(paths[0]){
        case "favicon.ico": //图标
            k= await handle_favicon(request);
            break;
        case "robots.txt":
            k= await handle_robots(request);
            break;
        case "sitemap.xml":
            k= await handle_sitemap(request);
            break;
        case "admin": //后台
            k = await handle_admin(request);
            break;
        case "article": //文章内容页
            k = await handle_article(paths[1]);
            break;
        case "": //文章 首页
        case "page": //文章 分页
        case "category": //分类 分页
        case "tags": //标签 分页
            k = await renderBlog(url);
            break;            
        default:
            //其他页面返回404
            k= new Response(OPT.html404,{
                headers:{
                    "content-type":"text/html;charset=UTF-8"
                },
                status:200
            })
            break;
    }    
    //设置浏览器缓存时间:后台不缓存、只缓存前台
    try{
        if("admin"==paths[0]){
            k.headers.set("Cache-Control","no-store")
        }else{
            k.headers.set("Cache-Control","public, max-age="+OPT.cacheTime),
            event.waitUntil(D.put(M,k.clone()))
        }
    }catch(e){}
    
    return k
}

//监听请求
addEventListener("fetch",event=>{
  //处理请求
  event.respondWith(handlerRequest(event))
})