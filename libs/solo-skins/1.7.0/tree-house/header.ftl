<div class="header-navi right">
    <ul>
        <#list pageNavigations as page>
        <li>
            <a href="${page.pagePermalink}" target="${page.pageOpenTarget}">
                ${page.pageTitle}
            </a>&nbsp;&nbsp;
        </li>
        </#list>
        <li>
            <a href="${servePath}/tags.html">${allTagsLabel}</a>&nbsp;&nbsp;
        </li>
        <li>
            <a rel="alternate" href="${servePath}/blog-articles-rss.do">RSS</a><a href="${servePath}/blog-articles-rss.do"><img src="${staticServePath}/images/feed.png" alt="RSS"/></a>
        </li>
    </ul>
</div>
<div class="header-title">
    <h1>
        <a href="${servePath}" id="logoTitle" >
            ${blogTitle}
        </a>
    </h1>
    <div>${blogSubtitle}</div>
    <embed width="228" height="239" type="application/x-shockwave-flash"
           menu="false" name="http://blog.thepixel.com/wp-content/themes/PixelBlog2/flash/fan"
           wmode="transparent" loop="true" pluginspage="http://www.adobe.com/go/getflashplayer"
           quality="high" src="${staticServePath}/skins/${skinDirName}/images/fan.swf"
           style="position: absolute;top:112px;left:265px;">
</div>