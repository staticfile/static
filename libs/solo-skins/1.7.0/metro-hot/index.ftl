<#include "macro-head.ftl">
<#include "macro-side.ftl">
<!DOCTYPE html>
<html>
    <head>
        <@head title="${blogTitle}">
        <#if metaKeywords??>
        <meta name="keywords" content="${metaKeywords}"/>
        </#if>
        <#if metaDescription??>
        <meta name="description" content="${metaDescription}"/>
        </#if>
        </@head>
    </head>
    <body>
        ${topBarReplacement}
        <div class="wrapper">
            <div id="header">
                <#include "header.ftl" />
                <div class="sub-nav fn-clear">
                    <h2>${blogSubtitle}</h2>
                    <#if 0 != paginationPageCount>
                    <div class="pagination">
                        <#if 1 != paginationPageNums?first>
                        <a id="previousPage" href="${servePath}${path}/${paginationPreviousPageNum}"
                           title="${previousPageLabel}"><</a>
                        </#if>
                        <#list paginationPageNums as paginationPageNum>
                        <#if paginationPageNum == paginationCurrentPageNum>
                        <span>${paginationPageNum}</span>
                        <#else>
                        <a href="${servePath}${path}/${paginationPageNum}">${paginationPageNum}</a>
                        </#if>
                        </#list>
                        <#if paginationPageNums?last != paginationPageCount>
                        <a id="nextPage" href="${servePath}${path}/${paginationNextPageNum}" title="${nextPagePabel}">></a>
                        </#if>
                    </div>
                    </#if>
                </div>
            </div>
            <div class="fn-clear">
                <div class="main">
                    <#include "article-list.ftl"/>
                    <#include "copyright.ftl"/>
                </div>
                <@side isArticle=false />
            </div>
        </div>
        <span id="goTop" onclick="Util.goTop()" data-ico="&#xe042;" class="side-tile"></span>
        <#include "footer.ftl"/>
    </body>
</html>
