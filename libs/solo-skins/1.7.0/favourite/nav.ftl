<div class="top">
    <div id="navigation">
        <a rel="nofollow" href="${servePath}" class="home">${homeLabel}</a>
        <a href="${servePath}/tags.html" class="about">${allTagsLabel}</a>
        <#list pageNavigations as page>
        <a href="${page.pagePermalink}" target="${page.pageOpenTarget}" class="${page.pageTitle}">${page.pageTitle}</a>
        </#list>
        <a rel="alternate" href="${servePath}/blog-articles-rss.do" class="classifiche">RSS</a>
    </div>
    <div class="thinks"></div>
</div>