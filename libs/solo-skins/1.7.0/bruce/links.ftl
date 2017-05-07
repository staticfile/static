<#include "macro-head.ftl">
<!DOCTYPE html>
<html>
    <head>
        <@head title="${blogTitle}">
        <meta name="keywords" content="${metaKeywords},${linkLabel}"/>
        <meta name="description" content="${metaDescription},${linkLabel}"/>
        </@head>
    </head>
    <body>
        <#include "header.ftl">


        <div class="container">
            <div class="row">
                <div class="col-sm-2"></div>

                <div class="col-sm-8 site">
                    <#if 0 != links?size>
                    <div class="row">
                        <#list links as link>
                        <#if 0 == link_index % 3></div><div class="row"></#if>  
                        <div class="col-sm-4">
                            <a rel="friend" href="${link.linkAddress}" alt="${link.linkTitle}" target="_blank">
                                <img alt="${link.linkTitle}"
                                     src="${faviconAPI}<#list link.linkAddress?split('/') as x><#if x_index=2>${x}<#break></#if></#list>" width="16" height="16" /></a>
                            <a rel="friend" href="${link.linkAddress}" title="${link.linkDescription}" target="_blank">${link.linkTitle}</a>
                        </div>
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
