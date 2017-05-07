<#include "macro-head.ftl">
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
        <#include "header.ftl">
        
        <div class="container">
            <div class="row">
                <div class="col-sm-2"></div>
                <div class="col-sm-8 site article-list">
                    <#include "article-list.ftl">
                </div>
                <div class="col-sm-2"></div>
            </div>
        </div>
        
        <#include "footer.ftl">
    </body>
</html>
