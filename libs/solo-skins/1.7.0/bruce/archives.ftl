<#include "macro-head.ftl">
<!DOCTYPE html>
<html>
    <head>
        <@head title="${blogTitle}">
        <meta name="keywords" content="${metaKeywords},${archiveLabel}"/>
        <meta name="description" content="${metaDescription},${archiveLabel}"/>
        </@head>
    </head>
    <body>
        <#include "header.ftl">

        <div class="container">
            <div class="row">
                <div class="col-sm-2"></div>

                <div class="col-sm-8 site">
                    <div class="row">
                        <#if 0 != archiveDates?size>
                        <#assign curYear = year?number>
                        <h2>${year} ${yearLabel}</h2>
                        <#list archiveDates as archiveDate>
                        <#if curYear != archiveDate.archiveDateYear?number></div>
                    
                    <div class="row"><hr/><h2>${archiveDate.archiveDateYear} ${yearLabel}</h2></#if>
                        <span>
                            <a href="${servePath}/archives/${archiveDate.archiveDateYear}/${archiveDate.archiveDateMonth}"
                               title="${archiveDate.archiveDateYear} ${yearLabel} ${archiveDate.archiveDateMonth} ${monthLabel}(${archiveDate.archiveDatePublishedArticleCount})">
                                ${archiveDate.archiveDateMonth} ${monthLabel}(${archiveDate.archiveDatePublishedArticleCount})</a>
                            <span class="gray">•<span>
                        </span>

                        <#assign curYear = archiveDate.archiveDateYear?number>
                        </#list>
                    </div>
                    </#if>
                </div>
                <div class="col-sm-2"></div>
            </div>
        </div>

        <#include "footer.ftl">
    </body>
</html>
