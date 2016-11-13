<aside>
    <!--
        <h4>Search</h4>
        <form action="http://www.google.com/cse" id="cse-search-box" class="s" target="_blank">
          <div>
            <input type="hidden" name="cx" value="014052262704486520429:eeg5ule8tro" />
            <input type="hidden" name="ie" value="UTF-8" />
                <input type="hidden" name="oe" value="UTF-8">
                <input type="hidden" name="hl" value="zh-CN">
            <input type="text" name="q" size="15" value="&#x7AD9;&#x5185;&#x641C;&#x7D22;" onclick="this.value=''"/>
            <input type="hidden" name="sa" value="site-search"/>
          </div>
        </form>-->
    <nav>
        <h4>Navigation</h4>
        <ul>
            <li>
                <a rel="nofollow" class="home" href="${servePath}">${indexLabel}</a>
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
    </nav>
    <#if "" != noticeBoard>
    <h4>${noticeBoardLabel}</h4>
    <div id="c">
        <p>
            ${noticeBoard}
        </p>
    </div>
    </#if>
    <#if 0 != recentComments?size>
    <h4>${recentCommentsLabel}</h4>
    <ul class="aside-comments">
        <#list recentComments as comment>
        <li>
            <img class="left" title='${comment.commentName}'
                 alt='${comment.commentName}'
                 src='${comment.commentThumbnailURL}' width="32" height="32"/>
            <div class="left">
                <div>
                    <a target="_blank" href="${comment.commentURL}">
                        ${comment.commentName}
                    </a>
                </div>
                <div>
                    <a rel="nofollow" class='side-comment' href="${servePath}${comment.commentSharpURL}">
                        ${comment.commentContent}
                    </a>
                </div>
            </div>
            <div class='clear'></div>
        </li>
        </#list>
    </ul>
    </#if>
    <#if 0 != mostCommentArticles?size>
    <h4>${mostCommentArticlesLabel}</h4>
    <ul id="mostCommentArticles">
        <#list mostCommentArticles as article>
        <li>
            <a rel="nofollow" title="${article.articleTitle}"
               href="${servePath}${article.articlePermalink}">
                <sup>[${article.articleCommentCount}]</sup>
                ${article.articleTitle}
            </a>
        </li>
        </#list>
    </ul>
    </#if>
    <#if 0 != mostViewCountArticles?size>
    <h4>${mostViewCountArticlesLabel}</h4>
    <ul id="mostViewCountArticles">
        <#list mostViewCountArticles as article>
        <li>
            <a rel="nofollow" title="${article.articleTitle}"
               href="${servePath}${article.articlePermalink}">
                <sup>[${article.articleViewCount}]</sup>
                ${article.articleTitle}
            </a>
        </li>
        </#list>
    </ul>
    </#if>
    <#if 0 != mostUsedTags?size>
    <h4>${popTagsLabel}</h4>
    <ul class="navi-tags">
        <#list mostUsedTags as tag>
        <li>
            <a rel="alternate" href="${servePath}/tag-articles-feed.do?oId=${tag.oId}">
                <img alt="${tag.tagTitle}" src="${staticServePath}/images/feed.png"/>
            </a>
            <a rel="tag" title="${tag.tagTitle}(${tag.tagPublishedRefCount})" href="${servePath}/tags/${tag.tagTitle?url('UTF-8')}">
                ${tag.tagTitle}</a>(${tag.tagPublishedRefCount})
        </li>
        </#list>
    </ul>
    </#if>
    <#if 0 != links?size>
    <h4>${linkLabel}</h4>
    <ul id="sideLink" class="navi-tags">
        <#list links as link>
        <li>
            <a rel="friend" href="${link.linkAddress}" title="${link.linkTitle}" target="_blank">
                <img alt="${link.linkTitle}" 
                     src="${faviconAPI}<#list link.linkAddress?split('/') as x><#if x_index=2>${x}<#break></#if></#list>" width="16" height="16" /></a>
            <a rel="friend" href="${link.linkAddress}" title="${link.linkTitle}" target="_blank">
                ${link.linkTitle}
            </a>
        </li>
        </#list>
    </ul>
    </#if>
    <#if 0 != archiveDates?size>
    <h4>${archiveLabel}</h4>
    <ul>
        <#list archiveDates as archiveDate>
        <li>
            <#if "en" == localeString?substring(0, 2)>
            <a href="${servePath}/archives/${archiveDate.archiveDateYear}/${archiveDate.archiveDateMonth}"
               title="${archiveDate.monthName} ${archiveDate.archiveDateYear}(${archiveDate.archiveDatePublishedArticleCount})">
                ${archiveDate.monthName} ${archiveDate.archiveDateYear}</a>(${archiveDate.archiveDatePublishedArticleCount})
            <#else>
            <a href="${servePath}/archives/${archiveDate.archiveDateYear}/${archiveDate.archiveDateMonth}"
               title="${archiveDate.archiveDateYear} ${yearLabel} ${archiveDate.archiveDateMonth} ${monthLabel}(${archiveDate.archiveDatePublishedArticleCount})">
                ${archiveDate.archiveDateYear} ${yearLabel} ${archiveDate.archiveDateMonth} ${monthLabel}</a>(${archiveDate.archiveDatePublishedArticleCount})
            </#if>
        </li>
        </#list>
    </ul>
    </#if>
</aside>