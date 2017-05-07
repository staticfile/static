<div id="sideNavi" class="side-navi">
    <div class="rings"></div>
    <div class="null"></div>
    <#if "" != noticeBoard>
    <div class="item">
        <div class="antefatto">
            <h4>${noticeBoardLabel}</h4>
        </div>
        <div class="marginLeft12 marginTop12">
            ${noticeBoard}
        </div>
    </div>
    <div class="line"></div>
    </#if>
    <#if 0 != recentComments?size>
    <div class="item navi-comments">
        <div class="ads">
            <h4 id="recentComments">${recentCommentsLabel}</h4>
        </div>
        <ul>
            <#list recentComments as comment>
            <li>
                <img class='left' title='${comment.commentName}'
                     alt='${comment.commentName}'
                     src='${comment.commentThumbnailURL}'/>
                <div class='left'>
                    <div>
                        <a href="${comment.commentURL}">
                            ${comment.commentName}
                        </a>
                    </div>
                    <div class="comm">
                        <a rel="nofollow" class='side-comment' href="${servePath}${comment.commentSharpURL}">
                            ${comment.commentContent}
                        </a>
                    </div>
                </div>
                <div class='clear'></div>
            </li>
            </#list>
        </ul>
    </div>
    <div class="line"></div>
    </#if>
    <#if 0 != mostCommentArticles?size>
    <div class="item">
        <div class="esclamativo">
            <h4>${mostCommentArticlesLabel}</h4>
        </div>
        <ul id="mostCommentArticles">
            <#list mostCommentArticles as article>
            <li>
                <a rel="nofollow" title="${article.articleTitle}" href="${servePath}${article.articlePermalink}">
                    ${article.articleTitle}
                </a>(${article.articleCommentCount})
            </li>
            </#list>
        </ul>
    </div>
    <div class="line"></div>
    </#if>
    <#if 0 != mostViewCountArticles?size>
    <div class="item">
        <div class="cuore">
            <h4>${mostViewCountArticlesLabel}</h4>
        </div>
        <ul id="mostViewCountArticles">
            <#list mostViewCountArticles as article>
            <li>
                <a rel="nofollow" title="${article.articleTitle}" href="${servePath}${article.articlePermalink}">
                    ${article.articleTitle}
                </a>(${article.articleViewCount})
            </li>
            </#list>
        </ul>
    </div>
    <div class="line"></div>
    </#if>
    <#if 0 != mostUsedTags?size>
    <div class="item">
        <div class="categorie">
            <h4>${popTagsLabel}</h4>
        </div>
        <ul class="navi-tags">
            <#list mostUsedTags as tag>
            <li>
                <a rel="alternate" href="${servePath}/tag-articles-feed.do?oId=${tag.oId}" class="no-underline">
                    <img alt="${tag.tagTitle}" src="${staticServePath}/images/feed.png"/>
                </a>
                <a rel="tag" title="${tag.tagTitle}" href="${servePath}/tags/${tag.tagTitle?url('UTF-8')}">
                    ${tag.tagTitle}(${tag.tagPublishedRefCount})
                </a>
            </li>
            </#list>
        </ul>
    </div>
    <div class="line"></div>
    </#if>
    <#if 0 != links?size>
    <div class="item">
        <div class="blog">
            <h4>${linkLabel}</h4>
        </div>
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
    </div>
    <div class="line"></div>
    </#if>     
    <#if 0 != archiveDates?size>
    <div class="item">
        <div class="archivio">
            <h4>${archiveLabel}</h4>
        </div>
        <ul id="save">
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
    </div>
    <div class="line"></div>
    </#if>
    <#if 1 != users?size>
    <div class="item">
        <div class="side-author">
            <h4>${authorLabel}</h4>
        </div>
        <ul id="sideAuthor">
            <#list users as user>
            <li>
                <a href="${servePath}/authors/${user.oId}" title="${user.userName}">
                    ${user.userName}
                </a>
            </li>
            </#list>
        </ul>
    </div>
    </#if>
    <div class="rings" style="bottom: 0px;"></div>
</div>