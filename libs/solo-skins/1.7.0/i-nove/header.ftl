<div class="header">
    <h1 class="title">
        <a href="${servePath}" id="logoTitle" >
            ${blogTitle}
        </a>
    </h1>
    <span class="sub-title">${blogSubtitle}</span>
</div>
<div id="header-navi">
    <div class="left">
        <ul>
            <li>
                <a rel="nofollow" class="home" href="${servePath}"></a>
            </li>
            <#list pageNavigations as page>
            <li>
                <a href="${page.pagePermalink}" target="${page.pageOpenTarget}">
                    ${page.pageTitle}
                </a>
            </li>
            </#list>
            <li>
                <a href="${servePath}/tags.html">${allTagsLabel}</a>
            </li>
            <li>
                <a rel="alternate" href="${servePath}/blog-articles-rss.do">
                    RSS
                    <img src="${staticServePath}/images/feed.png" alt="RSS"/>
                </a>
            </li>
            <li>
                <a class="lastNavi" href="javascript:void(0);"></a>
            </li>
        </ul>
    </div>
    <div class="right" id="statistic">
        <span>
            ${viewCount1Label}
            <span class='error-msg'>
                ${statistic.statisticBlogViewCount}
            </span>
            &nbsp;&nbsp;
        </span>
        <span>
            ${articleCount1Label}
            <span class='error-msg'>
                ${statistic.statisticPublishedBlogArticleCount}
            </span>
            &nbsp;&nbsp;
        </span>
        <span>
            ${commentCount1Label}
            <span class='error-msg'>
                ${statistic.statisticPublishedBlogCommentCount}
            </span>
        </span>
    </div>
    <div class="clear"></div>
</div>