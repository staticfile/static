<div class="header">
    <div class="wrapper">
        <div class="left">
            <h1>
                <a class="title" href="${servePath}">
                    ${blogTitle}
                </a>
            </h1>
            <span class="sub-title">${blogSubtitle}</span>
        </div>
        <form class="right" target="_blank" action="http://zhannei.baidu.com/cse/site">
            <input id="search" type="text" name="q" />
            <input type="submit" value="" class="none" />
            <input type="hidden" name="cc" value="${serverHost}">
        </form>
        <div class="clear"></div>
    </div>
</div>
<div class="nav">
    <div class="wrapper">
        <ul>
            <li>
                <a rel="nofollow" href="${servePath}/">${indexLabel}</a>
            </li>
            <#list pageNavigations as page>
            <li>
                <a href="${page.pagePermalink}" target="${page.pageOpenTarget}">${page.pageTitle}</a>
            </li>
            </#list>  
            <li>
                <a href="${servePath}/tags.html">${allTagsLabel}</a>  
            </li>
            <li>
                <a rel="alternate" href="${servePath}/blog-articles-rss.do">RSS<img src="${staticServePath}/images/feed.png" alt="RSS"/></a>
            </li>
        </ul>
        <div class="right">
            <span class="translate-ico" onclick="goTranslate()"></span>
            <div class="right">
                ${viewCount1Label}
                <span class="tip">
                    ${statistic.statisticBlogViewCount}
                </span>
                &nbsp;&nbsp;
                ${articleCount1Label}
                <span class="tip">
                    ${statistic.statisticPublishedBlogArticleCount}
                </span>
                &nbsp;&nbsp;
                ${commentCount1Label}
                <span class="tip">
                    ${statistic.statisticPublishedBlogCommentCount}
                </span>
            </div>
        </div>
        <div class="clear"></div>
    </div>
</div>
